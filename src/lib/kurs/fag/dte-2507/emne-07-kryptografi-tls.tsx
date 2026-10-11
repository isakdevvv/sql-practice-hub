// Emne 7 — Kryptografi og TLS.
// Pensum: Kurose & Ross kap. 8.1–8.6.
// Bygger på emne 2 (HTTP, klient og tjener), emne 3 (TCP-håndtrykk, sjekksum)
// og emne 5 (CRC).
// Rekkefølge: hva vi vil oppnå → felles nøkkel → nøkkelpar → integritet og
// signatur → sertifikater → bevise hvem man er → TLS setter alt sammen.

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
import { BlockCipherCanvas } from "@/components/stack/dte2507-cbc-iv/BlockCipherCanvas";
import { RsaBuilder } from "@/components/stack/dte2507-rsa-mini/RsaBuilder";
import { DiffieHellmanColors } from "@/components/stack/kryptografi/DiffieHellmanColors";
import { HashAndHmac } from "@/components/stack/kryptografi/HashAndHmac";
import { IntegrityForgeryLab } from "@/components/stack/dte2507-fra-checksum-til-hmac/IntegrityForgeryLab";
import { CertificateInspector } from "@/components/stack/tls/CertificateInspector";
import { TlsHandshakeAnimator } from "@/components/stack/dte2507-tls-handshake-lab/TlsHandshakeAnimator";
import { MitmAttackSimulator } from "@/components/stack/dte2507-tls-handshake-lab/MitmAttackSimulator";

export const emneKryptografiTls: Emne = {
  slug: "kryptografi-tls",
  tittel: "Kryptografi og TLS",
  sporsmal: "Hvordan holder du noe hemmelig og ekte over et åpent nett?",
  pensum: "Kurose & Ross kap. 8.1–8.6",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "sikkerhetsmal",
      tittel: "Hva sikker kommunikasjon betyr",
      utbytte:
        "Du kan skille konfidensialitet, integritet og autentisering, og knytte hvert angrep til målet det bryter.",
      byggerPa: ["hva-er-internett"],
      skjermer: [
        intro("sm-1-intro", "Alle kan lytte", {
          ingress: (
            <>
              Pakkene dine går gjennom rutere du ikke eier, over lenker du ikke ser. Hvem som helst
              på veien kan lese dem, endre dem eller sende egne i ditt navn. Sikkerhet må derfor
              bygges i endene.
            </>
          ),
          merk: (
            <>
              Læreboka kaller de to som vil snakke sammen Alice og Bob, og inntrengeren Trudy. Vi
              bruker de samme navnene.
            </>
          ),
        }),
        konsept("sm-2-mal", "Tre mål", {
          ingress: <>Hvert mål svarer på ett spørsmål.</>,
          punkter: [
            <>
              <Term>Konfidensialitet</Term> — kan andre lese det? Bare avsender og mottaker skal
              forstå innholdet.
            </>,
            <>
              <Term>Integritet</Term> — er det endret? Mottakeren skal oppdage om noe er tuklet med.
            </>,
            <>
              <Term>Autentisering</Term> — hvem snakker jeg med? Hver part skal kunne bekrefte den
              andres identitet.
            </>,
          ],
          bihjelp: (
            <>
              Et fjerde mål, tilgjengelighet, handler om at tjenesten i det hele tatt virker. Det
              kommer i emnet om brannmurer.
            </>
          ),
        }),
        konsept("sm-3-angrep", "Hva Trudy kan gjøre", {
          ingress: <>Hvert angrep bryter ett av målene.</>,
          punkter: [
            "Avlytte — lese meldingene. Bryter konfidensialitet.",
            "Endre eller sette inn meldinger. Bryter integritet.",
            "Utgi seg for å være en annen. Bryter autentisering.",
            "Ta opp en ekte melding og sende den på nytt senere. Kalles gjenspilling.",
          ],
        }),
        sjekk("sm-4-sjekk", "Hvilket mål?", {
          sporsmal: (
            <>
              Trudy endrer kontonummeret i en betaling uten å kunne lese resten av meldingen.
              Hvilket mål er brutt?
            </>
          ),
          valg: [
            { tekst: "Konfidensialitet", hvorfor: "Hun leste ikke innholdet." },
            { tekst: "Integritet", riktig: true, hvorfor: "Meldingen ble endret underveis." },
            { tekst: "Autentisering", hvorfor: "Avsenderen er fortsatt den ekte." },
          ],
          fasit: (
            <>
              Integritet. Kryptering alene hindrer ikke endring, og det er derfor de tre målene
              trenger hvert sitt verktøy.
            </>
          ),
        }),
        recall("sm-5-recall", [
          {
            forside: "Hva er de tre hovedmålene for sikker kommunikasjon?",
            bakside: "Konfidensialitet, integritet og autentisering.",
          },
          {
            forside: "Hva er et gjenspillingsangrep?",
            bakside: "Å ta opp en gyldig melding og sende den på nytt senere.",
          },
        ]),
        oppsummering("sm-6-opp", {
          punkter: [
            "Nettet er åpent, så sikkerheten må ligge i endene.",
            "Konfidensialitet, integritet og autentisering er tre ulike mål.",
          ],
          videre: "Neste undertema: det første verktøyet, kryptering med felles nøkkel.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "symmetrisk-kryptering",
      tittel: "Kryptering med felles nøkkel",
      utbytte:
        "Du kan forklare klartekst, chiffertekst og nøkkel, og hvorfor like blokker ikke må gi like resultater.",
      byggerPa: ["sikkerhetsmal"],
      skjermer: [
        intro("sy-1-intro", "Ordene først", {
          ingress: <>All kryptering har de samme tre delene.</>,
          punkter: [
            <>
              <Term>Klartekst</Term> — meldingen slik den egentlig er.
            </>,
            <>
              <Term>Chiffertekst</Term> — meldingen etter kryptering, uleselig for andre.
            </>,
            <>
              <Term>Nøkkel</Term> — den hemmelige verdien som styrer omformingen.
            </>,
          ],
          merk: <>Algoritmen er offentlig. Bare nøkkelen er hemmelig.</>,
        }),
        konsept("sy-2-symmetrisk", "Samme nøkkel i begge ender", {
          ingress: (
            <>
              I <Term>symmetrisk kryptering</Term> bruker Alice og Bob den samme nøkkelen, én gang
              for å låse og én gang for å låse opp.
            </>
          ),
          punkter: [
            "Det er raskt, også for store datamengder.",
            "Begge må ha nøkkelen på forhånd.",
            "Hvordan de får den uten at Trudy ser den, er et eget problem.",
          ],
        }),
        konsept("sy-3-blokk", "Blokkchiffer", {
          ingress: (
            <>
              Dagens standard er <Term>AES</Term> (Advanced Encryption Standard). Den er et{" "}
              <Term>blokkchiffer</Term>: klarteksten deles i blokker på 128 bit, og hver blokk
              omformes for seg.
            </>
          ),
          punkter: [
            "Nøkkelen er 128, 192 eller 256 bit.",
            "Å prøve alle nøkler tar lengre tid enn universets alder.",
          ],
        }),
        anslag("sy-4-anslag", "Hva skjer med like blokker?", {
          sporsmal: (
            <>
              Du krypterer et bilde blokk for blokk med samme nøkkel. Store flater i bildet har helt
              like blokker. Hva ser Trudy?
            </>
          ),
          valg: [
            { tekst: "Ingenting, alt ser tilfeldig ut" },
            { tekst: "Omrisset av bildet, fordi like blokker blir like" },
            { tekst: "Hele bildet i klartekst" },
          ],
          fasit: (
            <>
              Omrisset. Samme klartekstblokk gir samme chiffertekstblokk, så mønstre skinner
              gjennom. Denne enkle måten å bruke et blokkchiffer på heter ECB og skal ikke brukes.
            </>
          ),
        }),
        konsept("sy-5-cbc", "Kjed blokkene sammen", {
          ingress: (
            <>
              Løsningen er å blande inn noe som er forskjellig for hver blokk. I <Term>CBC</Term>{" "}
              (cipher block chaining) blandes hver klartekstblokk med den forrige
              chiffertekstblokken før kryptering.
            </>
          ),
          punkter: [
            "Blandingen gjøres med XOR.",
            <>
              Den første blokken har ingen forgjenger. Den blandes med en tilfeldig startverdi,{" "}
              <Term>initialiseringsvektoren</Term>, forkortet IV.
            </>,
            "IV sendes åpent, men må være ny for hver melding.",
          ],
        }),
        visual("sy-6-viz", "Se mønsteret forsvinne", {
          Viz: BlockCipherCanvas,
          hint: "Sammenlign resultatet med og uten kjeding, og se hva som skjer med de like blokkene.",
        }),
        sjekk("sy-7-sjekk", "Hvorfor ny startverdi?", {
          sporsmal: <>Hvorfor må initialiseringsvektoren være ny for hver melding?</>,
          valg: [
            {
              tekst: "Ellers gir to like meldinger lik chiffertekst, og Trudy ser at de er like",
              riktig: true,
              hvorfor: "Med samme nøkkel og samme startverdi blir hele kjeden lik.",
            },
            {
              tekst: "Ellers kan ikke Bob dekryptere",
              hvorfor: "Bob klarer seg fint med en gammel verdi. Det er Trudy som får hjelp.",
            },
            { tekst: "Fordi nøkkelen slites", hvorfor: "Nøkler slites ikke." },
          ],
          fasit: (
            <>
              Målet er at ingenting ved chifferteksten skal røpe noe om klarteksten, heller ikke at
              to meldinger er like.
            </>
          ),
        }),
        recall("sy-8-recall", [
          {
            forside: "Hva er symmetrisk kryptering?",
            bakside: "Kryptering der avsender og mottaker bruker den samme hemmelige nøkkelen.",
          },
          {
            forside: "Hva er svakheten med å kryptere hver blokk for seg (ECB)?",
            bakside: "Like klartekstblokker gir like chiffertekstblokker, så mønstre avsløres.",
          },
          {
            forside: "Hva gjør CBC og initialiseringsvektoren?",
            bakside:
              "Hver blokk blandes med forrige chiffertekstblokk, og den første med en ny tilfeldig startverdi.",
          },
        ]),
        oppsummering("sy-9-opp", {
          punkter: [
            "Symmetrisk kryptering er rask, men krever en felles nøkkel.",
            "AES krypterer blokker på 128 bit.",
            "Kjeding med ny startverdi skjuler mønstre.",
          ],
          videre: "Neste undertema: hvordan to fremmede blir enige om en nøkkel.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "offentlig-nokkel",
      tittel: "Nøkkelpar: RSA og Diffie-Hellman",
      utbytte:
        "Du kan forklare hva offentlig og privat nøkkel brukes til, regne første steg i RSA, og si hvorfor en sesjonsnøkkel brukes.",
      byggerPa: ["symmetrisk-kryptering"],
      skjermer: [
        intro("on-1-intro", "Nøkkelproblemet", {
          ingress: (
            <>
              Du skal handle i en nettbutikk du aldri har besøkt. Dere har ingen felles hemmelighet,
              og alt dere sender kan leses av andre. I 1976 kom ideen som løste det: to nøkler i
              stedet for én.
            </>
          ),
        }),
        konsept("on-2-par", "Offentlig og privat", {
          ingress: (
            <>
              I <Term>kryptering med offentlig nøkkel</Term> har hver part et nøkkelpar.
            </>
          ),
          punkter: [
            <>
              Den <Term>offentlige nøkkelen</Term> kan hele verden få.
            </>,
            <>
              Den <Term>private nøkkelen</Term> forlater aldri eieren.
            </>,
            "Det den ene låser, kan bare den andre låse opp.",
          ],
          bihjelp: (
            <>
              Tenk på en postkasse med sprekk. Alle kan legge noe i den. Bare den med nøkkelen får
              det ut.
            </>
          ),
        }),
        konsept("on-3-rsa", "RSA i fem linjer", {
          ingress: <>Den mest kjente algoritmen heter RSA, etter opphavsmennene.</>,
          punkter: [
            <>
              Velg to store primtall, <Kodelinje>p</Kodelinje> og <Kodelinje>q</Kodelinje>.
            </>,
            <>
              Regn ut <Kodelinje>n = p · q</Kodelinje> og <Kodelinje>z = (p − 1)(q − 1)</Kodelinje>.
            </>,
            <>
              Velg <Kodelinje>e</Kodelinje> uten felles faktor med z, og finn{" "}
              <Kodelinje>d</Kodelinje> slik at e · d gir rest 1 ved deling på z.
            </>,
            <>Offentlig nøkkel er (n, e). Privat nøkkel er (n, d).</>,
            <>
              Kryptering: <Kodelinje>c = mᵉ mod n</Kodelinje>. Dekryptering:{" "}
              <Kodelinje>m = cᵈ mod n</Kodelinje>.
            </>,
          ],
          merk: (
            <>
              Sikkerheten hviler på at det er lett å gange p og q, men håpløst å finne dem igjen fra
              n.
            </>
          ),
        }),
        tallanslag("on-4-regn", "Første steg", {
          sporsmal: <>Du velger p = 5 og q = 7. Hva blir z = (p − 1)(q − 1)?</>,
          fasitTall: 24,
          fasit: (
            <>
              4 · 6 = 24, og n = 35. Med e = 5 blir d = 29, fordi 5 · 29 = 145 gir rest 1 ved deling
              på 24.
            </>
          ),
        }),
        visual("on-5-rsa", "Bygg et nøkkelpar", {
          Viz: RsaBuilder,
          hint: "Velg små primtall og følg tallene gjennom alle stegene, til du har kryptert og dekryptert en melding.",
        }),
        konsept("on-6-sesjon", "For treg til alt", {
          ingress: <>RSA regner med enorme tall og er tusenvis av ganger tregere enn AES.</>,
          punkter: [
            <>
              Derfor brukes nøkkelparet bare til å bli enige om en tilfeldig, symmetrisk{" "}
              <Term>sesjonsnøkkel</Term>.
            </>,
            "Resten av samtalen krypteres med sesjonsnøkkelen.",
            "Hver ny samtale får en ny sesjonsnøkkel.",
          ],
        }),
        konsept("on-7-dh", "Diffie-Hellman", {
          ingress: (
            <>
              En annen måte å få en felles nøkkel på er <Term>Diffie-Hellman</Term>. Alice og Bob
              lager nøkkelen sammen, uten at den noen gang sendes.
            </>
          ),
          punkter: [
            "Begge velger hvert sitt hemmelige tall.",
            "Hver sender den andre en verdi regnet ut fra sitt tall.",
            "Hver kombinerer det de fikk med sin egen hemmelighet, og ender på samme svar.",
          ],
          merk: (
            <>Trudy ser bare de to verdiene som ble sendt, og kan ikke regne seg fram til svaret.</>
          ),
        }),
        visual("on-8-dh", "Diffie-Hellman med maling", {
          Viz: DiffieHellmanColors,
          hint: "Følg fargene: hva blandes privat, hva sendes åpent, og hvorfor ender begge med samme farge?",
        }),
        sjekk("on-9-sjekk", "Hvilken nøkkel?", {
          sporsmal: (
            <>Alice vil sende Bob en melding bare han kan lese. Hvilken nøkkel krypterer hun med?</>
          ),
          valg: [
            {
              tekst: "Sin egen private",
              hvorfor: "Da kan alle med hennes offentlige nøkkel lese den.",
            },
            { tekst: "Sin egen offentlige", hvorfor: "Da er det bare hun selv som kan låse opp." },
            {
              tekst: "Bobs offentlige",
              riktig: true,
              hvorfor: "Bare Bobs private nøkkel kan låse opp det hans offentlige har låst.",
            },
            { tekst: "Bobs private", hvorfor: "Den har hun ikke, og skal aldri ha." },
          ],
          fasit: <>Mottakerens offentlige nøkkel. Postkassen tilhører den som skal lese.</>,
        }),
        recall("on-10-recall", [
          {
            forside: "Hva er forholdet mellom offentlig og privat nøkkel?",
            bakside:
              "Det den ene krypterer, kan bare den andre dekryptere. Den offentlige deles, den private holdes hemmelig.",
          },
          {
            forside: "Hvordan krypterer og dekrypterer RSA?",
            bakside: "c = m opphøyd i e, mod n. m = c opphøyd i d, mod n.",
          },
          {
            forside: "Hvorfor brukes en sesjonsnøkkel?",
            bakside:
              "Kryptering med offentlig nøkkel er treg, så den brukes bare til å avtale en rask symmetrisk nøkkel.",
          },
        ]),
        oppsummering("on-11-opp", {
          punkter: [
            "Nøkkelpar løser problemet med å dele en hemmelighet.",
            "RSA bygger på at store tall er vanskelige å faktorisere.",
            "I praksis avtales en sesjonsnøkkel, og resten går symmetrisk.",
          ],
          videre: "Neste undertema: å oppdage om noe er endret.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "integritet-og-signatur",
      tittel: "Hash, MAC og digital signatur",
      utbytte:
        "Du kan forklare hva en hashfunksjon må tåle, og forskjellen på en meldingskode og en digital signatur.",
      byggerPa: ["offentlig-nokkel", "linklaget-og-feil"],
      skjermer: [
        intro("is-1-intro", "Sjekksummer stopper støy, ikke mennesker", {
          ingress: (
            <>
              CRC oppdager bit som er endret ved et uhell. Trudy endrer med vilje, og regner bare ut
              en ny CRC etterpå. For å stoppe henne trengs noe hun ikke kan regne ut selv.
            </>
          ),
        }),
        konsept("is-2-hash", "Kryptografisk hash", {
          ingress: (
            <>
              En <Term>hashfunksjon</Term> tar en melding av vilkårlig lengde og gir et
              fingeravtrykk med fast lengde. SHA-256 gir 256 bit.
            </>
          ),
          punkter: [
            "Samme melding gir alltid samme fingeravtrykk.",
            "Én endret bit gir et helt annet fingeravtrykk.",
            "Det er i praksis umulig å finne to meldinger med samme fingeravtrykk.",
            "Det er umulig å regne seg tilbake fra fingeravtrykk til melding.",
          ],
        }),
        konsept("is-3-mac", "Meldingskode med felles hemmelighet", {
          ingress: (
            <>
              En hash alene hjelper ikke, for Trudy kan regne ut en ny. Hemmeligheten må blandes
              inn.
            </>
          ),
          punkter: [
            "Alice og Bob deler en hemmelig verdi.",
            "Alice regner ut hash av melding pluss hemmelighet, og sender resultatet sammen med meldingen.",
            "Bob gjør samme regnestykke og sammenligner.",
          ],
          merk: (
            <>
              Resultatet heter en <Term>meldingsautentiseringskode</Term>, forkortet MAC. Den har
              ingenting med MAC-adresser å gjøre. Den vanligste standarden heter HMAC.
            </>
          ),
        }),
        visual("is-4-hmac", "Hash og meldingskode", {
          Viz: HashAndHmac,
          hint: "Endre ett tegn i meldingen og se hva som skjer med fingeravtrykket.",
        }),
        visual("is-5-lab", "Prøv å forfalske", {
          Viz: IntegrityForgeryLab,
          hint: "Prøv å endre meldingen uten at mottakeren oppdager det, først mot en vanlig sjekksum og så mot en meldingskode.",
        }),
        konsept("is-6-signatur", "Digital signatur", {
          ingress: (
            <>
              En meldingskode beviser at avsenderen kjenner hemmeligheten. Men Bob kjenner den også,
              og kunne laget koden selv. En <Term>digital signatur</Term> kan bare avsenderen lage.
            </>
          ),
          punkter: [
            "Alice regner ut hash av meldingen.",
            "Hun krypterer fingeravtrykket med sin private nøkkel. Det er signaturen.",
            "Bob dekrypterer signaturen med Alices offentlige nøkkel og sammenligner med sin egen hash av meldingen.",
          ],
          merk: (
            <>
              Alle kan kontrollere signaturen. Bare Alice kan ha laget den, og hun kan ikke nekte
              for det etterpå.
            </>
          ),
        }),
        sjekk("is-7-sjekk", "Kode eller signatur?", {
          sporsmal: (
            <>
              En bank vil kunne bevise overfor en dommer at kunden godkjente en betaling. Hva
              trengs?
            </>
          ),
          valg: [
            {
              tekst: "En meldingskode med felles hemmelighet",
              hvorfor: "Banken kjenner hemmeligheten og kunne laget koden selv.",
            },
            {
              tekst: "En digital signatur fra kunden",
              riktig: true,
              hvorfor: "Bare kunden har den private nøkkelen.",
            },
            { tekst: "En CRC", hvorfor: "Den kan hvem som helst regne ut." },
          ],
          fasit: (
            <>
              Signaturen gir det en meldingskode ikke gir: avsenderen kan ikke nekte for den i
              ettertid.
            </>
          ),
        }),
        recall("is-8-recall", [
          {
            forside: "Hvilke egenskaper må en kryptografisk hashfunksjon ha?",
            bakside:
              "Fast lengde ut, umulig å regne baklengs, og umulig å finne to meldinger med samme fingeravtrykk.",
          },
          {
            forside: "Hva er en meldingsautentiseringskode?",
            bakside:
              "En hash av meldingen sammen med en felles hemmelighet. Den beviser integritet og at avsenderen kjenner hemmeligheten.",
          },
          {
            forside: "Hvordan lages og kontrolleres en digital signatur?",
            bakside:
              "Hash av meldingen krypteres med avsenderens private nøkkel, og kontrolleres med den offentlige.",
          },
        ]),
        oppsummering("is-9-opp", {
          punkter: [
            "Hash gir et fingeravtrykk som ikke kan forfalskes baklengs.",
            "Meldingskode krever felles hemmelighet. Signatur krever nøkkelpar.",
            "Bare signaturen binder avsenderen overfor en tredjepart.",
          ],
          videre: "Neste undertema: hvordan du vet at en offentlig nøkkel tilhører den du tror.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "sertifikater-og-autentisering",
      tittel: "Sertifikater og autentisering",
      utbytte:
        "Du kan forklare hva et sertifikat binder sammen, og hvorfor et engangstall stopper gjenspilling.",
      byggerPa: ["integritet-og-signatur"],
      skjermer: [
        intro("sa-1-intro", "Hvem eier denne nøkkelen?", {
          ingress: (
            <>
              Alt så langt forutsetter at Alice har Bobs ekte offentlige nøkkel. Hvis Trudy klarer å
              gi henne sin egen i stedet, og kalle den Bobs, faller alt sammen.
            </>
          ),
        }),
        konsept("sa-2-ca", "Sertifikatutstedere", {
          ingress: (
            <>
              En <Term>sertifikatutsteder</Term> (certification authority, CA) er en organisasjon
              alle har valgt å stole på.
            </>
          ),
          punkter: [
            "Bob beviser overfor utstederen hvem han er.",
            <>
              Utstederen lager et <Term>sertifikat</Term>: Bobs navn og Bobs offentlige nøkkel,
              signert med utstederens private nøkkel.
            </>,
            "Alice kontrollerer signaturen med utstederens offentlige nøkkel, som ligger ferdig innebygd i nettleseren.",
          ],
        }),
        visual("sa-3-sert", "Se inni et sertifikat", {
          Viz: CertificateInspector,
          hint: "Finn hvem sertifikatet er utstedt til, hvem som har utstedt det, og hvor lenge det gjelder.",
        }),
        konsept("sa-4-bevis", "Å bevise at man er til stede", {
          ingress: (
            <>
              Et sertifikat sier hvilken nøkkel som er Bobs. Det sier ikke at det er Bob i den andre
              enden akkurat nå.
            </>
          ),
          punkter: [
            "Sender Bob bare «jeg er Bob», kan hvem som helst si det samme.",
            "Sender han et passord, kan Trudy ta det opp.",
            "Sender han et kryptert passord, kan Trudy ta opp det også og spille det av senere.",
          ],
          merk: <>Læreboka kaller disse forsøkene ap 1.0 til 3.1, for authentication protocol.</>,
        }),
        konsept("sa-5-engangstall", "Engangstall", {
          ingress: (
            <>
              Løsningen er at Alice stiller et spørsmål som aldri er stilt før. Hun sender et
              tilfeldig tall som bare brukes én gang, et <Term>engangstall</Term> (nonce).
            </>
          ),
          punkter: [
            "Bob sender tallet tilbake, kryptert med en nøkkel bare han har.",
            "Alice dekrypterer og ser at det er hennes tall.",
            "Et gammelt opptak er verdiløst, for neste gang er tallet et annet.",
          ],
        }),
        sjekk("sa-6-sjekk", "Hva stopper engangstallet?", {
          sporsmal: <>Hvilket angrep er engangstallet laget for å stoppe?</>,
          valg: [
            { tekst: "Avlytting", hvorfor: "Avlytting stoppes med kryptering." },
            {
              tekst: "Gjenspilling",
              riktig: true,
              hvorfor: "Et svar som var riktig i går, er feil i dag.",
            },
            { tekst: "Overbelastning", hvorfor: "Det er et angrep på tilgjengelighet." },
          ],
          fasit: <>Gjenspilling. Engangstallet beviser at motparten er til stede nå.</>,
        }),
        recall("sa-7-recall", [
          {
            forside: "Hva inneholder et sertifikat?",
            bakside: "Eierens navn og offentlige nøkkel, signert av en sertifikatutsteder.",
          },
          {
            forside: "Hvordan kontrollerer nettleseren et sertifikat?",
            bakside:
              "Den sjekker utstederens signatur med utstederens offentlige nøkkel, som er innebygd i nettleseren.",
          },
          {
            forside: "Hva er et engangstall, og hva brukes det til?",
            bakside:
              "Et tilfeldig tall som brukes én gang, for å bevise at motparten svarer nå og ikke spiller av et opptak.",
          },
        ]),
        oppsummering("sa-8-opp", {
          punkter: [
            "Sertifikatet knytter en offentlig nøkkel til et navn.",
            "Tilliten kommer fra utstederens signatur.",
            "Engangstall stopper gjenspilling.",
          ],
          videre: "Neste undertema: TLS, der alle verktøyene brukes sammen.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "tls",
      tittel: "TLS: alt satt sammen",
      utbytte:
        "Du kan følge et TLS-håndtrykk steg for steg og si hvilket verktøy som gir hvilket sikkerhetsmål.",
      byggerPa: ["sertifikater-og-autentisering", "tcp-forbindelsen", "http"],
      skjermer: [
        intro("tls-1-intro", "Hengelåsen i adressefeltet", {
          ingress: (
            <>
              <Term>TLS</Term> (Transport Layer Security) ligger mellom applikasjonen og TCP. Når
              HTTP sendes gjennom TLS, heter det HTTPS. TLS gir alle de tre målene på én gang.
            </>
          ),
          punkter: [
            "Konfidensialitet med symmetrisk kryptering.",
            "Integritet med meldingskoder.",
            "Autentisering av tjeneren med sertifikat.",
          ],
        }),
        konsept("tls-2-handtrykk", "Håndtrykket", {
          ingress: <>Etter at TCP-forbindelsen er oppe, blir de to enige om nøkler.</>,
          punkter: [
            "Klienten sier hei, lister hvilke algoritmer den kan, og sender et engangstall.",
            "Tjeneren velger algoritmer, sender sitt engangstall og sertifikatet sitt.",
            "Klienten kontrollerer sertifikatet.",
            "De to avtaler en felles hemmelighet, med Diffie-Hellman eller ved at klienten krypterer den med tjenerens offentlige nøkkel.",
            "Begge regner ut sesjonsnøklene fra hemmeligheten og de to engangstallene.",
          ],
        }),
        visual("tls-3-anim", "Følg meldingene", {
          Viz: TlsHandshakeAnimator,
          hint: "Gå gjennom håndtrykket steg for steg, og legg merke til hvilken melding som er den første som sendes kryptert.",
        }),
        konsept("tls-4-nokler", "Flere nøkler fra én hemmelighet", {
          ingress: <>Av den felles hemmeligheten lages fire nøkler.</>,
          punkter: [
            "Én krypteringsnøkkel for hver retning.",
            "Én nøkkel til meldingskoder for hver retning.",
          ],
          merk: (
            <>
              Blir én nøkkel kjent, er ikke de andre avslørt. Og engangstallene sørger for at hver
              forbindelse får nye nøkler.
            </>
          ),
        }),
        konsept("tls-5-poster", "Dataene deles i poster", {
          ingress: <>Etter håndtrykket sendes dataene i biter kalt poster.</>,
          punkter: [
            "Hver post får en meldingskode.",
            "Koden regnes ut over innholdet og et løpenummer.",
            "Deretter krypteres post og kode sammen.",
          ],
          merk: (
            <>
              Løpenummeret hindrer at Trudy bytter om på postene, fjerner noen eller spiller dem av
              på nytt.
            </>
          ),
        }),
        konsept("tls-6-mitm", "Mannen i midten", {
          ingress: (
            <>
              I et <Term>mellommannsangrep</Term> stiller Trudy seg mellom Alice og tjeneren og
              later som hun er tjeneren overfor Alice, og Alice overfor tjeneren.
            </>
          ),
          punkter: [
            "Uten sertifikat ville Alice ukritisk avtalt nøkler med Trudy.",
            "Med sertifikat må Trudy vise et som er signert av en utsteder og lyder på tjenerens navn.",
            "Det har hun ikke, og nettleseren gir en advarsel.",
          ],
        }),
        visual("tls-7-mitm", "Prøv angrepet", {
          Viz: MitmAttackSimulator,
          hint: "Se hvor angrepet lykkes og hvor det stopper, og hva som gjør forskjellen.",
        }),
        konsept("tls-8-andre", "Samme verktøy, andre lag", {
          ingress: <>Verktøyene i TLS brukes også andre steder i protokollstakken.</>,
          punkter: [
            "I applikasjonslaget: kryptert og signert e-post.",
            <>
              I nettverkslaget: <Term>IPsec</Term>, som krypterer hele datagrammer mellom to
              punkter.
            </>,
            <>
              Et <Term>virtuelt privat nett</Term> (VPN) bruker slik kryptering til å lage en tunnel
              gjennom Internett, slik at to kontorer virker som ett nett.
            </>,
          ],
        }),
        sjekk("tls-9-sjekk", "Hva stopper mellommannen?", {
          sporsmal: <>Hvilken del av TLS er det som stopper et mellommannsangrep?</>,
          valg: [
            {
              tekst: "Krypteringen",
              hvorfor: "Trudy ville bare avtalt egne nøkler med hver side.",
            },
            {
              tekst: "Sertifikatet",
              riktig: true,
              hvorfor: "Det beviser at nøkkelen tilhører det navnet Alice ba om.",
            },
            {
              tekst: "Løpenumrene",
              hvorfor: "De beskytter rekkefølgen på postene, ikke identiteten.",
            },
          ],
          fasit: <>Kryptering uten autentisering er en sikker linje til en ukjent.</>,
        }),
        recall("tls-10-recall", [
          {
            forside: "Hva er hovedstegene i et TLS-håndtrykk?",
            bakside:
              "Klienthilsen med algoritmer og engangstall, tjenerhilsen med sertifikat, kontroll av sertifikatet, avtale om felles hemmelighet, og utregning av sesjonsnøkler.",
          },
          {
            forside: "Hvorfor har hver TLS-post et løpenummer i meldingskoden?",
            bakside: "For å oppdage poster som er byttet om, fjernet eller spilt av på nytt.",
          },
          {
            forside: "Hva er et mellommannsangrep, og hva stopper det?",
            bakside:
              "En angriper som later som den er motparten overfor begge sider. Sertifikatet stopper det.",
          },
        ]),
        oppsummering("tls-11-opp", {
          punkter: [
            "TLS gir konfidensialitet, integritet og autentisering oppå TCP.",
            "Håndtrykket bruker sertifikat og nøkkelavtale. Dataene går med symmetriske sesjonsnøkler.",
            "Sertifikatet er det som stopper mellommannen.",
          ],
          videre: "Neste emne: brannmurer og inntrengingsdeteksjon.",
        }),
      ],
    },
  ],
};
