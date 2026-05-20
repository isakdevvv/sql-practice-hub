import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  Rewind,
  Save,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Server,
  Gamepad2,
  BookOpen,
  Layers,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  CameraSnapshotIcon,
  RollbackIcon,
  TilstandIcon,
} from "./forkursIcons";

type Tilstand = {
  navn: string;
  beskrivelse: string;
  fungerer: boolean;
  ikon: React.ReactNode;
};

/**
 * F-03 Snapshots og trygg eksperimentering.
 * Interaktiv timeline med klikkbare tidspunkter som viser VM-tilstanden.
 * Metafor: spillsave før boss-fight.
 */
export function F03Snapshots() {
  return (
    <StackPageShell title="Forkurs · F-03" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <DualSubjectWhy />
        <SectionTitle id="metafor" nr="1" tittel="Metaforen: lagring før boss-fight" />
        <Metafor />
        <SectionTitle id="timeline" nr="2" tittel="Interaktiv tidslinje — klikk gjennom historien" />
        <TimelineSim />
        <SectionTitle id="ikke-backup" nr="3" tittel="Hvorfor snapshot er mer enn fil-backup" />
        <IkkeBackup />
        <SectionTitle id="hvordan" nr="4" tittel="Hvordan du faktisk tar et snapshot i VirtualBox" />
        <Hvordan />
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
      <span>F1 · Verktøykassa</span>
      <span>/</span>
      <span className="text-foreground">F-03 Snapshots</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F1 · Verktøykassa
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Snapshots og trygg eksperimentering
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Nå har du en VM. Den er fortsatt litt skummel å bruke — du tør kanskje ikke kjøre en kommando du ikke forstår, fordi du ikke vil ødelegge oppsettet. Snapshots fjerner den frykten. De er VM-ens "lagre-funksjon" — du fryser hele systemet ned i en fil, gjør hva du vil, og kan rulle tilbake på sekunder.
      </p>
    </header>
  );
}

function DualSubjectWhy() {
  return (
    <div className="mb-10 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hvorfor for DTE-2505 (OS)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          OS-faget krever at du tukler med kernel-parametre, installer pakker, ødelegger filsystemet med vilje. Snapshots gjør at en time med eksperimenter alltid kan rulles tilbake til "rein Ubuntu".
        </p>
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Skadevare-analyse, brannmurkonfigurasjoner og pen-testing-øvelser blir trygge. Tar du snapshot før, kan du gjenopprette nøyaktig samme tilstand for å gjenta eksperimentet.
        </p>
      </div>
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
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold mb-2">
          <Gamepad2 className="h-4 w-4" /> Tenk på spill-saves
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Du står foran en boss. Du <em>vet</em> du skal dø flere ganger før du skjønner mønsteret. Så du lagrer rett før døra. Du går inn, dør, laster inn, prøver igjen. Etter 20 forsøk vinner du. Du har ikke spilt 20 timer av spillet på nytt — bare det ene rommet.
        </p>
      </div>
      <p>
        Snapshots er nøyaktig det samme. Du står foran en kommando du ikke stoler på (kanskje fordi en tutorial sier <code className="text-brand">sudo apt-get install et-eller-annet</code> og du vil sjekke hva den faktisk gjør). Du tar snapshot. Du kjører kommandoen. Hvis det går galt, ruller du tilbake til snapshotet — du er tilbake til samme posisjon, samme prosesser kjørende, samme musepeker-posisjon hvis du tok snapshot mens VM-en var aktiv.
      </p>
      <VisualDefs
        title="Tre ord du vil møte"
        items={[
          {
            term: "snapshot",
            icon: <CameraSnapshotIcon />,
            body: "Lagring av hele VM-tilstanden — filer, kjørende programmer, minne. Som et lagrings-punkt i et spill.",
          },
          {
            term: "rollback",
            icon: <RollbackIcon />,
            body: "Å rulle tilbake til et tidligere snapshot. VM-en lastes inn nøyaktig slik den var da snapshotet ble tatt.",
          },
          {
            term: "tilstand",
            icon: <TilstandIcon />,
            body: "Alt VM-en \"vet\" akkurat nå — filer, kjørende programmer, og om den er midt i en boot.",
          },
        ]}
      />
    </div>
  );
}

function TimelineSim() {
  const tidslinje: Tilstand[] = [
    {
      navn: "T0 · Reint Ubuntu",
      beskrivelse: "Fersk installasjon. Bare standard-pakkene. Ingen snapshots ennå.",
      fungerer: true,
      ikon: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    },
    {
      navn: "T1 · 📸 Snapshot 'rein'",
      beskrivelse:
        "Du tar ditt første snapshot og kaller det 'rein-installasjon'. VirtualBox lagrer hele VM-tilstanden i en .vdi-delta-fil.",
      fungerer: true,
      ikon: <Camera className="h-4 w-4 text-brand" />,
    },
    {
      navn: "T2 · apt update gjort",
      beskrivelse:
        "Du kjører `sudo apt update && sudo apt upgrade`. 200 pakker oppdatert. VM-en er nyere og fungerer fint.",
      fungerer: true,
      ikon: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    },
    {
      navn: "T3 · 📸 Snapshot 'oppdatert'",
      beskrivelse:
        "Du tar et nytt snapshot. Nå har du to lagrings-punkter å hoppe tilbake til.",
      fungerer: true,
      ikon: <Camera className="h-4 w-4 text-brand" />,
    },
    {
      navn: "T4 · 'rm -rf /etc' med vilje",
      beskrivelse:
        "Du sletter hele /etc-mappen for å se hva som skjer. Innstillinger for nettverk, brukere, systemd — alt borte. VM-en svarer ikke lenger.",
      fungerer: false,
      ikon: <AlertTriangle className="h-4 w-4 text-red-400" />,
    },
    {
      navn: "T5 · ↺ Rull tilbake til 'oppdatert'",
      beskrivelse:
        "Du høyreklikker snapshot 'oppdatert' i VirtualBox → Restore. VM-en lastes inn nøyaktig slik den var ved T3. /etc er tilbake. Skadene fra T4 er borte.",
      fungerer: true,
      ikon: <Rewind className="h-4 w-4 text-brand" />,
    },
  ];
  const [punkt, setPunkt] = useState(0);
  const aktiv = tidslinje[punkt];

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Her er en typisk tidslinje for en student som lærer Linux. Klikk gjennom punktene og se hvordan VM-en endrer tilstand:
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-5">
        {/* Tidslinje-strek */}
        <div className="relative mb-6">
          <div className="absolute left-0 right-0 top-3 h-0.5 bg-border" />
          <div className="relative flex justify-between">
            {tidslinje.map((t, i) => {
              const erAktiv = i === punkt;
              const erPassert = i < punkt;
              return (
                <button
                  key={i}
                  onClick={() => setPunkt(i)}
                  className="flex flex-col items-center gap-1 group"
                  title={t.navn}
                >
                  <span
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono ${
                      erAktiv
                        ? "border-brand bg-brand text-background"
                        : erPassert
                          ? "border-brand bg-brand/30 text-brand"
                          : "border-border bg-background text-muted-foreground"
                    } group-hover:scale-110 transition`}
                  >
                    {i}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aktiv tilstand */}
        <div
          className={`rounded-lg border p-4 ${
            aktiv.fungerer
              ? "border-green-500/40 bg-green-500/5"
              : "border-red-500/40 bg-red-500/10"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm mb-2">
            {aktiv.ikon}
            {aktiv.navn}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{aktiv.beskrivelse}</p>
        </div>

        {/* Snapshot-tre */}
        <div className="mt-5 rounded-md border border-border bg-background p-3 font-mono text-[11px]">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-sans">
            Snapshot-tre nå
          </div>
          {punkt < 1 && <div className="text-muted-foreground/60">(ingen snapshots ennå)</div>}
          {punkt >= 1 && (
            <div className="text-brand">
              <Layers className="h-3 w-3 inline mr-1" /> rein-installasjon
            </div>
          )}
          {punkt >= 3 && (
            <div className="text-brand pl-4">
              <Layers className="h-3 w-3 inline mr-1" /> oppdatert
            </div>
          )}
          <div className="pl-8 text-muted-foreground">
            └─ <span className={aktiv.fungerer ? "text-green-300" : "text-red-300"}>nåværende tilstand</span>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPunkt(Math.max(0, punkt - 1))}
            disabled={punkt === 0}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted/40 disabled:opacity-40"
          >
            ← Forrige
          </button>
          <button
            onClick={() => setPunkt(Math.min(tidslinje.length - 1, punkt + 1))}
            disabled={punkt === tidslinje.length - 1}
            className="rounded-md border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs text-brand hover:bg-brand/20 disabled:opacity-40"
          >
            Neste →
          </button>
          <button
            onClick={() => setPunkt(0)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted/40"
          >
            Start på nytt
          </button>
        </div>
      </div>
    </div>
  );
}

function IkkeBackup() {
  return (
    <div className="my-6 grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Fil-backup
        </div>
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Save className="h-4 w-4" /> Bare filer
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed mb-3">
          Tar du backup av dokumenter, lagres bare innholdet i de filene. Du får tilbake et bilde, ikke en kjørende prosess som tegner det.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Lagrer: dokumenter, bilder, prosjekt-mapper</li>
          <li>Mister: hvilke programmer som kjørte, systemkonfigurasjon, installerte pakker</li>
        </ul>
      </div>
      <div className="rounded-lg border border-brand/40 bg-brand/5 p-5">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
          VM-snapshot
        </div>
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Camera className="h-4 w-4" /> Hele tilstanden
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed mb-3">
          Lagrer alt VM-en "er" akkurat nå: kernel, RAM-innhold (hvis VM-en kjører), åpne filer, installerte pakker, brukere, nettverkstilstand.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Tar du snapshot mens VM-en kjører: lagres også RAM-bilde og kjørende prosesser</li>
          <li>Tar du snapshot mens VM-en er av: lagres bare disk-tilstanden</li>
          <li>Rollback gjenoppretter <em>nøyaktig</em> samme situasjon</li>
        </ul>
      </div>
    </div>
  );
}

function Hvordan() {
  return (
    <div className="my-6 space-y-3 text-sm">
      <p className="text-muted-foreground leading-relaxed">
        I VirtualBox sin hovedmeny: velg VM-en din i venstre kolonne, så finner du <em>Snapshots</em>-fanen øverst til høyre. Der er det tre knapper:
      </p>
      <div className="grid gap-2">
        <div className="rounded-lg border border-border bg-card/30 p-3 text-xs flex items-start gap-3">
          <Camera className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold mb-1">Take</div>
            <div className="text-muted-foreground">Lager et nytt snapshot. Gi det et navn du forstår senere — f.eks. "før-kernel-eksperiment", ikke "snapshot-3".</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/30 p-3 text-xs flex items-start gap-3">
          <Rewind className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold mb-1">Restore</div>
            <div className="text-muted-foreground">Rull VM-en tilbake til valgt snapshot. Du mister alt som er gjort etter det snapshotet — derfor blir du spurt om bekreftelse.</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/30 p-3 text-xs flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold mb-1">Delete</div>
            <div className="text-muted-foreground">Sletter snapshot-filen for å frigjøre disk-plass. Forsiktig — det er ikke "rollback", det er bare opprydding.</div>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <strong className="text-brand">Råd:</strong> Ta minst ett snapshot rett etter at du har installert Guest Additions i F-02 og fått alt til å fungere. Kall det "ferdig-oppsatt". Det er din pålitelige tilbakehoppspunkt for resten av studiet.
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Når er snapshot bedre enn fil-backup?",
      valg: [
        "Når du vil ta vare på bare et dokument",
        "Når du vil kunne gjenopprette HELE systemets tilstand — programmer, konfigurasjon, installerte pakker — etter et eksperiment",
        "Når du vil dele filer mellom flere maskiner",
      ],
      riktig: 1,
      forklaring:
        "Fil-backup er for innhold. Snapshot er for tilstand. Skal du eksperimentere med systemet selv, er snapshot riktig verktøy. Vil du ikke miste dokumenter ved disk-krasj, er fil-backup riktig.",
    },
    {
      q: "Du tar snapshot mens VM-en kjører midt i en video-spilling. Hva lagres?",
      valg: [
        "Bare disken — videoen må startes på nytt etter rollback",
        "Disken pluss RAM-innholdet og kjørende prosesser — etter rollback fortsetter videoen omtrent der den var",
        "Ingenting før du slår av VM-en",
      ],
      riktig: 1,
      forklaring:
        "VirtualBox' 'live snapshot' tar med RAM-bilde og prosesstilstand. Det er litt tregere å ta snapshotet, men du får tilbake en VM som er midt i det den gjorde — som å pause spillet uten å lukke det.",
    },
    {
      q: "Kan du ta snapshot av vert-OS-et (din ekte Windows/macOS) ved hjelp av VirtualBox?",
      valg: [
        "Ja — VirtualBox snapshotter alt på maskinen",
        "Nei — snapshot er en VM-funksjon. Vert-OS-et trenger andre verktøy (Time Machine, systembilder, ZFS, …)",
        "Bare hvis du installerer ekstra plugin",
      ],
      riktig: 1,
      forklaring:
        "VirtualBox kjenner bare til de virtuelle maskinene den selv kontrollerer. Vert-OS er utenfor — det krever helt andre løsninger som filsystem-snapshots (APFS, ZFS, Btrfs) eller verktøy som Time Machine.",
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
        Nå har du både et trygt miljø og en angre-knapp. Det er på tide å åpne terminalen — vinduet der det meste av OS- og datakomm-arbeid faktisk skjer.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f04-terminal" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-04 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Åpne terminalen
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
        Denne biten åpner opp for: <code className="text-brand">F-04</code> (terminal),{" "}
        <code className="text-brand">OS-05</code> (prosess-eksperimenter trygt),{" "}
        <code className="text-brand">SEC-01</code> (malware-analyse uten risiko).
      </div>
    </div>
  );
}
