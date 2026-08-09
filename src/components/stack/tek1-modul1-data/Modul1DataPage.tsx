import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Eye, Layers, Sigma } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import {
  Symboltavle,
  ProvisoriskKapittelnote,
  type SymbolRad,
} from "@/components/stack/tek1-oppgaver/Symboltavle";
import { AnslaSaSjekk, type Anslag } from "@/components/stack/tek1-oppgaver/AnslaSaSjekk";
import { Maloppgaver, type MaloppgaveData } from "@/components/stack/tek1-oppgaver/Maloppgave";
import { Feilsokingsoppgaver, type Feilsoking } from "@/components/stack/tek1-oppgaver/Feilsoking";
import { RecallKortSeksjon, type RecallKort } from "@/components/stack/tek1-oppgaver/RecallKort";
// Gjenbruk av eksisterende visualizere framfor å bygge nye (PLAN §3, type 2).
// Disse ligger i tek1-deskriptiv og eies av den modulen — vi importerer dem,
// vi endrer dem ikke.
import { OutlierImpactDemo } from "@/components/stack/tek1-deskriptiv/OutlierImpactDemo";
import { SkewnessKurtosisViz } from "@/components/stack/tek1-deskriptiv/SkewnessKurtosisViz";
import { InteractiveDistributionPlayground } from "@/components/stack/tek1-deskriptiv/InteractiveDistributionPlayground";
// Nye, fordi de manglet.
import { KvartilProkkrekke } from "./KvartilProkkrekke";
import { NMinusEnSim } from "./NMinusEnSim";

// ---------------------------------------------------------------------------
// TEK-1501 Modul 1 — Data (spor A i plan-tek-1501.md).
//
// Modulen følger oppgave-arkitekturen i PLAN-HOST26-MODULER.md §3 slavisk, i
// rekkefølge: anslå-så-sjekk FØR forklaringen → guidede simuleringer UNDER →
// måloppgaver med tilstandssjekk ETTER → feilsøking SIST → recall-kort til slutt.
//
// Rekkefølgen er ikke kosmetisk. Anslagene lager hullene som simuleringene
// fyller; feilsøkingen kommer sist fordi den forutsetter at alle delene sitter.
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Symbolene først", anchor: "symboler" },
  { title: "Anslå — før du leser", anchor: "anslag" },
  { title: "Utvalg og populasjon", anchor: "utvalg" },
  { title: "Sentralmål (interaktiv)", anchor: "sentralmal" },
  { title: "Uteliggere (interaktiv)", anchor: "uteliggere" },
  { title: "Skjevhet (interaktiv)", anchor: "skjevhet" },
  { title: "Spredning", anchor: "spredning" },
  { title: "n − 1 (interaktiv)", anchor: "n-minus-en" },
  { title: "Visualisering (interaktiv)", anchor: "plot" },
  { title: "Måloppgaver", anchor: "maloppgaver" },
  { title: "Feilsøking", anchor: "feilsoking" },
  { title: "Recall-kort", anchor: "recall" },
];

// ===========================================================================
// Symboltavle — progressiv scaffolding. Ingen av disse brukes før de står her.
// ===========================================================================

const SYMBOLER: SymbolRad[] = [
  {
    tegn: "n",
    uttale: "n",
    betydning: "Antall observasjoner i utvalget vårt — hvor mange målinger vi faktisk har.",
    verden: "utvalg",
  },
  {
    tegn: "x̄",
    uttale: "x-strek",
    betydning: (
      <>
        Gjennomsnittet av observasjonene i utvalget: legg sammen alle og del på n. Streken over
        betyr «snitt av».
      </>
    ),
    verden: "utvalg",
  },
  {
    tegn: "μ",
    uttale: "my (gresk m)",
    betydning: (
      <>
        Det sanne gjennomsnittet i hele populasjonen. Vi kjenner det aldri — x̄ er gjetningen vår på
        det.
      </>
    ),
    verden: "populasjon",
  },
  {
    tegn: "s²",
    uttale: "s-i-andre",
    betydning: (
      <>
        Stikkprøvevariansen: gjennomsnittlig kvadrert avstand fra x̄, med n − 1 i nevneren. Måler
        hvor mye observasjonene spriker.
      </>
    ),
    verden: "utvalg",
  },
  {
    tegn: "s",
    uttale: "s",
    betydning: (
      <>
        Stikkprøvens standardavvik — kvadratroten av s². Fordelen framfor s² er at s har samme enhet
        som dataene (kroner, ikke kroner²).
      </>
    ),
    verden: "utvalg",
  },
  {
    tegn: "σ",
    uttale: "sigma (gresk s)",
    betydning: "Det sanne standardavviket i populasjonen. Ukjent, akkurat som μ.",
    verden: "populasjon",
  },
  {
    tegn: "σ²",
    uttale: "sigma-i-andre",
    betydning: "Den sanne variansen i populasjonen. Det er dette tallet s² prøver å treffe.",
    verden: "populasjon",
  },
  {
    tegn: "Σ",
    uttale: "stor sigma",
    betydning: (
      <>«Legg sammen alle». Σ(x − x̄)² betyr: regn ut (x − x̄)² for hver observasjon, og summer.</>
    ),
    verden: "generelt",
  },
  {
    tegn: "Q1, Q2, Q3",
    uttale: "kvartil én, to, tre",
    betydning: (
      <>
        Skillene som deler den sorterte rekka i fire like store deler. Q2 er det samme som medianen.
      </>
    ),
    verden: "utvalg",
  },
  {
    tegn: "IQR",
    uttale: "kvartilbredde",
    betydning: (
      <>
        Interkvartilbredden, Q3 − Q1: bredden på den midterste halvparten av dataene. Et
        spredningsmål som ikke bryr seg om uteliggere.
      </>
    ),
    verden: "utvalg",
  },
];

// ===========================================================================
// Oppgavetype 1 — anslå-så-sjekk (6 stk)
// ===========================================================================

const ANSLAG: Anslag[] = [
  {
    id: "m1-a1",
    tema: "Median vs. gjennomsnitt",
    sporsmal: (
      <>
        Et utvalg på 10 personer har årsinntekter mellom 400 000 og 700 000 kroner. Medianen er 520
        000. Nå legger vi til <strong>én person til med 50 millioner</strong> i årsinntekt. Hva
        skjer med <strong>medianen</strong>?
      </>
    ),
    alternativer: [
      { id: "a", label: "Den mangedobles — den drar med seg hele utvalget" },
      { id: "b", label: "Den øker kraftig, til godt over en million" },
      { id: "c", label: "Den flytter seg ett hakk, altså noen få tusen kroner" },
      { id: "d", label: "Den blir nøyaktig uendret" },
    ],
    riktigId: "c",
    fasit: (
      <>
        Nesten ingenting skjer. Medianen er posisjonen midt i den sorterte rekka. Med 10 personer lå
        den mellom person nr. 5 og 6; med 11 personer er den nøyaktig person nr. 6. Den flytter seg
        altså <em>ett hakk oppover i køen</em> — typisk noen tusenlapper. At den nye personen tjener
        50 millioner og ikke 800 000 spiller ingen rolle: medianen ser bare at hun står bakerst i
        køen, ikke hvor langt bak.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi er vant til at «et stort tall trekker snittet opp», og overfører den regelen til alle
        sentralmål. Men gjennomsnittet bruker <em>verdiene</em>, mens medianen bare bruker{" "}
        <em>rekkefølgen</em>. Samme datasett — helt ulik følsomhet.
      </>
    ),
  },
  {
    id: "m1-a2",
    tema: "Gjennomsnittet i samme situasjon",
    sporsmal: (
      <>
        Samme utvalg: 10 personer med gjennomsnittsinntekt 540 000. Vi legger til personen med 50
        millioner. Hva blir det nye gjennomsnittet, omtrent?
      </>
    ),
    alternativer: [
      { id: "a", label: "Rundt 545 000 — knapt merkbart" },
      { id: "b", label: "Rundt 5 millioner" },
      { id: "c", label: "Rundt 25 millioner" },
      { id: "d", label: "Rundt 50 millioner" },
    ],
    riktigId: "b",
    fasit: (
      <>
        Summen var 10 × 540 000 = 5,4 millioner. Nå blir den 55,4 millioner, fordelt på 11 personer:
        omtrent <strong>5,04 millioner</strong>. Gjennomsnittet er altså nesten ti ganger så høyt
        som før — og nå er det <em>ingen</em> i utvalget som tjener i nærheten av «gjennomsnittet».
        Ti av elleve ligger langt under det.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi tenker på gjennomsnittet som «det vanlige». Men det er et tyngdepunkt, og et tyngdepunkt
        kan godt ligge et sted der det ikke finnes noen observasjoner i det hele tatt.
      </>
    ),
  },
  {
    id: "m1-a3",
    tema: "Kvartilbredde og uteliggere",
    sporsmal: (
      <>
        Samme utvalg igjen, med millionæren inkludert. Hva skjer med{" "}
        <strong>kvartilbredden IQR</strong> — bredden på den midterste halvparten av dataene?
      </>
    ),
    alternativer: [
      { id: "a", label: "Den mangedobles, som gjennomsnittet" },
      { id: "b", label: "Den endrer seg bare marginalt" },
      { id: "c", label: "Den blir negativ" },
      { id: "d", label: "Den halveres" },
    ],
    riktigId: "b",
    fasit: (
      <>
        Knapt noe skjer. IQR er avstanden fra Q1 til Q3 — altså mellom personen 25 % inn i køen og
        personen 75 % inn i køen. Millionæren står helt bakerst og påvirker ingen av de to
        posisjonene nevneverdig. Det er nettopp derfor boksplottet tegner uteliggere som løse
        prikker <em>utenfor</em> boksen: boksen skal beskrive hovedtyngden, ikke ytterpunktene.
      </>
    ),
  },
  {
    id: "m1-a4",
    tema: "Å legge til en konstant",
    sporsmal: (
      <>
        Alle ansatte får nøyaktig <strong>10 000 kroner</strong> i lønnstillegg — alle får det samme
        beløpet. Hva skjer med <strong>standardavviket s</strong>?
      </>
    ),
    alternativer: [
      { id: "a", label: "Det øker med 10 000" },
      { id: "b", label: "Det øker, men med mindre enn 10 000" },
      { id: "c", label: "Det er helt uendret" },
      { id: "d", label: "Det avhenger av hvor mange ansatte det er" },
    ],
    riktigId: "c",
    fasit: (
      <>
        Helt uendret. Standardavviket måler <em>avstandene mellom</em> observasjonene, ikke hvor de
        ligger på tallinja. Når alle flyttes like langt, er alle avstander de samme som før.
        Formelt: hvert ledd (x − x̄) er uforandret, fordi både x og x̄ økte med 10 000, og differansen
        spiser opp tillegget.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        «Alle tallene ble større, altså ble spredningen større» er en naturlig, men gal slutning.
        Sentrum og spredning er to uavhengige egenskaper ved et datasett — du kan flytte det ene
        uten å røre det andre.
      </>
    ),
  },
  {
    id: "m1-a5",
    tema: "Å gange med en konstant",
    sporsmal: (
      <>
        I stedet gis alle et tillegg på <strong>10 %</strong> — altså ganges hver lønn med 1,1. Hva
        skjer med <strong>variansen s²</strong>?
      </>
    ),
    alternativer: [
      { id: "a", label: "Den ganges med 1,1" },
      { id: "b", label: "Den ganges med 1,21" },
      { id: "c", label: "Den er uendret" },
      { id: "d", label: "Den ganges med 0,1" },
    ],
    riktigId: "b",
    fasit: (
      <>
        Variansen ganges med <strong>1,1² = 1,21</strong>. Grunnen er kvadreringen: hvert ledd (x −
        x̄) ganges med 1,1, og når leddet så kvadreres, ganges bidraget med 1,1². Standardavviket s,
        derimot, ganges bare med 1,1 — fordi kvadratroten opphever kvadreringen. Det er én av de
        gode grunnene til å oppgi s framfor s²: s skalerer på samme måte som dataene.
      </>
    ),
  },
  {
    id: "m1-a6",
    tema: "Hvorfor n − 1",
    sporsmal: (
      <>
        Vi trekker mange små utvalg fra en populasjon der vi <em>vet</em> at variansen er 225, og
        regner variansen i hvert utvalg ved å dele kvadratsummen på n. Hva ser vi når vi tar
        gjennomsnittet av alle disse svarene?
      </>
    ),
    alternativer: [
      { id: "a", label: "Det ligger rundt 225 — bommene går like ofte over som under" },
      { id: "b", label: "Det ligger systematisk under 225" },
      { id: "c", label: "Det ligger systematisk over 225" },
      { id: "d", label: "Det spriker helt tilfeldig, uten mønster" },
    ],
    riktigId: "b",
    fasit: (
      <>
        Systematisk under — og det er ikke uflaks, det er innebygd i regnestykket. Vi måler
        avstandene fra utvalgets eget gjennomsnitt x̄, og x̄ er per definisjon det punktet som gjør
        kvadratsummen så liten som mulig for akkurat disse tallene. Den sanne μ ville gitt en større
        kvadratsum. Vi måler altså alltid litt for kort. Å dele på n − 1 i stedet for n blåser
        svaret opp med akkurat nok til å rette opp skjevheten. Du får se det i simulatoren lenger
        nede.
      </>
    ),
  },
];

// ===========================================================================
// Oppgavetype 3 — måloppgaver med tilstandssjekk (5 stk)
// ===========================================================================

const MALOPPGAVER: MaloppgaveData[] = [
  {
    id: "m1-o1",
    tittel: "Stikkprøvevarians for hånd",
    oppgave: (
      <>
        Du har målt reaksjonstiden til <strong>åtte tilfeldig utvalgte</strong> deltakere i et
        forsøk. De åtte er et utvalg fra en mye større gruppe. Regn ut{" "}
        <strong>stikkprøvevariansen s²</strong>.
      </>
    ),
    data: <>2, 4, 4, 4, 5, 5, 7, 9</>,
    metoder: [
      {
        id: "n-1",
        label: "Del kvadratsummen på n − 1 (stikkprøvevarians s²)",
      },
      {
        id: "n",
        label: "Del kvadratsummen på n (populasjonsvarians σ²)",
        hvorforFeil:
          "Den formelen gjelder når du har målt HELE populasjonen. Her er de åtte et utvalg fra en større gruppe, og da undervurderer du spredningen systematisk. Svaret ditt blir 4,00 i stedet for 4,57.",
      },
      {
        id: "abs",
        label: "Ta gjennomsnittet av absoluttavvikene |x − x̄|",
        hvorforFeil:
          "Det er et gyldig spredningsmål (gjennomsnittlig absoluttavvik), men det er ikke varians. Varians kvadrerer avvikene før den midler.",
      },
    ],
    riktigMetodeId: "n-1",
    fasit: { verdi: 4.571, toleranse: 0.02, desimaler: 3 },
    svarEtikett: "s² =",
    utregning: (
      <>
        <p>
          <strong>1. Gjennomsnittet:</strong> (2 + 4 + 4 + 4 + 5 + 5 + 7 + 9) / 8 = 40 / 8 ={" "}
          <span className="font-mono">x̄ = 5</span>
        </p>
        <p className="mt-1">
          <strong>2. Kvadrerte avvik fra x̄:</strong> (2−5)² = 9, (4−5)² = 1 tre ganger, (5−5)² = 0
          to ganger, (7−5)² = 4, (9−5)² = 16
        </p>
        <p className="mt-1">
          <strong>3. Kvadratsummen:</strong> 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 ={" "}
          <span className="font-mono">Σ(x − x̄)² = 32</span>
        </p>
        <p className="mt-1">
          <strong>4. Del på n − 1 = 7:</strong> 32 / 7 = <span className="font-mono">4,571</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Legg merke til at deling på n ville gitt akkurat 4,00 — et pent tall som er fristende å
          tro på. At svaret ble stygt er ikke et tegn på at du regnet feil.
        </p>
      </>
    ),
  },
  {
    id: "m1-o2",
    tittel: "Populasjon, ikke utvalg",
    oppgave: (
      <>
        En liten bedrift har nøyaktig <strong>seks ansatte</strong>, og du har alderen til alle
        seks. Du skal beskrive spredningen i <em>denne bedriften</em> — ikke gjette på noen større
        gruppe. Regn ut variansen.
      </>
    ),
    data: <>3, 5, 5, 7, 8, 8 (år i bedriften)</>,
    metoder: [
      {
        id: "n",
        label: "Del kvadratsummen på n (populasjonsvarians σ²)",
      },
      {
        id: "n-1",
        label: "Del kvadratsummen på n − 1 (stikkprøvevarians s²)",
        hvorforFeil:
          "n − 1-korreksjonen finnes for å rette opp skjevheten som oppstår når vi gjetter på en ukjent populasjon. Her ER de seks hele populasjonen — det er ingenting å gjette på, og ingen skjevhet å rette opp. Da blåser du bare svaret kunstig opp, fra 3,33 til 4,00.",
      },
    ],
    riktigMetodeId: "n",
    fasit: { verdi: 3.333, toleranse: 0.02, desimaler: 3 },
    svarEtikett: "σ² =",
    utregning: (
      <>
        <p>
          <strong>1. Gjennomsnittet:</strong> (3 + 5 + 5 + 7 + 8 + 8) / 6 = 36 / 6 ={" "}
          <span className="font-mono">μ = 6</span>. Vi skriver μ og ikke x̄, fordi dette faktisk{" "}
          <em>er</em> populasjonsgjennomsnittet.
        </p>
        <p className="mt-1">
          <strong>2. Kvadratsummen:</strong> 9 + 1 + 1 + 1 + 4 + 4 ={" "}
          <span className="font-mono">20</span>
        </p>
        <p className="mt-1">
          <strong>3. Del på n = 6:</strong> 20 / 6 = <span className="font-mono">3,333</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Denne og forrige oppgave er speilbilder av hverandre. Samme regnestykke fram til siste
          linje — og der avgjør ett eneste spørsmål hva du deler på:{" "}
          <em>har jeg hele populasjonen, eller et utvalg fra den?</em>
        </p>
      </>
    ),
  },
  {
    id: "m1-o3",
    tittel: "Kvartilbredde fra rådata",
    oppgave: (
      <>
        Ti kunder ventet følgende antall minutter i kø. Finn <strong>kvartilbredden IQR</strong>.
        Bruk «median av halvdelene»-metoden: del den sorterte rekka i to like halvdeler, og ta
        medianen av hver.
      </>
    ),
    data: <>31, 24, 40, 27, 21, 52, 33, 25, 36, 30</>,
    metoder: [
      { id: "iqr", label: "Q3 − Q1 (kvartilbredde)" },
      {
        id: "variasjonsbredde",
        label: "Største minus minste observasjon (variasjonsbredde)",
        hvorforFeil:
          "Det er variasjonsbredden, som her blir 52 − 21 = 31. Den bygger utelukkende på de to mest ekstreme observasjonene, og er derfor det minst robuste spredningsmålet vi har.",
      },
      {
        id: "std",
        label: "Standardavviket s",
        hvorforFeil:
          "s er også et spredningsmål, men et helt annet: det bygger på avstander fra gjennomsnittet, ikke på posisjoner i den sorterte rekka. Her ville s blitt omtrent 9,3.",
      },
    ],
    riktigMetodeId: "iqr",
    fasit: { verdi: 11, toleranse: 0.5, desimaler: 0, enhet: "minutter" },
    svarEtikett: "IQR =",
    utregning: (
      <>
        <p>
          <strong>1. Sortér:</strong>{" "}
          <span className="font-mono">21, 24, 25, 27, 30, 31, 33, 36, 40, 52</span>
        </p>
        <p className="mt-1">
          <strong>2. Del i to halvdeler</strong> (n = 10 er partall, så ingen observasjon holdes
          utenfor): nedre halvdel = 21, 24, 25, 27, 30 · øvre halvdel = 31, 33, 36, 40, 52
        </p>
        <p className="mt-1">
          <strong>3. Median av hver halvdel:</strong> Q1 = 25, Q3 = 36
        </p>
        <p className="mt-1">
          <strong>4. IQR:</strong> 36 − 25 = <span className="font-mono">11 minutter</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Den midterste halvparten av kundene ventet altså innenfor et spenn på 11 minutter — selv
          om den mest uheldige ventet 52. Det er den setningen IQR er laget for å kunne si.
        </p>
      </>
    ),
  },
  {
    id: "m1-o4",
    tittel: "Hvilket sentralmål beskriver «typisk»?",
    oppgave: (
      <>
        Ni ansatte i en liten bedrift har følgende årslønn i tusen kroner. Du skal oppgi{" "}
        <strong>ett tall</strong> som svar på spørsmålet «hva tjener en typisk ansatt her?». Velg
        mål, og regn det ut.
      </>
    ),
    data: <>320, 340, 355, 360, 380, 395, 410, 430, 2900</>,
    metoder: [
      {
        id: "median",
        label: "Medianen — fordi fordelingen har en kraftig hale mot høyre",
      },
      {
        id: "mean",
        label: "Gjennomsnittet — fordi det bruker all informasjonen i dataene",
        hvorforFeil:
          "Det stemmer at gjennomsnittet bruker alle tallene, men her er det problemet, ikke fordelen: daglig leders 2,9 millioner drar snittet opp til 654, som er høyere enn åtte av ni ansatte tjener. Et «typisk»-tall som ingen typisk ansatt er i nærheten av, beskriver ikke det spørsmålet ba om.",
      },
      {
        id: "modus",
        label: "Modus — den hyppigste verdien",
        hvorforFeil:
          "Alle ni lønningene er forskjellige, så det finnes ingen verdi som går igjen. Modus er nyttig for kategoridata (mest solgte skostørrelse), ikke for kontinuerlige målinger som denne.",
      },
    ],
    riktigMetodeId: "median",
    fasit: { verdi: 380, toleranse: 1, desimaler: 0, enhet: "tusen kr" },
    svarEtikett: "Typisk lønn =",
    utregning: (
      <>
        <p>
          Dataene er allerede sortert, og n = 9 er et oddetall. Medianen er da observasjon nummer (9
          + 1)/2 = 5, altså <span className="font-mono">380</span>.
        </p>
        <p className="mt-1">
          Til sammenligning: gjennomsnittet er 5890 / 9 = <span className="font-mono">654,4</span>.
          Åtte av ni ansatte tjener mindre enn det. Når de to målene spriker så kraftig, er det i
          seg selv en opplysning verdt å nevne i svaret: fordelingen er sterkt høyreskjev.
        </p>
      </>
    ),
  },
  {
    id: "m1-o5",
    tittel: "Fra varians til standardavvik",
    oppgave: (
      <>
        Fem tilfeldig utvalgte pakker veies (i kilo). Regn ut <strong>standardavviket s</strong> for
        utvalget. Husk at svaret skal ha samme enhet som dataene.
      </>
    ),
    data: <>12, 15, 18, 19, 21</>,
    metoder: [
      { id: "sqrt-n-1", label: "Kvadratroten av kvadratsummen delt på n − 1" },
      {
        id: "sqrt-n",
        label: "Kvadratroten av kvadratsummen delt på n",
        hvorforFeil:
          "Dette er populasjonsversjonen, og gir 3,16. De fem pakkene er beskrevet som tilfeldig utvalgte, altså et utvalg — da skal du dele på n − 1 = 4.",
      },
      {
        id: "ingen-rot",
        label: "Kvadratsummen delt på n − 1, uten å ta kvadratroten",
        hvorforFeil:
          "Da har du stoppet ved variansen s² = 12,5. Den har enheten kilo², som ikke er en størrelse noen kan kjenne igjen. Kvadratroten er hele grunnen til at vi bruker s framfor s² når vi skal rapportere spredning.",
      },
    ],
    riktigMetodeId: "sqrt-n-1",
    fasit: { verdi: 3.536, toleranse: 0.02, desimaler: 3, enhet: "kg" },
    svarEtikett: "s =",
    utregning: (
      <>
        <p>
          <strong>1. Gjennomsnittet:</strong> (12 + 15 + 18 + 19 + 21) / 5 = 85 / 5 ={" "}
          <span className="font-mono">x̄ = 17</span>
        </p>
        <p className="mt-1">
          <strong>2. Kvadrerte avvik:</strong> 25 + 4 + 1 + 4 + 16 ={" "}
          <span className="font-mono">50</span>
        </p>
        <p className="mt-1">
          <strong>3. Varians:</strong> 50 / 4 = <span className="font-mono">s² = 12,5 kg²</span>
        </p>
        <p className="mt-1">
          <strong>4. Standardavvik:</strong> √12,5 = <span className="font-mono">3,536 kg</span>
        </p>
      </>
    ),
  },
];

// ===========================================================================
// Oppgavetype 4 — feilsøking (4 stk)
// ===========================================================================

const FEILSOKING: Feilsoking[] = [
  {
    id: "m1-f1",
    tittel: "«Gjennomsnittslønna vår er 654 000»",
    feilnavn: "Gjennomsnitt på skjeve data",
    situasjon: (
      <>
        En bedrift med ni ansatte (lønningene fra oppgave 4 over) skal svare på en undersøkelse om
        lønnsnivå. HR skriver følgende i svaret. Konklusjonen er villedende — hvor går det galt?
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Vi har lønnstall for samtlige ni ansatte, altså hele populasjonen i bedriften.",
        vurdering:
          "Dette holder. Det er en helt korrekt og relevant presisering — og den er faktisk viktig, for den avgjør senere om vi skal dele på n eller n − 1 hvis vi skal regne spredning.",
      },
      {
        id: "l2",
        tekst: "Summen av de ni lønningene er 5 890 000 kroner.",
        vurdering:
          "Dette holder. Regn etter: 320 + 340 + 355 + 360 + 380 + 395 + 410 + 430 + 2900 = 5890 (i tusen). Ingen regnefeil her.",
      },
      {
        id: "l3",
        tekst: "Gjennomsnittslønna er dermed 5 890 000 / 9 = 654 400 kroner.",
        vurdering:
          "Dette holder også. Divisjonen er riktig utført, og gjennomsnittet ER 654 400. Feilen ligger ikke i selve tallet.",
      },
      {
        id: "l4",
        tekst: "En typisk ansatt hos oss tjener altså rundt 654 000 kroner.",
        vurdering:
          "Her er feilen. Åtte av ni ansatte tjener under 430 000 — ingen av dem er i nærheten av 654 000. Gjennomsnittet er et tyngdepunkt, og daglig leders 2,9 millioner er tung nok til å dra tyngdepunktet ut i et område der det ikke bor noen. Å kalle det «typisk» er å påstå noe om fordelingen som tallet ikke bærer.",
      },
      {
        id: "l5",
        tekst: "Vi ligger derfor godt over bransjesnittet på 480 000.",
        vurdering:
          "Denne setningen er bare en konsekvens av feilen i leddet før. Sammenligningen i seg selv er ikke ulovlig — problemet er at den bygger på et tall som ikke beskriver det den påstår.",
      },
    ],
    feilLeddId: "l4",
    riktigResonnement: (
      <>
        Oppgi <strong>medianen (380 000)</strong> som svar på «typisk», og nevn gjennomsnittet ved
        siden av med en forklaring: «medianlønn 380 000, gjennomsnittslønn 654 000 — forskjellen
        skyldes én ledende stilling». At de to målene spriker er ikke støy som skal skjules, det er
        den viktigste opplysningen om fordelingen. Tommelfingerregel: når gjennomsnittet ligger
        merkbart over medianen, har du en hale mot høyre, og da beskriver medianen «typisk» bedre.
      </>
    ),
  },
  {
    id: "m1-f2",
    tittel: "«Vi fjernet måleren som skilte seg ut»",
    feilnavn: "Uteligger fjernet uten faglig grunn",
    situasjon: (
      <>
        Et labforsøk måler utslipp fra tolv sensorer. Én sensor viser en langt høyere verdi enn de
        andre. Studenten skriver følgende i metodedelen.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Boksplottet viste at én av de tolv observasjonene lå langt utenfor de andre.",
        vurdering:
          "Dette holder. Å tegne dataene før man regner på dem er akkurat riktig framgangsmåte, og boksplottet er laget nettopp for å gjøre slike observasjoner synlige.",
      },
      {
        id: "l2",
        tekst:
          "Observasjonen lå mer enn 1,5 × IQR over Q3, og regnes derfor formelt som en uteligger.",
        vurdering:
          "Dette holder. 1,5 × IQR-regelen er den vanlige konvensjonen for å flagge uteliggere i et boksplott. Merk ordet «flagge»: regelen sier at observasjonen fortjener et blikk, ikke at den er feil.",
      },
      {
        id: "l3",
        tekst: "Vi fjernet derfor observasjonen fra datasettet før videre analyse.",
        vurdering:
          "Her er feilen. «Den er statistisk flagget som uteligger» er ikke en grunn til å slette noe — det er en grunn til å undersøke. En uteligger kan være (a) en målefeil, som kan fjernes hvis du kan dokumentere feilen, eller (b) en ekte, uvanlig observasjon, som da ofte er det mest interessante datapunktet du har. Å slette uten å avgjøre hvilken av de to det er, gjør analysen om til en selvoppfyllende profeti.",
      },
      {
        id: "l4",
        tekst: "Uten den fikk vi et gjennomsnitt på 42 og et standardavvik på 3,1.",
        vurdering:
          "Regnestykket i seg selv er ikke feil — men det beskriver et datasett som er konstruert til å se pent ut, ikke det som ble målt. Feilen ble begått i leddet før.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Undersøk sensoren først. Finner du en dokumenterbar årsak (kalibreringsfeil, løs kontakt,
        avlesning på feil enhet), fjern observasjonen og{" "}
        <strong>skriv i rapporten at du gjorde det, og hvorfor</strong>. Finner du ingen årsak,
        behold den — og bruk median og IQR i stedet for gjennomsnitt og standardavvik, siden de er
        robuste mot nettopp dette. Alternativt: rapporter begge analysene, med og uten, og la
        leseren se hvor mye konklusjonen henger på det ene punktet.
      </>
    ),
  },
  {
    id: "m1-f3",
    tittel: "«Halvparten ligger over gjennomsnittet»",
    feilnavn: "Median forvekslet med gjennomsnitt",
    situasjon: (
      <>
        En artikkel om boligpriser i en bydel inneholder dette resonnementet. Gjennomsnittsprisen er
        6,2 millioner og medianprisen er 4,8 millioner.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Vi har salgspris for alle 340 boliger omsatt i bydelen i fjor.",
        vurdering:
          "Dette holder, og er verdt å merke seg: dette er hele populasjonen av omsatte boliger, ikke et utvalg. Det påvirker ikke resten av resonnementet her, men det ville påvirket et eventuelt spredningsmål.",
      },
      {
        id: "l2",
        tekst: "Gjennomsnittsprisen er 6,2 millioner kroner.",
        vurdering:
          "Dette holder — vi tar det som gitt at summen er delt på 340 riktig. Ingenting galt med selve tallet.",
      },
      {
        id: "l3",
        tekst: "Halvparten av boligene ble dermed solgt for mer enn 6,2 millioner.",
        vurdering:
          "Her er feilen. Det er MEDIANEN som deler datasettet i to like store halvdeler — det er selve definisjonen av den. Gjennomsnittet har ingen slik garanti. Her er medianen 4,8 millioner, så halvparten av boligene gikk for mer enn 4,8, ikke mer enn 6,2. Faktisk lå langt færre enn halvparten over gjennomsnittet, fordi noen få dyre eneboliger drar snittet oppover.",
      },
      {
        id: "l4",
        tekst: "Bydelen har derfor et høyt prisnivå sammenlignet med byen for øvrig.",
        vurdering:
          "Konklusjonen kan for så vidt være riktig — men den er ikke støttet av leddet foran, som ikke holder. En konklusjon som tilfeldigvis stemmer, men er begrunnet feil, gir ikke uttelling på eksamen.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        «Halvparten ligger over» er en påstand om <strong>medianen</strong>, og bare om den: per
        definisjon ligger 50 % av observasjonene på hver side av Q2. For gjennomsnittet finnes ingen
        tilsvarende regel. I en høyreskjev fordeling — boligpriser, inntekt, ventetid — ligger
        typisk <em>godt under</em> halvparten over gjennomsnittet. Sjekk selv i simulatoren over:
        dra én prikk langt ut til høyre og se hvor få prikker som ender opp over det gule x̄-merket.
      </>
    ),
  },
  {
    id: "m1-f4",
    tittel: "«Vi delte på n − 1, som man skal»",
    feilnavn: "n − 1 brukt på hele populasjonen",
    situasjon: (
      <>
        En student skal beskrive spredningen i alderen til de seks ansatte i en bedrift (samme tall
        som i måloppgave 2). Oppgaven ber om spredningen <em>i denne bedriften</em>.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Vi har alderen til alle seks ansatte i bedriften.",
        vurdering:
          "Dette holder — og det er nøkkelopplysningen i hele oppgaven. Legg den på minne til neste ledd.",
      },
      {
        id: "l2",
        tekst: "Gjennomsnittet er 6 år, og kvadratsummen Σ(x − x̄)² blir 20.",
        vurdering:
          "Dette holder. (3−6)² + (5−6)² + (5−6)² + (7−6)² + (8−6)² + (8−6)² = 9 + 1 + 1 + 1 + 4 + 4 = 20. Ingen regnefeil.",
      },
      {
        id: "l3",
        tekst:
          "Vi deler på n − 1 = 5, siden man alltid skal dele på n − 1 for å få en forventningsrett varians.",
        vurdering:
          "Her er feilen. Ordet «alltid» er det som svikter. n − 1 retter opp en skjevhet som bare oppstår når vi bruker et utvalg til å gjette på en ukjent populasjon. Her er de seks HELE populasjonen — det finnes ingenting å gjette på, og dermed heller ingen skjevhet å korrigere. Da blåser n − 1 bare svaret kunstig opp.",
      },
      {
        id: "l4",
        tekst: "Variansen er dermed 20 / 5 = 4,0 år².",
        vurdering:
          "Divisjonen er riktig utført, men på feil nevner. Riktig svar er 20 / 6 = 3,33 år². Feilen ble begått i leddet over — dette leddet arver den bare.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Still ett spørsmål før du velger nevner:{" "}
        <strong>
          er tallene mine hele gruppen jeg vil uttale meg om, eller er de et utvalg fra en større
          gruppe?
        </strong>{" "}
        Hele gruppen → del på n, og kall svaret σ². Utvalg → del på n − 1, og kall svaret s². Merk
        at det ikke er størrelsen på datasettet som avgjør: seks observasjoner kan være en hel
        populasjon, og ti tusen kan være et utvalg. Det er <em>hvem du vil uttale deg om</em> som
        avgjør.
      </>
    ),
  },
];

// ===========================================================================
// Oppgavetype 5 — recall-kort
// ===========================================================================

const RECALL: RecallKort[] = [
  {
    id: "m1-r1",
    kategori: "formel",
    sporsmal: "Skriv formelen for stikkprøvevariansen s².",
    svar: (
      <>
        <span className="font-mono">s² = Σ(x − x̄)² / (n − 1)</span> — summér de kvadrerte avstandene
        fra gjennomsnittet, og del på antall observasjoner minus én.
      </>
    ),
    hvorforUtenat:
      "Kjerneformelen i hele modulen; alle senere spredningsmål og t-tester bygger på den.",
  },
  {
    id: "m1-r2",
    kategori: "når-brukes-hva",
    sporsmal: "Når deler du på n, og når deler du på n − 1?",
    svar: (
      <>
        <strong>n</strong> når dataene ER hele populasjonen du vil uttale deg om (σ²).{" "}
        <strong>n − 1</strong> når dataene er et utvalg som skal si noe om en større, ukjent
        populasjon (s²). Størrelsen på datasettet avgjør ikke — det gjør hvem du vil uttale deg om.
      </>
    ),
    hvorforUtenat:
      "Den vanligste enkeltfeilen i deskriptiv statistikk på eksamen, og den koster poeng hver gang.",
  },
  {
    id: "m1-r3",
    kategori: "når-brukes-hva",
    sporsmal: "Når velger du median framfor gjennomsnitt?",
    svar: (
      <>
        Når fordelingen er skjev eller har uteliggere — inntekt, boligpriser, ventetid, levetid.
        Signalet er at gjennomsnitt og median spriker merkbart. Ved symmetriske fordelinger uten
        uteliggere gir de omtrent samme svar, og da er gjennomsnittet å foretrekke fordi det bruker
        all informasjonen.
      </>
    ),
  },
  {
    id: "m1-r4",
    kategori: "definisjon",
    sporsmal: "Hva er IQR, og hvordan finner du den?",
    svar: (
      <>
        Kvartilbredden <span className="font-mono">IQR = Q3 − Q1</span>: bredden på den midterste
        halvparten av dataene. Sortér, del rekka i to halvdeler, og ta medianen av hver halvdel. Ved
        oddetall n holdes medianen utenfor begge halvdelene.
      </>
    ),
  },
  {
    id: "m1-r5",
    kategori: "formel",
    sporsmal:
      "Hva skjer med x̄, s² og s når du (a) legger til en konstant c, og (b) ganger alt med en konstant k?",
    svar: (
      <>
        <strong>(a) Legge til c:</strong> x̄ øker med c. s² og s er uendret — avstandene mellom
        observasjonene er de samme.
        <br />
        <strong>(b) Gange med k:</strong> x̄ ganges med k, s ganges med |k|, og s² ganges med k².
        Kvadreringen er grunnen til at variansen skalerer annerledes enn standardavviket.
      </>
    ),
    hvorforUtenat:
      "Går igjen som deloppgave, og gjør at du slipper å regne alt på nytt når enheten endres.",
  },
  {
    id: "m1-r6",
    kategori: "definisjon",
    sporsmal: "Hva skiller σ fra s, og μ fra x̄?",
    svar: (
      <>
        Greske bokstaver (μ, σ, σ²) er de <em>sanne, ukjente</em> tallene for hele populasjonen.
        Latinske (x̄, s, s²) er tallene vi har <em>regnet ut fra utvalget</em>. Resten av faget
        handler om hvor godt de latinske gjetter på de greske.
      </>
    ),
  },
  {
    id: "m1-r7",
    kategori: "felle",
    sporsmal:
      "Hvorfor er «halvparten ligger over gjennomsnittet» galt, og hva er den riktige setningen?",
    svar: (
      <>
        Det er <strong>medianen</strong> som per definisjon deler datasettet i to like halvdeler.
        Gjennomsnittet har ingen slik egenskap. I en høyreskjev fordeling ligger som regel klart
        mindre enn halvparten over gjennomsnittet.
      </>
    ),
    hvorforUtenat: "Klassisk formuleringsfelle som gjør et ellers riktig svar galt.",
  },
  {
    id: "m1-r8",
    kategori: "felle",
    sporsmal: "Hva gjør du med en observasjon som 1,5 × IQR-regelen flagger som uteligger?",
    svar: (
      <>
        Undersøker den. Regelen flagger, den dømmer ikke. Kan du dokumentere en målefeil, fjern
        observasjonen <em>og skriv at du gjorde det</em>. Kan du ikke det, behold den og bruk median
        og IQR, som er robuste mot den.
      </>
    ),
  },
];

// ===========================================================================
// Siden
// ===========================================================================

export function Modul1DataPage() {
  return (
    <StackPageShell title="TEK-1501 Modul 1 — Data" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            TEK-1501 · Modul 1 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Data — å beskrive det du faktisk har målt
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Før vi kan si noe om sannsynlighet, fordelinger eller hypoteser, må vi kunne beskrive en
            haug med målinger med noen få tall. Denne modulen handler om de tallene: hvor dataene
            ligger, hvor mye de spriker, og — viktigst — når hvert av målene lyver. Statistisk
            intuisjon bommer systematisk her, så vi begynner med å la deg bomme med vilje.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-foreground">Slik er modulen bygget:</strong> du <em>anslår</em>{" "}
            først, uten hjelp. Så <em>ser</em> du hva som skjer i simulatorene. Så <em>regner</em>{" "}
            du selv, med sjekk på både metodevalg og tall. Til slutt <em>feilsøker</em> du ferdige
            resonnementer som er gale. Kortene nederst er bare sluttsjekken — de er ikke der du
            lærer stoffet.
          </div>
          <ProvisoriskKapittelnote className="mt-3" />
        </header>

        <CourseOutline courseId="tek1-modul1-data" steps={STEPS} />

        {/* ---------------------------------------------------------------- */}
        <div className="mt-10" />
        <Symboltavle id="symboler" symboler={SYMBOLER} />

        {/* --- Type 1: anslå-så-sjekk, FØR forklaringen -------------------- */}
        <AnslaSaSjekk id="anslag" anslag={ANSLAG} />

        {/* --- Forklaring + type 2: guidede simuleringer ------------------- */}
        <section id="utvalg" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Layers className="h-5 w-5 text-brand" /> Utvalg og populasjon
          </h2>
          <p className="leading-relaxed">
            <strong>Populasjonen</strong> er hele gruppen du egentlig vil si noe om: alle innbyggere
            i Norge, alle pakker som noen gang produseres på fabrikken, alle mulige målinger
            sensoren kan gjøre. Den er nesten alltid for stor til å måle, og ofte uendelig.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Utvalget</strong> er de konkrete observasjonene du sitter med. Det er endelig,
            det er målt, og det er alt du har. Hele statistikkfaget er et forsøk på å si noe
            troverdig om populasjonen med bare utvalget i hånda.
          </p>
          <p className="mt-2 leading-relaxed">
            Skillet er ikke akademisk pirk — det avgjør konkrete regnestykker. Når du senere i denne
            modulen skal velge om du deler på n eller n − 1, er det <em>utelukkende</em> dette
            spørsmålet som bestemmer svaret. Og det er derfor notasjonen skiller så strengt mellom
            greske og latinske bokstaver: μ og σ hører til populasjonen, x̄ og s hører til utvalget.
          </p>
        </section>

        <section id="sentralmal" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Sigma className="h-5 w-5 text-brand" /> Sentralmål og kvartiler
          </h2>
          <p className="mb-3 leading-relaxed">
            Det finnes tre svar på «hvor ligger dataene typisk», og de er uenige så snart
            fordelingen er skjev. <strong>Gjennomsnittet x̄</strong> er tyngdepunktet: legg sammen
            alt, del på n. <strong>Medianen</strong> er observasjonen midt i den sorterte rekka.{" "}
            <strong>Modus</strong> er den verdien som går igjen oftest — mest nyttig for kategorier,
            som skostørrelse. Kvartilene Q1 og Q3 er samme idé som medianen, bare 25 % og 75 % inn i
            køen.
          </p>
          <p className="mb-4 leading-relaxed">
            Dra i prikkene under, og legg spesielt merke til forskjellen i hvordan den gule
            x̄-markøren og den blå median-streken oppfører seg.
          </p>
          <KvartilProkkrekke />
        </section>

        <section id="uteliggere" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Eye className="h-5 w-5 text-brand" /> Én uteligger, to helt ulike svar
          </h2>
          <p className="mb-4 leading-relaxed">
            Samme poeng, sett fra en annen vinkel: hva én ekstrem observasjon gjør med hvert av
            målene. Dette er fasiten på de tre første anslagene dine.
          </p>
          <OutlierImpactDemo />
        </section>

        <section id="skjevhet" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Skjevhet — når halen bestemmer</h2>
          <p className="mb-4 leading-relaxed">
            En fordeling er <strong>høyreskjev</strong> når den har en lang hale mot høyre: de
            fleste observasjonene ligger lavt, men noen få ligger svært høyt. Inntekt, boligpriser
            og ventetid er nesten alltid høyreskjeve. Kjennetegnet du kan bruke uten å tegne noe:
            gjennomsnittet ligger merkbart <em>over</em> medianen. Ved venstreskjevhet er det
            motsatt.
          </p>
          <SkewnessKurtosisViz />
        </section>

        <section id="spredning" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Spredning: varians, standardavvik, IQR</h2>
          <p className="leading-relaxed">
            To datasett kan ha nøyaktig samme gjennomsnitt og likevel være helt forskjellige.
            Spredningsmålene tallfester forskjellen.
          </p>
          <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed">
            <li className="list-disc">
              <strong>Variansen s²</strong> — gjennomsnittlig kvadrert avstand fra x̄. Vi kvadrerer
              for at avvik over og under ikke skal oppheve hverandre. Prisen er at enheten blir
              kvadrert også: kroner², som ingen har intuisjon for.
            </li>
            <li className="list-disc">
              <strong>Standardavviket s</strong> — kvadratroten av s², som gir oss enheten tilbake.
              Dette er tallet du rapporterer.
            </li>
            <li className="list-disc">
              <strong>Kvartilbredden IQR</strong> — Q3 − Q1. Ser bare på posisjoner i den sorterte
              rekka, og er derfor upåvirket av hvor ekstreme ytterpunktene er. Førstevalget når
              dataene er skjeve.
            </li>
          </ul>
        </section>

        <section id="n-minus-en" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Hvorfor n − 1?</h2>
          <p className="mb-4 leading-relaxed">
            Dette er modulens ene virkelig kontraintuitive punkt, og forklaringen «vi brukte opp én
            frihetsgrad på å estimere x̄» overbeviser sjelden noen første gang. Så la oss i stedet se
            skjevheten skje.
          </p>
          <NMinusEnSim />
        </section>

        <section id="plot" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <BarChart3 className="h-5 w-5 text-brand" /> Se på dataene før du regner
          </h2>
          <p className="mb-4 leading-relaxed">
            Histogram viser formen, boksplott viser sentrum og uteliggere, spredningsplott viser
            sammenhengen mellom to variabler. Alle tre bør tegnes før du regner ut et eneste tall —
            nettopp fordi tallene ikke røper skjevhet og uteliggere av seg selv. Justér fordelingen
            under og se hvordan målene beveger seg.
          </p>
          <InteractiveDistributionPlayground />
        </section>

        {/* --- Type 3: måloppgaver med tilstandssjekk ---------------------- */}
        <Maloppgaver id="maloppgaver" oppgaver={MALOPPGAVER} />

        {/* --- Type 4: feilsøking ------------------------------------------ */}
        <Feilsokingsoppgaver id="feilsoking" oppgaver={FEILSOKING} />

        {/* --- Type 5: recall ---------------------------------------------- */}
        <RecallKortSeksjon id="recall" kort={RECALL} />

        {/* --- Videre ------------------------------------------------------ */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">Videre herfra</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-modul2-sannsynlighet" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 font-medium text-brand hover:bg-brand/20"
            >
              Modul 2 — Sannsynlighet
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-deskriptiv" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypende leksjon: deskriptiv statistikk
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek-1501" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Tilbake til fag-hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}
