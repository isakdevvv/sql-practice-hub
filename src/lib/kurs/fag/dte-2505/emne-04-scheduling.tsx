// Emne 4 — Scheduling.
// OSTEP-dybde. Bygger på prosesstilstandene fra emne 3: scheduleren jobber
// utelukkende med prosessene som står i «klar».

import type { Emne } from "@/lib/kurs/types";
import {
  anslag,
  intro,
  konsept,
  kode,
  oppsummering,
  recall,
  sjekk,
  tallanslag,
  visual,
} from "./byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { SchedulingSimulator } from "@/components/stack/dte2505-scheduling-drill/SchedulingSimulator";
import { ContextSwitchSimulator } from "@/components/stack/dte2505-kontekstbytte/ContextSwitchSimulator";
import { StepOrderDragQuiz } from "@/components/stack/dte2505-kontekstbytte/StepOrderDragQuiz";

export const emneScheduling: Emne = {
  slug: "scheduling",
  tittel: "Scheduling",
  sporsmal: "Hvem får prosessoren nå, og hvordan avgjøres det uten å vite fremtiden?",
  pensum: "OSTEP-dybde til modul 3",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "hva-scheduleren-vil",
      tittel: "Hva en scheduler prøver å oppnå",
      utbytte:
        "Du kan regne ut ventetid, ferdigtid og responstid for et jobbsett, og forklare hvorfor de trekker i hver sin retning.",
      byggerPa: ["prosesstilstander"],
      skjermer: [
        intro("sw-1-intro", "Køen foran prosessoren", {
          ingress: (
            <>
              Scheduleren har én oppgave: velge hvilken av de klare prosessene som skal kjøre nå.
              Det høres enkelt ut helt til du prøver å bestemme hva «best» betyr.
            </>
          ),
        }),
        konsept("sw-2-mal", "Fire mål som slåss", {
          ingress: <>Alle fire er rimelige. Ingen scheduler klarer alle samtidig.</>,
          punkter: [
            <>
              <Term>Ferdigtid</Term> (turnaround) — tiden fra jobben kom til den var ferdig.
            </>,
            <>
              <Term>Responstid</Term> — tiden fra jobben kom til den fikk kjøre første gang.
            </>,
            <>
              <Term>Gjennomstrømning</Term> — antall jobber fullført per tidsenhet.
            </>,
            <>
              <Term>Rettferdighet</Term> — at ingen sulter i hjel mens andre spiser.
            </>,
          ],
          merk: (
            <>
              Ferdigtid og responstid er de to som slåss mest. Å bytte ofte gir god responstid, men
              hvert bytte koster tid som ingen jobb blir ferdigere av.
            </>
          ),
        }),
        kode("sw-3-regne", "Lær først: regn ut for hånd", {
          ingress: (
            <>
              Tre jobber, alle ankommer på tid 0, kjøres i rekkefølge A, B, C. Her er
              utregningen ferdig satt opp — les den før du prøver selv.
            </>
          ),
          filnavn: "A=10, B=10, C=10 · rekkefølge A→B→C",
          kode: `Jobb   start   ferdig   ferdigtid   responstid
A        0       10        10           0
B       10       20        20          10
C       20       30        30          20

Snitt ferdigtid  = (10 + 20 + 30) / 3 = 20
Snitt responstid = ( 0 + 10 + 20) / 3 = 10`,
          punkter: [
            "Ferdigtid = ferdig minus ankommet. Her ankom alle på 0, så ferdigtid = ferdig.",
            "Responstid = første gang den kjørte, minus ankommet.",
          ],
        }),
        tallanslag("sw-4-prov", "Prøv selv", {
          sporsmal: (
            <>
              Nå snur vi: jobbene er A=5, B=5, C=20, alle ankommer på tid 0, og kjøres i
              rekkefølge C, A, B. Hva blir gjennomsnittlig ferdigtid?
            </>
          ),
          enhet: "tidsenheter",
          fasitTall: 25,
          fasit: (
            <>
              C blir ferdig på 20, A på 25, B på 30. Snitt = (20+25+30)/3 = 25. Med rekkefølgen A,
              B, C i stedet hadde snittet vært (5+10+30)/3 = 15. Samme jobber, samme total
              CPU-tid — bare rekkefølgen skiller. Det er hele poenget med scheduling.
            </>
          ),
        }),
        anslag("sw-5-anslag", "Hva ofrer du?", {
          sporsmal: (
            <>
              Du lager en scheduler som bytter jobb hvert millisekund, for at alt skal føles
              lynraskt. Hva blir dyrt?
            </>
          ),
          valg: [
            { tekst: "Responstiden blir dårlig" },
            { tekst: "Ferdigtiden blir dårligere, fordi byttene koster" },
            { tekst: "Rettferdigheten blir dårligere" },
          ],
          fasit: (
            <>
              Ferdigtiden. Responstiden blir tvert imot utmerket. Men hvert bytte koster noen
              mikrosekunder i ren overhead, pluss at hurtigbufferne blir kalde. Bytter du tusen
              ganger i sekundet, går en merkbar del av maskinen til å bytte i stedet for å regne.
            </>
          ),
        }),
        sjekk("sw-6-sjekk", "Hvilket mål?", {
          sporsmal: (
            <>
              En tekstredigerer skal føles behagelig å skrive i. Hvilket mål er viktigst for den?
            </>
          ),
          valg: [
            { tekst: "Ferdigtid", hvorfor: "Redigereren blir aldri «ferdig» — den lever hele økten." },
            { tekst: "Responstid", riktig: true, hvorfor: "Bokstaven må dukke opp på skjermen med én gang du taster." },
            { tekst: "Gjennomstrømning", hvorfor: "Det er et mål for tjenere med mange jobber, ikke for interaktive programmer." },
          ],
          fasit: (
            <>
              Responstid. Interaktive programmer bruker CPU i korte glimt og venter resten av
              tiden. Alt de trenger er å komme til raskt når de først vil noe. Det er observasjonen
              hele MLFQ bygger på — vi kommer dit.
            </>
          ),
        }),
        recall("sw-7-recall", [
          {
            forside: "Hva er forskjellen på ferdigtid og responstid?",
            bakside: "Ferdigtid = ferdig minus ankommet. Responstid = første gang den kjørte minus ankommet.",
          },
          {
            forside: "Hvorfor kan ikke en scheduler optimere både responstid og ferdigtid?",
            bakside: "God responstid krever hyppige bytter, og hvert bytte koster tid som ikke gjør noen jobb ferdigere.",
          },
          {
            forside: "Hva betyr sulting?",
            bakside: "At en prosess aldri får tur fordi andre stadig prioriteres foran den.",
          },
        ]),
        oppsummering("sw-8-opp", {
          punkter: [
            "Fire mål: ferdigtid, responstid, gjennomstrømning, rettferdighet.",
            "Rekkefølgen alene endrer snittet dramatisk.",
            "Hyppige bytter kjøper responstid med ferdigtid.",
          ],
          videre: "Neste: den enkleste schedulerne som finnes — og hvorfor den er så dårlig.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "fifo-sjf-stcf",
      tittel: "Førstemann, korteste jobb, og avbrudd",
      utbytte:
        "Du kan forklare konvoieffekten, hvorfor korteste-jobb-først er optimalt for ferdigtid, og hvorfor det likevel ikke kan brukes.",
      byggerPa: ["hva-scheduleren-vil"],
      skjermer: [
        intro("fs-1-intro", "Køen i kassa", {
          ingress: (
            <>
              Du står bak én person med en full handlevogn. Du har én melk. Køen er helt rettferdig
              — og likevel er den åpenbart feil.
            </>
          ),
        }),
        konsept("fs-2-fifo", "Førstemann til mølla", {
          ingress: (
            <>
              <Term>FIFO</Term> (først inn, først ut) kjører jobbene i ankomstrekkefølge, og lar
              hver av dem holde på til den er ferdig.
            </>
          ),
          punkter: [
            "Trivielt å implementere, og helt rettferdig i én forstand: ingen snyter i køen.",
            "Ingen avbrudd underveis — jobben gir seg når den er ferdig.",
            "Katastrofal hvis en lang jobb kommer først.",
          ],
          merk: (
            <>
              Vi kaller det <Term>konvoieffekten</Term>: korte jobber hoper seg opp bak én lang, som
              biler bak en traktor.
            </>
          ),
        }),
        anslag("fs-3-anslag", "Hvor mye taper du?", {
          sporsmal: (
            <>
              Tre jobber ankommer samtidig: en på 100 tidsenheter og to på 10. Hvor mye bedre blir
              gjennomsnittlig ferdigtid hvis du kjører de korte først, i stedet for den lange
              først?
            </>
          ),
          valg: [
            { tekst: "Litt bedre, kanskje 10 %" },
            { tekst: "Omtrent dobbelt så bra" },
            { tekst: "Mer enn tre ganger så bra" },
          ],
          fasit: (
            <>
              Mer enn tre ganger. Lang først: (100+110+120)/3 = 110. Korte først: (10+20+120)/3 =
              50. Samme arbeid, samme maskin, ingen ekstra kostnad — bare en annen rekkefølge.
            </>
          ),
        }),
        konsept("fs-4-sjf", "Korteste jobb først", {
          ingress: (
            <>
              <Term>SJF</Term> (shortest job first) plukker alltid den korteste av jobbene som
              venter. For jobber som ankommer samtidig er det beviselig optimalt for
              gjennomsnittlig ferdigtid.
            </>
          ),
          punkter: [
            "Ingen annen rekkefølge kan gi lavere snitt ferdigtid.",
            "Men: den er ikke-preemptiv. En ny kort jobb må vente på den som kjører.",
            "Og: lange jobber kan sulte hvis korte fortsetter å strømme inn.",
          ],
        }),
        konsept("fs-5-stcf", "Med avbrudd: korteste gjenstående", {
          ingress: (
            <>
              <Term>STCF</Term> (shortest time-to-completion first) er SJF som får lov til å
              avbryte. Kommer det en jobb med kortere gjenstående tid enn den som kjører, byttes det
              med én gang.
            </>
          ),
          punkter: [
            <>
              Å ta prosessoren fra en prosess som ikke ba om det heter <Term>preemption</Term>, på
              norsk fortrengning.
            </>,
            "Krever en timer som avbryter — ellers kunne kjernen aldri tatt kontrollen tilbake.",
            "Optimal for ferdigtid også når jobber ankommer til ulik tid.",
          ],
        }),
        visual("fs-6-sim", "Kjør algoritmene mot hverandre", {
          ledetekst: <>Samme jobbsett, ulike algoritmer. Se Gantt-diagrammet og tallene.</>,
          Viz: SchedulingSimulator,
          hint: "Legg en lang jobb først og sammenlign FIFO med STCF. Se så på responstiden — der taper begge.",
        }),
        konsept("fs-7-problemet", "Hvorfor SJF ikke kan brukes", {
          ingress: (
            <>
              Både SJF og STCF trenger å vite hvor lenge en jobb kommer til å kjøre. Den
              informasjonen finnes ikke.
            </>
          ),
          punkter: [
            "Ingen prosess vet selv hvor lenge den skal kjøre.",
            "Å spørre programmereren fungerer ikke: alle ville svart «kort».",
            "Løsningen blir å gjette ut fra fortiden — som er nettopp det MLFQ gjør.",
          ],
        }),
        sjekk("fs-8-sjekk", "Hvilken lider mest?", {
          sporsmal: <>Under ren STCF — hvilken jobbtype risikerer å sulte?</>,
          valg: [
            { tekst: "Korte jobber", hvorfor: "De prioriteres alltid først." },
            { tekst: "Lange jobber", riktig: true, hvorfor: "De skyves bakover hver gang en kortere jobb ankommer." },
            { tekst: "Ingen — STCF er rettferdig", hvorfor: "STCF optimerer ferdigtid, ikke rettferdighet." },
          ],
          fasit: (
            <>
              Lange. Strømmer det inn korte jobber, blir den lange stadig fortrengt og kan i
              prinsippet aldri bli ferdig. Rettferdighet var jo ett av de fire målene — og STCF
              ofrer det helt.
            </>
          ),
        }),
        recall("fs-9-recall", [
          {
            forside: "Hva er konvoieffekten?",
            bakside: "Korte jobber hoper seg opp bak en lang jobb under FIFO, og alle får dårlig ferdigtid.",
          },
          {
            forside: "Hva er forskjellen på SJF og STCF?",
            bakside: "SJF avbryter ikke en jobb som kjører. STCF fortrenger den hvis en jobb med kortere gjenstående tid ankommer.",
          },
          {
            forside: "Hvorfor kan ikke SJF brukes i praksis?",
            bakside: "Fordi ingen vet hvor lenge en jobb kommer til å kjøre før den er ferdig.",
          },
        ]),
        oppsummering("fs-10-opp", {
          punkter: [
            "FIFO er enkel og gir konvoieffekt.",
            "SJF er optimal for ferdigtid, STCF også med ankomst underveis.",
            "Begge krever kunnskap om fremtiden, og begge sulter lange jobber.",
          ],
          videre: "Neste: å gi opp optimal ferdigtid til fordel for respons.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "round-robin-og-kvantum",
      tittel: "Runddans og tidskvantum",
      utbytte:
        "Du kan begrunne valget av tidskvantum, og forklare hva som skjer i grensetilfellene.",
      byggerPa: ["fifo-sjf-stcf"],
      skjermer: [
        intro("rr-1-intro", "Bytt på tur", {
          ingress: (
            <>
              Hvis målet er at alle skal føle at de kommer til, er svaret enkelt: gi alle en liten
              bit av gangen, og gå rundt.
            </>
          ),
        }),
        konsept("rr-2-rr", "Runddans", {
          ingress: (
            <>
              <Term>Round-robin</Term> gir hver klar prosess en fast tidsbit — et{" "}
              <Term>tidskvantum</Term> — og går så videre til neste i køen.
            </>
          ),
          punkter: [
            "Utmerket responstid: med N prosesser venter ingen mer enn N kvanta.",
            "Dårlig ferdigtid: alle blir ferdige omtrent samtidig, altså sent.",
            "Ingen sulter. Alle kommer til, alltid.",
          ],
        }),
        anslag("rr-3-anslag", "Kvantum mot uendelig", {
          sporsmal: <>Hva blir round-robin hvis du setter tidskvantumet uendelig stort?</>,
          valg: [
            { tekst: "FIFO" },
            { tekst: "SJF" },
            { tekst: "Den slutter å virke" },
          ],
          fasit: (
            <>
              FIFO. Med et kvantum ingen jobb rekker å bruke opp, blir hver jobb kjørende til den er
              ferdig — nøyaktig førstemann-til-mølla. Grensetilfellene er en god måte å teste at du
              har forstått algoritmen.
            </>
          ),
        }),
        konsept("rr-4-lite", "Og hvis kvantumet blir for lite?", {
          ingress: <>Den andre grensen er verre, og mer lærerik.</>,
          punkter: [
            "Hvert bytte koster: lagre registre, laste nye, kalde hurtigbuffere.",
            "Er kvantumet 10 mikrosekunder og byttet koster 5, går halve maskinen til overhead.",
            "Tommelfingerregel: kvantumet bør være mange ganger større enn byttekostnaden.",
          ],
          merk: <>Linux bruker i praksis kvanta i størrelsesorden 1–10 millisekunder.</>,
        }),
        visual("rr-5-sim", "Skru på kvantumet", {
          ledetekst: <>Velg round-robin i simulatoren og varier kvantumet.</>,
          Viz: SchedulingSimulator,
          hint: "Følg med på begge tallene samtidig: når responstiden faller, stiger ferdigtiden. Det er avveiningen i ett bilde.",
        }),
        tallanslag("rr-6-tall", "Verste ventetid", {
          sporsmal: (
            <>
              Fem klare prosesser, round-robin med kvantum på 4 millisekunder. Hva er det lengste
              en prosess må vente på tur, i millisekunder?
            </>
          ),
          enhet: "ms",
          fasitTall: 16,
          fasit: (
            <>
              16 ms. De fire andre kjører 4 ms hver før det er din tur igjen. Generelt:
              (N−1) × kvantum. Det er dette tallet som avgjør om en maskin føles responsiv, og det
              er derfor kvantumet ikke kan være stort.
            </>
          ),
        }),
        sjekk("rr-7-sjekk", "Hvem gir fra seg tidlig?", {
          sporsmal: (
            <>
              En prosess venter på tastetrykk og bruker bare 0,2 ms av kvantumet sitt før den
              blokkerer. Hva skjer med resten av kvantumet?
            </>
          ),
          valg: [
            { tekst: "Det står ubrukt til prosessen kommer tilbake", hvorfor: "Da hadde prosessoren stått stille uten grunn." },
            { tekst: "Neste prosess i køen får kjøre med én gang", riktig: true, hvorfor: "Blokkering utløser umiddelbart et bytte." },
            { tekst: "Prosessen straffes med kortere kvantum neste gang", hvorfor: "Ren round-robin straffer ingen — men MLFQ belønner faktisk dette." },
          ],
          fasit: (
            <>
              Neste prosess får kjøre. Interaktive prosesser gir nesten alltid fra seg kvantumet
              tidlig, fordi de blokkerer på inn- og utdata. Den observasjonen — «den som gir seg
              tidlig er sannsynligvis interaktiv» — er akkurat det neste undertema bygger på.
            </>
          ),
        }),
        recall("rr-8-recall", [
          {
            forside: "Hva blir round-robin når kvantumet går mot uendelig?",
            bakside: "FIFO — hver jobb kjører til den er ferdig.",
          },
          {
            forside: "Hva er verste ventetid i round-robin med N prosesser?",
            bakside: "(N−1) ganger tidskvantumet.",
          },
          {
            forside: "Hvorfor kan ikke tidskvantumet være veldig lite?",
            bakside: "Fordi hvert bytte har en fast kostnad. Blir kvantumet nær byttekostnaden, går mye av maskinen til overhead.",
          },
        ]),
        oppsummering("rr-9-opp", {
          punkter: [
            "Round-robin kjøper responstid og rettferdighet med ferdigtid.",
            "Kvantumet må være mye større enn byttekostnaden.",
            "En prosess som blokkerer, gir fra seg resten av kvantumet.",
          ],
          videre: "Neste: en scheduler som lærer hvilke prosesser som er interaktive.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "mlfq-og-cfs",
      tittel: "Køer på flere nivåer",
      utbytte:
        "Du kan forklare hvordan en scheduler kan gjette jobbtypen ut fra oppførsel, og hvorfor den må løfte alle med jevne mellomrom.",
      byggerPa: ["round-robin-og-kvantum"],
      skjermer: [
        intro("ml-1-intro", "Gjett uten å spørre", {
          ingress: (
            <>
              Vi vil ha SJF sin ferdigtid og round-robin sin responstid, uten å vite noe om
              fremtiden. Trikset er å slutte å spørre og begynne å observere.
            </>
          ),
        }),
        konsept("ml-2-ideen", "Ideen", {
          ingress: (
            <>
              <Term>MLFQ</Term> (multi-level feedback queue — flernivåkø med tilbakemelding) har
              flere køer med hver sin prioritet, og flytter prosesser mellom dem basert på
              oppførsel.
            </>
          ),
          punkter: [
            "Alle starter på øverste nivå — vi antar at du er kort og interaktiv.",
            "Bruker du opp hele kvantumet ditt, degraderes du ett nivå.",
            "Blokkerer du før kvantumet er ute, får du beholde nivået.",
            "Scheduleren kjører alltid den høyeste ikke-tomme køen, round-robin innad.",
          ],
          merk: (
            <>
              Ingen har fortalt scheduleren noe. Den bare ser hvem som gir seg tidlig, og
              konkluderer at de er interaktive.
            </>
          ),
        }),
        anslag("ml-3-anslag", "Hva går galt?", {
          sporsmal: (
            <>
              Med reglene over: en lang beregning har sunket til nederste nivå. Så starter du en
              haug med interaktive programmer. Hva skjer med beregningen?
            </>
          ),
          valg: [
            { tekst: "Den fortsetter jevnt, bare litt tregere" },
            { tekst: "Den sulter — den kommer aldri til" },
            { tekst: "Den løftes automatisk opp igjen" },
          ],
          fasit: (
            <>
              Den sulter. Så lenge det finnes noe på et høyere nivå, kjøres aldri det nederste.
              Dette er den store feilen i den naive versjonen, og løsningen er en femte regel.
            </>
          ),
        }),
        konsept("ml-4-boost", "Regelen som redder det", {
          ingress: (
            <>
              Med jevne mellomrom løftes <em>alle</em> prosesser tilbake til øverste nivå. Vi kaller
              det et periodisk løft.
            </>
          ),
          punkter: [
            "Sultne beregninger får garantert komme til igjen.",
            "En prosess som har endret karakter — fra beregning til interaktiv — får en ny sjanse.",
            "Løftes det for ofte, ligner MLFQ på ren round-robin. For sjelden, og sultingen består.",
          ],
        }),
        konsept("ml-5-juks", "Å lure scheduleren", {
          ingress: (
            <>
              Reglene så langt har et hull: gi fra deg prosessoren rett før kvantumet er ute, og du
              beholder høy prioritet for alltid — mens du likevel bruker nesten hele kvantumet.
            </>
          ),
          punkter: [
            "Et program kunne kalt sleep(1 mikrosekund) rett før kvantumet gikk ut.",
            "Løsningen: tell samlet brukt tid på nivået, ikke om ett kvantum ble oppbrukt.",
            "Bruker du opp budsjettet ditt på nivået, degraderes du — uansett hvordan.",
          ],
        }),
        konsept("ml-6-cfs", "Hva Linux faktisk gjør", {
          ingress: (
            <>
              Linux brukte lenge en scheduler som het CFS (completely fair scheduler), og bruker nå
              en videreutvikling av den. Den tenker i regnskap, ikke i nivåer.
            </>
          ),
          punkter: [
            "Hver prosess har en teller over hvor mye CPU-tid den har fått, vektet etter prioritet.",
            "Scheduleren kjører alltid den med lavest teller — altså den som ligger mest bakpå.",
            <>
              Prioritet settes med <Kodelinje>nice</Kodelinje>: −20 er høyest, +19 lavest.
            </>,
            "Resultatet ligner MLFQ i praksis: interaktive prosesser bruker lite, og ligger derfor alltid bakpå.",
          ],
        }),
        kode("ml-7-nice", "Prioritet i praksis", {
          kode: `nice -n 10 ./tung-beregning.sh   # start snillere enn normalt
renice -n 5 -p 4200              # endre en som allerede kjører
ps -o pid,ni,cmd                 # NI-kolonnen viser nice-verdien`,
          punkter: [
            "Høy nice-verdi = snill mot andre = lavere prioritet.",
            "Bare root kan sette negativ nice-verdi.",
          ],
        }),
        sjekk("ml-8-sjekk", "Hvorfor løftet?", {
          sporsmal: <>Hva er hovedgrunnen til at MLFQ løfter alle prosesser opp med jevne mellomrom?</>,
          valg: [
            { tekst: "For å gjøre scheduleren raskere", hvorfor: "Løftet koster tid, det sparer den ikke." },
            { tekst: "For å hindre at lange jobber sulter", riktig: true, hvorfor: "Uten løft kjøres nederste kø aldri når høyere nivåer har noe." },
            { tekst: "For å spare strøm", hvorfor: "Løftet har ingenting med strøm å gjøre." },
          ],
          fasit: (
            <>
              For å hindre sulting — og som bonus å oppdage at en prosess har endret karakter. En
              beregning som plutselig begynner å vente på nettverk, hører hjemme høyere oppe igjen.
            </>
          ),
        }),
        recall("ml-9-recall", [
          {
            forside: "Hvordan gjetter MLFQ at en prosess er interaktiv?",
            bakside: "Den ser at prosessen blokkerer før kvantumet er brukt opp, og lar den beholde høy prioritet.",
          },
          {
            forside: "Hva er det periodiske løftet, og hvilket problem løser det?",
            bakside: "Alle prosesser flyttes tilbake til øverste kø med jevne mellomrom. Det hindrer at lange jobber sulter.",
          },
          {
            forside: "Hva betyr nice-verdi +19 mot −20?",
            bakside: "+19 er lavest prioritet (mest snill), −20 er høyest. Bare root kan sette negative verdier.",
          },
        ]),
        oppsummering("ml-10-opp", {
          punkter: [
            "MLFQ observerer oppførsel i stedet for å spørre om fremtiden.",
            "Periodisk løft hindrer sulting og fanger opp endret karakter.",
            "Linux bruker et rettferdighetsregnskap som gir liknende resultat.",
          ],
          videre: "Neste: hva et bytte faktisk koster, steg for steg.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kontekstbytte",
      tittel: "Kontekstbyttet",
      utbytte:
        "Du kan sette stegene i et kontekstbytte i riktig rekkefølge, og forklare hvor den skjulte kostnaden ligger.",
      byggerPa: ["mlfq-og-cfs"],
      skjermer: [
        intro("kb-1-intro", "Å legge fra seg og ta opp igjen", {
          ingress: (
            <>
              Hver gang scheduleren bytter prosess, må hele tilstanden til den ene legges vekk og
              hele tilstanden til den andre hentes fram. Vi kaller det et{" "}
              <Term>kontekstbytte</Term>.
            </>
          ),
        }),
        tallanslag("kb-2-tall", "Hvor lang tid?", {
          sporsmal: (
            <>
              Hvor mange mikrosekunder tror du et kontekstbytte mellom to prosesser tar på moderne
              maskinvare?
            </>
          ),
          enhet: "mikrosekunder",
          fasitTall: 3,
          fasit: (
            <>
              Selve bytterutinen tar under ett mikrosekund. Men den skjulte kostnaden — at
              hurtigbuffere og adresseoversetting blir kalde og må bygges opp igjen — gjør at den
              reelle kostnaden ofte havner rundt 2–5 mikrosekunder. Det er derfor tallet er så
              vanskelig å måle: mesteparten av regningen kommer etterpå.
            </>
          ),
        }),
        konsept("kb-3-steg", "Hva som skjer", {
          ingress: <>Rekkefølgen er den samme hver gang.</>,
          punkter: [
            "En timer eller et systemkall utløser trap til kjernemodus.",
            "Registrene til prosessen som kjørte lagres i dens prosesskontrollblokk.",
            "Scheduleren velger neste prosess.",
            "Den nyes registre og minnekart lastes inn, og kjernen returnerer til brukermodus.",
          ],
          merk: (
            <>
              Legg merke til at instruksjonspekeren lagres og gjenopprettes som alle andre
              registre. Det er derfor prosessen fortsetter nøyaktig der den slapp.
            </>
          ),
        }),
        visual("kb-4-sim", "Se byttet skje", {
          ledetekst: <>Steg deg gjennom et helt kontekstbytte.</>,
          Viz: ContextSwitchSimulator,
          hint: "Se hva som skjer med instruksjonspekeren. Den er hele grunnen til at prosessen ikke merker noe.",
        }),
        konsept("kb-5-skjult", "Den skjulte regningen", {
          ingress: (
            <>
              Instruksjonene i selve bytterutinen er få. Det dyre er det som skjer i minutter
              etterpå.
            </>
          ),
          punkter: [
            "Hurtigbufferen er full av den gamle prosessens data — den nye må hente alt fra RAM.",
            "Oversettingsbufferen for adresser må fylles på nytt.",
            "Grenprediktoren har lært seg feil program.",
            "Alt dette blir gradvis bygget opp igjen, og gjør de første tusen instruksjonene trege.",
          ],
          bihjelp: (
            <>
              Bytte mellom to <em>tråder</em> i samme prosess er billigere: minnekartet er det
              samme, så adresseoversettingen overlever. Neste emne handler om nettopp det.
            </>
          ),
        }),
        visual("kb-6-quiz", "Prøv selv: riktig rekkefølge", {
          ledetekst: <>Nå uten fasit foran deg — sett stegene i riktig rekkefølge.</>,
          Viz: StepOrderDragQuiz,
          hint: "Spør deg hvert steg: hvem har kontrollen akkurat nå, prosessen eller kjernen?",
        }),
        sjekk("kb-7-sjekk", "Hvem lagrer?", {
          sporsmal: <>Hvem lagrer registrene til prosessen som blir byttet ut?</>,
          valg: [
            { tekst: "Prosessen selv, før den gir seg", hvorfor: "Prosessen vet ikke engang at den blir byttet ut — timeren avbrøt den midt i noe." },
            { tekst: "Kjernen, i kjernemodus", riktig: true, hvorfor: "Byttet skjer i kjernen etter et trap." },
            { tekst: "Scheduleren i brukermodus", hvorfor: "Scheduleren er kjernekode og kjører i kjernemodus." },
          ],
          fasit: (
            <>
              Kjernen. Prosessen har ingen anelse om at den ble avbrutt. Fra dens side fortsetter
              den bare på neste instruksjon — tiden som gikk imellom er usynlig.
            </>
          ),
        }),
        recall("kb-8-recall", [
          {
            forside: "Hva lagres og gjenopprettes i et kontekstbytte?",
            bakside: "Registrene, inkludert instruksjonspekeren, samt peker til minnekartet. Alt ligger i prosesskontrollblokken.",
          },
          {
            forside: "Hvorfor er den reelle kostnaden større enn selve bytterutinen?",
            bakside: "Fordi hurtigbuffere, adresseoversetting og grenprediksjon blir kalde og må bygges opp igjen.",
          },
          {
            forside: "Hvorfor er trådbytte billigere enn prosessbytte?",
            bakside: "Fordi tråder i samme prosess deler minnekart, så adresseoversettingen ikke må kastes.",
          },
        ]),
        oppsummering("kb-9-opp", {
          punkter: [
            "Trap, lagre, velg, laste, tilbake.",
            "Selve byttet er raskt; de kalde bufferne er det dyre.",
            "Prosessen merker aldri at den ble avbrutt.",
          ],
          videre: "Neste emne: minnet — illusjonen som gjør at hver prosess tror den er alene.",
        }),
      ],
    },
  ],
};
