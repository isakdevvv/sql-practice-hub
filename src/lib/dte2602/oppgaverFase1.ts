// Fase 1 — Hva er maskinlæring?  Oppgaver av alle fem typene.
//
// Atomene fasen dekker: A01 (hva ML er), A02 (supervised / unsupervised /
// reinforcement), A03 (regresjon mot klassifikasjon).
//
// Ordforråd som brukes her er innført i denne rekkefølgen, og ingen term brukes
// før den er forklart i teksten:
//   maskinlæring → eksempel → fasit (merkelapp) → supervised / unsupervised /
//   reinforcement learning → target (det som skal forutsies) → feature (egenskap)
//   → regresjon → klassifikasjon → treningsdata / testdata.

import type { FaseOppgaver } from "./oppgaveTyper";

/* ================================================================== *
 * Type 1 — Anslå-så-sjekk (6 stk). Kommer FØR forklaringen.
 * ================================================================== */

const anslag: FaseOppgaver["anslag"] = [
  {
    id: "f1-a1-accuracy-99",
    sporsmal:
      "En modell skal oppdage en sjelden sykdom. Den treffer riktig på 99 % av tilfellene i et datasett der 99 % av pasientene faktisk er friske. Er modellen god?",
    kontekst:
      "10 000 pasienter i datasettet\n  9 900 friske\n    100 syke\nModellen får 99 % riktig.",
    alternativer: [
      {
        id: "ja",
        tekst: "Ja — 99 % riktig er et sterkt resultat.",
        respons:
          "Dette er anslaget nesten alle gjør først, og det er derfor denne fella er så effektiv. 99 % høres ut som nesten perfekt fordi vi er vant til at 99 % på en prøve er en toppkarakter. Men her er 99 % nøyaktig det du får ved å ikke gjøre noe som helst.",
      },
      {
        id: "nei-trivielt",
        tekst: "Nei — en modell som alltid svarer «frisk» får også 99 %, uten å ha lært noe.",
        respons:
          "Riktig. Regn etter: svar «frisk» på alle 10 000, og du bommer bare på de 100 syke. 9 900 / 10 000 = 99 %. Modellen din har altså ikke bevist at den kan noe i det hele tatt — den har bevist at klassene er skjeve.",
      },
      {
        id: "for-lite-info",
        tekst: "Umulig å si — det avhenger av hva modellen skal brukes til.",
        respons:
          "Klokt instinkt, og det stemmer at bruken avgjør hvilken feil som er verst. Men her kan vi faktisk konkludere allerede: siden 99 % er akkurat det en modell som alltid gjetter «frisk» oppnår, har tallet null informasjonsverdi. Det er ikke for lite informasjon — det er feil målestokk.",
      },
    ],
    fasit: "nei-trivielt",
    hvorfor:
      "Accuracy (andel riktige svar) er bare meningsfullt sammenlignet med en baseline: det trivielle svaret. På ubalanserte data er den trivielle baselinen «gjett alltid den vanligste klassen», og den scorer like høyt som klassen er stor. Dette er grunnen til at du senere i faget måler med presisjon og recall i stedet — de bryr seg om hva som skjer med de 100 syke.",
  },
  {
    id: "f1-a2-regelbasert-vs-laert",
    sporsmal:
      "Et spamfilter er bygget av 300 håndskrevne regler («inneholder ordet GRATIS», «avsender er ukjent», …). Spammerne begynner å skrive «G R A T I S». Hva skjer med filteret?",
    alternativer: [
      {
        id: "tilpasser",
        tekst: "Filteret tilpasser seg gradvis fordi det ser flere slike e-poster.",
        respons:
          "Det er beskrivelsen av en ML-modell, ikke av regler. Regler endrer seg ikke av å se data — de gjør nøyaktig det som står i dem, hver gang, til noen skriver dem om.",
      },
      {
        id: "slutter",
        tekst: "Filteret slipper dem gjennom til et menneske skriver en ny regel.",
        respons:
          "Riktig. Og det er hele forskjellen: kunnskapen ligger i regelteksten, som bare endrer seg når en programmerer redigerer den. En ML-modell henter kunnskapen ut av eksemplene, så den kan oppdateres ved å trene på nyere e-poster.",
      },
      {
        id: "krasjer",
        tekst: "Filteret feiler med en feilmelding.",
        respons:
          "Nei — det er nettopp det som gjør regelbaserte systemer lumske. De feiler stille. Ingen krasj, ingen advarsel; bare spam i innboksen.",
      },
    ],
    fasit: "slutter",
    hvorfor:
      "Maskinlæring er algoritmer som finner mønsteret ut fra eksempler, i stedet for at en programmerer skriver regelen. Fordelen er ikke at ML alltid er mer treffsikkert — det er at kunnskapen kan oppdateres ved å gi modellen nye eksempler, uten at noen må sitte og gjette hvilke nye triks motparten fant på.",
  },
  {
    id: "f1-a3-reinforcement-fasit",
    sporsmal:
      "En robot skal lære å gå. Ingen har laget en tabell over riktige bevegelser. Hva lærer den av?",
    alternativer: [
      {
        id: "fasittabell",
        tekst: "En fasittabell med riktig motorkommando for hver situasjon.",
        respons:
          "Det ville vært supervised learning — læring med fasit. Men premisset var jo at ingen slik tabell finnes, og det er nettopp derfor problemet ikke løses slik.",
      },
      {
        id: "belonning",
        tekst: "En belønning som sier hvor godt det gikk etter at den har prøvd noe.",
        respons:
          "Riktig. Dette er reinforcement learning (forsterkende læring): roboten prøver, får et tall som forteller hvor bra det gikk, og justerer. Ingen sier hva den skulle gjort — bare hvor godt det den gjorde fungerte.",
      },
      {
        id: "grupper",
        tekst: "Den grupperer bevegelsene sine i klynger som ligner hverandre.",
        respons:
          "Det beskriver unsupervised learning (læring uten fasit), som finner struktur i data. Men å finne grupper hjelper ikke roboten med å velge neste bevegelse — den trenger tilbakemelding på om valget var bra.",
      },
    ],
    fasit: "belonning",
    hvorfor:
      "De tre læringstypene skiller seg på hva slags tilbakemelding som finnes. Supervised: du har fasiten for hvert eksempel. Unsupervised: du har ingen fasit i det hele tatt. Reinforcement: du får ikke fasiten, men et mål på hvor bra det gikk — ofte først lenge etter handlingen.",
  },
  {
    id: "f1-a4-anbefaling",
    sporsmal:
      "En strømmetjeneste vil finne grupper av brukere med liknende smak, slik at den kan si «brukere som deg så også…». Ingen har merket brukerne med sjanger eller kategori. Hvilken læringstype er dette?",
    alternativer: [
      {
        id: "supervised",
        tekst: "Supervised — vi har jo seerhistorikken.",
        respons:
          "Seerhistorikk er data, men ikke fasit. Supervised learning krever at hvert eksempel har en kjent riktig verdi å lære mot. Her finnes det ingen «riktig gruppe» noen har skrevet ned.",
      },
      {
        id: "unsupervised",
        tekst: "Unsupervised — vi leter etter struktur uten å ha fasit.",
        respons:
          "Riktig. Dette er klustering: algoritmen finner grupper i dataene selv. Det vanskelige er ikke å finne grupper — det er å avgjøre om gruppene den fant betyr noe. Det tar du i Fase 5.",
      },
      {
        id: "reinforcement",
        tekst: "Reinforcement — tjenesten får jo tilbakemelding når folk klikker.",
        respons:
          "Godt observert, og i produksjon kan anbefalingssystemer faktisk trenes slik. Men slik oppgaven er formulert — finn grupper av liknende brukere — er det å finne struktur uten fasit, altså unsupervised.",
      },
    ],
    fasit: "unsupervised",
    hvorfor:
      "Test det slik hver gang: finnes det en kolonne med det riktige svaret for hvert eksempel? Har du den, er det supervised. Har du den ikke, og du leter etter struktur, er det unsupervised. Får du bare vite i etterkant hvor bra en handling var, er det reinforcement.",
  },
  {
    id: "f1-a5-samme-problem",
    sporsmal:
      "«Hvor mange minutter blir pakken forsinket?» og «Blir pakken forsinket — ja eller nei?». Er dette det samme maskinlæringsproblemet?",
    alternativer: [
      {
        id: "samme",
        tekst: "Ja — samme data, samme problem, bare formulert ulikt.",
        respons:
          "Dataene kan godt være de samme, men problemet er ikke det. Det som skiller er hva slags verdi modellen skal produsere: et tall, eller en av to kategorier. Det valget bestemmer algoritme, tapsfunksjon og hvilke metrikker du kan bruke.",
      },
      {
        id: "ulikt",
        tekst:
          "Nei — det første er regresjon (svar er et tall), det andre er klassifikasjon (svar er en kategori).",
        respons:
          "Riktig. Og legg merke til retningen: du kan alltid gå fra minutter til ja/nei ved å sette en grense, men aldri motsatt vei. Klassifikasjonsvarianten kaster informasjon.",
      },
      {
        id: "kommer-an",
        tekst: "Kommer an på om forsinkelsen måles i hele minutter eller ikke.",
        respons:
          "Det er ikke oppløsningen som avgjør. Selv om minutter er heltall, er de ordnet og kan sammenlignes — 40 minutter er dobbelt så ille som 20. Kategorier har ikke den egenskapen.",
      },
    ],
    fasit: "ulikt",
    hvorfor:
      "Regresjon forutsier et tall der avstand betyr noe. Klassifikasjon forutsier en kategori der «litt feil» ikke finnes — du traff eller bommet. Valget er ditt, ikke datasettets, og det bør styres av hvilken beslutning svaret skal brukes til.",
  },
  {
    id: "f1-a6-hvor-mye-data",
    sporsmal:
      "Du skal lære en modell å skille katt fra hund på bilder. Du har 12 merkede bilder. Hva skjer når du trener på dem?",
    alternativer: [
      {
        id: "funker",
        tekst: "Det går fint — 12 eksempler holder når forskjellen er så tydelig.",
        respons:
          "Forskjellen er tydelig for deg, som har sett hundretusenvis av dyr. Modellen ser bare tall i et rutenett av piksler. Med 12 eksempler finner den den enkleste regelen som skiller nettopp de tolv — for eksempel bakgrunnsfargen.",
      },
      {
        id: "utenat",
        tekst: "Modellen lærer akkurat disse tolv bildene utenat, og bommer på nye bilder.",
        respons:
          "Riktig. Dette har et navn — overtilpasning (overfitting) — og du møter det for alvor i Fase 3. Her holder det å se mekanismen: jo færre eksempler, jo lettere er det å finne en regel som passer dem perfekt uten å si noe om verden.",
      },
      {
        id: "feilmelding",
        tekst: "Treningen feiler fordi datasettet er for lite.",
        respons:
          "Nei, og det er nettopp problemet. Verktøyene klager ikke. Du får en modell, du får en score på treningsdataene, og den scoren kan til og med være 100 %. Feilen dukker først opp når modellen møter et bilde den ikke har sett.",
      },
    ],
    fasit: "utenat",
    hvorfor:
      "En modell lærer fra eksempler, og kan bare lære mønstre som faktisk finnes i eksemplene du ga den. Med for få eksempler er den enkleste forklaringen nesten alltid en tilfeldighet ved akkurat dine data. Derfor holder du alltid tilbake data modellen aldri har sett — det er den eneste ærlige testen.",
  },
];

/* ================================================================== *
 * Type 3 — Måloppgave med tilstandssjekk (4 stk).
 * Sjekker den samlede tilstanden av valgene, ikke ett og ett.
 * ================================================================== */

const maal: FaseOppgaver["maal"] = [
  {
    id: "f1-m1-reinnleggelse",
    tittel: "Sett opp problemet: reinnleggelse på sykehus",
    situasjon:
      "Et sykehus vil vite hvilke pasienter som sannsynligvis blir lagt inn igjen innen 30 dager etter utskrivning, slik at de kan følges opp ekstra. Sykehuset har fem år med journaldata, og for hver historisk utskrivning står det registrert om pasienten faktisk kom tilbake innen 30 dager.",
    maal: "Definer problemet slik at det kan løses med maskinlæring: velg læringstype, oppgavetype og hva som skal forutsies.",
    valg: [
      {
        id: "type",
        sporsmal: "Læringstype",
        alternativer: [
          { id: "sup", tekst: "Supervised — vi har fasit for historiske tilfeller" },
          { id: "unsup", tekst: "Unsupervised — vi leter etter grupper av pasienter" },
          { id: "rl", tekst: "Reinforcement — vi belønner god oppfølging" },
        ],
      },
      {
        id: "oppgave",
        sporsmal: "Oppgavetype",
        alternativer: [
          { id: "klass", tekst: "Klassifikasjon — kom tilbake innen 30 dager, ja eller nei" },
          { id: "regr", tekst: "Regresjon — antall dager til eventuell reinnleggelse" },
        ],
      },
      {
        id: "target",
        sporsmal: "Hva skal forutsies (target)?",
        alternativer: [
          { id: "reinn30", tekst: "«Reinnlagt innen 30 dager» (ja/nei)" },
          { id: "liggedogn", tekst: "«Antall liggedøgn ved reinnleggelsen»" },
          { id: "diagnose", tekst: "«Diagnosekode ved utskrivning»" },
        ],
      },
    ],
    vurder: (v) => {
      if (v.type !== "sup") {
        return {
          niva: "feil",
          tittel: "Feil læringstype",
          forklaring:
            "Datasettet inneholder utfallet for hver historiske utskrivning — altså fasit. Da kaster du bort den mest verdifulle informasjonen du har hvis du velger en metode som ikke bruker den. Supervised learning er valget når fasiten finnes.",
        };
      }
      if (v.target === "liggedogn") {
        return {
          niva: "feil",
          tittel: "Denne targeten finnes ikke når du trenger svaret",
          forklaring:
            "Antall liggedøgn ved reinnleggelsen kan bare måles etter at reinnleggelsen har skjedd. Modellen skal brukes ved utskrivning, altså før. Å trene på informasjon fra framtiden gir strålende tall i eksperimentet og ubrukelige prediksjoner i drift.",
        };
      }
      if (v.target === "diagnose") {
        return {
          niva: "feil",
          tittel: "Feil target",
          forklaring:
            "Diagnosekoden ved utskrivning er kjent allerede — det er en feature (egenskap som beskriver pasienten), ikke noe som skal forutsies. Targeten må være det du ikke vet ennå, men gjerne vil vite.",
        };
      }
      if (v.oppgave === "klass") {
        return {
          niva: "riktig",
          tittel: "Riktig oppsett",
          forklaring:
            "Supervised klassifikasjon med «reinnlagt innen 30 dager» som target. To ting å ta med videre: klassene blir svært ubalanserte (de fleste kommer ikke tilbake), så accuracy vil lyve — og fordi konsekvensen av å overse en pasient er verre enn å følge opp én for mye, er recall den metrikken som betyr noe her. Begge deler tar du i Fase 3.",
        };
      }
      return {
        niva: "forsvarlig",
        tittel: "Forsvarlig, men gjør jobben vanskeligere enn nødvendig",
        forklaring:
          "Regresjon på «antall dager til reinnleggelse» er ikke uforsvarlig — det gir mer informasjon enn ja/nei, og du kan alltid sette en grense i etterkant. Men to problemer melder seg: for de aller fleste pasientene finnes det ingen slik dag i det hele tatt (de kom aldri tilbake), og beslutningen sykehuset skal ta er binær — følge opp eller ikke. Når beslutningen er binær og de fleste eksemplene mangler en tallverdi, er klassifikasjon det enklere og ærligere valget.",
      };
    },
  },
  {
    id: "f1-m2-kundegrupper",
    tittel: "Sett opp problemet: kundegrupper i en butikkjede",
    situasjon:
      "En butikkjede har kjøpshistorikk for 40 000 kunder: hvor ofte de handler, hva de handler og for hvor mye. Markedsavdelingen vil «forstå kundene bedre» og lage målrettede tilbud. Ingen har på forhånd delt kundene inn i typer.",
    maal: "Velg et oppsett som faktisk kan gjennomføres med dataene som finnes — ikke det du skulle ønske at du hadde.",
    valg: [
      {
        id: "type",
        sporsmal: "Læringstype",
        alternativer: [
          { id: "sup", tekst: "Supervised — forutsi hvilken kundetype hver kunde er" },
          { id: "unsup", tekst: "Unsupervised — finn grupper i dataene selv" },
        ],
      },
      {
        id: "neste",
        sporsmal: "Hva gjør du med gruppene når algoritmen har funnet dem?",
        alternativer: [
          { id: "bruk", tekst: "Bruker dem direkte som segmenter i kampanjen" },
          {
            id: "tolk",
            tekst: "Ser på hva som kjennetegner hver gruppe og vurderer om skillet gir mening",
          },
          { id: "flere", tekst: "Øker antall grupper til hver kunde får sin egen" },
        ],
      },
    ],
    vurder: (v) => {
      if (v.type === "sup") {
        return {
          niva: "feil",
          tittel: "Du har ingen fasit å lære mot",
          forklaring:
            "Supervised learning krever en kolonne med riktig svar for hvert eksempel. Her har ingen skrevet ned hvilken type hver kunde er — det er jo nettopp det du prøver å finne ut. Uten fasit finnes det ingenting for modellen å måle seg mot.",
        };
      }
      if (v.neste === "flere") {
        return {
          niva: "feil",
          tittel: "Én gruppe per kunde er ingen gruppering",
          forklaring:
            "Med 40 000 grupper for 40 000 kunder har du bare skrevet om datasettet. Poenget med klustering er komprimering: færre kategorier enn du startet med, som likevel fanger det vesentlige. Å velge antall grupper er den egentlige jobben, og du får verktøy for det i Fase 5.",
        };
      }
      if (v.neste === "tolk") {
        return {
          niva: "riktig",
          tittel: "Riktig — og du unngikk den vanligste fella",
          forklaring:
            "Unsupervised med et tolkningssteg etterpå. Klusteralgoritmer returnerer alltid grupper, også når dataene er ren støy. Det finnes ingen fasit å måle mot, så kvalitetskontrollen må være menneskelig: kjenner markedsavdelingen igjen gruppene, og er de forskjellige på noe som betyr noe?",
        };
      }
      return {
        niva: "forsvarlig",
        tittel: "Riktig læringstype, men du hoppet over kvalitetskontrollen",
        forklaring:
          "Unsupervised er riktig valg. Men å bruke gruppene direkte er risikabelt: algoritmen gir deg alltid det antallet grupper du ber om, uansett om det finnes noen. Uten et tolkningssteg vet du ikke om du segmenterer på noe ekte eller på støy.",
      };
    },
  },
  {
    id: "f1-m3-stromforbruk",
    tittel: "Sett opp problemet: strømforbruk neste time",
    situasjon:
      "Et nettselskap vil anslå hvor mange kilowattimer et boligområde bruker neste time, basert på temperatur, klokkeslett, ukedag og forbruket de siste timene. De har fire år med timesmålinger.",
    maal: "Velg oppgavetype og en metrikkfamilie som passer til den.",
    valg: [
      {
        id: "oppgave",
        sporsmal: "Oppgavetype",
        alternativer: [
          { id: "regr", tekst: "Regresjon — forbruk i kilowattimer" },
          { id: "klass", tekst: "Klassifikasjon — lavt / middels / høyt forbruk" },
        ],
      },
      {
        id: "metrikk",
        sporsmal: "Hva slags mål på treffsikkerhet passer?",
        alternativer: [
          { id: "avvik", tekst: "Gjennomsnittlig avvik i kilowattimer" },
          { id: "andel", tekst: "Andel riktige svar (accuracy)" },
        ],
      },
    ],
    vurder: (v) => {
      if (v.oppgave === "regr" && v.metrikk === "avvik") {
        return {
          niva: "riktig",
          tittel: "Riktig, og de to valgene henger sammen",
          forklaring:
            "Regresjon fordi svaret er et tall der avstand betyr noe: å bomme med 2 kilowattimer er langt bedre enn å bomme med 200. Da må målestokken også være en avstand målt i kilowattimer. Accuracy finnes ikke for regresjon — det er ingen «riktig» å treffe eksakt.",
        };
      }
      if (v.oppgave === "regr") {
        return {
          niva: "feil",
          tittel: "Riktig oppgavetype, umulig metrikk",
          forklaring:
            "Med regresjon treffer du praktisk talt aldri eksakt riktig tall, så «andel riktige» blir null uansett hvor god modellen er. Regresjon måles med avstand: gjennomsnittlig avvik, eller kvadrert avvik hvis store bom skal straffes ekstra hardt. Navnene på disse (MAE, RMSE, R²) møter du i Fase 3.",
        };
      }
      if (v.metrikk === "andel") {
        return {
          niva: "forsvarlig",
          tittel: "Henger sammen, men du kaster informasjon i unødvendig grad",
          forklaring:
            "Å dele forbruket i lavt/middels/høyt og måle andel riktige er internt konsistent, og hvis nettselskapet bare skal ta én av tre handlinger, kan det være det riktige valget. Men grensene mellom kategoriene må noen bestemme, og en modell som bommer så vidt over grensa straffes like hardt som en som bommer med en faktor ti. Har du tallet, behold tallet — du kan alltid kategorisere svaret i etterkant.",
        };
      }
      return {
        niva: "feil",
        tittel: "Valgene passer ikke sammen",
        forklaring:
          "Du valgte klassifikasjon i tre kategorier, men vil måle avvik i kilowattimer. Kategorien «middels» har ingen kilowattverdi å regne avvik fra. Oppgavetype og metrikk må høre sammen: kategorier måles med andeler, tall måles med avstand.",
      };
    },
  },
  {
    id: "f1-m4-fa-merkede",
    tittel: "Sett opp problemet: 200 merkede e-poster av 50 000",
    situasjon:
      "En bedrift vil filtrere ut e-poster som inneholder kundeklager, slik at de havner hos rett avdeling. De har 50 000 lagrede e-poster, men bare 200 av dem er merket av et menneske med «klage» eller «ikke klage».",
    maal: "Velg en framgangsmåte som er ærlig om hva dataene tillater akkurat nå.",
    valg: [
      {
        id: "type",
        sporsmal: "Hva gjør du?",
        alternativer: [
          {
            id: "sup200",
            tekst: "Trener supervised på de 200 merkede og bruker modellen på resten",
          },
          {
            id: "merk-mer",
            tekst: "Merker flere e-poster først, og trener supervised etterpå",
          },
          {
            id: "unsup",
            tekst: "Kluster alle 50 000 uten fasit og kaller den ene gruppen «klager»",
          },
        ],
      },
      {
        id: "kontroll",
        sporsmal: "Hvordan sjekker du om det ble bra?",
        alternativer: [
          {
            id: "holdt-tilbake",
            tekst: "Holder tilbake en del av de merkede e-postene som modellen aldri får se",
          },
          {
            id: "alle-merkede",
            tekst: "Måler på alle de merkede e-postene, også de den trente på",
          },
        ],
      },
    ],
    vurder: (v) => {
      if (v.kontroll === "alle-merkede") {
        return {
          niva: "feil",
          tittel: "Du måler på data modellen allerede har sett",
          forklaring:
            "Uansett hvilken framgangsmåte du valgte: å måle på de samme eksemplene modellen trente på forteller deg bare hvor godt den husker, ikke hvor godt den generaliserer. Med bare 200 merkede eksempler er dette ekstra farlig — en modell kan pugge 200 e-poster fullstendig.",
        };
      }
      if (v.type === "unsup") {
        return {
          niva: "feil",
          tittel: "Klustering svarer ikke på spørsmålet ditt",
          forklaring:
            "Klustering finner grupper av e-poster som ligner hverandre — men den vet ingenting om hva en klage er. Gruppene vil like gjerne skille på språk, lengde eller avsenderdomene. Og du har faktisk 200 merkede eksempler; å ignorere dem er å kaste den eneste fasiten du har.",
        };
      }
      if (v.type === "merk-mer") {
        return {
          niva: "riktig",
          tittel: "Riktig — og dette er svaret sensor vil se",
          forklaring:
            "Med 200 eksempler, hvorav kanskje 30 er klager, er det ikke nok signal til en modell du tør stole på. Det billigste tiltaket er nesten alltid mer merket data, ikke en smartere algoritme. Studenter som svarer «mer data først» og begrunner det med hvor lite signal 200 eksempler gir, viser en modenhet valg av algoritme aldri viser.",
        };
      }
      return {
        niva: "forsvarlig",
        tittel: "Går an som første forsøk, men vær ærlig om usikkerheten",
        forklaring:
          "Å trene på 200 eksempler er ikke forbudt, og med en holdt tilbake del kan du i det minste måle noe. Men resultatet blir svært usikkert: holder du tilbake 50 e-poster, kan noen få enkelttilfeller flytte scoren dramatisk. Bruk det som en pekepinn på om problemet i det hele tatt er løsbart, og prioriter deretter mer merket data.",
      };
    },
  },
];

/* ================================================================== *
 * Type 4 — Feilsøking (4 stk). Feilen er reell og bor i oppsettet,
 * ikke i syntaksen.
 * ================================================================== */

const feilsoking: FaseOppgaver["feilsoking"] = [
  {
    id: "f1-f1-trener-og-tester-samme",
    tittel: "Modellen fikk 100 %, men bommer i praksis",
    symptom:
      "En medstudent presenterer et prosjekt med 100 % treffsikkerhet. Når modellen brukes på e-poster som kom inn denne uka, treffer den omtrent halvparten.",
    format: "steg",
    linjer: [
      { nr: 1, tekst: "Samlet inn 4 000 e-poster merket «spam» eller «ikke spam»." },
      { nr: 2, tekst: "Valgte supervised klassifikasjon, siden fasiten finnes." },
      { nr: 3, tekst: "Trente modellen på alle 4 000 e-postene." },
      { nr: 4, tekst: "Målte treffsikkerhet på de samme 4 000 e-postene: 100 %." },
      { nr: 5, tekst: "Konkluderte med at modellen er klar til bruk." },
    ],
    feilLinje: 4,
    linjeRespons: {
      1: "4 000 merkede e-poster er et helt greit utgangspunkt. Mengden er ikke problemet her.",
      2: "Riktig valg. Fasiten finnes, svaret er en kategori — supervised klassifikasjon.",
      3: "Å trene på alle dataene er isolert sett ikke feilen. Feilen oppstår i det du også måler på dem. Se linja under.",
      4: "Her er feilen. Modellen måles på nøyaktig de eksemplene den lærte utenat. Det er som å gi en elev fasiten og deretter samme prøve — 100 % beviser hukommelse, ikke forståelse.",
      5: "Konklusjonen er gal, men den er en følge av feilen lenger opp, ikke feilen selv.",
    },
    fikser: [
      {
        id: "hold-tilbake",
        tekst:
          "Del dataene i to før trening: tren på den ene delen, mål på den andre som modellen aldri har sett.",
        riktig: true,
        respons:
          "Riktig. Dette er train/test-oppdeling, fundamentet i Fase 3. Regelen er enkel og hellig: det du måler på, skal modellen aldri ha sett under trening.",
      },
      {
        id: "flere-data",
        tekst: "Samle inn 40 000 e-poster i stedet for 4 000.",
        riktig: false,
        respons:
          "Mer data er nesten alltid bra, men det retter ikke denne feilen. Måler du fortsatt på treningsdataene, får du 100 % med 40 000 e-poster også.",
      },
      {
        id: "enklere-modell",
        tekst: "Bruke en enklere modell som ikke klarer å pugge.",
        riktig: false,
        respons:
          "Det ville dempe symptomet — 100 % blir kanskje til 94 % — men tallet er fortsatt målt på feil data og betyr fortsatt ingenting. Man retter ikke en ugyldig måling ved å gjøre den mindre pen.",
      },
    ],
    laerdom:
      "Et resultat er bare gyldig hvis det er målt på data modellen ikke har sett. 100 % på treningsdata er ikke et godt tegn — det er et varsel om at du måler feil ting.",
  },
  {
    id: "f1-f2-target-fra-framtiden",
    tittel: "Modellen forutsier med 97 % — og er likevel verdiløs",
    symptom:
      "En modell skal forutsi ved innsjekk hvilke pasienter som blir liggende mer enn en uke. Den treffer 97 % i testen, men avdelingen kan ikke bruke den: tallene den trenger finnes ikke ved innsjekk.",
    format: "steg",
    linjer: [
      { nr: 1, tekst: "Mål: ved innsjekk anslå om liggetiden blir over sju døgn." },
      { nr: 2, tekst: "Target: «liggetid over sju døgn» (ja/nei), hentet fra journalen." },
      {
        nr: 3,
        tekst:
          "Features: alder, diagnose ved innsjekk, antall tidligere innleggelser, totalt antall medisindoser gitt under oppholdet.",
      },
      { nr: 4, tekst: "Supervised klassifikasjon, trent på 12 000 historiske opphold." },
      { nr: 5, tekst: "Målt på data modellen ikke har sett: 97 % riktig." },
    ],
    feilLinje: 3,
    linjeRespons: {
      1: "Målformuleringen er tydelig og inneholder tidspunktet svaret trengs — det er faktisk den som avslører feilen lenger nede.",
      2: "Targeten er riktig valgt: det er akkurat dette avdelingen vil vite, og verdien er kjent i historiske data.",
      3: "Her er feilen. «Totalt antall medisindoser gitt under oppholdet» kan først telles når oppholdet er over. Ved innsjekk er tallet null for alle. Modellen har lært at mange doser betyr langt opphold — sant, men ubrukelig, fordi opplysningen ikke finnes når svaret trengs.",
      4: "Valg av læringstype og datamengde er greit. Problemet er hva som ligger i én av kolonnene.",
      5: "Oppdelingen er gjort riktig — og likevel er tallet verdiløst. Det er nettopp derfor denne feilen er så lumsk: den overlever alle de vanlige kontrollene.",
    },
    fikser: [
      {
        id: "fjern-fremtid",
        tekst: "Fjern alle features som ikke finnes på prediksjonstidspunktet, og tren på nytt.",
        riktig: true,
        respons:
          "Riktig. Gå gjennom hver kolonne og still ett spørsmål: kjenner jeg denne verdien i det øyeblikket jeg trenger svaret? Nei betyr ut. Scoren faller — og det er den ærlige scoren.",
      },
      {
        id: "vekt-ned",
        tekst: "Behold kolonnen, men gi den lavere vekt i modellen.",
        riktig: false,
        respons:
          "Vekten er ikke problemet. Kolonnen er tom ved innsjekk uansett hvilken vekt den har, så modellen vil oppføre seg helt annerledes i drift enn i testen.",
      },
      {
        id: "bedre-split",
        tekst: "Dele opp dataene etter tid i stedet for tilfeldig.",
        riktig: false,
        respons:
          "Tidsbasert oppdeling er et fornuftig grep i mange prosjekter, men det redder ikke dette. Kolonnen er fra framtiden i hver eneste rad, uansett hvordan radene fordeles.",
      },
    ],
    laerdom:
      "Før du bruker en kolonne som feature: spør om verdien finnes i det øyeblikket modellen skal svare. Kolonner fra framtiden gir høye tall i eksperimentet og ingenting i drift. Sensorer leter aktivt etter dette.",
  },
  {
    id: "f1-f3-unsupervised-med-fasit",
    tittel: "Klustering på data som allerede har fasit",
    symptom:
      "Et prosjekt skal skille friske fra syke trær ut fra dronebilder. Resultatet er tre grupper som ikke lar seg tolke, og ingen kan si om modellen er god.",
    format: "steg",
    linjer: [
      {
        nr: 1,
        tekst: "Datasett: 3 000 trebilder, hvert merket «frisk» eller «angrepet» av en botaniker.",
      },
      { nr: 2, tekst: "Mål: avgjøre om et nytt tre er angrepet." },
      { nr: 3, tekst: "Valgte unsupervised klustering fordi bilder er kompliserte." },
      { nr: 4, tekst: "Kjørte algoritmen med tre grupper." },
      { nr: 5, tekst: "Prøvde å tolke hva de tre gruppene betyr." },
    ],
    feilLinje: 3,
    linjeRespons: {
      1: "Merk deg ordet «merket». Datasettet har fasit — det er avgjørende for hvilken læringstype som er riktig.",
      2: "Målet er tydelig og binært: angrepet eller ikke. Det peker rett mot klassifikasjon.",
      3: "Her er feilen. Begrunnelsen forveksler to ting: hvor kompliserte dataene er, og om det finnes fasit. Kompliserte data er et argument for en kraftigere modell, ikke for å kaste merkelappene. Med fasit tilgjengelig er supervised klassifikasjon riktig.",
      4: "Antall grupper er en følgefeil. Med fasit skulle svaret ha to utfall, ikke tre.",
      5: "Tolkningssteget er riktig håndverk i et unsupervised-prosjekt — men her er hele oppsettet feil, så det er ingenting å tolke.",
    },
    fikser: [
      {
        id: "supervised",
        tekst: "Bytt til supervised klassifikasjon med botanikerens merkelapper som target.",
        riktig: true,
        respons:
          "Riktig. Fasiten er den dyreste ressursen i prosjektet — en fagperson har brukt tid på hvert eneste bilde. Da bruker du den. Og du får noe klustering aldri gir: et tall som sier hvor ofte modellen har rett.",
      },
      {
        id: "to-grupper",
        tekst: "Behold klustering, men be om to grupper i stedet for tre.",
        riktig: false,
        respons:
          "To grupper gjør det lettere å håpe at den ene er «angrepet», men algoritmen vet fortsatt ingenting om angrep. Den kan like gjerne dele på lysforhold eller opptaksvinkel — og du har fremdeles ingen måte å måle om den har rett.",
      },
      {
        id: "begge",
        tekst: "Kjøre begge deler og velge den som gir høyest score.",
        riktig: false,
        respons:
          "Det finnes ingen felles score å sammenligne på. Unsupervised gir ingen treffsikkerhet, fordi det ikke finnes noe å treffe. Å velge mellom dem må gjøres på hva problemet er, ikke på et tall.",
      },
    ],
    laerdom:
      "Læringstypen bestemmes av om fasit finnes, ikke av hvor kompliserte dataene er. Har du merkelapper og et konkret spørsmål: bruk dem.",
  },
  {
    id: "f1-f4-accuracy-ubalanse",
    tittel: "Svindeldeteksjon med 99,8 % treffsikkerhet",
    symptom:
      "En modell for korttransaksjoner rapporterer 99,8 % riktig. Banken tester den på en måned med drift, og den fanget null svindelforsøk.",
    format: "steg",
    linjer: [
      { nr: 1, tekst: "Datasett: 500 000 transaksjoner, hvorav 900 er svindel." },
      { nr: 2, tekst: "Supervised klassifikasjon med target «svindel» (ja/nei)." },
      { nr: 3, tekst: "Delte i treningsdata og testdata som modellen aldri ser." },
      { nr: 4, tekst: "Valgte andel riktige svar (accuracy) som mål på hvor god modellen er." },
      { nr: 5, tekst: "Fikk 99,8 % og leverte modellen." },
    ],
    feilLinje: 4,
    linjeRespons: {
      1: "Legg merke til forholdstallet: 900 av 500 000 er under 0,2 %. Det er selve premisset for feilen — men ikke feilen i seg selv.",
      2: "Riktig læringstype og riktig target. Ingenting galt her.",
      3: "Oppdelingen er gjort riktig. Det er nettopp derfor dette eksempelet er lærerikt: alle de vanlige forholdsreglene er på plass, og resultatet er likevel verdiløst.",
      4: "Her er feilen. Med 0,18 % svindel får en modell som alltid svarer «ikke svindel» hele 99,82 % riktig. Metrikken kan altså ikke skille en modell som fungerer fra en som ikke gjør noe.",
      5: "Leveransen er en følge av at målestokken var feil valgt, ikke en feil i seg selv.",
    },
    fikser: [
      {
        id: "recall",
        tekst:
          "Mål i stedet hvor stor andel av de faktiske svindeltilfellene modellen fanger, og hvor mange falske alarmer det koster.",
        riktig: true,
        respons:
          "Riktig. De to tallene heter recall og presisjon, og du jobber med dem i Fase 3. Poenget her er valget: når den ene klassen er sjelden og viktig, må målestokken handle om nettopp den klassen.",
      },
      {
        id: "baseline",
        tekst:
          "Først regne ut hva en modell som alltid svarer «ikke svindel» ville fått, og sammenligne mot det.",
        riktig: true,
        respons:
          "Også riktig, og det er det billigste grepet av alle. Baselinen avslører umiddelbart at 99,8 % ligger under det du får ved å ikke gjøre noe. Å oppgi baseline ved siden av resultatet er et av de sikreste poengene i mappa.",
      },
      {
        id: "mer-data",
        tekst: "Samle inn flere transaksjoner.",
        riktig: false,
        respons:
          "Flere transaksjoner endrer ikke forholdet mellom klassene — du får flere av begge. Accuracy vil fortsatt være ubrukelig som målestokk.",
      },
    ],
    laerdom:
      "Et resultat uten baseline er ikke et resultat. Regn alltid ut hva den trivielle løsningen ville fått, og oppgi begge tall. På ubalanserte data er dette forskjellen mellom et prosjekt som ser bra ut og et som er bra.",
  },
];

/* ================================================================== *
 * Type 5 — Recall-kort. Med vilje få: dette er en hjemmeeksamen, og
 * du har notatene dine. Bare det som må komme umiddelbart står her.
 * ================================================================== */

const recall: FaseOppgaver["recall"] = [
  {
    id: "f1-r1",
    forside: "Hva skiller en maskinlæringsmodell fra et regelbasert system?",
    bakside:
      "Regelbasert: mennesket skriver reglene, og de endrer seg bare når noen redigerer dem. Maskinlæring: algoritmen finner mønsteret ut fra eksempler, og oppdateres ved å trene på nye eksempler.",
    hvorfor:
      "Dette er skillet hele faget hviler på, og formuleringen «lærer fra eksempler i stedet for at reglene skrives» er den du trenger i innledningen på mappa.",
  },
  {
    id: "f1-r2",
    forside: "De tre læringstypene — hva skiller dem?",
    bakside:
      "Supervised: hvert eksempel har en kjent fasit å lære mot. Unsupervised: ingen fasit finnes, du leter etter struktur. Reinforcement: ingen fasit, men en belønning som sier hvor bra en handling var.",
    hvorfor:
      "Dette er det første valget i ethvert prosjekt, og det tar to sekunder å avgjøre når skillet sitter: finnes det en kolonne med riktig svar?",
  },
  {
    id: "f1-r3",
    forside: "Regresjon eller klassifikasjon — hva avgjør?",
    bakside:
      "Om det som skal forutsies er et tall der avstand betyr noe (regresjon) eller en kategori der «litt feil» ikke finnes (klassifikasjon).",
    hvorfor:
      "Valget bestemmer algoritme og metrikk. Å bruke accuracy på et regresjonsproblem, eller avvik i enheter på et klassifikasjonsproblem, er en feil sensor merker med én gang.",
  },
  {
    id: "f1-r4",
    forside: "Hva er en feature, og hva er en target?",
    bakside:
      "Feature (egenskap): en kolonne som beskriver eksempelet og er kjent når du trenger svaret. Target: kolonnen med det du vil forutsi, og som må være ukjent på prediksjonstidspunktet.",
    hvorfor:
      "«Kjent på prediksjonstidspunktet» er den delen av definisjonen folk glemmer — og den er kilden til de dyreste feilene i faget.",
  },
];

export const FASE1_OPPGAVER: FaseOppgaver = {
  anslag,
  maal,
  feilsoking,
  recall,
};
