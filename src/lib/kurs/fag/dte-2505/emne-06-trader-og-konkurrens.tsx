// Emne 6 — Tråder og konkurrens.
// OSTEP-dybde. Forutsetter prosessabstraksjonen (emne 3) og adresserommet
// (emne 5): en tråd er nettopp en utførelse til inne i det samme adresserommet.

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
import { MemoryModelVisualizer } from "@/components/stack/dte2505-thread-vs-prosess/MemoryModelVisualizer";
import { WorkloadComparison } from "@/components/stack/dte2505-thread-vs-prosess/WorkloadComparison";
import { RaceConditionDemo } from "@/components/stack/dte2505-thread-vs-prosess/RaceConditionDemo";
import { ThreadStateSimulator } from "@/components/stack/dte2505-thread-state/ThreadStateSimulator";
import { ConcurrencyTimeline } from "@/components/stack/dte2505-konkurrens/ConcurrencyTimeline";
import { KonkurrensVisualizer } from "@/components/stack/dte2505-konkurrens/KonkurrensVisualizer";
import { ProducerConsumerSim } from "@/components/stack/dte2505-konkurrens/ProducerConsumerSim";
import { DeadlockGraph } from "@/components/stack/dte2505-konkurrens/DeadlockGraph";

export const emneTraderOgKonkurrens: Emne = {
  slug: "trader-og-konkurrens",
  tittel: "Tråder og konkurrens",
  sporsmal: "Hva går galt når flere utførelser deler det samme minnet, og hvordan hindrer du det?",
  pensum: "OSTEP-dybde; forutsetning for forståelse av moderne programmer",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "trad-vs-prosess",
      tittel: "Tråd mot prosess",
      utbytte:
        "Du kan si nøyaktig hva tråder deler og hva de har hver for seg, og velge tråder eller prosesser for en gitt oppgave.",
      byggerPa: ["adresserommet"],
      skjermer: [
        intro("tp-1-intro", "En utførelse til", {
          ingress: (
            <>
              En prosess har ett adresserom og én utførelse. En <Term>tråd</Term> er en utførelse
              til i det samme adresserommet: egen plass i koden, egen stack, men samme minne.
            </>
          ),
        }),
        konsept("tp-2-deler", "Hva deles, hva er eget", {
          ingress: <>Dette skillet er hele emnet i to punkter.</>,
          punkter: [
            "Deles: kode, globale variabler, heapen, åpne filbeskrivere, PID.",
            "Eget: stack, registre, instruksjonspeker.",
            "Derfor: en peker fra én tråd fungerer i en annen tråd. Mellom prosesser gjør den ikke det.",
            "Derfor også: en tråd som skriver feil kan ødelegge for alle de andre.",
          ],
          merk: (
            <>
              Delt heap er både hele fordelen og hele problemet. Kommunikasjonen er gratis, men
              ingen passer på rekkefølgen.
            </>
          ),
        }),
        anslag("tp-3-anslag", "Krasjer alt?", {
          sporsmal: (
            <>
              Én tråd i et program med åtte tråder følger en ugyldig peker og får segmenteringsfeil.
              Hva skjer med de sju andre?
            </>
          ),
          valg: [
            { tekst: "De fortsetter — bare den ene tråden dør" },
            { tekst: "Hele prosessen dør, alle åtte" },
            { tekst: "Avhenger av operativsystemet" },
          ],
          fasit: (
            <>
              Hele prosessen dør. Signalet leveres til prosessen, ikke til tråden, og
              standardhandlingen er å avslutte. Dette er den viktigste praktiske forskjellen fra
              prosesser: med prosesser hadde de sju andre levd videre uberørt.
            </>
          ),
        }),
        visual("tp-4-minnemodell", "Se minnemodellen", {
          ledetekst: <>Sammenlign to tråder mot to prosesser, i samme bilde.</>,
          Viz: MemoryModelVisualizer,
          hint: "Følg én global variabel. Hvor mange kopier finnes i hvert av de to tilfellene?",
        }),
        konsept("tp-5-nar", "Når velger du hva?", {
          ingress: <>Det er en avveining mellom kommunikasjon og robusthet.</>,
          punkter: [
            "Tråder når oppgavene deler mye data og du stoler på koden. Bildebehandling, spillmotorer.",
            "Prosesser når isolasjon er viktigere enn hastighet. Nettleserfaner er egne prosesser.",
            "Tråder er billigere å lage og bytte mellom, fordi minnekartet ikke endres.",
          ],
        }),
        visual("tp-6-workload", "Hva lønner seg her?", {
          ledetekst: <>Sammenlign tråder og prosesser på ulike arbeidstyper.</>,
          Viz: WorkloadComparison,
          hint: "Se hva som skjer med en oppgave som mest venter på inn- og utdata, kontra en som bare regner.",
        }),
        sjekk("tp-7-sjekk", "Fungerer pekeren?", {
          sporsmal: (
            <>
              Tråd A gjør <Kodelinje>malloc</Kodelinje> og sender adressen til tråd B. Kan B bruke
              den?
            </>
          ),
          valg: [
            { tekst: "Ja, uten videre", riktig: true, hvorfor: "Tråder deler heap og adresserom, så adressen betyr det samme for begge." },
            { tekst: "Nei, hver tråd har sin egen heap", hvorfor: "Bare stacken er per tråd. Heapen er felles." },
            { tekst: "Bare hvis minnet er merket som delt", hvorfor: "Det kravet gjelder mellom prosesser, ikke mellom tråder." },
          ],
          fasit: (
            <>
              Ja. Hadde A og B vært prosesser, ville den samme adressen pekt på noe helt annet — og
              du måtte brukt delt minne, som er tema i neste emne.
            </>
          ),
        }),
        recall("tp-8-recall", [
          {
            forside: "Hva deler to tråder i samme prosess, og hva har de hver for seg?",
            bakside: "Deler kode, globale data, heap, filbeskrivere og PID. Har hver sin stack, egne registre og egen instruksjonspeker.",
          },
          {
            forside: "Hva skjer med de andre trådene når én tråd får segmenteringsfeil?",
            bakside: "Hele prosessen avsluttes. Signalet gjelder prosessen, ikke tråden.",
          },
          {
            forside: "Hvorfor er trådbytte billigere enn prosessbytte?",
            bakside: "Minnekartet er det samme, så adresseoversettingen i prosessoren overlever byttet.",
          },
        ]),
        oppsummering("tp-9-opp", {
          punkter: [
            "Tråder deler alt bortsett fra stack og registre.",
            "Delt heap gir gratis kommunikasjon og null isolasjon.",
            "Prosesser når du trenger robusthet, tråder når du trenger fart og deling.",
          ],
          videre: "Neste: hvilke tilstander en tråd går gjennom.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "tradtilstander",
      tittel: "Trådens livsløp",
      utbytte:
        "Du kan følge en tråd gjennom livsløpet, og forklare forskjellen på å avslutte og å bli ventet på.",
      byggerPa: ["trad-vs-prosess"],
      skjermer: [
        intro("tt-1-intro", "Samme tilstander, mindre kropp", {
          ingress: (
            <>
              En tråd går gjennom de samme tilstandene som en prosess — klar, kjørende, ventende —
              men den har mye mindre å bære med seg gjennom overgangene.
            </>
          ),
        }),
        konsept("tt-2-livslop", "Livsløpet", {
          ingress: <>Fire stopp fra start til slutt.</>,
          punkter: [
            "Opprettet: tråden får en stack og en startfunksjon, og settes i klar.",
            "Klar og kjørende: scheduleren behandler tråden som en hvilken som helst annen kjøreenhet.",
            "Ventende: tråden blokkerer på lås, inn- og utdata eller en betingelse.",
            "Avsluttet: startfunksjonen returnerte, men ressursene kan ligge igjen.",
          ],
        }),
        konsept("tt-3-join", "Å vente på en tråd", {
          ingress: (
            <>
              En avsluttet tråd blir liggende igjen med returverdien sin, akkurat som en zombie
              blant prosesser, til noen henter den.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>join</Kodelinje> venter på at tråden er ferdig og henter returverdien.
            </>,
            <>
              En tråd kan settes <Term>frakoblet</Term> (detached): da ryddes den automatisk, men
              ingen kan hente returverdi.
            </>,
            "Glemmer du både join og frakobling, lekker du ressurser per tråd.",
          ],
        }),
        visual("tt-4-sim", "Kjør trådene", {
          ledetekst: <>Start, blokker og avslutt tråder, og se tilstandene endre seg.</>,
          Viz: ThreadStateSimulator,
          hint: "Blokker to tråder på samme lås og se hvem som slipper til når låsen frigis.",
        }),
        anslag("tt-5-anslag", "Hva koster en tråd?", {
          sporsmal: (
            <>
              Hvor mye virtuelt minne reserverer Linux som standard til stacken til én ny tråd?
            </>
          ),
          valg: [{ tekst: "4 KiB" }, { tekst: "64 KiB" }, { tekst: "8 MiB" }, { tekst: "1 GiB" }],
          fasit: (
            <>
              8 MiB virtuelt — men nesten ingenting fysisk, fordi sidene lastes først når de brukes.
              Det er derfor du kan ha tusen tråder uten å ha 8 GiB RAM. Reservasjonen er i
              adresserommet, ikke i RAM.
            </>
          ),
        }),
        sjekk("tt-6-sjekk", "Hvem venter?", {
          sporsmal: (
            <>
              Hovedtråden i et program returnerer fra <Kodelinje>main</Kodelinje> mens tre
              arbeidertråder fortsatt kjører. Hva skjer?
            </>
          ),
          valg: [
            { tekst: "Arbeiderne fortsetter til de er ferdige", hvorfor: "Det gjelder for barneprosesser, ikke for tråder." },
            { tekst: "Hele prosessen avsluttes, og trådene stoppes midt i", riktig: true, hvorfor: "Retur fra main avslutter prosessen, og alle tråder dør med den." },
            { tekst: "Programmet henger", hvorfor: "Det avsluttes tvert imot for tidlig." },
          ],
          fasit: (
            <>
              Alt dør. Dette er en klassisk feil: du starter arbeidere, glemmer å join-e dem, og
              lurer på hvorfor resultatene mangler. Løsningen er å join-e alle tråder før main
              returnerer.
            </>
          ),
        }),
        recall("tt-7-recall", [
          {
            forside: "Hva gjør join på en tråd?",
            bakside: "Venter til tråden er ferdig og henter returverdien, slik at ressursene kan ryddes.",
          },
          {
            forside: "Hva skjer med arbeidertråder når main returnerer?",
            bakside: "Hele prosessen avsluttes, og trådene stoppes der de er.",
          },
          {
            forside: "Hvorfor koster tusen tråder ikke 8 GiB RAM, når hver stack er 8 MiB?",
            bakside: "Fordi 8 MiB er virtuell reservasjon. Sidene lastes fysisk først når de faktisk brukes.",
          },
        ]),
        oppsummering("tt-8-opp", {
          punkter: [
            "Tråder har samme tilstander som prosesser, med mindre bagasje.",
            "join henter returverdi og rydder; frakoblede tråder rydder seg selv.",
            "Retur fra main dreper alle tråder.",
          ],
          videre: "Neste: den feilen delt minne alltid fører til.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kapplop",
      tittel: "Kappløp om delte data",
      utbytte:
        "Du kan peke på nøyaktig hvor et kappløp oppstår i en kodelinje, og forklare hvorfor feilen er uregelmessig.",
      byggerPa: ["trad-vs-prosess"],
      skjermer: [
        intro("kp-1-intro", "Én linje, tre steg", {
          ingress: (
            <>
              <Kodelinje>teller++</Kodelinje> ser ut som én handling. For prosessoren er det tre:
              hent verdien, legg til én, skriv tilbake. Mellom hvert av dem kan en annen tråd slippe
              til.
            </>
          ),
        }),
        anslag("kp-2-anslag", "Hva blir svaret?", {
          sporsmal: (
            <>
              To tråder gjør hver <Kodelinje>teller++</Kodelinje> én million ganger, uten noen form
              for beskyttelse. Telleren starter på null. Hva blir resultatet?
            </>
          ),
          valg: [
            { tekst: "Alltid 2 000 000" },
            { tekst: "Alltid mindre enn 2 000 000" },
            { tekst: "Et tall mellom 1 000 000 og 2 000 000, ulikt hver gang" },
          ],
          fasit: (
            <>
              Et varierende tall, nesten alltid under 2 000 000. Hver gang to tråder henter samme
              verdi og skriver tilbake, går én økning tapt. Hvor mange som går tapt avhenger av
              nøyaktig når scheduleren bytter — og det er aldri likt to ganger.
            </>
          ),
        }),
        konsept("kp-3-begreper", "Tre ord du trenger", {
          ingress: <>Presis terminologi gjør resten av emnet mye lettere.</>,
          punkter: [
            <>
              <Term>Kappløp</Term> (race condition) — resultatet avhenger av rekkefølgen trådene
              tilfeldigvis kjører i.
            </>,
            <>
              <Term>Kritisk seksjon</Term> — kodebiten som rører de delte dataene, og som bare én
              tråd bør være i om gangen.
            </>,
            <>
              <Term>Gjensidig utelukkelse</Term> — garantien om nettopp det.
            </>,
          ],
        }),
        visual("kp-4-demo", "Se det skje", {
          ledetekst: <>Kjør to tråder mot samme teller og se hvor økningene forsvinner.</>,
          Viz: RaceConditionDemo,
          hint: "Kjør flere ganger. At svaret er ulikt hver gang er selve poenget — derfor er slike feil så vonde å finne.",
        }),
        visual("kp-5-tidslinje", "Flett instruksjonene", {
          ledetekst: <>Bestem selv rekkefølgen instruksjonene kjøres i.</>,
          Viz: ConcurrencyTimeline,
          hint: "Finn en fletting som gir riktig svar, og en som ikke gjør det. Begge er lovlige.",
        }),
        konsept("kp-6-atomisk", "Atomisk betyr udelelig", {
          ingress: (
            <>
              En <Term>atomisk</Term> operasjon kan ikke avbrytes halvveis. Enten har den skjedd
              helt, eller så har den ikke skjedd.
            </>
          ),
          punkter: [
            "Vanlig heltallsøkning er ikke atomisk. Det er tre instruksjoner.",
            "Prosessorer har egne instruksjoner som er atomiske, f.eks. «sammenlign og bytt».",
            "Alle låser i verden er til slutt bygget på slike instruksjoner.",
            "Uten maskinvarestøtte er gjensidig utelukkelse svært vanskelig å få riktig.",
          ],
        }),
        tallanslag("kp-7-tall", "Hvor ofte slår det til?", {
          sporsmal: (
            <>
              Et kappløpsvindu er tre instruksjoner langt, i en løkke som kjører hundre millioner
              ganger. Omtrent hvor mange ganger tror du feilen faktisk inntreffer i en typisk
              kjøring?
            </>
          ),
          enhet: "ganger",
          fasitTall: 5000,
          fasit: (
            <>
              Størrelsesorden tusenvis — men det varierer voldsomt, og på en maskin med én kjerne
              kan det være null. Dette er nettopp det som gjør kappløp så farlige: de er sjeldne nok
              til å bestå testene og hyppige nok til å slå til i produksjon.
            </>
          ),
        }),
        sjekk("kp-8-sjekk", "Hvor er kappløpet?", {
          sporsmal: (
            <>
              To tråder kjører <Kodelinje>if (saldo {">"}= 100) saldo -= 100;</Kodelinje> samtidig,
              med saldo = 100. Hva er verste utfall?
            </>
          ),
          valg: [
            { tekst: "Saldo blir 0, som forventet", hvorfor: "Det er beste utfall, ikke verste." },
            { tekst: "Saldo blir −100, fordi begge så 100 før noen trakk fra", riktig: true, hvorfor: "Sjekken og endringen er to adskilte steg." },
            { tekst: "Programmet krasjer", hvorfor: "Ingenting ulovlig skjer — bare feil svar." },
          ],
          fasit: (
            <>
              −100. Begge trådene rakk å lese saldoen og bestå testen før noen av dem skrev tilbake.
              Kappløpet ligger ikke i én instruksjon, men i avstanden mellom sjekken og handlingen.
              Hele sekvensen må være én kritisk seksjon.
            </>
          ),
        }),
        recall("kp-9-recall", [
          {
            forside: "Hvorfor er ikke teller++ atomisk?",
            bakside: "Fordi det er tre instruksjoner: hent, legg til, skriv tilbake. En annen tråd kan slippe til mellom dem.",
          },
          {
            forside: "Hva er en kritisk seksjon?",
            bakside: "Kodebiten som rører delte data, og som bare én tråd bør være i om gangen.",
          },
          {
            forside: "Hvorfor er kappløp vanskelige å finne?",
            bakside: "De avhenger av tilfeldig rekkefølge, så de opptrer uregelmessig og ofte ikke under testing.",
          },
        ]),
        oppsummering("kp-10-opp", {
          punkter: [
            "Kappløp oppstår når rekkefølgen avgjør resultatet.",
            "Sjekk og handling må ligge i samme kritiske seksjon.",
            "Atomisitet kommer fra maskinvaren, ikke fra språket.",
          ],
          videre: "Neste: verktøyene som gir deg gjensidig utelukkelse.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "laser-og-semaforer",
      tittel: "Låser og semaforer",
      utbytte:
        "Du kan velge mellom lås, tellende semafor og betingelsesvariabel, og begrunne valget.",
      byggerPa: ["kapplop"],
      skjermer: [
        intro("ls-1-intro", "Nøkkelen til rommet", {
          ingress: (
            <>
              Løsningen på kappløp er å gjøre den kritiske seksjonen til et rom med én nøkkel. Den
              som har nøkkelen går inn; alle andre venter utenfor.
            </>
          ),
        }),
        konsept("ls-2-mutex", "Lås", {
          ingress: (
            <>
              En <Term>lås</Term> (mutex, av mutual exclusion) har to operasjoner: ta og slipp.
            </>
          ),
          punkter: [
            "Ta: er den ledig, tar du den. Er den opptatt, blokkerer du.",
            "Slipp: låsen frigis, og én ventende tråd vekkes.",
            "Låsen beskytter data, ikke kode. Det er dataene du må huske hvilken lås som hører til.",
            "Hold låsen så kort som mulig — alle andre venter så lenge du har den.",
          ],
          merk: (
            <>
              Regelen som redder deg: én lås per delt datastruktur, og skriv i en kommentar hvilken
              lås som beskytter hva.
            </>
          ),
        }),
        anslag("ls-3-anslag", "Snurre eller sove?", {
          sporsmal: (
            <>
              En tråd venter på en lås som holdes i omtrent 50 nanosekunder. Bør den snurre i en
              tom løkke, eller legge seg til å sove?
            </>
          ),
          valg: [
            { tekst: "Sove — det sparer alltid CPU" },
            { tekst: "Snurre — å sove og våkne koster mer enn ventetiden" },
          ],
          fasit: (
            <>
              Snurre. Å legge seg til å sove betyr systemkall, kontekstbytte og oppvåkning — fort
              et par mikrosekunder, altså førti ganger lengre enn ventetiden. Derfor finnes{" "}
              <Term>spinnlås</Term> for helt korte kritiske seksjoner. Er ventetiden lang, snus
              regnestykket, og da skal du sove.
            </>
          ),
        }),
        konsept("ls-4-semafor", "Semafor: en lås som kan telle", {
          ingress: (
            <>
              En <Term>semafor</Term> er en teller med to operasjoner: vent (trekk fra, blokker
              hvis den blir negativ) og signal (legg til, vekk en som venter).
            </>
          ),
          punkter: [
            "Startverdi 1 gir nøyaktig samme oppførsel som en lås.",
            "Startverdi N gir tilgang til N tråder samtidig — nyttig for en pulje av ressurser.",
            "Startverdi 0 brukes til rekkefølge: den ene tråden venter på at den andre signaliserer.",
          ],
        }),
        konsept("ls-5-betingelse", "Betingelsesvariabel", {
          ingress: (
            <>
              Noen ganger må du vente på at noe blir sant, ikke på en nøkkel. En{" "}
              <Term>betingelsesvariabel</Term> lar deg sove til en annen tråd sier fra.
            </>
          ),
          punkter: [
            "Brukes alltid sammen med en lås. Ventingen slipper låsen mens den sover.",
            "Når du vekkes, har du låsen tilbake.",
            "Testen må stå i en while-løkke, aldri i en if.",
          ],
          bihjelp: (
            <>
              Grunnen til while: en tråd kan vekkes uten at betingelsen er sann — enten av en falsk
              oppvåkning, eller fordi en tredje tråd rakk å spise opp det du ble vekket for.
            </>
          ),
        }),
        visual("ls-6-viz", "Fikle med primitivene", {
          ledetekst: <>Bytt mellom kappløp, lås og semafor på samme program.</>,
          Viz: KonkurrensVisualizer,
          hint: "Kjør uten lås til du får feil svar, legg så på låsen og kjør igjen. Se hva som skjer med tiden.",
        }),
        kode("ls-7-monster", "Mønsteret", {
          ingress: <>Slik ser en riktig venting ut. Legg merke til while-løkken.</>,
          kode: `ta_las(&las);
while (!betingelse_er_sann) {
    vent(&betingelse, &las);   // slipper låsen mens vi sover
}
// her: vi har låsen OG betingelsen er sann
gjor_arbeidet();
slipp_las(&las);`,
          punkter: [
            "Låsen tas før betingelsen testes — ellers er testen selv et kappløp.",
            "while, ikke if. Alltid.",
          ],
        }),
        sjekk("ls-8-sjekk", "Hvilken initialverdi?", {
          sporsmal: (
            <>
              Du har en pulje på fem databaseforbindelser, og vil at maks fem tråder skal bruke dem
              samtidig. Hvilken semaforverdi starter du med?
            </>
          ),
          valg: [
            { tekst: "0", hvorfor: "Da ville ingen sluppet til før noen signaliserte." },
            { tekst: "1", hvorfor: "Det gir en vanlig lås — bare én av gangen." },
            { tekst: "5", riktig: true, hvorfor: "Telleren er antallet ledige ressurser." },
          ],
          fasit: (
            <>
              5. Hver tråd som tar en forbindelse trekker fra én; den sjette blokkerer til noen
              leverer tilbake. Semaforens verdi er rett og slett antallet ledige plasser.
            </>
          ),
        }),
        recall("ls-9-recall", [
          {
            forside: "Hva er forskjellen på en lås og en semafor?",
            bakside: "Låsen slipper inn én. Semaforen er en teller og slipper inn N, der N er startverdien.",
          },
          {
            forside: "Hvorfor må ventingen på en betingelsesvariabel stå i en while-løkke?",
            bakside: "Fordi en tråd kan vekkes uten at betingelsen er sann — falske oppvåkninger, eller at en annen tråd kom først.",
          },
          {
            forside: "Når lønner spinnlås seg framfor å sove?",
            bakside: "Når den kritiske seksjonen er kortere enn kostnaden ved kontekstbytte — typisk noen få hundre nanosekunder.",
          },
        ]),
        oppsummering("ls-10-opp", {
          punkter: [
            "Låsen beskytter data, ikke kode.",
            "Semaforen teller ressurser; startverdien er antall plasser.",
            "Betingelsesvariabel + lås + while er standardmønsteret for å vente på noe.",
          ],
          videre: "Neste: det klassiske problemet der alle tre trengs samtidig.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "produsent-konsument",
      tittel: "Produsent og konsument",
      utbytte:
        "Du kan sette opp en avgrenset buffer med riktige semaforer, og forklare hva som skjer når produsenten er raskere enn konsumenten.",
      byggerPa: ["laser-og-semaforer"],
      skjermer: [
        intro("pc-1-intro", "Et transportbånd", {
          ingress: (
            <>
              Én tråd lager ting, en annen bruker dem, og imellom står en kø med begrenset plass.
              Dette mønsteret finnes i alt fra rør i skallet til lydavspilling.
            </>
          ),
        }),
        konsept("pc-2-krav", "Tre krav", {
          ingress: <>Alle tre må oppfylles samtidig.</>,
          punkter: [
            "Produsenten må vente når bufferen er full.",
            "Konsumenten må vente når bufferen er tom.",
            "Ingen to tråder må rote i bufferen samtidig.",
          ],
        }),
        anslag("pc-3-anslag", "Hvor mange semaforer?", {
          sporsmal: <>Hvor mange synkroniseringsprimitiver trengs for å løse dette riktig?</>,
          valg: [
            { tekst: "Én lås holder" },
            { tekst: "To semaforer" },
            { tekst: "To semaforer og én lås" },
          ],
          fasit: (
            <>
              To semaforer og én lås. Semaforen <Kodelinje>ledig</Kodelinje> starter på
              bufferstørrelsen og telles ned av produsenten. Semaforen{" "}
              <Kodelinje>fylt</Kodelinje> starter på 0 og telles ned av konsumenten. Låsen beskytter
              selve inn- og utsettingen. En lås alene ville ikke fått noen til å <em>vente</em> på
              plass eller data.
            </>
          ),
        }),
        kode("pc-4-kode", "Lær først: løsningen", {
          ingress: <>Studer rekkefølgen. Den er ikke tilfeldig.</>,
          kode: `// Produsent
vent(ledig);        // er det plass?
ta_las(las);
sett_inn(vare);
slipp_las(las);
signal(fylt);       // nå finnes det data

// Konsument
vent(fylt);         // finnes det data?
ta_las(las);
vare = ta_ut();
slipp_las(las);
signal(ledig);      // nå er det plass`,
          punkter: [
            "Semaforen ventes på FØR låsen tas.",
            "Byttes de om, kan du sove med låsen i hånda — og da våkner ingen igjen.",
          ],
          merk: <>Denne feilrekkefølgen er en av de vanligste måtene å lage vranglås på.</>,
        }),
        visual("pc-5-sim", "Prøv selv", {
          ledetekst: <>Skru på hastigheten til produsent og konsument, og på bufferstørrelsen.</>,
          Viz: ProducerConsumerSim,
          hint: "Sett produsenten mye raskere enn konsumenten. Se hva bufferstørrelsen faktisk kjøper deg — og hva den ikke gjør.",
        }),
        konsept("pc-6-mottrykk", "Mottrykk", {
          ingress: (
            <>
              At produsenten blokkerer når bufferen er full er ikke en begrensning — det er
              funksjonen.
            </>
          ),
          punkter: [
            "Uten grense ville en rask produsent spist alt minnet.",
            "En større buffer utsetter problemet, den løser det ikke.",
            "Er produsenten varig raskere, må den bremses. Det heter mottrykk.",
            "Rør i skallet har nøyaktig denne oppførselen, med en buffer på 64 KiB.",
          ],
        }),
        sjekk("pc-7-sjekk", "Hva skjer?", {
          sporsmal: (
            <>
              Produsenten lager 1000 varer per sekund, konsumenten klarer 100. Bufferen rommer 50.
              Hva skjer etter et halvt sekund?
            </>
          ),
          valg: [
            { tekst: "Bufferen renner over og data går tapt", hvorfor: "Semaforen hindrer overløp — produsenten blokkerer i stedet." },
            { tekst: "Produsenten blokkerer og går ned til konsumentens tempo", riktig: true, hvorfor: "Det er nettopp mottrykk." },
            { tekst: "Konsumenten går fortere", hvorfor: "Ingenting gjør konsumenten raskere." },
          ],
          fasit: (
            <>
              Produsenten bremses til 100 per sekund. Systemet finner likevekt på den tregeste
              delen. Dette er hvorfor <Kodelinje>program1 | program2</Kodelinje> ikke spiser opp
              minnet selv om program1 er mye raskere.
            </>
          ),
        }),
        recall("pc-8-recall", [
          {
            forside: "Hvilke primitiver trengs i en avgrenset buffer, og hva teller hver av dem?",
            bakside: "Semafor ledig (starter på bufferstørrelsen), semafor fylt (starter på 0), og en lås rundt selve bufferen.",
          },
          {
            forside: "Hvorfor må semaforen ventes på før låsen tas?",
            bakside: "Ellers sover du med låsen i hånda, og den andre parten kommer aldri inn for å vekke deg. Det gir vranglås.",
          },
          {
            forside: "Hva er mottrykk?",
            bakside: "At en full buffer bremser produsenten, slik at systemet finner tempoet til den tregeste delen.",
          },
        ]),
        oppsummering("pc-9-opp", {
          punkter: [
            "To semaforer teller plass og data; låsen beskytter bufferen.",
            "Rekkefølgen semafor-før-lås er kritisk.",
            "Mottrykk er en funksjon, ikke en feil.",
          ],
          videre: "Neste: når alle venter på hverandre og ingen kommer videre.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "vranglas",
      tittel: "Vranglås",
      utbytte:
        "Du kan navngi de fire betingelsene for vranglås, og bryte den enkleste av dem i praksis.",
      byggerPa: ["laser-og-semaforer"],
      skjermer: [
        intro("vl-1-intro", "Alle venter, ingen gir seg", {
          ingress: (
            <>
              To tråder holder hver sin lås og venter på den andres. Ingen av dem gjør noe galt.
              Programmet står likevel bom fast for alltid.
            </>
          ),
        }),
        konsept("vl-2-fire", "Fire betingelser som alle må gjelde", {
          ingress: (
            <>
              <Term>Vranglås</Term> (deadlock) krever alle fire samtidig. Bryt én, og den er
              umulig.
            </>
          ),
          punkter: [
            <>
              <Term>Gjensidig utelukkelse</Term> — ressursen kan bare holdes av én.
            </>,
            <>
              <Term>Hold og vent</Term> — du holder én ressurs mens du venter på en til.
            </>,
            <>
              <Term>Ingen fratakelse</Term> — ressursen kan ikke tas fra deg med makt.
            </>,
            <>
              <Term>Sirkulær venting</Term> — det finnes en ring av tråder som venter på
              hverandre.
            </>,
          ],
        }),
        anslag("vl-3-anslag", "Hvilken bryter du?", {
          sporsmal: (
            <>
              Du skal fjerne vranglås fra et program med mange låser. Hvilken av de fire
              betingelsene er lettest å bryte i praksis?
            </>
          ),
          valg: [
            { tekst: "Gjensidig utelukkelse" },
            { tekst: "Hold og vent" },
            { tekst: "Ingen fratakelse" },
            { tekst: "Sirkulær venting" },
          ],
          fasit: (
            <>
              Sirkulær venting. Bestem en global rekkefølge på alle låser — for eksempel etter
              adresse — og krev at alle tar dem i den rekkefølgen. Da kan ringen aldri slutte seg.
              De tre andre er enten umulige å fjerne (gjensidig utelukkelse er hele poenget) eller
              dyre å håndtere.
            </>
          ),
        }),
        kode("vl-4-eksempel", "Feilen og rettelsen", {
          ingress: <>Samme program, to rekkefølger.</>,
          kode: `// Vranglås: A tar 1 så 2, B tar 2 så 1
Tråd A: ta(las1); ta(las2);
Tråd B: ta(las2); ta(las1);

// Trygt: begge tar i samme rekkefølge
Tråd A: ta(las1); ta(las2);
Tråd B: ta(las1); ta(las2);`,
          punkter: [
            "Rettelsen koster ingenting og krever ingen ny mekanisme.",
            "Den må bare følges overalt — én tråd som bryter regelen holder for å ødelegge.",
          ],
        }),
        visual("vl-5-graf", "Se ringen", {
          ledetekst: <>Bygg en ressursgraf og se når ringen slutter seg.</>,
          Viz: DeadlockGraph,
          hint: "Lag en vranglås, og bryt den så ved å endre rekkefølgen én tråd tar låsene i.",
        }),
        konsept("vl-6-slektninger", "To slektninger", {
          ingress: <>Ikke alt som ser ut som vranglås er vranglås.</>,
          punkter: [
            <>
              <Term>Sulting</Term> — tråden kan i prinsippet komme til, men gjør det aldri fordi
              andre stadig prioriteres.
            </>,
            <>
              <Term>Livlås</Term> — trådene gjør noe hele tiden, men ingen kommer videre. To som
              stadig trekker seg tilbake for hverandre.
            </>,
            "Forskjellen: ved vranglås står alt stille. Ved livlås brukes CPU-en, uten framgang.",
          ],
        }),
        konsept("vl-7-strategier", "Hva systemer faktisk gjør", {
          ingress: <>Tre holdninger, i synkende rekkefølge etter hvor vanlige de er.</>,
          punkter: [
            "Forebygg: fast låserekkefølge. Dette er den vanlige løsningen i praksis.",
            "Oppdag og bryt: databaser bygger ressursgrafen, finner ringen og ruller tilbake én transaksjon.",
            "Ignorer: mange operativsystemer gjør ingenting, og lar programmet henge.",
          ],
          bihjelp: (
            <>
              Får du en vranglås i en oblig, ser du den som et program som bruker null prosent CPU
              og ikke svarer. Sammenlign med en løkke uten slutt, som bruker 100 prosent.
            </>
          ),
        }),
        sjekk("vl-8-sjekk", "Vranglås eller ikke?", {
          sporsmal: (
            <>
              Et program bruker 100 % CPU og kommer ikke videre. To tråder bytter stadig på å gi
              etter for hverandre. Hva er dette?
            </>
          ),
          valg: [
            { tekst: "Vranglås", hvorfor: "Vranglås bruker null CPU — alle sover." },
            { tekst: "Livlås", riktig: true, hvorfor: "Trådene jobber, men ingen kommer videre." },
            { tekst: "Sulting", hvorfor: "Ved sulting kommer i det minste noen videre." },
          ],
          fasit: (
            <>
              Livlås. CPU-bruken er den raskeste måten å skille dem: null prosent peker på
              vranglås, hundre prosent på livlås eller en løkke uten slutt.
            </>
          ),
        }),
        recall("vl-9-recall", [
          {
            forside: "Hvilke fire betingelser må alle gjelde for vranglås?",
            bakside: "Gjensidig utelukkelse, hold og vent, ingen fratakelse, og sirkulær venting.",
          },
          {
            forside: "Hvilken betingelse brytes av en fast låserekkefølge?",
            bakside: "Sirkulær venting. Ringen kan ikke slutte seg når alle tar låsene i samme rekkefølge.",
          },
          {
            forside: "Hvordan skiller du vranglås fra livlås ved å se på maskinen?",
            bakside: "Vranglås bruker null prosent CPU. Livlås bruker mye CPU uten å komme videre.",
          },
        ]),
        oppsummering("vl-10-opp", {
          punkter: [
            "Fire betingelser må gjelde samtidig; bryt én.",
            "Fast låserekkefølge er den billige og vanlige løsningen.",
            "Null CPU peker på vranglås, full CPU på livlås.",
          ],
          videre: "Neste emne: hvordan helt separate prosesser snakker sammen.",
        }),
      ],
    },
  ],
};
