// Emne 8 — Brannmur og inntrengingsdeteksjon.
// Pensum: Kurose & Ross kap. 8.9, og kap. 1.6 om angrep.
// Bygger på emne 3 (porter, SYN og ACK), emne 4 (IP-adresser, NAT),
// emne 5 (ARP, VLAN) og emne 7 (sikkerhetsmålene).
// Rekkefølge: hva nettet angripes med → brannmur uten og med tilstand →
// soner og plassering → inntrengingsdeteksjon.

import type { Emne } from "@/lib/kurs/types";
import {
  anslag,
  intro,
  konsept,
  kode,
  oppsummering,
  recall,
  sjekk,
  visual,
} from "../dte-2505/byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { PacketClassifierLab } from "@/components/stack/dte2507-stateful-firewall/PacketClassifierLab";
import { StatefulConnectionTable } from "@/components/stack/dte2507-brannmur-pakkeflyt/StatefulConnectionTable";
import { DmzTopology } from "@/components/stack/dte2507-brannmur-pakkeflyt/DmzTopology";
import { IdsRuleSimulator } from "@/components/stack/dte2507-ids-snort/IdsRuleSimulator";

export const emneBrannmurIds: Emne = {
  slug: "brannmur-ids",
  tittel: "Brannmur og inntrengingsdeteksjon",
  sporsmal: "Hvordan stopper og oppdager du trafikk som ikke skal inn?",
  pensum: "Kurose & Ross kap. 8.9 og 1.6",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "angrep-pa-nettet",
      tittel: "Angrep på nettet",
      utbytte:
        "Du kan beskrive de vanligste angrepene og si hvilket lag og hvilket sikkerhetsmål hvert av dem rammer.",
      byggerPa: ["sikkerhetsmal", "tcp-forbindelsen", "mac-og-arp", "dns"],
      skjermer: [
        intro("an-1-intro", "Bygd for tillit", {
          ingress: (
            <>
              Protokollene du har lært ble laget for et nett der alle kjente hverandre. ARP tror på
              det første svaret. IP tror på avsenderadressen. Hvert angrep i dette undertemaet
              utnytter en slik godtroenhet.
            </>
          ),
        }),
        konsept("an-2-lytte", "Avlytting og forfalsket avsender", {
          ingress: <>De to enkleste angrepene krever nesten ingenting.</>,
          punkter: [
            <>
              <Term>Pakkesniffing</Term> — å lese alle rammer som går forbi på et delt medium, for
              eksempel et åpent trådløst nett.
            </>,
            <>
              <Term>IP-forfalskning</Term> (IP spoofing) — å sende datagrammer med en annens
              avsenderadresse. Ingenting i IP kontrollerer feltet.
            </>,
          ],
          merk: <>Kryptering stopper det første. Autentisering i endene stopper det andre.</>,
        }),
        konsept("an-3-dos", "Tjenestenekt", {
          ingress: (
            <>
              Et <Term>tjenestenektangrep</Term> (denial of service, DoS) prøver ikke å stjele noe.
              Målet er at tjenesten skal slutte å virke for alle andre.
            </>
          ),
          punkter: [
            "Fyll lenken inn til offeret med så mye trafikk at ekte pakker ikke slipper fram.",
            "Eller bruk opp en ressurs hos tjeneren, som minne eller forbindelser.",
            <>
              Kommer trafikken fra tusenvis av kaprede maskiner samtidig, kalles det et distribuert
              angrep, <Term>DDoS</Term>.
            </>,
          ],
        }),
        konsept("an-4-syn", "SYN-flom", {
          ingress: <>Et klassisk angrep på tjenerens ressurser utnytter treveis håndtrykket.</>,
          punkter: [
            "Angriperen sender en strøm av SYN-segmenter med forfalskede avsenderadresser.",
            "Tjeneren svarer på hver av dem og setter av minne til en halvåpen forbindelse.",
            "Den siste kvitteringen kommer aldri.",
            "Tabellen over halvåpne forbindelser fylles, og ekte klienter slipper ikke til.",
          ],
        }),
        konsept("an-5-forgiftning", "Forgiftede oppslag", {
          ingress: <>To oppslagstjenester stoler på svarene de får. Begge kan lures.</>,
          punkter: [
            <>
              <Term>ARP-forgiftning</Term> — angriperen svarer på ARP-spørsmål med sin egen
              MAC-adresse, og får trafikken som skulle til ruteren.
            </>,
            <>
              <Term>DNS-forgiftning</Term> — angriperen får en navnetjener til å lagre en falsk
              adresse for et navn, og brukerne sendes til feil tjener.
            </>,
          ],
          merk: (
            <>
              Begge gjør angriperen til en mellommann. Sertifikatet i TLS er det som avslører henne.
            </>
          ),
        }),
        sjekk("an-6-sjekk", "Hvilket mål rammes?", {
          sporsmal: <>Hvilket sikkerhetsmål rammer en SYN-flom?</>,
          valg: [
            { tekst: "Konfidensialitet", hvorfor: "Ingenting blir lest." },
            { tekst: "Integritet", hvorfor: "Ingenting blir endret." },
            {
              tekst: "Tilgjengelighet",
              riktig: true,
              hvorfor: "Tjenesten slutter å svare ekte brukere.",
            },
          ],
          fasit: (
            <>
              Tilgjengelighet. Det er det fjerde målet, og det eneste kryptografi ikke hjelper mot.
            </>
          ),
        }),
        recall("an-7-recall", [
          {
            forside: "Hva er IP-forfalskning?",
            bakside: "Å sende datagrammer med en annens avsenderadresse.",
          },
          {
            forside: "Hvordan virker en SYN-flom?",
            bakside:
              "Mange SYN-segmenter med falske avsendere fyller tjenerens tabell over halvåpne forbindelser.",
          },
          {
            forside: "Hva oppnår angriperen med ARP-forgiftning?",
            bakside:
              "Trafikken på lokalnettet sendes til angriperens MAC-adresse i stedet for til ruteren.",
          },
        ]),
        oppsummering("an-8-opp", {
          punkter: [
            "Mange protokoller stoler på det de får høre.",
            "Angrep rammer konfidensialitet, integritet, autentisering eller tilgjengelighet.",
          ],
          videre: "Neste undertema: det første forsvaret, brannmuren.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "brannmurer",
      tittel: "Brannmurer",
      utbytte:
        "Du kan lese en regelliste, avgjøre om en pakke slipper gjennom, og forklare hva en brannmur med tilstand vet som en uten ikke vet.",
      byggerPa: ["angrep-pa-nettet", "multipleksing-og-udp"],
      skjermer: [
        intro("bm-1-intro", "Én dør inn", {
          ingress: (
            <>
              En <Term>brannmur</Term> står mellom nettet til en organisasjon og resten av
              Internett. All trafikk inn og ut går gjennom den, og den slipper bare gjennom det
              reglene tillater.
            </>
          ),
          merk: <>Brannmuren beskytter ingenting hvis det finnes en annen vei inn.</>,
        }),
        konsept("bm-2-filter", "Pakkefilter uten tilstand", {
          ingress: (
            <>
              Den enkleste typen ser på én pakke om gangen og sammenligner hodefeltene med en liste
              regler.
            </>
          ),
          punkter: [
            "Avsender- og mottakeradresse.",
            "Protokoll: TCP, UDP eller ICMP.",
            "Avsender- og mottakerport.",
            "TCP-flagg, særlig SYN og ACK.",
          ],
          merk: <>Filteret husker ingenting fra pakke til pakke. Det kalles tilstandsløst.</>,
        }),
        konsept("bm-3-regler", "Regellisten", {
          ingress: <>Reglene leses ovenfra og ned. Den første som passer, avgjør.</>,
          punkter: [
            "Hver regel sier tillat eller avvis.",
            "Rekkefølgen er derfor avgjørende.",
            "Den siste regelen avviser vanligvis alt som ikke er nevnt.",
          ],
          merk: (
            <>
              Å avvise alt som ikke er uttrykkelig tillatt, er trygt som utgangspunkt. Å tillate alt
              som ikke er forbudt, er det ikke.
            </>
          ),
        }),
        kode("bm-4-liste", "En liten regelliste", {
          ingress: (
            <>
              Organisasjonen har nettet 222.22.0.0/16 og vil la ansatte surfe, men ikke slippe noen
              inn.
            </>
          ),
          kode: `nr  handling  avsender       mottaker       prot  fra-port  til-port  flagg
1   tillat    222.22/16      utenfor        TCP   >1023     80        alle
2   tillat    utenfor        222.22/16      TCP   80        >1023     ACK
3   avvis     alle           alle           alle  alle      alle      alle`,
          punkter: [
            "Regel 1 slipper forespørsler ut til nettjenere.",
            "Regel 2 slipper svarene inn, men bare segmenter med ACK-flagget satt.",
            "Regel 3 stopper resten.",
          ],
          merk: (
            <>
              Det første segmentet i en ny forbindelse har SYN og ikke ACK. Regel 2 stopper derfor
              alle forsøk på å koble seg til utenfra.
            </>
          ),
        }),
        visual("bm-5-lab", "Slipper pakken gjennom?", {
          Viz: PacketClassifierLab,
          hint: "Gå gjennom reglene ovenfra for hver pakke og finn den første som passer.",
        }),
        anslag("bm-6-anslag", "Hullet i regel 2", {
          sporsmal: (
            <>
              En angriper sender et segment utenfra, fra port 80, med ACK-flagget satt, uten at noen
              på innsiden har bedt om det. Slipper det gjennom regellisten?
            </>
          ),
          valg: [{ tekst: "Ja" }, { tekst: "Nei" }],
          fasit: (
            <>
              Ja. Filteret ser bare at feltene passer med regel 2. Det vet ikke at det aldri har
              gått noen forespørsel ut. For å vite det må brannmuren huske.
            </>
          ),
        }),
        konsept("bm-7-tilstand", "Brannmur med tilstand", {
          ingress: (
            <>
              En <Term>brannmur med tilstand</Term> (stateful) holder en tabell over alle
              forbindelser som er i gang.
            </>
          ),
          punkter: [
            "Når et SYN-segment går ut, legges forbindelsen i tabellen.",
            "Innkommende segmenter slipper bare gjennom hvis de tilhører en forbindelse i tabellen.",
            "Når forbindelsen lukkes eller har vært stille lenge, fjernes raden.",
          ],
        }),
        visual("bm-8-tabell", "Følg forbindelsestabellen", {
          Viz: StatefulConnectionTable,
          hint: "Se når en rad legges til, og hva som skjer med en pakke som ikke hører til noen rad.",
        }),
        konsept("bm-9-portner", "Applikasjonsportner", {
          ingress: <>Et pakkefilter ser hoder, ikke innhold. Det kan ikke skille mellom brukere.</>,
          punkter: [
            <>
              En <Term>applikasjonsportner</Term> (application gateway) er en tjener alle må gå
              gjennom for én bestemt applikasjon.
            </>,
            "Brukeren kobler seg til portneren og logger inn.",
            "Portneren åpner så en egen forbindelse videre ut på brukerens vegne.",
          ],
          merk: (
            <>
              Den kan ta avgjørelser ut fra hvem brukeren er, men det trengs én portner per
              applikasjon.
            </>
          ),
        }),
        sjekk("bm-10-sjekk", "Hva vet brannmuren med tilstand?", {
          sporsmal: (
            <>Hva kan en brannmur med tilstand avgjøre som et tilstandsløst pakkefilter ikke kan?</>
          ),
          valg: [
            { tekst: "Hvilken port pakken skal til", hvorfor: "Det står i hodet og ses av begge." },
            {
              tekst: "Om pakken tilhører en forbindelse som faktisk ble åpnet innenfra",
              riktig: true,
              hvorfor: "Det krever at brannmuren husker tidligere pakker.",
            },
            {
              tekst: "Hvilken bruker som sendte pakken",
              hvorfor: "Det krever en applikasjonsportner.",
            },
          ],
          fasit: (
            <>
              Tilstand betyr hukommelse. Hukommelsen tetter hullet med det forfalskede
              ACK-segmentet.
            </>
          ),
        }),
        recall("bm-11-recall", [
          {
            forside: "Hvilke felt ser et pakkefilter på?",
            bakside: "Adresser, protokoll, porter og TCP-flagg.",
          },
          {
            forside: "Hvordan leses en regelliste?",
            bakside:
              "Ovenfra og ned. Første regel som passer avgjør, og siste regel avviser vanligvis alt.",
          },
          {
            forside: "Hva er forskjellen på brannmur med og uten tilstand?",
            bakside:
              "Med tilstand holder brannmuren en tabell over aktive forbindelser og slipper bare inn pakker som hører til en av dem.",
          },
        ]),
        oppsummering("bm-12-opp", {
          punkter: [
            "Pakkefilteret sammenligner hodefelt med en ordnet regelliste.",
            "Tilstand lar brannmuren kjenne igjen ekte svar.",
            "Applikasjonsportnere ser innhold og brukere.",
          ],
          videre: "Neste undertema: hvor brannmuren og tjenerne skal stå.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "soner-og-dmz",
      tittel: "Soner og demilitarisert sone",
      utbytte:
        "Du kan forklare hvorfor offentlige tjenere står i en egen sone, og hvilke trafikkretninger som er tillatt mellom sonene.",
      byggerPa: ["brannmurer", "ethernet-og-svitsjer"],
      skjermer: [
        intro("dz-1-intro", "Noen må kunne nås utenfra", {
          ingress: (
            <>
              Nettjeneren og e-posttjeneren til en organisasjon må ta imot forbindelser fra hele
              verden. Det gjør dem til de mest utsatte maskinene. De bør derfor ikke stå i samme
              nett som lønnssystemet.
            </>
          ),
        }),
        konsept("dz-2-dmz", "Tre soner", {
          ingress: <>Nettet deles etter hvor mye man stoler på maskinene.</>,
          punkter: [
            "Utsiden — Internett. Ingen tillit.",
            <>
              <Term>Demilitarisert sone</Term>, forkortet DMZ — de offentlige tjenerne. Litt tillit.
            </>,
            "Innsiden — ansattes maskiner og interne systemer. Mest tillit.",
          ],
        }),
        konsept("dz-3-retninger", "Hvem får åpne forbindelser til hvem?", {
          ingress: (
            <>
              Reglene mellom sonene følger ett prinsipp: forbindelser åpnes fra høy tillit mot lav.
            </>
          ),
          punkter: [
            "Utsiden kan nå tjenerne i den demilitariserte sonen, på bestemte porter.",
            "Innsiden kan nå både sonen og utsiden.",
            "Sonen får ikke åpne forbindelser inn til innsiden.",
            "Utsiden får aldri åpne forbindelser til innsiden.",
          ],
          merk: (
            <>
              Blir nettjeneren kapret, står angriperen i sonen, og må fortsatt gjennom en brannmur
              for å komme videre.
            </>
          ),
        }),
        visual("dz-4-topologi", "Se trafikken mellom sonene", {
          Viz: DmzTopology,
          hint: "Prøv forbindelser i ulike retninger og se hvilke som slipper gjennom.",
        }),
        konsept("dz-5-vlan", "Deling på innsiden", {
          ingress: <>Også innsiden bør deles opp, slik at en smittet maskin ikke når alt.</>,
          punkter: [
            "Virtuelle lokalnett skiller for eksempel studenter, ansatte og skrivere på de samme svitsjene.",
            "Trafikk mellom dem må gjennom en ruter eller brannmur, der regler kan settes.",
          ],
        }),
        sjekk("dz-6-sjekk", "Hvor skal den stå?", {
          sporsmal: <>Hvor bør organisasjonens offentlige nettjener plasseres?</>,
          valg: [
            {
              tekst: "På innsiden",
              hvorfor: "Da må utsiden slippes inn til det mest beskyttede nettet.",
            },
            {
              tekst: "I den demilitariserte sonen",
              riktig: true,
              hvorfor: "Den kan nås utenfra uten at innsiden åpnes.",
            },
            {
              tekst: "Utenfor brannmuren",
              hvorfor: "Da har den ingen beskyttelse i det hele tatt.",
            },
          ],
          fasit: <>Sonen er laget for nettopp de maskinene som må kunne nås utenfra.</>,
        }),
        recall("dz-7-recall", [
          {
            forside: "Hva er en demilitarisert sone?",
            bakside:
              "Et eget nett for tjenere som må kunne nås utenfra, atskilt fra det interne nettet med brannmur.",
          },
          {
            forside: "Hvilke forbindelser er aldri tillatt i en soneinndeling?",
            bakside:
              "Forbindelser åpnet fra utsiden til innsiden, og fra den demilitariserte sonen til innsiden.",
          },
        ]),
        oppsummering("dz-8-opp", {
          punkter: [
            "Offentlige tjenere står i en egen sone.",
            "Forbindelser åpnes fra høy tillit mot lav.",
            "Virtuelle lokalnett deler opp innsiden.",
          ],
          videre: "Neste undertema: å oppdage det brannmuren slapp gjennom.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "inntrengingsdeteksjon",
      tittel: "Inntrengingsdeteksjon",
      utbytte:
        "Du kan skille deteksjon fra forebygging og signaturbasert fra avviksbasert metode, og lese en enkel Snort-regel.",
      byggerPa: ["brannmurer", "soner-og-dmz"],
      skjermer: [
        intro("id-1-intro", "Se inni pakkene", {
          ingress: (
            <>
              En brannmur ser på hoder. Et angrep kan ligge i innholdet, i en helt lovlig
              forbindelse til port 80. For å finne det må noen lese hele pakken og sammenligne flere
              pakker.
            </>
          ),
        }),
        konsept("id-2-ids", "Oppdage eller stoppe", {
          ingress: <>To slags systemer gjør denne jobben.</>,
          punkter: [
            <>
              Et <Term>inntrengingsdeteksjonssystem</Term> (intrusion detection system, IDS) varsler
              når det ser noe mistenkelig.
            </>,
            <>
              Et <Term>inntrengingsforebyggende system</Term> (intrusion prevention system, IPS)
              stopper i tillegg trafikken.
            </>,
          ],
          merk: <>Det første står ved siden av trafikken og lytter. Det andre står midt i den.</>,
        }),
        konsept("id-3-signatur", "Signaturbasert", {
          ingress: <>Systemet har en database med kjennetegn på kjente angrep.</>,
          punkter: [
            <>
              Et kjennetegn, en <Term>signatur</Term>, kan være en bestemt bytesekvens til en
              bestemt port.
            </>,
            "Hver pakke sammenlignes med alle signaturene.",
            "Metoden er treffsikker for kjente angrep.",
            "Den er blind for angrep ingen har sett før.",
          ],
        }),
        konsept("id-4-avvik", "Avviksbasert", {
          ingress: (
            <>
              Systemet lærer først hvordan vanlig trafikk ser ut, og varsler når noe bryter
              mønsteret.
            </>
          ),
          punkter: [
            "Plutselig hundre ganger så mange ICMP-pakker som normalt.",
            "En maskin som prøver tusen ulike porter på ett minutt.",
            "Metoden kan oppdage helt nye angrep.",
            "Den gir også mange falske alarmer, fordi uvanlig ikke alltid er farlig.",
          ],
        }),
        kode("id-5-snort", "En Snort-regel", {
          ingress: (
            <>Snort er et mye brukt, åpent system. En regel har et hode og en liste med vilkår.</>
          ),
          kode: `alert tcp any any -> 222.22.0.0/16 80 (
    msg:"Forsok pa a hente passordfil";
    content:"/etc/passwd";
    sid:1000001;
)`,
          punkter: [
            <>
              <Kodelinje>alert tcp</Kodelinje> — gi varsel for TCP-pakker.
            </>,
            <>
              <Kodelinje>any any -&gt; 222.22.0.0/16 80</Kodelinje> — fra hvem som helst til port 80
              i vårt nett.
            </>,
            <>
              <Kodelinje>content</Kodelinje> — teksten som må finnes i innholdet.
            </>,
          ],
        }),
        visual("id-6-sim", "Test regler mot trafikk", {
          Viz: IdsRuleSimulator,
          hint: "Se hvilke pakker som utløser varsel, og prøv å finne en pakke som burde vært fanget, men som slipper unna.",
        }),
        konsept("id-7-plassering", "Hvor sensorene står", {
          ingress: <>En organisasjon har ofte flere sensorer, plassert etter sonene.</>,
          punkter: [
            "Én i den demilitariserte sonen, der mest angrepstrafikk havner.",
            "Én eller flere på innsiden, for å oppdage smittede maskiner.",
            "Hver sensor ser mindre trafikk og kan gjøre grundigere arbeid.",
          ],
        }),
        sjekk("id-8-sjekk", "Hvilken metode?", {
          sporsmal: (
            <>
              Et helt nytt angrep, som ingen har sett før, treffer nettet. Hvilken metode har en
              sjanse til å oppdage det?
            </>
          ),
          valg: [
            { tekst: "Signaturbasert", hvorfor: "Det finnes ingen signatur for et ukjent angrep." },
            {
              tekst: "Avviksbasert",
              riktig: true,
              hvorfor: "Den reagerer på at trafikken ser uvanlig ut, uansett årsak.",
            },
          ],
          fasit: (
            <>Avviksbasert. Prisen er flere falske alarmer, så de to metodene brukes ofte sammen.</>
          ),
        }),
        recall("id-9-recall", [
          {
            forside: "Hva er forskjellen på et deteksjonssystem og et forebyggende system?",
            bakside: "Deteksjon varsler. Forebygging stopper også trafikken.",
          },
          {
            forside: "Hva er styrken og svakheten ved signaturbasert deteksjon?",
            bakside: "Treffsikker på kjente angrep, blind for nye.",
          },
          {
            forside: "Hva er styrken og svakheten ved avviksbasert deteksjon?",
            bakside: "Kan oppdage nye angrep, men gir mange falske alarmer.",
          },
        ]),
        oppsummering("id-10-opp", {
          punkter: [
            "Deteksjonssystemer leser innholdet, ikke bare hodene.",
            "Signaturer finner det kjente, avvik finner det uvanlige.",
            "Brannmur, soner og deteksjon er lag på lag i samme forsvar.",
          ],
          videre: "Neste emne: multimedia i nettverk.",
        }),
      ],
    },
  ],
};
