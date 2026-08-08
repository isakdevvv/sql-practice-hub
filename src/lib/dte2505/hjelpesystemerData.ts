// ---------------------------------------------------------------------------
// DTE-2505 Modul 2 — hjelpesystemer og dokumentasjon.
//
// Alt her er en MOCK. Det finnes ingen ekte manualdatabase i nettleseren, så vi
// skriver realistiske, forkortede manualsider som data. Kilden er hvordan de
// virkelige sidene ser ut på et Debian/Ubuntu-system, men teksten er skrevet om
// og kortet ned kraftig.
//
// Ordforklaring som brukes gjennom hele modulen (ingen uforklarte forkortelser):
//   man     = "manual"  — systemets innebygde oppslagsverk
//   apropos = latin for "angående" — fritekstsøk i manualens beskrivelser
//   whatis  = "what is" — énlinjes oppslag på eksakt navn
// ---------------------------------------------------------------------------

/** Seksjonsnumrene i manualen. En manualside identifiseres av navn + seksjon. */
export type ManSectionNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ManSectionInfo {
  num: ManSectionNum;
  /** Kort norsk navn brukt i grensesnittet. */
  title: string;
  /** Det engelske navnet du faktisk ser på et Linux-system. */
  english: string;
  /** Én setning om hva slags sider som bor her. */
  blurb: string;
  /** Et konkret eksempel-oppslag. */
  example: string;
}

export const MAN_SECTIONS: ManSectionInfo[] = [
  {
    num: 1,
    title: "Brukerkommandoer",
    english: "User commands",
    blurb:
      "Programmer du kan kjøre som helt vanlig bruker fra skallet. Dette er den største seksjonen, og den man treffer oftest.",
    example: "man 1 ls",
  },
  {
    num: 2,
    title: "Systemkall",
    english: "System calls",
    blurb:
      "Funksjonene et program bruker for å be kjernen (operativsystemets innerste del) om noe: åpne fil, lage prosess, sende signal. Skrevet for C-programmerere, ikke for skallet.",
    example: "man 2 open",
  },
  {
    num: 3,
    title: "Bibliotekfunksjoner",
    english: "Library functions",
    blurb:
      "Funksjoner som følger med C-biblioteket, altså kode som kjører i ditt eget program uten å gå via kjernen. Her bor blant annet printf().",
    example: "man 3 printf",
  },
  {
    num: 4,
    title: "Enhetsfiler",
    english: "Special files / devices",
    blurb:
      "Filene under /dev som representerer maskinvare og pseudo-enheter. /dev/null og /dev/random hører hjemme her.",
    example: "man 4 null",
  },
  {
    num: 5,
    title: "Filformater og konfigurasjon",
    english: "File formats and conventions",
    blurb:
      "Hvordan innholdet i en konfigurasjonsfil er bygget opp — kolonner, felt, syntaks. /etc/passwd og /etc/fstab dokumenteres her.",
    example: "man 5 passwd",
  },
  {
    num: 6,
    title: "Spill",
    english: "Games",
    blurb:
      "Spill og annet moro som fulgte med Unix. Sjelden i bruk, men seksjonen finnes fortsatt og dukker opp i søketreff.",
    example: "man 6 fortune",
  },
  {
    num: 7,
    title: "Diverse og konvensjoner",
    english: "Miscellaneous",
    blurb:
      "Oversiktssider som ikke er ett program: tegnsett, signaloversikter, filsystemhierarkiet, protokoller. Ofte de mest lærerike sidene i hele manualen.",
    example: "man 7 signal",
  },
  {
    num: 8,
    title: "Systemadministrasjon",
    english: "System administration",
    blurb:
      "Kommandoer du normalt må være rot-bruker (administrator) for å kjøre: montere filsystemer, opprette brukere, oppdatere manualdatabasen.",
    example: "man 8 mount",
  },
];

export function sectionInfo(num: ManSectionNum): ManSectionInfo {
  return MAN_SECTIONS.find((s) => s.num === num)!;
}

// ---------------------------------------------------------------------------
// SYNOPSIS-notasjon
// ---------------------------------------------------------------------------

/**
 * Et klikkbart element i SYNOPSIS-linja. Poenget med å modellere synopsis som
 * tokens i stedet for én streng er at studenten skal kunne trykke på `[...]`
 * og få vite hva klammene betyr, i stedet for å gjette.
 */
export type SynopsisKind =
  | "command" // selve kommandonavnet
  | "optional" // [ ... ] — kan sløyfes
  | "required" // må være med
  | "repeat" // ... — kan gjentas
  | "either" // | — enten-eller
  | "placeholder"; // FIL, MØNSTER — du skal fylle inn din egen verdi

export interface SynopsisToken {
  text: string;
  kind: SynopsisKind;
  /** Forklaringen som vises når studenten klikker på tokenet. */
  note: string;
}

/** Generell forklaring av notasjonen, vist ved siden av manualsiden. */
export const SYNOPSIS_LEGEND: { symbol: string; name: string; meaning: string; example: string }[] = [
  {
    symbol: "[ ]",
    name: "hakeparentes",
    meaning: "Valgfritt. Alt inni klammene kan sløyfes, og kommandoen virker likevel.",
    example: "ls [OPSJON]... betyr at ls uten et eneste flagg er lovlig.",
  },
  {
    symbol: "...",
    name: "ellipse",
    meaning: "Kan gjentas. Elementet foran kan stå én gang, mange ganger, eller (om det står i klammer) null ganger.",
    example: "ls [FIL]... betyr at du kan liste så mange filer du vil.",
  },
  {
    symbol: "|",
    name: "vertikal strek",
    meaning: "Enten-eller. Du velger nøyaktig én av alternativene på hver side av streken.",
    example: "chown EIER | EIER:GRUPPE — du oppgir enten bare eier, eller eier og gruppe.",
  },
  {
    symbol: "STORE BOKSTAVER",
    name: "plassholder",
    meaning:
      "Ikke skriv dette ordet bokstavelig. Det er en plass der du fyller inn din egen verdi — et filnavn, et brukernavn, et mønster.",
    example: "I chown EIER FIL skriver du chown kari rapport.txt.",
  },
  {
    symbol: "fet skrift",
    name: "bokstavelig tekst",
    meaning: "Skrives nøyaktig slik det står, inkludert bindestrekene. Kommandonavnet og flaggene er alltid slik.",
    example: "I ls --all skriver du --all bokstavelig.",
  },
];

// ---------------------------------------------------------------------------
// Manualsidene (forkortet, men strukturelt ekte)
// ---------------------------------------------------------------------------

export interface ManOption {
  /** Kortform, f.eks. "-l". Tom streng hvis flagget kun finnes i langform. */
  short: string;
  /** Langform, f.eks. "--all". Tom streng hvis flagget kun finnes i kortform. */
  long: string;
  text: string;
}

export interface ManExample {
  cmd: string;
  text: string;
}

export interface MockManPage {
  /** "passwd.5" — navn og seksjon, som er den ekte identiteten til en side. */
  id: string;
  name: string;
  section: ManSectionNum;
  /** NAME-linja, som også er det whatis og apropos viser. */
  oneLiner: string;
  synopsis: SynopsisToken[][];
  description: string[];
  options: ManOption[];
  examples: ManExample[];
  seeAlso: string[];
}

const t = (text: string, kind: SynopsisKind, note: string): SynopsisToken => ({ text, kind, note });

const CMD = (name: string) =>
  t(name, "command", `Selve kommandonavnet. Skrives alltid nøyaktig slik, som første ord på linja.`);

export const MAN_PAGES: MockManPage[] = [
  // ---- passwd(1) ---------------------------------------------------------
  {
    id: "passwd.1",
    name: "passwd",
    section: 1,
    oneLiner: "endre passordet til en bruker",
    synopsis: [
      [
        CMD("passwd"),
        t("[OPSJON]...", "optional", "Null eller flere flagg. Klammene sier valgfritt, ellipsen sier gjentakbart."),
        t("[BRUKER]", "optional", "Brukernavnet er valgfritt. Sløyfer du det, endrer du ditt eget passord."),
      ],
    ],
    description: [
      "passwd endrer passordet til en brukerkonto. En vanlig bruker kan bare endre sitt eget passord, og må først skrive det gamle. Rot-brukeren (administratoren) kan endre passordet til hvem som helst uten å kunne det gamle.",
      "Kommandoen skriver ikke selv inn i /etc/passwd der passordet en gang lå. På moderne systemer ligger det krypterte passordet i /etc/shadow, som bare rot kan lese.",
    ],
    options: [
      { short: "-d", long: "--delete", text: "Fjern passordet til kontoen. Kontoen blir passordløs — nesten alltid en dårlig idé." },
      { short: "-l", long: "--lock", text: "Lås kontoen. Passordinnlogging blir umulig til den låses opp igjen." },
      { short: "-u", long: "--unlock", text: "Lås opp en konto som ble låst med -l." },
      { short: "-S", long: "--status", text: "Vis status for kontoen: låst, gyldig passord, eller passordløs." },
      { short: "-e", long: "--expire", text: "Merk passordet som utløpt, slik at brukeren må velge nytt ved neste innlogging." },
    ],
    examples: [
      { cmd: "passwd", text: "Endre ditt eget passord. Du blir bedt om det gamle først." },
      { cmd: "passwd kari", text: "Endre passordet til brukeren kari. Krever rot-rettigheter." },
      { cmd: "passwd -S kari", text: "Vis om kari sin konto er låst eller har gyldig passord." },
    ],
    seeAlso: ["passwd(5)", "shadow(5)", "chpasswd(8)", "useradd(8)"],
  },

  // ---- passwd(5) ---------------------------------------------------------
  {
    id: "passwd.5",
    name: "passwd",
    section: 5,
    oneLiner: "brukerdatabasen /etc/passwd og formatet dens",
    synopsis: [[t("/etc/passwd", "required", "Denne siden dokumenterer en FIL, ikke en kommando. Derfor er «synopsis» bare filbanen.")]],
    description: [
      "/etc/passwd er en ren tekstfil med én linje per brukerkonto. Feltene er skilt med kolon, og rekkefølgen er alltid den samme:",
      "brukernavn:passordfelt:brukerid:gruppeid:beskrivelse:hjemmekatalog:innloggingsskall",
      "Passordfeltet inneholder i dag nesten alltid tegnet x. Det betyr «det ekte, krypterte passordet står i /etc/shadow». Grunnen er at /etc/passwd må være lesbar for alle programmer som skal slå opp brukernavn, mens passordhashene ikke skal være det.",
      "Filen kan leses av alle brukere, men skrives bare av rot.",
    ],
    options: [],
    examples: [
      { cmd: "kari:x:1001:1001:Kari Nordmann:/home/kari:/bin/bash", text: "En typisk linje. Brukerid og gruppeid er begge 1001, og skallet er bash." },
      { cmd: "root:x:0:0:root:/root:/bin/bash", text: "Rot-brukeren har alltid brukerid 0. Det er tallet, ikke navnet, som gir full makt." },
    ],
    seeAlso: ["passwd(1)", "shadow(5)", "group(5)", "getent(1)"],
  },

  // ---- chown(1) ----------------------------------------------------------
  {
    id: "chown.1",
    name: "chown",
    section: 1,
    oneLiner: "endre eier og gruppe på en fil",
    synopsis: [
      [
        CMD("chown"),
        t("[OPSJON]...", "optional", "Valgfrie flagg, gjentakbare."),
        t("EIER", "placeholder", "Plassholder: her skriver du et brukernavn eller en brukerid, ikke ordet EIER."),
        t("|", "either", "Enten-eller. Du velger nøyaktig ett av alternativene på hver side av streken."),
        t("EIER:GRUPPE", "placeholder", "Alternativ form: eier og gruppe i samme argument, skilt med kolon."),
        t("FIL", "placeholder", "Plassholder for filen du vil endre."),
        t("...", "repeat", "Ellipse: du kan liste flere filer etter hverandre."),
      ],
    ],
    description: [
      "chown endrer hvilken bruker som eier en fil, og eventuelt hvilken gruppe den tilhører. Bare rot kan gi bort en fil til en annen bruker.",
      "Navnet kommer fra «change owner». Søsterkommandoen chgrp endrer bare gruppen, og chmod endrer rettighetsbitene.",
    ],
    options: [
      { short: "-R", long: "--recursive", text: "Gå gjennom kataloger rekursivt, altså også alt som ligger inni dem." },
      { short: "-v", long: "--verbose", text: "Skriv en linje per fil som endres." },
      { short: "", long: "--reference=RFIL", text: "Bruk eier og gruppe fra RFIL i stedet for å oppgi dem selv." },
      { short: "-h", long: "--no-dereference", text: "Endre selve symbolske lenken, ikke filen den peker på." },
    ],
    examples: [
      { cmd: "chown kari rapport.txt", text: "Gi filen rapport.txt til brukeren kari." },
      { cmd: "chown kari:studenter rapport.txt", text: "Sett både eier (kari) og gruppe (studenter)." },
      { cmd: "chown -R kari /home/kari", text: "Sett kari som eier av hele hjemmekatalogen, rekursivt." },
    ],
    seeAlso: ["chown(2)", "chgrp(1)", "chmod(1)", "ls(1)"],
  },

  // ---- ls(1) -------------------------------------------------------------
  {
    id: "ls.1",
    name: "ls",
    section: 1,
    oneLiner: "list innholdet i en katalog",
    synopsis: [
      [
        CMD("ls"),
        t("[OPSJON]...", "optional", "Klammer = valgfritt, ellipse = gjentakbart. ls helt uten flagg er lovlig."),
        t("[FIL]...", "optional", "Null eller flere filer eller kataloger. Uten argument brukes katalogen du står i."),
      ],
    ],
    description: [
      "ls lister innholdet i en katalog. Uten argumenter lister den katalogen du står i, sortert alfabetisk, og skjuler filer som begynner med punktum.",
      "ls er kommandoen der forskjellen mellom kortflagg og langflagg er lettest å se: -a og --all er nøyaktig samme flagg, skrevet på to måter.",
    ],
    options: [
      { short: "-a", long: "--all", text: "Vis også skjulte filer, altså de som starter med punktum." },
      { short: "-l", long: "", text: "Langt format: én fil per linje med rettigheter, eier, gruppe, størrelse og dato." },
      { short: "-h", long: "--human-readable", text: "Vis størrelser som 4,0K og 2,3M i stedet for antall byte. Merk: her betyr -h IKKE hjelp." },
      { short: "-t", long: "", text: "Sorter etter endringstidspunkt, nyeste først." },
      { short: "-R", long: "--recursive", text: "List underkataloger rekursivt." },
      { short: "", long: "--help", text: "Vis en kort bruksanvisning og avslutt." },
    ],
    examples: [
      { cmd: "ls -l", text: "Langt format for katalogen du står i." },
      { cmd: "ls -lah", text: "Tre kortflagg slått sammen: -l -a -h. Helt likeverdig med å skrive dem hver for seg." },
      { cmd: "ls --all --human-readable", text: "Samme to flagg i langform. Langformen kan aldri slås sammen." },
    ],
    seeAlso: ["dir(1)", "stat(1)", "find(1)", "chmod(1)"],
  },

  // ---- printf(1) ---------------------------------------------------------
  {
    id: "printf.1",
    name: "printf",
    section: 1,
    oneLiner: "formater og skriv ut data fra skallet",
    synopsis: [
      [
        CMD("printf"),
        t("FORMAT", "required", "Formatstrengen er påkrevd — den står uten klammer."),
        t("[ARGUMENT]...", "optional", "Verdier som fylles inn i formatstrengen. Valgfrie og gjentakbare."),
      ],
    ],
    description: [
      "printf skriver ut argumentene sine etter en formatstreng, omtrent som funksjonen med samme navn i C. Dette er kommandoen du kaller fra skallet eller fra et skallskript.",
      "Merk at det finnes en side til med samme navn: printf(3) beskriver C-funksjonen. Samme navn, ulik seksjon, helt ulik målgruppe.",
    ],
    options: [
      { short: "", long: "--help", text: "Vis kort bruksanvisning og avslutt." },
      { short: "", long: "--version", text: "Vis versjonsnummer og avslutt." },
    ],
    examples: [
      { cmd: 'printf "%s har %d poeng\\n" kari 42', text: "Skriver «kari har 42 poeng» og et linjeskift." },
    ],
    seeAlso: ["printf(3)", "echo(1)", "bash(1)"],
  },

  // ---- printf(3) ---------------------------------------------------------
  {
    id: "printf.3",
    name: "printf",
    section: 3,
    oneLiner: "formatert utskrift fra et C-program",
    synopsis: [
      [t("#include <stdio.h>", "required", "C-biblioteksider begynner med hvilken hodefil du må inkludere. Dette er et sikkert tegn på at du er i seksjon 3.")],
      [
        t("int printf(const char *format, ...);", "required", "Funksjonssignaturen i C. Her betyr ... at funksjonen tar et variabelt antall argumenter — samme symbol, men i C-betydning."),
      ],
    ],
    description: [
      "printf() skriver formatert utdata til standard ut fra et C-program. Den returnerer antall tegn som ble skrevet, eller et negativt tall ved feil.",
      "At denne siden ligger i seksjon 3 og ikke 2, betyr at funksjonen er en del av C-biblioteket. Den gjør riktignok til slutt et systemkall (write(2)), men den er ikke selv et systemkall.",
    ],
    options: [],
    examples: [{ cmd: 'printf("%d poeng\\n", 42);', text: "Kalles fra C-kode, ikke fra skallet." }],
    seeAlso: ["printf(1)", "fprintf(3)", "write(2)", "stdio(3)"],
  },

  // ---- man(1) ------------------------------------------------------------
  {
    id: "man.1",
    name: "man",
    section: 1,
    oneLiner: "et grensesnitt til systemets manualsider",
    synopsis: [
      [
        CMD("man"),
        t("[SEKSJON]", "optional", "Valgfritt seksjonsnummer. Sløyfer du det, tar man den laveste seksjonen som har en side med dette navnet."),
        t("SIDE", "required", "Navnet på siden du vil lese. Påkrevd — det står uten klammer."),
        t("...", "repeat", "Du kan be om flere sider etter hverandre."),
      ],
      [CMD("man"), t("-k", "required", "Flagget som gjør man om til et søk i beskrivelsene."), t("MØNSTER", "placeholder", "Ordet du leter etter — ikke et kommandonavn, men et stikkord.")],
    ],
    description: [
      "man er systemets oppslagsverk. Navnet er kort for «manual». Den finner riktig side, formaterer den, og viser den i en søkeleser (som regel less).",
      "Uten seksjonsnummer velger man den laveste seksjonen som har en side med det navnet. Derfor gir man passwd deg kommandoen (seksjon 1), ikke filformatet (seksjon 5).",
    ],
    options: [
      { short: "-k", long: "--apropos", text: "Søk i navn og beskrivelser etter et stikkord. Helt likeverdig med kommandoen apropos." },
      { short: "-f", long: "--whatis", text: "Vis énlinjes beskrivelse for et eksakt navn. Helt likeverdig med kommandoen whatis." },
      { short: "-a", long: "--all", text: "Vis alle sider med dette navnet etter hverandre, ikke bare den første." },
      { short: "-s", long: "--sections=LISTE", text: "Begrens søket til gitte seksjoner. man -s 5 passwd er samme som man 5 passwd." },
      { short: "-w", long: "--where", text: "Skriv ut filbanen til manualsiden i stedet for å vise den." },
    ],
    examples: [
      { cmd: "man ls", text: "Åpne manualsiden for ls." },
      { cmd: "man 5 passwd", text: "Åpne filformat-siden for /etc/passwd, ikke kommandoen." },
      { cmd: "man -k owner", text: "Finn alle sider der ordet owner nevnes i navn eller beskrivelse." },
    ],
    seeAlso: ["apropos(1)", "whatis(1)", "mandb(8)", "less(1)", "info(1)"],
  },
];

export function findPage(name: string, section?: ManSectionNum): MockManPage | undefined {
  const hits = MAN_PAGES.filter((p) => p.name === name);
  if (section) return hits.find((p) => p.section === section);
  return hits.sort((a, b) => a.section - b.section)[0];
}

export function pagesForName(name: string): MockManPage[] {
  return MAN_PAGES.filter((p) => p.name === name).sort((a, b) => a.section - b.section);
}

/** Navnene som utforskeren tilbyr, i den rekkefølgen vi vil at de skal møtes. */
export const EXPLORER_NAMES: { name: string; teaser: string }[] = [
  { name: "passwd", teaser: "Samme navn i to seksjoner — kommandoen og filformatet." },
  { name: "ls", teaser: "Skolebok-eksempelet på kortflagg mot langflagg." },
  { name: "chown", teaser: "Har enten-eller og gjentakelse i samme SYNOPSIS." },
  { name: "printf", teaser: "Seksjon 1 er skallkommandoen, seksjon 3 er C-funksjonen." },
  { name: "man", teaser: "Manualen om seg selv. Her står -k og -f forklart." },
];

// ---------------------------------------------------------------------------
// Manualdatabasen — det apropos og whatis søker i
// ---------------------------------------------------------------------------

export interface ManDbEntry {
  name: string;
  section: ManSectionNum;
  oneLiner: string;
  /** Den engelske NAME-linja. apropos søker i denne, ikke i den norske. */
  english: string;
}

/**
 * Merk at `english` er feltet apropos faktisk søker i. Det er ikke pyntedetalj:
 * en av feilsøkingsoppgavene handler nettopp om at manualdatabasen er på
 * engelsk, så et norsk søkeord aldri gir treff.
 */
export const MAN_DB: ManDbEntry[] = [
  { name: "passwd", section: 1, oneLiner: "endre passordet til en bruker", english: "change user password" },
  { name: "passwd", section: 5, oneLiner: "brukerdatabasen og formatet dens", english: "the password file" },
  { name: "shadow", section: 5, oneLiner: "filen med krypterte passord", english: "shadowed password file" },
  { name: "chown", section: 1, oneLiner: "endre eier og gruppe på en fil", english: "change file owner and group" },
  { name: "chown", section: 2, oneLiner: "systemkallet som endrer eierskap", english: "change ownership of a file" },
  { name: "chgrp", section: 1, oneLiner: "endre gruppeeierskap", english: "change group ownership" },
  { name: "chmod", section: 1, oneLiner: "endre rettighetsbitene på en fil", english: "change file mode bits" },
  { name: "chmod", section: 2, oneLiner: "systemkallet som endrer rettigheter", english: "change permissions of a file" },
  { name: "ls", section: 1, oneLiner: "list innholdet i en katalog", english: "list directory contents" },
  { name: "stat", section: 1, oneLiner: "vis fil- og filsystemstatus", english: "display file or file system status" },
  { name: "printf", section: 1, oneLiner: "formater og skriv ut data", english: "format and print data" },
  { name: "printf", section: 3, oneLiner: "formatert utskrift fra C", english: "formatted output conversion" },
  { name: "kill", section: 1, oneLiner: "send et signal til en prosess", english: "send a signal to a process" },
  { name: "kill", section: 2, oneLiner: "systemkallet som sender signal", english: "send signal to a process" },
  { name: "signal", section: 7, oneLiner: "oversikt over signaler i Linux", english: "overview of signals" },
  { name: "socket", section: 2, oneLiner: "opprett et endepunkt for kommunikasjon", english: "create an endpoint for communication" },
  { name: "socket", section: 7, oneLiner: "oversikt over socket-grensesnittet", english: "Linux socket interface" },
  { name: "grep", section: 1, oneLiner: "skriv ut linjer som treffer et mønster", english: "print lines that match patterns" },
  { name: "man", section: 1, oneLiner: "grensesnitt til manualsidene", english: "an interface to the system reference manuals" },
  { name: "apropos", section: 1, oneLiner: "søk i manualens navn og beskrivelser", english: "search the manual page names and descriptions" },
  { name: "whatis", section: 1, oneLiner: "vis énlinjes beskrivelse av en manualside", english: "display one-line manual page descriptions" },
  { name: "mandb", section: 8, oneLiner: "bygg eller oppdater manualdatabasen", english: "create or update the manual page index caches" },
  { name: "which", section: 1, oneLiner: "vis hvilken fil som kjøres for et kommandonavn", english: "locate a command in PATH" },
  { name: "whereis", section: 1, oneLiner: "finn program, kildekode og manualside", english: "locate the binary, source and manual page files" },
  { name: "info", section: 1, oneLiner: "les GNU-dokumentasjon", english: "read Info documents" },
  { name: "less", section: 1, oneLiner: "bla i tekst side for side", english: "opposite of more, a file pager" },
  { name: "bash", section: 1, oneLiner: "GNU Bourne-Again-skallet", english: "GNU Bourne-Again SHell" },
  { name: "fstab", section: 5, oneLiner: "statisk informasjon om filsystemer", english: "static information about the filesystems" },
  { name: "mount", section: 8, oneLiner: "monter et filsystem", english: "mount a filesystem" },
  { name: "useradd", section: 8, oneLiner: "opprett en ny brukerkonto", english: "create a new user or update default new user information" },
  { name: "crontab", section: 1, oneLiner: "vedlikehold tidsplanfiler", english: "maintain crontab files for individual users" },
  { name: "crontab", section: 5, oneLiner: "formatet på tidsplanfilene", english: "tables for driving cron" },
  { name: "null", section: 4, oneLiner: "null-enheten /dev/null", english: "data sink, the null device" },
  { name: "random", section: 4, oneLiner: "kilder til tilfeldige tall", english: "kernel random number source devices" },
  { name: "hier", section: 7, oneLiner: "beskrivelse av filsystemhierarkiet", english: "description of the filesystem hierarchy" },
  { name: "glob", section: 7, oneLiner: "hvordan jokertegn i filnavn utvides", english: "globbing pathnames" },
  { name: "fortune", section: 6, oneLiner: "skriv ut et tilfeldig visdomsord", english: "print a random, hopefully interesting adage" },
  { name: "open", section: 2, oneLiner: "åpne eller opprette en fil", english: "open and possibly create a file" },
  { name: "stdio", section: 3, oneLiner: "standard inn- og utbibliotek i C", english: "standard input/output library functions" },
];

/** apropos / man -k: søker delstreng i navn OG i den engelske beskrivelsen. */
export function aproposSearch(term: string): ManDbEntry[] {
  const q = term.toLowerCase();
  if (!q) return [];
  return MAN_DB.filter((e) => e.name.toLowerCase().includes(q) || e.english.toLowerCase().includes(q));
}

/** whatis / man -f: krever EKSAKT navnetreff. Dette er hele forskjellen. */
export function whatisLookup(name: string): ManDbEntry[] {
  return MAN_DB.filter((e) => e.name === name).sort((a, b) => a.section - b.section);
}

// ---------------------------------------------------------------------------
// Et lite mock-system: hvor bor kommandoene?
// ---------------------------------------------------------------------------

export interface BinaryInfo {
  name: string;
  /** Full bane til programfilen, eller null hvis det ikke er et program. */
  path: string | null;
  kind: "program" | "builtin" | "alias" | "keyword";
  /** For alias: hva den peker på. */
  aliasFor?: string;
  /** Bane til manualsiden, brukt av whereis. */
  manPath?: string;
  /** Kildekode-bane, brukt av whereis. */
  srcPath?: string;
}

export const BINARIES: BinaryInfo[] = [
  { name: "ls", path: "/usr/bin/ls", kind: "program", manPath: "/usr/share/man/man1/ls.1.gz", srcPath: "/usr/src/coreutils" },
  { name: "grep", path: "/usr/bin/grep", kind: "program", manPath: "/usr/share/man/man1/grep.1.gz" },
  { name: "man", path: "/usr/bin/man", kind: "program", manPath: "/usr/share/man/man1/man.1.gz" },
  { name: "apropos", path: "/usr/bin/apropos", kind: "program", manPath: "/usr/share/man/man1/apropos.1.gz" },
  { name: "whatis", path: "/usr/bin/whatis", kind: "program", manPath: "/usr/share/man/man1/whatis.1.gz" },
  { name: "which", path: "/usr/bin/which", kind: "program", manPath: "/usr/share/man/man1/which.1.gz" },
  { name: "whereis", path: "/usr/bin/whereis", kind: "program", manPath: "/usr/share/man/man1/whereis.1.gz" },
  { name: "info", path: "/usr/bin/info", kind: "program", manPath: "/usr/share/man/man1/info.1.gz" },
  { name: "passwd", path: "/usr/bin/passwd", kind: "program", manPath: "/usr/share/man/man1/passwd.1.gz" },
  { name: "chown", path: "/usr/bin/chown", kind: "program", manPath: "/usr/share/man/man1/chown.1.gz" },
  { name: "mount", path: "/usr/bin/mount", kind: "program", manPath: "/usr/share/man/man8/mount.8.gz" },
  { name: "bash", path: "/usr/bin/bash", kind: "program", manPath: "/usr/share/man/man1/bash.1.gz" },
  // Skall-innebygde: de har ingen fil noe sted.
  { name: "cd", path: null, kind: "builtin" },
  { name: "export", path: null, kind: "builtin" },
  { name: "type", path: null, kind: "builtin" },
  { name: "help", path: null, kind: "builtin" },
  { name: "alias", path: null, kind: "builtin" },
  { name: "umask", path: null, kind: "builtin" },
  { name: "echo", path: "/usr/bin/echo", kind: "builtin" }, // finnes BEGGE steder — klassisk felle
  { name: "if", path: null, kind: "keyword" },
  { name: "for", path: null, kind: "keyword" },
  { name: "ll", path: null, kind: "alias", aliasFor: "ls -alF" },
];

export function lookupBinary(name: string): BinaryInfo | undefined {
  return BINARIES.find((b) => b.name === name);
}

/** Kommandoer som faktisk svarer på --help i mock-systemet vårt. */
export const HELP_TEXTS: Record<string, string[]> = {
  ls: [
    "Bruk: ls [OPSJON]... [FIL]...",
    "List informasjon om FILene (som standard katalogen du står i).",
    "",
    "  -a, --all                  ikke skjul filer som starter med punktum",
    "  -l                         bruk langt listeformat",
    "  -h, --human-readable       skriv størrelser som 1K 234M 2G",
    "      --help                 vis denne hjelpen og avslutt",
    "      --version              vis versjonsinformasjon og avslutt",
  ],
  chown: [
    "Bruk: chown [OPSJON]... [EIER][:[GRUPPE]] FIL...",
    "Endre eier og/eller gruppe på hver FIL.",
    "",
    "  -R, --recursive            gå rekursivt gjennom kataloger",
    "  -v, --verbose              skriv en linje per fil som endres",
    "      --help                 vis denne hjelpen og avslutt",
  ],
  grep: [
    "Bruk: grep [OPSJON]... MØNSTER [FIL]...",
    "Søk etter MØNSTER i hver FIL.",
    "",
    "  -i, --ignore-case          skill ikke mellom store og små bokstaver",
    "  -r, --recursive            søk rekursivt i kataloger",
    "      --help                 vis denne hjelpen og avslutt",
  ],
  man: [
    "Bruk: man [OPSJON...] [SEKSJON] SIDE...",
    "",
    "  -k, --apropos              søk i beskrivelsene",
    "  -f, --whatis               vis énlinjes beskrivelse",
    "  -a, --all                  vis alle treff, ikke bare det første",
    "  -h, --help                 vis denne hjelpen og avslutt",
  ],
};

/** Kommandoer som IKKE har --help — de eldste Unix-programmene, typisk. */
export const NO_HELP_SUPPORT = ["passwd", "mount", "dd", "tr"];

/** GNU info-treet. Bare noen få pakker har ekte info-dokumentasjon. */
export const INFO_NODES: Record<string, { top: string; nodes: string[] }> = {
  coreutils: {
    top: "GNU Coreutils — kjerneverktøyene for filer, tekst og skall",
    nodes: ["Introduction", "Output of entire files", "Directory listing", "Changing file attributes", "File name manipulation"],
  },
  bash: {
    top: "Bash Reference Manual",
    nodes: ["Introduction", "Definitions", "Basic Shell Features", "Shell Builtin Commands", "Job Control"],
  },
  gcc: {
    top: "Using the GNU Compiler Collection",
    nodes: ["Programming Languages", "Invoking GCC", "C Implementation", "Extensions"],
  },
  make: { top: "GNU Make", nodes: ["Overview", "An Introduction to Makefiles", "Writing Rules", "Using Variables"] },
};

/** Innholdet i /usr/share/doc — siste utvei når alt annet feiler. */
export const DOC_DIRS = [
  { pkg: "coreutils", files: ["README", "NEWS.gz", "changelog.Debian.gz", "copyright"] },
  { pkg: "openssh-server", files: ["README.Debian", "OVERVIEW.gz", "examples/sshd_config", "copyright"] },
  { pkg: "nginx", files: ["README.Debian", "examples/nginx.conf", "changelog.gz"] },
  { pkg: "postgresql-16", files: ["README.Debian", "examples/", "TODO.gz"] },
];

/** Tastene less bruker når man viser en manualside. */
export const LESS_KEYS: { key: string; label: string; what: string }[] = [
  { key: "mellomrom", label: "Mellomrom", what: "Bla én skjerm ned. Den vanligste tasten av alle." },
  { key: "b", label: "b", what: "Bla én skjerm opp igjen («back»)." },
  { key: "pil", label: "↑ / ↓", what: "Flytt én linje av gangen." },
  { key: "sok", label: "/ord", what: "Søk framover etter «ord». Trykk Enter for å starte søket." },
  { key: "n", label: "n", what: "Hopp til neste treff for søket du nettopp gjorde." },
  { key: "N", label: "N", what: "Hopp til forrige treff (stor N)." },
  { key: "g", label: "g / G", what: "Hopp til begynnelsen (g) eller slutten (stor G) av siden." },
  { key: "q", label: "q", what: "Avslutt og gå tilbake til skallet («quit»). Uten denne sitter du fast." },
  { key: "h", label: "h", what: "Vis less sin egen hjelp — hvis du har glemt alle de andre tastene." },
];
