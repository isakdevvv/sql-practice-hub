import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  ConfidentialityIcon,
  IntegrityIcon,
  AvailabilityIcon,
  KnowFactorIcon,
  HaveFactorIcon,
  BeFactorIcon,
} from "./securityIcons";

type CiaKategori = "K" | "I" | "T";

const CIA_DEFS = [
  {
    term: "Konfidensialitet (K)",
    icon: <ConfidentialityIcon />,
    body: (
      <span>
        Bare riktig mottaker skal kunne lese. Eksempler: krypter e-post, beskytt
        passord, sørg for at bare HR ser lønnsdata.
      </span>
    ),
  },
  {
    term: "Integritet (I)",
    icon: <IntegrityIcon />,
    body: (
      <span>
        Data skal ikke endres uten at det oppdages. Eksempler: hash av nedlastet
        fil, signert programvare, bankoverføring som ikke kan tukles med.
      </span>
    ),
  },
  {
    term: "Tilgjengelighet (T)",
    icon: <AvailabilityIcon />,
    body: (
      <span>
        Tjenesten skal fungere når brukerne trenger den. Eksempler: webserver
        oppe i eksamensuka, backup hvis disken dør, redundans mot DoS.
      </span>
    ),
  },
];

const FAKTOR_DEFS = [
  {
    term: "Noe du VET",
    icon: <KnowFactorIcon />,
    body: (
      <span>
        Passord, PIN-kode, svar på sikkerhetsspørsmål. Svakhet: kan deles,
        gjettes, lures fra deg via phishing.
      </span>
    ),
  },
  {
    term: "Noe du HAR",
    icon: <HaveFactorIcon />,
    body: (
      <span>
        BankID-kort, USB-nøkkel, smarttelefon med kode-app. Svakhet: kan stjeles
        eller mistes. Ekstra tryggere kombinert med VET.
      </span>
    ),
  },
  {
    term: "Noe du ER",
    icon: <BeFactorIcon />,
    body: (
      <span>
        Fingeravtrykk, ansikt, iris. Svakhet: vanskelig å bytte hvis
        kompromittert — fingeren din er ikke et nytt passord.
      </span>
    ),
  },
];

/**
 * SEC-01 Hva sikkerhet betyr — CIA og autentisering.
 * Pilot for sikkerhetssporet. Visuell først: en trekant-modell der studenten
 * kategoriserer ekte trusler under K/I/T, og en autentiserings-stige som
 * skiller "hvem du er", "hva du har" og "hva du vet".
 */
export function SEC01CiaAutentisering() {
  return (
    <StackPageShell title="Sikkerhet · SEC-01" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <KonvergensRamme />
        <SectionTitle nr="1" tittel="CIA — tre bokstaver som rammer inn alt" />
        <CiaIntro />
        <SectionTitle nr="2" tittel="Sett trusler i riktig kategori" />
        <CiaKategoriser />
        <SectionTitle nr="3" tittel="Autentisering — bevis på hvem du er" />
        <AutentiseringStige />
        <SectionTitle nr="4" tittel="Hvorfor CIA aldri er gratis — kompromisser" />
        <Kompromisser />
        <SectionTitle nr="5" tittel="Sjekk forståelsen" />
        <Drill />
        <SectionTitle nr="6" tittel="Neste steg" />
        <NesteSteg />
      </article>
    </StackPageShell>
  );
}

function Crumbs() {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <Link to="/sikkerhet" className="hover:text-foreground">Sikkerhet</Link>
      <span>/</span>
      <span>SEC-1 · Kryptografiske prinsipper</span>
      <span>/</span>
      <span className="text-foreground">SEC-01 CIA + autentisering</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Sikkerhet · Fase SEC-1 · Kryptografiske prinsipper
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Hva sikkerhet betyr — CIA og autentisering
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Før vi i det hele tatt nevner AES eller TLS, må vi ha språk for hva sikkerhet handler om. Den klassiske rammen heter <strong>CIA</strong>: <em>Konfidensialitet</em>, <em>Integritet</em>, <em>Tilgjengelighet</em>. Pluss <strong>Autentisering</strong> som lim. Får du dette i fingrene, kan du for hver trussel eller løsning du møter senere spørre: <em>hvilken bokstav?</em>
      </p>
    </header>
  );
}

function KonvergensRamme() {
  return (
    <div className="mb-10 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
      <ShieldCheck className="h-4 w-4 text-brand mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed">
        <span className="font-medium text-brand">Hvorfor først:</span> alle senere SEC-biter bruker CIA. Når vi forklarer hvorfor TLS finnes (SEC-07), peker vi på K + I. Når vi forklarer DoS (SEC-11), peker vi på T. Når vi forklarer signaturer (SEC-05), peker vi på I + autentisering.
      </div>
    </div>
  );
}

function SectionTitle({ nr, tittel }: { nr: string; tittel: string }) {
  return (
    <h2 className="mt-12 mb-4 text-xl font-semibold flex items-baseline gap-3">
      <span className="text-brand text-base font-mono">{nr}.</span>
      {tittel}
    </h2>
  );
}

function CiaIntro() {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Hvert sikkerhetsmål kan brytes ned til én av disse tre. Lær dem nå — du kommer til å sortere etter dem hele resten av kurset.
      </p>
      <VisualDefs items={CIA_DEFS} title="CIA — tre bokstaver" />
    </div>
  );
}

type Trussel = {
  tekst: string;
  riktig: CiaKategori;
  forklaring: string;
};

const TRUSLER: Trussel[] = [
  {
    tekst: "Noen avlytter passord-trafikken din på et åpent wifi-nett.",
    riktig: "K",
    forklaring: "Konfidensialitet — uautorisert person kan LESE noe de ikke skal se.",
  },
  {
    tekst: "Et SYN-flood-angrep fyller TCP-køen til webserveren slik at ekte brukere ikke får svar.",
    riktig: "T",
    forklaring: "Tilgjengelighet — tjenesten er nede selv om dataen ikke er stjålet eller endret.",
  },
  {
    tekst: "En angriper bytter ut programvaren du laster ned med en versjon som inneholder skadekode.",
    riktig: "I",
    forklaring: "Integritet — dataen er ENDRET uten at du oppdager det. Hash-verifisering ville fanget dette.",
  },
  {
    tekst: "Backup-disken dør samtidig som hoveddisken, og kundelisten er borte.",
    riktig: "T",
    forklaring: "Tilgjengelighet — du klarer ikke å bruke dataen lenger. Konfidensialitet og integritet er ikke kompromittert, men T er.",
  },
  {
    tekst: "En innleid konsulent leser konfidensielle HR-dokumenter selv om hen ikke skulle hatt tilgang.",
    riktig: "K",
    forklaring: "Konfidensialitet — uautorisert person SER noe de ikke skal se. Klassisk K.",
  },
];

function CiaKategoriser() {
  const [status, setStatus] = useState<Record<number, CiaKategori>>({});
  return (
    <div className="my-4 space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Klikk K, I eller T for hver trussel. Riktig kategori dukker opp med forklaring etter første klikk.
      </p>
      {TRUSLER.map((t, i) => (
        <TrusselRad
          key={i}
          trussel={t}
          valgt={status[i]}
          onValg={(k) => setStatus((s) => ({ ...s, [i]: k }))}
        />
      ))}
    </div>
  );
}

function TrusselRad({
  trussel,
  valgt,
  onValg,
}: {
  trussel: Trussel;
  valgt: CiaKategori | undefined;
  onValg: (k: CiaKategori) => void;
}) {
  const erBesvart = valgt !== undefined;
  const erRiktig = valgt === trussel.riktig;
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <p className="text-sm mb-3">{trussel.tekst}</p>
      <div className="flex gap-2">
        {(["K", "I", "T"] as CiaKategori[]).map((k) => {
          const erValgt = valgt === k;
          const visStatus = erBesvart && erValgt;
          const klass = visStatus
            ? k === trussel.riktig
              ? "border-green-500/40 bg-green-500/15 text-green-200"
              : "border-red-500/40 bg-red-500/15 text-red-200"
            : "border-border bg-background hover:bg-muted/40";
          return (
            <button
              key={k}
              onClick={() => onValg(k)}
              disabled={erBesvart}
              className={`rounded-md border px-3 py-1.5 text-xs font-mono ${klass} disabled:cursor-default`}
            >
              {k}
            </button>
          );
        })}
        {erBesvart && (
          <div className="ml-3 flex items-center text-xs">
            {erRiktig ? (
              <span className="text-green-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Riktig
              </span>
            ) : (
              <span className="text-red-300 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Nei — riktig er {trussel.riktig}
              </span>
            )}
          </div>
        )}
      </div>
      {erBesvart && (
        <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          {trussel.forklaring}
        </div>
      )}
    </div>
  );
}

function AutentiseringStige() {
  return (
    <div className="my-4 space-y-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Autentisering er beviset på at du er den du sier du er. Tre typer faktorer — og <strong>totrinns</strong> betyr at du kombinerer to ulike typer (ikke to passord, men f.eks. passord + telefon-kode).
      </p>
      <VisualDefs items={FAKTOR_DEFS} title="Tre autentiseringsfaktorer" />
      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <strong className="text-brand">Totrinns (2FA):</strong> kombiner to faktorer fra ULIKE rader. Passord + SMS-kode er VET + HAR. To passord er BARE VET — ikke 2FA.
      </div>
    </div>
  );
}

function Kompromisser() {
  return (
    <div className="my-4 space-y-3">
      <p className="text-sm leading-relaxed">
        CIA virker enkelt på papiret, men i praksis må du ofte velge mellom dem. To eksempler å ha i hodet:
      </p>
      <div className="rounded-lg border border-border bg-card/40 p-4">
        <div className="font-semibold text-sm mb-2">K vs T — kryptert backup</div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Krypter backuppen sterkt = god K. Men mister du nøkkelen, mister du dataen — null T. Mange organisasjoner setter opp <em>nøkkel-escrow</em> (en sikker kopi av nøkkelen lagret separat) for å balansere.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card/40 p-4">
        <div className="font-semibold text-sm mb-2">I vs T — strenge sjekksummer</div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sjekk hash på alle innkommende filer = god I. Men hvis sjekksum-tjenesten henger, henger hele pipelinen — T lider. Realistisk design: rask validering inline, full verifisering asynkront.
        </p>
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "En nettbutikk får sin database-fil dumpet og lekket på internett. Hvilke bokstaver i CIA er brutt?",
      valg: ["Bare K", "K og I", "K og T", "Alle tre"],
      riktig: 0,
      forklaring: "Bare K — dataen lekker (konfidensialitet brutt), men er ikke endret (I OK) og butikken kjører fortsatt (T OK).",
    },
    {
      q: "Et angrep krypterer alle filer på en server og krever løsepenger. Hvilken bokstav rammes mest umiddelbart?",
      valg: ["K — innholdet er nå skjult", "I — dataen er endret", "T — du får ikke jobbet"],
      riktig: 2,
      forklaring: "T — Tilgjengelighet. Filene finnes fortsatt og er ikke lekket, men du kan ikke bruke dem. (I rammes også, men T er det mest umiddelbare problemet for driften.)",
    },
    {
      q: "Du logger på en tjeneste med passord PLUSS en kode fra Microsoft Authenticator. Hvilke autentiseringsfaktorer bruker du?",
      valg: ["VET + HAR", "VET + ER", "HAR + ER", "Bare VET (to ganger)"],
      riktig: 0,
      forklaring: "VET (passord) + HAR (telefonen med appen). Ekte 2FA. Hadde du bare lagt til et ekstra passord ville begge vært VET — ikke 2FA.",
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
        Du har nå språket for å snakke om sikkerhet. Neste biter gir deg verktøyene — først symmetrisk kryptering (én delt nøkkel).
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/sikkerhet/$slug"
          params={{ slug: "sec02-symmetrisk" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            SEC-02 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Symmetrisk kryptering
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          to="/sikkerhet"
          className="group rounded-md border border-border bg-background p-4 hover:bg-muted/40 transition"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            <BookOpen className="h-3 w-3 inline mr-1" /> Oversikt
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til sikkerhets-sporet
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Denne biten åpner opp for: <code className="text-brand">alle videre SEC-biter</code>. Du bruker CIA-kategoriene i hver eneste senere bit.
      </div>
    </div>
  );
}
