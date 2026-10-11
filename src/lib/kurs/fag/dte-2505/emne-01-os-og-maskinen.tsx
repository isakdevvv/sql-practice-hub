// Emne 1 — Operativsystemet og maskinen.
// Pensum: Canvas modul 1a «Linux og operativsystemer».
// Ingen forkunnskaper. Alt senere i faget bygger på dette emnet.

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
import { OsTypologiSimulator } from "@/components/stack/dte2505-os-typologi/OsTypologiSimulator";
import { OsCompare } from "@/components/stack/dte2505-os-typologi/OsCompare";
import { UseCaseMatch } from "@/components/stack/dte2505-os-typologi/UseCaseMatch";
import { SyscallFlowDiagram } from "@/components/stack/dte2505-virtualisering/SyscallFlowDiagram";
import { StackDiagram } from "@/components/stack/dte2505-virtualisering/StackDiagram";

export const emneOsOgMaskinen: Emne = {
  slug: "os-og-maskinen",
  tittel: "Operativsystemet og maskinen",
  sporsmal: "Hva gjør et operativsystem, og hvorfor står det mellom deg og maskinvaren?",
  pensum: "Canvas modul 1a — Linux og operativsystemer",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "hva-os-gjor",
      tittel: "Hva et operativsystem faktisk gjør",
      utbytte:
        "Du kan forklare de tre jobbene et operativsystem har, og hvorfor ingen av dem er valgfrie.",
      skjermer: [
        intro("os-1-intro", "Maskinen uten sjef", {
          ingress: (
            <>
              Se for deg en kontorbygning uten resepsjon. Alle som kommer inn må selv finne et
              ledig rom, selv passe på at ingen andre bruker det samtidig, og selv rydde etterpå.
              Det går bra med to personer. Med tretti er det kaos.
            </>
          ),
          punkter: [
            "En datamaskin kjører hundrevis av programmer samtidig.",
            "Alle vil ha den samme prosessoren, det samme minnet og den samme disken.",
            "Noen må dele ut, si nei, og rydde opp.",
          ],
          merk: <>Den «noen» er operativsystemet. Vi forkorter det <Term>OS</Term> gjennom hele faget.</>,
        }),
        anslag("os-2-anslag", "Hvor mange programmer kjører nå?", {
          sporsmal: (
            <>
              På en helt vanlig bærbar maskin der du bare har åpnet en nettleser — hvor mange
              prosesser tror du kjører i bakgrunnen akkurat da?
            </>
          ),
          valg: [
            { tekst: "5–10" },
            { tekst: "20–40" },
            { tekst: "150–400" },
            { tekst: "Over 1000" },
          ],
          fasit: (
            <>
              Typisk 150–400. De aller fleste er småtjenester du aldri ser: nettverk, lyd,
              batteri, klokke, skriverkø, oppdateringssjekk. Alle konkurrerer om den samme
              maskinvaren, og alle tror de har den for seg selv.
            </>
          ),
        }),
        konsept("os-3-tre-jobber", "De tre jobbene", {
          ingress: <>Alt et OS gjør faller i tre bøtter. Resten av faget er detaljene i dem.</>,
          punkter: [
            <>
              <Term>Dele ut</Term> — hvem får prosessoren nå, hvor mye minne, hvilken del av disken.
            </>,
            <>
              <Term>Beskytte</Term> — hindre at ett program leser eller ødelegger et annets data.
            </>,
            <>
              <Term>Forenkle</Term> — gi programmene et pent grensesnitt i stedet for rå maskinvare.
            </>,
          ],
          merk: (
            <>
              Bøtte tre er den som er lettest å undervurdere. Uten den måtte hvert program hatt
              egen kode for hver eneste diskmodell som finnes.
            </>
          ),
        }),
        konsept("os-4-abstraksjon", "Forenkling er den store gevinsten", {
          ingress: (
            <>
              En nettverksdriver, en SSD og en USB-pinne har ingenting til felles fysisk. Likevel
              skriver du til alle tre med den samme kommandoen. Det er ikke tilfeldig — det er den
              tjenesten operativsystemet selger deg.
            </>
          ),
          punkter: [
            "Programmet ditt sier «skriv disse bytene til denne filen».",
            "OS-et oversetter til det språket akkurat denne enheten forstår.",
            "Bytter du disk, endres driveren — ikke programmet ditt.",
          ],
          bihjelp: (
            <>
              Vi bruker ordet <Term>abstraksjon</Term> om dette: en forenklet modell som skjuler
              detaljer du ikke trenger. Det ordet kommer tilbake i hvert eneste emne.
            </>
          ),
        }),
        visual("os-5-stack", "Lagene i en maskin", {
          ledetekst: (
            <>
              Her er lagene fra maskinvaren og opp til programmet ditt. Klikk deg gjennom dem.
            </>
          ),
          Viz: StackDiagram,
          hint: "Legg merke til hvor tynn stripen mellom brukerprogram og kjerne er — den stripen er hele resten av dette emnet.",
        }),
        sjekk("os-6-sjekk", "Hvilken bøtte?", {
          sporsmal: (
            <>
              Firefox prøver å lese minnet der passordbehandleren din har lagret noe. Forsøket
              stoppes. Hvilken av de tre jobbene var det som slo inn?
            </>
          ),
          valg: [
            { tekst: "Dele ut", hvorfor: "Utdeling handler om hvem som får ressursen, ikke om hvem som får lov." },
            { tekst: "Beskytte", riktig: true, hvorfor: "Isolasjon mellom prosesser er nettopp beskyttelse." },
            { tekst: "Forenkle", hvorfor: "Forenkling er grensesnittet utad, ikke grensevaktholdet." },
          ],
          fasit: (
            <>
              Beskytte. Hver prosess har sitt eget adresserom, og maskinvaren nekter fysisk å la
              den ene se inn i den andre. Hvordan det gjøres er tema i emnet om minne.
            </>
          ),
        }),
        recall("os-7-recall", [
          {
            forside: "Hvilke tre jobber har et operativsystem?",
            bakside: "Dele ut ressurser, beskytte programmer fra hverandre, og forenkle maskinvaren til et felles grensesnitt.",
          },
          {
            forside: "Hva mener vi med abstraksjon?",
            bakside: "En forenklet modell som skjuler detaljer. «Fil» er en abstraksjon over blokker på en disk.",
          },
          {
            forside: "Hvorfor slipper programmet ditt å vite hvilken diskmodell maskinen har?",
            bakside: "Fordi driveren under operativsystemet oversetter det felles grensesnittet til akkurat den enhetens språk.",
          },
        ]),
        oppsummering("os-8-opp", {
          punkter: [
            "Et OS deler ut, beskytter og forenkler.",
            "Forenklingen er det som gjør at samme program kjører på ulik maskinvare.",
            "Beskyttelsen er ikke gratis — den krever hjelp fra prosessoren selv.",
          ],
          videre: "Neste undertema: hvordan prosessoren hjelper til, med to kjøremoduser.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kjerne-og-brukermodus",
      tittel: "Kjernemodus og brukermodus",
      utbytte:
        "Du kan forklare hvorfor beskyttelse må ligge i maskinvaren, og hva som skjer når et program prøver seg.",
      byggerPa: ["hva-os-gjor"],
      skjermer: [
        intro("km-1-intro", "Hvorfor programvare ikke holder", {
          ingress: (
            <>
              Et operativsystem som bare var et vanlig program kunne aldri stoppet et annet vanlig
              program. De ville hatt like mye makt. Beskyttelsen må komme et sted fra der
              programmet ikke rekker.
            </>
          ),
          merk: <>Den plassen er inne i selve prosessoren.</>,
        }),
        konsept("km-2-to-modi", "To modi i prosessoren", {
          ingress: (
            <>
              Prosessoren har en bryter med to stillinger. Stillingen bestemmer hvilke
              instruksjoner som i det hele tatt er lovlige.
            </>
          ),
          punkter: [
            <>
              <Term>Brukermodus</Term> — vanlige programmer. Regne, lese eget minne, hoppe i egen
              kode. Ikke røre maskinvare.
            </>,
            <>
              <Term>Kjernemodus</Term> — operativsystemets kjerne. Alt er lov: sette opp
              minnekartet, snakke med disken, skru av avbrudd.
            </>,
            "Bryteren kan ikke settes av et program i brukermodus. Det er hele poenget.",
          ],
        }),
        konsept("km-3-kjernen", "Hva kjernen er", {
          ingress: (
            <>
              <Term>Kjernen</Term> (engelsk: <em>kernel</em>) er den delen av operativsystemet som
              kjører i kjernemodus. Den er alltid i minnet, og den er den eneste koden som får
              røre maskinvaren direkte.
            </>
          ),
          punkter: [
            "Alt annet — skallet, nettleseren, tekstbehandleren — kjører i brukermodus.",
            "I Linux er kjernen én fil som lastes ved oppstart. Du kan se versjonen med uname -r.",
            "Krasjer et brukerprogram, dør bare det. Krasjer kjernen, dør maskinen.",
          ],
          bihjelp: (
            <>
              Derfor heter det blåskjerm i Windows og <Kodelinje>kernel panic</Kodelinje> i Linux
              og macOS: kjernen har mistet grepet, og det finnes ingen over den til å rydde opp.
            </>
          ),
        }),
        anslag("km-4-anslag", "Hva skjer hvis et program prøver?", {
          sporsmal: (
            <>
              Du skriver et lite program som prøver å skrive direkte til diskkontrolleren, uten å
              spørre operativsystemet. Hva skjer?
            </>
          ),
          valg: [
            { tekst: "Det virker — men er dårlig stil." },
            { tekst: "Det virker bare hvis du er root." },
            { tekst: "Prosessoren nekter, og programmet drepes." },
            { tekst: "Ingenting skjer, instruksjonen hoppes over." },
          ],
          fasit: (
            <>
              Prosessoren nekter. Den ulovlige instruksjonen utløser et <Term>trap</Term> — en
              tvungen overgang til kjernemodus — og kjernen svarer typisk med å drepe prosessen.
              I Linux ser du det som «Segmentation fault». Å være root hjelper ikke: root er
              fortsatt brukermodus.
            </>
          ),
        }),
        konsept("km-5-trap", "Trap: den eneste veien opp", {
          ingress: (
            <>
              Et program kan ikke bare hoppe inn i kjernen. Det finnes nøyaktig tre måter
              prosessoren bytter til kjernemodus på, og alle tre er utenfor programmets kontroll.
            </>
          ),
          punkter: [
            <>
              <Term>Systemkall</Term> — programmet ber pent om en tjeneste. Frivillig.
            </>,
            <>
              <Term>Avbrudd</Term> (engelsk: <em>interrupt</em>) — maskinvaren ber om
              oppmerksomhet. Tastetrykk, nettverkspakke, timer.
            </>,
            <>
              <Term>Unntak</Term> (engelsk: <em>exception</em>) — programmet gjorde noe ulovlig.
              Deling på null, ugyldig adresse.
            </>,
          ],
          merk: (
            <>
              I alle tre tilfellene hopper prosessoren til en adresse kjernen har bestemt på
              forhånd. Programmet velger aldri hvor det havner.
            </>
          ),
        }),
        visual("km-6-flyt", "Følg overgangen", {
          ledetekst: <>Her er turen fra brukermodus, inn i kjernen, og ut igjen. Steg for steg.</>,
          Viz: SyscallFlowDiagram,
          hint: "Merk deg hvem som bestemmer adressen det hoppes til. Det er ikke programmet.",
        }),
        sjekk("km-7-sjekk", "Hvilken type overgang?", {
          sporsmal: <>Du trykker en tast mens et regnetungt program kjører. Hva er dette?</>,
          valg: [
            { tekst: "Systemkall", hvorfor: "Systemkall kommer fra programmet, ikke fra maskinvaren." },
            { tekst: "Avbrudd", riktig: true, hvorfor: "Tastaturet er maskinvare som ber om oppmerksomhet." },
            { tekst: "Unntak", hvorfor: "Unntak er programmets egen feil, ikke en ytre hendelse." },
          ],
          fasit: (
            <>
              Avbrudd. Tastaturet signaliserer prosessoren, som avbryter det den holdt på med,
              går i kjernemodus, kjører kjernens avbruddshåndterer, og fortsetter så programmet
              der det slapp. Programmet merker ingenting — bortsett fra at litt tid gikk.
            </>
          ),
        }),
        recall("km-8-recall", [
          {
            forside: "Hvorfor kan ikke beskyttelse mellom prosesser lages i ren programvare?",
            bakside: "Fordi et vanlig program ville hatt like mye makt som vokteren. Prosessoren må ha en modus programmet ikke kan slå av.",
          },
          {
            forside: "Hva er de tre måtene å komme fra brukermodus til kjernemodus på?",
            bakside: "Systemkall (frivillig), avbrudd (fra maskinvare), unntak (ulovlig operasjon).",
          },
          {
            forside: "Kjører root i kjernemodus?",
            bakside: "Nei. Root er en brukeridentitet i brukermodus, med flere rettigheter — men samme prosessormodus som alle andre.",
          },
        ]),
        oppsummering("km-9-opp", {
          punkter: [
            "Prosessoren har brukermodus og kjernemodus; bryteren styres ikke av programmet.",
            "Kjernen er koden som kjører i kjernemodus.",
            "Trap er samlebetegnelsen: systemkall, avbrudd og unntak.",
          ],
          videre: "Neste: systemkallet i detalj — den eneste døra programmet ditt selv kan banke på.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "syscall-broen",
      tittel: "Systemkallet — den eneste døra",
      utbytte:
        "Du kan forklare hva som skjer i et systemkall, og gjenkjenne hvilke systemkall en vanlig kommando bruker.",
      byggerPa: ["kjerne-og-brukermodus"],
      skjermer: [
        intro("sc-1-intro", "Én dør, mange rom", {
          ingress: (
            <>
              Alt et program vil ha fra omverdenen går gjennom systemkall: lese en fil, sende en
              nettverkspakke, lage en prosess, be om mer minne. Det finnes noen hundre av dem i
              Linux, og du trenger å kjenne omtrent tolv.
            </>
          ),
        }),
        konsept("sc-2-hva", "Hva et systemkall er", {
          ingress: (
            <>
              Et <Term>systemkall</Term> ser ut som et vanlig funksjonskall i koden din, men er
              det ikke. Det er en instruksjon som ber prosessoren om å bytte modus.
            </>
          ),
          punkter: [
            "Programmet legger et nummer i et register: hvilken tjeneste vil jeg ha?",
            "Argumentene legges i andre registre.",
            "Så kjøres én spesiell instruksjon som utløser trap til kjernen.",
            "Kjernen sjekker argumentene, gjør jobben, og legger svaret tilbake i et register.",
          ],
          merk: <>Kjernen stoler aldri på argumentene. Alt sjekkes — det er en sikkerhetsgrense.</>,
        }),
        kode("sc-3-lag", "Tre lag over samme kall", {
          ingress: (
            <>
              Du skriver sjelden systemkall for hånd. Standardbiblioteket pakker dem inn. Her er
              samme handling i tre høyder.
            </>
          ),
          kode: `printf("hei\\n");        // C-bibliotek: formaterer, buffrer
fputs("hei\\n", stdout);   // C-bibliotek: skriver til en strøm
write(1, "hei\\n", 4);     // systemkall: 4 byte til filbeskriver 1`,
          punkter: [
            "Bare den siste linjen krysser grensen til kjernen.",
            "De to øverste ender opp i den nederste, før eller siden.",
            <>
              Tallet <Kodelinje>1</Kodelinje> er standard ut. Vi tar filbeskrivere i emnet om
              prosesser.
            </>,
          ],
        }),
        tallanslag("sc-4-anslag", "Hvor mange systemkall?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>ls</Kodelinje> i en tom katalog. Hvor mange systemkall tror du
              hele kommandoen bruker, fra oppstart til den er ferdig?
            </>
          ),
          enhet: "systemkall",
          fasitTall: 120,
          fasit: (
            <>
              Rundt 120 på et vanlig Linux-system. Mesteparten er oppstart: laste inn delte
              biblioteker, sette opp minne, finne ut hvilken terminal du sitter i. Selve
              kataloglesingen er en håndfull kall. Du kan telle dem selv med{" "}
              <Kodelinje>strace -c ls</Kodelinje>.
            </>
          ),
        }),
        konsept("sc-5-kostnad", "Hvorfor systemkall koster", {
          ingress: (
            <>
              Et systemkall er ikke gratis. Prosessoren må bytte modus, kjernen må lagre unna
              tilstanden din, og hurtigbufferne blir delvis kalde.
            </>
          ),
          punkter: [
            "Et vanlig funksjonskall: noen få nanosekunder.",
            "Et systemkall: typisk noen hundre nanosekunder til et par mikrosekunder.",
            "Derfor buffrer printf: den samler opp tekst og gjør ett write i stedet for hundre.",
          ],
          bihjelp: (
            <>
              Dette forklarer et klassisk symptom: et program som skriver én byte om gangen til en
              fil kan være hundre ganger tregere enn ett som skriver 64 KiB om gangen.
            </>
          ),
        }),
        kode("sc-6-tolv", "De tolv du bør kjenne", {
          ingress: <>Nesten alt du møter i dette faget er en av disse.</>,
          kode: `Filer      open  read  write  close  lseek
Prosesser  fork  execve  wait4  exit_group
Minne      mmap  brk
Annet      ioctl`,
          punkter: [
            "Fem for filer — og «fil» betyr også terminal, socket og rør i Linux.",
            "Fire for prosesser — hele emnet om prosesser handler om disse.",
            "To for minne — malloc bruker dem under panseret.",
          ],
        }),
        sjekk("sc-7-sjekk", "Hvor havner det?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>cat fil.txt {">"} kopi.txt</Kodelinje>. Hvilket systemkall gjør
              selve kopieringen av innholdet?
            </>
          ),
          valg: [
            { tekst: "open, én gang per fil", hvorfor: "open åpner, men flytter ingen data." },
            { tekst: "read og write, i en løkke", riktig: true, hvorfor: "cat leser en bit, skriver den, og gjentar til filen er tom." },
            { tekst: "mmap", hvorfor: "mmap kan brukes til filer, men cat bruker det ikke." },
            { tekst: "ioctl", hvorfor: "ioctl er sekkeposten for enhetsspesifikke kommandoer." },
          ],
          fasit: (
            <>
              read og write i løkke. <Kodelinje>cat</Kodelinje> leser typisk 128 KiB om gangen inn
              i en buffer og skriver den ut igjen, helt til read returnerer 0 — som betyr slutt
              på filen.
            </>
          ),
        }),
        recall("sc-8-recall", [
          {
            forside: "Hva ligger i registrene når et systemkall utløses?",
            bakside: "Et nummer som sier hvilken tjeneste det gjelder, pluss argumentene.",
          },
          {
            forside: "Hvorfor buffrer printf i stedet for å skrive med én gang?",
            bakside: "Fordi hvert systemkall koster modusbytte. Ett stort write er mye billigere enn hundre små.",
          },
          {
            forside: "Hva returnerer read når filen er tom?",
            bakside: "0. Det er hvordan programmer oppdager slutten på en fil.",
          },
        ]),
        oppsummering("sc-9-opp", {
          punkter: [
            "Systemkall er programmets eneste frivillige vei inn i kjernen.",
            "Standardbiblioteket pakker dem inn — printf ender i write.",
            "De koster hundrevis av nanosekunder, så de buffres.",
          ],
          videre: "Neste: hvorfor et OS til en mikrobølgeovn ser helt annerledes ut enn ett til en tjener.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "os-typer",
      tittel: "Ulike operativsystemer, ulike krav",
      utbytte:
        "Du kan begrunne hvorfor et sanntidssystem, en tjener og en telefon trenger forskjellige avveininger.",
      byggerPa: ["hva-os-gjor"],
      skjermer: [
        intro("ot-1-intro", "Samme jobb, motsatt prioritet", {
          ingress: (
            <>
              Alle operativsystemer deler ut, beskytter og forenkler. Men de er uenige om hva som
              skal ofres når det blir trangt.
            </>
          ),
          punkter: [
            "En tjener vil ha mest mulig arbeid gjort per time.",
            "En telefon vil at skjermen skal svare med én gang.",
            "En kollisjonspute vil aldri, aldri være sen.",
          ],
        }),
        anslag("ot-2-anslag", "Hvem taper på rettferdighet?", {
          sporsmal: (
            <>
              En scheduler som deler CPU-tiden helt rettferdig mellom alle prosesser — hvilket av
              disse systemene blir dårligst av det?
            </>
          ),
          valg: [
            { tekst: "En web-tjener med mange like forespørsler" },
            { tekst: "En stasjonær maskin med nettleser og musikk" },
            { tekst: "En bilstyring der bremsekoden må kjøre innen 5 ms" },
          ],
          fasit: (
            <>
              Bilstyringen. Et <Term>sanntidssystem</Term> måles ikke på gjennomsnitt, men på det
              verste tilfellet. Rettferdighet betyr at bremsekoden må vente på tur — og en frist
              som brytes én gang av tusen er fortsatt brutt.
            </>
          ),
        }),
        visual("ot-3-typologi", "Fikle med kravene", {
          ledetekst: <>Skru på kravene og se hvilken systemtype du lander på.</>,
          Viz: OsTypologiSimulator,
          hint: "Prøv å sette responstid helt i bunn og se hva som skjer med gjennomstrømningen.",
        }),
        konsept("ot-4-typer", "Fire familier", {
          ingress: <>Grovinndelingen du bør kunne beskrive.</>,
          punkter: [
            <>
              <Term>Flerbrukssystem</Term> — tjenere og stasjonære maskiner. Mange programmer,
              mange brukere, ingen harde frister.
            </>,
            <>
              <Term>Sanntidssystem</Term> — garanterte frister. Deles i hardt (frist brutt =
              feil) og mykt (frist brutt = irriterende).
            </>,
            <>
              <Term>Innebygd system</Term> — lite minne, én oppgave, ofte ingen disk. Ruteren
              din.
            </>,
            <>
              <Term>Distribuert system</Term> — mange maskiner som utad ser ut som én.
            </>,
          ],
        }),
        visual("ot-5-compare", "Side ved side", {
          Viz: OsCompare,
          hint: "Se hva de er enige om, ikke bare hva de er uenige om. Kjernemodus har de alle.",
        }),
        visual("ot-6-match", "Plasser systemet", {
          ledetekst: <>Nå din tur: koble bruksområde til systemtype.</>,
          Viz: UseCaseMatch,
          hint: "Spør deg: hva er verst her — å være treg i snitt, eller å være sen én gang?",
        }),
        sjekk("ot-7-sjekk", "Hardt eller mykt?", {
          sporsmal: (
            <>
              En videospiller som av og til hopper over en bildeframe når maskinen er travel. Hva
              slags sanntidskrav er dette?
            </>
          ),
          valg: [
            { tekst: "Hardt sanntid", hvorfor: "Da ville et tapt bilde vært en systemfeil, ikke et lite hakk." },
            { tekst: "Mykt sanntid", riktig: true, hvorfor: "Fristen bør holdes, men et brudd gir redusert kvalitet — ikke katastrofe." },
            { tekst: "Ikke sanntid i det hele tatt", hvorfor: "Det finnes en frist: bildet er verdiløst hvis det kommer for sent." },
          ],
          fasit: (
            <>
              Mykt. Nytten av å levere bildet faller mot null etter fristen, men ingenting går i
              stykker. I hardt sanntid er en brutt frist per definisjon en systemfeil.
            </>
          ),
        }),
        recall("ot-8-recall", [
          {
            forside: "Hva er forskjellen på hardt og mykt sanntid?",
            bakside: "Hardt: brutt frist er en systemfeil. Mykt: brutt frist gir redusert kvalitet, men systemet fungerer.",
          },
          {
            forside: "Hvorfor er full rettferdighet feil mål i et sanntidssystem?",
            bakside: "Fordi sanntidssystemer måles på verste tilfelle, ikke på gjennomsnitt. Kritiske oppgaver må få gå foran.",
          },
          {
            forside: "Hva kjennetegner et innebygd system?",
            bakside: "Lite minne, ofte én dedikert oppgave, ofte ingen disk eller brukergrensesnitt.",
          },
        ]),
        oppsummering("ot-9-opp", {
          punkter: [
            "Alle OS gjør de samme tre jobbene, men vekter dem ulikt.",
            "Sanntid handler om verste tilfelle, ikke gjennomsnitt.",
            "Valget mellom responstid og gjennomstrømning går igjen i hele faget.",
          ],
          videre: "Neste emne: å faktisk få en Linux-maskin i hendene.",
        }),
      ],
    },
  ],
};
