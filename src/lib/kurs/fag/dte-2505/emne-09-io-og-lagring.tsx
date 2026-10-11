// Emne 9 — Inn- og utdata og lagringsmedier.
// Kobler filsystemet (emne 8) ned til maskinvaren, og forklarer hvorfor
// tilgangsmønsteret betyr mer for ytelsen enn datamengden.

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
import { DeviceClassifier } from "@/components/stack/dte2505-io-management/DeviceClassifier";
import { DriverStackFlow } from "@/components/stack/dte2505-io-management/DriverStackFlow";
import { IoStrategySim } from "@/components/stack/dte2505-io-management/IoStrategySim";
import { DiskSchedulingViz } from "@/components/stack/dte2505-io-management/DiskSchedulingViz";
import { BufferCacheSim } from "@/components/stack/dte2505-io-management/BufferCacheSim";
import { ScenarioDragQuiz } from "@/components/stack/dte2505-io-management/ScenarioDragQuiz";
import { HddPhysicsViz } from "@/components/stack/dte2505-lagring/HddPhysicsViz";
import { RandomVsSeqBench } from "@/components/stack/dte2505-lagring/RandomVsSeqBench";
import { SsdCellsViz } from "@/components/stack/dte2505-lagring/SsdCellsViz";
import { EraseBeforeWriteSim } from "@/components/stack/dte2505-lagring/EraseBeforeWriteSim";
import { WearLevelingViz } from "@/components/stack/dte2505-lagring/WearLevelingViz";
import { TrimDemo } from "@/components/stack/dte2505-lagring/TrimDemo";
import { StorageCompare } from "@/components/stack/dte2505-lagring/StorageCompare";

export const emneIoOgLagring: Emne = {
  slug: "io-og-lagring",
  tittel: "Inn- og utdata og lagring",
  sporsmal: "Hvordan snakker operativsystemet med maskinvaren, og hvorfor er noen mønstre tusen ganger tregere?",
  pensum: "Utdyper modul 1a og 4",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "enheter-og-drivere",
      tittel: "Enheter, drivere og ventestrategier",
      utbytte:
        "Du kan klassifisere en enhet, plassere driveren i lagkaka, og velge mellom spørring, avbrudd og direkte minnetilgang.",
      byggerPa: ["kjerne-og-brukermodus"],
      skjermer: [
        intro("ed-1-intro", "Alt er en fil, men ikke alt er likt", {
          ingress: (
            <>
              Kjernen presenterer alle enheter gjennom det samme grensesnittet. Under overflaten er
              en mus, en disk og et nettverkskort likevel helt ulike dyr.
            </>
          ),
        }),
        konsept("ed-2-typer", "To hovedtyper", {
          ingress: <>Skillet bestemmer hvordan kjernen behandler enheten.</>,
          punkter: [
            <>
              <Term>Blokkenhet</Term> — data i faste blokker, og du kan hoppe fritt. Disker.
            </>,
            <>
              <Term>Tegnenhet</Term> — en strøm av byte, uten hopping. Tastatur, seriell port, lyd.
            </>,
            <>
              <Kodelinje>ls -l /dev</Kodelinje> viser typen som <Kodelinje>b</Kodelinje> eller{" "}
              <Kodelinje>c</Kodelinje> først på linja.
            </>,
            "Nettverkskort er en tredje kategori — de nås ikke gjennom /dev i det hele tatt.",
          ],
        }),
        visual("ed-3-klassifiser", "Prøv selv: hvilken type?", {
          ledetekst: <>Plasser enhetene i riktig kategori.</>,
          Viz: DeviceClassifier,
          hint: "Spør deg: kan jeg hoppe til byte nummer 5000 direkte, eller må jeg lese alt før den?",
        }),
        konsept("ed-4-driver", "Driverens plass", {
          ingress: (
            <>
              En <Term>driver</Term> er kjernekode som oversetter det felles grensesnittet til akkurat
              denne enhetens språk.
            </>
          ),
          punkter: [
            "Over driveren: et generisk lag som ser likt ut for alle enheter av samme type.",
            "Under driveren: registre og buffere på selve maskinvaren.",
            "Driveren kjører i kjernemodus. En feil der tar hele maskinen.",
            "Derfor er drivere den vanligste årsaken til kjernepanikk.",
          ],
        }),
        visual("ed-5-stack", "Følg en forespørsel ned", {
          ledetekst: <>Fra systemkall til maskinvare, lag for lag.</>,
          Viz: DriverStackFlow,
          hint: "Tell hvor mange lag som er felles for alle disker, og hvor mange som er spesifikke for én modell.",
        }),
        anslag("ed-6-anslag", "Hvordan vente?", {
          sporsmal: (
            <>
              Kjernen har bedt disken om data og må vente i omtrent 100 mikrosekunder. Hva bør den
              gjøre?
            </>
          ),
          valg: [
            { tekst: "Sjekke statusregisteret om og om igjen til svaret kommer" },
            { tekst: "La en annen prosess kjøre, og bli varslet når svaret er der" },
          ],
          fasit: (
            <>
              La noen andre kjøre. 100 mikrosekunder er hundretusenvis av instruksjoner. Å sjekke i
              en løkke heter <Term>spørring</Term> (polling) og kaster bort all den tiden. Løsningen
              er <Term>avbrudd</Term>: enheten sier fra selv når den er ferdig. Spørring lønner seg
              bare når ventetiden er kortere enn kostnaden ved et kontekstbytte.
            </>
          ),
        }),
        konsept("ed-7-dma", "Direkte minnetilgang", {
          ingress: (
            <>
              Selv med avbrudd gjenstår et problem: hvem flytter de faktiske bytene fra enheten til
              minnet?
            </>
          ),
          punkter: [
            "Uten hjelp må prosessoren kopiere hver eneste byte selv.",
            <>
              <Term>DMA</Term> (direct memory access — direkte minnetilgang) lar enheten skrive rett
              inn i RAM på egen hånd.
            </>,
            "Prosessoren oppgir bare adresse og lengde, og får ett avbrudd når alt er ferdig.",
            "Uten DMA ville en filoverføring på 1 GiB opptatt prosessoren fullstendig.",
          ],
        }),
        visual("ed-8-strategi", "Sammenlign strategiene", {
          ledetekst: <>Spørring, avbrudd og direkte minnetilgang på samme oppgave.</>,
          Viz: IoStrategySim,
          hint: "Se på hvor mye av prosessortiden som går til nytte i hver strategi.",
        }),
        sjekk("ed-9-sjekk", "Når lønner spørring seg?", {
          sporsmal: <>I hvilket tilfelle er spørring faktisk riktig valg?</>,
          valg: [
            { tekst: "Lesing fra en mekanisk harddisk", hvorfor: "Ventetiden er millisekunder — enormt lang." },
            { tekst: "Et nettverkskort med ekstremt høy pakkerate", riktig: true, hvorfor: "Kommer pakkene tettere enn avbruddskostnaden, blir avbrudd dyrere enn å spørre." },
            { tekst: "Venting på tastetrykk", hvorfor: "Kan ta minutter. Spørring ville brent en hel kjerne." },
          ],
          fasit: (
            <>
              Nettverkskortet. Ved millioner av pakker i sekundet blir avbruddene så tette at
              maskinen bruker mer tid på å håndtere avbrudd enn på pakkene. Løsningen er å slå av
              avbrudd og heller spørre i en tett løkke. Linux bytter automatisk mellom modiene når
              trafikken øker.
            </>
          ),
        }),
        recall("ed-10-recall", [
          {
            forside: "Hva er forskjellen på en blokkenhet og en tegnenhet?",
            bakside: "Blokkenheter gir faste blokker med fri tilgang (disker). Tegnenheter gir en strøm uten hopping (tastatur, lyd).",
          },
          {
            forside: "Hva er direkte minnetilgang, og hva sparer den?",
            bakside: "Enheten skriver selv rett inn i RAM. Prosessoren slipper å kopiere hver byte og får bare ett avbrudd til slutt.",
          },
          {
            forside: "Når er spørring bedre enn avbrudd?",
            bakside: "Når hendelsene kommer tettere enn kostnaden ved å håndtere ett avbrudd — for eksempel nettverkskort under høy last.",
          },
        ]),
        oppsummering("ed-11-opp", {
          punkter: [
            "Blokk mot tegn styrer hvordan kjernen behandler enheten.",
            "Driveren er det eneste laget som kjenner maskinvaren.",
            "Avbrudd som standard, direkte minnetilgang for volumet, spørring bare ved ekstrem rate.",
          ],
          videre: "Neste: hvordan kjernen bestemmer rekkefølgen på diskforespørslene.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "diskplanlegging-og-buffer",
      tittel: "Diskplanlegging og bufferbuffer",
      utbytte:
        "Du kan begrunne hvorfor kjernen omorganiserer diskforespørsler, og forklare hva som skjer ved skriving som ikke er tømt.",
      byggerPa: ["enheter-og-drivere"],
      skjermer: [
        intro("db-1-intro", "Kjernen omorganiserer", {
          ingress: (
            <>
              Kjernen sender ikke diskforespørslene i den rekkefølgen de kommer. Den samler dem opp,
              slår sammen naboer, og sorterer — fordi rekkefølgen har enorm betydning på en
              mekanisk disk.
            </>
          ),
        }),
        konsept("db-2-algoritmer", "Fire strategier", {
          ingress: <>Fra naiv til det systemene faktisk bruker.</>,
          punkter: [
            "Først til mølla: helt rettferdig, og verst mulig armbevegelse.",
            "Korteste søk først: nærmeste forespørsel vinner. Kan sulte de ytterste sporene.",
            "Heis: gå én vei og betjen alt underveis, snu på enden. Ingen sulter.",
            "Frist: hver forespørsel får en tidsfrist, og lesing prioriteres foran skriving.",
          ],
          merk: (
            <>
              Lesing prioriteres fordi noen venter på den akkurat nå. En skriving er ofte allerede
              rapportert som ferdig til programmet.
            </>
          ),
        }),
        visual("db-3-viz", "Se armen bevege seg", {
          ledetekst: <>Samme forespørsler, ulike algoritmer.</>,
          Viz: DiskSchedulingViz,
          hint: "Sammenlign total armbevegelse. Prøv så å tenke deg hva som skjer med tallene på en SSD.",
        }),
        anslag("db-4-anslag", "Er dette nyttig på SSD?", {
          sporsmal: <>Har diskplanlegging noe å si for en SSD?</>,
          valg: [
            { tekst: "Ja, like mye som for en harddisk" },
            { tekst: "Nesten ingenting — men å slå sammen naboforespørsler hjelper fortsatt" },
            { tekst: "Nei, ingenting i det hele tatt" },
          ],
          fasit: (
            <>
              Nesten ingenting av sorteringen, men sammenslåingen hjelper fortsatt. En SSD har ingen
              arm, så avstand er irrelevant. Men færre og større forespørsler er alltid bedre enn
              mange små. Derfor bruker Linux en nesten passiv planlegger på SSD-er, i stedet for å
              sortere.
            </>
          ),
        }),
        konsept("db-5-buffer", "Bufferbufferen", {
          ingress: (
            <>
              Kjernen bruker all ledig RAM som hurtigbuffer for disken. Det er derfor «ledig minne»
              alltid ser lavt ut på Linux.
            </>
          ),
          punkter: [
            "Lest data blir liggende. Leser du det igjen, kommer det fra RAM.",
            "Skrevet data legges i bufferen og skrives til disk litt senere.",
            "Trenger et program minne, gis bufferen fra seg umiddelbart.",
            <>
              <Kodelinje>free -h</Kodelinje> har derfor en egen kolonne for buffer og
              hurtigbuffer.
            </>,
          ],
        }),
        visual("db-6-cache", "Fikle med bufferen", {
          ledetekst: <>Les og skriv, og se treff og bom.</>,
          Viz: BufferCacheSim,
          hint: "Les den samme filen to ganger. Sammenlign tiden — forskjellen er hele poenget med bufferen.",
        }),
        tallanslag("db-7-tall", "Hvor mye raskere andre gang?", {
          sporsmal: (
            <>
              Du leser en fil på 500 MiB fra SSD to ganger på rad. Omtrent hvor mange ganger raskere
              er andre gangen?
            </>
          ),
          enhet: "ganger",
          fasitTall: 20,
          fasit: (
            <>
              Størrelsesorden 10–50 ganger, hvis filen får plass i RAM. Første lesing går i
              SSD-fart, andre i minnefart. Dette er også hvorfor ytelsesmålinger må tømme bufferen
              mellom hver kjøring — ellers måler du RAM, ikke disken.
            </>
          ),
        }),
        konsept("db-8-fsync", "Skriving som ikke har skjedd ennå", {
          ingress: (
            <>
              Når <Kodelinje>write</Kodelinje> returnerer, ligger dataene som regel bare i RAM. Går
              strømmen nå, er de borte.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>fsync(fd)</Kodelinje> tvinger dataene ut på disk og venter til det er
              gjort.
            </>,
            "Databaser kaller fsync ved hver bekreftet transaksjon. Det er derfor de er trege å skrive til.",
            <>
              <Kodelinje>sync</Kodelinje> i skallet tømmer alt.
            </>,
            "Avveiningen er fart mot holdbarhet, og du må velge bevisst.",
          ],
        }),
        visual("db-9-quiz", "Prøv selv: hvilken strategi?", {
          ledetekst: <>Koble scenario til riktig inn- og utdatastrategi.</>,
          Viz: ScenarioDragQuiz,
          hint: "Spør deg hver gang: hvem venter på svaret, og hva skjer hvis strømmen går akkurat nå?",
        }),
        sjekk("db-10-sjekk", "Hvorfor er RAM-en full?", {
          sporsmal: (
            <>
              <Kodelinje>free -h</Kodelinje> viser 200 MiB ledig av 16 GiB, men 11 GiB i
              buff/cache. Er maskinen tom for minne?
            </>
          ),
          valg: [
            { tekst: "Ja, du bør kjøpe mer RAM", hvorfor: "Bufferen er ikke opptatt minne." },
            { tekst: "Nei — bufferen frigis straks et program trenger den", riktig: true, hvorfor: "Kjernen bruker ledig RAM til hurtigbuffer i stedet for å la den stå tom." },
            { tekst: "Nei, men du bør tømme bufferen manuelt", hvorfor: "Å tømme den gjør bare systemet tregere." },
          ],
          fasit: (
            <>
              Alt er som det skal. Ubrukt RAM er bortkastet RAM. Tallet du bør se på er kolonnen
              «available», som teller med hva som kan frigis på et øyeblikk.
            </>
          ),
        }),
        recall("db-11-recall", [
          {
            forside: "Hvorfor prioriterer fristbaserte diskplanleggere lesing foran skriving?",
            bakside: "Fordi noen venter på lesingen nå, mens skrivingen ofte allerede er rapportert ferdig til programmet.",
          },
          {
            forside: "Hva gjør fsync, og hvorfor er det tregt?",
            bakside: "Tvinger data fra bufferen ut på fysisk disk og venter. Tregt fordi det må vente på maskinvaren.",
          },
          {
            forside: "Hva betyr høy buff/cache i free -h?",
            bakside: "At kjernen bruker ledig RAM til disk-hurtigbuffer. Den frigis umiddelbart når programmer trenger minne.",
          },
        ]),
        oppsummering("db-12-opp", {
          punkter: [
            "Kjernen slår sammen og sorterer forespørsler.",
            "Bufferbufferen gjør gjentatt lesing nesten gratis.",
            "write betyr «i RAM», fsync betyr «på disk».",
          ],
          videre: "Neste: hvorfor rekkefølgen betyr så mye på en mekanisk disk.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "harddisken",
      tittel: "Den mekaniske harddisken",
      utbytte:
        "Du kan bryte ned tiden en disklesing tar i søk, rotasjon og overføring, og forklare hvorfor tilfeldig tilgang er katastrofalt.",
      byggerPa: ["diskplanlegging-og-buffer"],
      skjermer: [
        intro("hd-1-intro", "Den siste bevegelige delen", {
          ingress: (
            <>
              I en maskin uten vifte er harddisken det eneste som fysisk beveger seg. Alt vi vet om
              diskytelse følger av det.
            </>
          ),
        }),
        konsept("hd-2-tre-ledd", "Tiden består av tre ledd", {
          ingress: <>Hver lesing betaler alle tre.</>,
          punkter: [
            <>
              <Term>Søketid</Term> — flytte armen til riktig spor. 5–10 millisekunder.
            </>,
            <>
              <Term>Rotasjonsforsinkelse</Term> — vente til riktig sektor kommer under hodet. I snitt
              en halv omdreining.
            </>,
            <>
              <Term>Overføringstid</Term> — lese selve dataene. Svært kort for små blokker.
            </>,
          ],
          merk: <>De to første er mekanikk. Det er de som dominerer, og de blir ikke bedre med tiden.</>,
        }),
        tallanslag("hd-3-tall", "Rotasjonsforsinkelse", {
          sporsmal: (
            <>
              En disk går 7200 omdreininger i minuttet. Hva er gjennomsnittlig rotasjonsforsinkelse i
              millisekunder?
            </>
          ),
          enhet: "ms",
          fasitTall: 4,
          fasit: (
            <>
              Omtrent 4,2 ms. 7200 per minutt er 120 per sekund, altså 8,3 ms per omdreining, og i
              snitt venter du en halv: 4,2 ms. Legg til søketid på 8 ms, og du er på 12
              millisekunder for å lese én blokk. I den tiden gjør prosessoren titalls millioner
              operasjoner.
            </>
          ),
        }),
        visual("hd-4-fysikk", "Se armen og platen", {
          ledetekst: <>Be om en sektor og se hva som må skje fysisk.</>,
          Viz: HddPhysicsViz,
          hint: "Be om to sektorer rett etter hverandre, og så to på hver sin kant. Sammenlign tiden.",
        }),
        anslag("hd-5-anslag", "Sekvensielt mot tilfeldig", {
          sporsmal: (
            <>
              Å lese 1 GiB sekvensielt mot å lese 1 GiB i tilfeldige 4 KiB-biter, på en mekanisk
              disk. Hvor mange ganger tregere er det tilfeldige?
            </>
          ),
          valg: [
            { tekst: "2 ganger" },
            { tekst: "20 ganger" },
            { tekst: "Flere hundre ganger" },
          ],
          fasit: (
            <>
              Flere hundre. Sekvensielt: rundt 10 sekunder. Tilfeldig: 262 144 biter, hver med 12
              millisekunders mekanisk ventetid — over 50 minutter. Samme datamengde, samme disk.
              Dette ene tallet forklarer databaseindekser, defragmentering og hele designet til
              loggstrukturerte filsystemer.
            </>
          ),
        }),
        visual("hd-6-bench", "Mål det selv", {
          ledetekst: <>Kjør sekvensiell mot tilfeldig lesing.</>,
          Viz: RandomVsSeqBench,
          hint: "Endre blokkstørrelsen på den tilfeldige lesingen. Hvor stor må blokken bli før forskjellen forsvinner?",
        }),
        konsept("hd-7-folger", "Følgene", {
          ingress: <>Hele lag av programvare finnes på grunn av dette ene tallet.</>,
          punkter: [
            "Filsystemer prøver å legge en fils blokker etter hverandre.",
            "Databaser bruker indekser for å slippe å lese mye tilfeldig.",
            "Logger skrives sekvensielt, aldri på plass.",
            "Forhåndslesing: leser du blokk 100 og 101, henter kjernen 102 til 110 på forskudd.",
          ],
        }),
        sjekk("hd-8-sjekk", "Hva hjelper mest?", {
          sporsmal: (
            <>
              En applikasjon leser tusenvis av små filer spredt over en mekanisk disk. Hva gir størst
              forbedring?
            </>
          ),
          valg: [
            { tekst: "Raskere prosessor", hvorfor: "Prosessoren venter allerede — den er ikke flaskehalsen." },
            { tekst: "Bytte til SSD", riktig: true, hvorfor: "Fjerner søketid og rotasjon helt, som er hele kostnaden her." },
            { tekst: "Mer diskplass", hvorfor: "Plass er ikke problemet." },
          ],
          fasit: (
            <>
              SSD. Mer RAM hadde også hjulpet mye, siden bufferbufferen da kunne holdt filene. Men
              det som fjerner selve problemet er å bli kvitt de bevegelige delene — som er nettopp
              det neste undertema handler om.
            </>
          ),
        }),
        recall("hd-9-recall", [
          {
            forside: "Hvilke tre ledd utgjør tiden for én disklesing?",
            bakside: "Søketid (flytte armen), rotasjonsforsinkelse (vente på sektoren) og overføringstid.",
          },
          {
            forside: "Hvordan regner du gjennomsnittlig rotasjonsforsinkelse?",
            bakside: "Halve omdreiningstiden. Ved 7200 omdreininger per minutt: 8,3 ms delt på 2 = cirka 4,2 ms.",
          },
          {
            forside: "Hvorfor leser kjernen blokker på forskudd?",
            bakside: "Fordi sekvensiell lesing er hundrevis av ganger billigere, og programmer nesten alltid fortsetter framover.",
          },
        ]),
        oppsummering("hd-10-opp", {
          punkter: [
            "Mekanikken dominerer: søk og rotasjon.",
            "Tilfeldig tilgang er hundrevis av ganger dyrere enn sekvensiell.",
            "Nesten all lagringsoptimalisering handler om å unngå tilfeldig tilgang.",
          ],
          videre: "Neste: hva som endrer seg når de bevegelige delene forsvinner.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "ssd-og-flash",
      tittel: "SSD og flash-minne",
      utbytte:
        "Du kan forklare hvorfor en SSD ikke kan overskrive på plass, og hva slitasjeutjevning og TRIM løser.",
      byggerPa: ["harddisken"],
      skjermer: [
        intro("ss-1-intro", "Ingen bevegelige deler — nye problemer", {
          ingress: (
            <>
              SSD-en fjerner søketid og rotasjon fullstendig. Til gjengjeld får den tre helt nye
              begrensninger som ikke fantes før.
            </>
          ),
        }),
        konsept("ss-2-celler", "Data som ladning", {
          ingress: (
            <>
              En flash-celle lagrer en bit ved å holde på elektroner. Hvor mange bit hver celle
              lagrer, avgjør både pris og levetid.
            </>
          ),
          punkter: [
            "Én bit per celle: to spenningsnivåer. Dyrt, raskt, tåler mest.",
            "Tre eller fire bit per celle: åtte eller seksten nivåer. Billig, tregere, tåler minst.",
            "Flere nivåer betyr mindre margin mellom dem, og dermed større feilrate.",
            "Ladningen lekker langsomt. En SSD i skuffen mister data over år.",
          ],
        }),
        visual("ss-3-celler", "Se spenningsnivåene", {
          ledetekst: <>Sammenlign én, to, tre og fire bit per celle.</>,
          Viz: SsdCellsViz,
          hint: "Se hvor tett nivåene ligger ved fire bit. Det er hele forklaringen på kortere levetid.",
        }),
        anslag("ss-4-anslag", "Kan du overskrive?", {
          sporsmal: (
            <>
              Du vil endre 4 KiB midt i en fil på en SSD. Kan kontrolleren bare skrive over de 4
              kibibytene?
            </>
          ),
          valg: [
            { tekst: "Ja, som på en harddisk" },
            { tekst: "Nei — en hel blokk på flere megabyte må slettes først" },
          ],
          fasit: (
            <>
              Nei. Flash kan skrives i småbiter, men bare <em>slettes</em> i store blokker. Vil du
              endre noe, må hele blokken leses, endres og skrives på nytt et annet sted. Dette heter
              slett-før-skriv, og er kilden til nesten alt annet rart en SSD gjør.
            </>
          ),
        }),
        visual("ss-5-erase", "Slett før skriv", {
          ledetekst: <>Prøv å endre noen sider inne i en blokk.</>,
          Viz: EraseBeforeWriteSim,
          hint: "Tell hvor mange byte som faktisk skrives til flashen når du endrer én side. Forholdet har et navn: skriveforsterkning.",
        }),
        konsept("ss-6-slitasje", "Slitasjeutjevning", {
          ingress: (
            <>
              Hver blokk tåler et begrenset antall slettinger — fra noen tusen til hundre tusen. Ble
              blokkene brukt der filsystemet la dem, ville noen dødd på uker.
            </>
          ),
          punkter: [
            "Kontrolleren har sitt eget kart fra logiske til fysiske adresser.",
            "Skrivinger spres jevnt over alle blokker, uansett hvor filsystemet tror de ligger.",
            "Kalde data flyttes av og til, bare for å frigjøre en lite slitt blokk.",
            "Derfor er logisk adresse og fysisk plassering helt frikoblet på en SSD.",
          ],
        }),
        visual("ss-7-wear", "Med og uten utjevning", {
          ledetekst: <>Skriv til den samme adressen mange ganger.</>,
          Viz: WearLevelingViz,
          hint: "Se hvor slitasjen havner i de to tilfellene. Forskjellen er år mot uker.",
        }),
        konsept("ss-8-trim", "TRIM", {
          ingress: (
            <>
              SSD-en vet ikke hvilke blokker filsystemet har sluttet å bruke. Uten den kunnskapen tar
              den vare på søppel.
            </>
          ),
          punkter: [
            "Sletter du en fil, endres bare filsystemets bitkart. SSD-en merker ingenting.",
            "Kontrolleren tror blokkene er i bruk og flytter dem rundt under opprydding.",
            "TRIM er en beskjed fra filsystemet: disse blokkene trengs ikke lenger.",
            "Uten TRIM blir en SSD merkbart tregere etter måneders bruk.",
          ],
        }),
        visual("ss-9-trim", "Med og uten TRIM", {
          ledetekst: <>Slett filer, med og uten beskjed til disken.</>,
          Viz: TrimDemo,
          hint: "Følg hvor mye ekte arbeid oppryddingen må gjøre i de to tilfellene.",
        }),
        visual("ss-10-compare", "Alle mediene side ved side", {
          ledetekst: <>Fra register til båndstasjon, på logaritmisk skala.</>,
          Viz: StorageCompare,
          hint: "Merk deg størrelsesordenene mellom nivåene, ikke de eksakte tallene.",
        }),
        sjekk("ss-11-sjekk", "Hvorfor blir den treg?", {
          sporsmal: (
            <>
              En nesten full SSD blir merkbart tregere å skrive til. Hvorfor?
            </>
          ),
          valg: [
            { tekst: "Cellene slites fortere når disken er full", hvorfor: "Slitasjen følger antall skrivinger, ikke fyllingsgraden." },
            { tekst: "Det finnes få helt tomme blokker, så hver skriving krever opprydding først", riktig: true, hvorfor: "Kontrolleren må samle sammen gyldige sider og slette en blokk før den kan ta imot nye data." },
            { tekst: "Kontrolleren begrenser hastigheten med vilje", hvorfor: "Ingen slik begrensning finnes." },
          ],
          fasit: (
            <>
              Ingen tomme blokker igjen. Kontrolleren må rydde mens du venter, i stedet for i
              bakgrunnen. Derfor holdes en del av kapasiteten skjult som reserve, og derfor anbefales
              det å la 10–20 % være ledig.
            </>
          ),
        }),
        recall("ss-12-recall", [
          {
            forside: "Hvorfor kan ikke en SSD overskrive data på plass?",
            bakside: "Flash kan skrives i sider, men bare slettes i store blokker. Endring krever lese, endre og skrive et nytt sted.",
          },
          {
            forside: "Hva er slitasjeutjevning?",
            bakside: "Kontrolleren sprer skrivinger jevnt over alle blokker, uavhengig av hvilken logisk adresse filsystemet bruker.",
          },
          {
            forside: "Hva gjør TRIM?",
            bakside: "Forteller SSD-en hvilke blokker filsystemet ikke lenger bruker, slik at kontrolleren slipper å ta vare på søppel.",
          },
        ]),
        oppsummering("ss-13-opp", {
          punkter: [
            "Ingen mekanikk betyr at tilfeldig tilgang blir brukbart.",
            "Slett-før-skriv gir skriveforsterkning og krever opprydding.",
            "Slitasjeutjevning og TRIM er det som gjør en SSD holdbar i praksis.",
          ],
          videre: "Neste emne: hvem som får lov til å røre alt dette.",
        }),
      ],
    },
  ],
};
