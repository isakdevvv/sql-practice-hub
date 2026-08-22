// Emne 7 — Kommunikasjon mellom prosesser (IPC).
// Dette var et av de tre kjente hullene i fagdekningen. Bygger på
// filbeskrivere (emne 3), adresserom (emne 5) og synkronisering (emne 6).

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
import { PipesSimulator } from "@/components/stack/dte2505-ipc/PipesSimulator";
import { SharedMemorySim } from "@/components/stack/dte2505-ipc/SharedMemorySim";
import { MessageQueueDemo } from "@/components/stack/dte2505-ipc/MessageQueueDemo";
import { IpcMatchQuiz } from "@/components/stack/dte2505-ipc/IpcMatchQuiz";

export const emneIpc: Emne = {
  slug: "ipc",
  tittel: "Kommunikasjon mellom prosesser",
  sporsmal:
    "Prosesser har hvert sitt private minne. Hvordan får du dem likevel til å snakke sammen?",
  pensum: "Utdyper modul 3 og 4; forutsetning for rør i skallet",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "filbeskrivere-og-ror",
      tittel: "Filbeskrivere og rør",
      utbytte:
        "Du kan forklare hva et filbeskrivernummer peker på, og hvordan skallet kobler to prosesser sammen med et rør.",
      byggerPa: ["fork-exec-wait"],
      skjermer: [
        intro("fr-1-intro", "Problemet", {
          ingress: (
            <>
              Emnet om minne slo fast at prosesser ikke kan se hverandres adresserom. Det er hele
              poenget. Men da må all kommunikasjon gå gjennom kjernen — og kjernen tilbyr flere
              måter, med ulike egenskaper.
            </>
          ),
        }),
        konsept("fr-2-fd", "Filbeskriveren er en indeks", {
          ingress: (
            <>
              En <Term>filbeskriver</Term> (file descriptor) er bare et lite heltall. Det peker inn
              i en tabell kjernen holder for prosessen din.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>0</Kodelinje> er standard inn, <Kodelinje>1</Kodelinje> standard ut,{" "}
              <Kodelinje>2</Kodelinje> standard feil.
            </>,
            <>
              <Kodelinje>open</Kodelinje> returnerer alltid det laveste ledige nummeret.
            </>,
            "Nummeret betyr noe helt annet i en annen prosess — tabellen er privat.",
            "Bak nummeret ligger et kjerneobjekt: en fil, et rør, en nettverksforbindelse eller en terminal.",
          ],
          merk: (
            <>
              Programmet ditt skriver til nummer 1 uten å ane hva det er. Skallet bestemmer hva
              nummer 1 peker på — og det er derfor omdirigering fungerer på alle programmer.
            </>
          ),
        }),
        kode("fr-3-proc", "Se tabellen din", {
          kode: `ls -l /proc/$$/fd

# lrwx------ 0 -> /dev/pts/3
# lrwx------ 1 -> /dev/pts/3
# lrwx------ 2 -> /dev/pts/3`,
          punkter: [
            <>
              <Kodelinje>$$</Kodelinje> er skallets egen PID.
            </>,
            "Alle tre peker på terminalen — derfor havner både utdata og feilmeldinger på skjermen.",
          ],
        }),
        konsept("fr-4-ror", "Røret", {
          ingress: (
            <>
              Et <Term>rør</Term> (pipe) er en buffer inne i kjernen med to ender: en du skriver
              til og en du leser fra.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>pipe()</Kodelinje> returnerer to filbeskrivere på én gang: lesende og
              skrivende.
            </>,
            "Data flyter én vei, og kommer ut i samme rekkefølge som de gikk inn.",
            "Bufferen er typisk 64 KiB. Full buffer blokkerer skriveren; tom buffer blokkerer leseren.",
            "Det er nøyaktig produsent-konsument-problemet, løst av kjernen.",
          ],
        }),
        anslag("fr-5-anslag", "Hvorfor overlever røret exec?", {
          sporsmal: (
            <>
              Skallet lager et rør, forker, og barnet kaller exec. Hvorfor har det nye programmet
              fortsatt røret?
            </>
          ),
          valg: [
            { tekst: "Skallet sender filbeskriveren som argument" },
            { tekst: "Filbeskrivertabellen overlever exec som standard" },
            { tekst: "Programmet åpner røret selv ved oppstart" },
          ],
          fasit: (
            <>
              Tabellen overlever. exec bytter ut kode, data og stack — men filbeskriverne blir
              stående. Det er nettopp dette vinduet mellom fork og exec skallet utnytter: det
              flytter rørets ende til nummer 1 i barnet, og deretter kan det nye programmet skrive
              til «standard ut» uten å vite noe som helst.
            </>
          ),
        }),
        kode("fr-6-dup", "Slik kobler skallet det sammen", {
          ingress: (
            <>
              Hele <Kodelinje>ls | wc -l</Kodelinje> i seks linjer, forenklet.
            </>
          ),
          kode: `int fd[2]; pipe(fd);          // fd[0] = les, fd[1] = skriv

if (fork() == 0) {            // barn 1: ls
    dup2(fd[1], 1);           // standard ut peker nå til røret
    close(fd[0]); close(fd[1]);
    execlp("ls", "ls", NULL);
}
if (fork() == 0) {            // barn 2: wc
    dup2(fd[0], 0);           // standard inn peker nå til røret
    close(fd[0]); close(fd[1]);
    execlp("wc", "wc", "-l", NULL);
}`,
          punkter: [
            <>
              <Kodelinje>dup2</Kodelinje> kopierer en filbeskriver til et bestemt nummer.
            </>,
            "Alle ubrukte ender må lukkes — ellers ser leseren aldri slutten på strømmen.",
          ],
          merk: <>Verken ls eller wc vet at det finnes et rør. De ser bare nummer 1 og nummer 0.</>,
        }),
        visual("fr-7-sim", "Bygg røret selv", {
          ledetekst: <>Koble prosesser sammen og se data flyte gjennom bufferen.</>,
          Viz: PipesSimulator,
          hint: "Prøv å la være å lukke skriveenden i leseprosessen. Se hva som skjer med den som venter på slutten.",
        }),
        konsept("fr-8-navngitt", "Navngitte rør", {
          ingress: (
            <>
              Et vanlig rør må arves gjennom fork, så bare i slekt kan bruke det. Et{" "}
              <Term>navngitt rør</Term> (FIFO) løser det ved å ligge i filsystemet.
            </>
          ),
          punkter: [
            <>
              Lages med <Kodelinje>mkfifo /tmp/minfifo</Kodelinje>.
            </>,
            "Åpnes med vanlig open av hvilken som helst prosess med lesetilgang.",
            "Selve dataene går aldri på disk — filen er bare et navn å møtes på.",
          ],
        }),
        sjekk("fr-9-sjekk", "Hvem blokkerer?", {
          sporsmal: (
            <>
              <Kodelinje>yes | head -5</Kodelinje>. <Kodelinje>yes</Kodelinje> skriver uendelig,{" "}
              <Kodelinje>head</Kodelinje> leser fem linjer og avslutter. Hva skjer med yes?
            </>
          ),
          valg: [
            { tekst: "Den fortsetter for alltid og spiser CPU", hvorfor: "Den stoppes så snart leseren er borte." },
            { tekst: "Den får SIGPIPE og avsluttes", riktig: true, hvorfor: "Å skrive til et rør uten lesere gir SIGPIPE." },
            { tekst: "Den blokkerer for alltid på en full buffer", hvorfor: "Kjernen sender signal i stedet for å la den henge." },
          ],
          fasit: (
            <>
              SIGPIPE. Når siste leser lukker, er det ingen vits i å skrive mer, og kjernen sier fra
              med et signal — som dreper prosessen med mindre den fanger det. Det er derfor{" "}
              <Kodelinje>| head</Kodelinje> stopper en uendelig strøm i stedet for å fylle disken.
            </>
          ),
        }),
        recall("fr-10-recall", [
          {
            forside: "Hva er en filbeskriver?",
            bakside: "Et lite heltall som indekserer prosessens private tabell over åpne kjerneobjekter: filer, rør, sockets, terminaler.",
          },
          {
            forside: "Hvorfor overlever et rør et exec-kall?",
            bakside: "Fordi filbeskrivertabellen ikke byttes ut av exec — bare kode, data og stack gjør det.",
          },
          {
            forside: "Hva skjer når du skriver til et rør uten lesere?",
            bakside: "Du får SIGPIPE, som dreper prosessen med mindre den fanger signalet.",
          },
        ]),
        oppsummering("fr-11-opp", {
          punkter: [
            "Filbeskriveren er en indeks i en privat tabell.",
            "Røret er en kjernebuffer med mottrykk innebygd.",
            "dup2 mellom fork og exec er hele mekanikken bak rør og omdirigering.",
          ],
          videre: "Neste: den raskeste formen for kommunikasjon som finnes.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "delt-minne",
      tittel: "Delt minne",
      utbytte:
        "Du kan forklare hvorfor delt minne er raskest, og hvorfor det alltid må kombineres med synkronisering.",
      byggerPa: ["filbeskrivere-og-ror", "laser-og-semaforer"],
      skjermer: [
        intro("dm-1-intro", "Kutt ut mellommannen", {
          ingress: (
            <>
              Et rør kopierer alt to ganger: fra din buffer inn i kjernen, og fra kjernen ut i
              mottakerens buffer. Delt minne kutter begge kopiene.
            </>
          ),
        }),
        konsept("dm-2-hvordan", "Slik virker det", {
          ingress: (
            <>
              Kjernen lar to prosessers sidetabeller peke på de <em>samme</em> fysiske rammene.
            </>
          ),
          punkter: [
            "Hver prosess ser området på sin egen virtuelle adresse — de kan være ulike.",
            "Skriver den ene, ser den andre det umiddelbart. Ingen systemkall involvert.",
            <>
              Settes opp med <Kodelinje>shm_open</Kodelinje> pluss <Kodelinje>mmap</Kodelinje>, eller
              med et anonymt delt <Kodelinje>mmap</Kodelinje> før fork.
            </>,
          ],
          merk: (
            <>
              Etter oppsettet er kjernen helt ute av bildet. Det er både grunnen til farten og
              grunnen til problemene.
            </>
          ),
        }),
        anslag("dm-3-anslag", "Hvor mye raskere?", {
          sporsmal: (
            <>
              Å sende 1 MiB mellom to prosesser: omtrent hvor mange ganger raskere er delt minne
              enn et rør?
            </>
          ),
          valg: [
            { tekst: "Omtrent likt" },
            { tekst: "2–5 ganger" },
            { tekst: "50 ganger" },
          ],
          fasit: (
            <>
              Typisk 2–5 ganger for store blokker. Rør er ikke trege — de gjør to kopier gjennom
              minnet, som går fort. Gevinsten ved delt minne blir størst når meldingene er mange og
              små, fordi du da sparer et systemkall per melding, ikke bare en kopi.
            </>
          ),
        }),
        visual("dm-4-sim", "To prosesser, ett minne", {
          ledetekst: <>Skriv fra den ene prosessen og se den andre lese.</>,
          Viz: SharedMemorySim,
          hint: "Skriv fra begge samtidig uten synkronisering. Legg merke til at ingenting stopper deg.",
        }),
        konsept("dm-5-farene", "Prisen", {
          ingress: (
            <>
              Kjernen har ingen anelse om når du skriver. Alt kappløpsstoffet fra forrige emne
              gjelder — men nå mellom prosesser.
            </>
          ),
          punkter: [
            "Du må selv legge på lås eller semafor.",
            "Låsen må ligge i det delte området, eller være en navngitt semafor.",
            "Dør en prosess mens den holder låsen, henger de andre for alltid.",
            "Delt minne overlever prosessen som lagde det — du må rydde eksplisitt.",
          ],
        }),
        kode("dm-6-praksis", "Se det på maskinen", {
          kode: `ipcs -m            # eldre System V-delt minne
ls /dev/shm        # POSIX-delt minne ligger her som filer
ipcrm -m <id>      # rydd opp et etterlatt segment`,
          punkter: [
            <>
              <Kodelinje>/dev/shm</Kodelinje> er et minnebasert filsystem — «filene» der ligger i
              RAM.
            </>,
            "Etterlatte segmenter er en klassisk kilde til at maskinen går tom for minne over tid.",
          ],
        }),
        sjekk("dm-7-sjekk", "Hva mangler?", {
          sporsmal: (
            <>
              To prosesser deler en teller i delt minne og øker den. Resultatet er for lavt. Hva
              mangler?
            </>
          ),
          valg: [
            { tekst: "Mer delt minne", hvorfor: "Størrelsen er ikke problemet." },
            { tekst: "Synkronisering rundt økningen", riktig: true, hvorfor: "Det er nøyaktig samme kappløp som mellom tråder." },
            { tekst: "En kopi til av dataene", hvorfor: "Flere kopier gjør problemet verre, ikke bedre." },
          ],
          fasit: (
            <>
              Synkronisering. Delt minne gir deg akkurat den samme situasjonen som to tråder som
              deler heap — bare uten det trygge inntrykket av å være i samme program. Løsningen er
              den samme: en lås eller semafor som begge prosessene når.
            </>
          ),
        }),
        recall("dm-8-recall", [
          {
            forside: "Hvordan virker delt minne teknisk?",
            bakside: "Kjernen lar begge prosessenes sidetabeller peke på de samme fysiske rammene.",
          },
          {
            forside: "Hvorfor er delt minne raskest?",
            bakside: "Fordi ingen data kopieres og ingen systemkall gjøres etter at området er satt opp.",
          },
          {
            forside: "Hva er den store ulempen?",
            bakside: "Du må selv synkronisere, og etterlatte segmenter må ryddes manuelt.",
          },
        ]),
        oppsummering("dm-9-opp", {
          punkter: [
            "Delt minne er samme fysiske rammer i to sidetabeller.",
            "Ingen kopier og ingen systemkall etter oppsett.",
            "Ingen beskyttelse heller — du legger på låsen selv.",
          ],
          videre: "Neste: kommunikasjon der meldingene har grenser.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "meldinger-og-sockets",
      tittel: "Meldingskøer, signaler og sockets",
      utbytte:
        "Du kan skille en strøm fra en meldingsgrense, og forklare når en socket er riktig valg.",
      byggerPa: ["filbeskrivere-og-ror"],
      skjermer: [
        intro("ms-1-intro", "Hvor slutter en melding?", {
          ingress: (
            <>
              Et rør er en strøm av byte. Skriver du to meldinger på 10 byte, kan leseren få 20
              byte i én lesing. Røret vet ikke hvor den ene slutter og den andre begynner.
            </>
          ),
        }),
        anslag("ms-2-anslag", "Hva gjør du med det?", {
          sporsmal: (
            <>
              Du sender strukturerte meldinger over et rør. Hvordan vet mottakeren hvor hver melding
              slutter?
            </>
          ),
          valg: [
            { tekst: "Kjernen holder styr på det" },
            { tekst: "Du må selv legge inn lengde eller skilletegn" },
            { tekst: "Hver write blir automatisk én read" },
          ],
          fasit: (
            <>
              Du må selv legge inn strukturen — typisk en lengde først, eller et skilletegn som
              linjeskift. Dette er den samme jobben du gjør i alle nettverksprotokoller. En
              meldingskø gjør den for deg.
            </>
          ),
        }),
        konsept("ms-3-koer", "Meldingskøer", {
          ingress: (
            <>
              En <Term>meldingskø</Term> bevarer grensene: én sending gir nøyaktig én mottaking.
            </>
          ),
          punkter: [
            "Meldinger kan ha prioritet — viktige leveres først.",
            "Køen lever i kjernen og kan overleve at avsenderen avslutter.",
            "Passer når meldingene er små og diskrete: kommandoer, hendelser, statusrapporter.",
          ],
        }),
        visual("ms-4-demo", "Send meldinger", {
          ledetekst: <>Legg meldinger i køen og hent dem ut, med og uten prioritet.</>,
          Viz: MessageQueueDemo,
          hint: "Send tre meldinger med ulik prioritet og se rekkefølgen de kommer ut i.",
        }),
        konsept("ms-5-signaler", "Signaler som IPC", {
          ingress: (
            <>
              Signalene fra emnet om prosesser er også kommunikasjon — den absolutt enkleste
              formen.
            </>
          ),
          punkter: [
            "Bæreevne: ett tall. Ingen data følger med.",
            "Asynkron: mottakeren avbrytes der den er.",
            "Passer til «gjør noe nå»: avslutt, last konfigurasjon på nytt, fortsett.",
            "Passer ikke til dataoverføring i det hele tatt.",
          ],
        }),
        konsept("ms-6-sockets", "Sockets", {
          ingress: (
            <>
              En <Term>socket</Term> er den eneste mekanismen på lista som også fungerer mellom
              maskiner.
            </>
          ),
          punkter: [
            <>
              <Term>Unix-socket</Term> — mellom prosesser på samme maskin, adressert med en sti i
              filsystemet. Raskere enn nettverk.
            </>,
            <>
              <Term>Nettverkssocket</Term> — over TCP eller UDP, mellom maskiner.
            </>,
            "Toveis, i motsetning til røret.",
            "Ser ut som en filbeskriver, så read og write fungerer som vanlig.",
          ],
          bihjelp: (
            <>
              Docker, systemd og databaser bruker Unix-sockets internt. Ser du en{" "}
              <Kodelinje>.sock</Kodelinje>-fil i <Kodelinje>/run</Kodelinje>, er det en slik.
            </>
          ),
        }),
        tallanslag("ms-7-tall", "Hvor mye koster nettverket?", {
          sporsmal: (
            <>
              En Unix-socket mot en TCP-forbindelse til <Kodelinje>localhost</Kodelinje>: omtrent
              hvor mange ganger raskere er Unix-socketen?
            </>
          ),
          enhet: "ganger",
          fasitTall: 2,
          fasit: (
            <>
              Rundt to ganger, noen ganger mer. Selv mot localhost må TCP gjennom hele
              nettverksstakken med sjekksummer, sekvensnumre og bekreftelser. Unix-socketen hopper
              over alt det. Det er derfor databaser foretrekker socket-fil framfor{" "}
              <Kodelinje>127.0.0.1</Kodelinje> når klienten er lokal.
            </>
          ),
        }),
        sjekk("ms-8-sjekk", "Strøm eller melding?", {
          sporsmal: (
            <>
              Du leser fra en TCP-forbindelse og får halve meldingen din i første{" "}
              <Kodelinje>read</Kodelinje>. Er dette en feil?
            </>
          ),
          valg: [
            { tekst: "Ja, TCP skal levere hele meldinger", hvorfor: "TCP garanterer rekkefølge, ikke meldingsgrenser." },
            { tekst: "Nei — TCP er en strøm, akkurat som et rør", riktig: true, hvorfor: "Du må selv sette sammen meldingene." },
            { tekst: "Nei, men det betyr at nettverket er dårlig", hvorfor: "Det skjer også på et perfekt nettverk." },
          ],
          fasit: (
            <>
              Helt normalt. TCP er en bytestrøm. Vil du ha meldingsgrenser, må du legge dem inn
              selv — eller bruke UDP, der hver pakke er en enhet, men til gjengjeld kan forsvinne.
            </>
          ),
        }),
        recall("ms-9-recall", [
          {
            forside: "Hva er forskjellen på et rør og en meldingskø?",
            bakside: "Røret er en bytestrøm uten grenser. Meldingskøen bevarer grensene: én sending gir én mottaking.",
          },
          {
            forside: "Hva kan en socket som ingen av de andre IPC-formene kan?",
            bakside: "Fungere mellom ulike maskiner, og være toveis.",
          },
          {
            forside: "Hvor mye data kan et signal bære?",
            bakside: "Ingen. Bare signalnummeret selv.",
          },
        ]),
        oppsummering("ms-10-opp", {
          punkter: [
            "Strøm mot melding er det viktigste skillet.",
            "Signaler varsler, de overfører ikke.",
            "Sockets er de eneste som krysser maskingrensen.",
          ],
          videre: "Neste: velge riktig mekanisme for et konkret problem.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "velg-riktig-ipc",
      tittel: "Å velge riktig mekanisme",
      utbytte:
        "Du kan begrunne valg av IPC-mekanisme ut fra retning, datamengde, slektskap og maskingrense.",
      byggerPa: ["delt-minne", "meldinger-og-sockets"],
      skjermer: [
        intro("vi-1-intro", "Fire spørsmål", {
          ingress: (
            <>
              Valget er nesten alltid gitt når du har svart på fire spørsmål. Ingen mekanisme er
              «best» — de løser ulike problemer.
            </>
          ),
          punkter: [
            "Må det virke mellom maskiner?",
            "Er prosessene i slekt, altså laget av samme forelder?",
            "Er det mye data, eller mange små meldinger?",
            "Trenger du toveis, eller holder én vei?",
          ],
        }),
        konsept("vi-2-tabell", "Oversikten", {
          ingress: <>Seks mekanismer, kort oppsummert.</>,
          punkter: [
            "Rør: én vei, i slekt, strøm. Enklest.",
            "Navngitt rør: én vei, ikke i slekt, strøm.",
            "Meldingskø: meldingsgrenser og prioritet, samme maskin.",
            "Delt minne: raskest, mye data, krever egen synkronisering.",
          ],
          merk: (
            <>
              Signal: varsling uten data. Socket: toveis, og den eneste som krysser maskingrensen.
            </>
          ),
        }),
        anslag("vi-3-anslag", "Videostrøm mellom to prosesser", {
          sporsmal: (
            <>
              To prosesser på samme maskin skal utveksle 4 GiB videodata per sekund. Hva velger du?
            </>
          ),
          valg: [
            { tekst: "Rør" },
            { tekst: "Meldingskø" },
            { tekst: "Delt minne" },
            { tekst: "TCP-socket" },
          ],
          fasit: (
            <>
              Delt minne. Ved 4 GiB per sekund er hver kopi dyr, og et rør gjør to av dem. Med delt
              minne skriver produsenten rett inn i bufferen konsumenten leser fra, og du bruker en
              semafor til å si «bilde klart». Dette er nøyaktig slik videoavspillere og skjermservere
              gjør det.
            </>
          ),
        }),
        visual("vi-4-quiz", "Prøv selv", {
          ledetekst: <>Koble scenario til mekanisme.</>,
          Viz: IpcMatchQuiz,
          hint: "Still de fire spørsmålene i rekkefølge på hvert scenario. Maskingrensen avgjør ofte alene.",
        }),
        kode("vi-5-praksis", "Se hva som er i bruk", {
          ingress: <>På en hvilken som helst Linux-maskin.</>,
          kode: `ss -x | head           # åpne Unix-sockets
ls -l /run/*.sock      # socket-filer fra tjenester
ipcs                   # delt minne, semaforer, meldingskøer
lsof -p <pid>          # alt denne prosessen har åpent`,
          punkter: [
            <>
              <Kodelinje>lsof</Kodelinje> er det raskeste svaret på «hvem snakker denne prosessen
              med?».
            </>,
          ],
        }),
        sjekk("vi-6-sjekk", "Ikke i slekt", {
          sporsmal: (
            <>
              To uavhengige programmer, startet av ulike brukere til ulik tid, skal sende korte
              statusmeldinger til hverandre på samme maskin. Hva passer dårligst?
            </>
          ),
          valg: [
            { tekst: "Vanlig rør", riktig: true, hvorfor: "Et vanlig rør må arves gjennom fork, og disse er ikke i slekt." },
            { tekst: "Navngitt rør", hvorfor: "Det ligger i filsystemet og kan åpnes av hvem som helst med tilgang." },
            { tekst: "Unix-socket", hvorfor: "Fungerer utmerket mellom uavhengige prosesser." },
          ],
          fasit: (
            <>
              Vanlig rør. Filbeskriverne finnes bare hos prosesser som har arvet dem. Uten
              slektskap må du møtes på et navn i filsystemet: navngitt rør, Unix-socket eller
              meldingskø.
            </>
          ),
        }),
        recall("vi-7-recall", [
          {
            forside: "Hvilke fire spørsmål avgjør valget av IPC-mekanisme?",
            bakside: "Krysser det maskingrensen? Er prosessene i slekt? Mye data eller mange små meldinger? Én vei eller toveis?",
          },
          {
            forside: "Hvilken mekanisme velger du for svært store datamengder på samme maskin?",
            bakside: "Delt minne, med egen synkronisering på toppen.",
          },
          {
            forside: "Hvorfor kan ikke to urelaterte prosesser bruke et vanlig rør?",
            bakside: "Fordi rørets filbeskrivere bare finnes hos prosesser som har arvet dem gjennom fork.",
          },
        ]),
        oppsummering("vi-8-opp", {
          punkter: [
            "Maskingrensen avgjør ofte valget alene.",
            "Slektskap avgjør mellom vanlig og navngitt rør.",
            "Delt minne er raskest, men du må selv legge på synkroniseringen.",
          ],
          videre: "Neste emne: filsystemet — der navnene og dataene faktisk ligger.",
        }),
      ],
    },
  ],
};
