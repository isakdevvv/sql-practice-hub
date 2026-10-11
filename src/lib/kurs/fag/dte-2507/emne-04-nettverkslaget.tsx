// Emne 4 — Nettverkslaget.
// Pensum: Canvas modul 4 «Nettverkslaget», Kurose & Ross kap. 4 og 5.
// Bygger på emne 1 (ruter, datagram, kø) og emne 3 (porter, TCP).
// Rekkefølge: videresending mot ruting → inni ruteren → IPv4-adresser og
// subnett → DHCP og NAT → IPv6 → rutingalgoritmer → OSPF, BGP og ICMP.

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
import { LpmTrainer } from "@/components/stack/dte2507-ruting/LpmTrainer";
import { RoutingGraphSim } from "@/components/stack/dte2507-ruting/RoutingGraphSim";
import { SwitchFabricViz } from "@/components/stack/dte2507-inni-ruter/SwitchFabricViz";
import { HolBlockingSim } from "@/components/stack/dte2507-inni-ruter/HolBlockingSim";
import { SchedulerComparison } from "@/components/stack/dte2507-packet-scheduling/SchedulerComparison";
import { SubnetCalculator } from "@/components/stack/dte2507-subnetting/SubnetCalculator";
import { DhcpDoraFlow } from "@/components/stack/dte2507-dhcp/DhcpDoraFlow";
import { NatTableDemo } from "@/components/stack/dte2507-nat/NatTableDemo";
import { CountToInfinitySim } from "@/components/stack/dte2507-count-to-infinity/CountToInfinitySim";
import { BgpLadderSim } from "@/components/stack/dte2507-bgp-stige/BgpLadderSim";

export const emneNettverkslaget: Emne = {
  slug: "nettverkslaget",
  tittel: "Nettverkslaget",
  sporsmal: "Hvordan finner en pakke veien fra én maskin til en annen?",
  pensum: "Canvas modul 4 — Nettverkslaget · Kurose & Ross kap. 4 og 5",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "videresending-og-ruting",
      tittel: "Videresending og ruting",
      utbytte:
        "Du kan skille de to jobbene i nettverkslaget og slå opp en adresse i en videresendingstabell.",
      byggerPa: ["lag-og-innkapsling", "pakkesvitsjing"],
      skjermer: [
        intro("vr-1-intro", "To jobber, to tidsskalaer", {
          ingress: (
            <>
              Når du kjører til en by du ikke kjenner, gjør du to ting. I hvert kryss velger du
              avkjørsel. Før turen planla noen hele ruta. Nettverkslaget har de samme to jobbene.
            </>
          ),
        }),
        konsept("vr-2-to", "Videresending og ruting", {
          ingress: <>Ordene brukes om hverandre til daglig. I faget betyr de ulike ting.</>,
          punkter: [
            <>
              <Term>Videresending</Term> — flytte ett datagram fra en inngang til riktig utgang i én
              ruter. Skjer på nanosekunder, for hver pakke.
            </>,
            <>
              <Term>Ruting</Term> — bestemme hvilken vei pakker skal ta gjennom hele nettet. Skjer
              på sekunder, i bakgrunnen.
            </>,
          ],
          merk: (
            <>
              Delen av ruteren som videresender kalles <Term>dataplanet</Term>. Delen som regner ut
              veier kalles <Term>kontrollplanet</Term>.
            </>
          ),
        }),
        konsept("vr-3-tabell", "Videresendingstabellen", {
          ingress: <>Koblingen mellom de to jobbene er én tabell i hver ruter.</>,
          punkter: [
            "Ruting fyller ut tabellen.",
            "Videresending slår opp i den.",
            "Hver rad sier: adresser som begynner slik, skal ut på denne lenken.",
          ],
        }),
        konsept("vr-4-prefiks", "Lengste prefiks vinner", {
          ingress: (
            <>
              Tabellen har ikke én rad per adresse. Den har rader for adresseområder, angitt med de
              første bitene, kalt et <Term>prefiks</Term>.
            </>
          ),
          punkter: [
            "En adresse kan passe med flere rader samtidig.",
            <>
              Ruteren velger raden med flest sammenfallende bit: <Term>lengste prefiks-treff</Term>.
            </>,
            "Den mest spesifikke regelen går altså foran den generelle.",
          ],
          bihjelp: (
            <>
              Et brev til «Storgata 5, Narvik» sorteres etter Narvik selv om det også finnes en
              regel for «alt til Norge».
            </>
          ),
        }),
        visual("vr-5-lpm", "Øv på oppslag", {
          Viz: LpmTrainer,
          hint: "Sammenlign adressen med hvert prefiks bit for bit, og velg raden der flest bit stemmer.",
        }),
        konsept("vr-6-tjeneste", "Hva nettverkslaget lover", {
          ingress: <>Internett sitt nettverkslag lover nesten ingenting.</>,
          punkter: [
            <>
              Tjenesten kalles <Term>beste innsats</Term> (best effort).
            </>,
            "Ingen garanti for at datagrammet kommer fram.",
            "Ingen garanti for rekkefølge eller forsinkelse.",
          ],
          merk: <>Det er derfor transportlaget måtte bygge påliteligheten selv.</>,
        }),
        sjekk("vr-7-sjekk", "Hvilken jobb?", {
          sporsmal: (
            <>
              En lenke mellom to rutere ryker. Etter noen sekunder går trafikken en annen vei.
              Hvilken del av nettverkslaget fant den nye veien?
            </>
          ),
          valg: [
            { tekst: "Dataplanet", hvorfor: "Dataplanet slår bare opp i tabellen den har fått." },
            {
              tekst: "Kontrollplanet",
              riktig: true,
              hvorfor: "Ruting regner ut nye veier og oppdaterer tabellene.",
            },
          ],
          fasit: <>Kontrollplanet. Dataplanet merker endringen først når tabellen er skrevet om.</>,
        }),
        recall("vr-8-recall", [
          {
            forside: "Hva er forskjellen på videresending og ruting?",
            bakside:
              "Videresending flytter en pakke fra inngang til utgang i én ruter. Ruting bestemmer veiene gjennom hele nettet.",
          },
          {
            forside: "Hva er lengste prefiks-treff?",
            bakside: "Når flere rader i tabellen passer, brukes den med flest sammenfallende bit.",
          },
          {
            forside: "Hva betyr beste innsats?",
            bakside:
              "Nettverkslaget prøver å levere, men gir ingen garanti for levering, rekkefølge eller tid.",
          },
        ]),
        oppsummering("vr-9-opp", {
          punkter: [
            "Dataplanet videresender, kontrollplanet ruter.",
            "Videresendingstabellen binder dem sammen.",
            "Oppslag skjer med lengste prefiks-treff.",
          ],
          videre: "Neste undertema: hva som skjer inne i selve ruteren.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "inni-ruteren",
      tittel: "Inni en ruter",
      utbytte:
        "Du kan navngi delene i en ruter, forklare hvor køer oppstår, og sammenligne fire måter å velge neste pakke på.",
      byggerPa: ["videresending-og-ruting"],
      skjermer: [
        intro("ir-1-intro", "Fire deler", {
          ingress: <>Åpner du en ruter, finner du de samme fire delene uansett størrelse.</>,
          punkter: [
            <>
              <Term>Inngangsporter</Term> — tar imot rammer og slår opp i tabellen.
            </>,
            <>
              <Term>Svitsjestruktur</Term> — flytter pakken fra inngang til utgang.
            </>,
            <>
              <Term>Utgangsporter</Term> — køer og sending ut på lenken.
            </>,
            <>
              <Term>Rutingprosessor</Term> — kontrollplanet, som fyller tabellen.
            </>,
          ],
        }),
        konsept("ir-2-struktur", "Tre måter å svitsje på", {
          ingress: (
            <>
              Svitsjestrukturen er hjertet. Den avgjør hvor mange pakker ruteren klarer per sekund.
            </>
          ),
          punkter: [
            "Via minne: prosessoren kopierer pakken inn og ut. Enkelt og tregt.",
            "Via buss: alle innganger deler én felles ledning. Én pakke om gangen.",
            "Via krysskobling: et rutenett av ledninger som lar flere pakker krysse samtidig.",
          ],
        }),
        visual("ir-3-viz", "Se pakkene krysse", {
          Viz: SwitchFabricViz,
          hint: "Sammenlign de tre strukturene og se hvor mange pakker som kan flyttes samtidig i hver.",
        }),
        konsept("ir-4-ko", "Hvor køene oppstår", {
          ingress: (
            <>Køer er ikke en feil. De oppstår hver gang noe kommer raskere inn enn det går ut.</>
          ),
          punkter: [
            "På utgangen: flere innganger sender til samme utgang samtidig.",
            "På inngangen: svitsjestrukturen er tregere enn summen av inngangene.",
            "Fulle køer betyr at pakker må kastes.",
          ],
        }),
        konsept("ir-5-hol", "Køhodeblokkering", {
          ingress: (
            <>
              En pakke først i en inngangskø venter på en opptatt utgang. Pakken bak skal til en
              ledig utgang, men kommer ikke forbi.
            </>
          ),
          merk: (
            <>
              Det er samme fenomen som i HTTP/1.1, <Term>køhodeblokkering</Term>, bare inne i en
              ruter.
            </>
          ),
        }),
        visual("ir-6-hol", "Blokkert bak den første", {
          Viz: HolBlockingSim,
          hint: "Finn en pakke som kunne vært sendt, men som står fast bak en annen.",
        }),
        konsept("ir-7-plan", "Hvem slipper ut først?", {
          ingress: (
            <>
              Når flere pakker venter på samme utgang, må ruteren velge. Regelen kalles en{" "}
              <Term>planleggingsdisiplin</Term>.
            </>
          ),
          punkter: [
            <>
              <Term>FIFO</Term> (first in, first out) — den som kom først.
            </>,
            <>
              <Term>Prioritet</Term> — høy klasse alltid før lav.
            </>,
            <>
              <Term>Rundgang</Term> (round robin) — én pakke fra hver klasse etter tur.
            </>,
            <>
              <Term>Vektet rettferdig kø</Term> (WFQ) — rundgang der klassene får ulik andel.
            </>,
          ],
        }),
        visual("ir-8-sammenlign", "Samme pakker, fire regler", {
          Viz: SchedulerComparison,
          hint: "Se hvilken rekkefølge pakkene sendes i under hver regel, og hvem som må vente lengst.",
        }),
        sjekk("ir-9-sjekk", "Hvilken regel sulter noen?", {
          sporsmal: <>Under hvilken regel kan en klasse risikere aldri å slippe til?</>,
          valg: [
            { tekst: "FIFO", hvorfor: "Alle slipper til i den rekkefølgen de kom." },
            {
              tekst: "Prioritet",
              riktig: true,
              hvorfor: "Så lenge det finnes pakker med høy prioritet, venter de med lav.",
            },
            { tekst: "Rundgang", hvorfor: "Hver klasse får sin tur i hver runde." },
            { tekst: "Vektet rettferdig kø", hvorfor: "Hver klasse er garantert sin andel." },
          ],
          fasit: (
            <>
              Ren prioritet kan sulte ut de lave klassene. Vektet rettferdig kø gir alle en
              garantert minsteandel.
            </>
          ),
        }),
        recall("ir-10-recall", [
          {
            forside: "Hvilke fire deler har en ruter?",
            bakside: "Inngangsporter, svitsjestruktur, utgangsporter og rutingprosessor.",
          },
          {
            forside: "Hva er køhodeblokkering i en ruter?",
            bakside:
              "En pakke først i inngangskøen venter på en opptatt utgang og hindrer pakker bak seg som skal til ledige utganger.",
          },
          {
            forside: "Nevn fire planleggingsdisipliner.",
            bakside: "FIFO, prioritet, rundgang og vektet rettferdig kø.",
          },
        ]),
        oppsummering("ir-11-opp", {
          punkter: [
            "En ruter er innganger, svitsjestruktur, utganger og en prosessor for ruting.",
            "Køer oppstår på inngang og utgang, og fulle køer gir tap.",
            "Planleggingsdisiplinen avgjør hvem som venter.",
          ],
          videre: "Neste undertema: adressene ruterne slår opp.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "ipv4-og-subnett",
      tittel: "IPv4-adresser og subnett",
      utbytte:
        "Du kan lese en adresse med prefikslengde, finne nettadressen og regne ut hvor mange maskiner et subnett har plass til.",
      byggerPa: ["videresending-og-ruting"],
      skjermer: [
        intro("ip-1-intro", "32 bit", {
          ingress: (
            <>
              <Term>IP</Term> (Internet Protocol) er protokollen i nettverkslaget. I versjon 4 er en
              adresse 32 bit lang. Den skrives som fire tall fra 0 til 255 med punktum mellom, ett
              tall per byte.
            </>
          ),
          merk: (
            <>
              <Kodelinje>193.32.216.9</Kodelinje> er altså 32 bit delt i fire grupper på åtte.
            </>
          ),
        }),
        konsept("ip-2-hode", "Det viktigste i IP-hodet", {
          ingress: <>Hodet er vanligvis 20 byte. Fire felt går igjen i oppgaver.</>,
          punkter: [
            "Avsenderadresse og mottakeradresse.",
            <>
              <Term>Levetid</Term> (time to live, TTL) — et tall som senkes med én i hver ruter. Når
              det blir null, kastes datagrammet.
            </>,
            <>
              <Term>Protokoll</Term> — hvem som skal ha innholdet hos mottakeren: 6 for TCP, 17 for
              UDP.
            </>,
          ],
          merk: (
            <>Levetiden hindrer at et datagram som har havnet i en sløyfe, går rundt for alltid.</>
          ),
        }),
        konsept("ip-3-grensesnitt", "Adressen tilhører en tilkobling", {
          ingress: (
            <>
              En IP-adresse hører ikke til en maskin, men til et <Term>grensesnitt</Term>: koblingen
              mellom en maskin og en lenke.
            </>
          ),
          punkter: [
            "En laptop med kabel og trådløst har to grensesnitt og to adresser.",
            "En ruter har ett grensesnitt og én adresse for hver lenke den er koblet til.",
          ],
        }),
        konsept("ip-4-subnett", "Subnett", {
          ingress: (
            <>
              Et <Term>subnett</Term> er en gruppe grensesnitt som kan nå hverandre uten å gå
              gjennom en ruter.
            </>
          ),
          punkter: [
            "Alle adressene i et subnett begynner med de samme bitene: nettdelen.",
            "Resten av bitene skiller maskinene fra hverandre: vertsdelen.",
            <>
              Hvor mange bit nettdelen har, skrives etter en skråstrek:{" "}
              <Kodelinje>193.32.216.0/24</Kodelinje>.
            </>,
          ],
          bihjelp: (
            <>
              Skrivemåten heter <Term>CIDR</Term>, Classless Inter-Domain Routing. Det samme kan
              skrives som en maske: /24 er <Kodelinje>255.255.255.0</Kodelinje>.
            </>
          ),
        }),
        konsept("ip-5-antall", "Hvor mange får plass?", {
          ingress: <>Antall adresser følger rett av hvor mange bit som er igjen til vertsdelen.</>,
          punkter: [
            "Med prefikslengde n er det 32 − n bit til vertsdelen.",
            "Det gir 2 opphøyd i (32 − n) adresser.",
            "To av dem kan ikke brukes på maskiner: den første er nettadressen og den siste er kringkastingsadressen.",
          ],
          merk: <>/24 gir 256 adresser og plass til 254 maskiner.</>,
        }),
        tallanslag("ip-6-regn", "Regn ut", {
          sporsmal: <>Hvor mange maskiner er det plass til i et /26-subnett?</>,
          fasitTall: 62,
          fasit: (
            <>
              32 − 26 = 6 bit til vertsdelen. 2⁶ = 64 adresser, minus nettadressen og
              kringkastingsadressen gir 62.
            </>
          ),
        }),
        visual("ip-7-kalk", "Subnettkalkulator", {
          Viz: SubnetCalculator,
          hint: "Skriv inn en adresse med ulike prefikslengder og se hvordan nettadressen, kringkastingsadressen og antall maskiner endrer seg.",
        }),
        konsept("ip-8-samle", "Hvorfor prefikser gjør tabellene små", {
          ingress: (
            <>En leverandør med 200 kunder trenger ikke fortelle resten av verden om hver kunde.</>
          ),
          punkter: [
            "Kundene har adresser som alle begynner med leverandørens prefiks.",
            "Utad annonseres bare det ene, korte prefikset.",
            <>
              Det kalles <Term>rutesammenslåing</Term>, på engelsk route aggregation.
            </>,
          ],
          merk: (
            <>
              Flytter en kunde til en annen leverandør, annonseres et lengre prefiks der. Lengste
              prefiks-treff ordner resten.
            </>
          ),
        }),
        sjekk("ip-9-sjekk", "Samme subnett?", {
          sporsmal: (
            <>
              Maskin A har <Kodelinje>10.0.1.130/25</Kodelinje> og maskin B har{" "}
              <Kodelinje>10.0.1.20/25</Kodelinje>. Er de i samme subnett?
            </>
          ),
          valg: [
            {
              tekst: "Ja",
              hvorfor:
                "De tre første tallene er like, men /25 bruker også den første biten i det fjerde.",
            },
            {
              tekst: "Nei",
              riktig: true,
              hvorfor: "130 begynner med bit 1 og 20 med bit 0, så de 25 første bitene er ulike.",
            },
          ],
          fasit: (
            <>
              Nei. /25 deler det siste tallet i to halvdeler: 0–127 og 128–255. A og B ligger i hver
              sin, og må gå via en ruter.
            </>
          ),
        }),
        recall("ip-10-recall", [
          {
            forside: "Hva er et subnett?",
            bakside:
              "Grensesnitt med felles nettdel i adressen, som når hverandre uten å gå gjennom en ruter.",
          },
          {
            forside: "Hvor mange maskiner får plass i et /n-subnett?",
            bakside: "2 opphøyd i (32 − n), minus 2.",
          },
          {
            forside: "Hva gjør levetidsfeltet (TTL) i IP-hodet?",
            bakside: "Det senkes med én i hver ruter, og datagrammet kastes når det når null.",
          },
        ]),
        oppsummering("ip-11-opp", {
          punkter: [
            "En IPv4-adresse er 32 bit og tilhører et grensesnitt.",
            "Prefikslengden deler adressen i nettdel og vertsdel.",
            "Prefikser lar mange adresser dekkes av én rad i tabellen.",
          ],
          videre: "Neste undertema: hvordan en maskin får adressen sin.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "dhcp-og-nat",
      tittel: "DHCP og NAT",
      utbytte:
        "Du kan følge de fire DHCP-meldingene og forklare hvordan mange maskiner deler én offentlig adresse.",
      byggerPa: ["ipv4-og-subnett", "multipleksing-og-udp"],
      skjermer: [
        intro("dn-1-intro", "To hverdagsproblemer", {
          ingress: (
            <>
              Du kobler deg til et trådløst nett og er på nett sekunder senere, uten å skrive inn en
              adresse. Hjemme har du ti enheter, men leverandøren har gitt deg én adresse. To
              protokoller står bak.
            </>
          ),
        }),
        konsept("dn-2-dhcp", "DHCP deler ut adresser", {
          ingress: (
            <>
              <Term>DHCP</Term> (Dynamic Host Configuration Protocol) lar en maskin be om en adresse
              når den kobler seg til.
            </>
          ),
          punkter: [
            <>
              <Term>Discover</Term> — klienten roper til alle: «finnes det en DHCP-tjener her?»
            </>,
            <>
              <Term>Offer</Term> — tjeneren tilbyr en adresse.
            </>,
            <>
              <Term>Request</Term> — klienten ber om akkurat den adressen.
            </>,
            <>
              <Term>ACK</Term> — tjeneren bekrefter.
            </>,
          ],
          merk: <>Forbokstavene gir huskeordet DORA.</>,
        }),
        visual("dn-3-dora", "Se de fire meldingene", {
          Viz: DhcpDoraFlow,
          hint: "Legg merke til hvilke avsender- og mottakeradresser klienten bruker før den har fått en egen adresse.",
        }),
        konsept("dn-4-mer", "Mer enn en adresse", {
          ingress: (
            <>Svaret fra DHCP-tjeneren inneholder alt maskinen trenger for å komme seg ut.</>
          ),
          punkter: [
            "IP-adresse og nettmaske.",
            <>
              Adressen til <Term>standardruteren</Term>, den første ruteren på vei ut av subnettet.
            </>,
            "Adressen til den lokale navnetjeneren.",
            "En leietid. Når den går ut, må adressen fornyes.",
          ],
        }),
        konsept("dn-5-private", "Private adresser", {
          ingress: (
            <>
              Noen adresseområder er satt av til bruk innenfor egne nett og rutes aldri på
              Internett.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>10.0.0.0/8</Kodelinje>
            </>,
            <>
              <Kodelinje>172.16.0.0/12</Kodelinje>
            </>,
            <>
              <Kodelinje>192.168.0.0/16</Kodelinje>
            </>,
          ],
          merk: <>Alle hjemmenett kan bruke de samme adressene, fordi de aldri vises utad.</>,
        }),
        konsept("dn-6-nat", "NAT bytter ut adressen", {
          ingress: (
            <>
              <Term>NAT</Term> (Network Address Translation) kjører i ruteren mellom hjemmenettet og
              Internett.
            </>
          ),
          punkter: [
            "På vei ut byttes den private avsenderadressen og porten med ruterens offentlige adresse og en ny port.",
            "Byttet skrives i en oversettelsestabell.",
            "På vei inn slår ruteren opp porten i tabellen og setter tilbake den private adressen og porten.",
          ],
          merk: (
            <>Portnummeret er det som gjør det mulig å skille svarene til de ulike maskinene.</>
          ),
        }),
        visual("dn-7-tabell", "Følg oversettelsen", {
          Viz: NatTableDemo,
          hint: "Se hva som står i pakken før og etter ruteren, og hvilken rad som legges i tabellen.",
        }),
        sjekk("dn-8-sjekk", "Hva ser tjeneren?", {
          sporsmal: (
            <>
              Laptopen din har <Kodelinje>192.168.1.7</Kodelinje> bak en NAT-ruter med offentlig
              adresse <Kodelinje>84.210.5.3</Kodelinje>. Hvilken avsenderadresse ser en nettjener
              ute på Internett?
            </>
          ),
          valg: [
            { tekst: "192.168.1.7", hvorfor: "Private adresser rutes ikke på Internett." },
            {
              tekst: "84.210.5.3",
              riktig: true,
              hvorfor: "Ruteren byttet ut avsenderadressen på vei ut.",
            },
            { tekst: "Begge to", hvorfor: "Et datagram har bare ett avsenderfelt." },
          ],
          fasit: (
            <>
              Tjeneren ser bare ruterens adresse. Alle enhetene hjemme ser ut som én maskin utenfra.
            </>
          ),
        }),
        recall("dn-9-recall", [
          {
            forside: "Hvilke fire meldinger utgjør DHCP-utvekslingen?",
            bakside: "Discover, Offer, Request og ACK.",
          },
          {
            forside: "Hva får en maskin fra DHCP i tillegg til IP-adressen?",
            bakside: "Nettmaske, standardruter, navnetjener og leietid.",
          },
          {
            forside: "Hva står i en rad i NAT-tabellen?",
            bakside:
              "Offentlig adresse og port på den ene siden, privat adresse og port på den andre.",
          },
        ]),
        oppsummering("dn-10-opp", {
          punkter: [
            "DHCP gir en maskin adresse og oppsett i fire meldinger.",
            "NAT lar mange private adresser dele én offentlig, ved å skille på portnummer.",
          ],
          videre: "Neste undertema: den langsiktige løsningen på adressemangelen.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "ipv6",
      tittel: "IPv6",
      utbytte: "Du kan si hva IPv6 endrer i forhold til IPv4, og hvordan de to lever side om side.",
      byggerPa: ["ipv4-og-subnett"],
      skjermer: [
        intro("v6-1-intro", "Adressene tok slutt", {
          ingress: (
            <>
              32 bit gir omtrent fire milliarder adresser. Det er færre enn det finnes
              mobiltelefoner. IP versjon 6 løser det ved å gjøre adressen fire ganger så lang.
            </>
          ),
        }),
        konsept("v6-2-endringer", "Hva som er nytt", {
          ingress: <>Samtidig ble hodet ryddet, slik at ruterne får mindre å gjøre.</>,
          punkter: [
            "Adressen er 128 bit, skrevet som åtte grupper med heksadesimale siffer.",
            "Hodet har fast lengde på 40 byte.",
            "Sjekksummen i hodet er fjernet. Lagene over og under har allerede hver sin.",
            "Rutere deler ikke lenger opp for store datagrammer. Avsenderen må sende mindre.",
          ],
        }),
        konsept("v6-3-tunnel", "Overgangen", {
          ingress: (
            <>
              Hele Internett kan ikke bytte samme dag. Rutere som bare kan versjon 4, finnes
              fortsatt.
            </>
          ),
          punkter: [
            <>
              Løsningen heter <Term>tunnelering</Term>.
            </>,
            "Et helt IPv6-datagram legges som innhold i et IPv4-datagram.",
            "IPv4-ruterne i midten frakter det uten å vite hva som er inni.",
            "På den andre siden pakkes IPv6-datagrammet ut og sendes videre.",
          ],
        }),
        sjekk("v6-4-sjekk", "Hvorfor fjerne sjekksummen?", {
          sporsmal: <>Hvorfor har IPv6-hodet ingen sjekksum?</>,
          valg: [
            {
              tekst: "Fordi feil ikke lenger forekommer",
              hvorfor: "Bitfeil forekommer fortsatt.",
            },
            {
              tekst: "Fordi linklaget og transportlaget allerede sjekker, og ruterne sparer tid",
              riktig: true,
              hvorfor:
                "I IPv4 måtte sjekksummen regnes på nytt i hver ruter fordi levetiden endres.",
            },
            {
              tekst: "Fordi det ikke var plass i hodet",
              hvorfor: "Hodet er dobbelt så stort som i IPv4.",
            },
          ],
          fasit: <>Dobbeltarbeid. Fjerningen gjør videresendingen raskere.</>,
        }),
        recall("v6-5-recall", [
          {
            forside: "Hvor lang er en IPv6-adresse?",
            bakside: "128 bit.",
          },
          {
            forside: "Nevn tre ting IPv6 fjernet eller forenklet i hodet.",
            bakside: "Fast lengde på 40 byte, ingen sjekksum, ingen oppdeling i ruterne.",
          },
          {
            forside: "Hva er tunnelering?",
            bakside:
              "Å frakte et IPv6-datagram som innhold i et IPv4-datagram gjennom rutere som bare kan IPv4.",
          },
        ]),
        oppsummering("v6-6-opp", {
          punkter: [
            "IPv6 har 128-biters adresser og et enklere hode.",
            "Tunnelering lar IPv6 krysse nett som bare kan IPv4.",
          ],
          videre: "Neste undertema: hvordan rutene regnes ut.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "rutingalgoritmer",
      tittel: "Rutingalgoritmer",
      utbytte:
        "Du kan forklare forskjellen på lenketilstand og avstandsvektor, og regne ett steg med Bellman-Ford-ligningen.",
      byggerPa: ["videresending-og-ruting"],
      skjermer: [
        intro("ra-1-intro", "Nettet som en graf", {
          ingress: (
            <>
              For å regne på veier tegner vi nettet som en graf. Ruterne er noder, lenkene er
              kanter, og hver kant har en <Term>kostnad</Term>. Målet er veien med lavest samlet
              kostnad.
            </>
          ),
          merk: <>Kostnaden kan stå for avstand, treghet eller pris. Algoritmen bryr seg ikke.</>,
        }),
        konsept("ra-2-to", "To familier", {
          ingress: <>Forskjellen ligger i hvor mye hver ruter vet.</>,
          punkter: [
            <>
              <Term>Lenketilstand</Term> (link state) — hver ruter får kart over hele nettet og
              regner ut alle veier selv.
            </>,
            <>
              <Term>Avstandsvektor</Term> (distance vector) — hver ruter kjenner bare naboene sine
              og det de forteller.
            </>,
          ],
        }),
        konsept("ra-3-dijkstra", "Lenketilstand: Dijkstra", {
          ingress: (
            <>
              Hver ruter forteller alle andre om sine egne lenker. Deretter har alle det samme
              kartet.
            </>
          ),
          punkter: [
            "Start med deg selv som ferdig node.",
            "Velg den uferdige noden som har lavest kjent kostnad, og gjør den ferdig.",
            "Sjekk om veien via den nye noden gir lavere kostnad til naboene dens.",
            "Gjenta til alle noder er ferdige.",
          ],
          merk: <>Algoritmen heter Dijkstras algoritme.</>,
        }),
        visual("ra-4-graf", "Regn ut veiene", {
          Viz: RoutingGraphSim,
          hint: "Følg hvilken node som gjøres ferdig i hvert steg, og hvordan kostnadene til de andre oppdateres.",
        }),
        konsept("ra-5-bf", "Avstandsvektor: Bellman-Ford", {
          ingress: <>Her spør ruteren naboene: «hvor langt har du til målet?»</>,
          punkter: [
            "For hver nabo: kostnaden til naboen pluss naboens avstand til målet.",
            "Den laveste summen er din avstand til målet.",
            "Endrer avstanden din seg, forteller du det til naboene dine.",
          ],
          bihjelp: (
            <>
              Som ligning: <Kodelinje>d_x(y) = min over naboer v av c(x,v) + d_v(y)</Kodelinje>.
            </>
          ),
        }),
        tallanslag("ra-6-regn", "Ett steg med Bellman-Ford", {
          sporsmal: (
            <>
              Ruter x har to naboer. Lenken til a koster 2, og a oppgir avstand 5 til målet. Lenken
              til b koster 4, og b oppgir avstand 1. Hva blir avstanden fra x til målet?
            </>
          ),
          fasitTall: 5,
          fasit: <>Via a: 2 + 5 = 7. Via b: 4 + 1 = 5. Minst er 5, og neste hopp er b.</>,
        }),
        konsept("ra-7-uendelig", "Dårlige nyheter går sakte", {
          ingress: (
            <>Avstandsvektor har en kjent svakhet når en lenke blir dyrere eller forsvinner.</>
          ),
          punkter: [
            "To naboer kan tro at den beste veien går gjennom hverandre.",
            "De øker avstanden med litt i hver runde, og runder seg oppover.",
            <>
              Fenomenet heter <Term>telling til uendelig</Term>.
            </>,
          ],
          merk: (
            <>
              Et mottiltak er <Term>forgiftet retur</Term>: går veien min til målet gjennom deg,
              forteller jeg deg at avstanden min er uendelig.
            </>
          ),
        }),
        visual("ra-8-cti", "Se det skje", {
          Viz: CountToInfinitySim,
          hint: "Bryt eller fordyr en lenke og tell hvor mange runder det tar før tabellene er riktige igjen.",
        }),
        sjekk("ra-9-sjekk", "Hvem vet hva?", {
          sporsmal: <>Hvilken påstand om avstandsvektor er riktig?</>,
          valg: [
            { tekst: "Hver ruter har kart over hele nettet", hvorfor: "Det er lenketilstand." },
            {
              tekst: "Hver ruter kjenner bare kostnaden til naboene og avstandene de oppgir",
              riktig: true,
              hvorfor: "Resten av nettet er usynlig bak naboene.",
            },
            {
              tekst: "Rutene regnes ut av en sentral tjener",
              hvorfor: "Begge familiene her er spredt på ruterne.",
            },
          ],
          fasit: (
            <>Avstandsvektor er lokal og gjentakende. Lenketilstand er global og regnes ut i ett.</>
          ),
        }),
        recall("ra-10-recall", [
          {
            forside: "Hva er forskjellen på lenketilstand og avstandsvektor?",
            bakside:
              "Lenketilstand: alle har hele kartet og kjører Dijkstra. Avstandsvektor: hver ruter bytter avstander med naboene og bruker Bellman-Ford.",
          },
          {
            forside: "Hva sier Bellman-Ford-ligningen?",
            bakside:
              "Avstanden til et mål er den minste av kostnaden til en nabo pluss naboens avstand til målet.",
          },
          {
            forside: "Hva er telling til uendelig, og hva er et mottiltak?",
            bakside:
              "Rutere som peker på hverandre øker avstanden litt etter litt etter et brudd. Forgiftet retur demper det.",
          },
        ]),
        oppsummering("ra-11-opp", {
          punkter: [
            "Lenketilstand regner ut alt fra et felles kart.",
            "Avstandsvektor bygger på det naboene forteller.",
            "Avstandsvektor reagerer tregt på dårlige nyheter.",
          ],
          videre: "Neste undertema: protokollene som bruker algoritmene i praksis.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "ospf-bgp-icmp",
      tittel: "OSPF, BGP og ICMP",
      utbytte:
        "Du kan forklare hvorfor Internett har to nivåer av ruting, hvordan BGP velger rute, og hva ICMP brukes til.",
      byggerPa: ["rutingalgoritmer", "hva-er-internett", "male-nettet"],
      skjermer: [
        intro("ob-1-intro", "For stort for én algoritme", {
          ingress: (
            <>
              Ingen algoritme klarer hundrevis av millioner mål. Dessuten vil hver eier styre sitt
              eget nett selv. Løsningen er to nivåer.
            </>
          ),
        }),
        konsept("ob-2-as", "Autonome systemer", {
          ingress: (
            <>
              Et <Term>autonomt system</Term>, forkortet <Term>AS</Term>, er rutere under felles
              styring. Det er de selvstendige nettene fra første emne.
            </>
          ),
          punkter: [
            "Innenfor et autonomt system velger eieren rutingprotokoll selv.",
            "Mellom autonome systemer må alle bruke den samme protokollen.",
          ],
        }),
        konsept("ob-3-ospf", "Innenfor: OSPF", {
          ingress: (
            <>
              <Term>OSPF</Term> (Open Shortest Path First) er den vanligste protokollen innenfor et
              autonomt system.
            </>
          ),
          punkter: [
            "Den er en lenketilstandsprotokoll.",
            "Hver ruter sender opplysninger om sine lenker til alle andre i systemet.",
            "Alle kjører Dijkstra på det samme kartet.",
            "Store systemer kan deles i områder, slik at kartet holdes lite.",
          ],
        }),
        konsept("ob-4-bgp", "Mellom: BGP", {
          ingress: (
            <>
              <Term>BGP</Term> (Border Gateway Protocol) er limet som holder Internett sammen.
            </>
          ),
          punkter: [
            "Hvert autonomt system annonserer hvilke prefikser det kan nå.",
            <>
              Annonsen inneholder hele listen over systemer veien går gjennom: <Term>AS-PATH</Term>.
            </>,
            <>
              Den inneholder også adressen til ruteren der veien begynner: <Term>NEXT-HOP</Term>.
            </>,
          ],
          merk: (
            <>
              Ser et system sitt eget nummer i listen, forkaster det annonsen. Slik unngås sløyfer.
            </>
          ),
        }),
        konsept("ob-5-valg", "Hvordan BGP velger", {
          ingress: (
            <>
              Finnes det flere ruter til samme prefiks, går ruteren nedover en liste til én står
              igjen.
            </>
          ),
          punkter: [
            "Høyest lokal preferanse. Eieren bestemmer den ut fra avtaler og pris.",
            "Korteste AS-PATH.",
            "Nærmeste NEXT-HOP, altså raskest ut av eget nett.",
          ],
          merk: (
            <>
              Det siste kalles <Term>varm potet</Term>: bli kvitt pakken fortest mulig og la noen
              andre bære kostnaden.
            </>
          ),
        }),
        visual("ob-6-stige", "Gå ned stigen", {
          Viz: BgpLadderSim,
          hint: "Se hvilket trinn som avgjør valget for hvert sett med ruter.",
        }),
        anslag("ob-7-anslag", "Korteste vei?", {
          sporsmal: <>Velger BGP alltid den raskeste veien gjennom Internett?</>,
          valg: [{ tekst: "Ja" }, { tekst: "Nei" }],
          fasit: (
            <>
              Nei. Lokal preferanse står øverst, og den settes ut fra forretningsavtaler. Et system
              sender heller trafikk via en kunde som betaler, enn via en konkurrent med kortere vei.
            </>
          ),
        }),
        konsept("ob-8-icmp", "ICMP: nettets feilmeldinger", {
          ingress: (
            <>
              <Term>ICMP</Term> (Internet Control Message Protocol) brukes av rutere og maskiner til
              å melde fra om problemer.
            </>
          ),
          punkter: [
            "«Målet kan ikke nås.»",
            "«Levetiden gikk ut.»",
            "Ekkoforespørsel og ekkosvar, som er det ping bruker.",
          ],
          merk: (
            <>
              traceroute sender pakker med levetid 1, 2, 3 og så videre. Hver ruter som kaster en
              pakke, svarer med «levetiden gikk ut», og avslører dermed seg selv.
            </>
          ),
        }),
        konsept("ob-9-sdn", "Kontrollplanet kan flyttes ut", {
          ingress: (
            <>
              I et tradisjonelt nett regner hver ruter ut sin egen tabell. I{" "}
              <Term>programvaredefinert nettverk</Term> (software-defined networking, SDN) gjør en
              sentral kontroller det for alle.
            </>
          ),
          punkter: [
            "Kontrolleren har oversikt over hele nettet.",
            "Den sender ferdige tabeller ned til ruterne.",
            "Ruterne sitter igjen med bare dataplanet.",
          ],
        }),
        sjekk("ob-10-sjekk", "Hvilken protokoll?", {
          sporsmal: (
            <>
              Et universitet vil at ruterne på campus skal finne korteste vei seg imellom. Hva
              bruker de?
            </>
          ),
          valg: [
            {
              tekst: "OSPF",
              riktig: true,
              hvorfor: "Campus er ett autonomt system, og OSPF ruter innenfor det.",
            },
            { tekst: "BGP", hvorfor: "BGP brukes mellom autonome systemer." },
            { tekst: "ICMP", hvorfor: "ICMP melder om feil og ruter ingenting." },
          ],
          fasit: <>OSPF innenfor, BGP mellom.</>,
        }),
        recall("ob-11-recall", [
          {
            forside: "Hva er et autonomt system?",
            bakside: "Et nett av rutere under felles styring, med egen ruting innenfor.",
          },
          {
            forside: "Hvilke tre trinn bruker BGP for å velge rute, i rekkefølge?",
            bakside: "Høyest lokal preferanse, korteste AS-PATH, nærmeste NEXT-HOP.",
          },
          {
            forside: "Hvordan bruker traceroute ICMP?",
            bakside:
              "Den sender pakker med økende levetid, og hver ruter som kaster en pakke svarer med en ICMP-melding.",
          },
        ]),
        oppsummering("ob-12-opp", {
          punkter: [
            "OSPF ruter innenfor et autonomt system med lenketilstand.",
            "BGP ruter mellom systemer, og styres mer av avtaler enn av avstand.",
            "ICMP melder om feil og ligger bak ping og traceroute.",
          ],
          videre: "Neste emne: datalinklaget, der en ramme krysser én lenke.",
        }),
      ],
    },
  ],
};
