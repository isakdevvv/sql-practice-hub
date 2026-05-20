import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Building2,
  DoorOpen,
  Globe,
  Home,
  MapPin,
  Server,
  Wifi,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type PortInfo = {
  nummer: number;
  navn: string;
  beskrivelse: string;
  ikon: string;
};

const KJENTE_PORTER: PortInfo[] = [
  { nummer: 22, navn: "SSH", beskrivelse: "Fjernlogin til en server. Du får terminalprompt på en maskin som står et annet sted.", ikon: "🔐" },
  { nummer: 25, navn: "SMTP", beskrivelse: "Sending av e-post. Når du sender mail, prater klienten din SMTP på port 25.", ikon: "✉️" },
  { nummer: 53, navn: "DNS", beskrivelse: "Telefonkatalog-oppslag (navn → IP-adresse). Du så denne i F-07.", ikon: "📖" },
  { nummer: 80, navn: "HTTP", beskrivelse: "Vanlig (usikret) web-trafikk. Det meste flyttes nå til 443.", ikon: "🌐" },
  { nummer: 443, navn: "HTTPS", beskrivelse: "Sikker web-trafikk (kryptert). Alle moderne sider bruker dette.", ikon: "🔒" },
  { nummer: 3306, navn: "MySQL", beskrivelse: "MySQL-databaseserver lytter her som standard.", ikon: "🗄️" },
];

/**
 * F-08 IP-adresse og port.
 * Metafor: bygning + leilighet. Visuell: bygning med 65535 leiligheter (vi viser et utvalg).
 */
export function F08IpPort() {
  return (
    <StackPageShell title="Forkurs · F-08" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <SubjectWhy />
        <SectionTitle id="metafor" nr="1" tittel="Metaforen: bygningen og leilighetene" />
        <Metafor />
        <SectionTitle id="bygning" nr="2" tittel="Klikk på en port — hva bor der?" />
        <BygningSim />
        <SectionTitle id="lokal" nr="3" tittel="Lokal vs offentlig IP — to lag av adresser" />
        <LokalOffentlig />
        <SectionTitle id="ipv6" nr="4" tittel="IPv4 og IPv6 — gamle og nye adresser" />
        <IpFormater />
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
      <span className="text-foreground">F-08 IP-adresse og port</span>
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
        IP-adresse og port: bygning + leilighet
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        I F-07 så du at <code className="text-brand">vg.no</code> egentlig betyr <code className="text-brand">195.88.55.16</code>. Men en server kan kjøre flere programmer samtidig — en web-server, en mail-server, en SSH-server. Hvordan vet trafikken hvilket program den skal til? Svaret heter <strong>port</strong>. Sammen utgjør IP og port en eksakt postadresse til ett program på én maskin.
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
        IP og port er to-tuppelet som identifiserer alle ender av all internett-trafikk. Kurose-boka bygger TCP, UDP, sockets og brannmurer rett på disse to. Hvis du har bygnings-metaforen klar nå, sparer du masse forvirring senere.
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

function Metafor() {
  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        Forestill deg en stor bygning et sted i Tromsø. Bygningen har én gateadresse:{" "}
        <code className="text-brand">Storgata 12</code>. Det er <strong>IP-adressen</strong>.
      </p>
      <p>
        Inne i bygningen er det <strong>65 535 leiligheter</strong>. Hver leilighet har sitt eget nummer fra 1 til 65535. Det er <strong>porten</strong>. I leilighet 80 bor det en familie som har spesialisert seg på å levere web-sider. I leilighet 22 bor en SSH-portner. I leilighet 25 sitter postmesteren.
      </p>
      <p>
        Når et brev sendes til <code className="text-brand">195.88.55.16:443</code>, betyr det «Storgata 12, leilighet 443» — gå til den bygningen, finn HTTPS-leiligheten, lever brevet der.
      </p>
      <div className="rounded-md border border-border bg-card/40 p-4 text-xs text-muted-foreground">
        Skrivemåte: <code className="text-brand">IP:PORT</code> — for eksempel{" "}
        <code className="text-brand">195.88.55.16:443</code> eller{" "}
        <code className="text-brand">127.0.0.1:3000</code>. IP-en sier <em>hvilken maskin</em>, porten sier <em>hvilket program</em> på den maskinen.
      </div>
    </div>
  );
}

function BygningSim() {
  const [valgt, setValgt] = useState<number | null>(443);
  const aktivPort = KJENTE_PORTER.find((p) => p.nummer === valgt);
  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Her er bygningen vår. Bare et lite utvalg av de 65535 leilighetene har faste «leieboere» — programmer som tradisjonelt lytter der. Klikk på en port for å se hvem som bor der.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        {/* Bygning */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex flex-col items-center">
            <Building2 className="h-10 w-10 text-brand mb-2" />
            <div className="text-xs text-muted-foreground mb-2">IP: 195.88.55.16</div>
            <div className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-mono">
              65 535 leiligheter (porter)
            </div>
          </div>
        </div>
        {/* Knapper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KJENTE_PORTER.map((p) => {
            const er = valgt === p.nummer;
            return (
              <button
                key={p.nummer}
                onClick={() => setValgt(p.nummer)}
                className={`rounded-lg border px-3 py-3 text-left text-xs transition ${
                  er
                    ? "border-brand bg-brand/20 ring-2 ring-brand/40"
                    : "border-border bg-background hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono font-bold text-brand">:{p.nummer}</span>
                  <span>{p.ikon}</span>
                </div>
                <div className="font-semibold text-foreground">{p.navn}</div>
              </button>
            );
          })}
        </div>
        {/* Detalj */}
        {aktivPort && (
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex gap-3 items-start">
            <DoorOpen className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">
                Port {aktivPort.nummer} — {aktivPort.navn}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {aktivPort.beskrivelse}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground font-mono">
                Eksempel: 195.88.55.16:{aktivPort.nummer}
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">0–1023</strong> er «well-known» porter — reservert for kjente standardtjenester (som de over).
          </p>
          <p>
            <strong className="text-foreground">1024–49151</strong> er «registrerte» porter — programmer som MySQL (3306) eller PostgreSQL (5432) bruker disse.
          </p>
          <p>
            <strong className="text-foreground">49152–65535</strong> er «efemere» porter — disse plukker nettleseren din TILFELDIG hver gang den åpner en ny tilkobling. Du leier dem for en kort tid.
          </p>
        </div>
      </div>
    </div>
  );
}

function LokalOffentlig() {
  return (
    <div className="my-6 space-y-4">
      <p className="text-sm leading-relaxed">
        Det er to lag av adresser i hjemmet ditt. Ruteren din har <em>én</em> offentlig IP-adresse som hele resten av Internett ser deg som. Inne på det lokale nettet ditt har hver enhet sin egen <em>lokale</em> IP-adresse.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        {/* Visualisering */}
        <div className="space-y-4">
          <div className="rounded-lg border border-brand/40 bg-brand/5 p-4">
            <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-1">
              <Globe className="h-4 w-4" /> Det offentlige Internett ser deg som
            </div>
            <div className="font-mono text-lg text-brand">84.215.10.5</div>
            <div className="text-xs text-muted-foreground mt-1">
              Dette er IP-en ISP-en din har tildelt ruteren din. Alle som snakker med deg utenfra, snakker med denne adressen.
            </div>
          </div>

          <div className="flex justify-center text-muted-foreground/60 text-2xl">↕</div>

          <div className="rounded-lg border border-border bg-card/40 p-4">
            <div className="flex items-center gap-2 font-semibold text-sm mb-3">
              <Home className="h-4 w-4 text-purple-300" /> Hjemmenettet ditt (bak ruteren)
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <Enhet ikon="💻" navn="Laptopen din" ip="192.168.1.10" />
              <Enhet ikon="📱" navn="Mobil" ip="192.168.1.11" />
              <Enhet ikon="📺" navn="Smart-TV" ip="192.168.1.12" />
              <Enhet ikon="🖨️" navn="Skriver" ip="192.168.1.13" />
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Disse <code className="text-brand">192.168.x.x</code>-adressene finnes på MILLIONER av hjemmenett rundt i verden — de er bare gyldige innenfor ditt eget hjem. Ingen utenfra kan «se» dem direkte.
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        Hvordan klarer ruteren å oversette mellom de to lagene? Det heter <strong>NAT</strong> og kommer detaljert i kurset (DK-22). Akkurat nå er det nok å vite at de to lagene FINNES.
      </div>
    </div>
  );
}

function Enhet({ ikon, navn, ip }: { ikon: string; navn: string; ip: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-1.5">
      <span>{ikon}</span>
      <span className="font-sans text-muted-foreground flex-1">{navn}</span>
      <span className="text-brand">{ip}</span>
    </div>
  );
}

function IpFormater() {
  return (
    <div className="my-6 grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">IPv4 — den gamle</div>
        <div className="font-mono text-lg text-brand mb-1">195.88.55.16</div>
        <div className="text-xs text-muted-foreground mb-3">
          Fire tall mellom 0 og 255, skilt med punktum. Totalt 32 bits.
        </div>
        <div className="rounded border border-border bg-background p-2 font-mono text-[10px] leading-tight space-y-1">
          <div>195  .  88  .  55  .  16</div>
          <div>↓</div>
          <div>8 bit + 8 bit + 8 bit + 8 bit</div>
          <div>= 32 bit total</div>
        </div>
        <div className="text-xs text-muted-foreground mt-3">
          Maks ~4,3 milliarder unike adresser. Det HØRES mye ut. Det er det ikke. Vi har gått tomme.
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="text-xs uppercase tracking-wider text-purple-300 font-semibold mb-2">IPv6 — den nye</div>
        <div className="font-mono text-[11px] text-purple-300 mb-1 break-all">
          2001:0db8:85a3:0000:0000:8a2e:0370:7334
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          Åtte grupper av fire hex-siffer, skilt med kolon. Totalt 128 bits.
        </div>
        <div className="rounded border border-border bg-background p-2 font-mono text-[10px] leading-tight space-y-1">
          <div>8 grupper × 16 bit</div>
          <div>= 128 bit total</div>
          <div>= 340 undecillion adresser</div>
          <div>(et tall med 39 sifre)</div>
        </div>
        <div className="text-xs text-muted-foreground mt-3">
          Nok adresser til at hver sandkorn på jorda kan ha sin egen. Vi kommer aldri til å gå tomme.
        </div>
      </div>
      <div className="md:col-span-2 rounded-md border border-border bg-card/40 p-3 text-xs text-muted-foreground">
        Hvordan vi <em>regner</em> mellom bit-mønstre, binær og desimal kommer i F-10. Akkurat nå er det nok å se forskjellen i format.
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Hva er forskjellen mellom en IP-adresse og en port?",
      valg: [
        "Ingen forskjell — det er to navn på det samme",
        "IP sier HVILKEN MASKIN; port sier HVILKET PROGRAM på den maskinen",
        "IP er for nettlesere; port er for spill",
      ],
      riktig: 1,
      forklaring: "I bygnings-metaforen: IP er gateadressen til bygningen, porten er leilighetsnummeret. Sammen peker de eksakt på ett program på én maskin.",
    },
    {
      q: "Hvilken port lytter en HTTPS-server (sikker web) på som standard?",
      valg: ["80", "443", "8080"],
      riktig: 1,
      forklaring: "HTTPS = port 443. Vanlig HTTP er 80 (lite brukt nå). 8080 er en alternativ web-port utviklere ofte bruker, men ikke standarden.",
    },
    {
      q: "Kan to programmer på samme maskin lytte på samme port samtidig?",
      valg: [
        "Ja, OS-et fordeler trafikken mellom dem",
        "Nei — porten er som en leilighet med plass til én tjeneste. Andre må velge en annen port",
        "Bare hvis du er root",
      ],
      riktig: 1,
      forklaring: "Tenk på det som en leilighet: bare én leieboer kan bo der av gangen. Hvis du prøver å starte en webserver mens en annen allerede lytter på 80, får du «port already in use».",
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
        Nå kan du adressere én eksakt tjeneste på én eksakt maskin. Neste bit gir deg verktøyene for å faktisk SE trafikken — ping, traceroute og Wireshark.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f09-wireshark-ping" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-09 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Wireshark, ping og traceroute
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
      <div className="mt-4 text-xs text-muted-foreground flex items-start gap-2">
        <MapPin className="h-3 w-3 mt-0.5 text-brand" />
        <span>
          Denne biten åpner opp for: <code className="text-brand">DK-19</code> og{" "}
          <code className="text-brand">DK-20</code> (Kurose kap. 4 om nettverkslaget) og{" "}
          <code className="text-brand">DK-22</code> (NAT).
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Wifi className="h-3 w-3 text-purple-300" />
        Trivia: <code className="text-brand">127.0.0.1</code> er ALLTID «meg selv» — også kalt «localhost» eller «loopback». En adresse som peker på din egen maskin.
      </div>
    </div>
  );
}
