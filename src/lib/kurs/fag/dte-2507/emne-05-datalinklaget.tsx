// Emne 5 — Datalinklaget.
// Pensum: Canvas modul 5 «Datalinklaget», Kurose & Ross kap. 6.
// Bygger på emne 1 (ramme, MAC mot IP), emne 4 (subnett, ruter, DHCP) og
// emne 2–3 (DNS, HTTP, TCP) for sammenstillingen til slutt.
// Rekkefølge: hva linklaget gjør → oppdage feil → dele en kanal → adresser og
// ARP → Ethernet og svitsjer → hele reisen til en nettside.

import type { Emne } from "@/lib/kurs/types";
import {
  anslag,
  intro,
  konsept,
  oppsummering,
  recall,
  sjekk,
  tallanslag,
  visual,
} from "../dte-2505/byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { CrcDivider } from "@/components/stack/dte2507-crc-kalkulator/CrcDivider";
import { AlohaSimulator } from "@/components/stack/dte2507-aloha-kasino/AlohaSimulator";
import { ArpVisualizer } from "@/components/stack/dte2507-arp-detektiv/ArpVisualizer";
import { SwitchSim } from "@/components/stack/dte2507-switch-self-learning/SwitchSim";
import { HexDecoder } from "@/components/stack/dte2507-paket-dekoding/HexDecoder";

export const emneDatalinklaget: Emne = {
  slug: "datalinklaget",
  tittel: "Datalinklaget",
  sporsmal: "Hva skjer på den ene kabelen mellom to naboer?",
  pensum: "Canvas modul 5 — Datalinklaget · Kurose & Ross kap. 6",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "linklaget-og-feil",
      tittel: "Linklaget og feildeteksjon",
      utbytte:
        "Du kan si hva linklaget har ansvar for, og regne ut en paritetsbit og resten i en CRC-divisjon.",
      byggerPa: ["lag-og-innkapsling"],
      skjermer: [
        intro("lf-1-intro", "Ett hopp om gangen", {
          ingress: (
            <>
              Nettverkslaget finner veien gjennom mange nett. Linklaget har en mye mindre jobb: få
              én ramme over én lenke, fra en node til naboen.
            </>
          ),
          bihjelp: (
            <>
              En reise fra Narvik til Roma går med buss, fly og tog. Reisebyrået planlegger hele
              turen. Hvert transportmiddel tar seg av sin strekning. Linklaget er transportmiddelet.
            </>
          ),
        }),
        konsept("lf-2-tjenester", "Hva linklaget gjør", {
          ingress: (
            <>Linklaget ligger for det meste i nettverkskortet, en egen brikke i maskinen.</>
          ),
          punkter: [
            <>
              <Term>Innramming</Term> — pakke datagrammet i en ramme med hode og hale.
            </>,
            <>
              <Term>Tilgang til lenken</Term> — avgjøre når det er lov å sende når flere deler
              kanalen.
            </>,
            <>
              <Term>Feildeteksjon</Term> — oppdage om bit ble endret av støy.
            </>,
          ],
        }),
        konsept("lf-3-paritet", "Den enkleste sjekken: paritet", {
          ingress: <>Avsenderen legger til én ekstra bit slik at antall enere blir et partall.</>,
          punkter: [
            "Mottakeren teller enerne.",
            "Oddetall betyr at noe er galt.",
            "Blir to bit endret samtidig, går det upåaktet hen.",
          ],
          merk: (
            <>Paritet oppdager alle feil i et odde antall bit, og ingen feil i et like antall.</>
          ),
        }),
        tallanslag("lf-4-paritet", "Hvilken paritetsbit?", {
          sporsmal: (
            <>
              Dataene er <Kodelinje>1011001</Kodelinje>. Med like paritet, hvilken bit legges til: 0
              eller 1?
            </>
          ),
          fasitTall: 0,
          fasit: <>Dataene har fire enere, som allerede er et partall. Paritetsbiten blir 0.</>,
        }),
        konsept("lf-5-crc", "CRC: divisjon med rest", {
          ingress: (
            <>
              Linklaget bruker en sterkere metode, <Term>syklisk redundanssjekk</Term>, forkortet{" "}
              <Term>CRC</Term>.
            </>
          ),
          punkter: [
            <>
              Avsender og mottaker er enige om et bitmønster, generatoren <Kodelinje>G</Kodelinje>,
              med r + 1 bit.
            </>,
            "Avsenderen henger r nuller bak dataene og deler på G.",
            "Resten etter divisjonen, r bit, sendes med i stedet for nullene.",
            "Mottakeren deler det hele på G. Er resten null, er rammen godkjent.",
          ],
          bihjelp: (
            <>
              Divisjonen bruker regning uten mente og uten lån. Da er både addisjon og subtraksjon
              det samme som XOR: like bit gir 0, ulike gir 1.
            </>
          ),
        }),
        visual("lf-6-crc", "Del steg for steg", {
          Viz: CrcDivider,
          hint: "Følg XOR-stegene nedover og se hvordan resten blir stående igjen til slutt.",
        }),
        sjekk("lf-7-sjekk", "Hvor mange bit?", {
          sporsmal: (
            <>
              Generatoren er <Kodelinje>1001</Kodelinje>. Hvor mange CRC-bit legges til rammen?
            </>
          ),
          valg: [
            {
              tekst: "2",
              hvorfor: "Resten har én bit færre enn generatoren, og generatoren har fire.",
            },
            { tekst: "3", riktig: true, hvorfor: "Generatoren har r + 1 = 4 bit, så r = 3." },
            { tekst: "4", hvorfor: "Fire er lengden på generatoren, ikke på resten." },
          ],
          fasit: <>Tre. En generator på r + 1 bit gir alltid en rest på r bit.</>,
        }),
        recall("lf-8-recall", [
          {
            forside: "Hva er linklagets jobb?",
            bakside:
              "Å få en ramme over én lenke til nabonoden: innramming, tilgang til lenken og feildeteksjon.",
          },
          {
            forside: "Hva oppdager en enkel paritetsbit?",
            bakside: "Feil i et odde antall bit.",
          },
          {
            forside: "Hvordan lager avsenderen CRC-bitene?",
            bakside:
              "Henger r nuller bak dataene, deler på generatoren med XOR-regning, og sender resten.",
          },
        ]),
        oppsummering("lf-9-opp", {
          punkter: [
            "Linklaget frakter rammer mellom naboer.",
            "Paritet er enkel og svak. CRC er standarden.",
            "CRC er en divisjon der resten sendes med.",
          ],
          videre: "Neste undertema: hva som skjer når flere vil sende samtidig.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "flertilgang",
      tittel: "Å dele en kanal",
      utbytte:
        "Du kan plassere en protokoll i en av tre familier, og forklare hvordan ALOHA og CSMA/CD håndterer kollisjoner.",
      byggerPa: ["linklaget-og-feil"],
      skjermer: [
        intro("ft-1-intro", "Alle snakker i samme rom", {
          ingress: (
            <>
              På et trådløst nett, eller en gammeldags delt kabel, hører alle hverandre. Sender to
              samtidig, blandes signalene og begge rammene er ødelagt. Det kalles en{" "}
              <Term>kollisjon</Term>.
            </>
          ),
          merk: <>Reglene for hvem som får sende når, kalles en flertilgangsprotokoll.</>,
        }),
        konsept("ft-2-familier", "Tre familier", {
          ingress: <>Alle løsningene faller i én av tre grupper.</>,
          punkter: [
            <>
              <Term>Kanaldeling</Term> — del kanalen i faste biter, én til hver. I tid (TDMA) eller
              i frekvens (FDMA).
            </>,
            <>
              <Term>Tilfeldig tilgang</Term> — send når du vil, og rydd opp etter kollisjoner.
            </>,
            <>
              <Term>Etter tur</Term> — en sjef spør hver node etter tur, eller et sendetegn går på
              rundgang.
            </>,
          ],
          merk: (
            <>
              Kanaldeling sløser når få har noe å sende. Tilfeldig tilgang sløser når mange har det.
            </>
          ),
        }),
        konsept("ft-3-aloha", "ALOHA", {
          ingress: (
            <>
              Den første protokollen med tilfeldig tilgang, laget for radio mellom øyene på Hawaii.
            </>
          ),
          punkter: [
            "Tiden deles i luker, og en ramme fyller nøyaktig én luke.",
            "Har du en ramme, send den i neste luke.",
            "Blir det kollisjon, send på nytt i hver følgende luke med sannsynlighet p.",
          ],
          merk: (
            <>
              Denne varianten heter luke-ALOHA. Uten luker, ren ALOHA, kan rammer kollidere
              halvveis.
            </>
          ),
        }),
        anslag("ft-4-anslag", "Hvor effektivt?", {
          sporsmal: (
            <>
              Mange noder bruker luke-ALOHA med best mulig valg av p. Hvor stor andel av lukene
              inneholder en vellykket sending?
            </>
          ),
          valg: [
            { tekst: "Rundt 90 %" },
            { tekst: "Rundt 60 %" },
            { tekst: "Rundt 37 %" },
            { tekst: "Rundt 5 %" },
          ],
          fasit: (
            <>
              Rundt 37 %, nærmere bestemt 1/e. Resten av lukene er tomme eller har kollisjon. Ren
              ALOHA klarer bare halvparten, rundt 18 %.
            </>
          ),
        }),
        visual("ft-5-sim", "Prøv selv", {
          Viz: AlohaSimulator,
          hint: "Endre antall noder og sannsynligheten for å sende, og se når andelen vellykkede luker er høyest.",
        }),
        konsept("ft-6-csma", "Lytt før du snakker", {
          ingress: (
            <>
              ALOHA sender uten å sjekke. <Term>CSMA</Term> (carrier sense multiple access) lytter
              først.
            </>
          ),
          punkter: [
            "Er kanalen opptatt, vent.",
            "Er den ledig, send.",
            "Kollisjoner kan likevel skje, fordi signalet bruker tid på å nå fram. To noder kan begge høre stillhet og begynne samtidig.",
          ],
        }),
        konsept("ft-7-cd", "Stopp når det smeller", {
          ingress: (
            <>
              Kablet Ethernet la til én ting: lytt også mens du sender. Varianten heter{" "}
              <Term>CSMA/CD</Term>, der CD står for collision detection.
            </>
          ),
          punkter: [
            "Oppdager du en kollisjon, avbryt sendingen med en gang.",
            "Vent en tilfeldig tid før du prøver igjen.",
            "For hver ny kollisjon med samme ramme dobles intervallet du trekker ventetiden fra.",
          ],
          merk: (
            <>
              Doblingen kalles binær eksponentiell tilbaketrekking. Den tilpasser seg selv til hvor
              mange som slåss om kanalen.
            </>
          ),
        }),
        sjekk("ft-8-sjekk", "Hvilken familie?", {
          sporsmal: (
            <>
              En basestasjon spør hver enhet etter tur om den har noe å sende. Hvilken familie er
              det?
            </>
          ),
          valg: [
            {
              tekst: "Kanaldeling",
              hvorfor: "Da hadde hver enhet hatt en fast luke uansett behov.",
            },
            { tekst: "Tilfeldig tilgang", hvorfor: "Da hadde enhetene sendt uten å bli spurt." },
            {
              tekst: "Etter tur",
              riktig: true,
              hvorfor: "Spørrerunde er den ene av de to etter-tur-metodene.",
            },
          ],
          fasit: (
            <>
              Etter tur. Ingen kollisjoner og ingen tomme faste luker, men alt stopper hvis sjefen
              faller ut.
            </>
          ),
        }),
        recall("ft-9-recall", [
          {
            forside: "Hvilke tre familier av flertilgangsprotokoller finnes?",
            bakside: "Kanaldeling, tilfeldig tilgang og etter tur.",
          },
          {
            forside: "Hva er den høyeste effektiviteten til luke-ALOHA?",
            bakside: "Omtrent 37 %, 1/e.",
          },
          {
            forside: "Hva gjør CSMA/CD når en kollisjon oppdages?",
            bakside:
              "Avbryter sendingen, venter en tilfeldig tid, og dobler intervallet for hver ny kollisjon.",
          },
        ]),
        oppsummering("ft-10-opp", {
          punkter: [
            "En delt kanal trenger regler for hvem som sender.",
            "ALOHA sender blindt, CSMA lytter først, CSMA/CD stopper ved kollisjon.",
          ],
          videre: "Neste undertema: adressene i linklaget.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "mac-og-arp",
      tittel: "MAC-adresser og ARP",
      utbytte:
        "Du kan forklare hvorfor vi har to slags adresser, og hvordan en maskin finner MAC-adressen til en nabo.",
      byggerPa: ["lag-og-innkapsling", "ipv4-og-subnett"],
      skjermer: [
        intro("ma-1-intro", "To adresser på samme maskin", {
          ingress: (
            <>
              Du så i første emne at IP-adressene står stille mens MAC-adressene byttes for hvert
              hopp. Nå ser vi på hva en MAC-adresse er, og hvordan avsenderen finner den riktige.
            </>
          ),
        }),
        konsept("ma-2-mac", "MAC-adressen", {
          ingress: (
            <>
              En <Term>MAC-adresse</Term> (medium access control) er linklagets adresse. Den ligger
              i nettverkskortet.
            </>
          ),
          punkter: [
            <>
              48 bit, skrevet som seks heksadesimale par: <Kodelinje>1A-2F-BB-76-09-AD</Kodelinje>.
            </>,
            "Den følger kortet, uansett hvilket nett du kobler deg til.",
            <>
              Adressen med bare enere, <Kodelinje>FF-FF-FF-FF-FF-FF</Kodelinje>, betyr «til alle på
              lenken»: <Term>kringkasting</Term>.
            </>,
          ],
          bihjelp: (
            <>
              MAC-adressen er som fødselsnummeret ditt: det følger deg. IP-adressen er som
              postadressen: den avhenger av hvor du bor.
            </>
          ),
        }),
        konsept("ma-3-arp", "ARP: hvem har denne adressen?", {
          ingress: (
            <>
              Avsenderen kjenner mottakerens IP-adresse, men rammen trenger en MAC-adresse.{" "}
              <Term>ARP</Term> (Address Resolution Protocol) oversetter.
            </>
          ),
          punkter: [
            "Avsenderen kringkaster: «hvem har IP-adresse 10.0.0.7?»",
            "Alle på lenken hører spørsmålet. Bare eieren svarer, med sin MAC-adresse.",
            "Svaret lagres i en ARP-tabell med en levetid på noen minutter.",
          ],
        }),
        visual("ma-4-viz", "Se spørsmål og svar", {
          Viz: ArpVisualizer,
          hint: "Følg spørsmålet ut til alle og svaret tilbake til én, og se hva som havner i ARP-tabellen.",
        }),
        konsept("ma-5-ut", "Når mottakeren er i et annet subnett", {
          ingress: <>ARP virker bare innenfor et subnett. Kringkastingen stopper ved ruteren.</>,
          punkter: [
            "Avsenderen ser på prefikset at mottakeren er utenfor.",
            "Da sendes rammen til standardruteren, med ruterens MAC-adresse som mål.",
            "IP-adressen i datagrammet er fortsatt den endelige mottakeren.",
            "Ruteren lager en ny ramme for neste lenke, med nye MAC-adresser.",
          ],
        }),
        sjekk("ma-6-sjekk", "Hvilken MAC-adresse?", {
          sporsmal: (
            <>
              Laptopen din sender til en tjener i et annet land. Hvilken MAC-adresse står som
              mottaker i rammen som forlater laptopen?
            </>
          ),
          valg: [
            {
              tekst: "Tjenerens",
              hvorfor: "Laptopen kan ikke nå tjenerens nettverkskort direkte.",
            },
            {
              tekst: "Standardruterens",
              riktig: true,
              hvorfor: "Rammen går bare over den første lenken, og der er ruteren neste hopp.",
            },
            {
              tekst: "Kringkastingsadressen",
              hvorfor: "Den brukes til ARP-spørsmålet, ikke til selve dataene.",
            },
          ],
          fasit: <>Ruterens. MAC-adresser gjelder bare for lenken rammen er på.</>,
        }),
        recall("ma-7-recall", [
          {
            forside: "Hvor lang er en MAC-adresse, og hva er kringkastingsadressen?",
            bakside: "48 bit. Kringkastingsadressen er FF-FF-FF-FF-FF-FF.",
          },
          {
            forside: "Hva gjør ARP?",
            bakside:
              "Finner MAC-adressen som hører til en IP-adresse på samme subnett, ved å kringkaste et spørsmål.",
          },
          {
            forside: "Hvilken MAC-adresse brukes når mottakeren er i et annet subnett?",
            bakside: "Standardruterens. IP-adressen er fortsatt den endelige mottakerens.",
          },
        ]),
        oppsummering("ma-8-opp", {
          punkter: [
            "MAC-adressen følger kortet og gjelder én lenke.",
            "ARP kobler IP-adresse til MAC-adresse innenfor et subnett.",
            "Trafikk ut av subnettet rammes inn til ruteren.",
          ],
          videre: "Neste undertema: Ethernet og boksen som kobler lenkene sammen.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "ethernet-og-svitsjer",
      tittel: "Ethernet og svitsjer",
      utbytte:
        "Du kan lese feltene i en Ethernet-ramme, forklare hvordan en svitsj lærer, og skille en svitsj fra en ruter.",
      byggerPa: ["mac-og-arp", "flertilgang"],
      skjermer: [
        intro("es-1-intro", "Standarden for kabel", {
          ingress: (
            <>
              Nesten alle kablede lokalnett bruker <Term>Ethernet</Term>. I dag går hver kabel fra
              én maskin til en svitsj, så maskinene deler ikke lenger en felles ledning.
            </>
          ),
        }),
        konsept("es-2-ramme", "Ethernet-rammen", {
          ingress: <>Feltene kommer i denne rekkefølgen.</>,
          punkter: [
            "Mottakerens MAC-adresse, 6 byte.",
            "Avsenderens MAC-adresse, 6 byte.",
            <>
              <Term>Type</Term>, 2 byte — hvilken protokoll som ligger inni. 0x0800 betyr IPv4,
              0x0806 betyr ARP.
            </>,
            "Data, fra 46 til 1500 byte.",
            "CRC, 4 byte.",
          ],
          merk: (
            <>Ethernet kvitterer ikke og sender ikke på nytt. En ramme med feil blir bare kastet.</>
          ),
        }),
        visual("es-3-hex", "Les en ramme fra rå byte", {
          Viz: HexDecoder,
          hint: "Finn mottakeradressen, avsenderadressen og typefeltet i begynnelsen av rammen.",
        }),
        konsept("es-4-svitsj", "Svitsjen", {
          ingress: (
            <>
              En <Term>svitsj</Term> tar imot rammer og sender dem ut på riktig port. Maskinene
              merker ikke at den finnes.
            </>
          ),
          punkter: [
            "Den har en svitsjetabell: MAC-adresse, port og tidspunkt.",
            "Tabellen er tom når svitsjen slås på.",
            "Ingen stiller den inn. Den lærer selv.",
          ],
        }),
        konsept("es-5-laering", "Slik lærer den", {
          ingress: <>Regelen er enkel og gjelder hver eneste ramme.</>,
          punkter: [
            "Les avsenderadressen og noter hvilken port rammen kom inn på.",
            "Slå opp mottakeradressen i tabellen.",
            "Finnes den: send rammen ut på den porten.",
            "Finnes den ikke: send rammen ut på alle porter unntatt den den kom fra.",
          ],
          merk: <>Det siste kalles oversvømming, på engelsk flooding.</>,
        }),
        visual("es-6-sim", "Lær opp en svitsj", {
          Viz: SwitchSim,
          hint: "Send noen rammer og følg med på når svitsjen oversvømmer og når den treffer riktig port med en gang.",
        }),
        konsept("es-7-mot-ruter", "Svitsj mot ruter", {
          ingress: <>Begge lagrer og videresender. Forskjellen er hvilket lag de leser.</>,
          punkter: [
            "Svitsjen leser MAC-adresser i linklaget. Ruteren leser IP-adresser i nettverkslaget.",
            "Svitsjen lærer selv. Ruteren trenger adresser og en rutingprotokoll.",
            "Svitsjen slipper kringkasting gjennom. Ruteren stopper den.",
          ],
        }),
        konsept("es-8-vlan", "Virtuelle lokalnett", {
          ingress: (
            <>
              Én svitsj kan deles i flere atskilte nett. Hvert av dem kalles et <Term>VLAN</Term>,
              virtual local area network.
            </>
          ),
          punkter: [
            "Hver port tilordnes et VLAN.",
            "Kringkasting når bare portene i samme VLAN.",
            "Trafikk mellom to VLAN må gå gjennom en ruter, akkurat som mellom to subnett.",
          ],
          merk: (
            <>
              Slik kan studenter og ansatte bruke de samme svitsjene uten å se hverandres trafikk.
            </>
          ),
        }),
        sjekk("es-9-sjekk", "Hva gjør svitsjen?", {
          sporsmal: (
            <>
              En ramme kommer inn på port 1 med avsender A og mottaker B. Tabellen er tom. Hva
              skjer?
            </>
          ),
          valg: [
            { tekst: "Rammen kastes", hvorfor: "En ukjent mottaker er ingen grunn til å kaste." },
            {
              tekst: "A noteres på port 1, og rammen sendes ut på alle andre porter",
              riktig: true,
              hvorfor: "Svitsjen lærer av avsenderen og oversvømmer for den ukjente mottakeren.",
            },
            {
              tekst: "B noteres på port 1",
              hvorfor: "Svitsjen lærer av avsenderadressen, ikke av mottakeradressen.",
            },
          ],
          fasit: <>Når B svarer, lærer svitsjen også hvor B er. Etter det går rammene rett.</>,
        }),
        recall("es-10-recall", [
          {
            forside: "Hvilke felt har en Ethernet-ramme?",
            bakside: "Mottakeradresse, avsenderadresse, type, data og CRC.",
          },
          {
            forside: "Hvordan fyller en svitsj tabellen sin?",
            bakside: "Den noterer avsenderadressen og porten for hver ramme som kommer inn.",
          },
          {
            forside: "Hva gjør en svitsj med en ramme til en ukjent mottaker?",
            bakside: "Sender den ut på alle porter unntatt den den kom inn på.",
          },
        ]),
        oppsummering("es-11-opp", {
          punkter: [
            "Ethernet-rammen bærer MAC-adresser, type, data og CRC.",
            "Svitsjen lærer av avsenderadresser og oversvømmer når den ikke vet.",
            "VLAN deler én svitsj i flere atskilte nett.",
          ],
          videre: "Neste undertema: alt du har lært, satt sammen i én reise.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "en-dag-i-livet",
      tittel: "En dag i livet til en nettsideforespørsel",
      utbytte:
        "Du kan liste protokollene som brukes fra du kobler til nettet til siden vises, i riktig rekkefølge og med grunn.",
      byggerPa: ["ethernet-og-svitsjer", "dhcp-og-nat", "dns", "tcp-forbindelsen", "http"],
      skjermer: [
        intro("dl-1-intro", "Alt på én gang", {
          ingress: (
            <>
              Du åpner laptopen på campus og skriver en adresse i nettleseren. Før siden vises har
              minst fem protokoller fra fire lag vært i sving. Vi tar dem i den rekkefølgen de
              trengs.
            </>
          ),
        }),
        konsept("dl-2-dhcp", "Steg 1: få en adresse", {
          ingress: <>Laptopen har ingen IP-adresse ennå.</>,
          punkter: [
            "Den kringkaster en DHCP-forespørsel, pakket i UDP, IP og en Ethernet-ramme.",
            "Svitsjen oversvømmer rammen og lærer samtidig hvor laptopen er.",
            "DHCP-tjeneren svarer med adresse, maske, standardruter og navnetjener.",
          ],
        }),
        konsept("dl-3-arp", "Steg 2: finn ruteren", {
          ingress: <>Navnetjeneren ligger i et annet subnett, så alt må ut via standardruteren.</>,
          punkter: [
            "Laptopen kjenner ruterens IP-adresse, men ikke MAC-adressen.",
            "Den kringkaster et ARP-spørsmål.",
            "Ruteren svarer, og laptopen kan lage rammer til den.",
          ],
        }),
        konsept("dl-4-dns", "Steg 3: slå opp navnet", {
          ingress: <>Nå kan laptopen spørre etter adressen til nettstedet.</>,
          punkter: [
            "DNS-spørsmålet sendes i UDP til den lokale navnetjeneren.",
            "Ruterne på veien bruker tabeller som OSPF og BGP har fylt ut.",
            "Svaret kommer tilbake med IP-adressen til nettjeneren.",
          ],
        }),
        konsept("dl-5-tcp", "Steg 4: koble til", {
          ingress: <>HTTP bruker TCP, så forbindelsen må opp først.</>,
          punkter: [
            "Laptopen sender SYN til nettjeneren, port 80.",
            "Tjeneren svarer med SYN og ACK.",
            "Laptopen kvitterer, og forbindelsen står.",
          ],
        }),
        konsept("dl-6-http", "Steg 5: hent siden", {
          ingress: <>Først nå sendes det brukeren ba om.</>,
          punkter: [
            "Nettleseren sender en GET-forespørsel gjennom sokkelen.",
            "Tjeneren svarer med 200 OK og innholdet.",
            "Nettleseren tegner siden, og henter eventuelle bilder på samme måte.",
          ],
        }),
        anslag("dl-7-anslag", "Hvor mange protokoller?", {
          sporsmal: (
            <>
              Hvor mange ulike protokoller ble nevnt i de fem stegene, medregnet de som jobber i
              bakgrunnen?
            </>
          ),
          valg: [{ tekst: "3" }, { tekst: "5" }, { tekst: "Rundt 10" }],
          fasit: (
            <>
              Rundt ti: DHCP, UDP, IP, Ethernet, ARP, DNS, OSPF, BGP, TCP og HTTP. Hver av dem løser
              ett avgrenset problem.
            </>
          ),
        }),
        sjekk("dl-8-sjekk", "Hva kommer først?", {
          sporsmal: <>Hvilken rekkefølge er riktig for en laptop som nettopp er koblet til?</>,
          valg: [
            {
              tekst: "DNS, DHCP, ARP, TCP, HTTP",
              hvorfor: "Uten adresse fra DHCP kan ikke laptopen sende noe DNS-spørsmål.",
            },
            {
              tekst: "DHCP, ARP, DNS, TCP, HTTP",
              riktig: true,
              hvorfor:
                "Adresse først, så ruterens MAC-adresse, så navnet, så forbindelsen, så siden.",
            },
            {
              tekst: "ARP, DHCP, TCP, DNS, HTTP",
              hvorfor: "TCP kan ikke kobles opp før DNS har gitt tjenerens adresse.",
            },
          ],
          fasit: <>Hvert steg gir det neste steget det mangler.</>,
        }),
        recall("dl-9-recall", [
          {
            forside:
              "Hvilke fem steg går en nettsideforespørsel gjennom fra en nytilkoblet maskin?",
            bakside:
              "DHCP for adresse, ARP for ruterens MAC-adresse, DNS for tjenerens adresse, TCP-håndtrykk, og HTTP-forespørsel.",
          },
          {
            forside: "Hvorfor trengs ARP før DNS-spørsmålet kan sendes?",
            bakside:
              "Navnetjeneren er utenfor subnettet, så rammen må adresseres til standardruterens MAC-adresse.",
          },
        ]),
        oppsummering("dl-10-opp", {
          punkter: [
            "Hver protokoll leverer det neste steget trenger.",
            "Lagene samarbeider uten å kjenne hverandres detaljer.",
          ],
          videre: "Neste emne: hva som endrer seg når kabelen blir borte.",
        }),
      ],
    },
  ],
};
