// ---------------------------------------------------------------------------
// core/checks.ts — konsept-sjekkene, én liste per leksjon.
//
// Dette er stedet innholdet i «forstå før du går videre» bor. Registeret er
// bevisst skilt fra komponenten som viser sjekkene: `core/mastery.ts` bruker
// det til å vite hvor mange sjekker en leksjon *skal* ha, og `core/path.ts`
// til å avgjøre om neste kloss kan låses opp.
//
// En leksjon uten sjekker her låser ingenting. Det gjør populeringen trygg og
// inkrementell: legg til sjekker fag for fag, og porten strammer seg av seg
// selv etter hvert som dekningen vokser.
//
// Pedagogikk (jf. «lær først, prøv selv»): hver sjekk kan ha et `laer`-felt
// som forklarer konseptet i klartekst FØR spørsmålene vises. Spørsmålene
// tester forståelse — hvorfor og når — framfor utregning man kan slå opp.
// ---------------------------------------------------------------------------

export interface SjekkValg {
  tekst: string;
  riktig: boolean;
  /** Hvorfor dette svaret er riktig/galt. Vises etter innsending. */
  begrunnelse?: string;
}

/** Klassisk flervalg. Uten `type` antas dette, så eldre oppføringer virker. */
export interface SjekkFlervalg {
  type?: "flervalg";
  sporsmal: string;
  valg: SjekkValg[];
}

/**
 * Anslå-så-sjekk: brukeren må forplikte seg til et tall FØR fasiten vises.
 *
 * Dette er den mest virkningsfulle oppgavetypen i undervisningsforskningen
 * (peer instruction, Berkeley Data 8): når du har gjettet, er du investert,
 * og et bomskudd avdekker misforståelsen din før forklaringen kommer. Særlig
 * verdifullt i statistikk, der intuisjonen systematisk bommer — base rate,
 * kraften i små utvalg, hvor bredt et konfidensintervall faktisk er.
 */
export interface SjekkTall {
  type: "tall";
  sporsmal: string;
  /** Riktig svar. */
  fasit: number;
  /** Hvor langt unna man kan være og fortsatt regnes som truffet. */
  toleranse: number;
  enhet?: string;
  /** Vises etter at anslaget er låst — hvorfor svaret er som det er. */
  forklaring: string;
  /** Valgfritt hint om hvilket intervall svaret ligger i. */
  min?: number;
  max?: number;
}

export type SjekkSporsmal = SjekkFlervalg | SjekkTall;

export interface KonseptSjekkDef {
  /** Stabil id — matcher seksjonsankeret i leksjonen. */
  id: string;
  /** Kort tittel på konseptet som testes. */
  tittel: string;
  /** Vises før spørsmålene: kjernen i konseptet, i klartekst. */
  laer: string;
  sporsmal: SjekkSporsmal[];
}

export const CHECKS_BY_LESSON: Record<string, KonseptSjekkDef[]> = {
  "tek1-sannsynlighet": [
    {
      id: "base-rate",
      tittel: "Base rate — hva positiv test faktisk betyr",
      laer: "Når en sykdom er sjelden, finnes det mange flere friske enn syke. Selv en test som tar feil på bare noen få prosent av de friske, produserer da flere falske alarmer enn det finnes ekte tilfeller. «Testen er 90 % sikker» er derfor en meningsløs setning uten forekomsten: sannsynligheten for å være syk gitt positiv test avhenger like mye av hvor vanlig sykdommen er som av hvor god testen er.",
      sporsmal: [
        {
          type: "tall",
          sporsmal:
            "1 % har sykdommen. Testen fanger opp 90 % av de syke, og gir riktig negativt svar for 91 % av de friske. Av 1000 testede: hvor mange prosent av dem som tester positivt er faktisk syke? Anslå før du regner.",
          fasit: 9.2,
          toleranse: 2.5,
          enhet: "%",
          min: 0,
          max: 100,
          forklaring:
            "Av 1000: 10 syke, hvorav 9 tester positivt. 990 friske, hvorav 9 % — altså 89 — også tester positivt. Til sammen 98 positive, og bare 9 av dem er syke: 9/98 ≈ 9,2 %. De fleste gjetter rundt 90 %, fordi de forveksler «andel av syke som tester positivt» med «andel av positive som er syke».",
        },
        {
          sporsmal: "Hva skjer med denne andelen hvis sykdommen blir mye vanligere?",
          valg: [
            {
              tekst: "Den stiger — flere av de positive blir ekte tilfeller",
              riktig: true,
              begrunnelse:
                "Med høyere forekomst er det færre friske å produsere falske alarmer fra, og flere syke å fange opp. Derfor er testing av folk med symptomer noe helt annet enn screening av friske.",
            },
            {
              tekst: "Den er uendret — den bestemmes av testens kvalitet",
              riktig: false,
              begrunnelse:
                "Dette er selve base rate-fellen. Sensitivitet og spesifisitet er egenskaper ved testen, men svaret avhenger også av hvem den brukes på.",
            },
            {
              tekst: "Den synker",
              riktig: false,
              begrunnelse:
                "Motsatt vei: flere ekte tilfeller gir en høyere andel ekte blant de positive.",
            },
          ],
        },
      ],
    },
  ],

  // ─────────────── TEK-1501 — grunnmuren ───────────────
  "tek1-deskriptiv": [
    {
      id: "simpsons-paradoks",
      tittel: "Når totalen lyver — konfundering",
      laer: "En andel regnet over blandede grupper er bare meningsfull hvis gruppene er sammenlignbare. Er de ikke det, kan en behandling være best i hver enkelt gruppe og likevel se dårligst ut totalt — Simpsons paradoks. Årsaken er en konfunderende variabel: noe som påvirker både hvilken gruppe man havner i og hvordan det går. Randomisering er kuren, fordi den fordeler de vanskelige tilfellene jevnt.",
      sporsmal: [
        {
          sporsmal:
            "Behandling A har høyest suksessrate både på små og store nyresteiner, men lavest totalt. Hva er forklaringen?",
          valg: [
            {
              tekst: "A fikk en mye større andel av de vanskelige tilfellene",
              riktig: true,
              begrunnelse:
                "Totalen vekter gruppene etter hvor mange pasienter hver behandling fikk fra dem. Får A mest av det vanskelige, trekkes totalsnittet ned selv om A vinner overalt.",
            },
            {
              tekst: "Det må være en regnefeil — dette er umulig",
              riktig: false,
              begrunnelse:
                "Det er fullt mulig og velkjent. Tallene i eksempelet er fra en ekte studie (Charig m.fl., 1986).",
            },
            {
              tekst: "Utvalget er for lite til at ratene betyr noe",
              riktig: false,
              begrunnelse:
                "Paradokset handler ikke om tilfeldig variasjon. Det oppstår også med vilkårlig store utvalg, fordi det er et vektingsproblem.",
            },
          ],
        },
        {
          sporsmal: "Hvilken variabel er den konfunderende i dette eksempelet?",
          valg: [
            {
              tekst: "Steinstørrelsen — den påvirker både behandlingsvalg og utfall",
              riktig: true,
              begrunnelse:
                "Nettopp definisjonen på konfundering: den henger sammen med både det vi sammenligner og det vi måler.",
            },
            {
              tekst: "Suksessraten",
              riktig: false,
              begrunnelse:
                "Suksessraten er utfallet vi måler, ikke noe som forstyrrer sammenligningen.",
            },
            {
              tekst: "Antall pasienter",
              riktig: false,
              begrunnelse:
                "Gruppestørrelsene er mekanismen som gjør reverseringen synlig, men det er steinstørrelsen som er den underliggende forklaringsvariabelen.",
            },
          ],
        },
      ],
    },
    {
      id: "sentral-spredning",
      tittel: "Gjennomsnitt, median og robusthet",
      laer: "Gjennomsnittet bruker verdien til hver observasjon, så én ekstrem verdi drar det med seg. Medianen bruker bare rekkefølgen, og bryr seg ikke om hvor ekstrem ytterpunktet er. Derfor sier vi at medianen er robust mot uteliggere. Standardavviket har samme svakhet som gjennomsnittet, siden det måler avstand fra nettopp gjennomsnittet.",
      sporsmal: [
        {
          sporsmal:
            "Ti husholdninger har medianinntekt 500 000. Den rikeste flytter, og en milliardær flytter inn. Hva skjer?",
          valg: [
            {
              tekst: "Gjennomsnittet stiger kraftig, medianen står nesten stille",
              riktig: true,
              begrunnelse:
                "Gjennomsnittet summerer alle verdiene, så den ene enorme inntekten drar det opp. Medianen ser bare på hvem som ligger i midten — og det er fortsatt omtrent samme husholdning.",
            },
            {
              tekst: "Begge stiger kraftig",
              riktig: false,
              begrunnelse:
                "Medianen bryr seg om rekkefølge, ikke størrelse. Den øverste verdien kan bli vilkårlig stor uten å flytte midtpunktet nevneverdig.",
            },
            {
              tekst: "Ingen av dem endrer seg",
              riktig: false,
              begrunnelse:
                "Gjennomsnittet må endre seg — det regnes ut fra summen av alle inntektene.",
            },
          ],
        },
        {
          sporsmal: "Når er det mest opplysende å rapportere median framfor gjennomsnitt?",
          valg: [
            {
              tekst: "Når fordelingen er tydelig skjev",
              riktig: true,
              begrunnelse:
                "Ved skjevhet trekkes gjennomsnittet mot halen og beskriver ikke lenger en typisk observasjon. Inntekt og boligpriser er skoleeksemplene.",
            },
            {
              tekst: "Når utvalget er stort",
              riktig: false,
              begrunnelse:
                "Størrelsen på utvalget endrer ikke hvilket mål som beskriver formen best. En skjev fordeling er skjev uansett hvor mange du måler.",
            },
            {
              tekst: "Når du senere skal regne standardavvik",
              riktig: false,
              begrunnelse:
                "Standardavviket er definert ut fra gjennomsnittet, så det argumentet trekker motsatt vei.",
            },
          ],
        },
      ],
    },
  ],

  "tek1-forventning-clt": [
    {
      id: "standardfeil",
      tittel: "σ mot σ/√n",
      laer: "σ (sigma) beskriver hvor mye én enkelt måling spriker. Standardfeilen σ/√n beskriver hvor mye gjennomsnittet av n målinger spriker. Gjennomsnitt er alltid mer stabile enn enkeltmålinger, fordi høye og lave trekk delvis utligner hverandre. All inferens du møter senere — konfidensintervall og hypotesetester — bruker standardfeilen, ikke σ.",
      sporsmal: [
        {
          sporsmal:
            "Du har n = 25 og standardfeil 2,0. Hvor mange målinger trengs for å komme ned i standardfeil 1,0?",
          valg: [
            {
              tekst: "100",
              riktig: true,
              begrunnelse:
                "SE = σ/√n. Å halvere SE krever at √n dobles, altså at n firedobles: 25 × 4 = 100.",
            },
            {
              tekst: "50",
              riktig: false,
              begrunnelse:
                "Å doble n deler SE på √2 ≈ 1,41, ikke på 2. Du havner på omtrent 1,41 — ikke 1,0.",
            },
            {
              tekst: "12,5",
              riktig: false,
              begrunnelse:
                "Færre målinger gir større usikkerhet, ikke mindre. SE vokser når n synker.",
            },
          ],
        },
        {
          sporsmal:
            "Populasjonen er tydelig høyreskjev. Du tar utvalg på n = 50 og ser på gjennomsnittene. Hva er formen på fordelingen av x̄?",
          valg: [
            {
              tekst: "Tilnærmet normal, selv om populasjonen er skjev",
              riktig: true,
              begrunnelse:
                "Det er nettopp sentralgrenseteoremet: fordelingen til gjennomsnittet nærmer seg normalfordelingen når n vokser, uavhengig av formen på populasjonen.",
            },
            {
              tekst: "Like skjev som populasjonen",
              riktig: false,
              begrunnelse:
                "Det gjelder enkeltobservasjoner, ikke gjennomsnitt. Å ta gjennomsnitt utjevner skjevheten.",
            },
            {
              tekst: "Uniform",
              riktig: false,
              begrunnelse:
                "CLT peker mot normalfordelingen — en klokkeform med tyngdepunkt i μ, ikke en flat fordeling.",
            },
          ],
        },
      ],
    },
  ],

  "tek1-estimering-ki": [
    {
      id: "ki-tolkning",
      tittel: "Hva et konfidensintervall faktisk sier",
      laer: "Et 95 %-konfidensintervall betyr: gjentar du hele forsøket mange ganger og regner ut intervallet hver gang, vil omtrent 95 % av intervallene inneholde den sanne parameteren. Sannsynligheten ligger i metoden — ikke i det ene intervallet du sitter med. Den sanne verdien er et fast tall; det er intervallet som varierer fra utvalg til utvalg.",
      sporsmal: [
        {
          sporsmal: "Du har regnet ut 95 %-KI = [12,1, 15,9]. Hvilken påstand er korrekt?",
          valg: [
            {
              tekst: "Metoden treffer den sanne verdien i 95 % av tenkte gjentakelser av forsøket",
              riktig: true,
              begrunnelse:
                "Dette er den frekventistiske tolkningen: konfidensen tilhører prosedyren over gjentatte utvalg.",
            },
            {
              tekst: "Det er 95 % sannsynlig at den sanne verdien ligger mellom 12,1 og 15,9",
              riktig: false,
              begrunnelse:
                "Fristende, men galt i frekventistisk statistikk. Den sanne verdien er fast — den ligger enten i intervallet eller ikke. Det er intervallet som er tilfeldig.",
            },
            {
              tekst: "95 % av observasjonene ligger mellom 12,1 og 15,9",
              riktig: false,
              begrunnelse:
                "Det ville vært et toleranseintervall for enkeltobservasjoner. Et KI handler om parameteren, ikke om spredningen i dataene.",
            },
          ],
        },
        {
          sporsmal: "Du går fra 95 % til 99 % konfidens med samme data. Hva skjer med intervallet?",
          valg: [
            {
              tekst: "Det blir bredere",
              riktig: true,
              begrunnelse:
                "Høyere konfidens krever en større kritisk verdi, og bredden er kritisk verdi × SE. Mer sikkerhet koster presisjon.",
            },
            {
              tekst: "Det blir smalere",
              riktig: false,
              begrunnelse:
                "Da ville du fått både høyere sikkerhet og bedre presisjon gratis. Avveiingen går alltid andre veien.",
            },
            {
              tekst: "Det er uendret — bare tolkningen endres",
              riktig: false,
              begrunnelse:
                "Den kritiske verdien endres fra ca. 1,96 til ca. 2,58, så bredden vokser.",
            },
          ],
        },
      ],
    },
  ],

  "tek1-hypotesetest-regresjon": [
    {
      id: "p-verdi",
      tittel: "Hva p-verdien måler",
      laer: "p-verdien svarer på ett spesifikt spørsmål: hvis H₀ er sann, hvor sannsynlig er det å se data minst så ekstreme som mine? Den sier ingenting om hvor sannsynlig H₀ selv er, og ingenting om hvor stor effekten er. En bitteliten effekt kan gi svært lav p-verdi når n er stor nok.",
      sporsmal: [
        {
          sporsmal: "Du får p = 0,03. Hva betyr det?",
          valg: [
            {
              tekst: "Hvis H₀ er sann, ville data minst så ekstreme forekommet i 3 % av forsøkene",
              riktig: true,
              begrunnelse:
                "Dette er definisjonen: en betinget sannsynlighet for dataene, gitt at H₀ er sann.",
            },
            {
              tekst: "Det er 3 % sannsynlig at H₀ er sann",
              riktig: false,
              begrunnelse:
                "Dette er den vanligste feiltolkningen. p er P(data | H₀), ikke P(H₀ | data) — de to er ikke det samme.",
            },
            {
              tekst: "Effekten er stor",
              riktig: false,
              begrunnelse:
                "p blander sammen effektstørrelse og utvalgsstørrelse. Med stor n gir selv ubetydelige effekter lave p-verdier.",
            },
          ],
        },
        {
          sporsmal:
            "To studier tester samme effekt. A: n = 20, p = 0,08. B: n = 5000, p = 0,001. Hva kan du slutte?",
          valg: [
            {
              tekst:
                "Ingenting om effektstørrelse ut fra p alene — du må se på estimatet og intervallet",
              riktig: true,
              begrunnelse:
                "Riktig. B kan godt ha en mindre effekt enn A; den store n-en gjør bare at selv en liten effekt blir statistisk påvisbar.",
            },
            {
              tekst: "B har en større effekt enn A",
              riktig: false,
              begrunnelse:
                "Lavere p betyr sterkere bevis mot H₀, ikke større effekt. Med n = 5000 skal det lite til.",
            },
            {
              tekst: "A viser at det ikke finnes noen effekt",
              riktig: false,
              begrunnelse:
                "Å beholde H₀ er ikke det samme som å bevise den. Med n = 20 har testen rett og slett lite styrke.",
            },
          ],
        },
      ],
    },
  ],

  "tek1-statistisk-analyse": [
    {
      id: "prosedyrevalg",
      tittel: "Å velge riktig prosedyre",
      laer: "Alle prosedyrene er samme maskin: estimat, standardfeil og referansefordeling. Valget styres av tre spørsmål. Måler du gjennomsnitt eller andel? Har du ett eller to utvalg — og er de i så fall parede? Kjenner du σ, eller må den estimeres fra dataene (som gir t framfor z)?",
      sporsmal: [
        {
          sporsmal:
            "20 personer får måltid blodtrykk før og etter et treningsprogram. Hvilken prosedyre?",
          valg: [
            {
              tekst: "Parvis t-test på differansene",
              riktig: true,
              begrunnelse:
                "Målingene er koblet innen hver person. Ved å regne på differansene fjerner du variasjonen mellom personer, som er den store støykilden.",
            },
            {
              tekst: "To-utvalgs t-test",
              riktig: false,
              begrunnelse:
                "Den forutsetter uavhengige grupper. Her er «før» og «etter» samme personer, så observasjonene er ikke uavhengige.",
            },
            {
              tekst: "z-test for andeler",
              riktig: false,
              begrunnelse: "Blodtrykk er en kontinuerlig måling, ikke en andel.",
            },
          ],
        },
        {
          sporsmal: "Hvorfor bruker vi t-fordelingen framfor z når σ er ukjent?",
          valg: [
            {
              tekst: "Fordi s selv er usikker, og t har tyngre haler som tar høyde for det",
              riktig: true,
              begrunnelse:
                "Vi estimerer to størrelser i stedet for én. t kompenserer med bredere haler, særlig ved lav n. Ved store n nærmer t seg z.",
            },
            {
              tekst: "Fordi t alltid gir lavere p-verdi",
              riktig: false,
              begrunnelse:
                "Motsatt: tyngre haler gir høyere p-verdi for samme teststatistikk. t er mer forsiktig, ikke mindre.",
            },
            {
              tekst: "Fordi dataene da ikke er normalfordelte",
              riktig: false,
              begrunnelse:
                "t-testen antar fortsatt tilnærmet normalitet. Det som skiller er at spredningen er estimert, ikke kjent.",
            },
          ],
        },
      ],
    },
  ],
};
