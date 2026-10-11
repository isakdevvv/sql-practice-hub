// Emne 1 — Introduksjon.
// Pensum: Canvas modul 1 «Introduksjon», Kurose & Ross kap. 1.
// Ingen forkunnskaper. Rekkefølgen er en avhengighetsrekkefølge: hva nettet
// består av → hvordan pakker flyttes → hvor lang tid det tar → hvor fort det
// går → hvordan jobben er delt i lag → hvordan du måler det selv.

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
} from "../dte-2505/byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { SvitsjingSim } from "@/components/stack/dte2507-skjelett/SvitsjingSim";
import { Innkapslingssim } from "@/components/stack/dte2507-skjelett/Innkapslingssim";
import { AdresseSporing } from "@/components/stack/dte2507-skjelett/AdresseSporing";
import { CaravanAnalogy } from "@/components/stack/dte2507-delay-modell/CaravanAnalogy";
import { DelaySim } from "@/components/stack/dte2507-delay-modell/DelaySim";
import { TrafficIntensitySim } from "@/components/stack/dte2507-delay-modell/TrafficIntensitySim";
import { BottleneckSim } from "@/components/stack/dte2507-bottleneck-throughput/BottleneckSim";

export const emneIntroduksjon: Emne = {
  slug: "introduksjon",
  tittel: "Introduksjon",
  sporsmal: "Hva er Internett, og hvorfor er det bygd i lag?",
  pensum: "Canvas modul 1 — Introduksjon · Kurose & Ross kap. 1",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "hva-er-internett",
      tittel: "Hva Internett består av",
      utbytte:
        "Du kan peke på de tre byggeklossene i et nettverk og si hva en protokoll bestemmer.",
      skjermer: [
        intro("int-1-intro", "Ett nett som ingen eier", {
          ingress: (
            <>
              Veinettet i Europa er ikke én vei. Det er tusenvis av kommunale, fylkes- og riksveier
              som tilfeldigvis henger sammen, fordi alle har blitt enige om hvor bred en bil er og
              hvilken side man kjører på. Internett er bygd på samme måte.
            </>
          ),
          punkter: [
            "Mange selvstendige nett, eid av ulike selskaper.",
            "De henger sammen fordi alle følger de samme reglene.",
            "Ingen sentral sjef sender trafikken din fram.",
          ],
        }),
        anslag("int-2-anslag", "Hvor mange nett?", {
          sporsmal: (
            <>
              Internett er satt sammen av selvstendig drevne nett. Omtrent hvor mange slike nett
              tror du finnes?
            </>
          ),
          valg: [
            { tekst: "Ett" },
            { tekst: "Rundt 200, ett per land" },
            { tekst: "Noen tusen" },
            { tekst: "Over 70 000" },
          ],
          fasit: (
            <>
              Over 70 000. Hvert av dem styres av én organisasjon: en teleoperatør, et universitet,
              en skyleverandør. Navnet «Internett» betyr bokstavelig talt nett mellom nett.
            </>
          ),
        }),
        konsept("int-3-klosser", "Tre byggeklosser", {
          ingress: <>Uansett hvor stort nettet er, består det av de samme tre tingene.</>,
          punkter: [
            <>
              <Term>Endesystem</Term> — en maskin i ytterkanten som sender eller mottar: laptop,
              mobil, server. Kalles også <Term>vert</Term>.
            </>,
            <>
              <Term>Lenke</Term> — forbindelsen mellom to naboer: kobberkabel, fiber eller radio.
            </>,
            <>
              <Term>Pakkesvitsj</Term> — en boks midt i nettet som tar imot data på én lenke og
              sender dem ut på en annen.
            </>,
          ],
          merk: (
            <>
              Det finnes to slags pakkesvitsjer, <Term>rutere</Term> og <Term>svitsjer</Term>.
              Forskjellen kommer i emnene om nettverkslaget og datalinklaget. Nå holder det å vite
              at begge sender videre.
            </>
          ),
        }),
        konsept("int-4-pakker", "Data reiser i pakker", {
          ingress: (
            <>
              En fil sendes aldri som én lang strøm. Avsenderen deler den i små biter og setter en
              adresselapp på hver bit.
            </>
          ),
          punkter: [
            <>
              Biten med adresselapp kalles en <Term>pakke</Term>.
            </>,
            "Hver pakke finner veien for seg selv, uavhengig av de andre.",
            "Mottakeren setter bitene sammen igjen i riktig rekkefølge.",
          ],
          bihjelp: (
            <>
              Tenk på en flyttelast fordelt på mange varebiler. Bilene kan ta ulike veier og komme
              fram i feil rekkefølge, men hver kasse er nummerert.
            </>
          ),
        }),
        konsept("int-5-leverandor", "Nettene kobles gjennom leverandører", {
          ingress: (
            <>
              Hjemmenettet ditt er ikke koblet direkte til en server i USA. Det er koblet til et
              større nett, som igjen er koblet til enda større nett.
            </>
          ),
          punkter: [
            <>
              En <Term>internettleverandør</Term> er et selskap som selger tilkobling til sitt nett.
              På engelsk Internet Service Provider, forkortet <Term>ISP</Term>.
            </>,
            "Lokale leverandører kjøper videre tilkobling fra regionale og globale leverandører.",
            "Store leverandører kobler seg også rett til hverandre for å slippe mellomledd.",
          ],
        }),
        konsept("int-6-protokoll", "En protokoll er en avtale", {
          ingress: (
            <>
              To maskiner fra ulike produsenter forstår hverandre bare hvis de har avtalt alt på
              forhånd. Avtalen heter en <Term>protokoll</Term>.
            </>
          ),
          punkter: [
            <>
              <Term>Format</Term> — hvordan en melding ser ut, felt for felt.
            </>,
            <>
              <Term>Rekkefølge</Term> — hvem som sier hva først, og hva som kommer etterpå.
            </>,
            <>
              <Term>Handling</Term> — hva man gjør når en melding kommer, eller når den uteblir.
            </>,
          ],
          merk: (
            <>
              Når du ringer noen sier du «hallo», venter på svar, og legger på hvis det blir stille
              lenge. Det er alle tre delene i en menneskelig protokoll.
            </>
          ),
        }),
        sjekk("int-7-sjekk", "Hva bestemmer en protokoll?", {
          sporsmal: <>Hvilken av disse tingene er ikke en del av en protokoll?</>,
          valg: [
            {
              tekst: "Hvilke felt en melding har",
              hvorfor: "Det er formatet, den første av de tre delene.",
            },
            {
              tekst: "Hva mottakeren gjør når svaret uteblir",
              hvorfor: "Det er en handling, og den er avtalt på forhånd.",
            },
            {
              tekst: "Hvilket selskap som eier kabelen",
              riktig: true,
              hvorfor:
                "Eierskap er forretning, ikke kommunikasjon. Protokollen er lik uansett eier.",
            },
            {
              tekst: "Hvem som sender den første meldingen",
              hvorfor: "Det er rekkefølgen.",
            },
          ],
          fasit: (
            <>
              En protokoll bestemmer format, rekkefølge og handling. Nettopp fordi den ikke bryr seg
              om hvem som eier utstyret, kan 70 000 ulike nett snakke sammen.
            </>
          ),
        }),
        recall("int-8-recall", [
          {
            forside: "Hvilke tre byggeklosser består et nettverk av?",
            bakside: "Endesystemer (verter), lenker og pakkesvitsjer.",
          },
          {
            forside: "Hva er en pakke?",
            bakside:
              "En liten bit av dataene med adresseinformasjon foran, som sendes for seg selv.",
          },
          {
            forside: "Hvilke tre ting bestemmer en protokoll?",
            bakside:
              "Formatet på meldingene, rekkefølgen de sendes i, og handlingen ved mottak eller uteblitt svar.",
          },
        ]),
        oppsummering("int-9-opp", {
          punkter: [
            "Internett er mange selvstendige nett som følger felles protokoller.",
            "Byggeklossene er endesystemer, lenker og pakkesvitsjer.",
            "Data deles i pakker som hver finner veien selv.",
          ],
          videre: "Neste undertema: hva som skjer med en pakke inne i en pakkesvitsj.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "pakkesvitsjing",
      tittel: "Pakkesvitsjing og linjesvitsjing",
      utbytte:
        "Du kan forklare lagre-og-videresend, hvorfor køer oppstår, og hva man vinner og taper mot en reservert linje.",
      byggerPa: ["hva-er-internett"],
      skjermer: [
        intro("sv-1-intro", "Å dele en lenke", {
          ingress: (
            <>
              En lenke mellom to byer er dyr. Tusenvis av brukere må dele den. Spørsmålet er om hver
              bruker skal få sin faste del, eller om alle skal slippe til etter tur.
            </>
          ),
          merk: (
            <>De to svarene heter linjesvitsjing og pakkesvitsjing. Internett valgte det siste.</>
          ),
        }),
        konsept("sv-2-lagre", "Lagre og videresend", {
          ingress: (
            <>
              En pakkesvitsj sender ikke én og én bit videre mens de kommer inn. Den venter til hele
              pakken er mottatt.
            </>
          ),
          punkter: [
            "Hele pakken tas imot og legges i minnet.",
            "Svitsjen leser adressen og velger utgående lenke.",
            "Først da sendes pakken ut igjen, bit for bit.",
          ],
          merk: (
            <>
              Prinsippet heter <Term>lagre og videresend</Term>. Det betyr at hver svitsj på veien
              legger til litt ventetid.
            </>
          ),
        }),
        konsept("sv-3-ko", "Kø og tap", {
          ingress: (
            <>
              Hvis det kommer pakker inn raskere enn den utgående lenken klarer å sende, må noen
              vente.
            </>
          ),
          punkter: [
            <>
              Ventende pakker ligger i en <Term>utkø</Term>, også kalt buffer, foran hver utgående
              lenke.
            </>,
            "Bufferet har endelig plass.",
            <>
              Når det er fullt blir neste pakke kastet. Det kalles <Term>pakketap</Term>.
            </>,
          ],
          bihjelp: (
            <>
              Tenk på et påkjøringsfelt. Feltet har plass til ti biler. Den ellevte har ingen steder
              å stå.
            </>
          ),
        }),
        konsept("sv-4-linje", "Alternativet: en reservert linje", {
          ingress: (
            <>
              Det gamle telefonnettet løste delingen annerledes. Før samtalen startet ble det satt
              av en fast del av hver lenke på hele veien.
            </>
          ),
          punkter: [
            <>
              Metoden heter <Term>linjesvitsjing</Term>.
            </>,
            "Kapasiteten er garantert så lenge forbindelsen varer.",
            "Kapasiteten er også opptatt når du er stille, og ingen andre kan bruke den.",
          ],
        }),
        anslag("sv-5-anslag", "Hvor mange får plass?", {
          sporsmal: (
            <>
              En lenke har plass til 10 samtidige brukere med reservert linje. Hver bruker er aktiv
              bare 10 % av tiden. Hvor mange brukere kan lenken betjene med pakkesvitsjing, uten at
              det merkes?
            </>
          ),
          valg: [
            { tekst: "10, like mange" },
            { tekst: "Rundt 12" },
            { tekst: "Rundt 35" },
            { tekst: "Rundt 100" },
          ],
          fasit: (
            <>
              Rundt 35. Med 35 brukere som hver er aktive 10 % av tiden, er sannsynligheten for at
              flere enn 10 sender samtidig under 0,05 %. Pakkesvitsjing utnytter at folk stort sett
              er stille.
            </>
          ),
        }),
        visual("sv-6-sim", "Sammenlign de to metodene", {
          ledetekst: <>Samme lenke, to måter å dele den på.</>,
          Viz: SvitsjingSim,
          hint: "Endre antall brukere og se hvor mange hver metode får plass til, og hva som skjer når det blir for mange.",
        }),
        sjekk("sv-7-sjekk", "Hva er prisen?", {
          sporsmal: <>Hva gir pakkesvitsjing avkall på, sammenlignet med linjesvitsjing?</>,
          valg: [
            {
              tekst: "Muligheten til å dele en lenke mellom flere",
              hvorfor: "Motsatt. Deling er det pakkesvitsjing er best på.",
            },
            {
              tekst: "Garantien om fast kapasitet og fast forsinkelse",
              riktig: true,
              hvorfor: "Uten reservasjon kan køen vokse, og pakker kan gå tapt.",
            },
            {
              tekst: "Muligheten til å sende data i begge retninger",
              hvorfor: "Begge metodene sender i begge retninger.",
            },
          ],
          fasit: (
            <>
              Garantien. Pakkesvitsjing gir bedre utnyttelse og trenger ingen oppkobling, men
              forsinkelsen varierer med trafikken og pakker kan mistes.
            </>
          ),
        }),
        recall("sv-8-recall", [
          {
            forside: "Hva betyr lagre og videresend?",
            bakside:
              "Svitsjen må ta imot hele pakken før den begynner å sende den ut på neste lenke.",
          },
          {
            forside: "Når oppstår pakketap?",
            bakside: "Når en pakke kommer til en utkø som allerede er full.",
          },
          {
            forside: "Hva er forskjellen på linjesvitsjing og pakkesvitsjing?",
            bakside:
              "Linjesvitsjing reserverer fast kapasitet på hele veien. Pakkesvitsjing lar alle sende etter behov og dele lenken.",
          },
        ]),
        oppsummering("sv-9-opp", {
          punkter: [
            "En pakkesvitsj lagrer hele pakken før den videresender.",
            "Køer oppstår når det kommer mer inn enn lenken ut tåler, og fulle køer gir tap.",
            "Pakkesvitsjing bytter garanti mot bedre utnyttelse.",
          ],
          videre: "Neste undertema: de fire stedene en pakke bruker tid.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "fire-forsinkelser",
      tittel: "De fire forsinkelsene",
      utbytte:
        "Du kan regne ut hvor lang tid en pakke bruker over en lenke, og si hvilken av de fire forsinkelsene som dominerer.",
      byggerPa: ["pakkesvitsjing"],
      skjermer: [
        intro("fd-1-intro", "Hvor blir tiden av?", {
          ingress: (
            <>
              En pakke fra Narvik til Oslo bruker noen millisekunder. Den tiden går med på fire
              ulike ting i hver eneste svitsj på veien. Kan du de fire, kan du regne på nesten alle
              forsinkelsesoppgaver.
            </>
          ),
        }),
        konsept("fd-2-inne", "To forsinkelser inne i svitsjen", {
          ingress: <>De to første skjer før pakken har forlatt boksen.</>,
          punkter: [
            <>
              <Term>Behandlingsforsinkelse</Term> (processing delay) — svitsjen leser adressen og
              sjekker pakken for feil. Mikrosekunder.
            </>,
            <>
              <Term>Køforsinkelse</Term> (queuing delay) — pakken venter på tur i utkøen. Fra null
              til mange millisekunder, avhengig av trafikken.
            </>,
          ],
          merk: <>Køforsinkelsen er den eneste av de fire som varierer fra pakke til pakke.</>,
        }),
        konsept("fd-3-ut", "To forsinkelser på lenken", {
          ingress: <>De to siste blandes ofte sammen. De måler helt ulike ting.</>,
          punkter: [
            <>
              <Term>Sendeforsinkelse</Term> (transmission delay) — tiden det tar å dytte alle bitene
              i pakken ut på lenken. Pakkelengde delt på lenkens rate: <Kodelinje>L / R</Kodelinje>.
            </>,
            <>
              <Term>Forplantningsforsinkelse</Term> (propagation delay) — tiden én bit bruker på å
              reise langs lenken. Avstand delt på signalhastighet: <Kodelinje>d / s</Kodelinje>.
            </>,
          ],
          bihjelp: (
            <>
              <Kodelinje>L</Kodelinje> er pakkelengden i bit, <Kodelinje>R</Kodelinje> er raten i
              bit per sekund, <Kodelinje>d</Kodelinje> er lengden i meter og{" "}
              <Kodelinje>s</Kodelinje> er signalhastigheten, omtrent 2 · 10⁸ meter per sekund i
              kabel.
            </>
          ),
        }),
        visual("fd-4-karavane", "Karavanen og bomstasjonen", {
          ledetekst: (
            <>
              Bilene er bit, karavanen er pakken. Bommen slipper gjennom én bil om gangen, og veien
              etterpå tar den tiden den tar.
            </>
          ),
          Viz: CaravanAnalogy,
          hint: "Se hvilken del av reisen som er sending (bommen) og hvilken som er forplantning (veien). Kan første bil nå neste bom før siste bil er sluppet gjennom?",
        }),
        tallanslag("fd-5-send", "Regn ut sendeforsinkelsen", {
          sporsmal: (
            <>
              En pakke på 12 000 bit skal ut på en lenke med rate 100 megabit per sekund. Hvor lang
              er sendeforsinkelsen, i mikrosekunder?
            </>
          ),
          enhet: "µs",
          fasitTall: 120,
          fasit: (
            <>
              L / R = 12 000 bit / 100 000 000 bit/s = 0,00012 s = 120 mikrosekunder. Lengden på
              kabelen spiller ingen rolle for dette tallet.
            </>
          ),
        }),
        tallanslag("fd-6-forpl", "Regn ut forplantningsforsinkelsen", {
          sporsmal: (
            <>
              Lenken er 3000 kilometer lang, og signalet går med 2 · 10⁸ meter per sekund. Hvor lang
              er forplantningsforsinkelsen, i millisekunder?
            </>
          ),
          enhet: "ms",
          fasitTall: 15,
          fasit: (
            <>
              d / s = 3 000 000 m / 200 000 000 m/s = 0,015 s = 15 millisekunder. Pakkelengden og
              raten spiller ingen rolle for dette tallet.
            </>
          ),
        }),
        visual("fd-7-sim", "Alle fire sammen", {
          ledetekst: <>Total forsinkelse i én node er summen av de fire.</>,
          Viz: DelaySim,
          hint: "Bytt mellom lokalnett, fiber og satellitt. Legg merke til hvilken av de fire som er størst i hvert tilfelle.",
        }),
        konsept("fd-8-intensitet", "Når køen løper løpsk", {
          ingress: (
            <>
              Køforsinkelsen avhenger av hvor mye som kommer inn i forhold til hvor mye lenken
              klarer å sende ut.
            </>
          ),
          punkter: [
            <>
              <Term>Trafikkintensitet</Term> er forholdet <Kodelinje>L · a / R</Kodelinje>, der{" "}
              <Kodelinje>a</Kodelinje> er antall pakker som ankommer per sekund.
            </>,
            "Nær 0: nesten ingen kø.",
            "Nær 1: køen vokser bratt.",
            "Over 1: det kommer mer inn enn det går ut, og køen vokser til bufferet er fullt.",
          ],
        }),
        visual("fd-9-intensitet-sim", "Se kurven", {
          Viz: TrafficIntensitySim,
          hint: "Dra intensiteten mot 1 og se hvordan gjennomsnittlig køforsinkelse stiger. Kurven er ikke en rett linje.",
        }),
        sjekk("fd-10-sjekk", "Hvilken forsinkelse endres?", {
          sporsmal: (
            <>
              Du bytter en lenke på 10 megabit per sekund med en på 1 gigabit per sekund. Kabelen er
              like lang. Hvilken forsinkelse blir mindre?
            </>
          ),
          valg: [
            {
              tekst: "Forplantningsforsinkelsen",
              hvorfor: "Den avhenger av avstand og signalhastighet, ikke av raten.",
            },
            {
              tekst: "Sendeforsinkelsen",
              riktig: true,
              hvorfor: "L / R: hundre ganger høyere rate gir hundre ganger kortere sendetid.",
            },
            {
              tekst: "Begge to like mye",
              hvorfor: "Bare den ene har raten R i formelen.",
            },
          ],
          fasit: (
            <>
              Sendeforsinkelsen. En raskere lenke dytter bitene fortere ut, men hver bit reiser
              fortsatt like fort langs kabelen.
            </>
          ),
        }),
        recall("fd-11-recall", [
          {
            forside: "Hvilke fire forsinkelser har en pakke i hver node?",
            bakside: "Behandling, kø, sending og forplantning.",
          },
          {
            forside: "Formelen for sendeforsinkelse?",
            bakside: "L / R: pakkelengde i bit delt på lenkens rate i bit per sekund.",
          },
          {
            forside: "Formelen for forplantningsforsinkelse?",
            bakside: "d / s: lenkens lengde delt på signalhastigheten.",
          },
          {
            forside: "Hva skjer når trafikkintensiteten L · a / R går over 1?",
            bakside: "Køen vokser uten grense til bufferet er fullt, og pakker går tapt.",
          },
        ]),
        oppsummering("fd-12-opp", {
          punkter: [
            "Total nodeforsinkelse er behandling + kø + sending + forplantning.",
            "Sending avhenger av pakkelengde og rate. Forplantning avhenger av avstand.",
            "Køforsinkelsen er den som varierer, og den eksploderer når intensiteten nærmer seg 1.",
          ],
          videre: "Neste undertema: hvor fort data faktisk kommer fram over flere lenker.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "gjennomstromning",
      tittel: "Flaskehals og gjennomstrømning",
      utbytte:
        "Du kan finne flaskehalsen på en vei med flere lenker og regne ut hvor lang tid en overføring tar.",
      byggerPa: ["fire-forsinkelser"],
      skjermer: [
        intro("gj-1-intro", "Fort og raskt er to ting", {
          ingress: (
            <>
              Forsinkelse sier hvor lenge én pakke er underveis. Når du laster ned en stor fil bryr
              du deg om noe annet: hvor mange bit som kommer fram per sekund.
            </>
          ),
          merk: (
            <>
              Det tallet heter <Term>gjennomstrømning</Term>, på engelsk throughput.
            </>
          ),
        }),
        konsept("gj-2-min", "Den tregeste lenken bestemmer", {
          ingress: (
            <>
              Hell vann gjennom tre rør koblet etter hverandre. Det kommer aldri mer ut enn det det
              smaleste røret slipper gjennom.
            </>
          ),
          punkter: [
            "Gjennomstrømningen ende til ende er den minste raten på veien.",
            <>
              Lenken med lavest rate kalles <Term>flaskehalsen</Term>.
            </>,
            "Å oppgradere en annen lenke enn flaskehalsen hjelper ikke.",
          ],
        }),
        tallanslag("gj-3-tid", "Hvor lang tid tar det?", {
          sporsmal: (
            <>
              En fil på 30 megabit sendes over tre lenker med rate 100, 1,5 og 20 megabit per
              sekund. Hvor mange sekunder tar overføringen, omtrent?
            </>
          ),
          enhet: "s",
          fasitTall: 20,
          fasit: (
            <>
              Flaskehalsen er 1,5 megabit per sekund. 30 megabit / 1,5 megabit per sekund = 20
              sekunder. De to raske lenkene påvirker ikke svaret.
            </>
          ),
        }),
        visual("gj-4-sim", "Flytt flaskehalsen", {
          ledetekst: <>Tre lenker i kjede fra server til klient.</>,
          Viz: BottleneckSim,
          hint: "Endre ratene til flaskehalsen bytter plass. Se at gjennomstrømningen bare følger den minste.",
        }),
        konsept("gj-5-deling", "Når flere deler samme lenke", {
          ingress: (
            <>I kjernen av nettet er lenkene raske, men de deles av svært mange forbindelser.</>
          ),
          punkter: [
            "En lenke på 5 megabit per sekund delt likt på 10 forbindelser gir 0,5 megabit per sekund til hver.",
            "Da kan en rask kjernelenke bli flaskehalsen likevel.",
            "Vanligvis er det likevel tilkoblingen hjemme hos brukeren som er smalest.",
          ],
        }),
        sjekk("gj-6-sjekk", "Hva hjelper?", {
          sporsmal: (
            <>
              Veien har lenker på 50, 2 og 10 megabit per sekund. Du får penger til å oppgradere én
              lenke. Hvilken gir raskere nedlasting?
            </>
          ),
          valg: [
            {
              tekst: "Den på 50",
              hvorfor: "Den er allerede den raskeste. Flaskehalsen står urørt.",
            },
            {
              tekst: "Den på 2",
              riktig: true,
              hvorfor:
                "Det er flaskehalsen. Oppgraderer du den til over 10, blir 10-lenken ny flaskehals.",
            },
            {
              tekst: "Den på 10",
              hvorfor: "Gjennomstrømningen er fortsatt 2 etterpå.",
            },
          ],
          fasit: (
            <>
              Bare flaskehalsen teller. Etter oppgraderingen er neste smaleste lenke den nye
              grensen.
            </>
          ),
        }),
        recall("gj-7-recall", [
          {
            forside: "Hva er gjennomstrømning?",
            bakside: "Antall bit per sekund som faktisk kommer fram fra avsender til mottaker.",
          },
          {
            forside: "Hvordan finner du gjennomstrømningen over flere lenker i kjede?",
            bakside: "Ta den minste raten på veien. Den lenken er flaskehalsen.",
          },
        ]),
        oppsummering("gj-8-opp", {
          punkter: [
            "Gjennomstrømning måles i bit per sekund ende til ende.",
            "Den er lik raten til flaskehalsen.",
            "Overføringstid er filstørrelse delt på gjennomstrømning.",
          ],
          videre: "Neste undertema: hvordan hele jobben er delt i lag.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "lag-og-innkapsling",
      tittel: "Protokollstakken og innkapsling",
      utbytte:
        "Du kan navngi de fem lagene, si hva hvert lag har ansvar for, og forklare hva som skjer med en melding på vei ned og opp.",
      byggerPa: ["hva-er-internett", "pakkesvitsjing"],
      skjermer: [
        intro("lag-1-intro", "For stort for én protokoll", {
          ingress: (
            <>
              Å få en nettside fra en server til skjermen din krever løsninger på helt ulike
              problemer: hvilken kabel, hvilken vei, hva hvis noe mistes, hva betyr innholdet. Én
              protokoll som løste alt ville vært umulig å endre.
            </>
          ),
          merk: (
            <>
              Løsningen er å dele jobben i <Term>lag</Term>. Hvert lag løser ett problem og bruker
              laget under som en tjeneste.
            </>
          ),
        }),
        konsept("lag-2-fem", "De fem lagene", {
          ingress: <>Ovenfra og ned, fra programmet ditt til kabelen.</>,
          punkter: [
            <>
              <Term>Applikasjonslaget</Term> — hva programmene sier til hverandre. Nettsider,
              e-post, navneoppslag.
            </>,
            <>
              <Term>Transportlaget</Term> — levering fra ett program til et annet program.
            </>,
            <>
              <Term>Nettverkslaget</Term> — å finne veien fra én maskin til en annen gjennom mange
              nett.
            </>,
            <>
              <Term>Linklaget</Term> — å få data over én enkelt lenke til nærmeste nabo.
            </>,
            <>
              <Term>Det fysiske laget</Term> — å gjøre bit om til strøm, lys eller radiobølger.
            </>,
          ],
          bihjelp: (
            <>
              En eldre modell, OSI-modellen, har sju lag. Den har to ekstra lag mellom applikasjon
              og transport: presentasjon og sesjon. På Internett ligger de oppgavene i
              applikasjonen.
            </>
          ),
        }),
        konsept("lag-3-innkapsling", "Innkapsling", {
          ingress: (
            <>
              Hvert lag legger sin egen informasjon foran det laget over sendte ned. Det er som å
              legge et brev i en konvolutt, konvolutten i en pose, og posen i en kasse.
            </>
          ),
          punkter: [
            <>
              Informasjonen laget legger til heter et <Term>hode</Term>, på engelsk header.
            </>,
            <>
              Det laget fikk ovenfra heter <Term>nyttelast</Term>, på engelsk payload.
            </>,
            "Mottakeren pakker ut i motsatt rekkefølge, ett lag om gangen.",
          ],
          merk: (
            <>Å pakke inn på vei ned kalles innkapsling. Å pakke ut på vei opp kalles utpakking.</>
          ),
        }),
        konsept("lag-4-navn", "Pakken skifter navn", {
          ingress: (
            <>Ordet «pakke» er et fellesnavn. Hvert lag har sitt eget navn på enheten det sender.</>
          ),
          punkter: [
            <>
              Applikasjonslaget: <Term>melding</Term>.
            </>,
            <>
              Transportlaget: <Term>segment</Term>.
            </>,
            <>
              Nettverkslaget: <Term>datagram</Term>.
            </>,
            <>
              Linklaget: <Term>ramme</Term>.
            </>,
          ],
          merk: <>Eksamensoppgaver bruker disse navnene for å fortelle hvilket lag de spør om.</>,
        }),
        visual("lag-5-sim", "Pakk inn en melding", {
          ledetekst: <>Følg en melding ned gjennom lagene og se hodene bli lagt på.</>,
          Viz: Innkapslingssim,
          hint: "Tell hvor mange byte hvert lag legger til, og se hvor mye av rammen som til slutt er din egen data.",
        }),
        konsept("lag-6-hvem", "Hvem ser hvilke lag?", {
          ingress: <>Ikke alle bokser på veien pakker ut like langt.</>,
          punkter: [
            "Endesystemer har alle fem lagene.",
            "En ruter pakker ut til og med nettverkslaget, for å lese hvor datagrammet skal.",
            "En svitsj pakker bare ut til linklaget.",
          ],
          merk: (
            <>
              Derfor står adressen i nettverkslaget stille hele veien, mens adressen i linklaget
              byttes ut for hver lenke.
            </>
          ),
        }),
        visual("lag-7-adresser", "Følg adressene hopp for hopp", {
          ledetekst: (
            <>
              Nettverkslaget bruker IP-adresser, som peker ut maskinen i hver ende. Linklaget bruker
              MAC-adresser, som peker ut nærmeste nabo.
            </>
          ),
          Viz: AdresseSporing,
          hint: "Klikk deg gjennom hoppene. Hvilke felt blinker, og hvilke står stille hele veien?",
        }),
        sjekk("lag-8-sjekk", "Hvilket lag?", {
          sporsmal: (
            <>
              En ruter tar imot en ramme, pakker ut innholdet og bestemmer hvilken lenke det skal
              videre på. Hva heter enheten ruteren leser adressen i?
            </>
          ),
          valg: [
            {
              tekst: "Melding",
              hvorfor: "Meldingen tilhører applikasjonslaget, som ruteren aldri ser.",
            },
            {
              tekst: "Segment",
              hvorfor: "Segmentet tilhører transportlaget, over det ruteren pakker ut.",
            },
            {
              tekst: "Datagram",
              riktig: true,
              hvorfor: "Ruteren jobber i nettverkslaget, og enheten der heter datagram.",
            },
            {
              tekst: "Ramme",
              hvorfor: "Rammen er konvolutten ruteren tok av for å komme til datagrammet.",
            },
          ],
          fasit: (
            <>
              Datagram. Ruteren kaster den gamle rammen, leser mottakeradressen i datagrammet, og
              pakker det i en ny ramme for neste lenke.
            </>
          ),
        }),
        recall("lag-9-recall", [
          {
            forside: "Nevn de fem lagene ovenfra og ned.",
            bakside: "Applikasjon, transport, nettverk, link, fysisk.",
          },
          {
            forside: "Hva heter enheten i transport-, nettverks- og linklaget?",
            bakside: "Segment, datagram og ramme.",
          },
          {
            forside: "Hva er innkapsling?",
            bakside: "At hvert lag legger sitt eget hode foran det laget over sendte ned.",
          },
          {
            forside: "Hvilke adresser endres for hvert hopp, og hvilke står stille?",
            bakside: "MAC-adressene i linklaget endres. IP-adressene i nettverkslaget står stille.",
          },
        ]),
        oppsummering("lag-10-opp", {
          punkter: [
            "Jobben er delt i fem lag som hver bruker laget under.",
            "Hvert lag legger på et hode på vei ned og fjerner det på vei opp.",
            "Rutere ser tre lag, svitsjer to, endesystemer alle fem.",
          ],
          videre: "Neste undertema: to kommandoer som lar deg måle alt dette selv.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "male-nettet",
      tittel: "Mål nettet selv",
      utbytte: "Du kan lese utskriften fra ping og traceroute og si hva tallene betyr.",
      byggerPa: ["fire-forsinkelser", "lag-og-innkapsling"],
      skjermer: [
        intro("ma-1-intro", "Fra formel til terminal", {
          ingress: (
            <>
              Forsinkelsene du nettopp regnet på kan måles fra din egen maskin. To kommandoer dekker
              det meste.
            </>
          ),
          punkter: [
            "ping måler tiden fram og tilbake til én maskin.",
            "traceroute viser hver ruter på veien dit.",
          ],
        }),
        kode("ma-2-ping", "ping", {
          ingress: <>Sender en liten pakke og venter på at mottakeren svarer.</>,
          kode: `$ ping -c 3 uit.no
64 bytes from 129.242.4.42: icmp_seq=0 ttl=55 time=14.2 ms
64 bytes from 129.242.4.42: icmp_seq=1 ttl=55 time=13.8 ms
64 bytes from 129.242.4.42: icmp_seq=2 ttl=55 time=31.5 ms

3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max = 13.8/19.8/31.5 ms`,
          punkter: [
            <>
              <Kodelinje>time</Kodelinje> er tiden tur-retur, på engelsk round-trip time.
            </>,
            "Den tredje pakken brukte over dobbelt så lang tid. Avstanden er den samme, så forskjellen er køforsinkelse.",
            <>
              <Kodelinje>packet loss</Kodelinje> er andelen pakker som aldri fikk svar.
            </>,
          ],
        }),
        kode("ma-3-traceroute", "traceroute", {
          ingress: <>Viser én linje per ruter på veien, med tre målinger til hver.</>,
          kode: `$ traceroute uit.no
 1  192.168.1.1      1.1 ms   0.9 ms   1.0 ms
 2  10.20.0.1        4.3 ms   4.1 ms   4.6 ms
 3  ti0001c400.net  11.7 ms  11.9 ms  11.6 ms
 4  * * *
 5  129.242.4.42    14.0 ms  13.9 ms  14.3 ms`,
          punkter: [
            "Linje 1 er ruteren hjemme hos deg.",
            "Spranget fra linje 2 til 3 er på over 7 millisekunder. Der ligger en lang lenke.",
            "Stjernene på linje 4 betyr at ruteren ikke svarte. Pakkene kom likevel videre, ellers hadde ikke linje 5 vært der.",
          ],
          merk: <>På Windows heter kommandoen tracert.</>,
        }),
        sjekk("ma-4-sjekk", "Les utskriften", {
          sporsmal: (
            <>
              ping mot samme maskin gir 14, 14, 15, 90 og 14 millisekunder. Hva forklarer best
              målingen på 90?
            </>
          ),
          valg: [
            {
              tekst: "Pakken tok en lengre kabel",
              hvorfor: "Mulig, men veien er nesten alltid den samme fra ett sekund til det neste.",
            },
            {
              tekst: "Pakken ble stående i en kø",
              riktig: true,
              hvorfor: "Køforsinkelse er den eneste av de fire som svinger fra pakke til pakke.",
            },
            {
              tekst: "Pakken var større",
              hvorfor: "ping sender like store pakker hver gang.",
            },
          ],
          fasit: (
            <>
              Kø. Behandling, sending og forplantning er nesten konstante for like pakker på samme
              vei. Variasjon i målingene er derfor et tegn på trafikk.
            </>
          ),
        }),
        recall("ma-5-recall", [
          {
            forside: "Hva måler ping?",
            bakside: "Tiden tur-retur til én maskin, og hvor mange pakker som går tapt.",
          },
          {
            forside: "Hva viser traceroute?",
            bakside: "Hver ruter på veien til målet, med tiden tur-retur til hver av dem.",
          },
          {
            forside: "Hva betyr * * * i traceroute?",
            bakside:
              "At ruteren på det hoppet ikke svarte. Det betyr ikke nødvendigvis at veien er brutt.",
          },
        ]),
        oppsummering("ma-6-opp", {
          punkter: [
            "ping gir tur-retur-tid og tap til ett mål.",
            "traceroute viser hvor på veien tiden går med.",
            "Variasjon mellom målinger skyldes kø.",
          ],
          videre: "Neste emne: applikasjonslaget, der programmene snakker sammen.",
        }),
      ],
    },
  ],
};
