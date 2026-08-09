// Fase 2 — Data og features. Oppgaver av alle fem typene.
//
// Atomene fasen dekker: A04 (features og target), A05 (numerisk mot kategorisk),
// A06 (manglende verdier), A07 (skalering), A08 (one-hot encoding), A09
// (utforskende dataanalyse).
//
// Nye termer innføres her, i denne rekkefølgen, og ingen brukes før den er
// forklart i teksten på modulsiden:
//   kolonne → kardinalitet (antall ulike verdier) → manglende verdi (NaN) →
//   imputering (utfylling) → skalering → one-hot encoding →
//   target encoding → treningsdata / testdata → datalekkasje → pipeline.
//
// Forkortelser skrives ut første gang de brukes: NaN (Not a Number — markøren
// for en verdi som mangler), EDA (exploratory data analysis, utforskende
// dataanalyse), SMOTE (Synthetic Minority Over-sampling Technique).

import type { FaseOppgaver } from "./oppgaveTyper";

/* ================================================================== *
 * Type 1 — Anslå-så-sjekk (6 stk). FØR forklaringen.
 * ================================================================== */

const anslag: FaseOppgaver["anslag"] = [
  {
    id: "f2-a1-postnummer-onehot",
    sporsmal:
      "En kolonne inneholder norske postnumre. Du gjør den om til 0/1-kolonner med one-hot encoding, der hver unike verdi får sin egen kolonne. Hvor mange kolonner får du?",
    kontekst: "postnummer\n---------\n0150\n5003\n9008\n0150\n7010\n...",
    alternativer: [
      {
        id: "fire",
        tekst: "Fire — postnummeret har fire sifre.",
        respons:
          "Antall sifre har ingenting med saken å gjøre. One-hot encoding lager én kolonne per unike verdi som finnes i kolonnen, ikke per tegn.",
      },
      {
        id: "ti",
        tekst: "Rundt ti — omtrent én per landsdel.",
        respons:
          "Det ville vært resultatet om du først grupperte postnumrene til regioner. Men one-hot encoding grupperer ingenting; den behandler hver eneste unike verdi som sin egen kategori.",
      },
      {
        id: "tusenvis",
        tekst: "Flere tusen — ett per unikt postnummer i datasettet.",
        respons:
          "Riktig. Norge har rundt 5 000 postnumre i bruk. Har datasettet ditt 3 000 av dem, får du 3 000 nye kolonner, hver med nesten bare nuller.",
      },
    ],
    fasit: "tusenvis",
    hvorfor:
      "Antall unike verdier i en kolonne kalles kardinaliteten. One-hot encoding lager én kolonne per unik verdi, så høy kardinalitet gir en eksplosjon i antall kolonner — og hver av dem er nesten tom. Det er derfor postnummer nesten alltid grupperes (til de to første sifrene, til kommune eller til landsdel) før det encodes. Merk også at postnummer ser ut som et tall, men ikke er det: 9008 er ikke «mer» enn 0150.",
  },
  {
    id: "f2-a2-median-vs-gjennomsnitt",
    sporsmal:
      "Kolonnen «årsinntekt» mangler verdi for 8 % av personene. Fordelingen er kraftig høyreskjev: de fleste ligger rundt 500 000, men noen få ligger over 20 millioner. Du skal fylle inn de manglende verdiene. Gjennomsnitt eller median?",
    alternativer: [
      {
        id: "gjennomsnitt",
        tekst: "Gjennomsnitt — det bruker all informasjonen i kolonnen.",
        respons:
          "Gjennomsnittet bruker riktignok alle verdiene, men det er også problemet: noen få inntekter på 20 millioner drar gjennomsnittet langt over det de aller fleste tjener. Da fyller du inn en verdi nesten ingen faktisk har.",
      },
      {
        id: "median",
        tekst: "Median — den påvirkes ikke av de ekstreme verdiene.",
        respons:
          "Riktig. Medianen er verdien i midten når du sorterer, og flytter seg ikke om den høyeste inntekten er 20 eller 200 millioner. På skjeve fordelinger er den et langt mer typisk anslag.",
      },
      {
        id: "null",
        tekst: "Fyll inn 0 — da er det tydelig at verdien manglet.",
        respons:
          "Tydelig for deg, men ikke for modellen. Modellen ser tallet 0 og tolker det som «tjener ingenting», som er en sterk og gal påstand. Vil du markere at noe manglet, lager du en egen ja/nei-kolonne for det.",
      },
    ],
    fasit: "median",
    hvorfor:
      "Å fylle inn manglende verdier heter imputering. Tommelfingerregelen: median for skjeve tallkolonner, gjennomsnitt for noenlunde symmetriske, og hyppigste verdi for kategorier. Se alltid på histogrammet før du velger — det er nettopp derfor utforskende dataanalyse kommer før forbehandlingen.",
  },
  {
    id: "f2-a3-knn-uten-skalering",
    sporsmal:
      "En modell finner de nærmeste naboene til en person ved å måle avstand i to kolonner: alder (18–90 år) og årsinntekt (200 000–1 500 000 kroner). Kolonnene er ikke skalert. Hvilken av dem bestemmer i praksis hvem som blir naboer?",
    kontekst:
      "Person A: alder 30, inntekt 400 000\nPerson B: alder 65, inntekt 405 000\n\nForskjell i alder:   35\nForskjell i inntekt: 5 000",
    alternativer: [
      {
        id: "alder",
        tekst: "Alder — den varierer prosentvis mest.",
        respons:
          "Avstand regnes i absolutte tall, ikke i prosent. En aldersforskjell på 35 blir borte ved siden av en inntektsforskjell på 5 000, selv om 35 år er en enorm forskjell mellom to mennesker.",
      },
      {
        id: "inntekt",
        tekst: "Inntekt — tallene er så mye større at de dominerer avstanden.",
        respons:
          "Riktig. I eksempelet er de to personene 35 år fra hverandre, men avstandsmålet ser hovedsakelig differansen på 5 000 kroner. Alder blir i praksis ignorert.",
      },
      {
        id: "likt",
        tekst: "Begge like mye — det er jo to kolonner.",
        respons:
          "Det er nettopp det man intuitivt tror, og derfor denne feilen er så vanlig. Algoritmen vekter ikke kolonner likt; den summerer differansene som de er, og da vinner kolonnen med de største tallene.",
      },
    ],
    fasit: "inntekt",
    hvorfor:
      "Alle metoder som måler avstand — k nærmeste naboer, k-means, støttevektormaskiner — er følsomme for enheter. Skalering bringer kolonnene til sammenlignbar størrelse, slik at «ett år» og «tusen kroner» ikke konkurrerer på ulike vilkår. Beslutningstrær er derimot upåvirket: de sammenligner innenfor én kolonne av gangen.",
  },
  {
    id: "f2-a4-drop-rader",
    sporsmal:
      "Datasettet har 10 kolonner. I hver av dem mangler 5 % av verdiene, tilfeldig fordelt. Du sletter alle rader som mangler minst én verdi. Hvor stor andel av radene sitter du igjen med?",
    alternativer: [
      {
        id: "95",
        tekst: "Rundt 95 % — det manglet jo bare 5 %.",
        respons:
          "5 % er andelen per kolonne, ikke per rad. En rad overlever bare hvis den er komplett i alle ti kolonnene samtidig.",
      },
      {
        id: "60",
        tekst: "Rundt 60 %.",
        respons:
          "Riktig. Sannsynligheten for at én kolonne er utfylt er 0,95. For at alle ti skal være det: 0,95 opphøyd i 10, altså cirka 0,60. Du mister fire av ti rader på noe som så ut som en bagatell.",
      },
      {
        id: "50",
        tekst: "Rundt 50 % — halvparten.",
        respons:
          "Nær, men litt for pessimistisk. Det eksakte tallet er 0,95 opphøyd i 10 ≈ 0,60. Poenget står uansett: tapet er mangedobbelt større enn de 5 % man ser på hver enkelt kolonne.",
      },
    ],
    fasit: "60",
    hvorfor:
      "Manglende verdier multipliseres på tvers av kolonner. Derfor er «bare slett radene» sjelden gratis, og det blir verre jo flere kolonner du har. Verre ennå: hvis verdiene ikke mangler tilfeldig — for eksempel at det er høyinntektsgruppen som lar inntektsfeltet stå tomt — er de radene du sletter systematisk annerledes enn de du beholder, og datasettet ditt blir skjevt.",
  },
  {
    id: "f2-a5-mangler-som-signal",
    sporsmal:
      "I et lånesøknadsskjema er feltet «nåværende arbeidsgiver» tomt for 12 % av søkerne. Er det at feltet er tomt i seg selv nyttig informasjon for modellen?",
    alternativer: [
      {
        id: "nei",
        tekst: "Nei — en manglende verdi er bare fravær av data.",
        respons:
          "Det stemmer når verdier mangler tilfeldig, for eksempel ved en teknisk feil i innsamlingen. Men her er tomheten et valg søkeren tok, og valg bærer informasjon.",
      },
      {
        id: "ja",
        tekst: "Ja — at feltet er tomt kan i seg selv henge sammen med det som skal forutsies.",
        respons:
          "Riktig. Den som ikke har en arbeidsgiver å oppgi, er kanskje arbeidsledig, selvstendig eller nyankommet. Fyller du bare inn «ukjent» og går videre, kaster du dette signalet.",
      },
      {
        id: "kun-mange",
        tekst: "Bare hvis mer enn halvparten mangler.",
        respons:
          "Andelen avgjør ikke om tomheten bærer informasjon. 12 % er mer enn nok til at en modell kan plukke opp sammenhengen, hvis den finnes.",
      },
    ],
    fasit: "ja",
    hvorfor:
      "Standardgrepet er å legge til en egen ja/nei-kolonne — «arbeidsgiver_manglet» — i tillegg til å fylle inn selve verdien. Da beholder du begge deler: et brukbart tall i den opprinnelige kolonnen, og informasjonen om at det var utfylt av deg og ikke av søkeren. Men vær våken: nettopp fordi signalet er sterkt, kan det også bære en skjevhet du ikke ønsker å forsterke. Det tar du i Fase 7.",
  },
  {
    id: "f2-a6-skalere-for-split",
    sporsmal:
      "Du skalerer hele datasettet i én operasjon, og deler først etterpå i treningsdata og testdata. Hvor mye påvirker det testresultatet?",
    kontekst:
      "skaler = StandardScaler()\nX_skalert = skaler.fit_transform(X)          # hele datasettet\nX_tren, X_test = train_test_split(X_skalert)",
    alternativer: [
      {
        id: "ingenting",
        tekst: "Ingenting — skalering endrer jo bare enhetene.",
        respons:
          "Skalering endrer enhetene, men tallene den skalerer med — gjennomsnittet og spredningen — er regnet ut fra alle radene, også testradene. Dermed har informasjon fra testsettet allerede påvirket treningsdataene.",
      },
      {
        id: "litt-optimistisk",
        tekst:
          "Litt: testresultatet blir noe for optimistisk, fordi testsettet har vært med på å bestemme skaleringen.",
        respons:
          "Riktig. For ren skalering er effekten som regel liten, men den går alltid i samme retning: for pent. Og mekanismen er identisk med den som er katastrofal i andre tilfeller.",
      },
      {
        id: "krasjer",
        tekst: "Koden feiler når du senere skal skalere nye data.",
        respons:
          "Den feiler ikke. Det er nettopp derfor feilen overlever helt til innlevering: alt kjører, alle tallene ser fine ut, og ingenting varsler deg.",
      },
    ],
    fasit: "litt-optimistisk",
    hvorfor:
      "Dette er datalekkasje: informasjon fra testsettet siver inn i treningen. For skalering er utslaget beskjedent. Men samme feil gjort med target encoding — der hver kategori erstattes av gjennomsnittlig target-verdi — lekker fasiten direkte inn i treningsdataene og kan gi nær perfekt resultat i eksperimentet og full kollaps i drift. Regelen er den samme uansett: alt som lærer noe fra data, skal lære det fra treningsdelen alene.",
  },
];

/* ================================================================== *
 * Type 3 — Måloppgave med tilstandssjekk (4 stk).
 * Flere valg kan være forsvarlige; tilbakemeldingen forklarer avveiningen.
 * ================================================================== */

const maal: FaseOppgaver["maal"] = [
  {
    id: "f2-m1-postnummer",
    tittel: "Velg forbehandling: kolonnen «postnummer»",
    situasjon:
      "Du skal forutsi om en boligannonse fører til salg innen 30 dager. Kolonnen «postnummer» inneholder 2 400 ulike verdier fordelt på 18 000 annonser. Modellen du skal bruke er en logistisk regresjon.",
    kontekst:
      "postnummer   antall annonser\n0150                     41\n0151                     37\n...\n9990                      2\n\n2 400 unike verdier · 18 000 rader",
    maal: "Kolonnen skal ende opp i en form modellen kan bruke, uten at antall kolonner eksploderer og uten at tallene tolkes som en rangering.",
    valg: [
      {
        id: "behandling",
        sporsmal: "Hvordan behandler du kolonnen?",
        alternativer: [
          { id: "tall", tekst: "La den stå som tall — den består jo av sifre" },
          { id: "onehot", tekst: "One-hot encoding på alle 2 400 verdiene" },
          { id: "gruppe", tekst: "Grupper til de to første sifrene, deretter one-hot encoding" },
          { id: "slett", tekst: "Slett kolonnen — for komplisert" },
        ],
      },
      {
        id: "hvor",
        sporsmal: "Hvor i arbeidsflyten gjør du det?",
        alternativer: [
          { id: "for-split", tekst: "På hele datasettet, før oppdeling i trening og test" },
          { id: "i-pipeline", tekst: "Inne i en pipeline som tilpasses på treningsdelen alene" },
        ],
      },
    ],
    vurder: (v) => {
      if (v.hvor === "for-split" && v.behandling !== "slett") {
        return {
          niva: "feil",
          tittel: "Rekkefølgen lekker informasjon",
          forklaring:
            "Uansett hvilken behandling du valgte: gjør du den på hele datasettet før oppdelingen, har testsettet vært med på å bestemme hvilke kategorier som finnes. Alt som lærer noe av dataene skal tilpasses på treningsdelen alene, og deretter brukes på testdelen.",
        };
      }
      if (v.behandling === "tall") {
        return {
          niva: "feil",
          tittel: "Postnummer er ikke et tall",
          forklaring:
            "En logistisk regresjon vil tolke kolonnen som en skala: 9990 blir «mer» enn 0150, og halvveis mellom dem ligger 5070. Det er meningsløst — postnumre er kategorier som tilfeldigvis er skrevet med sifre. Modellen vil finne en helt oppdiktet lineær sammenheng.",
        };
      }
      if (v.behandling === "slett") {
        return {
          niva: "forsvarlig",
          tittel: "Trygt, men du kaster antakelig den sterkeste featuren du har",
          forklaring:
            "Å slette kolonnen fjerner problemet og er bedre enn å bruke den feil. Men beliggenhet er som regel det som forklarer mest om et boligsalg. Bruk sletting som siste utvei, ikke som første grep — og skriv i så fall i rapporten hvorfor du gjorde det.",
        };
      }
      if (v.behandling === "onehot") {
        return {
          niva: "forsvarlig",
          tittel: "Riktig idé, men kardinaliteten er for høy",
          forklaring:
            "One-hot encoding er riktig familie av grep for en kategorisk kolonne. Problemet er mengden: 2 400 nye kolonner på 18 000 rader gir i snitt 7,5 rader per kolonne, og mange kategorier vil finnes i testsettet uten å ha vært i treningssettet i det hele tatt. En logistisk regresjon med 2 400 nesten tomme kolonner overtilpasser lett. Grupper først.",
        };
      }
      return {
        niva: "riktig",
        tittel: "Riktig — kardinaliteten ned først, deretter encoding",
        forklaring:
          'De to første sifrene i et norsk postnummer angir et geografisk område. Det gir rundt 90 kategorier i stedet for 2 400: nok til å fange «hvor i landet», få nok til at hver kategori har mange rader bak seg. Og fordi det skjer inne i en pipeline, tilpasses grupperingen på treningsdelen alene. Husk å sette handle_unknown="ignore" på encoderen, slik at en kategori som bare dukker opp i testsettet ikke stopper alt.',
      };
    },
  },
  {
    id: "f2-m2-alder-manglende",
    tittel: "Velg forbehandling: kolonnen «alder» med hull",
    situasjon:
      "Kolonnen «alder» mangler verdi for 9 % av radene. Histogrammet er noenlunde symmetrisk med topp rundt 42 år. Du har mistanke om at det ikke er tilfeldig hvem som lar feltet stå tomt — de yngste ser ut til å hoppe over det oftere.",
    kontekst:
      "alder: 18–91 år · median 42 · gjennomsnitt 43,1\nmanglende: 1 620 av 18 000 rader (9 %)",
    maal: "Radene skal beholdes, hullene skal fylles på en måte som ikke skjuler at de var der, og ingenting skal læres fra testdataene.",
    valg: [
      {
        id: "behandling",
        sporsmal: "Hva gjør du med hullene?",
        alternativer: [
          { id: "slett", tekst: "Slett radene som mangler alder" },
          { id: "median", tekst: "Fyll inn medianen" },
          {
            id: "median-flagg",
            tekst: "Fyll inn medianen og legg til en ja/nei-kolonne «alder_manglet»",
          },
          { id: "null", tekst: "Fyll inn 0" },
        ],
      },
      {
        id: "hvor",
        sporsmal: "Hvor beregnes verdien som fylles inn?",
        alternativer: [
          { id: "hele", tekst: "Fra hele datasettet" },
          { id: "tren", tekst: "Fra treningsdelen alene, og gjenbrukes på testdelen" },
        ],
      },
    ],
    vurder: (v) => {
      if (v.behandling === "null") {
        return {
          niva: "feil",
          tittel: "0 er en påstand, ikke et tomrom",
          forklaring:
            "Modellen ser tallet 0 og leser det som en nyfødt. Det trekker gjennomsnittet ned og skaper en klump av umulige verdier i venstre kant av fordelingen. Vil du markere at noe manglet, gjør du det med en egen kolonne — ikke ved å finne på en verdi.",
        };
      }
      if (v.behandling === "slett") {
        return {
          niva: "feil",
          tittel: "Sletting gjør datasettet skjevt her",
          forklaring:
            "Du sier selv at det er de yngste som oftest lar feltet stå tomt. Sletter du de radene, fjerner du systematisk en aldersgruppe fra dataene, og modellen blir dårligere nettopp for dem. Sletting kan forsvares når verdier mangler helt tilfeldig — det gjør de ikke her.",
        };
      }
      if (v.hvor === "hele") {
        return {
          niva: "feil",
          tittel: "Riktig utfylling, feil rekkefølge",
          forklaring:
            "Medianen som fylles inn er noe du lærer av dataene. Regner du den ut på hele datasettet, har testradene påvirket verdiene som havner i treningsdataene. Regn den på treningsdelen og gjenbruk akkurat den verdien på testdelen — det er nøyaktig det en imputer inne i en pipeline gjør for deg.",
        };
      }
      if (v.behandling === "median-flagg") {
        return {
          niva: "riktig",
          tittel: "Riktig — og flagget er det som løfter dette",
          forklaring:
            "Median fordi den tåler skjevhet og uteliggere, tilpasset på treningsdelen alene. Den ekstra ja/nei-kolonnen bevarer informasjonen om at verdien var utfylt av deg. Siden du mistenker at det ikke mangler tilfeldig, er det signalet potensielt en av de nyttigste featurene i datasettet — og det ville forsvunnet sporløst uten flagget.",
        };
      }
      return {
        niva: "forsvarlig",
        tittel: "Helt akseptabelt, men du mister ett signal",
        forklaring:
          "Median beregnet på treningsdelen er standardsvaret og fullt forsvarlig. Det du går glipp av, er informasjonen om hvilke rader som var utfylt. Når du selv mistenker at hullene ikke er tilfeldige, koster en ekstra ja/nei-kolonne nesten ingenting og kan gi mye — legg den til.",
      };
    },
  },
  {
    id: "f2-m3-by-kolonne",
    tittel: "Velg forbehandling: kolonnen «by» med åtte verdier",
    situasjon:
      "Kolonnen «by» har åtte verdier: Oslo, Bergen, Trondheim, Stavanger, Tromsø, Kristiansand, Drammen og Bodø. Fordelingen er skjev — Oslo har 44 % av radene, Bodø har 2 %. Modellen er en random forest.",
    maal: "Kolonnen skal bli brukbar for modellen uten at den innfører en rangering som ikke finnes.",
    valg: [
      {
        id: "behandling",
        sporsmal: "Hvordan koder du kolonnen?",
        alternativer: [
          { id: "onehot", tekst: "One-hot encoding — åtte 0/1-kolonner" },
          {
            id: "ordinal",
            tekst: "Nummerer byene 1–8 etter hvor mange rader de har",
          },
          {
            id: "target",
            tekst:
              "Target encoding — erstatt hver by med gjennomsnittlig target-verdi for den byen",
          },
        ],
      },
      {
        id: "sjelden",
        sporsmal: "Hva gjør du med byene som har svært få rader?",
        alternativer: [
          { id: "behold", tekst: "Beholder dem som egne kategorier" },
          { id: "samle", tekst: "Slår de minste sammen til én «annet»-kategori" },
        ],
      },
    ],
    vurder: (v) => {
      if (v.behandling === "target") {
        return {
          niva: "feil",
          tittel: "Farligst av de tre — og fristende fordi den fungerer så godt",
          forklaring:
            "Target encoding bruker fasiten til å lage featuren. Gjøres det uten streng disiplin, lekker targeten inn i treningsdataene og modellen ser strålende ut på papiret. Med bare åtte kategorier er det uansett unødvendig: one-hot koster deg syv ekstra kolonner og har ingen slik risiko. Bruk target encoding kun ved høy kardinalitet, og bare med kryssvalidert oppsett inne i pipelinen.",
        };
      }
      if (v.behandling === "ordinal") {
        return {
          niva: "forsvarlig",
          tittel: "Går an akkurat her, men av en grunn du bør kjenne",
          forklaring:
            "Å nummerere byene innfører en rangering som ikke finnes — Bodø er ikke «mindre» enn Oslo på noen meningsfull skala. En random forest tåler det likevel relativt godt, fordi den bare deler på «under eller over denne verdien» og kan isolere en enkelt by med flere splitter. En logistisk regresjon ville derimot lest tallene som en skala og trukket helt gale slutninger. Med åtte kategorier er one-hot både tryggere og like billig.",
        };
      }
      if (v.sjelden === "samle") {
        return {
          niva: "riktig",
          tittel: "Riktig, og du tenkte ett steg lenger",
          forklaring:
            "One-hot på åtte kategorier er trygt og billig. Å samle de minste byene i en «annet»-kategori er ikke påkrevd her, men det gir hver kolonne flere rader å hvile på og reduserer risikoen for at modellen lærer noe tilfeldig om Bodø ut fra 2 % av dataene. Skriv i rapporten hvilken grense du satte, og hvorfor.",
        };
      }
      return {
        niva: "riktig",
        tittel: "Riktig",
        forklaring:
          'One-hot encoding er standardvalget for kategoriske kolonner med lav kardinalitet: ingen oppdiktet rangering, og åtte ekstra kolonner er ingenting. Å beholde alle byene som egne kategorier er helt greit — med 2 % av 18 000 rader har selv Bodø flere hundre rader bak seg. Husk handle_unknown="ignore" for det tilfellet at en ny by dukker opp senere.',
      };
    },
  },
  {
    id: "f2-m4-rekkefolge",
    tittel: "Sett stegene i riktig rekkefølge",
    situasjon:
      "Du har et datasett med både tallkolonner og kategoriske kolonner, hull i noen av tallkolonnene, og en modell som måler avstand (k nærmeste naboer). Fire operasjoner skal utføres: oppdeling i trening og test, utfylling av hull, skalering av tallkolonnene og one-hot encoding av kategoriene.",
    maal: "Ingen av stegene skal lære noe som helst fra testdataene, og modellen skal se kolonner på sammenlignbar skala.",
    valg: [
      {
        id: "rekkefolge",
        sporsmal: "Hvilken rekkefølge?",
        alternativer: [
          {
            id: "split-forst",
            tekst:
              "Oppdeling først, deretter utfylling, encoding og skalering tilpasset på treningsdelen",
          },
          {
            id: "rens-forst",
            tekst: "Utfylling, encoding og skalering på hele datasettet, deretter oppdeling",
          },
          {
            id: "blandet",
            tekst: "Utfylling på hele datasettet, så oppdeling, så skalering på treningsdelen",
          },
        ],
      },
      {
        id: "hvordan",
        sporsmal: "Hvordan sikrer du at rekkefølgen holdes også under kryssvalidering?",
        alternativer: [
          { id: "manuelt", tekst: "Passer på det manuelt hver gang" },
          {
            id: "pipeline",
            tekst: "Legger alle stegene i en pipeline og kryssvaliderer pipelinen",
          },
        ],
      },
    ],
    vurder: (v) => {
      if (v.rekkefolge === "rens-forst") {
        return {
          niva: "feil",
          tittel: "Alle tre stegene lekker",
          forklaring:
            "Utfylling lærer en median, skalering lærer gjennomsnitt og spredning, encoding lærer hvilke kategorier som finnes. Gjør du alt på hele datasettet, er testsettet med på å bestemme hver av dem. Testresultatet blir for pent, og du oppdager det aldri — koden kjører fint.",
        };
      }
      if (v.rekkefolge === "blandet") {
        return {
          niva: "feil",
          tittel: "Delvis rettet, fortsatt lekkasje",
          forklaring:
            "Du flyttet skaleringen etter oppdelingen, men utfyllingen lekker fremdeles: medianen er regnet ut med testradene inkludert. Lekkasje er ikke gradert — ett steg som ser testdataene er nok til at tallet ikke er til å stole på.",
        };
      }
      if (v.hvordan === "pipeline") {
        return {
          niva: "riktig",
          tittel: "Riktig — og pipelinen er det som gjør det holdbart",
          forklaring:
            "Oppdeling først, deretter alt som lærer noe tilpasset på treningsdelen alene. Pipelinen er ikke bare ryddig kode: under kryssvalidering deles dataene på nytt for hver runde, og da må utfylling, encoding og skalering gjøres på nytt innenfor hver eneste runde. Manuell disiplin klarer ikke det. Nevn pipelinen eksplisitt i mappa — det er det tydeligste tegnet på at du har forstått lekkasje.",
        };
      }
      return {
        niva: "forsvarlig",
        tittel: "Riktig rekkefølge, sårbar gjennomføring",
        forklaring:
          "Rekkefølgen er riktig, og med én enkelt oppdeling går det bra så lenge du er nøye. Men i det du innfører kryssvalidering, deles dataene på nytt for hver runde, og forbehandlingen må følge med inn i hver av dem. Det er nesten umulig å holde styr på manuelt. En pipeline gjør det til standardoppførsel i stedet for noe du må huske.",
      };
    },
  },
];

/* ================================================================== *
 * Type 4 — Feilsøking (5 stk). Tyngdepunktet i faget: hver pipeline
 * har én reell feil som overlever alle vanlige kontroller.
 * ================================================================== */

const feilsoking: FaseOppgaver["feilsoking"] = [
  {
    id: "f2-f1-skalering-for-split",
    tittel: "Testresultatet er litt for pent, hver gang",
    symptom:
      "Modellen får 0,91 i testen, men rundt 0,86 når den kjøres på et helt nytt datasett fra samme kilde. Avviket er lite, men det går alltid samme vei.",
    format: "kode",
    linjer: [
      { nr: 1, tekst: 'X = df.drop(columns=["target"])' },
      { nr: 2, tekst: 'y = df["target"]' },
      { nr: 3, tekst: "skaler = StandardScaler()" },
      { nr: 4, tekst: "X_skalert = skaler.fit_transform(X)" },
      { nr: 5, tekst: "X_tren, X_test, y_tren, y_test = train_test_split(" },
      { nr: 6, tekst: "    X_skalert, y, test_size=0.2, random_state=42, stratify=y)" },
      { nr: 7, tekst: "modell = KNeighborsClassifier(n_neighbors=5).fit(X_tren, y_tren)" },
      { nr: 8, tekst: "print(modell.score(X_test, y_test))   # 0.91" },
    ],
    feilLinje: 4,
    linjeRespons: {
      1: "Å skille features fra target er riktig gjort. Ingen feil her.",
      2: "Targeten hentes ut som den skal.",
      3: "Å opprette en skalerer er nødvendig — k nærmeste naboer måler avstand og krever sammenlignbare skalaer. Feilen er ikke at du skalerer, men når.",
      4: "Her er feilen. fit_transform gjør to ting: den lærer gjennomsnitt og standardavvik fra dataene den får, og bruker dem. Her får den hele datasettet, altså også de radene som senere blir testsett. Testdataene har dermed påvirket tallene treningen bruker.",
      5: "Oppdelingen er riktig satt opp, med både fast random_state og stratify. Problemet er at den kommer for sent.",
      6: "stratify=y er godt håndverk og bevarer klassefordelingen i begge deler. Ingen feil her.",
      7: "Modellen trenes bare på treningsdelen — akkurat som den skal.",
      8: "Målingen gjøres på testsettet, som det skal. Tallet er likevel for optimistisk, fordi testsettet påvirket skaleringen i linje 4.",
    },
    fikser: [
      {
        id: "pipeline",
        tekst:
          "Legg skalering og modell i en pipeline, og kall fit på pipelinen med treningsdataene.",
        riktig: true,
        respons:
          "Riktig, og det beste svaret. Pipeline(StandardScaler(), KNeighborsClassifier()) gjør det umulig å skalere med testdata — skaleringen tilpasses innenfor hver fit, også inne i hver runde av en kryssvalidering.",
      },
      {
        id: "manuell",
        tekst: "Del først, kall fit_transform på treningsdelen og transform på testdelen.",
        riktig: true,
        respons:
          "Også riktig. fit_transform på treningen, transform (uten fit) på testen. Dette er den manuelle varianten, og den fungerer — men den må gjentas riktig hver gang du deler dataene på nytt, og det er nettopp der folk snubler.",
      },
      {
        id: "minmax",
        tekst: "Bytt til MinMaxScaler i stedet for StandardScaler.",
        riktig: false,
        respons:
          "Begge lærer noe fra dataene de tilpasses på — den ene gjennomsnitt og spredning, den andre minimum og maksimum. Bytter du skalerer men beholder rekkefølgen, lekker det nøyaktig like mye.",
      },
    ],
    laerdom:
      "Alt som har en fit-metode lærer noe fra dataene, og skal derfor bare se treningsdelen. Det gjelder skalerere, imputere og encodere like mye som selve modellen.",
  },
  {
    id: "f2-f2-target-encoding",
    tittel: "0,98 i test, 0,61 i drift",
    symptom:
      "En modell for kundefrafall får 0,98 i kryssvalidert test. Etter to uker i drift ligger den på 0,61. Ingenting i dataene har endret seg.",
    format: "kode",
    linjer: [
      { nr: 1, tekst: "# «by» har 340 unike verdier — for mange til one-hot" },
      { nr: 2, tekst: 'snitt_per_by = df.groupby("by")["sluttet"].mean()' },
      { nr: 3, tekst: 'df["by_encoded"] = df["by"].map(snitt_per_by)' },
      { nr: 4, tekst: 'X = df[["by_encoded", "alder", "maanedspris"]]' },
      { nr: 5, tekst: 'y = df["sluttet"]' },
      { nr: 6, tekst: "X_tren, X_test, y_tren, y_test = train_test_split(X, y, test_size=0.2)" },
      { nr: 7, tekst: "modell = RandomForestClassifier().fit(X_tren, y_tren)" },
      { nr: 8, tekst: "print(cross_val_score(modell, X_tren, y_tren, cv=5).mean())   # 0.98" },
    ],
    feilLinje: 2,
    linjeRespons: {
      1: "Observasjonen er helt riktig: 340 kategorier er for mye for one-hot encoding. Problemet er ikke diagnosen, men behandlingen på neste linje.",
      2: "Her er feilen. Gjennomsnittet av «sluttet» per by regnes ut fra hele datasettet — inkludert radene som blir testsett. Featuren er altså laget av selve fasiten. For en by med få kunder er gjennomsnittet i praksis kundens eget svar, litt utvannet.",
      3: "Å slå opp verdien er bare gjennomføringen av feilen over. Tabellen som slås opp i er allerede forurenset.",
      4: "Kolonnevalget er greit i seg selv — by_encoded er den forgiftede kolonnen, men den ble laget i linje 2.",
      5: "Targeten hentes ut som den skal.",
      6: "Oppdelingen kommer etter at encodingen er gjort, og da er skaden allerede skjedd. Rekkefølgen er en del av problemet, men roten sitter i linje 2.",
      7: "Modellen trenes på treningsdelen. Feilen er hva som ligger i kolonnene den får.",
      8: "Kryssvalidering ser grundig ut og gir falsk trygghet: alle rundene bruker den samme forurensede kolonnen, så alle fem er like optimistiske.",
    },
    fikser: [
      {
        id: "cv-inne",
        tekst:
          "Beregn gjennomsnittet inne i en pipeline, tilpasset på treningsdelen i hver kryssvalideringsrunde.",
        riktig: true,
        respons:
          "Riktig. Target encoding er ikke forbudt, men den er bare forsvarlig når den regnes ut på treningsdelen alene, på nytt i hver runde. scikit-learn har TargetEncoder som gjør nettopp dette når den ligger i en pipeline.",
      },
      {
        id: "grupper",
        tekst:
          "Dropp target encoding: grupper de 340 byene til færre kategorier og bruk one-hot encoding.",
        riktig: true,
        respons:
          "Også riktig, og ofte det klokeste. Gruppering til fylke eller landsdel fjerner både kardinalitetsproblemet og lekkasjefaren i én operasjon. Enklere er som regel bedre når du skal forsvare valget i en rapport.",
      },
      {
        id: "sterkere",
        tekst: "Bruk en enklere modell for å redusere overtilpasningen.",
        riktig: false,
        respons:
          "Dette er ikke overtilpasning. Featuren inneholder informasjon om fasiten, og enhver modell vil finne den — også en enkel. Å bytte modell demper symptomet litt og skjuler årsaken.",
      },
    ],
    laerdom:
      "Alt som er laget av targeten er mistenkelig. Bruker du fasiten til å lage en feature, må utregningen skje på treningsdelen alene, i hver eneste runde. Et resultat som er påfallende godt bør etterforskes, ikke feires.",
  },
  {
    id: "f2-f3-imputer-hele",
    tittel: "Hullene fylles med informasjon fra testsettet",
    symptom:
      "Pipelinen ser ryddig ut, oppdelingen gjøres tidlig, og resultatet er stabilt. En medstudent påstår likevel at det lekker.",
    format: "kode",
    linjer: [
      { nr: 1, tekst: 'df["alder"] = df["alder"].fillna(df["alder"].median())' },
      { nr: 2, tekst: 'X = df.drop(columns=["target"])' },
      { nr: 3, tekst: 'y = df["target"]' },
      { nr: 4, tekst: "X_tren, X_test, y_tren, y_test = train_test_split(" },
      { nr: 5, tekst: "    X, y, test_size=0.2, stratify=y, random_state=0)" },
      {
        nr: 6,
        tekst: 'pipe = Pipeline([("skaler", StandardScaler()), ("clf", LogisticRegression())])',
      },
      { nr: 7, tekst: "pipe.fit(X_tren, y_tren)" },
      { nr: 8, tekst: "print(pipe.score(X_test, y_test))" },
    ],
    feilLinje: 1,
    linjeRespons: {
      1: "Her er feilen. Medianen regnes ut fra alle radene i datasettet, altså også de som senere blir testsett. Verdien som fylles inn i treningsdataene er dermed delvis bestemt av testdataene. At det står på linje 1 gjør det lett å overse — det ser ut som opprydding, ikke som modellering.",
      2: "Å skille ut features er riktig gjort.",
      3: "Targeten hentes ut som den skal.",
      4: "Oppdelingen er riktig satt opp og kommer tidlig i koden. Nettopp derfor virker pipelinen trygg — men linje 1 kom før.",
      5: "stratify og fast random_state er godt håndverk.",
      6: "Pipelinen er riktig bygget, og skaleringen inne i den lekker ikke. Den dekker bare ikke utfyllingen, som allerede er gjort.",
      7: "Tilpasningen skjer på treningsdelen alene — akkurat som den skal.",
      8: "Målingen gjøres riktig. Tallet er likevel litt for høyt på grunn av linje 1.",
    },
    fikser: [
      {
        id: "imputer-i-pipe",
        tekst: 'Flytt utfyllingen inn i pipelinen med SimpleImputer(strategy="median").',
        riktig: true,
        respons:
          "Riktig. Da tilpasses medianen på treningsdelen inne i hver fit, og den samme verdien gjenbrukes på testdelen. Det gjelder også i hver runde av en kryssvalidering.",
      },
      {
        id: "etter-split",
        tekst: "Behold fillna, men flytt linjen ned etter oppdelingen og regn medianen på X_tren.",
        riktig: true,
        respons:
          "Fungerer, så lenge du husker å bruke nøyaktig den samme verdien på X_test — ikke medianen av testsettet. Det er akkurat denne manuelle disiplinen SimpleImputer i pipelinen fjerner behovet for.",
      },
      {
        id: "dropna",
        tekst: "Bytt til dropna() slik at ingen verdi finnes på.",
        riktig: false,
        respons:
          "Det fjerner lekkasjen, men på en kostbar måte: du mister rader, og hvis hullene ikke er tilfeldig fordelt blir datasettet skjevt. Å løse et lekkasjeproblem ved å kaste data er sjelden riktig bytte.",
      },
    ],
    laerdom:
      "Rensing på toppen av skriptet føles som noe som skjer «før» modelleringen. Men enhver operasjon som regner ut et tall fra dataene og bruker det, er en del av modellen — og hører hjemme etter oppdelingen.",
  },
  {
    id: "f2-f4-ukjent-kategori",
    tittel: "Koden krasjer først i drift",
    symptom:
      "Alt fungerer i utviklingen. Etter tre uker i drift stopper tjenesten med ValueError: Found unknown categories.",
    format: "kode",
    linjer: [
      { nr: 1, tekst: "X_tren, X_test, y_tren, y_test = train_test_split(X, y, test_size=0.2)" },
      { nr: 2, tekst: "enc = OneHotEncoder(sparse_output=False)" },
      { nr: 3, tekst: 'X_tren_enc = enc.fit_transform(X_tren[["by"]])' },
      { nr: 4, tekst: 'X_test_enc = enc.transform(X_test[["by"]])' },
      { nr: 5, tekst: "modell = LogisticRegression().fit(X_tren_enc, y_tren)" },
      { nr: 6, tekst: "# tre uker senere, på nye data:" },
      { nr: 7, tekst: 'nye_enc = enc.transform(nye_data[["by"]])   # ValueError' },
    ],
    feilLinje: 2,
    linjeRespons: {
      1: "Oppdelingen kommer først — det er riktig, og det er derfor denne oppgaven er lærerik: rekkefølgen er i orden, feilen er en annen.",
      2: 'Her er feilen. Encoderen opprettes uten handle_unknown="ignore". Standardoppførselen er å kaste en feil når den møter en kategori den ikke så under tilpasningen. Det er en fornuftig standard, men den må håndteres bevisst.',
      3: "fit_transform på treningsdelen er nøyaktig riktig — encoderen skal lære hvilke kategorier som finnes, fra treningen alene.",
      4: "transform uten fit på testdelen er også riktig. At det gikk bra her var flaks: alle byene i testsettet fantes tilfeldigvis i treningssettet.",
      5: "Modellen trenes på de encodede treningsdataene. Ingen feil.",
      6: "Kommentaren markerer bare at nye data kommer inn.",
      7: "Dette er stedet feilen viser seg, men ikke stedet den bor. En by som ikke fantes i treningsdataene dukker opp, og encoderen fra linje 2 nekter å håndtere den.",
    },
    fikser: [
      {
        id: "handle-unknown",
        tekst: 'Opprett encoderen med handle_unknown="ignore".',
        riktig: true,
        respons:
          "Riktig. Ukjente kategorier blir da til bare nuller i alle kolonnene — modellen får ingen informasjon fra den kolonnen for akkurat den raden, men den stopper ikke. Det er nesten alltid riktig avveining i drift.",
      },
      {
        id: "fit-alle",
        tekst:
          "Tilpass encoderen på hele datasettet i stedet, slik at den kjenner alle kategoriene.",
        riktig: false,
        respons:
          "Det bytter en ærlig krasj mot en stille lekkasje, og det løser ikke problemet uansett: byer som dukker opp om tre uker finnes ikke i datasettet ditt i dag heller. Aldri tilpass en encoder på testdata.",
      },
      {
        id: "try",
        tekst: "Pakk kallet i try/except og hopp over radene som feiler.",
        riktig: false,
        respons:
          "Da forsvinner nye kunder stille ut av systemet, og ingen oppdager det. Å skjule en feil er ikke å håndtere den — hvilke rader som droppes bør aldri avgjøres av en unntaksblokk.",
      },
    ],
    laerdom:
      "Kategoriske kolonner i drift møter før eller siden verdier som ikke fantes i treningsdataene. Bestem deg for hva som da skal skje, i stedet for å oppdage det når tjenesten stopper.",
  },
  {
    id: "f2-f5-ubalanse-accuracy",
    tittel: "0,98 med SMOTE påført før oppdelingen",
    symptom:
      "En modell for sjeldne produksjonsfeil rapporterer 0,98. Kvalitetsavdelingen finner ingen av feilene den skulle fange.",
    format: "kode",
    linjer: [
      { nr: 1, tekst: "# 40 000 enheter, 700 av dem defekte (1,75 %)" },
      { nr: 2, tekst: "sm = SMOTE(random_state=0)   # lager syntetiske eksempler av minoriteten" },
      { nr: 3, tekst: "X_bal, y_bal = sm.fit_resample(X, y)" },
      {
        nr: 4,
        tekst: "X_tren, X_test, y_tren, y_test = train_test_split(X_bal, y_bal, test_size=0.2)",
      },
      { nr: 5, tekst: "modell = RandomForestClassifier().fit(X_tren, y_tren)" },
      { nr: 6, tekst: "print(accuracy_score(y_test, modell.predict(X_test)))   # 0.98" },
    ],
    feilLinje: 3,
    linjeRespons: {
      1: "Kommentaren gir premisset: 1,75 % defekte. Sterkt ubalansert, men i seg selv ingen feil.",
      2: "SMOTE (Synthetic Minority Over-sampling Technique) lager nye, kunstige eksempler av den sjeldne klassen ved å interpolere mellom eksisterende. Verktøyet er riktig — bruken på neste linje er ikke.",
      3: "Her er feilen. Balanseringen gjøres på hele datasettet, før oppdelingen. De syntetiske eksemplene er laget ut fra ekte rader, og noen av dem havner i treningsdataene mens raden de er avledet fra havner i testen. Modellen har dermed i praksis sett testeksemplene.",
      4: "Oppdelingen i seg selv er riktig satt opp, men den kommer for sent til å ha noen verdi.",
      5: "Modellen trenes på treningsdelen. Ingen feil her.",
      6: "Accuracy på et kunstig balansert testsett måler noe helt annet enn virkeligheten. Både metrikken og dataene den måles på er feil — men roten er linje 3.",
    },
    fikser: [
      {
        id: "etter-split",
        tekst:
          "Del først, og balanser bare treningsdelen. La testsettet beholde den ekte klassefordelingen.",
        riktig: true,
        respons:
          "Riktig, og dette er hovedregelen: testsettet skal se ut som virkeligheten. Balansering er et treningstriks, ikke en egenskap ved problemet. Bruk imblearn sin pipeline hvis du kryssvaliderer, slik at balanseringen skjer inne i hver runde.",
      },
      {
        id: "recall",
        tekst: "Rapporter recall og presisjon for defekt-klassen i stedet for accuracy.",
        riktig: true,
        respons:
          "Også riktig, og nødvendig i tillegg til det første. Med 1,75 % defekte sier accuracy nesten ingenting: å svare «ikke defekt» på alt gir 98,25 %. Kvalitetsavdelingen bryr seg om hvor stor andel av de faktiske feilene som fanges — det er recall.",
      },
      {
        id: "class-weight",
        tekst: 'Dropp SMOTE og bruk class_weight="balanced" på modellen i stedet.',
        riktig: true,
        respons:
          "Fungerer også, og er ofte enklere å forsvare. class_weight gjør feil på minoritetsklassen dyrere under trening, uten å finne på nye datapunkter. Ingen syntetiske rader betyr ingen risiko for at de havner på begge sider av oppdelingen.",
      },
    ],
    laerdom:
      "Alt som endrer treningsdataene — balansering, utfylling, skalering, encoding — skjer etter oppdelingen og bare på treningsdelen. Og et testsett som er kunstig balansert måler en verden som ikke finnes.",
  },
];

/* ================================================================== *
 * Type 5 — Recall-kort. Få, og kun det som må komme umiddelbart.
 * ================================================================== */

const recall: FaseOppgaver["recall"] = [
  {
    id: "f2-r1",
    forside: "Hva er kardinalitet, og hvorfor er høy kardinalitet et problem?",
    bakside:
      "Kardinalitet er antall unike verdier i en kolonne. Høy kardinalitet gjør one-hot encoding upraktisk: du får én nesten tom kolonne per verdi, og kategorier som bare finnes i testsettet.",
    hvorfor:
      "Dette er begrunnelsen du skriver i rapporten når du grupperer postnummer eller bruker en annen encoding. Uten ordet «kardinalitet» blir formuleringen upresis.",
  },
  {
    id: "f2-r2",
    forside: "Median eller gjennomsnitt ved utfylling av manglende verdier?",
    bakside:
      "Median på skjeve fordelinger eller når uteliggere finnes; gjennomsnitt på noenlunde symmetriske. Hyppigste verdi for kategoriske kolonner. Vurder alltid en ekstra ja/nei-kolonne som markerer at verdien manglet.",
    hvorfor:
      "Valget skal begrunnes med hvordan fordelingen ser ut, og det er en av de raskeste måtene å vise at du faktisk så på dataene før du behandlet dem.",
  },
  {
    id: "f2-r3",
    forside: "Hvilke modeller trenger skalerte features, og hvilke gjør ikke?",
    bakside:
      "Trenger skalering: alt som måler avstand eller bruker regularisering — k nærmeste naboer, k-means, støttevektormaskiner, logistisk regresjon med straffeledd, nevrale nett. Trenger ikke: beslutningstrær og random forest, som sammenligner innenfor én kolonne av gangen.",
    hvorfor:
      "Dette avgjør om skalering i det hele tatt skal med i pipelinen din, og det er et spørsmål som kommer igjen for hver eneste modell du velger.",
  },
  {
    id: "f2-r4",
    forside: "Hva er datalekkasje, i én setning?",
    bakside:
      "Informasjon fra testsettet — eller fra framtiden — har påvirket treningen, slik at resultatet blir bedre enn det modellen kan levere i praksis.",
    hvorfor:
      "Dette er den vanligste og dyreste feilen i faget, og en definisjon du bør kunne skrive uten å tenke deg om når mappa skal forsvares.",
  },
  {
    id: "f2-r5",
    forside: "Hvilke steg skal ligge inne i pipelinen, og hvorfor?",
    bakside:
      "Alt som har en fit-metode: utfylling, encoding, skalering, balansering — og modellen. Da tilpasses hvert steg på treningsdelen alene, også inne i hver runde av en kryssvalidering.",
    hvorfor:
      "Tommelfingerregelen «har den fit, hører den hjemme i pipelinen» erstatter behovet for å huske rekkefølgen manuelt hver gang.",
  },
];

export const FASE2_OPPGAVER: FaseOppgaver = {
  anslag,
  maal,
  feilsoking,
  recall,
};
