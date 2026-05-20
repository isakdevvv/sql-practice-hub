import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Key,
  Lock,
  Unlock,
  Fingerprint,
  ShieldCheck,
  BookOpen,
  Server,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

/**
 * F-11 Hva ER kryptering — overflate, ingen matte.
 * Fire ideer: symmetrisk, asymmetrisk, hash, signatur. Hver med metafor, visualisering
 * og kort interaktivitet. INGEN algoritmer forklart i detalj. SEC-01..06 tar matten senere.
 */
export function F11KryptoIntuisjon() {
  return (
    <StackPageShell title="Forkurs · F-11" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <IngenMatteBanner />
        <WhyBox />
        <SectionTitle id="symmetrisk" nr="1" tittel="Symmetrisk — én nøkkel både låser og åpner" />
        <Symmetrisk />
        <SectionTitle id="asymmetrisk" nr="2" tittel="Asymmetrisk — to nøkler som hører sammen" />
        <Asymmetrisk />
        <SectionTitle id="hash" nr="3" tittel="Hash — enveis fingeravtrykk av data" />
        <HashDemo />
        <SectionTitle id="signatur" nr="4" tittel="Signatur — hash + asymmetrisk = bevis på avsender" />
        <Signatur />
        <SectionTitle id="oppsummering" nr="5" tittel="Oppsummering — fire ideer på ett bord" />
        <Oppsummering />
        <SectionTitle id="quiz" nr="6" tittel="Sjekk forståelsen" />
        <Quizer />
        <SectionTitle id="neste" nr="7" tittel="Neste steg" />
        <NesteSteg />
      </article>
    </StackPageShell>
  );
}

function Crumbs() {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <Link to="/forkurs" className="hover:text-foreground">Forkurs</Link>
      <span>/</span>
      <span>F4 · Tall og krypto-intuisjon</span>
      <span>/</span>
      <span className="text-foreground">F-11 Krypto-intuisjon</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F4 · Tall og krypto-intuisjon
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Hva ER kryptering — overflate
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Folk snakker om kryptering, hashing, signaturer og nøkler som om det er én ting. Det er det ikke — det er fire ulike ideer som ofte spiller sammen. Her bygger vi opp <em>kun ideen</em> bak hver av dem, med metaforer og bilder. Algoritmene, formlene og angrepsmodellene kommer senere.
      </p>
    </header>
  );
}

function IngenMatteBanner() {
  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
      <div className="text-sm">
        <div className="font-semibold text-amber-200 mb-1">Ingen matte her.</div>
        <p className="text-muted-foreground leading-relaxed text-xs">
          Det er bevisst. Når du har <em>intuisjonen</em> trygt på plass, er det mye lettere å lære RSA, AES og diffie-hellman senere. Vi nevner navnene noen ganger, men forklarer dem ikke før i SEC-01..06.
        </p>
      </div>
    </div>
  );
}

function WhyBox() {
  return (
    <div className="mb-10 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
        <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Alt av sikkerhet på nettet — HTTPS, VPN, SSH, signerte e-poster, sertifikater, passord-lagring — bygger på de fire ideene under. Hvis du ikke har dem klart i hodet før SEC-modulen, drukner du i akronymer. Med intuisjonen først har du knagger å henge alt på.
      </p>
    </div>
  );
}

function SectionTitle({ id, nr, tittel }: { id: string; nr: string; tittel: string }) {
  return (
    <h2 id={id} className="mt-12 mb-4 text-xl font-semibold scroll-mt-20 flex items-baseline gap-3">
      <span className="text-brand text-base font-mono">{nr}.</span>
      {tittel}
    </h2>
  );
}

function Symmetrisk() {
  const [steg, setSteg] = useState<"klar" | "laast" | "apnet">("klar");
  const [melding, setMelding] = useState("Møt meg kl 18");

  const laast = melding
    .split("")
    .map((c) => String.fromCharCode((c.charCodeAt(0) + 7) % 256))
    .join("")
    .replace(/[^\x20-\x7E]/g, "▓");

  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        <strong>Metafor:</strong> tenk på en vanlig hengelås med én eneste nøkkel. Samme nøkkel både låser og låser opp. Hvis Alice vil sende et hemmelig brev til Bob, må Bob ha den samme nøkkelen. Da kan han åpne kista når den kommer.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="grid grid-cols-3 gap-4 items-center mb-4">
          <Person navn="Alice" rolle="Avsender" ikon="A" />
          <div className="flex justify-center">
            <Key className="h-8 w-8 text-amber-300" />
            <div className="text-[10px] text-muted-foreground mt-10 absolute">delt nøkkel</div>
          </div>
          <Person navn="Bob" rolle="Mottaker" ikon="B" />
        </div>
        <div className="rounded-md border border-border bg-background p-3 mb-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Klartekst (det Alice skriver)
          </div>
          <input
            value={melding}
            onChange={(e) => {
              setMelding(e.target.value);
              setSteg("klar");
            }}
            className="w-full bg-transparent font-mono text-sm focus:outline-none"
          />
        </div>
        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => setSteg("laast")}
            className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/20 inline-flex items-center gap-1"
          >
            <Lock className="h-3 w-3" /> Lås med nøkkel
          </button>
          <button
            onClick={() => setSteg("apnet")}
            disabled={steg !== "laast"}
            className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs text-green-200 hover:bg-green-500/20 disabled:opacity-40 inline-flex items-center gap-1"
          >
            <Unlock className="h-3 w-3" /> Bob låser opp
          </button>
          <button
            onClick={() => setSteg("klar")}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted/40"
          >
            Tilbake
          </button>
        </div>
        <div
          className={`rounded-md border p-3 font-mono text-xs ${
            steg === "klar"
              ? "border-border bg-background"
              : steg === "laast"
                ? "border-red-500/40 bg-red-500/10 text-red-200"
                : "border-green-500/40 bg-green-500/10 text-green-200"
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
            {steg === "klar"
              ? "Klartekst"
              : steg === "laast"
                ? "Kryptert (det en avlytter ser)"
                : "Dekryptert"}
          </div>
          {steg === "laast" ? laast : melding}
        </div>
        <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          <strong className="text-brand">Hva problemet er:</strong> Alice og Bob må først bli enige om <em>nøkkelen</em>. Hvis de møtes ansikt til ansikt, greit — gi nøkkelen i hånden. Men hvis de bare prater over internett, hvordan sender Alice nøkkelen til Bob uten at en avlytter også får den? Det er nettopp dette problemet <strong>asymmetrisk kryptering</strong> løser.
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          Eksempler du vil høre nevnt senere: <em>AES</em>, <em>ChaCha20</em>. Begge bruker én delt nøkkel.
        </div>
      </div>
    </div>
  );
}

function Person({ navn, rolle, ikon }: { navn: string; rolle: string; ikon: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-3 text-center">
      <div className="mx-auto h-10 w-10 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center font-bold text-brand">
        {ikon}
      </div>
      <div className="mt-2 font-semibold text-sm">{navn}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{rolle}</div>
    </div>
  );
}

function Asymmetrisk() {
  const [steg, setSteg] = useState<"start" | "kopiert" | "laast" | "apnet">("start");

  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        <strong>Metafor:</strong> tenk på en hengelås (uten nøkkelen). Du kan kopiere hengelåsen, dele den ut overalt, henge den på oppslagstavla — alle kan <em>låse</em> noe med den. Men ingen kan åpne den, bortsett fra deg, fordi du har den eneste nøkkelen.
      </p>
      <p>
        Hver person har <strong>to nøkler</strong> som hører sammen som et par:
      </p>
      <ul className="ml-6 list-disc space-y-1 text-sm">
        <li>
          <strong>Offentlig nøkkel</strong> — hengelåsen. Spre den fritt. Andre bruker den til å låse meldinger TIL deg.
        </li>
        <li>
          <strong>Privat nøkkel</strong> — låsens nøkkel. Hold den hemmelig. Bare med denne kan du åpne meldinger som er låst med din offentlige.
        </li>
      </ul>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="grid grid-cols-3 gap-3 items-center mb-4">
          <Person navn="Bob" rolle="Avsender" ikon="B" />
          <ArrowRight className="h-6 w-6 mx-auto text-muted-foreground/50" />
          <Person navn="Alice" rolle="Mottaker" ikon="A" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <Lock className="h-3 w-3" /> Alice sin offentlige nøkkel
            </div>
            <div className="text-[11px] text-muted-foreground">
              Henger på Alice sin nettside, GitHub-profil, e-postsignatur. Hvem som helst kan ta en kopi.
            </div>
          </div>
          <div className="rounded-md border border-red-500/40 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 text-red-300 text-xs font-semibold mb-1">
              <Key className="h-3 w-3" /> Alice sin private nøkkel
            </div>
            <div className="text-[11px] text-muted-foreground">
              Ligger LÅST på Alice sin egen maskin. Aldri sendt. Aldri delt. Mister hun den, mister hun tilgang.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <Knapp
            aktiv={steg === "start"}
            onClick={() => setSteg("kopiert")}
            label="1. Bob henter Alice sin hengelås"
            farge="emerald"
          />
          <Knapp
            aktiv={steg === "kopiert"}
            onClick={() => setSteg("laast")}
            label="2. Bob låser brev med den"
            farge="amber"
          />
          <Knapp
            aktiv={steg === "laast"}
            onClick={() => setSteg("apnet")}
            label="3. Alice åpner med sin private"
            farge="green"
          />
          <button
            onClick={() => setSteg("start")}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted/40"
          >
            Tilbake
          </button>
        </div>
        <Stegtekst steg={steg} />
        <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          <strong className="text-brand">Klikket:</strong> ingen utveksling av hemmeligheter trengs på forhånd. Bob trenger ikke møte Alice. Han trenger bare hengelåsen hennes, og den kan han lese fra hvilket som helst offentlig sted.
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          Eksempler nevnt senere: <em>RSA</em>, <em>elliptiske kurver</em>. SSH-nøkler er asymmetriske.
        </div>
      </div>
    </div>
  );
}

function Knapp({
  aktiv,
  onClick,
  label,
  farge,
}: {
  aktiv: boolean;
  onClick: () => void;
  label: string;
  farge: "emerald" | "amber" | "green";
}) {
  const fargeKlass =
    farge === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
      : farge === "amber"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20"
        : "border-green-500/40 bg-green-500/10 text-green-200 hover:bg-green-500/20";
  return (
    <button
      onClick={onClick}
      disabled={!aktiv}
      className={`rounded-md border px-3 py-1.5 text-xs ${fargeKlass} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

function Stegtekst({ steg }: { steg: "start" | "kopiert" | "laast" | "apnet" }) {
  const tekst =
    steg === "start"
      ? "Klikk steg 1 for å begynne."
      : steg === "kopiert"
        ? "Bob har kopiert Alice sin offentlige nøkkel. Han har den nå på sin egen maskin."
        : steg === "laast"
          ? "Bob har låst meldingen med Alice sin hengelås. Selv Bob kan ikke åpne den igjen nå — det krever Alice sin private."
          : "Alice mottok den låste meldingen og brukte sin private nøkkel for å åpne den. Bare hun kunne gjort det.";
  return (
    <div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
      <Mail className="h-3 w-3 inline mr-2 text-brand" />
      {tekst}
    </div>
  );
}

function HashDemo() {
  const [input, setInput] = useState("hei");

  // Mock-hash kun for visualisering — IKKE en ekte kryptografisk hash.
  // Vi bruker en simpel FNV-aktig blanding for å gi tilfeldig-utseende hex.
  function mockHash(s: string): string {
    let h1 = 0x811c9dc5;
    let h2 = 0xc3a5c85c;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = ((h1 ^ c) * 16777619) >>> 0;
      h2 = ((h2 + c * 31 + i * 7) * 2246822519) >>> 0;
    }
    const a = h1.toString(16).padStart(8, "0");
    const b = h2.toString(16).padStart(8, "0");
    const c = ((h1 ^ h2) >>> 0).toString(16).padStart(8, "0");
    const d = (((h1 + h2) * 17) >>> 0).toString(16).padStart(8, "0");
    return `${a}${b}${c}${d}`;
  }

  const h = mockHash(input);

  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        <strong>Metafor:</strong> en blender. Du hiver inn epler, gulrøtter eller en hel bok — ut kommer en jevn slurry. Du kan ikke se på slurryen og rekonstruere bokens innhold. Det er <em>enveis</em>.
      </p>
      <p>
        En <strong>hash-funksjon</strong> tar inn data (tekst, fil, hva som helst — fra 1 bokstav til 1 GB) og gir alltid ut en streng av fast lengde. Vanlig størrelse er 256 bits = 64 hex-siffer. Endrer du <em>én</em> bokstav i inputten, blir hashen totalt forskjellig — dette kalles <em>avalanche</em>.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Skriv noe — endre én bokstav og se hashen hoppe
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand/50"
          />
        </div>
        <div className="rounded-md border border-purple-500/40 bg-purple-500/5 p-3">
          <div className="text-xs uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1">
            <Fingerprint className="h-3 w-3" /> Hash (mock — bare for visualisering)
          </div>
          <div className="font-mono text-[11px] break-all text-purple-200">{h}</div>
        </div>
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
          <Demo s="hello" />
          <Demo s="hallo" />
          <Demo s="Hello" />
          <Demo s="hello." />
        </div>
        <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground space-y-2">
          <div>
            <strong className="text-brand">Tre regler for ekte hash:</strong>
          </div>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Enveis</strong> — du kan ikke gå fra hash tilbake til input.</li>
            <li><strong>Deterministisk</strong> — samme input gir alltid samme hash.</li>
            <li><strong>Krasj-resistent</strong> — det er praktisk umulig å finne to ulike inputs med samme hash.</li>
          </ul>
          <div>
            Brukes til: lagring av passord (du lagrer hashen, ikke passordet), sjekksum på filer (har den blitt endret?), git-commit-id, og som byggekloss i signaturer (neste seksjon).
          </div>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          Eksempler nevnt senere: <em>SHA-256</em>, <em>SHA-3</em>, <em>bcrypt</em> (passord-spesifikk).
        </div>
      </div>
    </div>
  );
}

function Demo({ s }: { s: string }) {
  function mockHash(s: string): string {
    let h1 = 0x811c9dc5;
    let h2 = 0xc3a5c85c;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = ((h1 ^ c) * 16777619) >>> 0;
      h2 = ((h2 + c * 31 + i * 7) * 2246822519) >>> 0;
    }
    return (
      h1.toString(16).padStart(8, "0") +
      h2.toString(16).padStart(8, "0") +
      ((h1 ^ h2) >>> 0).toString(16).padStart(8, "0") +
      (((h1 + h2) * 17) >>> 0).toString(16).padStart(8, "0")
    );
  }
  return (
    <div className="rounded border border-border bg-background p-2 font-mono">
      <div className="text-muted-foreground">{s}</div>
      <div className="text-purple-300/80 break-all">{mockHash(s).slice(0, 24)}…</div>
    </div>
  );
}

function Signatur() {
  const [steg, setSteg] = useState(0);
  const stegene = [
    {
      tittel: "Alice skriver en melding",
      tekst: "Alice vil sende et offentlig dokument. Hun vil at alle skal kunne LESE det, men også kunne bevise at det er HUN som har skrevet det og at det ikke er tuklet med.",
    },
    {
      tittel: "Alice hasher meldingen",
      tekst: "Hun kjører dokumentet gjennom hash-funksjonen. Ut kommer et 64-tegns fingeravtrykk.",
    },
    {
      tittel: "Alice krypterer hashen med sin PRIVATE nøkkel",
      tekst: "Vanligvis bruker man offentlig nøkkel til å låse. Her gjør Alice det motsatte: hun bruker sin private på hashen. Dette gir en 'signatur' som bare hun kunne ha laget.",
    },
    {
      tittel: "Hun sender (dokument + signatur)",
      tekst: "Dokumentet er ikke kryptert — alle kan lese det. Signaturen er den lille tilleggsfila ved siden av.",
    },
    {
      tittel: "Bob verifiserer",
      tekst: "Bob hasher dokumentet selv. Han dekrypterer signaturen med Alice sin OFFENTLIGE nøkkel. Hvis de to hashene matcher, vet han to ting: (1) dokumentet er uendret, (2) det er virkelig Alice som signerte.",
    },
  ];
  const s = stegene[steg];

  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        <strong>Metafor:</strong> en signatur på papir som er teknisk umulig å forfalske, og som også beviser at ingen har endret et ord i brevet etter at du signerte.
      </p>
      <p>
        Signatur er <em>ikke</em> en egen krypteringsmetode — det er en kombinasjon av <strong>hash</strong> (seksjon 3) og <strong>asymmetrisk</strong> (seksjon 2), brukt baklengs.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="flex justify-center gap-2 mb-4">
          {stegene.map((_, i) => (
            <button
              key={i}
              onClick={() => setSteg(i)}
              className={`h-8 w-8 rounded-full border text-xs font-semibold ${
                i === steg
                  ? "border-brand bg-brand/20 text-brand"
                  : i < steg
                    ? "border-green-500/40 bg-green-500/10 text-green-300"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="rounded-md border border-brand/30 bg-brand/5 p-4">
          <div className="font-semibold text-brand text-sm mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Steg {steg + 1}: {s.tittel}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.tekst}</p>
        </div>
        <div className="mt-3 flex justify-between">
          <button
            onClick={() => setSteg((s) => Math.max(0, s - 1))}
            disabled={steg === 0}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted/40 disabled:opacity-40"
          >
            ← Forrige
          </button>
          <button
            onClick={() => setSteg((s) => Math.min(stegene.length - 1, s + 1))}
            disabled={steg === stegene.length - 1}
            className="rounded-md border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs text-brand hover:bg-brand/10 disabled:opacity-40"
          >
            Neste →
          </button>
        </div>
        <div className="mt-4 rounded-md border border-purple-500/30 bg-purple-500/5 p-3 text-xs text-muted-foreground">
          <strong className="text-purple-300">Nøkkelidé:</strong> bare innehaveren av den private nøkkelen kan lage en signatur som passer den offentlige. Derfor er en gyldig signatur <em>bevis</em> på at den private nøkkelens eier har sett og godkjent dokumentet — eksakt som den.
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          Brukes til: e-post (PGP/S-MIME), kode-signering, programvareoppdateringer, sertifikater (HTTPS), kryptovaluta-transaksjoner.
        </div>
      </div>
    </div>
  );
}

function Oppsummering() {
  const rader = [
    {
      ide: "Symmetrisk",
      ikon: <Lock className="h-4 w-4" />,
      farge: "amber",
      nokkel: "1 delt nøkkel",
      brukt: "Hemmelighold (HTTPS-data, VPN-trafikk)",
      problem: "Hvordan dele nøkkelen trygt?",
    },
    {
      ide: "Asymmetrisk",
      ikon: <Key className="h-4 w-4" />,
      farge: "emerald",
      nokkel: "1 offentlig + 1 privat",
      brukt: "Etablere delt nøkkel, signere, identifisere",
      problem: "Tregere; kun for små datamengder",
    },
    {
      ide: "Hash",
      ikon: <Fingerprint className="h-4 w-4" />,
      farge: "purple",
      nokkel: "Ingen nøkkel",
      brukt: "Passord-lagring, sjekksum, git-commits",
      problem: "Kan ikke reverseres — det er hele poenget",
    },
    {
      ide: "Signatur",
      ikon: <ShieldCheck className="h-4 w-4" />,
      farge: "brand",
      nokkel: "Privat (signere) + offentlig (verifisere)",
      brukt: "Bevis på avsender + uendrethet",
      problem: "Sier ingenting om hemmelighold",
    },
  ];

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="p-2 text-left text-muted-foreground font-semibold">Idé</th>
            <th className="p-2 text-left text-muted-foreground font-semibold">Nøkler</th>
            <th className="p-2 text-left text-muted-foreground font-semibold">Brukes til</th>
            <th className="p-2 text-left text-muted-foreground font-semibold">Hovedutfordring</th>
          </tr>
        </thead>
        <tbody>
          {rader.map((r) => (
            <tr key={r.ide} className="border-b border-border/40">
              <td className="p-2">
                <span className="inline-flex items-center gap-2 font-semibold">
                  {r.ikon}
                  {r.ide}
                </span>
              </td>
              <td className="p-2 text-muted-foreground">{r.nokkel}</td>
              <td className="p-2 text-muted-foreground">{r.brukt}</td>
              <td className="p-2 text-muted-foreground">{r.problem}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 inline mr-1 text-brand" />
        <strong className="text-brand">I praksis brukes alle fire samtidig.</strong> HTTPS bruker asymmetrisk for å bli enige om en symmetrisk nøkkel (tregere er ok for én oppstart), så bytter den til symmetrisk for selve dataene (raskere). Sertifikatet i HTTPS er en signatur. Server-passord lagres som hash. Fire ideer, ett system.
      </div>
    </div>
  );
}

function Quizer() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Hva er den viktigste forskjellen på symmetrisk og asymmetrisk kryptering?",
      valg: [
        "Symmetrisk er tryggere enn asymmetrisk",
        "Symmetrisk bruker én delt nøkkel; asymmetrisk bruker et par der den ene kan deles fritt",
        "Asymmetrisk er bare for tekst, symmetrisk for filer",
      ],
      riktig: 1,
      forklaring: "Symmetrisk = én nøkkel begge parter må ha. Asymmetrisk = to nøkler i par; offentlig kan deles, privat må holdes hemmelig. Det løser problemet med å trygt utveksle den første nøkkelen.",
    },
    {
      q: "Hva betyr det at hashing er 'enveis'?",
      valg: [
        "Hashen kan bare brukes av én person",
        "Du kan beregne hash fra input, men ikke utlede input fra hash",
        "Hash kan ikke deles på et nettverk",
      ],
      riktig: 1,
      forklaring: "Enveis = input → hash er enkelt. Hash → input er praktisk umulig. Derfor kan en server lagre hashen av passordet ditt uten at en innbruddstyv som stjeler databasen kan rekonstruere selve passordet.",
    },
    {
      q: "Hva trenger du for å LAGE en digital signatur på et dokument?",
      valg: [
        "Bare en hash-funksjon",
        "Din offentlige nøkkel + dokumentet",
        "Din private nøkkel + dokumentet + en hash-funksjon",
      ],
      riktig: 2,
      forklaring: "Du hasher dokumentet, så krypterer du hashen med din PRIVATE nøkkel. Andre verifiserer ved å dekryptere signaturen med din OFFENTLIGE og sjekke at hashen matcher. Privat nøkkel = lage. Offentlig nøkkel = verifisere.",
    },
  ];
  return (
    <div className="my-6 space-y-4">
      {sporsmal.map((s, i) => (
        <Quiz key={i} {...s} nr={i + 1} />
      ))}
    </div>
  );
}

function Quiz({
  nr,
  q,
  valg,
  riktig,
  forklaring,
}: {
  nr: number;
  q: string;
  valg: string[];
  riktig: number;
  forklaring: string;
}) {
  const [valgt, setValgt] = useState<number | null>(null);
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="text-sm font-medium mb-3">
        <span className="text-brand mr-2">Sjekk {nr}.</span>
        {q}
      </div>
      <div className="space-y-1.5">
        {valg.map((v, i) => {
          const erValgt = valgt === i;
          const erRiktig = i === riktig;
          const visStatus = valgt !== null && erValgt;
          const klass = visStatus
            ? erRiktig
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
            : "border-border bg-background hover:bg-muted/40";
          return (
            <button
              key={i}
              onClick={() => setValgt(i)}
              disabled={valgt !== null}
              className={`block w-full text-left rounded-md border px-3 py-2 text-xs ${klass} disabled:cursor-default`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {valgt !== null && (
        <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          {valgt === riktig ? (
            <span className="text-green-300 font-semibold">Riktig. </span>
          ) : (
            <span className="text-red-300 font-semibold">Ikke helt. </span>
          )}
          {forklaring}
        </div>
      )}
    </div>
  );
}

function NesteSteg() {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-5">
      <p className="text-sm leading-relaxed mb-4">
        Du har nå intuisjonen. SEC-modulen kan nå snakke om RSA, AES, Diffie-Hellman, sertifikater og TLS uten at det blir tåke — du har knaggene allerede.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs"
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Forkurs · Ferdig med F4
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til oversikten
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f10-binaer-hex" }}
          className="group rounded-md border border-border bg-background p-4 hover:bg-muted/40 transition"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            <BookOpen className="h-3 w-3 inline mr-1" /> Forrige
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            F-10 Binær og hex
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Denne biten åpner opp for: <code className="text-brand">SEC-01</code> (symmetrisk, AES),{" "}
        <code className="text-brand">SEC-02</code> (asymmetrisk, RSA),{" "}
        <code className="text-brand">SEC-03</code> (hash i dybden, SHA-256, bcrypt),{" "}
        <code className="text-brand">SEC-04</code> (signaturer, sertifikater),{" "}
        <code className="text-brand">SEC-05</code> (TLS/HTTPS-håndhilsen),{" "}
        <code className="text-brand">SEC-06</code> (angreps­modeller).
      </div>
    </div>
  );
}
