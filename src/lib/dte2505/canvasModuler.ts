/**
 * DTE-2505 Operativsystemer — Canvas-modulene som én kilde til sannhet.
 *
 * Tabellen under er verifisert mot UiT Canvas 2026-08-16. Alt annet i appen som
 * snakker om «modul» eller «oblig» i DTE-2505 skal lese herfra, ikke ha sin egen
 * nummerering. (Det var nettopp doble nummereringer som gjorde at
 * `ObligerHub.tsx` viste feil oblig-numre uten frister.)
 *
 * Merk fra Canvas: «Oblig 1.3 gis ikke i år.» Punkt 1.3 i modul 1b — å installere
 * programmer fra andre kilder enn standard-pakkelageret — er fortsatt pensum, men
 * det gis ingen innlevering på det.
 *
 * Rettelser 2026-08-16 mot gjennomgangen 2026-08-08, som hadde fem av sju frister
 * feil. Fasit fra Canvas: 1.1 → 28.08, 1.2 → 30.08, 2 → 13.09, 3 → 27.09,
 * 4 → 11.10, 5 → 25.10. Alle obligfrister faller på en søndag; det er et nyttig
 * sanity-sjekk hvis noen skal legge inn en frist til senere.
 */

/** Én obligatorisk innlevering, slik den står i Canvas. */
export interface Oblig {
  /** Canvas-nummeret, f.eks. "1.1" eller "3". */
  nummer: string;
  tittel: string;
  poeng: number;
  /** ISO-dato (frist er alltid kl. 23:59 samme dag). */
  frist: string;
  /** Slug i speil-obligene (`/stack/dte2505-obliger`) som øver på denne. */
  ovingId?: string;
}

/** Hvor sikre vi er på at appen faktisk dekker modulen. */
export type Dekning =
  | "dekket" // Modulen har fullverdig innhold i appen.
  | "delvis" // Noe finnes, men et navngitt punkt mangler.
  | "hull"; // Ingenting bygget ennå — skal vises, ikke skjules.

/** En lenke til eksisterende innhold i appen. */
export interface ModulLenke {
  /**
   * `stack`   → /stack/<slug>       (leksjoner og labs)
   * `forkurs` → /forkurs/<slug>     (forkurs-bitene F01–F11)
   * `rute`    → en egen rute, full sti oppgitt i `slug`
   */
  type: "stack" | "forkurs" | "rute";
  slug: string;
  label: string;
  /** Én linje om hva akkurat denne lenken dekker i modulen. */
  dekker: string;
  /**
   * Settes når innholdet ikke er bygget ennå (f.eks. modul 2). Da rendres kortet
   * som «kommer», ikke som en død lenke.
   */
  kommer?: boolean;
}

/** Stoff som går ut over Canvas-pensum — holdes visuelt adskilt. */
export interface DypereLenke {
  slug: string;
  label: string;
  /** Én setning om hvorfor det er verdt tiden. Ikke «fordi det er gøy». */
  hvorfor: string;
}

export interface CanvasModul {
  /** Canvas-ID: "1a", "1b", "2" … "6". */
  id: string;
  tittel: string;
  /** Én setning: hva modulen handler om. Vises alltid. */
  kortOm: string;
  /** 3–5 konkrete ting du skal kunne etterpå. Vises i kortet. */
  maal: string[];
  dekning: Dekning;
  /** Hva som mangler — kun satt når dekning er "delvis" eller "hull". */
  mangler?: string;
  /**
   * Når modulen låses opp i Canvas, som ISO-tidspunkt («2026-08-24T09:00»).
   * Utelatt der Canvas ikke oppgir en dato — modul 1a/1b er styrt av
   * forhåndskrav, ikke klokka, og modul 6 har ingen dato oppgitt ennå.
   */
  apnes?: string;
  /**
   * Modulene Canvas krever ferdige før denne åpner, som modul-ID-er.
   * Canvas kaller dette «Forhåndskrav».
   */
  forhaandskrav?: string[];
  lenker: ModulLenke[];
  obliger: Oblig[];
  dypere: DypereLenke[];
}

export const CANVAS_MODULER: CanvasModul[] = [
  {
    id: "1a",
    tittel: "Linux og operativsystemer",
    kortOm:
      "Ren teori-modul: hva et operativsystem er, hva det gjør for deg, og hvorfor Linux ser ut som det gjør.",
    maal: [
      "Forklare hva et operativsystem gjør som programmene dine slipper å gjøre selv",
      "Skille kjernen (kernel — den delen som eier maskinvaren) fra brukerrommet der vanlige programmer kjører",
      "Plassere Linux i familien av operativsystemer, og si hva som skiller en monolittisk kjerne fra en mikrokjerne",
    ],
    dekning: "dekket",
    lenker: [
      {
        type: "stack",
        slug: "os-grunnlag",
        label: "OS-grunnlag",
        dekker: "Kjerne mot brukerrom, prosesser, systemkall — den mentale modellen alt annet henger på.",
      },
      {
        type: "stack",
        slug: "dte2505-os-typologi",
        label: "OS-typologi",
        dekker: "Hvilke slags operativsystemer finnes: sanntid, innebygd, flerbruker, distribuert.",
      },
      {
        type: "stack",
        slug: "os-historikk",
        label: "OS-historikk",
        dekker: "Hvorfor Unix og Linux ble som de ble — batch, timesharing, personlige maskiner.",
      },
      {
        type: "stack",
        slug: "microkernel-arkitektur",
        label: "Mikrokjerne mot monolitt",
        dekker: "Splittskjerm-simulator: samme systemkall gjennom en monolittisk kjerne og en mikrokjerne.",
      },
    ],
    obliger: [],
    dypere: [],
  },
  {
    id: "1b",
    tittel: "Installasjon av Linux, programmer og oppdateringer",
    kortOm:
      "Få Linux opp å kjøre i en virtuell maskin (en datamaskin simulert i programvare), og lær å installere og oppdatere programmer.",
    maal: [
      "Installere Linux i en virtuell maskin og ta et gjenopprettingspunkt (snapshot) før du roter det til",
      "Installere, oppdatere og fjerne programmer med pakkeverktøyet apt (Advanced Package Tool)",
      "Skille «oppdater pakkelista» fra «oppgrader pakkene» — to helt ulike kommandoer",
    ],
    dekning: "dekket",
    lenker: [
      {
        type: "stack",
        slug: "dte2505-pakkekilder",
        label: "Programvare fra andre kilder (punkt 1.3)",
        dekker:
          "Pakkearkiv og sources.list, PPA (Personal Package Archive), add-apt-repository, løse .deb-filer med dpkg mot apt, snap og flatpak, og GPG-signeringsnøkler. Pensum, men uten oblig i år.",
      },
      {
        type: "forkurs",
        slug: "f01-virtualisering",
        label: "F01 — Virtualisering",
        dekker: "Hva en virtuell maskin er, og hvorfor du kjører Linux i en boks oppå din vanlige maskin.",
      },
      {
        type: "forkurs",
        slug: "f02-installer-vm",
        label: "F02 — Installer den virtuelle maskinen",
        dekker: "Selve installasjonen steg for steg — det obligen 1.1 ber om.",
      },
      {
        type: "forkurs",
        slug: "f03-snapshots",
        label: "F03 — Snapshots",
        dekker: "Gjenopprettingspunkt før du eksperimenterer. Sparer deg for en ny installasjon.",
      },
      {
        type: "stack",
        slug: "linux-bruk",
        label: "Linux-bruk (pakkehåndtering)",
        dekker: "Avsnittet om apt: update mot upgrade, install, remove mot purge, søk i pakkelista.",
      },
      {
        type: "stack",
        slug: "virtualisering",
        label: "Virtualisering",
        dekker: "Virtuell maskin mot container, hypervisor type 1 og 2 — konseptet bak F01.",
      },
    ],
    obliger: [
      {
        nummer: "1.1",
        tittel: "Installasjon av Linux",
        poeng: 5,
        frist: "2026-08-28",
        ovingId: "o1-1-installasjon",
      },
      {
        nummer: "1.2",
        tittel: "Installere og oppdatere programmer",
        poeng: 5,
        frist: "2026-08-30",
        ovingId: "o1-2-programmer",
      },
    ],
    dypere: [
      {
        slug: "dte2505-virtualisering",
        label: "Hypervisor og containere i dybden",
        hvorfor:
          "Forklarer hvorfor den virtuelle maskinen din er treg og containere ikke er det — namespaces og cgroups mot full maskinvare-emulering.",
      },
    ],
  },
  {
    id: "2",
    tittel: "Kommandobasert bruk, hjelpesystemer og dokumentasjon",
    kortOm:
      "Å finne svaret selv: manualsidene (man), innebygd hjelp, og hvordan du slår opp en kommando du aldri har sett før.",
    maal: [
      "Lese en manualside og vite hva de nummererte seksjonene betyr",
      "Finne riktig kommando når du bare vet hva du vil oppnå (apropos, whatis)",
      "Bruke --help og info som raskere alternativ når du bare mangler ett flagg",
    ],
    dekning: "dekket",
    apnes: "2026-08-24T09:00",
    forhaandskrav: ["1a", "1b"],
    lenker: [
      {
        type: "stack",
        slug: "dte2505-hjelpesystemer",
        label: "Hjelpesystemer og dokumentasjon",
        dekker: "Den dedikerte modulen for man, info, apropos, whatis og --help.",
      },
      {
        type: "stack",
        slug: "linux-bruk",
        label: "Linux-bruk",
        dekker: "Delvis dekning: kommandolinja generelt, navigasjon og filkommandoer.",
      },
      {
        type: "stack",
        slug: "linux-cli-advanced",
        label: "Linux-kommandolinje viderekommen",
        dekker: "Delvis dekning: sed, awk, find, xargs, strace, lsof — kommandoene du får bruk for å slå opp.",
      },
    ],
    obliger: [
      {
        nummer: "2",
        tittel: "Kommandobasert",
        poeng: 10,
        frist: "2026-09-13",
        ovingId: "o2-kommandobasert",
      },
    ],
    dypere: [],
  },
  {
    id: "3",
    tittel: "Prosesser",
    kortOm:
      "Et program som kjører er en prosess. Modulen handler om hvordan de startes, stoppes, venter, snakker sammen og deler prosessoren.",
    maal: [
      "Liste og filtrere kjørende prosesser, og lese hva kolonnene betyr",
      "Sende signaler til en prosess og forklare forskjellen på et signal den kan avvise og ett den ikke kan",
      "Følge en prosess gjennom tilstandene ny, kjørende, ventende og avsluttet",
      "Forklare hvordan operativsystemet bytter mellom prosesser (kontekstbytte)",
    ],
    dekning: "dekket",
    apnes: "2026-09-07T14:00",
    forhaandskrav: ["2"],
    lenker: [
      {
        type: "stack",
        slug: "dte2505-prosesser-signaler",
        label: "Prosesser og signaler",
        dekker: "Prosess-overvåker du kan klikke i: send SIGTERM mot SIGKILL og se forskjellen live.",
      },
      {
        type: "stack",
        slug: "dte2505-thread-state",
        label: "Tilstandsmaskin for tråder",
        dekker: "Klikk gjennom overgangene ny → kjørende → ventende → avsluttet, og se køene fylles.",
      },
      {
        type: "stack",
        slug: "dte2505-thread-vs-prosess",
        label: "Tråd mot prosess",
        dekker: "Animert minnebilde: hva som kopieres ved fork() og hva som deles mellom tråder.",
      },
      {
        type: "stack",
        slug: "dte2505-kontekstbytte",
        label: "Kontekstbytte",
        dekker: "Register for register gjennom lagring og gjenoppretting av prosessens tilstand.",
      },
      {
        type: "stack",
        slug: "dte2505-ipc",
        label: "IPC — kommunikasjon mellom prosesser",
        dekker: "IPC står for Inter-Process Communication. Dataflyt via rør (pipe), delt minne og meldingskø.",
      },
      {
        type: "stack",
        slug: "dte2505-scheduling-drill",
        label: "Prosessorplanlegging — Gantt-drill",
        dekker: "Hvem får prosessoren når: FIFO, SJF, STCF, Round-Robin og MLFQ i en interaktiv tidslinje.",
      },
    ],
    obliger: [
      {
        nummer: "3",
        tittel: "Prosesser",
        poeng: 10,
        frist: "2026-09-27",
        ovingId: "o3-prosesser",
      },
    ],
    dypere: [
      {
        slug: "dte2505-virtuelt-minne",
        label: "Virtuelt minne og sidedeling",
        hvorfor:
          "Forklarer hvorfor to prosesser kan bruke samme adresse uten å kollidere — grunnlaget under isolasjonen du tar for gitt.",
      },
      {
        slug: "dte2505-segmentation",
        label: "Segmentering",
        hvorfor:
          "Den eldre måten å dele opp minnet på. Gjør det tydelig hvilket problem sidedeling faktisk løste.",
      },
      {
        slug: "dte2505-konkurrens",
        label: "Samtidighet og vranglås",
        hvorfor:
          "Når to prosesser rører samme data samtidig. Vranglås (deadlock) er den klassiske feilen ingen ser i koden sin.",
      },
      {
        slug: "dte2505-event-loop",
        label: "Hendelsesløkke",
        hvorfor:
          "Alternativet til tråder: én prosess som håndterer tusenvis av samtidige oppgaver. Slik fungerer moderne servere.",
      },
    ],
  },
  {
    id: "4",
    tittel: "Filsystem og skallet",
    kortOm:
      "Hvor filene bor, hvordan de egentlig lagres, og hvordan skallet (kommandotolkeren) kobler kommandoer sammen med rør og omdirigering.",
    maal: [
      "Navigere filsystemet og vite hva de store katalogene under / er til for",
      "Forklare hva en inode er, og hvorfor et filnavn ikke er det samme som fila",
      "Skille harde lenker fra symbolske lenker",
      "Omdirigere inn- og utdata, og koble kommandoer sammen med rør (pipe)",
    ],
    dekning: "dekket",
    apnes: "2026-09-14T06:00",
    forhaandskrav: ["3"],
    lenker: [
      {
        type: "stack",
        slug: "dte2505-filsystem",
        label: "Filsystem — inode og blokk",
        dekker: "Hva en inode er, hvordan navn og data er adskilt, harde lenker mot symbolske lenker.",
      },
      {
        type: "stack",
        slug: "linux-bruk",
        label: "Linux-bruk",
        dekker: "Katalogstandarden FHS (Filesystem Hierarchy Standard), navigasjon og filkommandoer.",
      },
      {
        type: "stack",
        slug: "shell-scripting",
        label: "Skallprogrammering",
        dekker: "Rør, omdirigering av inn- og utdata, og avslutningskoder — skallets kjernemekanikk.",
      },
      {
        type: "stack",
        slug: "dte2505-bash-scripts",
        label: "Bash-blokk med etterlignet filsystem",
        dekker: "Skriv kommandoer, kjør dem mot et etterlignet filsystem, sammenlign utdata mot fasit.",
      },
      {
        type: "rute",
        slug: "/dte2505/shell-drill",
        label: "Skall-drill — 30+ scenarier",
        dekker: "Skriv kommandoen som løser scenariet. Godtar flaggene i vilkårlig rekkefølge.",
      },
    ],
    obliger: [
      {
        nummer: "4",
        tittel: "Skall og filsystem",
        poeng: 10,
        frist: "2026-10-11",
        ovingId: "o4-skall-filsystem",
      },
    ],
    dypere: [
      {
        slug: "dte2505-lagring",
        label: "Lagringsmedier — harddisk, SSD og NVMe",
        hvorfor:
          "Fysikken under filsystemet: hvorfor tilfeldig lesing er dyrt på en harddisk og nesten gratis på en SSD.",
      },
      {
        slug: "dte2505-io-management",
        label: "Inn- og utdatahåndtering",
        hvorfor:
          "Veien fra systemkall til maskinvare: drivere, avbrudd og DMA (Direct Memory Access — maskinvare som flytter data uten å plage prosessoren).",
      },
      {
        slug: "dte2505-lfs",
        label: "Loggstrukturert filsystem",
        hvorfor:
          "Et filsystem som bare skriver framover. Viser at inode-modellen du nettopp lærte ikke er den eneste mulige.",
      },
    ],
  },
  {
    id: "5",
    tittel: "Tilgangsrettigheter og skallprogram",
    kortOm:
      "Hvem får lov til hva, og hvordan du automatiserer arbeidet ditt med skript i skallet.",
    maal: [
      "Lese og sette rettigheter både som tall (oktalt) og som bokstaver (symbolsk)",
      "Endre eier og gruppe på filer, og forklare hva umask gjør med nye filer",
      "Forklare hva setuid, setgid og sticky-biten gjør — og hvorfor de er sikkerhetsfeller",
      "Skrive et skallskript med variabler, tester, løkker og avslutningskode",
    ],
    dekning: "dekket",
    apnes: "2026-09-14T09:00",
    forhaandskrav: ["4"],
    lenker: [
      {
        type: "stack",
        slug: "brukere-rettigheter",
        label: "Brukere og rettigheter",
        dekker: "useradd, /etc/passwd, su mot sudo, rwx, chmod i begge notasjoner, chown og umask.",
      },
      {
        type: "stack",
        slug: "dte2505-spesialbits",
        label: "Spesialbits — setuid, setgid, sticky",
        dekker: "Hva 4755 og 1777 faktisk betyr, og hvorfor /tmp har sticky-biten satt.",
      },
      {
        type: "stack",
        slug: "dte2505-rwx-kalkulator",
        label: "rwx-kalkulator",
        dekker: "Klikk i et rutenett av ni biter og se oktaltallet og ls-strengen oppdatere seg live.",
      },
      {
        type: "stack",
        slug: "shell-scripting",
        label: "Skallprogrammering",
        dekker: "Variabler, if, for, while, avslutningskoder og de vanligste driftsskriptene.",
      },
      {
        type: "stack",
        slug: "dte2505-bash-scripts",
        label: "Bash-blokk med etterlignet filsystem",
        dekker: "Skriv hele skript og kjør dem — det obligen 5 ber om, uten å risikere din egen maskin.",
      },
    ],
    obliger: [
      {
        nummer: "5",
        tittel: "Rettigheter og skallprogram",
        poeng: 10,
        frist: "2026-10-25",
        ovingId: "o5-rettigheter-skallprogram",
      },
    ],
    dypere: [],
  },
  {
    id: "6",
    tittel: "Diverse — vi/vim, X og SSH",
    kortOm:
      "Tre løse tråder til slutt: teksteditoren vi, det grafiske systemet X, og innlogging på en maskin over nettet med SSH.",
    maal: [
      "Redigere en fil i vi/vim (Vi Improved — teksteditoren som alltid finnes på en Linux-maskin) og komme deg ut igjen",
      "Forklare hva X (X Window System — grunnlaget under det grafiske skrivebordet i Linux) gjør, og hvorfor det er delt i klient og tjener",
      "Logge inn på en annen maskin med SSH (Secure Shell) og bruke nøkler i stedet for passord",
    ],
    dekning: "dekket",
    forhaandskrav: ["2"],
    lenker: [
      {
        type: "stack",
        slug: "dte2505-diverse",
        label: "Diverse — vi/vim, X og SSH",
        dekker:
          "Hele modulen: vim-modussimulator (normal, insert, visual, kommandolinje), X-modellen med DISPLAY og X-videresending, Wayland, og SSH med nøkkelpar, ssh-agent, config, scp og sftp.",
      },
      {
        type: "stack",
        slug: "linux-cli-advanced",
        label: "Linux-kommandolinje viderekommen",
        dekker: "Nevner SSH i forbifarten. Dekker ikke vi/vim eller X i det hele tatt.",
      },
    ],
    obliger: [],
    dypere: [],
  },
];

/** Alle stack-slugs i en modul — det framdriften telles over. */
export function stackSlugsFor(modul: CanvasModul): string[] {
  return modul.lenker
    .filter((l) => l.type === "stack" && !l.kommer)
    .map((l) => l.slug);
}

/** Alle obliger på tvers av modulene, sortert på frist. */
export function alleObliger(): { modul: CanvasModul; oblig: Oblig }[] {
  return CANVAS_MODULER.flatMap((modul) =>
    modul.obliger.map((oblig) => ({ modul, oblig })),
  ).sort((a, b) => a.oblig.frist.localeCompare(b.oblig.frist));
}

/** Norsk datoformat, f.eks. "28.08.2026". */
export function formatFrist(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/**
 * Hele dager fra `naa` til fristen (som er 23:59 fristdagen). Negativt tall
 * betyr at fristen har passert.
 */
export function dagerTil(iso: string, naa: Date = new Date()): number {
  const frist = new Date(`${iso}T23:59:00`);
  const idag = new Date(naa.getFullYear(), naa.getMonth(), naa.getDate());
  return Math.ceil((frist.getTime() - idag.getTime()) / 86_400_000) - 1;
}

/** Total poengsum på tvers av alle obliger — 60 i år. */
export function totalPoeng(): number {
  return alleObliger().reduce((sum, { oblig }) => sum + oblig.poeng, 0);
}

/**
 * Er modulen åpnet i Canvas ennå? Moduler uten `apnes` regnes som åpne —
 * de er styrt av forhåndskrav, ikke av klokka, og appen har uansett ikke
 * tilgang til om du har huket av forhåndskravene.
 */
export function erApen(modul: CanvasModul, naa: Date = new Date()): boolean {
  if (!modul.apnes) return true;
  return naa.getTime() >= new Date(modul.apnes).getTime();
}

/** Modulene du faktisk kan begynne på i dag. */
export function apneModuler(naa: Date = new Date()): CanvasModul[] {
  return CANVAS_MODULER.filter((m) => erApen(m, naa));
}

/** Norsk dato og klokkeslett for et `apnes`-tidspunkt, f.eks. "24.08 kl. 09:00". */
export function formatApnes(iso: string): string {
  const [dato, tid = "00:00"] = iso.split("T");
  const [, m, d] = dato.split("-");
  return `${d}.${m} kl. ${tid}`;
}
