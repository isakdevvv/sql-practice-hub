// Emne 5 — Minnehåndtering.
// OSTEP-dybde. Bygger på prosessabstraksjonen: hele emnet forklarer hvordan
// illusjonen om et privat adresserom faktisk lages.

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
import { MemoryLayout } from "@/components/stack/dte2505-virtuelt-minne/MemoryLayout";
import { AddressTranslator } from "@/components/stack/dte2505-virtuelt-minne/AddressTranslator";
import { CacheHierarchy } from "@/components/stack/dte2505-virtuelt-minne/CacheHierarchy";
import { PageReplacementSim } from "@/components/stack/dte2505-virtuelt-minne/PageReplacementSim";
import { VirtueltMinneVisualizer } from "@/components/stack/dte2505-virtuelt-minne/VirtueltMinneVisualizer";

export const emneMinne: Emne = {
  slug: "minne",
  tittel: "Minnehåndtering",
  sporsmal: "Hvordan får hver prosess et helt eget minne, når det bare finnes én RAM-brikke?",
  pensum: "OSTEP-dybde; forutsetning for modul 3 og 4",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "adresserommet",
      tittel: "Adresserommet til en prosess",
      utbytte:
        "Du kan plassere en variabel i riktig del av adresserommet, og forklare hvorfor stack og heap vokser mot hverandre.",
      byggerPa: ["prosess-abstraksjonen"],
      skjermer: [
        intro("ar-1-intro", "Hver prosess tror den er alene", {
          ingress: (
            <>
              Fra prosessens side er minnet en lang, tom, sammenhengende strekning som bare tilhører
              den. Ingenting av dette er sant. Det er en illusjon operativsystemet og prosessoren
              bygger sammen.
            </>
          ),
        }),
        konsept("ar-2-deler", "Fire deler", {
          ingress: <>Adresserommet er delt i områder med hver sin oppførsel.</>,
          punkter: [
            <>
              <Term>Kodesegmentet</Term> — selve instruksjonene. Skrivebeskyttet, fast størrelse.
            </>,
            <>
              <Term>Datasegmentet</Term> — globale variabler. Fast størrelse, kjent ved
              kompilering.
            </>,
            <>
              <Term>Heapen</Term> — minne du ber om underveis. Vokser oppover.
            </>,
            <>
              <Term>Stacken</Term> — lokale variabler og returadresser. Vokser nedover.
            </>,
          ],
          merk: (
            <>
              Heap og stack vokser mot hverandre med et stort tomrom imellom, slik at ingen av dem
              må velge størrelse på forhånd.
            </>
          ),
        }),
        anslag("ar-3-anslag", "Hvor ligger den?", {
          sporsmal: (
            <>
              I C: <Kodelinje>char *p = malloc(64);</Kodelinje> inne i en funksjon. Hvor ligger de
              64 bytene, og hvor ligger selve pekeren <Kodelinje>p</Kodelinje>?
            </>
          ),
          valg: [
            { tekst: "Begge på heapen" },
            { tekst: "Begge på stacken" },
            { tekst: "De 64 bytene på heapen, pekeren på stacken" },
          ],
          fasit: (
            <>
              De 64 bytene på heapen, pekeren på stacken. Pekeren er en lokal variabel — åtte byte
              som inneholder en adresse. Blandingen av disse to er kilden til de fleste
              minnefeil i C: returnerer du pekeren fra funksjonen er det greit, men returnerer du
              adressen til en lokal <em>array</em>, peker den på stack som allerede er gjenbrukt.
            </>
          ),
        }),
        visual("ar-4-layout", "Se adresserommet", {
          ledetekst: <>Klikk på delene og se hva som havner hvor.</>,
          Viz: MemoryLayout,
          hint: "Legg merke til hvilken vei adressene teller i hver del.",
        }),
        kode("ar-5-maps", "Se det på din egen maskin", {
          ingress: <>Linux legger fram hele kartet som en tekstfil.</>,
          kode: `cat /proc/self/maps

# Utdrag:
# 55d1... r-xp  /usr/bin/cat      <- kode, lesbar og kjørbar
# 55d1... rw-p  /usr/bin/cat      <- data, lesbar og skrivbar
# 55d1... rw-p  [heap]
# 7ffd... rw-p  [stack]`,
          punkter: [
            <>
              Kolonnen med <Kodelinje>r</Kodelinje>, <Kodelinje>w</Kodelinje> og{" "}
              <Kodelinje>x</Kodelinje> er rettighetene på hvert område.
            </>,
            <>
              Kode er <Kodelinje>r-x</Kodelinje>: lesbar og kjørbar, men ikke skrivbar. Det stopper
              en hel klasse angrep.
            </>,
          ],
        }),
        sjekk("ar-6-sjekk", "Hvorfor krasjer den?", {
          sporsmal: (
            <>
              Et program prøver å skrive til adressen der sin egen kode ligger. Hva skjer, og
              hvorfor?
            </>
          ),
          valg: [
            { tekst: "Det virker — programmet eier jo sitt eget minne", hvorfor: "Eierskap er ikke det samme som skriverett." },
            { tekst: "Segmenteringsfeil, fordi kodeområdet ikke er skrivbart", riktig: true, hvorfor: "Rettighetene ligger i minnekartet og håndheves av maskinvaren." },
            { tekst: "Programmet fryser", hvorfor: "Maskinvaren avviser umiddelbart; ingenting fryser." },
          ],
          fasit: (
            <>
              Segmenteringsfeil. Rettighetene per område håndheves av prosessoren ved hver eneste
              minneaksess. At kode ikke er skrivbar, og at data ikke er kjørbare, er to av de
              viktigste forsvarsverkene mot at et angrep kan legge inn egen kode.
            </>
          ),
        }),
        recall("ar-7-recall", [
          {
            forside: "Hvilke fire deler har et adresserom?",
            bakside: "Kode, globale data, heap og stack.",
          },
          {
            forside: "Hvorfor vokser heap og stack mot hverandre?",
            bakside: "Så ingen av dem må bestemme størrelsen på forhånd — de deler tomrommet mellom seg.",
          },
          {
            forside: "Hvilke rettigheter har kodeområdet, og hvorfor?",
            bakside: "Lesbart og kjørbart, ikke skrivbart. Det hindrer at et program (eller et angrep) endrer sin egen kode.",
          },
        ]),
        oppsummering("ar-8-opp", {
          punkter: [
            "Adresserommet ser sammenhengende ut, men er en illusjon.",
            "Kode, data, heap og stack har ulike rettigheter.",
            "/proc/self/maps viser kartet på din egen maskin.",
          ],
          videre: "Neste: hvordan illusjonen faktisk lages, side for side.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "paging-og-oversetting",
      tittel: "Sider, rammer og oversetting",
      utbytte:
        "Du kan dele en virtuell adresse i sidenummer og forskyvning, og forklare hvordan sidetabellen finner den fysiske plassen.",
      byggerPa: ["adresserommet"],
      skjermer: [
        intro("po-1-intro", "Del alt i like biter", {
          ingress: (
            <>
              Løsningen på å plassere mange adresserom i én RAM er å slutte å tenke på dem som
              sammenhengende. Del alt i like store biter, og la bitene ligge hvor som helst.
            </>
          ),
        }),
        konsept("po-2-side-ramme", "Sider og rammer", {
          ingress: <>To ord for samme størrelse, på hver sin side av oversettingen.</>,
          punkter: [
            <>
              <Term>Side</Term> (page) — en bit av det virtuelle adresserommet. Typisk 4 KiB.
            </>,
            <>
              <Term>Ramme</Term> (frame) — en like stor bit av den fysiske RAM-en.
            </>,
            "Enhver side kan legges i en hvilken som helst ledig ramme.",
            "To sider som ligger etter hverandre virtuelt, kan ligge langt fra hverandre fysisk.",
          ],
          merk: (
            <>
              Fordi sider og rammer er nøyaktig like store, forsvinner problemet med å finne et
              hull av riktig størrelse. Alle hull passer.
            </>
          ),
        }),
        konsept("po-3-adressen", "Adressen består av to deler", {
          ingress: (
            <>
              En virtuell adresse deles i to: hvilken side, og hvor langt inn i siden. Delingen er
              ren bitkutting — ingen regning.
            </>
          ),
          punkter: [
            <>
              Nederste bitene er <Term>forskyvningen</Term> (offset) — posisjonen inne i siden.
            </>,
            "Med 4 KiB sider trengs 12 bit til forskyvning, fordi 2^12 = 4096.",
            "Resten av bitene er sidenummeret.",
            "Forskyvningen endres aldri av oversettingen. Bare sidenummeret byttes ut.",
          ],
        }),
        tallanslag("po-4-tall", "Hvor mange bit?", {
          sporsmal: (
            <>
              En maskin har 16-bits adresser og sider på 1 KiB. Hvor mange bit brukes til
              forskyvning?
            </>
          ),
          enhet: "bit",
          fasitTall: 10,
          fasit: (
            <>
              10 bit, fordi 1 KiB = 1024 = 2^10. De seks øverste bitene blir da sidenummer, som gir
              64 sider. Regelen er alltid den samme: antall forskyvningsbit er toerpotensen i
              sidestørrelsen.
            </>
          ),
        }),
        konsept("po-5-tabell", "Sidetabellen", {
          ingress: (
            <>
              <Term>Sidetabellen</Term> er en oppslagstabell per prosess: sidenummer inn,
              rammenummer ut.
            </>
          ),
          punkter: [
            "Hver oppføring har rammenummeret pluss noen bit med tilleggsinformasjon.",
            "Gyldig-bit: er denne siden i det hele tatt i bruk?",
            "Til stede-bit: ligger den i RAM nå, eller er den byttet ut på disk?",
            "Rettighetsbit: lesbar, skrivbar, kjørbar.",
          ],
          bihjelp: (
            <>
              Det er nettopp gyldig-bitten som gir segmenteringsfeil: du traff en side som ikke er
              kartlagt i det hele tatt.
            </>
          ),
        }),
        visual("po-6-oversetter", "Oversett en adresse", {
          ledetekst: <>Skriv inn en virtuell adresse og se den bli delt og slått opp.</>,
          Viz: AddressTranslator,
          hint: "Endre bare forskyvningen og se at rammenummeret står stille. Endre sidenummeret, og alt flytter seg.",
        }),
        anslag("po-7-anslag", "Hvor stor blir tabellen?", {
          sporsmal: (
            <>
              En 32-bits maskin med 4 KiB sider og 4 byte per tabelloppføring. Hvor stor blir én
              flat sidetabell per prosess?
            </>
          ),
          valg: [{ tekst: "4 KiB" }, { tekst: "1 MiB" }, { tekst: "4 MiB" }, { tekst: "1 GiB" }],
          fasit: (
            <>
              4 MiB. 32 bit minus 12 forskyvningsbit gir 20 bit sidenummer, altså 2^20 ≈ en million
              oppføringer, ganger 4 byte. Og det er <em>per prosess</em> — med hundre prosesser er
              du på 400 MiB bare i tabeller. Løsningen er sidetabeller i flere nivåer, der
              tomrommet ikke koster noe.
            </>
          ),
        }),
        konsept("po-8-flernivaa", "Tabeller i flere nivåer", {
          ingress: (
            <>
              De aller fleste sidenumre er ubrukte. Et flernivåoppsett lar hele områder av tabellen
              være fraværende i stedet for tomme.
            </>
          ),
          punkter: [
            "Sidenummeret deles i to eller flere biter.",
            "Første bit slår opp i en ytre tabell, som peker til en indre tabell.",
            "Er hele det området ubrukt, finnes den indre tabellen rett og slett ikke.",
            "Prisen: flere oppslag i minnet per oversetting. Moderne 64-bits maskiner bruker fire nivåer.",
          ],
        }),
        sjekk("po-9-sjekk", "Hva endres ikke?", {
          sporsmal: <>Hva er alltid likt i den virtuelle og den fysiske adressen?</>,
          valg: [
            { tekst: "Sidenummeret", hvorfor: "Det er nettopp den delen som byttes ut med et rammenummer." },
            { tekst: "Forskyvningen", riktig: true, hvorfor: "Posisjonen inne i siden er den samme, siden sider og rammer er like store." },
            { tekst: "Ingenting — hele adressen regnes om", hvorfor: "Bare den øvre delen slås opp." },
          ],
          fasit: (
            <>
              Forskyvningen. Den kopieres uendret. Det er derfor oversettingen kan gjøres med ren
              bitmanipulering i maskinvare, uten en eneste addisjon.
            </>
          ),
        }),
        recall("po-10-recall", [
          {
            forside: "Hva er forskjellen på en side og en ramme?",
            bakside: "Siden er en bit av det virtuelle adresserommet, rammen er en like stor bit av fysisk RAM.",
          },
          {
            forside: "Hvordan finner du antall forskyvningsbit?",
            bakside: "Det er toerpotensen i sidestørrelsen. 4 KiB = 2^12, altså 12 bit.",
          },
          {
            forside: "Hvorfor bruker moderne systemer sidetabeller i flere nivåer?",
            bakside: "Fordi en flat tabell må dekke hele adresserommet, mens et flernivåoppsett lar ubrukte områder mangle helt.",
          },
        ]),
        oppsummering("po-11-opp", {
          punkter: [
            "Adressen deles i sidenummer og forskyvning; bare sidenummeret oversettes.",
            "Sidetabellen holder rammenummer pluss gyldig-, til stede- og rettighetsbit.",
            "Flernivåtabeller gjør at tomrom ikke koster minne.",
          ],
          videre: "Neste: hvorfor dette hadde vært hundre ganger for tregt uten en hurtigbuffer.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "tlb-og-cache",
      tittel: "TLB og hurtigbuffere",
      utbytte:
        "Du kan forklare hvorfor oversettingsbufferen er nødvendig, og hvordan tilgangsmønsteret ditt avgjør om den hjelper.",
      byggerPa: ["paging-og-oversetting"],
      skjermer: [
        intro("tc-1-intro", "Regnestykket som ikke går opp", {
          ingress: (
            <>
              Med sidetabeller i fire nivåer må maskinen slå opp i minnet fire ganger for å finne ut
              hvor den ene tingen du ba om ligger. Det ville gjort hver minneaksess fem ganger
              tregere.
            </>
          ),
        }),
        anslag("tc-2-anslag", "Hvor mye tregere?", {
          sporsmal: (
            <>
              Uten noen hurtigbuffer for oversetting, hvor mange minneaksesser koster det å lese én
              verdi på en 64-bits maskin med fire nivåer sidetabell?
            </>
          ),
          valg: [{ tekst: "2" }, { tekst: "3" }, { tekst: "5" }, { tekst: "8" }],
          fasit: (
            <>
              5: fire oppslag for å gå gjennom tabellnivåene, og til slutt ett for å hente selve
              verdien. Det er grunnen til at det finnes en dedikert hurtigbuffer bare for
              oversettinger.
            </>
          ),
        }),
        konsept("tc-3-tlb", "Oversettingsbufferen", {
          ingress: (
            <>
              <Term>TLB</Term> (translation lookaside buffer — oversettingsbuffer) er en liten,
              rasende rask tabell inne i prosessoren som husker de siste oversettingene.
            </>
          ),
          punkter: [
            "Typisk noen hundre til noen tusen oppføringer.",
            "Treff: oversettingen er ferdig på under ett nanosekund.",
            "Bom: maskinen må gå gjennom sidetabellen, og legger resultatet i bufferen etterpå.",
            "Treffraten er i praksis over 99 % — det er derfor paging er brukbart i det hele tatt.",
          ],
        }),
        konsept("tc-4-lokalitet", "Hvorfor det virker: lokalitet", {
          ingress: (
            <>
              Bufferen ville vært verdiløs hvis programmer hoppet tilfeldig rundt i minnet. Det gjør
              de nesten aldri.
            </>
          ),
          punkter: [
            <>
              <Term>Romlig lokalitet</Term> — bruker du én adresse, bruker du snart naboen. En
              løkke gjennom en array.
            </>,
            <>
              <Term>Tidsmessig lokalitet</Term> — bruker du noe nå, bruker du det trolig snart
              igjen. En tellervariabel.
            </>,
            "Én side på 4 KiB rommer 1024 fire-byters tall. Går du gjennom dem, er 1023 av 1024 aksesser treff.",
          ],
        }),
        visual("tc-5-cache", "Hierarkiet", {
          ledetekst: <>Fra register til disk — se hvor mye tid hvert steg koster.</>,
          Viz: CacheHierarchy,
          hint: "Merk deg størrelsesordenene, ikke tallene. Hvert nivå er omtrent ti ganger tregere enn det over.",
        }),
        konsept("tc-6-bytte", "Hva som skjer ved kontekstbytte", {
          ingress: (
            <>
              Oversettingene i bufferen gjelder én bestemt prosess. Bytter du prosess, betyr de
              plutselig noe helt annet.
            </>
          ),
          punkter: [
            "Naiv løsning: tøm hele bufferen ved hvert bytte. Trygt, men dyrt.",
            "Bedre: merk hver oppføring med hvilken prosess den gjelder.",
            "Da kan to prosessers oversettinger ligge side om side uten å blandes.",
            "Dette er en del av grunnen til at prosessbytte koster mer enn trådbytte.",
          ],
        }),
        kode("tc-7-mater", "Lær først: hvorfor rekkefølgen betyr alt", {
          ingress: (
            <>
              To løkker som gjør nøyaktig samme arbeid på en stor todimensjonal array. Den ene kan
              være mange ganger tregere.
            </>
          ),
          kode: `// Radvis — følger minnet slik det ligger
for (i = 0; i < N; i++)
    for (j = 0; j < N; j++)
        sum += a[i][j];

// Kolonnevis — hopper N tall for hvert steg
for (j = 0; j < N; j++)
    for (i = 0; i < N; i++)
        sum += a[i][j];`,
          punkter: [
            "I C ligger radene sammenhengende i minnet.",
            "Radvis: hver hentet buffer-linje brukes helt opp før neste hentes.",
            "Kolonnevis: du bruker ett tall fra hver linje, og kaster resten.",
          ],
        }),
        sjekk("tc-8-sjekk", "Prøv selv", {
          sporsmal: (
            <>
              Du går gjennom en stor liste med pekere som peker tilfeldig rundt i et 2 GiB
              minneområde. Hva blir treffraten i oversettingsbufferen?
            </>
          ),
          valg: [
            { tekst: "Høy, som vanlig — over 99 %", hvorfor: "Høy treffrate forutsetter lokalitet, og her er det ingen." },
            { tekst: "Svært lav — nesten hvert oppslag bommer", riktig: true, hvorfor: "Tilfeldige hopp over 2 GiB treffer nesten aldri en side som allerede er i bufferen." },
            { tekst: "Spiller ingen rolle, oversetting er gratis", hvorfor: "Oversetting er bare nesten gratis, og bare ved treff." },
          ],
          fasit: (
            <>
              Nesten bare bom. 2 GiB er en halv million sider, og bufferen rommer kanskje to tusen
              oversettinger. Dette er grunnen til at en lenket liste kan være ti ganger tregere enn
              en array med nøyaktig like mange elementer.
            </>
          ),
        }),
        recall("tc-9-recall", [
          {
            forside: "Hva står TLB for, og hva gjør den?",
            bakside: "Translation lookaside buffer — en hurtigbuffer i prosessoren som husker de siste oversettingene fra side til ramme.",
          },
          {
            forside: "Hva er romlig og tidsmessig lokalitet?",
            bakside: "Romlig: du bruker snart naboadressen. Tidsmessig: du bruker snart den samme adressen igjen.",
          },
          {
            forside: "Hvorfor er radvis gjennomgang av en array raskere enn kolonnevis i C?",
            bakside: "Fordi radene ligger sammenhengende i minnet, så hver hentet buffer-linje brukes helt opp.",
          },
        ]),
        oppsummering("tc-10-opp", {
          punkter: [
            "Uten oversettingsbuffer ville paging vært flere ganger for tregt.",
            "Bufferen virker fordi programmer har lokalitet.",
            "Tilgangsmønsteret ditt avgjør ytelsen mer enn antall operasjoner.",
          ],
          videre: "Neste: hva som skjer når siden du vil ha ikke er i RAM i det hele tatt.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "sidefeil-og-utbytting",
      tittel: "Sidefeil og utbytting",
      utbytte:
        "Du kan skille de tre typene sidefeil, og sammenligne utbyttingsalgoritmer på en gitt referansestreng.",
      byggerPa: ["tlb-og-cache"],
      skjermer: [
        intro("su-1-intro", "Mer minne enn du har", {
          ingress: (
            <>
              Summen av adresserommene til alle prosesser er som regel mye større enn RAM-en. Det
              går fint, fordi ingen bruker alt sitt samtidig.
            </>
          ),
        }),
        konsept("su-2-demand", "Last inn først når det trengs", {
          ingress: (
            <>
              Når et program starter, lastes nesten ingenting inn. Sidene hentes etter hvert som de
              faktisk brukes.
            </>
          ),
          punkter: [
            "Sidetabellens til stede-bit står på null for sider som ikke er i RAM.",
            "Treffer prosessen en slik side, utløses et unntak: en sidefeil.",
            "Kjernen henter siden, oppdaterer tabellen, og lar instruksjonen prøve på nytt.",
            "Programmet merker ingenting bortsett fra at det tok litt tid.",
          ],
        }),
        konsept("su-3-tre-typer", "Tre slags sidefeil", {
          ingress: <>Alle heter «sidefeil», men bare én av dem er faktisk en feil.</>,
          punkter: [
            <>
              <Term>Liten sidefeil</Term> — siden er i RAM, men ikke i denne prosessens tabell.
              Løses uten disk.
            </>,
            <>
              <Term>Stor sidefeil</Term> — siden må hentes fra disk. Tar mikrosekunder til
              millisekunder.
            </>,
            <>
              <Term>Ugyldig aksess</Term> — siden finnes ikke i det hele tatt. Dette er
              segmenteringsfeilen.
            </>,
          ],
          bihjelp: (
            <>
              <Kodelinje>ps -o min_flt,maj_flt</Kodelinje> viser antall små og store sidefeil per
              prosess. Mange store betyr at maskinen mangler RAM.
            </>
          ),
        }),
        anslag("su-4-anslag", "Hvor dyr er en stor sidefeil?", {
          sporsmal: (
            <>
              Hvor mange vanlige minneaksesser kunne maskinen rukket i den tiden én stor sidefeil
              mot en SSD tar?
            </>
          ),
          valg: [{ tekst: "Rundt 10" }, { tekst: "Rundt 1 000" }, { tekst: "Rundt 1 000 000" }],
          fasit: (
            <>
              Rundt en million. En minneaksess tar omtrent 100 nanosekunder, en SSD-lesing omtrent
              100 mikrosekunder — tusen ganger mer — og hver aksess er igjen ti ganger raskere enn
              det. Mot en mekanisk harddisk er faktoren hundre ganger større igjen. Det er derfor
              en maskin som må bytte mye føles fullstendig død.
            </>
          ),
        }),
        konsept("su-5-hvem-ut", "Hvem skal ut?", {
          ingress: <>Når RAM er full, må noe vike. Valget avgjør hvor ofte du får nye sidefeil.</>,
          punkter: [
            <>
              <Term>Optimal</Term> — kast den siden som brukes lengst fram i tid. Umulig, men et
              målestokk.
            </>,
            <>
              <Term>FIFO</Term> — kast den eldste. Enkel, men tar ingen hensyn til bruk.
            </>,
            <>
              <Term>LRU</Term> (least recently used) — kast den som ikke er brukt på lengst tid.
              God, men dyr å måle nøyaktig.
            </>,
            <>
              <Term>Klokke</Term> — en billig tilnærming til LRU med én bruksbit per side. Dette er
              det ekte systemer bruker.
            </>,
          ],
        }),
        visual("su-6-sim", "Kjør algoritmene", {
          ledetekst: <>Samme referansestreng, ulike algoritmer og ulikt antall rammer.</>,
          Viz: PageReplacementSim,
          hint: "Prøv FIFO med tre rammer, så med fire, på sekvensen 1,2,3,4,1,2,5,1,2,3,4,5. Flere rammer kan gi FLERE feil. Det heter Beladys anomali.",
        }),
        konsept("su-7-tresking", "Tresking", {
          ingress: (
            <>
              Er det arbeidssettet — sidene prosessene faktisk bruker — større enn RAM, går systemet
              inn i en tilstand der alt det gjør er å bytte sider inn og ut.
            </>
          ),
          punkter: [
            "Hver prosess kaster ut en side en annen prosess trenger med én gang.",
            "CPU-bruken faller mot null mens diskbruken går i taket.",
            "Symptom: maskinen svarer ikke, men prosessoren er ledig.",
            "Linux svarer til slutt med å drepe den mest minnesultne prosessen.",
          ],
        }),
        sjekk("su-8-sjekk", "Hvilken sidefeil?", {
          sporsmal: (
            <>
              To prosesser kjører det samme programmet. Prosess B treffer en side med programkode
              som allerede ligger i RAM fordi prosess A har lastet den. Hva slags sidefeil er dette?
            </>
          ),
          valg: [
            { tekst: "Stor — siden må hentes", hvorfor: "Den ligger allerede i RAM; ingen disk er involvert." },
            { tekst: "Liten — bare tabellen må oppdateres", riktig: true, hvorfor: "Kjernen peker B sin sidetabell til rammen som allerede finnes." },
            { tekst: "Ugyldig aksess", hvorfor: "Siden er helt lovlig for B å bruke." },
          ],
          fasit: (
            <>
              Liten. Kjernen lar begge prosessenes sidetabeller peke til den samme fysiske rammen.
              Det er derfor tjue terminalvinduer ikke bruker tjue ganger så mye minne på selve
              programkoden — den deles.
            </>
          ),
        }),
        recall("su-9-recall", [
          {
            forside: "Hva er forskjellen på en liten og en stor sidefeil?",
            bakside: "Liten: siden er i RAM, bare tabellen må oppdateres. Stor: siden må hentes fra disk.",
          },
          {
            forside: "Hva er Beladys anomali?",
            bakside: "At FIFO kan gi flere sidefeil når du gir systemet flere rammer. LRU og optimal har ikke dette problemet.",
          },
          {
            forside: "Hva kjennetegner tresking?",
            bakside: "Arbeidssettet er større enn RAM. Diskbruken går i taket, CPU-bruken mot null, og maskinen svarer ikke.",
          },
        ]),
        oppsummering("su-10-opp", {
          punkter: [
            "Sider lastes først når de brukes.",
            "Små sidefeil er billige, store koster som en million minneaksesser.",
            "Klokkealgoritmen er den praktiske tilnærmingen til LRU.",
          ],
          videre: "Neste: den eldre modellen paging erstattet — og hvorfor navnet lever videre.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "segmentering-og-fragmentering",
      tittel: "Segmentering og fragmentering",
      utbytte:
        "Du kan forklare hvorfor variabel størrelse gir fragmentering, og hvorfor «segmenteringsfeil» fortsatt heter det den heter.",
      byggerPa: ["paging-og-oversetting"],
      skjermer: [
        intro("sf-1-intro", "Før alt ble like stort", {
          ingress: (
            <>
              Før paging fantes <Term>segmentering</Term>: hvert område i adresserommet fikk sin
              egen sammenhengende plass i RAM, med sin egen størrelse.
            </>
          ),
        }),
        konsept("sf-2-hvordan", "Slik virket det", {
          ingress: <>Ett par tall per segment, i stedet for en hel tabell per side.</>,
          punkter: [
            "Hvert segment hadde en grunnadresse og en lengde.",
            "Fysisk adresse = grunnadresse + forskyvning.",
            "Er forskyvningen større enn lengden, avvises aksessen.",
            "Kode, data og stack fikk hvert sitt segment — og hver sine rettigheter.",
          ],
          merk: (
            <>
              Det er nettopp denne lengdesjekken som ga navnet <Term>segmenteringsfeil</Term>. Navnet
              lever videre selv om mekanismen under er blitt paging.
            </>
          ),
        }),
        anslag("sf-3-anslag", "Hva er problemet?", {
          sporsmal: (
            <>
              Segmenter har vilkårlige størrelser og må ligge sammenhengende. Hva blir hovedproblemet
              etter at systemet har kjørt en stund?
            </>
          ),
          valg: [
            { tekst: "Det blir for få segmenter" },
            { tekst: "Det blir mange små hull som ingenting passer i" },
            { tekst: "Oversettingen blir for treg" },
          ],
          fasit: (
            <>
              Mange små hull. Det heter <Term>ekstern fragmentering</Term>: du har kanskje 500 MiB
              ledig totalt, men det største sammenhengende hullet er 30 MiB, så en forespørsel om
              100 MiB feiler. Paging fjerner problemet fullstendig, fordi alle biter er like store
              og enhver ledig ramme passer.
            </>
          ),
        }),
        konsept("sf-4-to-typer", "To slags sløsing", {
          ingress: <>Begge heter fragmentering, men de er motsatte problemer.</>,
          punkter: [
            <>
              <Term>Ekstern fragmentering</Term> — ledig minne finnes, men i for små biter.
              Segmenteringens problem.
            </>,
            <>
              <Term>Intern fragmentering</Term> — du fikk mer enn du ba om, og resten står ubrukt.
              Pagingens problem.
            </>,
            "Ber du om 1 byte med 4 KiB sider, sløser du 4095 byte. Det er intern fragmentering.",
            "I snitt sløses en halv side per område — en pris nesten alle godtar.",
          ],
        }),
        visual("sf-5-viz", "Hele bildet samlet", {
          ledetekst: (
            <>
              Denne visualiseringen setter sammen adresserom, sidetabell, oversettingsbuffer og
              sidefeil i én modell.
            </>
          ),
          Viz: VirtueltMinneVisualizer,
          hint: "Kjør gjennom en aksess som først bommer i bufferen, og deretter utløser en sidefeil. Det er verstefallet.",
          hoyde: "max-h-[440px]",
        }),
        konsept("sf-6-i-dag", "Hvor segmentering lever videre", {
          ingress: <>Ren segmentering er borte, men ideen om navngitte områder er ikke det.</>,
          punkter: [
            "Moderne systemer bruker paging til oversetting, og segmenter bare som områdenavn.",
            <>
              Det er derfor <Kodelinje>/proc/self/maps</Kodelinje> viser navngitte områder med
              hver sine rettigheter.
            </>,
            "Rettigheter håndheves per side, ikke per segment.",
          ],
        }),
        sjekk("sf-7-sjekk", "Hvilken fragmentering?", {
          sporsmal: (
            <>
              Et program ber om 5 byte minne. Systemet bruker 4 KiB sider. Hvilken slags sløsing er
              dette et eksempel på?
            </>
          ),
          valg: [
            { tekst: "Ekstern fragmentering", hvorfor: "Ekstern er ubrukelige hull mellom tildelinger, ikke ubrukt plass inni en." },
            { tekst: "Intern fragmentering", riktig: true, hvorfor: "Du fikk en hel side og bruker fem byte av den." },
            { tekst: "Ingen — 5 byte er 5 byte", hvorfor: "Minnet tildeles i hele sider, ikke i byte." },
          ],
          fasit: (
            <>
              Intern. I praksis håndterer <Kodelinje>malloc</Kodelinje> dette for deg: den ber
              kjernen om store områder og deler dem ut i småbiter selv, nettopp for å slippe å
              sløse en hel side per lille tildeling.
            </>
          ),
        }),
        recall("sf-8-recall", [
          {
            forside: "Hvorfor heter det fortsatt «segmenteringsfeil»?",
            bakside: "Navnet stammer fra segmenteringens lengdesjekk. Mekanismen er nå pagingens gyldig-bit, men navnet ble hengende.",
          },
          {
            forside: "Hva er forskjellen på ekstern og intern fragmentering?",
            bakside: "Ekstern: ledig minne finnes, men i for små biter. Intern: du fikk mer enn du trengte, og resten står ubrukt.",
          },
          {
            forside: "Hvorfor fjerner paging ekstern fragmentering?",
            bakside: "Fordi alle biter er like store, så enhver ledig ramme passer til enhver side.",
          },
        ]),
        oppsummering("sf-9-opp", {
          punkter: [
            "Segmentering ga variabel størrelse og dermed ekstern fragmentering.",
            "Paging bytter det mot intern fragmentering på en halv side i snitt.",
            "Navnet «segmenteringsfeil» er et fossil fra den gamle modellen.",
          ],
          videre: "Neste emne: flere utførelser inne i samme adresserom.",
        }),
      ],
    },
  ],
};
