// ---------------------------------------------------------------------------
// Oppgavetype 5: RECALL-KORT.
//
// Bare det som faktisk MÅ sitte i hodet: seksjonsnumrene, og hvilket verktøy
// som svarer på hvilket spørsmål. Alt annet i modulen kan slås opp — det er
// jo hele poenget med et hjelpesystem.
//
// Kortene planlegges med den samme FSRS-motoren resten av appen bruker
// (src/lib/learn/fsrs.ts), men i sitt eget navnerom. Det gir ekte
// spaced repetition uten å røre noen delt fil eller den globale kortlista.
// ---------------------------------------------------------------------------

import { createFsrsStore } from "@/lib/learn/fsrs";

export const hjelpesystemerFsrs = createFsrsStore("dte2505-hjelpesystemer-fsrs-v1");

export interface RecallCard {
  id: string;
  front: string;
  back: string;
  /** Kort merkelapp for gruppering i grensesnittet. */
  tag: "seksjoner" | "verktøyvalg" | "syntaks";
}

export const RECALL_CARDS: RecallCard[] = [
  // ---- seksjonsnumrene ---------------------------------------------------
  {
    id: "hjs-sec-1",
    tag: "seksjoner",
    front: "Manualseksjon 1 — hva bor her?",
    back: "Brukerkommandoer: programmer du kan kjøre som vanlig bruker. Den største seksjonen, og den man havner i når du ikke oppgir noe nummer.",
  },
  {
    id: "hjs-sec-2",
    tag: "seksjoner",
    front: "Manualseksjon 2 — hva bor her?",
    back: "Systemkall: funksjonene et program bruker for å be kjernen om noe (open, read, fork, kill). Skrevet for C-programmerere.",
  },
  {
    id: "hjs-sec-3",
    tag: "seksjoner",
    front: "Manualseksjon 3 — hva bor her?",
    back: "Bibliotekfunksjoner: kode fra C-biblioteket som kjører i din egen prosess uten å gå via kjernen. Her ligger printf(3) og malloc(3).",
  },
  {
    id: "hjs-sec-4",
    tag: "seksjoner",
    front: "Manualseksjon 4 — hva bor her?",
    back: "Enhetsfiler: alt under /dev, altså maskinvare og pseudo-enheter som null(4) og random(4).",
  },
  {
    id: "hjs-sec-5",
    tag: "seksjoner",
    front: "Manualseksjon 5 — hva bor her?",
    back: "Filformater og konfigurasjon: hvordan innholdet i en fil er bygget opp. passwd(5), fstab(5), crontab(5).",
  },
  {
    id: "hjs-sec-6",
    tag: "seksjoner",
    front: "Manualseksjon 6 — hva bor her?",
    back: "Spill. Sjelden i bruk, men seksjonen finnes og dukker opp i søketreff.",
  },
  {
    id: "hjs-sec-7",
    tag: "seksjoner",
    front: "Manualseksjon 7 — hva bor her?",
    back: "Diverse og konvensjoner: oversiktssider som ikke er ett program — signal(7), hier(7) om filsystemhierarkiet, glob(7) om jokertegn.",
  },
  {
    id: "hjs-sec-8",
    tag: "seksjoner",
    front: "Manualseksjon 8 — hva bor her?",
    back: "Systemadministrasjon: kommandoer du normalt må være rot-bruker for å kjøre. mount(8), useradd(8), mandb(8).",
  },
  {
    id: "hjs-sec-order",
    tag: "seksjoner",
    front: "Du skriver `man passwd` uten seksjonsnummer. Hvilken side får du, og hvorfor?",
    back: "Kommandoen, altså passwd(1). man går gjennom seksjonene i stigende rekkefølge og viser den første siden den finner — uten å nevne at det fantes flere.",
  },

  // ---- verktøyvalg -------------------------------------------------------
  {
    id: "hjs-tool-apropos",
    tag: "verktøyvalg",
    front: "apropos — hva gjør den, og når velger du den?",
    back: "Søker med delstreng i navn OG beskrivelse for alle manualsider. Velges når du vet HVA du vil oppnå, men ikke hva kommandoen heter. Identisk med man -k.",
  },
  {
    id: "hjs-tool-whatis",
    tag: "verktøyvalg",
    front: "whatis — hva gjør den, og hvordan skiller den seg fra apropos?",
    back: "Slår opp EKSAKT sidenavn og gir én linje per seksjon navnet finnes i. apropos er det brede fritekstsøket, whatis det smale oppslaget. Identisk med man -f.",
  },
  {
    id: "hjs-tool-which-type",
    tag: "verktøyvalg",
    front: "which mot type — hva er forskjellen?",
    back: "which leter etter kjørbare FILER i PATH og finner derfor aldri skall-innebygde kommandoer. type spør skallet selv, og skiller mellom program, innebygd, alias og reservert ord. Er du i tvil, bruk type.",
  },
  {
    id: "hjs-tool-whereis",
    tag: "verktøyvalg",
    front: "Hva gir whereis deg som which ikke gir?",
    back: "whereis leter på faste standardsteder og returnerer program, kildekode og manualside samtidig. which gir bare det første treffet i PATH.",
  },
  {
    id: "hjs-tool-info",
    tag: "verktøyvalg",
    front: "Hvorfor finnes info ved siden av man?",
    back: "man-sider er oppslagsverk med fast struktur; GNU-prosjektet ville ha lange, kapittelinndelte lærebøker med noder du navigerer i. Mange GNU-verktøy har derfor kort man-side og fyldig info-dokument.",
  },
  {
    id: "hjs-tool-help",
    tag: "verktøyvalg",
    front: "Hvorfor kan du ikke stole på --help?",
    back: "--help er ikke en systemfunksjon. Hvert program må selv implementere flagget, og eldre verktøy utenfor GNU coreutils (for eksempel passwd) svarer med «ukjent opsjon». Manualsiden finnes derimot alltid når pakken er riktig installert.",
  },
  {
    id: "hjs-tool-mandb",
    tag: "verktøyvalg",
    front: "apropos gir null treff, men man finner siden. Hva er galt, og hva fikser det?",
    back: "Indeksen over NAME-linjene er utdatert. man leter i filsystemet, apropos og whatis slår opp i mandb-indeksen. `sudo mandb` bygger den på nytt.",
  },
  {
    id: "hjs-tool-builtin",
    tag: "verktøyvalg",
    front: "Hvor finner du dokumentasjonen for en skall-innebygd kommando som cd?",
    back: "`help cd` i bash, eller inne i bash(1). `man cd` finner ingenting, for det finnes ingen egen fil og dermed ingen egen manualside.",
  },
  {
    id: "hjs-tool-doc",
    tag: "verktøyvalg",
    front: "Hvor leter du når verken man, apropos eller --help hjelper?",
    back: "/usr/share/doc/<pakkenavn>/ — der legger pakkene README, eksempelkonfigurasjoner og endringslogger. Ofte er det eneste stedet et eksempeloppsett faktisk finnes.",
  },

  // ---- syntaks -----------------------------------------------------------
  {
    id: "hjs-syn-brackets",
    tag: "syntaks",
    front: "I SYNOPSIS: hva betyr [ ] og ... ?",
    back: "Hakeparentes = valgfritt, kan sløyfes helt. Ellipse = kan gjentas. `ls [OPSJON]... [FIL]...` betyr at både flagg og filnavn kan utelates eller gjentas fritt.",
  },
  {
    id: "hjs-syn-pipe",
    tag: "syntaks",
    front: "I SYNOPSIS: hva betyr | og STORE BOKSTAVER?",
    back: "Vertikal strek = enten-eller, du velger nøyaktig ett alternativ. Store bokstaver = plassholder du fyller inn selv, ikke tekst du skriver bokstavelig.",
  },
  {
    id: "hjs-syn-struct",
    tag: "syntaks",
    front: "Hvilke faste overskrifter har en manualside, i rekkefølge?",
    back: "NAME (navn + énlinjes beskrivelse), SYNOPSIS (kallesyntaks), DESCRIPTION (hva den gjør), OPTIONS (flaggene), EXAMPLES (konkret bruk), SEE ALSO (beslektede sider). Erfarne brukere hopper rett til SYNOPSIS eller EXAMPLES.",
  },
  {
    id: "hjs-syn-less",
    tag: "syntaks",
    front: "Du er inne i en manualside. Hvordan søker du, hopper videre, og kommer deg ut?",
    back: "/ord + Enter søker framover, n hopper til neste treff (stor N til forrige), mellomrom blar en skjerm ned, b blar opp, q avslutter. Dette er tastene til less, ikke til man.",
  },
  {
    id: "hjs-syn-anatomy",
    tag: "syntaks",
    front: "Del opp `ls -lah /var/log` i delene en kommandolinje består av.",
    back: "`ls` er kommandoen, `-lah` er tre sammenslåtte kortflagg (-l -a -h), og `/var/log` er argumentet kommandoen skal virke på. Skallet deler alltid linja på mellomrom først.",
  },
];

export const CARD_TAGS: { id: RecallCard["tag"]; label: string }[] = [
  { id: "seksjoner", label: "Seksjonsnumrene" },
  { id: "verktøyvalg", label: "Hvilket verktøy?" },
  { id: "syntaks", label: "Syntaks og navigasjon" },
];
