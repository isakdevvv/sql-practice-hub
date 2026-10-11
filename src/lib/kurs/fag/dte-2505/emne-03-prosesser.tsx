// Emne 3 — Prosesser.
// Pensum: Canvas modul 3 «Prosesser», med OSTEP-dybde på fork/exec og
// tilstandsmaskinen.

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
import { ProcessStateMachine } from "@/components/stack/dte2505-prosesser-signaler/ProcessStateMachine";
import { ProcessVisualizer } from "@/components/stack/dte2505-prosesser-signaler/ProcessVisualizer";
import { ProsessMonitor } from "@/components/stack/dte2505-prosesser-signaler/ProsessMonitor";
import { PsTopParser } from "@/components/stack/dte2505-thread-vs-prosess/PsTopParser";

export const emneProsesser: Emne = {
  slug: "prosesser",
  tittel: "Prosesser",
  sporsmal: "Hvordan kan hundre programmer dele én maskin uten å ødelegge for hverandre?",
  pensum: "Canvas modul 3 — Prosesser",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "prosess-abstraksjonen",
      tittel: "Hva en prosess er",
      utbytte:
        "Du kan si hva som tilhører én prosess og hva som er felles, og hva kjernen må huske om hver av dem.",
      byggerPa: ["syscall-broen"],
      skjermer: [
        intro("pa-1-intro", "Program mot prosess", {
          ingress: (
            <>
              Et program er en fil på disken. Den gjør ingenting. En prosess er den filen satt i
              gang: med et sted i koden den står nå, et minne den bruker, og et navn kjernen kan
              rope på.
            </>
          ),
          merk: <>Én programfil kan gi mange prosesser samtidig. Tre terminalvinduer, tre prosesser, samme fil.</>,
        }),
        anslag("pa-2-anslag", "Samme adresse i to prosesser?", {
          sporsmal: (
            <>
              Du kjører det samme programmet to ganger samtidig. Begge skriver ut adressen til en
              global variabel. Hva ser du?
            </>
          ),
          valg: [
            { tekst: "To forskjellige adresser — de kan jo ikke dele minne" },
            { tekst: "Ofte den samme adressen, men de deler likevel ikke minne" },
            { tekst: "Programmet krasjer" },
          ],
          fasit: (
            <>
              Ofte nøyaktig samme adresse — og de deler likevel ingenting. Adressen er{" "}
              <Term>virtuell</Term>: den betyr noe forskjellig i hver prosess. Adresse 0x5000 i
              prosess A og 0x5000 i prosess B peker til to helt ulike steder i den fysiske
              RAM-brikken. Hvordan det gjøres er hele emnet om minne.
            </>
          ),
        }),
        konsept("pa-3-hva-tilhorer", "Hva som tilhører prosessen", {
          ingress: <>Alt i denne lista er privat for én prosess.</>,
          punkter: [
            <>
              <Term>PID</Term> (prosess-ID) — heltallet kjernen identifiserer den med.
            </>,
            "Adresserommet: kode, globale data, heap og stack.",
            <>
              Tabellen over åpne <Term>filbeskrivere</Term> — hvilke filer, rør og nettverkskoblinger
              den har åpne.
            </>,
            "Arbeidskatalog, miljøvariabler, hvilken bruker den kjører som.",
          ],
        }),
        konsept("pa-4-pcb", "Hva kjernen husker", {
          ingress: (
            <>
              For hver prosess holder kjernen en oppføring med alt den trenger for å kunne ta
              prosessen av og på prosessoren. Vi kaller den <Term>prosesskontrollblokken</Term>{" "}
              (engelsk: process control block, PCB).
            </>
          ),
          punkter: [
            "Registerinnholdet fra sist prosessen kjørte — inkludert hvor i koden den sto.",
            "Tilstand: kjører den, er den klar, eller venter den på noe?",
            "Pekere til minnekartet og til tabellen over åpne filer.",
            "Slektskap: hvem er forelderen, hvilke barn finnes.",
          ],
          merk: (
            <>
              Uten registerinnholdet i PCB-en kunne en prosess aldri blitt gjenopptatt. Det er
              nøyaktig disse tallene som gjør at avbrudd føles usynlige for programmet.
            </>
          ),
        }),
        visual("pa-5-viz", "En prosess innenfra", {
          ledetekst: <>Klikk deg gjennom delene av en levende prosess.</>,
          Viz: ProcessVisualizer,
          hint: "Se hvilke felter som er private og hvilke som peker ut i noe kjernen eier.",
        }),
        sjekk("pa-6-sjekk", "Privat eller felles?", {
          sporsmal: <>Hvilken av disse deles mellom alle prosesser på maskinen?</>,
          valg: [
            { tekst: "Heapen", hvorfor: "Hver prosess har sin egen heap i sitt eget adresserom." },
            { tekst: "Tabellen over åpne filbeskrivere", hvorfor: "Den er per prosess. Fd 3 betyr ulike filer i ulike prosesser." },
            { tekst: "Kjernens kode", riktig: true, hvorfor: "Det finnes én kjerne, og alle prosesser bruker den samme." },
            { tekst: "Miljøvariablene", hvorfor: "Arves fra forelder ved oppstart, men er deretter prosessens egne." },
          ],
          fasit: (
            <>
              Kjernen. Den er kartlagt inn i hver prosess sitt adresserom, men bare tilgjengelig i
              kjernemodus. Alt annet på lista er privat kopi.
            </>
          ),
        }),
        recall("pa-7-recall", [
          {
            forside: "Hva er forskjellen på et program og en prosess?",
            bakside: "Programmet er en fil på disken. Prosessen er det programmet i gang, med eget minne, egen tilstand og en PID.",
          },
          {
            forside: "Hva ligger i prosesskontrollblokken?",
            bakside: "Registerinnhold, tilstand, peker til minnekart og filtabell, og slektskap til forelder og barn.",
          },
          {
            forside: "Hvorfor kan to prosesser ha samme adresse uten å dele data?",
            bakside: "Fordi adressene er virtuelle. Samme virtuelle adresse oversettes til ulike fysiske plasser i hver prosess.",
          },
        ]),
        oppsummering("pa-8-opp", {
          punkter: [
            "Prosessen er programmet i bevegelse, med PID, adresserom og filbeskrivere.",
            "Kjernen holder en PCB per prosess for å kunne pause og gjenoppta den.",
            "Adresser er virtuelle — like tall betyr ulike steder.",
          ],
          videre: "Neste: hvilke tilstander en prosess kan være i.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "prosesstilstander",
      tittel: "Tilstandene en prosess går gjennom",
      utbytte:
        "Du kan følge en prosess gjennom klar, kjørende og ventende, og forklare hvorfor blokkerte prosesser ikke bruker CPU.",
      byggerPa: ["prosess-abstraksjonen"],
      skjermer: [
        intro("pt-1-intro", "Bare én kjører om gangen", {
          ingress: (
            <>
              En prosessorkjerne kjører nøyaktig én prosess om gangen. Med 300 prosesser betyr det
              at 299 av dem venter — men de venter på svært forskjellige ting.
            </>
          ),
        }),
        konsept("pt-2-tre", "Tre tilstander som betyr noe", {
          ingress: <>Resten er varianter av disse.</>,
          punkter: [
            <>
              <Term>Kjørende</Term> — har prosessoren akkurat nå.
            </>,
            <>
              <Term>Klar</Term> — kunne kjørt med én gang, men står i kø fordi noen andre har
              prosessoren.
            </>,
            <>
              <Term>Ventende</Term> (blokkert) — kan ikke kjøre uansett, fordi den venter på noe
              utenfra: disk, nettverk, tastetrykk.
            </>,
          ],
          merk: (
            <>
              Forskjellen mellom klar og ventende er avgjørende: en klar prosess vil ha CPU, en
              ventende ville ikke visst hva den skulle gjort med den.
            </>
          ),
        }),
        anslag("pt-3-anslag", "Hva skjer under read?", {
          sporsmal: (
            <>
              Prosessen din kaller <Kodelinje>read()</Kodelinje> på en fil som ikke ligger i
              hurtigbufferen, så dataene må hentes fra disk. Hva skjer med prosessen i mellomtiden?
            </>
          ),
          valg: [
            { tekst: "Den fortsetter å kjøre og sjekker gjentatte ganger om dataene er klare" },
            { tekst: "Den settes til ventende, og en annen prosess får prosessoren" },
            { tekst: "Hele maskinen står stille til disken svarer" },
          ],
          fasit: (
            <>
              Den settes til ventende og gir fra seg prosessoren. Disken bruker kanskje 100
              mikrosekunder på en SSD — det er tid nok til å kjøre titusenvis av instruksjoner for
              noen andre. Når dataene kommer, utløser disken et avbrudd, og kjernen flytter
              prosessen tilbake til klar.
            </>
          ),
        }),
        visual("pt-4-maskin", "Tilstandsmaskinen", {
          ledetekst: <>Klikk deg gjennom overgangene og se hva som utløser hver av dem.</>,
          Viz: ProcessStateMachine,
          hint: "Finn overgangen som IKKE finnes: fra ventende rett til kjørende. Hvorfor ikke?",
        }),
        konsept("pt-5-linux", "Slik ser det ut i Linux", {
          ingress: (
            <>
              <Kodelinje>ps</Kodelinje> viser tilstanden som én bokstav i STAT-kolonnen.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>R</Kodelinje> — kjørende eller klar. Linux skiller ikke i utskriften.
            </>,
            <>
              <Kodelinje>S</Kodelinje> — ventende, men kan vekkes av et signal. Det store
              flertallet.
            </>,
            <>
              <Kodelinje>D</Kodelinje> — ventende på disk, kan ikke avbrytes. Henger denne, hjelper
              ikke engang kill.
            </>,
            <>
              <Kodelinje>Z</Kodelinje> — ferdig, men ikke ryddet bort ennå. Vi kommer til den.
            </>,
          ],
        }),
        tallanslag("pt-6-tall", "Hvor mange er klare?", {
          sporsmal: (
            <>
              På en rolig bærbar maskin med 300 prosesser — hvor mange av dem tror du er i
              tilstanden klar eller kjørende akkurat nå?
            </>
          ),
          enhet: "prosesser",
          fasitTall: 2,
          fasit: (
            <>
              Typisk 1–3. Nesten alt venter på noe: en nettverkspakke, et tastetrykk, en timer.
              Det er derfor en maskin med hundrevis av prosesser kan ha nesten null CPU-bruk. Tallet
              «load average» du ser i <Kodelinje>top</Kodelinje> er nettopp et snitt av hvor mange
              som er klare.
            </>
          ),
        }),
        sjekk("pt-7-sjekk", "Hvilken tilstand?", {
          sporsmal: (
            <>
              En prosess venter på at brukeren skal skrive noe i terminalen. Hvilken tilstand står
              den i, og bruker den CPU?
            </>
          ),
          valg: [
            { tekst: "Kjørende, og bruker CPU til å sjekke tastaturet", hvorfor: "Det ville kastet bort hele prosessoren på venting." },
            { tekst: "Ventende, og bruker ingen CPU", riktig: true, hvorfor: "Kjernen vekker den når tastaturavbruddet kommer." },
            { tekst: "Klar, men får bare aldri tur", hvorfor: "Klar betyr at den kunne kjørt nyttig nå — det kan den ikke." },
          ],
          fasit: (
            <>
              Ventende, null CPU. Kjernen har notert at prosessen venter på akkurat denne
              terminalen. Når tastetrykket kommer inn som et avbrudd, flyttes prosessen til klar,
              og scheduleren tar den derfra.
            </>
          ),
        }),
        recall("pt-8-recall", [
          {
            forside: "Hva er forskjellen på klar og ventende?",
            bakside: "Klar kan kjøre med én gang, men mangler tur. Ventende kan ikke kjøre før noe utenfra skjer.",
          },
          {
            forside: "Hva betyr STAT-koden D i ps?",
            bakside: "Uavbrytbar venting, nesten alltid på disk. Prosessen reagerer ikke engang på signaler.",
          },
          {
            forside: "Hvorfor finnes ingen overgang fra ventende rett til kjørende?",
            bakside: "Fordi prosessen først må bli klar, og deretter velges av scheduleren. To adskilte hendelser.",
          },
        ]),
        oppsummering("pt-9-opp", {
          punkter: [
            "Klar, kjørende og ventende dekker det meste.",
            "Ventende prosesser bruker ingen CPU — de vekkes av avbrudd.",
            "ps viser tilstanden som R, S, D eller Z.",
          ],
          videre: "Neste: hvordan en prosess i det hele tatt blir til.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "fork-exec-wait",
      tittel: "fork, exec og wait",
      utbytte:
        "Du kan forutsi hva fork returnerer i hver prosess, forklare hvorfor exec ikke returnerer, og gjenkjenne en zombie.",
      byggerPa: ["prosess-abstraksjonen"],
      skjermer: [
        intro("fe-1-intro", "Alle prosesser har en forelder", {
          ingress: (
            <>
              Linux lager aldri en prosess fra ingenting. Nye prosesser lages ved at en
              eksisterende deler seg. Det gir et slektstre med én rot: prosess 1.
            </>
          ),
        }),
        konsept("fe-2-fork", "fork deler prosessen i to", {
          ingress: (
            <>
              <Kodelinje>fork()</Kodelinje> er det merkeligste systemkallet i faget: du kaller det
              én gang, og det returnerer to ganger — én gang i hver prosess.
            </>
          ),
          punkter: [
            "Barnet får en kopi av forelderens minne, filbeskrivere og register.",
            "Begge fortsetter på linjen etter fork.",
            <>
              I forelderen returnerer fork barnets PID. I barnet returnerer den{" "}
              <Kodelinje>0</Kodelinje>. Ved feil <Kodelinje>-1</Kodelinje>.
            </>,
            "Returverdien er det eneste som skiller dem. Derfor testes den alltid.",
          ],
        }),
        anslag("fe-3-anslag", "Hvor mange linjer?", {
          sporsmal: (
            <>
              Et program skriver «A», kaller <Kodelinje>fork()</Kodelinje>, og skriver så «B». Hvor
              mange ganger skrives «A» og «B» til sammen?
            </>
          ),
          valg: [
            { tekst: "A én gang, B én gang" },
            { tekst: "A én gang, B to ganger" },
            { tekst: "A to ganger, B to ganger" },
          ],
          fasit: (
            <>
              A én gang, B to ganger. Barnet starter der forelderen slapp — det spoler ikke tilbake
              til begynnelsen av programmet. Advarsel: hvis utskriften er buffret og ikke tømt før
              fork, kopieres bufferen til barnet, og da kan du faktisk se A to ganger. Det er en
              klassisk felle.
            </>
          ),
        }),
        kode("fe-4-kode", "Mønsteret du vil se om og om igjen", {
          ingress: <>Dette er skjelettet i alt som lager prosesser i Unix.</>,
          kode: `pid_t pid = fork();

if (pid < 0) {
    // fork feilet — tomt for minne eller prosesser
} else if (pid == 0) {
    // Vi er i barnet
    execlp("ls", "ls", "-l", NULL);
    // Kommer vi hit, feilet exec
} else {
    // Vi er i forelderen; pid er barnets PID
    int status;
    waitpid(pid, &status, 0);
}`,
          punkter: [
            <>
              Linjen etter <Kodelinje>execlp</Kodelinje> kjøres bare hvis exec mislyktes. Ellers
              finnes den koden ikke lenger.
            </>,
            <>
              <Kodelinje>waitpid</Kodelinje> setter forelderen i ventende til barnet er ferdig.
            </>,
          ],
        }),
        konsept("fe-5-exec", "exec bytter ut innholdet", {
          ingress: (
            <>
              <Kodelinje>execve()</Kodelinje> kaster ut all koden og alle dataene i prosessen og
              laster inn et nytt program i stedet. Skallet er bare denne bevegelsen i en løkke.
            </>
          ),
          punkter: [
            "PID-en er den samme etterpå. Det er samme prosess med nytt innhold.",
            "Åpne filbeskrivere overlever som standard — det er derfor omdirigering virker.",
            "Kode, heap og stack erstattes helt.",
            "Ved suksess returnerer exec aldri. Det finnes ingen kode igjen å returnere til.",
          ],
          merk: (
            <>
              fork lager beholderen, exec fyller den. Skillet gir skallet et vindu mellom de to der
              det kan endre filbeskrivere — og det er nøyaktig der rør og omdirigering settes opp.
            </>
          ),
        }),
        konsept("fe-6-zombie", "Zombier og foreldreløse", {
          ingress: (
            <>
              Når et barn avslutter, kan ikke kjernen glemme det helt: forelderen har krav på å få
              vite hvordan det gikk.
            </>
          ),
          punkter: [
            <>
              <Term>Zombie</Term> — barnet er ferdig, men forelderen har ikke kalt wait ennå.
              Oppføringen blir stående med bare exitkoden igjen.
            </>,
            <>
              <Term>Foreldreløs</Term> — forelderen døde først. Barnet adopteres av prosess 1
              (init/systemd), som alltid kaller wait.
            </>,
            "Én zombie er ufarlig. Tusenvis fyller opp prosesstabellen.",
          ],
          bihjelp: (
            <>
              Du kan ikke drepe en zombie — den er allerede død. Du må få forelderen til å kalle
              wait, eller avslutte forelderen slik at prosess 1 rydder.
            </>
          ),
        }),
        sjekk("fe-7-sjekk", "Hva blir PID?", {
          sporsmal: (
            <>
              En prosess med PID 4200 kaller <Kodelinje>execve("/bin/ls", ...)</Kodelinje> og det
              lykkes. Hva er PID etterpå?
            </>
          ),
          valg: [
            { tekst: "En ny PID, siden det er et nytt program", hvorfor: "exec lager ingen ny prosess — den bytter innhold i den som finnes." },
            { tekst: "4200, uendret", riktig: true, hvorfor: "Samme prosess, nytt program." },
            { tekst: "0, som i barnet etter fork", hvorfor: "0 er returverdien fra fork i barnet, ikke en PID." },
          ],
          fasit: (
            <>
              4200. Dette er nettopp derfor skallet kan holde styr på jobbene sine: det forker,
              noterer barnets PID, og barnet beholder den PID-en også etter at det har blitt til{" "}
              <Kodelinje>ls</Kodelinje>.
            </>
          ),
        }),
        sjekk("fe-8-sjekk2", "Hvem adopterer?", {
          sporsmal: <>Forelderen dør før barnet er ferdig. Hva skjer med barnet?</>,
          valg: [
            { tekst: "Det drepes sammen med forelderen", hvorfor: "Barn dør ikke automatisk når forelderen gjør det." },
            { tekst: "Det blir en zombie", hvorfor: "Zombie er motsatt tilfelle: barnet dør først." },
            { tekst: "Det adopteres av prosess 1", riktig: true, hvorfor: "init/systemd blir ny forelder og rydder når barnet er ferdig." },
          ],
          fasit: (
            <>
              Prosess 1 adopterer det. Dette er hvordan bakgrunnstjenester overlever at terminalen
              lukkes: de forker, forelderen avslutter, og barnet havner under systemd.
            </>
          ),
        }),
        recall("fe-9-recall", [
          {
            forside: "Hva returnerer fork i forelderen, i barnet, og ved feil?",
            bakside: "Barnets PID i forelderen, 0 i barnet, -1 ved feil.",
          },
          {
            forside: "Hvorfor returnerer ikke exec ved suksess?",
            bakside: "Fordi koden som skulle returnert er byttet ut med det nye programmet.",
          },
          {
            forside: "Hva er en zombie, og hvordan blir du kvitt den?",
            bakside: "Et avsluttet barn som forelderen ikke har wait-et på. Løses ved at forelderen kaller wait, eller ved at forelderen avsluttes.",
          },
        ]),
        oppsummering("fe-10-opp", {
          punkter: [
            "fork kopierer, exec erstatter, wait rydder.",
            "PID overlever exec; det er samme prosess.",
            "Vinduet mellom fork og exec er der skallet setter opp rør og omdirigering.",
          ],
          videre: "Neste: hvordan du snakker til en prosess som allerede kjører.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "signaler",
      tittel: "Signaler",
      utbytte:
        "Du kan velge riktig signal for situasjonen, og forklare hvorfor SIGKILL alltid virker og SIGTERM ikke gjør det.",
      byggerPa: ["prosesstilstander"],
      skjermer: [
        intro("si-1-intro", "En beskjed på én byte", {
          ingress: (
            <>
              Et <Term>signal</Term> er den minste beskjeden i Unix: bare et nummer. Ingen data,
              ingen svar. Likevel er det slik du stopper, pauser og vekker prosesser hver eneste
              dag.
            </>
          ),
        }),
        konsept("si-2-tre-utfall", "Tre ting som kan skje", {
          ingress: <>Når et signal ankommer, gjør prosessen én av tre ting.</>,
          punkter: [
            "Kjører standardhandlingen — for de fleste signaler betyr det: dø.",
            "Kjører en håndterer som programmet selv har registrert.",
            "Ignorerer det, hvis programmet har bedt om det.",
          ],
          merk: (
            <>
              To signaler kan hverken fanges eller ignoreres: <Kodelinje>SIGKILL</Kodelinje> (9) og{" "}
              <Kodelinje>SIGSTOP</Kodelinje> (19). De håndteres av kjernen, ikke av prosessen. Det
              er derfor de alltid virker.
            </>
          ),
        }),
        anslag("si-3-anslag", "Hvorfor virker ikke Ctrl-C?", {
          sporsmal: (
            <>
              Du trykker Ctrl-C på et program som har hengt seg. Ingenting skjer. Hva er den mest
              sannsynlige forklaringen?
            </>
          ),
          valg: [
            { tekst: "Programmet fanger SIGINT og har en håndterer som ikke avslutter" },
            { tekst: "Programmet står i uavbrytbar venting på disk" },
            { tekst: "Begge deler er mulige" },
          ],
          fasit: (
            <>
              Begge. Ctrl-C sender <Kodelinje>SIGINT</Kodelinje>, som kan fanges — mange programmer
              gjør det for å rydde opp først. Og et program i tilstand{" "}
              <Kodelinje>D</Kodelinje> (uavbrytbar venting) tar ikke imot signaler i det hele tatt
              før disken svarer. Det siste er grunnen til at ikke engang{" "}
              <Kodelinje>kill -9</Kodelinje> alltid hjelper.
            </>
          ),
        }),
        kode("si-4-tabell", "Signalene du trenger", {
          ingress: <>Sju stykker dekker nesten alt i dette faget.</>,
          kode: `SIGINT   2   Ctrl-C. Høflig avbrudd. Kan fanges.
SIGQUIT  3   Ctrl-\\. Avbrudd + kjernedump.
SIGKILL  9   Drep nå. Kan IKKE fanges.
SIGTERM 15   Standard for kill. Be pent om å avslutte.
SIGSTOP 19   Frys. Kan IKKE fanges.
SIGCONT 18   Fortsett etter SIGSTOP.
SIGHUP   1   Terminalen forsvant. Brukes ofte som «les config på nytt».`,
          punkter: [
            <>
              <Kodelinje>kill</Kodelinje> uten nummer sender SIGTERM, ikke SIGKILL. Navnet lyver
              litt.
            </>,
            <>
              Ctrl-Z sender <Kodelinje>SIGTSTP</Kodelinje> — som SIGSTOP, men kan fanges.
            </>,
          ],
        }),
        konsept("si-5-rekkefolge", "Riktig rekkefølge", {
          ingress: <>Å gå rett til kill -9 er en uvane med reelle kostnader.</>,
          punkter: [
            <>
              Først <Kodelinje>kill PID</Kodelinje> (SIGTERM): programmet får lagre og lukke filer.
            </>,
            "Vent noen sekunder. Mange programmer trenger tid på å rydde.",
            <>
              Så <Kodelinje>kill -9 PID</Kodelinje>: kjernen river ned prosessen der og da.
            </>,
            "Med -9 blir ulagrede data borte, og låsefiler kan bli liggende igjen.",
          ],
        }),
        visual("si-6-monitor", "Send signaler selv", {
          ledetekst: <>Prosessovervåkeren lar deg sende signaler og se hva som skjer.</>,
          Viz: ProsessMonitor,
          hint: "Prøv SIGSTOP og deretter SIGCONT på samme prosess. Legg merke til tilstanden mellom dem.",
        }),
        sjekk("si-7-sjekk", "Hvilket signal?", {
          sporsmal: (
            <>
              Du har endret konfigurasjonsfilen til en webtjener og vil at den skal lese den på
              nytt uten å miste åpne forbindelser. Hva sender du?
            </>
          ),
          valg: [
            { tekst: "SIGKILL", hvorfor: "Da mister du alle forbindelser og tjeneren må startes på nytt." },
            { tekst: "SIGHUP", riktig: true, hvorfor: "Konvensjonen for tjenere er at SIGHUP betyr «les konfigurasjonen på nytt»." },
            { tekst: "SIGSTOP", hvorfor: "Da fryser tjeneren i stedet for å laste inn noe." },
          ],
          fasit: (
            <>
              SIGHUP. Opprinnelig betydde det «terminalen din er borte», men siden tjenere ikke har
              terminal, ble signalet ledig — og ble konvensjonen for «last konfigurasjon på nytt».
              Et godt eksempel på at signaler bare betyr det programmet bestemmer.
            </>
          ),
        }),
        recall("si-8-recall", [
          {
            forside: "Hvilke to signaler kan verken fanges eller ignoreres?",
            bakside: "SIGKILL (9) og SIGSTOP (19). De håndteres av kjernen, ikke av prosessen.",
          },
          {
            forside: "Hvilket signal sender kill uten argumenter?",
            bakside: "SIGTERM (15) — en høflig forespørsel om å avslutte, som programmet kan fange.",
          },
          {
            forside: "Hvorfor kan ikke kill -9 stoppe en prosess i tilstand D?",
            bakside: "Fordi den står i uavbrytbar venting på maskinvare og ikke ser på signalkøen før den er ferdig.",
          },
        ]),
        oppsummering("si-9-opp", {
          punkter: [
            "Signaler er tall uten data; betydningen ligger i konvensjon.",
            "SIGTERM først, SIGKILL som siste utvei.",
            "SIGKILL og SIGSTOP kan ikke fanges — derfor virker de alltid, unntatt i tilstand D.",
          ],
          videre: "Neste: verktøyene som viser deg hva som faktisk kjører.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "prosessverktoy",
      tittel: "ps, top og jobbkontroll",
      utbytte:
        "Du kan lese utskriften fra ps og top, og styre jobber i forgrunn og bakgrunn fra skallet.",
      byggerPa: ["signaler"],
      skjermer: [
        intro("pv-1-intro", "Se hva som skjer", {
          ingress: (
            <>
              Tre verktøy dekker nesten all feilsøking av prosesser: et øyeblikksbilde, en levende
              visning, og skallets egen jobbliste.
            </>
          ),
        }),
        kode("pv-2-ps", "ps: øyeblikksbildet", {
          ingress: (
            <>
              <Kodelinje>ps</Kodelinje> har to sett med opsjoner av historiske grunner. Lær ett av
              dem og hold deg til det.
            </>
          ),
          kode: `ps aux          # alle prosesser, alle brukere, med detaljer
ps -ef          # samme, i den andre opsjonsstilen
ps aux | grep nginx
ps -o pid,ppid,stat,cmd   # velg selv kolonnene`,
          punkter: [
            <>
              <Kodelinje>a</Kodelinje> = også andres, <Kodelinje>u</Kodelinje> = detaljer,{" "}
              <Kodelinje>x</Kodelinje> = også de uten terminal.
            </>,
            <>
              <Kodelinje>PPID</Kodelinje> er forelderens PID. Den kolonnen avslører slektstreet.
            </>,
          ],
        }),
        visual("pv-3-parser", "Les utskriften", {
          ledetekst: <>Plukk fra hverandre en ekte ps- og top-utskrift, kolonne for kolonne.</>,
          Viz: PsTopParser,
          hint: "Se på STAT-kolonnen og koble den til tilstandene du lærte tidligere i emnet.",
        }),
        anslag("pv-4-anslag", "Over 100 prosent?", {
          sporsmal: (
            <>
              I <Kodelinje>top</Kodelinje> viser en prosess 340 % CPU. Er det en feil?
            </>
          ),
          valg: [
            { tekst: "Ja, mer enn 100 % er umulig" },
            { tekst: "Nei — prosessen bruker flere kjerner samtidig" },
            { tekst: "Nei, men det betyr at maskinen er overbelastet" },
          ],
          fasit: (
            <>
              Helt normalt. <Kodelinje>top</Kodelinje> regner 100 % per kjerne. 340 % betyr at
              prosessen holder omtrent 3,4 kjerner opptatt — altså at den bruker tråder. Tråder er
              neste emne.
            </>
          ),
        }),
        konsept("pv-5-jobber", "Jobbkontroll i skallet", {
          ingress: (
            <>
              Skallet holder sin egen liste over jobber det har startet, nummerert fra 1. Det er en
              annen nummerering enn PID.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>&</Kodelinje> på slutten starter jobben i bakgrunnen.
            </>,
            <>
              <Kodelinje>Ctrl-Z</Kodelinje> pauser jobben i forgrunnen.
            </>,
            <>
              <Kodelinje>bg</Kodelinje> lar den pausede jobben fortsette i bakgrunnen;{" "}
              <Kodelinje>fg</Kodelinje> henter den tilbake.
            </>,
            <>
              <Kodelinje>jobs</Kodelinje> lister dem; <Kodelinje>kill %1</Kodelinje> bruker
              jobbnummer i stedet for PID.
            </>,
          ],
        }),
        kode("pv-6-nohup", "Jobber som overlever terminalen", {
          ingress: (
            <>
              Lukker du terminalen, får jobbene dine <Kodelinje>SIGHUP</Kodelinje>. To måter å
              unngå det.
            </>
          ),
          kode: `nohup ./lang-jobb.sh &      # ignorer SIGHUP, logg til nohup.out
disown %1                   # fjern jobben fra skallets liste`,
          punkter: [
            "nohup må settes før du starter; disown kan brukes etterpå.",
            "Prosessen adopteres av prosess 1 når skallet dør.",
          ],
        }),
        sjekk("pv-7-sjekk", "Hvilken kolonne?", {
          sporsmal: (
            <>
              Du vil finne ut hvilken prosess som startet en mistenkelig prosess. Hvilken kolonne i{" "}
              <Kodelinje>ps</Kodelinje> ser du på?
            </>
          ),
          valg: [
            { tekst: "PID", hvorfor: "Det er prosessens eget nummer." },
            { tekst: "PPID", riktig: true, hvorfor: "PPID peker på forelderen, altså den som forket." },
            { tekst: "STAT", hvorfor: "STAT viser tilstand, ikke slektskap." },
          ],
          fasit: (
            <>
              PPID. Følg den oppover, og du får hele kjeden til prosess 1. Kommandoen{" "}
              <Kodelinje>pstree -p</Kodelinje> tegner det samme treet for deg.
            </>
          ),
        }),
        recall("pv-8-recall", [
          {
            forside: "Hva betyr 250 % CPU i top?",
            bakside: "Prosessen bruker 2,5 kjerner samtidig. top regner 100 % per kjerne.",
          },
          {
            forside: "Hva gjør Ctrl-Z, og hvordan får du jobben i gang igjen?",
            bakside: "Pauser jobben i forgrunnen (SIGTSTP). fg henter den tilbake, bg lar den fortsette i bakgrunnen.",
          },
          {
            forside: "Hvordan finner du hvem som startet en prosess?",
            bakside: "PPID-kolonnen i ps, eller pstree -p som tegner hele treet.",
          },
        ]),
        oppsummering("pv-9-opp", {
          punkter: [
            "ps gir øyeblikksbilde, top gir levende visning, jobs gir skallets egen liste.",
            "PPID avslører slektstreet.",
            "nohup og disown lar jobber overleve at terminalen lukkes.",
          ],
          videre: "Neste emne: tråder — flere utførelser inne i samme prosess.",
        }),
      ],
    },
  ],
};
