// ---------------------------------------------------------------------------
// Oppgavetype 1: ANSLÅ-SÅ-SJEKK.
//
// Disse kommer FØR forklaringen. Jobben deres er ikke å måle noe — den er å
// lage et hull hjernen vil fylle, slik at forklaringen etterpå lander i noe
// som allerede er spent opp. Derfor er de bevisst korte, og derfor er det
// ingen poengsum: du kan ikke «stryke» på en gjetning.
// ---------------------------------------------------------------------------

export interface PredictOption {
  id: string;
  label: string;
}

export interface PredictItem {
  id: string;
  /** Oppsettet — hva som skjer. */
  setup: string;
  /** Selve spørsmålet. */
  question: string;
  options: PredictOption[];
  correct: string;
  /** Avsløringen. Skal forklare mekanismen, ikke bare si hvem som vant. */
  reveal: string;
  /** Én linje som fester poenget. */
  punch: string;
}

export const PREDICT_ITEMS: PredictItem[] = [
  {
    id: "p1",
    setup: "Det finnes to helt forskjellige manualsider som begge heter passwd: kommandoen som endrer passord, og filen /etc/passwd.",
    question: "Du skriver `man passwd` uten noe mer. Hva får du opp?",
    options: [
      { id: "a", label: "Dokumentasjonen for kommandoen passwd" },
      { id: "b", label: "Dokumentasjonen for filen /etc/passwd" },
      { id: "c", label: "Begge to, etter hverandre" },
      { id: "d", label: "En feilmelding om at navnet er tvetydig" },
    ],
    correct: "a",
    reveal:
      "Du får kommandoen. Uten seksjonsnummer leter man gjennom seksjonene i stigende rekkefølge og viser den FØRSTE siden den finner. Kommandoen ligger i seksjon 1, filformatet i seksjon 5 — og 1 kommer først. Manualen sier aldri ifra om at det fantes flere treff.",
    punch: "Laveste seksjon vinner, i stillhet. Vil du ha filformatet, må du be om det: man 5 passwd.",
  },
  {
    id: "p2",
    setup: "Du husker ikke hva kommandoen for å endre filrettigheter heter, men du vet hva du vil oppnå.",
    question: "Hva skjer hvis du skriver `man permissions`?",
    options: [
      { id: "a", label: "Du får en oversiktsside om rettigheter" },
      { id: "b", label: "Du får en liste over alle sider som nevner rettigheter" },
      { id: "c", label: "Du får «Ingen manualside for permissions»" },
      { id: "d", label: "man foreslår chmod som nærmeste treff" },
    ],
    correct: "c",
    reveal:
      "Ingenting. man slår opp EKSAKT sidenavn — den søker ikke, og den gjetter ikke. Skal du lete etter et tema, er det apropos (eller det som er nøyaktig det samme: man -k) som søker i beskrivelsene til alle sidene.",
    punch: "man = jeg kjenner navnet. apropos = jeg kjenner bare behovet.",
  },
  {
    id: "p3",
    setup: "Du kan slå sammen kortflagg: `ls -lah` betyr det samme som `ls -l -a -h`.",
    question: "Fungerer den samme sammenslåingen for langflagg, altså `ls --all--human-readable`?",
    options: [
      { id: "a", label: "Ja, langflagg kan slås sammen på samme måte" },
      { id: "b", label: "Nei, langflagg må alltid skrives hver for seg" },
      { id: "c", label: "Ja, men bare hvis de skilles med komma" },
    ],
    correct: "b",
    reveal:
      "Bare kortflagg kan slås sammen. Grunnen er at et kortflagg alltid er nøyaktig én bokstav, så -lah kan leses entydig som tre flagg. Et langflagg er et helt ord, og da finnes det ingen måte å se hvor det ene slutter og det neste begynner.",
    punch: "Én bindestrek + én bokstav kan pakkes. To bindestreker + et ord kan ikke.",
  },
  {
    id: "p4",
    setup: "I mange programmer betyr -h det samme som --help.",
    question: "Hva skjer hvis du kjører `ls -h`?",
    options: [
      { id: "a", label: "Du får ls sin hjelpetekst" },
      { id: "b", label: "Du får en fillisting med størrelser som 4,0K og 2,3M" },
      { id: "c", label: "Du får en feilmelding om ukjent flagg" },
    ],
    correct: "b",
    reveal:
      "Du får en helt vanlig fillisting. For ls betyr -h «human-readable», altså lesbare størrelser. Det finnes ingen regel i Linux om hva en bokstav skal bety — hvert program bestemmer selv. Det eneste som er nær en standard, er den lange formen --help.",
    punch: "-h er ikke et systemflagg. Det er bare en bokstav hvert program tolker som det vil.",
  },
  {
    id: "p5",
    setup: "`cd` virker helt fint i terminalen din akkurat nå.",
    question: "Hva svarer `which cd`?",
    options: [
      { id: "a", label: "/usr/bin/cd" },
      { id: "b", label: "/bin/cd" },
      { id: "c", label: "Ingenting — which finner den ikke" },
      { id: "d", label: "cd er en skall-innebygd kommando" },
    ],
    correct: "c",
    reveal:
      "which finner ingenting og gir bare et tomt svar. Den leter utelukkende etter kjørbare filer i katalogene som står i miljøvariabelen PATH, og cd er ingen fil — den er kode inne i selve skallet. Verktøyet som faktisk svarer, er `type cd`, for type spør skallet i stedet for filsystemet.",
    punch: "which spør filsystemet. type spør skallet. Bare den siste kjenner innebygde kommandoer.",
  },
  {
    id: "p6",
    setup: "Du installerer et nytt program, og manualsiden følger med i pakken.",
    question: "Du kjører `apropos <programnavn>` rett etterpå og får «ingenting passende», men `man <programnavn>` virker. Hvem har rett?",
    options: [
      { id: "a", label: "man — siden finnes, apropos leser en indeks som ikke er oppdatert ennå" },
      { id: "b", label: "apropos — man viste en side fra en annen pakke" },
      { id: "c", label: "Begge feiler; siden ble installert på feil sted" },
    ],
    correct: "a",
    reveal:
      "Siden finnes. man leter i filsystemet hver gang, mens apropos og whatis slår opp i en forhåndsbygget indeks over alle NAME-linjer. Indeksen bygges av mandb, som kjører periodisk — ikke nødvendigvis i samme sekund som du installerte noe. `sudo mandb` bygger den på nytt med én gang.",
    punch: "Tom treffliste i apropos betyr «ikke i indeksen», ikke «finnes ikke».",
  },
];
