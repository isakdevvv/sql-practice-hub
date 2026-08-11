// ---------------------------------------------------------------------------
// Oppgavetype 5 for DTE-2505 modul 6: RECALL-KORT.
//
// Bare det som må sitte i hodet. Alt annet kan slås opp — og modul 2 handlet
// nettopp om hvordan. Det som IKKE kan slås opp under press er modusmodellen i
// vi, retningen på klient og tjener i X, og hvilken halvdel av nøkkelparet som
// skal hvor.
//
// Egen FSRS-butikk (samme motor som resten av appen, eget navnerom).
// ---------------------------------------------------------------------------

import { createFsrsStore } from "@/lib/learn/fsrs";

export const diverseFsrs = createFsrsStore("dte2505-modul6-fsrs-v1");

export interface RecallCard {
  id: string;
  front: string;
  back: string;
  tag: "vim" | "x" | "ssh";
}

export const DIVERSE_RECALL_CARDS: RecallCard[] = [
  // ---- vi/vim ------------------------------------------------------------
  {
    id: "m6-vim-moduser",
    tag: "vim",
    front: "Hvilke fire moduser har vim, og hva gjør tastene i hver?",
    back: "Normalmodus: tastene er kommandoer (der du starter). Innsettingsmodus: tastene blir tekst — den eneste modusen der det skjer. Visuellmodus: bevegelsestastene utvider en merking. Kommandolinjemodus: du skriver en kommando etter kolon, nederst på skjermen.",
  },
  {
    id: "m6-vim-esc",
    tag: "vim",
    front: "Du vet ikke hvilken modus du er i. Hva gjør du?",
    back: "Trykk Esc. Fra alle andre moduser tar den deg til normalmodus, og i normalmodus gjør den ingenting. Derfor er Esc alltid trygt — og det er utgangspunktet for enhver annen kommando.",
  },
  {
    id: "m6-vim-avslutt",
    tag: "vim",
    front: "De fire kommandoene for å lagre og avslutte?",
    back: ":w lagrer og lar deg fortsette. :q avslutter. :wq lagrer og avslutter. :q! forkaster alle endringer og avslutter. Alle krever at du er i normalmodus først (Esc), og alle kjøres med Enter.",
  },
  {
    id: "m6-vim-nekter",
    tag: "vim",
    front: "«E37: Ingen skriving siden siste endring». Hva betyr det, og hva gjør du?",
    back: "Du prøvde :q med ulagrede endringer, og vim nekter som en sikring. Velg: :w for å lagre, :wq for å lagre og avslutte, eller :q! for å forkaste. Utropstegnet betyr «jeg mener det» over hele vim.",
  },
  {
    id: "m6-vim-inn",
    tag: "vim",
    front: "Fire måter å komme inn i innsettingsmodus — og forskjellen på dem?",
    back: "i setter inn FØR tegnet markøren står på. a setter inn ETTER (append). o åpner en ny linje UNDER og hopper inn. Stor O åpner ny linje OVER. Forskjellen på i og a betyr alt når du står på siste tegn i et ord.",
  },
  {
    id: "m6-vim-bevegelse",
    tag: "vim",
    front: "Bevegelsene i normalmodus: h j k l, w, b, gg, G, 0, $",
    back: "h venstre, j ned, k opp, l høyre (de ligger under høyre hånd). w til neste ord, b tilbake et ord. gg til første linje, G til siste. 0 til starten av linja, $ til slutten.",
  },
  {
    id: "m6-vim-redigering",
    tag: "vim",
    front: "x, dd, yy, p — hva gjør de, og hva har de felles?",
    back: "x sletter tegnet under markøren, dd hele linja, yy kopierer («yanker») linja, p limer inn under markøren (stor P over). Felles: alt som slettes eller kopieres havner i registeret — derfor er «slett» og «klipp ut» samme operasjon i vim.",
  },
  {
    id: "m6-vim-grammatikk",
    tag: "vim",
    front: "Hvorfor heter det dd og dw, og hva er mønsteret?",
    back: "vim har en grammatikk: operator + bevegelse. d er operatoren «slett», og den venter på å få vite hva. dw = slett til neste ord, d$ = slett til linjeslutt, dd = hele linja (operatoren gjentatt betyr «denne linja»). Samme mønster med y for kopiering.",
  },

  // ---- X Window System ---------------------------------------------------
  {
    id: "m6-x-retning",
    tag: "x",
    front: "I X Window System: hvor kjører X-tjeneren, og hvor kjører klienten?",
    back: "X-TJENEREN kjører der skjermen, tastaturet og musa er — altså på maskinen du sitter ved. Den «tjener» maskinvaren. PROGRAMMET er klienten, som ber om å få tegne. Det føles bakvendt fordi programmet kan kjøre på en mye kraftigere maskin.",
  },
  {
    id: "m6-x-display",
    tag: "x",
    front: "Hva sier miljøvariabelen DISPLAY?",
    back: "Hvilken X-tjener et program skal tegne på. «:0» er skjerm 0 på din egen maskin. «localhost:10.0» i en SSH-økt er enden av en videresendingstunnel — ikke en skjerm ved tjeneren. Er DISPLAY tom, finnes ingen skjerm, og grafiske programmer nekter å starte.",
  },
  {
    id: "m6-x-forwarding",
    tag: "x",
    front: "Hva gjør `ssh -X`, og hvorfor er det mulig i det hele tatt?",
    back: "Den ber om X-videresending: SSH lager en tunnel og setter DISPLAY på fjernmaskinen. Det er mulig fordi X alltid har vært en NETTVERKSPROTOKOLL mellom klient og tjener — om de er på samme maskin eller ikke, spiller ingen rolle for protokollen.",
  },
  {
    id: "m6-x-wayland",
    tag: "x",
    front: "Hva endrer Wayland, og hva mister vi?",
    back: "Wayland isolerer klientene fra hverandre. I X kan enhver klient lese alle andre vinduer og fange alle tastetrykk uten spesielle rettigheter — praktisk i 1984, en tastelogger i dag. Prisen er at nettverkstransparensen forsvinner, så ssh -X virker ikke mot rene Wayland-programmer (XWayland eller waypipe er omveiene).",
  },

  // ---- SSH ---------------------------------------------------------------
  {
    id: "m6-ssh-nokkelpar",
    tag: "ssh",
    front: "Nøkkelparet: hvilken halvdel skal hvor, og hvorfor?",
    back: "Den private (~/.ssh/id_ed25519) blir hos deg og forlater aldri maskinen. Den offentlige (.pub) legges i ~/.ssh/authorized_keys på hver tjener du vil nå, og kan deles fritt. Tjeneren sender en utfordring, du signerer med den private, tjeneren sjekker med den offentlige.",
  },
  {
    id: "m6-ssh-hvorfor-bedre",
    tag: "ssh",
    front: "Hvorfor er nøkkel tryggere enn passord?",
    back: "Hemmeligheten sendes aldri. Ved passord må tjeneren få se det, så en kompromittert tjener lekker et passord du kanskje bruker flere steder. Med nøkkel ser tjeneren bare en signatur den ikke kan gjenbruke, og den offentlige nøkkelen er verdiløs for en angriper.",
  },
  {
    id: "m6-ssh-agent",
    tag: "ssh",
    front: "Hva gjør ssh-agent, og hvorfor gir den både bedre sikkerhet og mer bekvemmelighet?",
    back: "Den låser opp den private nøkkelen én gang og holder den opplåste kopien i minnet for økta. Nøkkelen blir liggende kryptert på disk, så en stjålet maskin gir ingen tilgang — og du slipper å skrive passfrasen for hver tilkobling. `ssh-add <fil>` legger inn, `ssh-add -l` lister.",
  },
  {
    id: "m6-ssh-config",
    tag: "ssh",
    front: "Hva kan stå i ~/.ssh/config, og hvem leser den?",
    back: "Host-blokker med alias, og under dem HostName, User, Port, IdentityFile, ForwardX11 — alt du ellers ville skrevet på kommandolinja. Etterpå holder `ssh <alias>`. scp, sftp og rsync leser den samme fila, så aliaset virker i alle sammen.",
  },
  {
    id: "m6-ssh-rettigheter",
    tag: "ssh",
    front: "Hvilke rettigheter krever SSH på ~/.ssh, og hva skjer ellers?",
    back: "700 på katalogen, 600 på private nøkler og config, 644 på offentlige nøkler. For åpne rettigheter gir hard avvisning («Bad owner or permissions»), ikke bare en advarsel — en privat nøkkel andre kan lese er ingen hemmelighet. `ssh -v` sier alltid hva som er galt.",
  },
  {
    id: "m6-ssh-overforing",
    tag: "ssh",
    front: "scp, sftp og rsync — hva skiller dem, og hva har de felles?",
    back: "scp (Secure Copy) kopierer og er ferdig. sftp (SSH File Transfer Protocol) er en interaktiv økt med get og put. rsync sender bare det som er endret og kan gjenopptas. Felles: alle bruker SSH som transport, så nøkler og config-alias virker automatisk i alle tre.",
  },
  {
    id: "m6-ssh-maskin",
    tag: "ssh",
    front: "Du lagret en fil etter å ha kjørt ssh, og finner den ikke på laptopen. Hvorfor?",
    back: "Alt etter innloggingen kjørte på fjernmaskinen. SSH gir deg et skall på en annen maskin, ikke en delt katalog — ingenting overføres automatisk. `hostname` svarer på hvilken maskin du står på, og scp henter fila ned.",
  },
];

export const DIVERSE_CARD_TAGS: { id: RecallCard["tag"]; label: string }[] = [
  { id: "vim", label: "vi/vim" },
  { id: "x", label: "X Window System" },
  { id: "ssh", label: "SSH" },
];
