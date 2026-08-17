// ---------------------------------------------------------------------------
// Python kap. 5 — «Tell iterasjonene». Lab nummer to i lab-formatet.
//
// Hvorfor akkurat telling: en løkke er ikke vanskelig å lese, den er vanskelig
// å telle. Av-med-én er den vanligste feilen i hele kapittelet, og prosa av
// typen «husk at stoppverdien er eksklusiv» har aldri fjernet den. Her blir
// tallet målt i stedet for påstått — sandkassen viser hvor mange ganger hver
// linje faktisk kjørte, og oppgavene spør etter det tallet.
//
// Fem av oppgavene skiller mellom tellinger som studenter tror er like:
// løkkelinja mot kroppen (mens-betingelsen sjekkes én gang ekstra), to linjer
// i samme kropp (break og continue gjør dem ulike), og ytre mot indre løkke.
// Ingen av de skillene er synlige uten en måling per linje.
//
// Oppgave 5 og 9 er «modify»-oppgaver (PLAN-LABOPPGAVER.md §6.2): du skal endre
// koden til den oppfører seg som bestilt, og svaret er verdien du måtte finne
// for å få det til. Det er trinnet mellom å lese kode og å skrive den.
// ---------------------------------------------------------------------------

import { lagAnslagLager, type Anslag } from "../lab/anslag";
import { tall, type Oppgave } from "../lab/typer";
import { createFsrsStore } from "../learn/fsrs";

/* ------------------------------------------------------------------- anslag */

export const lokkeAnslagLager = lagAnslagLager("python-lokke-lab-anslag-v1");

export const ANSLAG: Anslag[] = [
  {
    id: "anslag-range-antall",
    sporsmal: "Hvor mange ganger kjører kroppen i `for i in range(2, 20, 3)`?",
    valg: ["6 ganger", "7 ganger", "18 ganger"],
    riktig: 0,
    knyttetTil: "range-antall",
    fasit:
      "Verdiene blir 2, 5, 8, 11, 14, 17 — seks stykker. 20 er stoppverdien og kommer aldri med, og 18 er avstanden fra 2 til 20, ikke antall steg.",
  },
  {
    id: "anslag-i-etterpa",
    sporsmal: "Finnes variabelen `i` fortsatt etter at `for i in range(...)` er ferdig?",
    valg: ["Nei, den forsvinner med løkka", "Ja, og den har siste verdien den fikk"],
    riktig: 1,
    knyttetTil: "i-etterpa",
    fasit:
      "En for-løkke lager ingen ny navnerom. `i` er en helt vanlig variabel i samme scope som resten av koden, og den beholder verdien fra siste gjennomløp. Det er derfor `i` kan brukes etter løkka — og derfor en gammel `i` kan overraske deg.",
  },
  {
    id: "anslag-while-linje",
    sporsmal:
      "En while-løkke går rundt 5 ganger. Hvor mange ganger blir selve betingelsen vurdert?",
    valg: ["5 ganger", "6 ganger", "Umulig å si"],
    riktig: 1,
    knyttetTil: "while-betingelse",
    fasit:
      "Én ekstra gang: den gangen betingelsen ble usann og løkka stoppet. Betingelsen må jo sjekkes for at løkka skal kunne gi seg. Kroppen kjører 5 ganger, while-linja 6.",
  },
  {
    id: "anslag-break-linjer",
    sporsmal:
      "En løkkekropp har to linjer, og et `break` mellom dem. Kjører de to linjene like mange ganger?",
    valg: ["Ja — de er i samme kropp", "Nei, den siste kjører færre ganger"],
    riktig: 1,
    knyttetTil: "break-print",
    fasit:
      "«Samme kropp» sier ingenting om antall kjøringer. `break` hopper ut midt i den siste runden, så alt etter break-en kjører én gang mindre. Det samme gjør `continue`. Én telling per linje er derfor det eneste som gir sannheten.",
  },
];

/* ---------------------------------------------------------------- oppgavene */

export const OPPGAVER: Oppgave[] = [
  {
    id: "oppvarming",
    tittel: "Les av telleren",
    oppdrag:
      "Kjør koden i sandkassen. Ved siden av hver linje står det hvor mange ganger den ble utført. Hvor mange ganger kjørte print-linja? Svaret er 5 — oppgaven er å finne det i målingen, så du vet hvor du skal se resten av laben.",
    verktoy: "sandkassen",
    kode: "for i in range(5):\n    print(i)",
    vist: true,
    hint: "Lim koden inn i sandkassen, trykk Kjør, og se på tallet i margen ved linje 2.",
    forklaring:
      "`range(5)` gir 0, 1, 2, 3, 4 — fem verdier, fem gjennomløp. Legg merke til at tallet står ved kroppen, ikke ved for-linja. Det skillet er hele grunnen til at målingen er per linje.",
    fasit: "5",
    sjekk: tall(5),
  },
  {
    id: "range-antall",
    tittel: "Steglengde og antall",
    oppdrag: "Hvor mange ganger kjører kroppen her?",
    verktoy: "range(start, stopp, steg)",
    kode: "for i in range(2, 20, 3):\n    print(i)",
    hint: "Ikke regn — kjør den, og les tellingen ved kroppen. Skriv gjerne ned anslaget ditt først.",
    forklaring:
      "2, 5, 8, 11, 14, 17 — seks verdier. Neste ville vært 20, og stoppverdien er eksklusiv, så løkka gir seg. Formelen er «hvor mange steg får plass før stopp», ikke «hvor langt er det til stopp».",
    fasit: "6",
    sjekk: tall(6, [
      {
        verdi: 7,
        si: "Du har trolig regnet med 20. Stoppverdien er eksklusiv — den siste verdien er 17.",
      },
      {
        verdi: 18,
        si: "18 er avstanden fra 2 til 20, ikke antall gjennomløp. Steget på 3 gjør at bare hver tredje verdi brukes.",
      },
      {
        verdi: 6.67,
        si: "Antall gjennomløp er alltid et helt tall — løkka kan ikke gå to tredjedels runde.",
      },
    ]),
  },
  {
    id: "i-etterpa",
    tittel: "Hva sitter igjen etterpå",
    oppdrag:
      "Kjør koden. Hvilken verdi har `i` etter at løkka er ferdig? Se i variabellista under utdataen.",
    verktoy: "sandkassen · variabler",
    kode: 'for i in range(2, 20, 3):\n    print(i)\n\nprint("ferdig")',
    hint: "Variabellista viser sluttverdien til alt som fortsatt finnes når programmet er over.",
    forklaring:
      "17. En for-løkke lager ikke sitt eget navnerom — `i` er en vanlig variabel som beholder siste verdi. Den blir aldri 20, for 20 kom aldri inn i løkka. Dette er også hvorfor en gjenbrukt `i` fra en tidligere løkke kan gi rare feil.",
    fasit: "17",
    sjekk: tall(17, [
      {
        verdi: 20,
        si: "20 er stoppverdien, og den kom aldri inn i `i`. Siste verdi som faktisk ble tildelt er den som blir stående.",
      },
      {
        verdi: 6,
        si: "6 er antall gjennomløp. Oppgaven spør om verdien i `i`, ikke om tellingen.",
      },
    ]),
  },
  {
    id: "while-betingelse",
    tittel: "Den ene ekstra sjekken",
    oppdrag:
      "Kjør koden. Hvor mange ganger ble selve while-linja utført — altså hvor mange ganger ble betingelsen vurdert?",
    verktoy: "while",
    kode: "n = 1\nrunder = 0\nwhile n < 100:\n    n = n * 3\n    runder = runder + 1",
    hint: "Sammenlign tallet ved linje 3 med tallet ved linje 4. De er ikke like, og differansen er hele poenget.",
    forklaring:
      "Kroppen kjører 5 ganger (n blir 3, 9, 27, 81, 243), men betingelsen vurderes 6 ganger: fem ganger sann, og én gang usann — den gangen løkka stoppet. En while-løkke sjekker alltid én gang mer enn den går rundt. Det er den ekstra sjekken som avslutter løkka.",
    fasit: "6",
    sjekk: tall(6, [
      {
        verdi: 5,
        si: "5 er antall ganger kroppen kjørte. Betingelsen må også sjekkes den gangen den ble usann — ellers hadde løkka aldri stoppet.",
      },
      {
        verdi: 243,
        si: "243 er sluttverdien til `n`. Oppgaven spør om antall vurderinger av betingelsen.",
      },
    ]),
  },
  {
    id: "steg-sju",
    tittel: "Finn steget som gir sju runder",
    oppdrag:
      "Bytt ut spørsmålstegnet i sandkassen slik at kroppen kjører nøyaktig 7 ganger. Hvilket steg måtte til?",
    verktoy: "modifiser koden",
    kode: "for i in range(3, 40, ?):\n    print(i)",
    hint: "Prøv deg fram og les tellingen etter hvert forsøk. Er du på 8 runder, er steget for kort.",
    forklaring:
      "6 gir 3, 9, 15, 21, 27, 33, 39 — sju verdier, og den neste (45) ligger utenfor. 5 gir åtte runder og 7 gir seks, så svaret er entydig. Å måtte treffe et bestemt antall er en helt annen ferdighet enn å lese av et antall, og det er den eksamen faktisk spør etter.",
    fasit: "6",
    sjekk: tall(6, [
      {
        verdi: 5,
        si: "Med steg 5 blir det 3, 8, 13, 18, 23, 28, 33, 38 — åtte runder. Du trenger et lengre steg.",
      },
      {
        verdi: 7,
        si: "Med steg 7 blir det bare seks runder (3, 10, 17, 24, 31, 38). Du trenger et kortere steg.",
      },
    ]),
  },
  {
    id: "break-print",
    tittel: "Linja som taper en runde",
    oppdrag:
      "Kjør koden. Hvor mange ganger kjørte print-linja? (Den er ikke like mange som if-linja over den.)",
    verktoy: "break",
    kode: "for i in range(10):\n    if i * i > 30:\n        break\n    print(i)",
    hint: "Se på tellingene ved linje 2 og linje 4 hver for seg.",
    forklaring:
      "if-linja kjørte 7 ganger (i = 0 til 6), men print bare 6. På den sjuende runden var 6*6 = 36 større enn 30, og `break` hoppet ut før print rakk å kjøre. To linjer i samme kropp, to forskjellige tall — det er nettopp det `break` gjør, og det er usynlig uten en telling per linje.",
    fasit: "6",
    sjekk: tall(6, [
      {
        verdi: 7,
        si: "7 er antall ganger if-linja kjørte. På den siste runden avbrøt `break` før print.",
      },
      {
        verdi: 10,
        si: "`range(10)` ville gitt ti runder uten break-en — men break-en stopper løkka tidlig.",
      },
    ]),
  },
  {
    id: "continue-tell",
    tittel: "Linja continue hopper over",
    oppdrag: "Hvor mange ganger kjørte linja `sum = sum + t`?",
    verktoy: "continue",
    kode: "sum = 0\nfor t in range(1, 21):\n    if t % 3 != 0:\n        continue\n    sum = sum + t",
    hint: "Løkka går 20 runder. Spørsmålet er hvor mange av dem som kom forbi `continue`.",
    forklaring:
      "6 — bare 3, 6, 9, 12, 15 og 18 er delelige på 3. `continue` hopper til neste runde uten å kjøre resten av kroppen, så for-linja teller 20 mens siste linje teller 6. Samme mekanisme som break, men uten å avslutte løkka.",
    fasit: "6",
    sjekk: tall(6, [
      {
        verdi: 20,
        si: "20 er antall runder i løkka. `continue` sørget for at de fleste av dem aldri nådde siste linje.",
      },
      {
        verdi: 63,
        si: "63 er summen som ble regnet ut. Oppgaven spør om antall kjøringer av linja.",
      },
    ]),
  },
  {
    id: "nostet",
    tittel: "Den innerste kroppen",
    oppdrag: "Hvor mange ganger kjører den innerste linja?",
    verktoy: "nøstede løkker",
    kode: "total = 0\nfor rad in range(4):\n    for kol in range(3):\n        total = total + 1",
    hint: "Ikke gjett på 4 + 3. Kjør den og les tellingen ved den innerste linja.",
    forklaring:
      "12 — den indre løkka kjøres helt gjennom én gang for hver runde i den ytre, altså 4 × 3. Det er dette som gjør nøstede løkker dyre: legger du til en tredje, ganges det igjen. Når du senere teller sammenligninger i en sorteringsalgoritme, er det nøyaktig samme regnestykke.",
    fasit: "12",
    sjekk: tall(12, [
      {
        verdi: 7,
        si: "7 er 4 + 3. Nøstede løkker ganges, ikke legges sammen — den indre kjøres på nytt for hver runde i den ytre.",
      },
      {
        verdi: 4,
        si: "4 er antall runder i den ytre løkka. Den innerste linja kjører flere ganger per ytre runde.",
      },
    ]),
  },
  {
    id: "evig-lokke",
    tittel: "Løkka som aldri stoppet",
    oppdrag:
      "Kjør koden i sandkassen — den stopper aldri, og sandkassen avbryter den. Legg så til `n = n - 1` nederst i kroppen og kjør igjen. Hvor mange ganger kjører kroppen da?",
    verktoy: "feilsøking",
    kode: "n = 10\nwhile n > 0:\n    print(n)",
    hint: "Variabelen som står i betingelsen må endres inne i kroppen. Ellers er betingelsen like sann for alltid.",
    forklaring:
      "10 — n teller ned fra 10 til 1, og på den ellevte sjekken er n blitt 0 og løkka gir seg. Uten `n = n - 1` endres aldri betingelsen, og en betingelse som ikke kan bli usann er nettopp definisjonen på en evig løkke. Det er derfor sandkassen måtte avbryte: den talte over 200 000 linjekjøringer og skjønte at dette aldri tar slutt.",
    fasit: "10",
    sjekk: tall(10, [
      {
        verdi: 11,
        si: "Betingelsen vurderes 11 ganger, men kroppen kjører 10. Oppgaven spør om kroppen.",
      },
      {
        verdi: 9,
        si: "Tell med den runden der n er 1: den er fortsatt større enn 0, så kroppen kjører.",
      },
    ]),
  },
];

/* ------------------------------------------------------ startkode i sandkassen */

/** Koden sandkassen åpner med. Skal vise en telling som ikke er triviell. */
export const STARTKODE = `# Skriv hva du vil. Ingenting her teller — telleren i margen
# viser hvor mange ganger hver linje faktisk kjørte.

n = 1
runder = 0
while n < 100:
    n = n * 3
    runder = runder + 1

print("n endte på", n)
print("runder:", runder)
`;

/* ------------------------------------------------------------- recall-kort */

export const lokkeFsrs = createFsrsStore("python-lokke-lab-fsrs-v1");

export interface LokkeKort {
  id: string;
  front: string;
  back: string;
  tag: "telling" | "kontrollflyt";
}

export const LOKKE_KORT: LokkeKort[] = [
  {
    id: "plk-range-antall",
    tag: "telling",
    front: "Hvor mange verdier gir `range(start, stopp, steg)`?",
    back: "Så mange steg som får plass FØR stopp — stoppverdien er eksklusiv. `range(2, 20, 3)` gir 2, 5, 8, 11, 14, 17: seks verdier. Avstanden mellom start og stopp er ikke antallet.",
  },
  {
    id: "plk-i-etterpa",
    tag: "telling",
    front: "Hva er løkkevariabelen verdt etter at for-løkka er ferdig?",
    back: "Den siste verdien den faktisk fikk — aldri stoppverdien. En for-løkke lager ikke eget navnerom, så variabelen lever videre etterpå.",
  },
  {
    id: "plk-while-ekstra",
    tag: "telling",
    front: "En while-løkke går rundt N ganger. Hvor mange ganger vurderes betingelsen?",
    back: "N + 1. Den siste vurderingen er den som blir usann og avslutter løkka. Kroppen og betingelsen har derfor aldri samme telling.",
  },
  {
    id: "plk-break-continue",
    tag: "kontrollflyt",
    front: "Hva skiller `break` fra `continue`?",
    back: "`break` avslutter hele løkka med én gang. `continue` hopper til neste runde uten å kjøre resten av kroppen. Begge gjør at linjer i samme kropp får ulike tellinger.",
  },
  {
    id: "plk-nostet",
    tag: "telling",
    front: "En ytre løkke går 4 runder, den indre 3. Hvor mange ganger kjører den innerste linja?",
    back: "12 — nøstede løkker ganges, ikke legges sammen. Den indre løkka kjøres helt gjennom på nytt for hver runde i den ytre. Samme regnestykke gjelder når du senere teller sammenligninger i en sortering.",
  },
  {
    id: "plk-evig",
    tag: "kontrollflyt",
    front: "Hva gjør en while-løkke evig?",
    back: "At ingenting i kroppen endrer variablene betingelsen leser. En betingelse som ikke kan bli usann, blir aldri usann. Sjekken er: hvilken linje i kroppen flytter meg nærmere at betingelsen slår feil?",
  },
];

/* -------------------------------------------------------------- oppslag */

/** Oppgave etter id. */
export function oppgaveFor(id: string): Oppgave | undefined {
  return OPPGAVER.find((o) => o.id === id);
}

/** Koden en oppgave gjelder, klar til å limes inn i sandkassen. */
export function kodeFor(id: string): string | undefined {
  return oppgaveFor(id)?.kode;
}
