import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Download,
  Disc3,
  Settings,
  Power,
  Package,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  Keyboard,
  MemoryStick,
  Network,
  BookOpen,
  Server,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  IsoDiscIcon,
  DiskImageIcon,
  RamChipIcon,
} from "./forkursIcons";

/**
 * F-02 Installer VirtualBox + Ubuntu.
 * Eneste forkurs-bit som krever ekte arbeid utenfor nettleseren.
 * Steg-for-steg sjekkliste med "vanlig feil"-tips og en VM-resept-oppsummering.
 */
export function F02InstallerVm() {
  return (
    <StackPageShell title="Forkurs · F-02" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <DualSubjectWhy />
        <SectionTitle id="ekte-arbeid" nr="1" tittel="En forvarsel: dette er ekte arbeid" />
        <EkteArbeid />
        <SectionTitle id="ordliste" nr="2" tittel="Tre ord du møter underveis" />
        <Ordliste />
        <SectionTitle id="steg" nr="3" tittel="Stegene — én ting om gangen" />
        <Steg />
        <SectionTitle id="resept" nr="4" tittel="VM-resepten på ett blikk" />
        <Resept />
        <SectionTitle id="sjekk" nr="5" tittel="Sjekk at det funker" />
        <SjekkFunker />
        <SectionTitle id="drill" nr="6" tittel="Sjekk forståelsen" />
        <Drill />
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
      <span>F1 · Verktøykassa</span>
      <span>/</span>
      <span className="text-foreground">F-02 Installer VirtualBox + Ubuntu</span>
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
        Installer VirtualBox + Ubuntu
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Nå skal du faktisk sette opp den virtuelle maskinen vi snakket om i F-01. Det betyr to nedlastinger, fem-seks valg i et oppsett-vindu, og en ventetid mens Ubuntu installerer seg selv inne i VM-en. Etter dette har du et trygt eksperimenteringsmiljø som følger deg gjennom hele forkurset og store deler av OS- og datakomm-fagene.
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
          Du må ha et Linux-miljø for å øve på prosesser, filsystem, schedulering og minne. Du skal også få lov til å kjøre kommandoer som <em>root</em> uten å bekymre deg — derfor en VM, ikke din ekte maskin.
        </p>
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Wireshark, nmap og brannmur-eksperimenter krever en maskin du kan styre fra topp til bunn. En VM gir deg det — uten å rote til netteverket på din ekte maskin.
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

function EkteArbeid() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Resten av forkurset er hovedsakelig visualisering og lesing. <strong>Denne biten er ikke.</strong> Du må forlate nettleseren, laste ned to ting, og klikke deg gjennom et installer-program. Sett av <strong>30–60 minutter</strong> — mest ventetid, men du må være tilstede.
      </p>
      <p>
        Det er helt normalt at noe går litt skeivt første gang. Hvert steg under har et "vanlig feil"-felt. Hvis du sitter fast lenger enn 10 minutter på ett steg, gå videre eller spør — det er sjelden produktivt å brenne en time på et innstillingsvindu.
      </p>
      {/*
        Arkitektur-fella. Dette avsnittet sa tidligere «samme Ubuntu-ISO», og
        det er direkte feil: en Mac med Apple Silicon har en ARM-prosessor, og
        en ISO bygget for Intel/AMD booter ikke på den i det hele tatt. Det er
        den enkeltfeilen som oftest spiser en hel kveld på dette steget — emnet
        flagger den selv med «Sjekk at versjonen er rett!» ved nedlastingslenka.
      */}
      <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-orange-300 font-semibold mb-1">
          <AlertTriangle className="h-4 w-4" /> Hvis du har Apple Silicon (M1/M2/M3/M4)
        </div>
        <p className="mb-2">
          Da må du laste ned en <strong>annen Ubuntu-fil</strong> enn resten av klassen — ikke den
          samme. Maskinen din har en ARM-prosessor, og standardnedlastingen på ubuntu.com er bygget
          for Intel og AMD. Prøver du den, starter ikke installeren i det hele tatt, og
          feilmeldingen sier ingenting om hvorfor.
        </p>
        <p className="mb-2">
          Du skal ha varianten merket <strong>arm64</strong> (også kalt AArch64). Emnet lenker til{" "}
          <em>Ubuntu 25.04 arm64 Desktop</em> i Canvas — og merk at 25.04 <em>ikke</em> er en
          LTS-versjon, så den lenka er et bevisst unntak fra «velg alltid LTS»-regelen i steg 2.
        </p>
        <p>
          Til å kjøre den bruker du <em>UTM</em> (gratis) eller <em>Parallels</em>. VirtualBox har
          en Apple Silicon-utgave, men den er fortsatt vinglete — velg UTM hvis du vil ha minst
          motstand. Alt annet i forkurset fungerer likt.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card/40 p-4 text-xs text-muted-foreground">
        <div className="mb-1 font-semibold text-foreground">Kort sagt: hvilken fil er din?</div>
        <ul className="space-y-1">
          <li>
            <strong>Windows-PC, Linux-PC eller Mac med Intel:</strong> «64-bit PC (AMD64) desktop
            image», siste LTS-versjon.
          </li>
          <li>
            <strong>Mac med M1/M2/M3/M4:</strong> arm64 desktop image — bruk Canvas-lenka.
          </li>
        </ul>
        <p className="mt-2">
          Usikker på hvilken Mac du har? Eplemenyen → «Om denne maskinen». Står det{" "}
          <em>Apple M</em> og et tall, er du på Apple Silicon. Står det <em>Intel</em>, bruker du
          samme fil som Windows-folka.
        </p>
      </div>
    </div>
  );
}

function Ordliste() {
  return (
    <div className="my-6">
      <VisualDefs
        title="Tre ord du møter underveis"
        items={[
          {
            term: "ISO",
            icon: <IsoDiscIcon />,
            body: "Et disk-image på ISO-format — en eneste stor fil som inneholder hele innholdet av en DVD. Ubuntu kommer som en ISO-fil du laster ned (~5 GB).",
          },
          {
            term: "Disk-image",
            icon: <DiskImageIcon />,
            body: "Generelt: en fil som lar som en hel disk. ISO er én type. VM-ens virtuelle harddisk (en .vdi-fil) er en annen type — en kjempefil som later som om den er en 25 GB hard-disk inne i VM-en.",
          },
          {
            term: "RAM-allokering",
            icon: <RamChipIcon />,
            body: "Hvor mye av din ekte RAM (arbeids-minne, gjerne 8 eller 16 GB totalt) som VM-en får låne mens den kjører. Du gir bort en bit, beholder resten selv. Tar du for mye, sloves host. Tar du for lite, sloves guest.",
          },
        ]}
      />
    </div>
  );
}

type Steg = {
  nr: number;
  tittel: string;
  hva: string;
  vanligFeil: string;
  icon: React.ReactNode;
};

function Steg() {
  const [aapen, setAapen] = useState<number | null>(1);
  const steg: Steg[] = [
    {
      nr: 1,
      tittel: "Last ned VirtualBox",
      hva: "Gå til virtualbox.org → Downloads → velg pakken for ditt vert-OS (Windows, macOS Intel, macOS Apple Silicon, eller Linux). Kjør installeren med standard valg. Du må kanskje godkjenne en kernel-utvidelse i System Settings (macOS) eller Windows Defender.",
      vanligFeil:
        "På macOS: hvis installeren feiler stille, gå til Systeminnstillinger → Personvern og sikkerhet og godkjenn 'Oracle America Inc' nederst på siden. Start så installeren på nytt.",
      icon: <Download className="h-4 w-4" />,
    },
    {
      nr: 2,
      tittel: "Last ned Ubuntu-ISO — riktig arkitektur",
      hva: "Har du Windows, Linux eller en Intel-Mac: gå til ubuntu.com/download/desktop og last ned siste LTS-versjon (Long Term Support), altså «64-bit PC (AMD64) desktop image». Har du en Mac med M1/M2/M3/M4, skal du i stedet ha arm64-varianten — bruk lenka i Canvas. Filen er ~5 GB uansett. Lagre den et sted du finner igjen.",
      vanligFeil:
        "To feil å gå i her. (1) Feil arkitektur: en AMD64-fil booter ikke på Apple Silicon, og du får ingen forklarende feilmelding — bare en VM som ikke starter. (2) Feil utgave: laster du ned 'server' i stedet for 'desktop', får du ingen grafisk skjerm i det hele tatt.",
      icon: <Disc3 className="h-4 w-4" />,
    },
    {
      nr: 3,
      tittel: "Opprett ny VM i VirtualBox",
      hva: "Åpne VirtualBox. Klikk New. Gi den navn (f.eks. 'Ubuntu-forkurs'). Velg Type=Linux, Version=Ubuntu (64-bit). Pek den til ISO-en du nettopp lastet ned. På innstillingene under: minst 4096 MB RAM (8192 hvis du har 16+ GB totalt), 2 CPU-kjerner, 25 GB virtuell disk (dynamisk allokert), nettverk på NAT.",
      vanligFeil:
        "Hvis VirtualBox bare lar deg velge 32-bit Ubuntu, har du ikke skrudd på virtualisering i BIOS/UEFI. Søk 'enable virtualization BIOS [din PC-modell]' og restart. På Mac er dette på som standard. Bruker du UTM på Apple Silicon, velger du i stedet «Virtualize» (ikke «Emulate») og ARM64 som arkitektur — emulering av en Intel-maskin virker, men blir ubrukelig treg.",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      nr: 4,
      tittel: "Start VM-en og installer Ubuntu",
      hva: "Klikk Start. Ubuntu-installeren booter fra ISO-en. Velg språk (norsk eller engelsk — engelsk anbefales fordi feilmeldinger er lettere å google). Velg 'Erase disk and install Ubuntu' — det er trygt fordi 'disken' er bare en fil på host. Sett brukernavn, passord. Vent 10–20 minutter mens installasjonen kjører. Restart når den ber om det.",
      vanligFeil:
        "Når installeren sier 'remove the installation medium', betyr det å fjerne ISO-en. Det er ikke alltid nødvendig på VirtualBox — bare trykk Enter og den booter videre.",
      icon: <Power className="h-4 w-4" />,
    },
    {
      nr: 5,
      tittel: "Sett norsk tastatur",
      hva: "Ubuntu-installeren spør om tastaturoppsett, og standardvalget er amerikansk. Velg «Norwegian» der. Glemte du det, fikser du det etterpå: Settings → Keyboard → Input Sources → + → Norwegian. Legg gjerne igjen engelsk som andrevalg; du bytter med Super+mellomrom.",
      vanligFeil:
        "Med amerikansk oppsett ligger flere tegn du skal bruke mye et helt annet sted enn det står på tastene dine: rørtegnet |, bakstreken \\, krøllalfa @ og æ ø å. Rør og bakstrek er selve arbeidshestene i modul 2 og 4 — oppdager du dette først når du sitter fast midt i en kommando, tror du gjerne at kommandoen er feil og ikke tastaturet.",
      icon: <Keyboard className="h-4 w-4" />,
    },
    {
      nr: 6,
      tittel: "Installer Guest Additions",
      hva: "Etter første pålogging i Ubuntu: VirtualBox-menyen → Devices → Insert Guest Additions CD image. En CD dukker opp på Ubuntu-skrivebordet. Åpne en terminal (vi gjør dette i F-04) og kjør installeren. Gir deg bedre skjermoppløsning, mus-integrasjon, og kopier-mellom-host-og-guest.",
      vanligFeil:
        "Hvis installasjonen feiler med 'gcc not found', kjør først `sudo apt update && sudo apt install build-essential` i Ubuntu-terminalen, så prøv på nytt.",
      icon: <Package className="h-4 w-4" />,
    },
  ];
  return (
    <ol className="my-6 space-y-3">
      {steg.map((s) => {
        const erAapen = aapen === s.nr;
        return (
          <li key={s.nr} className="rounded-lg border border-border bg-card/30 overflow-hidden">
            <button
              onClick={() => setAapen(erAapen ? null : s.nr)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand text-xs font-mono font-semibold flex-shrink-0">
                {s.nr}
              </span>
              <span className="flex items-center gap-2 font-medium text-sm flex-1">
                {s.icon}
                {s.tittel}
              </span>
              <span className="text-xs text-muted-foreground">{erAapen ? "−" : "+"}</span>
            </button>
            {erAapen && (
              <div className="px-4 pb-4 pt-1 space-y-3 text-xs leading-relaxed">
                <div>
                  <div className="text-brand font-semibold mb-1">Hva du skal gjøre</div>
                  <p className="text-muted-foreground">{s.hva}</p>
                </div>
                <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3">
                  <div className="flex items-center gap-2 text-orange-300 font-semibold mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Vanlig feil
                  </div>
                  <p className="text-muted-foreground">{s.vanligFeil}</p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Resept() {
  const rader = [
    { ikon: <MemoryStick className="h-4 w-4" />, navn: "RAM", verdi: "4096 MB minimum · 8192 MB anbefalt" },
    { ikon: <Cpu className="h-4 w-4" />, navn: "CPU-kjerner", verdi: "2 minimum (host bør ha 4+)" },
    { ikon: <HardDrive className="h-4 w-4" />, navn: "Virtuell disk", verdi: "25 GB · dynamisk allokert (.vdi)" },
    { ikon: <Network className="h-4 w-4" />, navn: "Nettverk", verdi: "NAT (standard) — VM-en når internett, men er ikke synlig utenfra" },
    {
      ikon: <Disc3 className="h-4 w-4" />,
      navn: "ISO",
      verdi: "Ubuntu Desktop LTS (siste), AMD64 — eller arm64 på Apple Silicon",
    },
    {
      ikon: <Keyboard className="h-4 w-4" />,
      navn: "Tastatur",
      verdi: "Norwegian — velges under installasjonen",
    },
    { ikon: <Package className="h-4 w-4" />, navn: "Guest Additions", verdi: "Installeres etter første pålogging" },
  ];
  return (
    <div className="my-6 rounded-xl border border-brand/30 bg-brand/5 p-5">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Resept: standard forkurs-VM
      </div>
      <ul className="space-y-2 text-sm">
        {rader.map((r) => (
          <li key={r.navn} className="grid grid-cols-[auto_8rem_1fr] items-center gap-3 text-xs">
            <span className="text-brand">{r.ikon}</span>
            <span className="font-semibold">{r.navn}</span>
            <span className="text-muted-foreground">{r.verdi}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Disse innstillingene er konservative. Du kan øke dem senere — VirtualBox lar deg endre RAM og CPU mens VM-en er av.
      </p>
    </div>
  );
}

function SjekkFunker() {
  return (
    <div className="my-6 rounded-xl border border-border bg-card/30 p-5">
      <div className="text-sm leading-relaxed mb-4">
        Når alt er på plass og du booter VM-en, skal du møte dette:
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-gradient-to-b from-purple-950/40 to-purple-900/20 p-6 text-purple-100">
        <div className="text-center space-y-3">
          <div className="text-4xl">●</div>
          <div className="font-semibold text-sm">Velg konto</div>
          <div className="rounded-md bg-purple-900/40 border border-purple-500/30 px-3 py-2 text-xs inline-block">
            din-bruker
          </div>
          <div>
            <div className="text-xs text-purple-300/80 mb-1">Skriv inn passord</div>
            <div className="mx-auto w-40 h-6 rounded bg-purple-900/40 border border-purple-500/30" />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/5 p-3 text-xs">
        <div className="flex items-center gap-2 text-green-300 font-semibold mb-1">
          <CheckCircle2 className="h-4 w-4" /> Hvis du ser dette
        </div>
        <span className="text-muted-foreground">
          — gratulerer, du har en kjørende VM. Log inn med passordet du satte i steg 4. Du er klar for F-03.
        </span>
      </div>
      <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs">
        <div className="flex items-center gap-2 text-red-300 font-semibold mb-1">
          <AlertTriangle className="h-4 w-4" /> Hvis du fortsatt ser installer-veiviseren
        </div>
        <span className="text-muted-foreground">
          — ISO-en er fortsatt "satt inn". I VirtualBox: Devices → Optical Drives → fjern ISO. Restart VM.
        </span>
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Du har 8 GB RAM totalt på laptopen. Hvor mye gir du VM-en?",
      valg: [
        "7 GB — gi den så mye som mulig",
        "4 GB — halvparten er passe; host trenger også å puste",
        "1 GB — VM-er er små",
      ],
      riktig: 1,
      forklaring:
        "Tommelfingerregel: gi VM-en halvparten av host sin RAM, og aldri mer enn 75 %. 4 GB av 8 GB lar både host og guest fungere. Med 16 GB host kan du gi 8 GB.",
    },
    {
      q: "Hva er forskjellen på ISO-filen og den virtuelle disken (.vdi)?",
      valg: [
        "ISO er hardware, .vdi er software",
        "ISO er installasjons-mediumet (som en DVD); .vdi er VM-ens harddisk der Ubuntu lagres etter installasjon",
        "Det er to navn på samme fil",
      ],
      riktig: 1,
      forklaring:
        "ISO-en er nedlastet engang og brukes bare til å installere. .vdi er filen som vokser etter hvert som Ubuntu fyller den med filer — den ER VM-ens disk.",
    },
    {
      q: "Hvorfor velger vi NAT som nettverksmodus?",
      valg: [
        "Det er den eneste som funker",
        "NAT lar VM-en nå internett, men holder den usynlig fra resten av nettet — trygt og enkelt for læring",
        "NAT gir høyere hastighet enn alle andre alternativer",
      ],
      riktig: 1,
      forklaring:
        "NAT gjør VM-en til en 'klient bak vert-OS-et'. Den når ut, men ingen pakker når inn uforespurt. Senere i datakomm-faget bytter du til Bridged eller Host-only for spesifikke eksperimenter.",
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
        Du har nå en kjørende Ubuntu-VM. Før du gjør noe destruktivt i den, lær snapshot-funksjonen — det er sikkerhetsnettet som gjør at du kan eksperimentere uten frykt.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f03-snapshots" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-03 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Snapshots og trygg eksperimentering
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
        Denne biten åpner opp for: <code className="text-brand">F-03</code> (snapshots),{" "}
        <code className="text-brand">F-04</code> (terminal),{" "}
        <code className="text-brand">OS-02</code> (kernel vs userspace — krever Linux å se),{" "}
        <code className="text-brand">DK-01</code> (når du skal sniffe trafikk).
      </div>
    </div>
  );
}
