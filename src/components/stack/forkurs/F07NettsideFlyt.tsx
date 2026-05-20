import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Globe,
  Server,
  Network,
  Laptop,
  Search,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type StegId = 0 | 1 | 2 | 3 | 4;

/**
 * F-07 Hva skjer når du åpner en nettside.
 * Bygger den første mentale modellen av klient/server/DNS — uten å nevne TCP, ARP, etc.
 * Hovedvisualisering: 5 stegs animasjon studenten klikker seg gjennom.
 */
export function F07NettsideFlyt() {
  return (
    <StackPageShell title="Forkurs · F-07" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <SubjectWhy />
        <SectionTitle id="aktorer" nr="1" tittel="Skuespillerne — de fire tingene som snakker sammen" />
        <Aktorer />
        <SectionTitle id="flyt" nr="2" tittel="Spor en forespørsel — steg for steg" />
        <FlytSim />
        <SectionTitle id="feil" nr="3" tittel="Hva går GALT hvis ett steg feiler?" />
        <FeilTabell />
        <SectionTitle id="forenkling" nr="4" tittel="Det vi har gjemt — og hvor vi kommer tilbake" />
        <Forenkling />
        <SectionTitle id="drill" nr="5" tittel="Sjekk forståelsen" />
        <Drill />
        <SectionTitle id="neste" nr="6" tittel="Neste steg" />
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
      <span>F3 · Nettverksintuisjon</span>
      <span>/</span>
      <span className="text-foreground">F-07 Nettside-flyt</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F3 · Nettverksintuisjon
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Hva skjer egentlig når du åpner en nettside?
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Du skriver <code className="text-brand">vg.no</code>, trykker enter, og en halv-sekund senere lyser skjermen opp med forsida. Mellom disse to øyeblikkene skjer det fire-fem ting i en bestemt rekkefølge, mellom datamaskinen din og maskiner som står andre steder i Norge. Vi skal spore én forespørsel hele veien — på det helt enkle nivået. Detaljene (TCP, HTTP-headere, ruting) kommer senere.
      </p>
    </header>
  );
}

function SubjectWhy() {
  return (
    <div className="mb-10 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
      <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
        <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Hele Kurose-boka handler om å brette ut nøyaktig hva som skjer i hvert av de stegene vi tegner her. Hvis du har <em>bildet</em> klart før du møter de tekniske detaljene, blir kapittel 1 til 6 mye mer fordøyelig. Vi gjør med vilje masse forenklinger her — målet er en mental modell, ikke en presis definisjon.
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

function Aktorer() {
  const akt = [
    {
      ikon: <Laptop className="h-5 w-5" />,
      navn: "Du (klienten)",
      forklaring: "Laptopen, telefonen, nettleseren. Den som vil HA noe — i dette tilfellet en nettside.",
    },
    {
      ikon: <Network className="h-5 w-5" />,
      navn: "Internett-tilbyder (ISP) + ruter",
      forklaring: "Hjemme-ruteren din og firmaet du betaler internett til (Telenor/Telia/Altibox...). De får trafikken din ut i verden.",
    },
    {
      ikon: <Search className="h-5 w-5" />,
      navn: "DNS-server",
      forklaring: "En slags telefonkatalog. Vet hvilken IP-adresse som hører til hvert navn, f.eks. vg.no → 195.88.55.16.",
    },
    {
      ikon: <Server className="h-5 w-5" />,
      navn: "Web-serveren (vg.no)",
      forklaring: "En faktisk datamaskin et sted som har VG-sidene lagret og venter på spørsmål.",
    },
  ];
  return (
    <div className="my-6 space-y-3">
      <p className="text-sm leading-relaxed">
        Før vi tegner flyten, må vi vite hvem som er med. Det er fire roller:
      </p>
      {akt.map((a) => (
        <div key={a.navn} className="rounded-lg border border-border bg-card/30 p-4 flex gap-4 items-start">
          <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-brand">{a.ikon}</div>
          <div>
            <div className="font-semibold text-sm">{a.navn}</div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.forklaring}</div>
          </div>
        </div>
      ))}
      <div className="rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground">
        Metafor: dette er som å bestille pizza. Du = den sultne. ISP = veiene. DNS = nummeropplysningen som finner riktig pizzeria-nummer. Web-server = pizzeriaet.
      </div>
    </div>
  );
}

const STEG_TEKSTER: { tittel: string; kort: string; lang: string; aktorer: string[] }[] = [
  {
    tittel: "Du skriver vg.no",
    kort: "Du trykker enter i nettleseren.",
    lang: "Nettleseren har et navn — vg.no — men det er bare bokstaver. For å snakke med en maskin trenger den et tall: en IP-adresse. Den vet ikke ennå.",
    aktorer: ["klient"],
  },
  {
    tittel: "Spør DNS: hvem er vg.no?",
    kort: "Nettleseren spør en DNS-server om IP-adressen.",
    lang: "Nettleseren sender en bitteliten beskjed til en DNS-server (telefonkatalogen): «Hva er IP-en til vg.no?». DNS-serveren har en stor tabell med navn → tall.",
    aktorer: ["klient", "dns"],
  },
  {
    tittel: "DNS svarer 195.88.55.16",
    kort: "DNS sender tilbake IP-adressen.",
    lang: "DNS-serveren slår opp og svarer tilbake. Nå vet nettleseren din at vg.no bor på 195.88.55.16. Den glemmer det vanligvis ikke med en gang — den husker svaret en stund (cache).",
    aktorer: ["klient", "dns"],
  },
  {
    tittel: "Sender forespørsel til 195.88.55.16",
    kort: "Nettleseren ber serveren om forsiden.",
    lang: "Nettleseren sender en HTTP-forespørsel: «Gi meg forsiden, takk». Den reiser via hjemmeruteren din, ISP-en din, gjennom flere routere på Internett, og ankommer til slutt VG sin web-server.",
    aktorer: ["klient", "server"],
  },
  {
    tittel: "Får HTML tilbake → siden tegnes",
    kort: "Serveren sender HTML; nettleseren tegner siden.",
    lang: "Web-serveren svarer med HTML-koden for forsiden. Nettleseren leser koden, ber om bilder og CSS i nye forespørsler, og maler til slutt forsiden på skjermen. Hele runden tok kanskje 300 millisekunder.",
    aktorer: ["klient", "server"],
  },
];

function FlytSim() {
  const [steg, setSteg] = useState<StegId>(0);
  const aktive = STEG_TEKSTER[steg].aktorer;

  const naa = STEG_TEKSTER[steg];
  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Trykk «Neste» for å spore én forespørsel hele veien. Lyser opp betyr at den aktøren snakker eller jobber akkurat nå.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        {/* Visualisering */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
          <Aktor
            aktiv={aktive.includes("klient")}
            ikon={<Laptop className="h-6 w-6" />}
            label="Du"
            farge="brand"
          />
          <Aktor
            aktiv={aktive.includes("klient") && steg >= 3}
            ikon={<Network className="h-6 w-6" />}
            label="ISP"
            farge="muted"
          />
          <Aktor
            aktiv={aktive.includes("dns")}
            ikon={<Search className="h-6 w-6" />}
            label="DNS"
            farge="purple"
          />
          <Aktor
            aktiv={aktive.includes("server")}
            ikon={<Server className="h-6 w-6" />}
            label="vg.no"
            farge="green"
          />
        </div>

        {/* Forklaring */}
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Steg {steg + 1} av 5
          </div>
          <div className="font-semibold text-sm mb-1">{naa.tittel}</div>
          <div className="text-sm text-muted-foreground mb-2">{naa.kort}</div>
          <div className="text-xs text-muted-foreground leading-relaxed">{naa.lang}</div>
        </div>

        {/* Knapper */}
        <div className="mt-4 flex justify-between items-center gap-2">
          <button
            onClick={() => setSteg(0)}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs hover:bg-muted/40"
          >
            Start på nytt
          </button>
          <div className="flex gap-1">
            {STEG_TEKSTER.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-6 rounded-full transition ${
                  i === steg ? "bg-brand" : i < steg ? "bg-brand/40" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setSteg((s) => (Math.min(s + 1, 4) as StegId))}
            disabled={steg === 4}
            className="rounded-md border border-brand/40 bg-brand/10 px-4 py-2 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-40 flex items-center gap-1"
          >
            {steg === 4 ? "Ferdig" : "Neste"} <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Hele denne dansen skjer hver eneste gang du åpner en ny side, klikker en lenke eller laster opp en bilde til Instagram.
      </p>
    </div>
  );
}

function Aktor({
  aktiv,
  ikon,
  label,
  farge,
}: {
  aktiv: boolean;
  ikon: React.ReactNode;
  label: string;
  farge: "brand" | "purple" | "green" | "muted";
}) {
  const aktivKlass = {
    brand: "border-brand bg-brand/20 text-brand ring-2 ring-brand/40",
    purple: "border-purple-500 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/40",
    green: "border-green-500 bg-green-500/20 text-green-300 ring-2 ring-green-500/40",
    muted: "border-foreground/40 bg-card text-foreground ring-2 ring-foreground/20",
  }[farge];
  const passivKlass = "border-border bg-card/40 text-muted-foreground opacity-50";
  return (
    <div className={`rounded-lg border p-3 text-center transition ${aktiv ? aktivKlass : passivKlass}`}>
      <div className="flex justify-center mb-1">{ikon}</div>
      <div className="text-[10px] sm:text-xs font-medium">{label}</div>
    </div>
  );
}

function FeilTabell() {
  const feil = [
    {
      hva: "DNS-serveren er nede",
      symptom: "Nettleseren sier «Could not resolve host vg.no». Du vet ikke hvor du skal gå.",
    },
    {
      hva: "Du har ikke internett (ISP-en nede)",
      symptom: "Forespørselen kommer aldri ut. Etter en stund: «No internet connection».",
    },
    {
      hva: "Web-serveren er nede",
      symptom: "DNS funket, men maskinen svarer ikke. Du får timeout eller 503.",
    },
    {
      hva: "Sida finnes ikke (feil URL)",
      symptom: "Web-serveren svarer, men sier «404 Not Found». Den fant ikke akkurat den siden.",
    },
  ];
  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Når noe ikke virker — og det vil det ikke alltid gjøre — er det interessant å vite <em>hvor</em> i flyten det gikk galt. Forskjellige feil oppstår på forskjellige steg:
      </p>
      <div className="space-y-2">
        {feil.map((f) => (
          <div key={f.hva} className="rounded-lg border border-border bg-card/30 p-3 flex gap-3 items-start">
            <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-sm">{f.hva}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{f.symptom}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        I F-09 bruker du <strong>ping</strong> og <strong>traceroute</strong> til å avgjøre hvilket av disse stegene som faktisk har feilet hos deg.
      </div>
    </div>
  );
}

function Forenkling() {
  return (
    <div className="my-6 space-y-3 text-sm leading-relaxed">
      <p>
        Vi løy litt for å komme i mål uten å lage hodepine. Her er fire ting vi gjemte, og hvor du møter dem igjen:
      </p>
      <div className="rounded-lg border border-border bg-card/30 p-4 space-y-2 text-xs">
        <div className="flex gap-2">
          <Mail className="h-4 w-4 text-purple-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Forespørselen er ikke ett brev — den er mange små biter (pakker).</strong> Hver pakke får sin egen reise. Vi kommer tilbake til pakker i F-09 og dypt i Kurose kap. 1.
          </div>
        </div>
        <div className="flex gap-2">
          <Globe className="h-4 w-4 text-purple-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Mellom ISP og web-serveren er det 10-20 routere.</strong> Hver pakke hopper fra router til router. F-09 viser dette i traceroute.
          </div>
        </div>
        <div className="flex gap-2">
          <Network className="h-4 w-4 text-purple-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Før nettleseren kan sende forespørselen, må den «hilse» på serveren med en TCP-handshake.</strong> Kurose kap. 3.
          </div>
        </div>
        <div className="flex gap-2">
          <Search className="h-4 w-4 text-purple-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">DNS-oppslag er ofte flere oppslag i kjede</strong> (rot → .no → vg). Kurose kap. 2.
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Hver gang du tenker «vent, men hva med …», så er svaret som regel «ja, det er en faktisk ting, vi kommer tilbake til det».
      </p>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Hva er det FØRSTE nettleseren din gjør når du trykker enter på vg.no?",
      valg: [
        "Sender HTML-forespørsel rett til VG sin server",
        "Slår opp hvilken IP-adresse som hører til vg.no (DNS-oppslag)",
        "Spør hjemmeruteren om vg.no har endret seg",
      ],
      riktig: 1,
      forklaring: "Nettleseren har bare et navn (vg.no) — den må først finne ut hvilket TALL (IP-adresse) det navnet peker på. Det er DNS-oppslaget. Først DA kan den sende noen forespørsel videre.",
    },
    {
      q: "Du får feilen «Could not resolve host». Hvilken del av flyten gikk galt?",
      valg: [
        "DNS-oppslaget — navnet ble aldri oversatt til IP",
        "Web-serveren — den nektet å svare",
        "Du har ikke installert nettleseren riktig",
      ],
      riktig: 0,
      forklaring: "«Resolve» betyr akkurat å oversette navn til IP-adresse. Hvis det feilet, gikk det galt i DNS-steget — enten er DNS-serveren utilgjengelig, eller så finnes ikke navnet.",
    },
    {
      q: "Hvilken rolle har hjemme-ruteren din i flyten?",
      valg: [
        "Den lagrer en kopi av vg.no for raskere besøk",
        "Den er gateway-en som sender trafikk mellom hjemmet ditt og ISP-en/Internett",
        "Den oversetter HTML til bilde for skjermen",
      ],
      riktig: 1,
      forklaring: "Ruteren er broa mellom ditt lokale hjemmenettverk og resten av verden. Alt som skal ut, må gjennom den. Den maler ikke siden — det gjør nettleseren — og caching gjøres ofte hos ISP eller i nettleseren, ikke i hjemmeruteren.",
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
        Nå har du det store bildet. Neste bit zoomer inn på <em>tallet</em> du møtte: IP-adressen — og hvordan en server skiller på flere programmer som lytter samtidig.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f08-ip-port" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-08 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            IP-adresse og port
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          to="/forkurs"
          className="group rounded-md border border-border bg-background p-4 hover:bg-muted/40 transition"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            <BookOpen className="h-3 w-3 inline mr-1" /> Oversikt
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til forkurs-løypen
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Denne biten åpner opp for: <code className="text-brand">F-08</code>,{" "}
        <code className="text-brand">F-09</code>, og hele <code className="text-brand">DK-1 / DK-2</code> (Kurose kap. 1-2).
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-green-300/80">
        <CheckCircle2 className="h-3 w-3" /> Du har en mental modell. Detaljene fyller du inn senere.
      </div>
    </div>
  );
}
