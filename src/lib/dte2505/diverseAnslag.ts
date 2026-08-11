// ---------------------------------------------------------------------------
// Oppgavetype 1 for DTE-2505 modul 6: ANSLÅ-SÅ-SJEKK.
//
// Kommer FØR forklaringene. Ingen poengsum — jobben er å lage et hull hjernen
// vil fylle.
//
// Rekkefølgen følger scaffolding-kravet og de tre delene av modulen:
//   v1–v3  vi/vim: modusmodellen, som er hele nøkkelen
//   x1–x3  X Window System: klient–tjener-retningen, som er kontraintuitiv
//   s1–s3  SSH: nøkkelparet, hvilken halvdel som skal hvor
// ---------------------------------------------------------------------------

export interface PredictOption {
  id: string;
  label: string;
}

export interface PredictItem {
  id: string;
  /** Hvilken av de tre delene spørsmålet hører til — brukes til gruppering. */
  del: "vim" | "x" | "ssh";
  setup: string;
  question: string;
  options: PredictOption[];
  correct: string;
  reveal: string;
  punch: string;
}

export const DIVERSE_PREDICT_ITEMS: PredictItem[] = [
  // ---- vi/vim ------------------------------------------------------------
  {
    id: "dv1",
    del: "vim",
    setup:
      "Du åpner en fil med `vim notat.txt`. Editoren viser innholdet, og markøren står øverst til venstre.",
    question: "Du skriver ordet «hei». Hva står i fila etterpå?",
    options: [
      { id: "a", label: "«hei» er satt inn øverst" },
      { id: "b", label: "Ingenting er satt inn — tastene ble tolket som kommandoer" },
      { id: "c", label: "«hei» erstattet de tre første tegnene" },
      { id: "d", label: "vim spør om du vil sette inn tekst" },
    ],
    correct: "b",
    reveal:
      "vim åpner i normalmodus, der hver tast er en kommando. h flyttet markøren til venstre, e hoppet til slutten av et ord, i satte deg i innsettingsmodus. Du har altså byttet modus uten å ville det, men ingen bokstaver havnet i teksten. Dette er den enkeltforskjellen som gjør vim uforståelig for nye brukere: i alle andre editorer betyr en tast «skriv dette tegnet».",
    punch: "vi er modal. Den samme tasten gjør fire forskjellige ting avhengig av hvilken modus du er i.",
  },
  {
    id: "dv2",
    del: "vim",
    setup:
      "Du er i innsettingsmodus og har nettopp skrevet ferdig. Du vil lagre og avslutte, så du skriver `:wq`.",
    question: "Hva skjer?",
    options: [
      { id: "a", label: "Fila lagres og vim avsluttes" },
      { id: "b", label: "Teksten «:wq» havner i fila" },
      { id: "c", label: "vim spør om du mente å lagre" },
      { id: "d", label: "Ingenting — kommandoen krever Enter først" },
    ],
    correct: "b",
    reveal:
      "Kolon er en kommando i normalmodus og et helt vanlig tegn i innsettingsmodus. Siden du var i innsettingsmodus, ble alle tre tegnene skrevet inn i teksten. Løsningen er den samme som på alle vim-problemer: trykk Esc først. Da er du i normalmodus, og kolon åpner kommandolinja nederst.",
    punch: "Esc er alltid trygt. I normalmodus gjør den ingenting, fra alle andre moduser tar den deg dit.",
  },
  {
    id: "dv3",
    del: "vim",
    setup:
      "Du har endret en fil i vim og skriver `:q` for å avslutte, uten å ha lagret.",
    question: "Hva svarer vim?",
    options: [
      { id: "a", label: "Avslutter og forkaster endringene uten videre" },
      { id: "b", label: "Avslutter og lagrer automatisk" },
      { id: "c", label: "«E37: Ingen skriving siden siste endring» — den nekter" },
      { id: "d", label: "Spør «Vil du lagre? (j/n)»" },
    ],
    correct: "c",
    reveal:
      "vim nekter, og det er en sikring, ikke en feil. Du har tre veier videre, og de er verdt å kunne utenat: `:w` lagrer og lar deg fortsette, `:wq` lagrer og avslutter, `:q!` forkaster alt og avslutter. Utropstegnet betyr «jeg mener det» over hele vim — det overstyrer sikringer.",
    punch: ":w lagre · :q avslutt · :wq begge · :q! forkast. Fire kommandoer dekker alt du trenger.",
  },

  // ---- X Window System ---------------------------------------------------
  {
    id: "dx1",
    del: "x",
    setup:
      "X Window System (X11) er delt i en klient og en tjener. Du sitter ved din egen laptop med skjerm, og kjører et grafisk program på en tjenermaskin i serverrommet.",
    question: "Hvor kjører X-TJENEREN?",
    options: [
      { id: "a", label: "På tjenermaskinen i serverrommet — det er jo en tjener" },
      { id: "b", label: "På din laptop, fordi det er der skjermen er" },
      { id: "c", label: "Begge steder, én på hver side" },
      { id: "d", label: "Hos nettverksadministratoren, sentralt" },
    ],
    correct: "b",
    reveal:
      "X-tjeneren kjører der SKJERMEN, tastaturet og musa er — altså på laptopen din. Den «tjener» maskinvaren: alle som vil tegne noe, må spørre den. Programmet, selv om det kjører på en kraftig maskin i serverrommet, er KLIENTEN som ber om å få tegne. Navngivningen føles bakvendt fordi vi er vant til at tjeneren er den store maskinen — men her handler tjeneren om hvem som eier skjermen.",
    punch: "X-tjeneren eier skjermen. Programmet er klienten som ber om å få tegne på den.",
  },
  {
    id: "dx2",
    del: "x",
    setup:
      "Du logger inn på en fjernmaskin med et helt vanlig `ssh bruker@vert` og prøver å starte et grafisk program.",
    question: "Hva skjer?",
    options: [
      { id: "a", label: "Vinduet dukker opp på skjermen din" },
      { id: "b", label: "«Error: Can't open display» — DISPLAY er tom" },
      { id: "c", label: "Programmet kjører usynlig i bakgrunnen" },
      { id: "d", label: "SSH spør om du vil videresende grafikken" },
    ],
    correct: "b",
    reveal:
      "En vanlig SSH-økt er ren tekst. Miljøvariabelen DISPLAY, som forteller et program hvilken X-tjener det skal tegne på, er tom — og da nekter programmet å starte. Med `ssh -X` ber du om X-videresending: SSH lager en tunnel og setter DISPLAY på fjernmaskinen til localhost:10.0. Den adressen er tunnelmunningen, ikke en skjerm som står der.",
    punch: "DISPLAY er hele X-modellen i én variabel: hvilken skjerm skal jeg tegne på?",
  },
  {
    id: "dx3",
    del: "x",
    setup:
      "Wayland er i ferd med å erstatte X på moderne Linux-skrivebord. X er fra 1984 og bærer med seg antakelser fra den gang.",
    question: "Hva er det viktigste Wayland endrer?",
    options: [
      { id: "a", label: "Grafikken blir raskere fordi den er skrevet i et nyere språk" },
      { id: "b", label: "Nettverkstransparensen fjernes, og hvert vindu isoleres fra de andre" },
      { id: "c", label: "Wayland fjerner behovet for et vindussystem helt" },
      { id: "d", label: "Wayland gjør at Linux kan kjøre Windows-programmer" },
    ],
    correct: "b",
    reveal:
      "I X kan hvilken som helst klient lese hva alle andre vinduer viser og fange alle tastetrykk — det var praktisk i 1984 og er et sikkerhetsmareritt i dag (en tastelogger trenger ingen spesielle rettigheter). Wayland isolerer klientene fra hverandre. Prisen er at den innebygde nettverkstransparensen forsvinner: X kunne sende vinduer over nettet fordi det uansett var en protokoll mellom to prosesser. Derfor virker ikke `ssh -X` mot rene Wayland-programmer, og løsningen er enten XWayland (et kompatibilitetslag) eller andre verktøy som waypipe.",
    punch: "X var åpent fordi alt skjedde over en protokoll. Wayland lukker det igjen — og mister fjerngrafikken på kjøpet.",
  },

  // ---- SSH ---------------------------------------------------------------
  {
    id: "ds1",
    del: "ssh",
    setup:
      "Du kjører `ssh-keygen` og får to filer: `id_ed25519` og `id_ed25519.pub`. Du skal sette opp innlogging uten passord på en tjener.",
    question: "Hvilken fil skal kopieres til tjeneren?",
    options: [
      { id: "a", label: "id_ed25519 — den private, så tjeneren kan låse opp" },
      { id: "b", label: "id_ed25519.pub — den offentlige" },
      { id: "c", label: "Begge to, de hører sammen" },
      { id: "d", label: "Ingen av dem — tjeneren lager sitt eget par" },
    ],
    correct: "b",
    reveal:
      "Bare den offentlige. Den legges på én linje i ~/.ssh/authorized_keys på tjeneren, og kan deles helt fritt. Den private forlater aldri maskinen din. Innloggingen fungerer ved at tjeneren sender en tilfeldig utfordring, du signerer den med den private nøkkelen, og tjeneren sjekker signaturen med den offentlige. Passordet ditt sendes altså aldri — og en tjener som blir hacket, lekker ingen nøkkel som gir tilgang andre steder.",
    punch: "Privat blir hos deg, offentlig går til alle tjenere du vil nå. Aldri motsatt.",
  },
  {
    id: "ds2",
    del: "ssh",
    setup:
      "Du beskytter den private nøkkelen din med en passfrase. Nå må du skrive den ved hver eneste tilkobling, og du logger inn tjue ganger om dagen.",
    question: "Hva er den riktige løsningen?",
    options: [
      { id: "a", label: "Lag nøkkelen på nytt uten passfrase" },
      { id: "b", label: "Lagre passfrasen i en tekstfil og lim den inn" },
      { id: "c", label: "Legg nøkkelen i ssh-agent, som holder den opplåst i minnet" },
      { id: "d", label: "Bruk passord i stedet for nøkkel" },
    ],
    correct: "c",
    reveal:
      "ssh-agent låser opp nøkkelen én gang og holder den opplåste kopien i minnet så lenge du er logget inn. Nøkkelen ligger fortsatt kryptert på disk. Du får altså begge deler: en stjålet laptop gir ingen tilgang, og du skriver passfrasen bare én gang per økt. `ssh-add ~/.ssh/id_ed25519` legger den inn, `ssh-add -l` viser hva agenten har.",
    punch: "Passfrase + agent er både tryggere og mer bekvemt enn nøkkel uten passfrase.",
  },
  {
    id: "ds3",
    del: "ssh",
    setup:
      "Du rydder i hjemmekatalogen og kjører `chmod 777 -R ~/.ssh` for å «slippe rettighetsproblemer».",
    question: "Hva skjer neste gang du prøver å logge inn med nøkkel?",
    options: [
      { id: "a", label: "Det virker som før — rettigheter påvirker ikke innlogging" },
      { id: "b", label: "Det virker bedre, siden ingenting er blokkert" },
      { id: "c", label: "SSH avviser nøkkelen fordi andre brukere kan lese den" },
      { id: "d", label: "Du får en advarsel, men slipper inn" },
    ],
    correct: "c",
    reveal:
      "SSH nekter blankt. En privat nøkkel som alle på maskinen kan lese, er ingen hemmelighet lenger, og SSH avviser den heller enn å bruke den. Riktige rettigheter er 700 på ~/.ssh, 600 på private nøkler og på config, 644 på offentlige nøkler. Dette er de samme rwx-bitene som i modul 5: 7 = rwx, 6 = rw-, 0 = ingenting, og første siffer er deg selv.",
    punch: "SSH er ett av få steder der for åpne rettigheter gir hard avvisning, ikke bare en advarsel.",
  },
];
