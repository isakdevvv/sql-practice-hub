// Emne 9 — Multimedia i nettverk.
// Pensum: Kurose & Ross kap. 9.
// Bygger på emne 1 (forsinkelse, kø, tap), emne 2 (DASH, innholdsnett),
// emne 3 (UDP, TCP) og emne 4 (planleggingsdisipliner i ruteren).
// Rekkefølge: tre typer multimedia → tale over IP og RTP → hvordan nettet
// kan prioritere.

import type { Emne } from "@/lib/kurs/types";
import {
  anslag,
  intro,
  konsept,
  oppsummering,
  recall,
  sjekk,
  tallanslag,
} from "../dte-2505/byggere";
import { Term } from "@/components/kurs-dte2505/blokker";

export const emneMultimedia: Emne = {
  slug: "multimedia",
  tittel: "Multimedia i nettverk",
  sporsmal: "Hvorfor er lyd og video vanskeligere enn filer?",
  pensum: "Kurose & Ross kap. 9",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "stromming",
      tittel: "Tre slags multimedia",
      utbytte:
        "Du kan skille lagret strømming, samtale og direktesending, og forklare hva klientbufferet gjør.",
      byggerPa: ["video-og-innholdsnett", "fire-forsinkelser"],
      skjermer: [
        intro("st-1-intro", "Tiden teller", {
          ingress: (
            <>
              En fil er like god om den kommer fram ett sekund senere. Et lydklipp som kommer ett
              sekund for sent i en samtale, er verdiløst. Multimedia tåler litt tap, men ikke
              forsinkelse. For filer er det omvendt.
            </>
          ),
        }),
        konsept("st-2-tre", "Tre typer", {
          ingress: <>Kravene avhenger av om noen venter på svar.</>,
          punkter: [
            <>
              <Term>Lagret strømming</Term> — film og serier. Innholdet finnes ferdig, og noen
              sekunders ventetid før start er greit.
            </>,
            <>
              <Term>Samtale</Term> — tale og videomøter. Forsinkelsen må være lav, ellers snakker
              folk i munnen på hverandre.
            </>,
            <>
              <Term>Direktesending</Term> — idrett og nyheter. Mange ser samtidig, og noen sekunders
              forsinkelse går bra.
            </>,
          ],
        }),
        konsept("st-3-buffer", "Klientbufferet", {
          ingress: <>Nettet leverer ujevnt. Avspillingen må være jevn.</>,
          punkter: [
            "Spilleren samler opp noen sekunder video før den starter.",
            "Deretter spiller den fra bufferet mens nye biter fylles på.",
            "Går bufferet tomt, fryser bildet til det er fylt opp igjen.",
          ],
          bihjelp: (
            <>
              Tenk på et vannkar med kran og avløp. Krana renner ujevnt, avløpet jevnt. Så lenge det
              står vann i karet, merker ikke avløpet noe til krana.
            </>
          ),
        }),
        konsept("st-4-jitter", "Ujevn forsinkelse", {
          ingress: (
            <>
              Pakker som sendes med jevne mellomrom, kommer fram med ujevne mellomrom, fordi køene i
              ruterne varierer.
            </>
          ),
          merk: (
            <>
              Variasjonen i forsinkelse kalles <Term>jitter</Term>. Bufferet er det som jevner den
              ut.
            </>
          ),
        }),
        sjekk("st-5-sjekk", "Hvem tåler minst forsinkelse?", {
          sporsmal: <>Hvilken av de tre typene har det strengeste kravet til forsinkelse?</>,
          valg: [
            { tekst: "Lagret strømming", hvorfor: "Den kan bufre mange sekunder." },
            { tekst: "Samtale", riktig: true, hvorfor: "To mennesker venter på hverandres svar." },
            {
              tekst: "Direktesending",
              hvorfor: "Seerne merker ikke om de ligger noen sekunder etter.",
            },
          ],
          fasit: <>Samtale. Der kan ikke bufferet være større enn en brøkdel av et sekund.</>,
        }),
        recall("st-6-recall", [
          {
            forside: "Hvilke tre typer multimedia skiller vi mellom?",
            bakside: "Lagret strømming, samtale og direktesending.",
          },
          {
            forside: "Hva er jitter?",
            bakside: "Variasjon i forsinkelsen fra pakke til pakke.",
          },
          {
            forside: "Hva gjør klientbufferet?",
            bakside:
              "Samler opp innhold slik at avspillingen kan være jevn selv om leveringen er ujevn.",
          },
        ]),
        oppsummering("st-7-opp", {
          punkter: [
            "Multimedia tåler tap bedre enn forsinkelse.",
            "Bufferet bytter litt ventetid mot jevn avspilling.",
          ],
          videre: "Neste undertema: tale over IP, der bufferet må være lite.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "tale-over-ip",
      tittel: "Tale over IP og RTP",
      utbytte:
        "Du kan forklare forsinkelsesgrensene for tale, hvordan avspillingsforsinkelse velges, og hva RTP-hodet inneholder.",
      byggerPa: ["stromming", "multipleksing-og-udp"],
      skjermer: [
        intro("ti-1-intro", "En samtale i små pakker", {
          ingress: (
            <>
              Tale over IP, forkortet <Term>VoIP</Term> (voice over IP), deler lyden i biter på
              rundt 20 millisekunder og sender hver bit i sin egen UDP-pakke.
            </>
          ),
        }),
        tallanslag("ti-2-regn", "Hvor stor er en lydbit?", {
          sporsmal: (
            <>
              Lyden er kodet med 64 000 bit per sekund og sendes i biter på 20 millisekunder. Hvor
              mange byte lyd er det i hver pakke?
            </>
          ),
          enhet: "byte",
          fasitTall: 160,
          fasit: <>64 000 bit/s · 0,020 s = 1280 bit = 160 byte.</>,
        }),
        konsept("ti-3-grenser", "Hvor mye forsinkelse tåler øret?", {
          ingress: <>Forsinkelsen måles fra munn til øre.</>,
          punkter: [
            "Under 150 millisekunder: merkes ikke.",
            "Mellom 150 og 400: merkbart, men brukbart.",
            "Over 400: samtalen bryter sammen.",
          ],
          merk: <>En pakke som kommer senere enn grensen, er like tapt som en som aldri kom.</>,
        }),
        konsept("ti-4-avspilling", "Når skal biten spilles av?", {
          ingress: <>Mottakeren må velge hvor lenge den venter før hver bit spilles av.</>,
          punkter: [
            "Fast forsinkelse: hver bit spilles av et fast antall millisekunder etter at den ble laget.",
            "Lang ventetid redder flere forsinkede pakker, men gjør samtalen treg.",
            "Tilpasset forsinkelse: mottakeren måler forsinkelsen og dens variasjon, og justerer ventetiden i pausene mellom setninger.",
          ],
        }),
        konsept("ti-5-tap", "Å leve med tap", {
          ingress: <>Omsending tar for lang tid. Tapene må skjules på andre måter.</>,
          punkter: [
            <>
              <Term>Feilrettende koding</Term> (forward error correction, FEC) — send litt ekstra
              informasjon, slik at en tapt bit kan gjenskapes fra naboene.
            </>,
            <>
              <Term>Sammenfletting</Term> — spre lyden fra én bit over flere pakker, slik at ett tap
              gir mange bittesmå hull i stedet for ett stort.
            </>,
            "Skjuling — gjenta den forrige biten, eller gjett mellom naboene.",
          ],
        }),
        konsept("ti-6-rtp", "RTP", {
          ingress: (
            <>
              <Term>RTP</Term> (Real-time Transport Protocol) er et felles hode for lyd og video.
              Det ligger inne i UDP-pakken.
            </>
          ),
          punkter: [
            "Type innhold — hvilken koding som er brukt.",
            "Sekvensnummer — lar mottakeren oppdage tap.",
            "Tidsstempel — sier når biten skal spilles av i forhold til de andre.",
          ],
          merk: <>RTP gir ingen garantier. Det gir bare mottakeren opplysningene den trenger.</>,
        }),
        anslag("ti-7-anslag", "Hvorfor ikke TCP?", {
          sporsmal: <>Hvorfor bruker tale UDP og ikke TCP?</>,
          valg: [
            { tekst: "UDP har bedre lydkvalitet" },
            {
              tekst:
                "TCP sender tapte pakker på nytt og bremser ved tap, og begge deler gir forsinkelse",
            },
            { tekst: "TCP kan ikke frakte lyd" },
          ],
          fasit: (
            <>
              En omsendt pakke kommer for sent til å brukes, og holder i tillegg tilbake alt som kom
              etter den. For tale er et lite hull bedre enn en lang pause.
            </>
          ),
        }),
        konsept("ti-8-sip", "Å finne den du vil ringe", {
          ingress: (
            <>
              Før lyden kan gå, må de to partene finne hverandre og bli enige om koding.{" "}
              <Term>SIP</Term> (Session Initiation Protocol) gjør det.
            </>
          ),
          punkter: [
            "Den som ringer sender en invitasjon til en adresse som ligner en e-postadresse.",
            "En mellomtjener vet hvilken IP-adresse mottakeren har akkurat nå.",
            "Når mottakeren svarer, går lyden direkte mellom de to med RTP.",
          ],
        }),
        sjekk("ti-9-sjekk", "Hva gjør tidsstempelet?", {
          sporsmal: <>Hva bruker mottakeren tidsstempelet i RTP-hodet til?</>,
          valg: [
            { tekst: "Å be om omsending", hvorfor: "RTP sender ingenting på nytt." },
            {
              tekst: "Å spille av bitene med riktig avstand, uansett når de kom fram",
              riktig: true,
              hvorfor: "Tidsstempelet fjerner virkningen av jitter.",
            },
            { tekst: "Å måle båndbredden", hvorfor: "Det sier bare når lyden ble tatt opp." },
          ],
          fasit: <>Sekvensnummeret avslører tap. Tidsstempelet gjenskaper rytmen.</>,
        }),
        recall("ti-10-recall", [
          {
            forside: "Hvilke forsinkelsesgrenser gjelder for tale?",
            bakside: "Under 150 ms merkes ikke, 150–400 ms er brukbart, over 400 ms er ubrukelig.",
          },
          {
            forside: "Nevn tre måter å håndtere tap i tale på uten omsending.",
            bakside: "Feilrettende koding, sammenfletting og skjuling.",
          },
          {
            forside: "Hvilke tre felt i RTP-hodet er viktigst?",
            bakside: "Type innhold, sekvensnummer og tidsstempel.",
          },
        ]),
        oppsummering("ti-11-opp", {
          punkter: [
            "Tale sendes i små UDP-pakker med RTP-hode.",
            "Avspillingsforsinkelsen er en avveining mellom tap og treghet.",
            "Tap skjules i stedet for å rettes.",
          ],
          videre: "Neste undertema: hva nettet selv kan gjøre for å hjelpe.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "tjenestekvalitet",
      tittel: "Tjenestekvalitet i nettet",
      utbytte:
        "Du kan forklare merking, prioritering og politikontroll, og regne på en lekk bøtte.",
      byggerPa: ["tale-over-ip", "inni-ruteren"],
      skjermer: [
        intro("tk-1-intro", "Beste innsats er ikke alltid nok", {
          ingress: (
            <>
              Internett behandler i utgangspunktet alle pakker likt. En stor nedlasting kan fylle
              køen i ruteren og ødelegge samtalen din. Skal nettet hjelpe, trengs tre ting.
            </>
          ),
        }),
        konsept("tk-2-merking", "Merking og prioritering", {
          ingress: <>Ruteren må kunne se forskjell på pakkene.</>,
          punkter: [
            "Pakkene merkes med en klasse i et felt i IP-hodet.",
            "Ruteren har én kø per klasse.",
            "En planleggingsdisiplin, for eksempel prioritet eller vektet rettferdig kø, avgjør hvem som slipper ut.",
          ],
          merk: <>Planleggingsdisiplinene er de samme som du lærte i emnet om nettverkslaget.</>,
        }),
        konsept("tk-3-isolasjon", "Ingen skal kunne ta alt", {
          ingress: (
            <>
              Hvis en klasse med høy prioritet sender mer enn avtalt, sulter den ut alle andre.
              Nettet må derfor holde hver strøm innenfor avtalen. Det kalles{" "}
              <Term>politikontroll</Term>, på engelsk policing.
            </>
          ),
          punkter: [
            "Gjennomsnittsrate: hvor mye over lang tid.",
            "Toppnivå: hvor mye på kort tid.",
            "Skurstørrelse: hvor mange pakker rett etter hverandre.",
          ],
        }),
        konsept("tk-4-botte", "Den lekke bøtta", {
          ingress: <>Den vanligste mekanismen for politikontroll er en bøtte med sendetegn.</>,
          punkter: [
            "Bøtta har plass til b sendetegn.",
            "Nye sendetegn drypper inn med r stykker per sekund. Er bøtta full, renner de over.",
            "En pakke må ta ett sendetegn for å slippe gjennom. Er bøtta tom, må pakken vente.",
          ],
          merk: <>I et tidsrom på t sekunder slipper det derfor gjennom høyst r · t + b pakker.</>,
        }),
        tallanslag("tk-5-regn", "Hvor mange slipper gjennom?", {
          sporsmal: (
            <>
              Bøtta rommer 20 sendetegn og fylles med 10 per sekund. Den er full når en stor skur
              med pakker kommer. Hvor mange pakker slipper gjennom i løpet av de første 3 sekundene?
            </>
          ),
          enhet: "pakker",
          fasitTall: 50,
          fasit: (
            <>
              r · t + b = 10 · 3 + 20 = 50 pakker. De 20 første går med en gang, resten i takt med
              påfyllingen.
            </>
          ),
        }),
        sjekk("tk-6-sjekk", "Hva begrenser skuren?", {
          sporsmal: <>Hvilken egenskap ved bøtta bestemmer hvor stor en skur kan være?</>,
          valg: [
            { tekst: "Påfyllingsraten r", hvorfor: "Raten bestemmer gjennomsnittet over tid." },
            {
              tekst: "Bøttestørrelsen b",
              riktig: true,
              hvorfor: "Det kan aldri ligge mer enn b sendetegn klare.",
            },
            {
              tekst: "Pakkestørrelsen",
              hvorfor: "Bøtta teller pakker, ikke byte, i denne modellen.",
            },
          ],
          fasit: <>b bestemmer skuren, r bestemmer gjennomsnittet.</>,
        }),
        recall("tk-7-recall", [
          {
            forside: "Hva er politikontroll?",
            bakside:
              "Å holde en strøm innenfor avtalt rate og skurstørrelse, slik at den ikke fortrenger andre.",
          },
          {
            forside: "Hvor mange pakker slipper en lekk bøtte gjennom på t sekunder?",
            bakside: "Høyst r · t + b, der r er påfyllingsraten og b er bøttestørrelsen.",
          },
        ]),
        oppsummering("tk-8-opp", {
          punkter: [
            "Merking lar ruteren skille klassene, og planlegging lar den prioritere.",
            "Politikontroll hindrer at én strøm tar alt.",
            "Den lekke bøtta begrenser både gjennomsnitt og skur.",
          ],
          videre: "Det var siste emne i faget. Bruk Øv for å teste deg på tvers av emnene.",
        }),
      ],
    },
  ],
};
