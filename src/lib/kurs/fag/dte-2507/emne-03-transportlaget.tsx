// Emne 3 — Transportlaget.
// Pensum: Canvas modul 3 «Transportlaget», Kurose & Ross kap. 3.
// Bygger på emne 1 (pakketap, kø, tur-retur-tid) og emne 2 (prosess, sokkel,
// port, TCP og UDP sett utenfra).
// Rekkefølge: finne riktig sokkel → UDP → bygge pålitelighet fra bunnen →
// sende mange om gangen → TCP-forbindelsen → flytkontroll → metningskontroll.

import type { Emne } from "@/lib/kurs/types";
import {
  intro,
  konsept,
  oppsummering,
  recall,
  sjekk,
  tallanslag,
  visual,
} from "../dte-2505/byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { RdtVisualizer } from "@/components/stack/dte2507-rdt-progresjon/RdtVisualizer";
import { UtilizationCalc } from "@/components/stack/dte2507-rdt-progresjon/UtilizationCalc";
import { TcpSlidingWindow } from "@/components/stack/transportlag/TcpSlidingWindow";
import { TcpHandshakeDiagram } from "@/components/stack/tcp-sockets/TcpHandshakeDiagram";
import { CongestionWindowSim } from "@/components/stack/dte2507-congestion-control/CongestionWindowSim";

export const emneTransportlaget: Emne = {
  slug: "transportlaget",
  tittel: "Transportlaget",
  sporsmal: "Hvordan blir en upålitelig kanal til en pålitelig forbindelse?",
  pensum: "Canvas modul 3 — Transportlaget · Kurose & Ross kap. 3",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "multipleksing-og-udp",
      tittel: "Multipleksing og UDP",
      utbytte:
        "Du kan forklare hvordan et segment havner i riktig sokkel, og hva UDP legger til oppå nettverkslaget.",
      byggerPa: ["prosesser-og-sokler", "lag-og-innkapsling"],
      skjermer: [
        intro("mu-1-intro", "Fra maskin til program", {
          ingress: (
            <>
              Nettverkslaget leverer et datagram til riktig maskin. Transportlaget tar det siste
              steget og leverer innholdet til riktig prosess. Det kjører bare i endesystemene, aldri
              i ruterne.
            </>
          ),
        }),
        konsept("mu-2-mux", "Samle og fordele", {
          ingress: <>Mange programmer deler én nettverksforbindelse. To ord beskriver jobben.</>,
          punkter: [
            <>
              <Term>Multipleksing</Term> hos avsender: samle data fra mange sokler og merke hvert
              segment med portnumre.
            </>,
            <>
              <Term>Demultipleksing</Term> hos mottaker: lese portnumrene og levere segmentet til
              riktig sokkel.
            </>,
          ],
          bihjelp: (
            <>
              I et hus med fem beboere henter én av dem posten i postkassen og deler den ut etter
              navnet på konvolutten. Det er demultipleksing.
            </>
          ),
        }),
        konsept("mu-3-nokkel", "Hva som peker ut en sokkel", {
          ingress: <>UDP og TCP bruker ulik nøkkel når de skal finne riktig sokkel.</>,
          punkter: [
            "UDP: bare mottakerens IP-adresse og mottakerport. Segmenter fra ulike avsendere til samme port havner i samme sokkel.",
            "TCP: fire tall. Avsenderadresse, avsenderport, mottakeradresse og mottakerport.",
            "Derfor kan en nettjener ha tusen forbindelser på port 80, én sokkel for hver.",
          ],
        }),
        konsept("mu-4-udp", "UDP: nesten ingenting", {
          ingress: (
            <>
              <Term>UDP</Term> (User Datagram Protocol) legger bare et hode på åtte byte foran
              dataene.
            </>
          ),
          punkter: [
            "Avsenderport og mottakerport.",
            "Lengde.",
            <>
              <Term>Sjekksum</Term>, som lar mottakeren oppdage om bit har blitt endret underveis.
            </>,
          ],
          merk: <>Ingen oppkobling, ingen omsending, ingen rekkefølge, ingen bremsing.</>,
        }),
        konsept("mu-5-hvorfor", "Hvorfor velge UDP?", {
          ingress: <>Mangelen på tjenester er nettopp poenget.</>,
          punkter: [
            "Ingen oppkobling betyr ingen ventetid før første melding.",
            "Applikasjonen bestemmer selv når noe sendes.",
            "Lite hode og ingen tilstand å holde orden på.",
          ],
          merk: (
            <>
              Navneoppslag, tale og spill bruker UDP. Trenger de pålitelighet, bygger de den selv.
            </>
          ),
        }),
        sjekk("mu-6-sjekk", "Samme sokkel eller ikke?", {
          sporsmal: (
            <>
              To ulike klienter sender hvert sitt UDP-segment til samme tjener, port 53. Hvor havner
              de?
            </>
          ),
          valg: [
            {
              tekst: "I samme sokkel",
              riktig: true,
              hvorfor: "UDP ser bare på mottakeradresse og mottakerport.",
            },
            {
              tekst: "I hver sin sokkel",
              hvorfor: "Det ville vært riktig for TCP, som bruker alle fire tallene.",
            },
          ],
          fasit: (
            <>Samme sokkel. Tjeneren skiller dem på avsenderadressen som følger med hver melding.</>
          ),
        }),
        recall("mu-7-recall", [
          {
            forside: "Hva er multipleksing og demultipleksing?",
            bakside:
              "Å samle data fra mange sokler på vei ut, og å fordele mottatte segmenter til riktig sokkel på vei inn.",
          },
          {
            forside: "Hva peker ut en UDP-sokkel, og hva peker ut en TCP-sokkel?",
            bakside:
              "UDP: mottakeradresse og mottakerport. TCP: avsenderadresse, avsenderport, mottakeradresse og mottakerport.",
          },
          {
            forside: "Hvilke fire felt har UDP-hodet?",
            bakside: "Avsenderport, mottakerport, lengde og sjekksum. Åtte byte til sammen.",
          },
        ]),
        oppsummering("mu-8-opp", {
          punkter: [
            "Transportlaget leverer til prosesser ved hjelp av portnumre.",
            "UDP legger bare til porter og en sjekksum.",
          ],
          videre: "Neste undertema: hvordan man bygger pålitelighet oppå en kanal som mister ting.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "palitelig-overforing",
      tittel: "Pålitelig overføring, steg for steg",
      utbytte:
        "Du kan forklare hvilket problem sjekksum, kvittering, sekvensnummer og tidsur hver for seg løser.",
      byggerPa: ["multipleksing-og-udp", "pakkesvitsjing"],
      skjermer: [
        intro("po-1-intro", "Fire verktøy for fire problemer", {
          ingress: (
            <>
              Kanalen under transportlaget kan endre bit, miste pakker og levere dem to ganger. Vi
              bygger opp en pålitelig protokoll ved å løse ett problem om gangen. Læreboka kaller
              trinnene rdt 1.0 til 3.0, for reliable data transfer.
            </>
          ),
        }),
        konsept("po-2-bitfeil", "Problem 1: bit blir endret", {
          ingress: <>Mottakeren må kunne oppdage feilen og si fra.</>,
          punkter: [
            <>
              <Term>Sjekksum</Term> lar mottakeren oppdage at pakken er skadet.
            </>,
            <>
              <Term>Kvittering</Term> (acknowledgement, <Term>ACK</Term>) sier «mottatt i orden».
            </>,
            <>
              Negativ kvittering (<Term>NAK</Term>) sier «skadet, send på nytt».
            </>,
          ],
          merk: (
            <>
              Avsenderen sender én pakke og venter på svar før den neste. Det heter stopp og vent.
            </>
          ),
        }),
        konsept("po-3-duplikat", "Problem 2: kvitteringen blir skadet", {
          ingress: (
            <>
              Hvis selve kvitteringen blir ødelagt, vet ikke avsenderen om pakken kom fram. Den
              sender på nytt for sikkerhets skyld.
            </>
          ),
          punkter: [
            "Da kan mottakeren få samme pakke to ganger.",
            <>
              Løsningen er et <Term>sekvensnummer</Term> på hver pakke.
            </>,
            "Mottakeren ser at nummeret er likt det forrige og kaster kopien.",
          ],
          bihjelp: <>Med stopp og vent holder det med to numre, 0 og 1, som veksler.</>,
        }),
        konsept("po-4-tap", "Problem 3: pakken forsvinner", {
          ingress: <>Blir pakken eller kvitteringen borte, kommer det aldri noe svar.</>,
          punkter: [
            <>
              Avsenderen starter et <Term>tidsur</Term> når pakken sendes.
            </>,
            "Går tiden ut uten kvittering, sendes pakken på nytt.",
            "Kom pakken egentlig fram, sørger sekvensnummeret for at kopien kastes.",
          ],
        }),
        visual("po-5-sim", "Bygg protokollen selv", {
          Viz: RdtVisualizer,
          hint: "Gå gjennom versjonene i rekkefølge og se hvilket problem hver ny mekanisme fjerner.",
        }),
        tallanslag("po-6-regn", "Hvor mye av tiden sendes det?", {
          sporsmal: (
            <>
              Pakken er 8000 bit, lenken har 1 gigabit per sekund, og tur-retur-tiden er 30
              millisekunder. Hvor lang er sendeforsinkelsen, i mikrosekunder?
            </>
          ),
          enhet: "µs",
          fasitTall: 8,
          fasit: (
            <>
              L / R = 8000 / 1 000 000 000 s = 8 mikrosekunder. Med stopp og vent sender avsenderen
              altså i 8 mikrosekunder og venter i 30 millisekunder. Lenken brukes 0,027 % av tiden.
            </>
          ),
        }),
        visual("po-7-utnyttelse", "Utnyttelse", {
          ledetekst: (
            <>
              Utnyttelsen er andelen av tiden avsenderen faktisk sender: sendetid delt på sendetid
              pluss tur-retur-tid.
            </>
          ),
          Viz: UtilizationCalc,
          hint: "Prøv en kortere tur-retur-tid og en tregere lenke, og se når stopp og vent ikke er så verst.",
        }),
        sjekk("po-8-sjekk", "Hvilket verktøy?", {
          sporsmal: (
            <>
              En pakke kommer fram to ganger fordi kvitteringen ble borte. Hva gjør at mottakeren
              ikke leverer den to ganger?
            </>
          ),
          valg: [
            {
              tekst: "Sjekksummen",
              hvorfor: "Begge kopiene er uskadde, så sjekksummen stemmer for begge.",
            },
            {
              tekst: "Sekvensnummeret",
              riktig: true,
              hvorfor: "Samme nummer som sist betyr kopi.",
            },
            { tekst: "Tidsuret", hvorfor: "Tidsuret er det som skapte kopien." },
          ],
          fasit: (
            <>Sekvensnummeret. Tidsuret løser tap, og sekvensnummeret rydder opp i bivirkningen.</>
          ),
        }),
        recall("po-9-recall", [
          {
            forside: "Hvilke fire mekanismer trengs for pålitelig overføring?",
            bakside: "Sjekksum, kvittering, sekvensnummer og tidsur.",
          },
          {
            forside: "Hva løser sekvensnummeret?",
            bakside: "Det lar mottakeren kjenne igjen og kaste kopier, og holde rekkefølgen.",
          },
          {
            forside: "Hvorfor er stopp og vent ineffektivt på en rask lenke med lang vei?",
            bakside:
              "Avsenderen sender i noen mikrosekunder og venter hele tur-retur-tiden før neste pakke.",
          },
        ]),
        oppsummering("po-10-opp", {
          punkter: [
            "Sjekksum oppdager skade, kvittering melder tilbake.",
            "Sekvensnummer fjerner kopier, tidsur oppdager tap.",
            "Stopp og vent er riktig, men lar lenken stå tom nesten hele tiden.",
          ],
          videre: "Neste undertema: å sende mange pakker før kvitteringene kommer.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "samleband",
      tittel: "Samlebånd: Go-Back-N og selektiv gjentakelse",
      utbytte:
        "Du kan forklare hva et sendevindu er, og forskjellen på de to måtene å rydde opp etter et tap.",
      byggerPa: ["palitelig-overforing"],
      skjermer: [
        intro("sb-1-intro", "Ikke vent på hver kvittering", {
          ingress: (
            <>
              Løsningen på den dårlige utnyttelsen er å ha flere pakker underveis samtidig. Det
              kalles <Term>samlebånd</Term>, på engelsk pipelining.
            </>
          ),
          punkter: [
            "Sekvensnumrene må ha flere verdier enn 0 og 1.",
            "Avsender, og kanskje mottaker, må mellomlagre pakker.",
          ],
        }),
        konsept("sb-2-vindu", "Sendevinduet", {
          ingress: (
            <>
              Avsenderen får ha høyst N pakker ute uten kvittering. De N numrene kalles{" "}
              <Term>vinduet</Term>.
            </>
          ),
          punkter: [
            "Når den eldste pakken blir kvittert, glir vinduet ett hakk fram.",
            "Da kan en ny pakke sendes.",
            "Større vindu gir bedre utnyttelse, men mer å rydde opp i ved tap.",
          ],
        }),
        konsept("sb-3-gbn", "Go-Back-N", {
          ingress: <>Den enkle varianten. Mottakeren tar bare imot pakker i riktig rekkefølge.</>,
          punkter: [
            <>
              Kvitteringen er <Term>kumulativ</Term>: «jeg har alt til og med nummer n».
            </>,
            "En pakke som kommer utenfor tur blir kastet.",
            "Ved tidsavbrudd sender avsenderen den tapte pakken og alle etter den på nytt.",
          ],
          merk: <>Ett tap kan altså koste et helt vindu med omsendinger.</>,
        }),
        konsept("sb-4-sr", "Selektiv gjentakelse", {
          ingress: <>Den grundige varianten. Mottakeren tar vare på alt som kommer fram.</>,
          punkter: [
            "Hver pakke kvitteres for seg.",
            "Pakker utenfor tur mellomlagres til hullet er fylt.",
            "Avsenderen sender bare de pakkene som mangler kvittering, med ett tidsur per pakke.",
          ],
          merk: <>Færre omsendinger, men mer bokføring i begge ender.</>,
        }),
        visual("sb-5-vindu", "Se vinduet gli", {
          Viz: TcpSlidingWindow,
          hint: "Følg med på hvilke numre som er sendt, kvittert og ventende, og hva som skjer med vinduet når en kvittering kommer.",
        }),
        sjekk("sb-6-sjekk", "Hva sendes på nytt?", {
          sporsmal: (
            <>
              Vinduet er 4. Pakke 0, 1, 2 og 3 sendes, og pakke 1 går tapt. Hvilke pakker sendes på
              nytt med Go-Back-N?
            </>
          ),
          valg: [
            { tekst: "Bare 1", hvorfor: "Det er selektiv gjentakelse." },
            {
              tekst: "1, 2 og 3",
              riktig: true,
              hvorfor: "Mottakeren kastet 2 og 3 fordi de kom utenfor tur.",
            },
            { tekst: "0, 1, 2 og 3", hvorfor: "Pakke 0 kom fram og ble kvittert." },
          ],
          fasit: <>1, 2 og 3. Med selektiv gjentakelse hadde bare pakke 1 blitt sendt på nytt.</>,
        }),
        recall("sb-7-recall", [
          {
            forside: "Hva er en kumulativ kvittering?",
            bakside: "En kvittering som sier at alt til og med et gitt nummer er mottatt.",
          },
          {
            forside: "Hva gjør Go-Back-N ved et tap?",
            bakside: "Sender den tapte pakken og alle senere pakker i vinduet på nytt.",
          },
          {
            forside: "Hva gjør selektiv gjentakelse annerledes?",
            bakside:
              "Mottakeren mellomlagrer pakker utenfor tur og kvitterer hver for seg, så bare den tapte sendes på nytt.",
          },
        ]),
        oppsummering("sb-8-opp", {
          punkter: [
            "Samlebånd lar flere pakker være underveis samtidig.",
            "Vinduet begrenser hvor mange.",
            "Go-Back-N er enkel og sløser. Selektiv gjentakelse er sparsom og krever mer minne.",
          ],
          videre: "Neste undertema: hvordan TCP setter disse ideene sammen.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "tcp-forbindelsen",
      tittel: "TCP: forbindelse, numre og omsending",
      utbytte:
        "Du kan regne ut sekvens- og kvitteringsnumre, tegne treveis håndtrykk og forklare rask omsending.",
      byggerPa: ["samleband"],
      skjermer: [
        intro("tc-1-intro", "TCP teller byte", {
          ingress: (
            <>
              <Term>TCP</Term> (Transmission Control Protocol) bruker alle verktøyene fra de to
              forrige undertemaene. Én ting er annerledes enn i modellene: TCP nummererer ikke
              pakker, men byte.
            </>
          ),
        }),
        konsept("tc-2-numre", "Sekvensnummer og kvitteringsnummer", {
          ingress: <>Dataene ses som en lang strøm av byte.</>,
          punkter: [
            <>
              <Term>Sekvensnummeret</Term> er nummeret på den første byten i segmentet.
            </>,
            <>
              <Term>Kvitteringsnummeret</Term> er nummeret på den neste byten mottakeren venter på.
            </>,
            "Kvitteringen er kumulativ: alt før dette nummeret er mottatt.",
          ],
        }),
        tallanslag("tc-3-regn", "Hvilket kvitteringsnummer?", {
          sporsmal: (
            <>
              Et segment har sekvensnummer 100 og inneholder 50 byte data. Alt kommer fram. Hvilket
              kvitteringsnummer sender mottakeren tilbake?
            </>
          ),
          fasitTall: 150,
          fasit: (
            <>
              150. Segmentet dekket byte 100 til 149, så den neste byten mottakeren venter på er
              nummer 150.
            </>
          ),
        }),
        konsept("tc-4-handtrykk", "Treveis håndtrykk", {
          ingress: <>Før data sendes blir de to endene enige om startnumre.</>,
          punkter: [
            <>
              Klienten sender et segment med <Term>SYN</Term>-flagget og sitt startnummer.
            </>,
            <>
              Tjeneren svarer med <Term>SYN</Term> og <Term>ACK</Term>: sitt eget startnummer og
              kvittering på klientens.
            </>,
            <>
              Klienten kvitterer med <Term>ACK</Term>. Dette segmentet kan allerede ha data med seg.
            </>,
          ],
          merk: <>Det er dette håndtrykket som kostet én tur-retur-tid i HTTP-regnestykkene.</>,
        }),
        visual("tc-5-diagram", "Håndtrykket tegnet opp", {
          Viz: TcpHandshakeDiagram,
          hint: "Følg sekvens- og kvitteringsnumrene gjennom de tre segmentene.",
        }),
        konsept("tc-6-tidsur", "Hvor lenge skal TCP vente?", {
          ingress: (
            <>For kort tidsur gir unødvendige omsendinger. For langt gir treg reaksjon på tap.</>
          ),
          punkter: [
            "TCP måler tur-retur-tiden fortløpende.",
            "Den holder et glidende gjennomsnitt der nye målinger teller litt og gamle mye.",
            "Tidsuret settes til gjennomsnittet pluss en margin som vokser når målingene spriker.",
          ],
          bihjelp: (
            <>
              Gjennomsnittet oppdateres slik: 0,875 ganger gammelt anslag pluss 0,125 ganger ny
              måling.
            </>
          ),
        }),
        konsept("tc-7-rask", "Rask omsending", {
          ingress: <>TCP trenger ikke alltid vente på tidsuret for å forstå at noe er borte.</>,
          punkter: [
            "Når et segment mangler, kvitterer mottakeren for det samme nummeret hver gang et senere segment kommer.",
            <>
              Tre slike like kvitteringer på rad kalles <Term>tre duplikate ACK</Term>.
            </>,
            "Avsenderen sender da det manglende segmentet med en gang.",
          ],
        }),
        konsept("tc-8-lukke", "Å legge på", {
          ingress: <>Hver retning lukkes for seg.</>,
          punkter: [
            <>
              Den som er ferdig sender et segment med <Term>FIN</Term>-flagget.
            </>,
            "Den andre siden kvitterer, og sender sin egen FIN når den også er ferdig.",
            "Den får en kvittering tilbake, og forbindelsen er borte.",
          ],
        }),
        sjekk("tc-9-sjekk", "Hva betyr tre like kvitteringer?", {
          sporsmal: <>Avsenderen får kvitteringsnummer 2000 fire ganger på rad. Hva har skjedd?</>,
          valg: [
            {
              tekst: "Segmentet som starter på byte 2000 mangler, men senere segmenter kommer fram",
              riktig: true,
              hvorfor: "Hvert senere segment utløser en ny kvittering for det samme hullet.",
            },
            {
              tekst: "Mottakeren har fått byte 2000 fire ganger",
              hvorfor: "Kvitteringsnummeret er byten mottakeren venter på, ikke den den fikk.",
            },
            {
              tekst: "Forbindelsen er lukket",
              hvorfor: "Lukking skjer med FIN, ikke med gjentatte kvitteringer.",
            },
          ],
          fasit: (
            <>
              Den første er en vanlig kvittering og de tre neste er duplikater. Avsenderen sender
              segmentet fra byte 2000 på nytt uten å vente på tidsuret.
            </>
          ),
        }),
        recall("tc-10-recall", [
          {
            forside: "Hva betyr sekvensnummeret og kvitteringsnummeret i TCP?",
            bakside:
              "Sekvensnummeret er første byte i segmentet. Kvitteringsnummeret er neste byte mottakeren venter på.",
          },
          {
            forside: "Hvilke tre segmenter utgjør treveis håndtrykk?",
            bakside: "SYN, SYN med ACK, og ACK.",
          },
          {
            forside: "Hva utløser rask omsending?",
            bakside: "Tre duplikate kvitteringer for samme nummer.",
          },
        ]),
        oppsummering("tc-11-opp", {
          punkter: [
            "TCP nummererer byte og kvitterer kumulativt.",
            "Forbindelsen åpnes med tre segmenter og lukkes med FIN i hver retning.",
            "Tap oppdages med tidsur eller tre duplikate kvitteringer.",
          ],
          videre: "Neste undertema: to grunner til å bremse.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "flyt-og-metning",
      tittel: "Flytkontroll og metningskontroll",
      utbytte:
        "Du kan skille de to bremsene i TCP, og følge metningsvinduet gjennom sakte start, metningsunngåelse og tap.",
      byggerPa: ["tcp-forbindelsen", "fire-forsinkelser"],
      skjermer: [
        intro("fm-1-intro", "To grunner til å bremse", {
          ingress: (
            <>
              En avsender kan sende for fort på to måter: fortere enn mottakeren klarer å ta unna,
              eller fortere enn nettet klarer å frakte. TCP har én brems for hver.
            </>
          ),
        }),
        konsept("fm-2-flyt", "Flytkontroll: ikke drukne mottakeren", {
          ingress: <>Mottakeren har et buffer der data ligger til programmet leser dem.</>,
          punkter: [
            <>
              I hvert segment oppgir mottakeren hvor mye ledig plass den har:{" "}
              <Term>mottaksvinduet</Term>, forkortet <Kodelinje>rwnd</Kodelinje> (receive window).
            </>,
            "Avsenderen har aldri mer ukvittert data ute enn det tallet.",
            "Er vinduet null, stopper avsenderen og spør med jevne mellomrom om det har åpnet seg.",
          ],
        }),
        konsept("fm-3-metning", "Metning: for mye i nettet", {
          ingress: (
            <>
              <Term>Metning</Term> (congestion) er når ruterne får inn mer enn de klarer å sende ut.
              Køene vokser, forsinkelsen stiger og pakker kastes.
            </>
          ),
          punkter: [
            "Ingen ruter forteller avsenderen hvor mye plass det er.",
            "TCP må gjette ut fra det den ser selv.",
            "Et tap tolkes som et tegn på at nettet er fullt.",
          ],
        }),
        konsept("fm-4-cwnd", "Metningsvinduet", {
          ingress: (
            <>
              Avsenderen holder et eget tall, <Term>metningsvinduet</Term>, forkortet{" "}
              <Kodelinje>cwnd</Kodelinje> (congestion window).
            </>
          ),
          punkter: [
            "Mengden ukvittert data er aldri større enn det minste av cwnd og rwnd.",
            "Går det bra, økes cwnd.",
            "Oppdages et tap, senkes cwnd.",
          ],
          bihjelp: (
            <>
              Vinduet måles i segmenter av største størrelse, forkortet <Term>MSS</Term> (maximum
              segment size).
            </>
          ),
        }),
        konsept("fm-5-sakte", "Sakte start", {
          ingress: <>Navnet lurer. Starten er lav, men veksten er rask.</>,
          punkter: [
            "cwnd begynner på 1 MSS.",
            "For hver kvittering økes cwnd med 1 MSS.",
            "Det gir en dobling for hver tur-retur-tid: 1, 2, 4, 8, 16.",
          ],
        }),
        tallanslag("fm-6-regn", "Hvor stort er vinduet?", {
          sporsmal: (
            <>
              En forbindelse begynner i sakte start med cwnd på 1 MSS. Ingen tap. Hvor stort er cwnd
              etter fem tur-retur-tider, målt i MSS?
            </>
          ),
          enhet: "MSS",
          fasitTall: 32,
          fasit: <>1 → 2 → 4 → 8 → 16 → 32. Fem doblinger gir 32 MSS.</>,
        }),
        konsept("fm-7-unngaelse", "Metningsunngåelse", {
          ingress: (
            <>
              Dobling kan ikke fortsette. Når cwnd når en terskel, forkortet{" "}
              <Kodelinje>ssthresh</Kodelinje> (slow start threshold), går TCP over til forsiktig
              vekst.
            </>
          ),
          punkter: [
            "Over terskelen økes cwnd med bare 1 MSS for hver tur-retur-tid.",
            "Veksten er lineær i stedet for eksponentiell.",
            "Slik prøver TCP seg sakte fram mot grensen.",
          ],
        }),
        konsept("fm-8-tap", "Når et tap oppdages", {
          ingress: <>Reaksjonen avhenger av hvordan tapet ble oppdaget.</>,
          punkter: [
            "Tidsavbrudd: terskelen settes til halve cwnd, cwnd settes til 1 MSS, og sakte start begynner på nytt.",
            "Tre duplikate kvitteringer: terskelen settes til halve cwnd, og cwnd halveres. Deretter lineær vekst.",
          ],
          merk: (
            <>
              Tre duplikater betyr at pakker fortsatt kommer fram, så nettet er ikke helt tett.
              Derfor er reaksjonen mildere. Varianten heter TCP Reno.
            </>
          ),
        }),
        visual("fm-9-sim", "Sagtannkurven", {
          Viz: CongestionWindowSim,
          hint: "Utløs et tap og se hvordan vinduet faller og bygger seg opp igjen. Legg merke til formen på kurven.",
        }),
        konsept("fm-10-aimd", "Øk litt, kutt mye", {
          ingress: (
            <>
              Mønsteret med lineær økning og halvering kalles additiv økning, multiplikativ
              reduksjon, forkortet <Term>AIMD</Term>.
            </>
          ),
          punkter: [
            "Det gir sagtannkurven du nettopp så.",
            "To forbindelser som deler en flaskehals og begge følger regelen, ender med omtrent like mye hver.",
            "UDP følger ingen slik regel og kan ta plass fra TCP-forbindelser.",
          ],
        }),
        sjekk("fm-11-sjekk", "Hvilken brems?", {
          sporsmal: (
            <>
              Mottakerens program leser sakte, og bufferet fylles opp. Nettet mellom dem er nesten
              tomt. Hvilken mekanisme bremser avsenderen?
            </>
          ),
          valg: [
            {
              tekst: "Flytkontroll, gjennom mottaksvinduet",
              riktig: true,
              hvorfor: "Mottakeren melder mindre ledig plass, og avsenderen holder seg under det.",
            },
            {
              tekst: "Metningskontroll, gjennom metningsvinduet",
              hvorfor: "Metningsvinduet reagerer på tap i nettet, og her er det ingen.",
            },
          ],
          fasit: <>Flytkontroll beskytter mottakeren. Metningskontroll beskytter nettet.</>,
        }),
        recall("fm-12-recall", [
          {
            forside: "Hva er forskjellen på flytkontroll og metningskontroll?",
            bakside:
              "Flytkontroll hindrer at mottakerens buffer flyter over. Metningskontroll hindrer at nettet overbelastes.",
          },
          {
            forside: "Hvordan vokser cwnd i sakte start og i metningsunngåelse?",
            bakside:
              "Sakte start: dobles hver tur-retur-tid. Metningsunngåelse: øker med 1 MSS hver tur-retur-tid.",
          },
          {
            forside: "Hva skjer med cwnd ved tidsavbrudd og ved tre duplikate kvitteringer?",
            bakside:
              "Tidsavbrudd: cwnd til 1 MSS. Tre duplikater: cwnd halveres. I begge tilfeller settes terskelen til halve cwnd.",
          },
          {
            forside: "Hva står AIMD for?",
            bakside: "Additiv økning, multiplikativ reduksjon: øk lineært, halver ved tap.",
          },
        ]),
        oppsummering("fm-13-opp", {
          punkter: [
            "rwnd beskytter mottakeren, cwnd beskytter nettet.",
            "Sakte start dobler, metningsunngåelse legger til én.",
            "Tap halverer eller nullstiller vinduet, og det gir sagtannkurven.",
          ],
          videre: "Neste emne: nettverkslaget, der pakkene finner veien.",
        }),
      ],
    },
  ],
};
