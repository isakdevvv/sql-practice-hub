import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Crosshair,
  GitCompare,
  Percent,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";
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

// Den ene simuleringen som ikke fantes fra før i TEK-1501-sidene.
import { MultippelTestingSim } from "./MultippelTestingSim";

// Gjenbrukte simulatorer fra de eksisterende temasidene. Modulen redigerer dem
// ikke — den setter dem inn i riktig rekkefølge i forhold til anslagene.
import { ConfidenceIntervalVisualizer } from "@/components/stack/tek1-inferens-sampling/ConfidenceIntervalVisualizer";
import { TtestVisualizer } from "@/components/stack/tek1-inferens-sampling/TtestVisualizer";
import { PValueDistributionSim } from "@/components/stack/tek1-inferens-sampling/PValueDistributionSim";
import { InferenceMatchQuiz } from "@/components/stack/tek1-inferens-sampling/InferenceMatchQuiz";
import { Type1Type2ErrorAreas } from "@/components/stack/tek1-hypotesetest-regresjon/Type1Type2ErrorAreas";
import { PowerCurve } from "@/components/stack/tek1-hypotesetest-regresjon/PowerCurve";
import { PValueCalculator } from "@/components/stack/tek1-p-verdi-kalkulator/PValueCalculator";
import { ProportionCiVisualizer } from "@/components/stack/tek1-proporsjoner/ProportionCiVisualizer";
import { ProporsjonsCalculator } from "@/components/stack/tek1-proporsjoner/ProporsjonsCalculator";
import { RegresjonDiagnostikk } from "@/components/stack/tek1-regresjon-diagnostikk/RegresjonDiagnostikk";
import { QqPlotInteractive } from "@/components/stack/tek1-regresjon-diagnostikk/QqPlotInteractive";
import { BootstrapResamplingSim } from "@/components/stack/tek1-bootstrap/BootstrapResamplingSim";

// ---------------------------------------------------------------------------
// TEK-1501 Modul 4 — Inferens og regresjon.
// Spor D (D1–D14) og spor E (E1–E5) i plan-tek-1501.md.
//
// Samme arkitektur som modul 1–3 (PLAN-HOST26-MODULER.md §3): anslå-så-sjekk
// FØR forklaringen → guidede simuleringer UNDER → måloppgaver med tilstandssjekk
// ETTER → feilsøking SIST → recall til slutt.
//
// Feilsøkingsdelen er tyngre vektet her enn i noen annen modul, og det er med
// vilje: i inferens er selve tolkningen eksamensstoffet. Regnestykkene er korte
// og mekaniske; det som skiller besvarelsene er om studenten sier noe sant om
// hva tallet betyr. De seks feilsøkingsoppgavene dekker de seks klassiske
// feiltolkningene — p-verdi som P(H₀ sann), «ikke signifikant» som «ingen
// effekt», korrelasjon som årsak, multiple sammenligninger uten korreksjon,
// konfidensintervall lest bayesiansk, og ekstrapolering utenfor dataområdet.
//
// Alle fasitene i måloppgavene er regnet ut med src/lib/tek1501/inferens.ts,
// ikke skrevet inn for hånd (§3.1).
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Symbolene først", anchor: "symboler" },
  { title: "Anslå — før du leser", anchor: "anslag" },
  { title: "Estimator, estimat og standardfeil", anchor: "estimering" },
  { title: "Konfidensintervall (interaktiv)", anchor: "ki" },
  { title: "Hypotesestrukturen", anchor: "hypoteser" },
  { title: "Testobservator og p-verdi (interaktiv)", anchor: "pverdi" },
  { title: "Type I, type II og styrke (interaktiv)", anchor: "feiltyper" },
  { title: "Multiple sammenligninger (interaktiv)", anchor: "multippel" },
  { title: "Velge riktig test (interaktiv)", anchor: "velge" },
  { title: "Andeler", anchor: "andeler" },
  { title: "Korrelasjon og regresjon (interaktiv)", anchor: "regresjon" },
  { title: "Residualanalyse (interaktiv)", anchor: "residualer" },
  { title: "Måloppgaver", anchor: "maloppgaver" },
  { title: "Feilsøking", anchor: "feilsoking" },
  { title: "Recall-kort", anchor: "recall" },
  { title: "Dypere enn pensum", anchor: "dypere" },
];

// ===========================================================================
// Symboltavle — progressiv scaffolding. Ingen av disse brukes før de står her.
// De nye symbolene i denne modulen er z, t, H₀, H₁, α, β, p-verdi, p̂, r og β̂.
// ===========================================================================

const SYMBOLER: SymbolRad[] = [
  {
    tegn: "μ",
    uttale: "my",
    verden: "populasjon",
    kjentFraFor: "modul 1 og 3",
    betydning: (
      <>
        Det sanne populasjonsgjennomsnittet. Hele modulen handler om å si noe om <em>denne</em>{" "}
        størrelsen uten noen gang å få se den.
      </>
    ),
  },
  {
    tegn: "x̄",
    uttale: "x-strek",
    verden: "utvalg",
    kjentFraFor: "modul 1",
    betydning: (
      <>
        Gjennomsnittet i utvalget — vårt beste gjett på μ. Ett tall, regnet fra dataene vi faktisk
        har.
      </>
    ),
  },
  {
    tegn: "s",
    uttale: "ess",
    verden: "utvalg",
    kjentFraFor: "modul 1",
    betydning: (
      <>
        Utvalgsstandardavviket, regnet med n − 1 i nevneren. Det er dette vi setter inn når σ er
        ukjent — og det er nettopp derfor t-fordelingen finnes.
      </>
    ),
  },
  {
    tegn: "SE",
    uttale: "standardfeilen",
    verden: "utvalg",
    betydning: (
      <>
        <strong>Standardfeilen</strong> — standardavviket til <em>estimatoren</em>, ikke til
        dataene. For et gjennomsnitt er SE = s/√n. Alt i modulen er «estimat ± noe · SE» eller
        «(estimat − H₀-verdi) / SE».
      </>
    ),
  },
  {
    tegn: "H₀",
    uttale: "H-null",
    verden: "generelt",
    betydning: (
      <>
        <strong>Nullhypotesen</strong> — påstanden om at det ikke skjer noe: ingen forskjell, ingen
        effekt, ingen sammenheng. Den inneholder alltid et likhetstegn, og det er den vi later som
        er sann mens vi regner.
      </>
    ),
  },
  {
    tegn: "H₁",
    uttale: "H-en",
    verden: "generelt",
    betydning: (
      <>
        <strong>Alternativhypotesen</strong> — det vi egentlig mistenker. Skrives også H<sub>A</sub>.
        Den avgjør om testen er ensidig (≠ blir &gt; eller &lt;) eller tosidig.
      </>
    ),
  },
  {
    tegn: "α",
    uttale: "alfa",
    verden: "generelt",
    betydning: (
      <>
        <strong>Signifikansnivået</strong> — hvor stor risiko vi på forhånd godtar for å forkaste en
        sann H₀. Nesten alltid 0,05. Det er et valg vi tar <em>før</em> vi ser dataene, ikke noe vi
        leser ut av dem.
      </>
    ),
  },
  {
    tegn: "β",
    uttale: "beta",
    verden: "generelt",
    betydning: (
      <>
        Sannsynligheten for å <em>beholde</em> en H₀ som faktisk er falsk. <strong>Styrken</strong> er
        1 − β: sjansen for å oppdage en effekt som virkelig finnes. Advarsel: β brukes også om
        regresjonskoeffisienter lenger nede — se de to siste radene.
      </>
    ),
  },
  {
    tegn: "p-verdi",
    uttale: "pe-verdi",
    verden: "generelt",
    betydning: (
      <>
        Sannsynligheten for å se data <em>minst så ekstreme</em> som våre,{" "}
        <strong>gitt at H₀ er sann</strong>. Betingingen står på H₀ — ikke omvendt. Merk at denne
        bokstaven p er noe helt annet enn p-en i den binomiske fordelingen fra modul 3.
      </>
    ),
  },
  {
    tegn: "z",
    uttale: "zett",
    verden: "generelt",
    kjentFraFor: "modul 3",
    betydning: (
      <>
        Testobservator når σ er kjent, eller når vi jobber med andeler:{" "}
        <span className="font-mono">z = (estimat − H₀-verdi) / SE</span>. Samme standardisering som
        i modul 3, brukt på et estimat i stedet for på én måling.
      </>
    ),
  },
  {
    tegn: "t",
    uttale: "te",
    verden: "generelt",
    betydning: (
      <>
        Testobservator når σ er <strong>ukjent</strong> og erstattet av s. t-fordelingen har tyngre
        haler enn z — den ekstra usikkerheten fra å ha gjettet på σ. Formen styres av{" "}
        <strong>df</strong> (frihetsgrader), og for ett utvalg er df = n − 1.
      </>
    ),
  },
  {
    tegn: "p̂",
    uttale: "pe-hatt",
    verden: "utvalg",
    betydning: (
      <>
        Den observerte <strong>andelen</strong> i utvalget: x/n. Hatten betyr «estimat av». Den
        sanne, ukjente andelen i populasjonen skrives p.
      </>
    ),
  },
  {
    tegn: "r",
    uttale: "err",
    verden: "utvalg",
    betydning: (
      <>
        <strong>Pearsons korrelasjonskoeffisient</strong>, et tall mellom −1 og 1 som måler{" "}
        <em>lineær</em> samvariasjon. r = 0 betyr ingen lineær sammenheng — ikke ingen sammenheng.
      </>
    ),
  },
  {
    tegn: "β̂₀, β̂₁",
    uttale: "beta-null-hatt, beta-en-hatt",
    verden: "utvalg",
    betydning: (
      <>
        Konstantleddet og stigningstallet i regresjonslinja{" "}
        <span className="font-mono">ŷ = β̂₀ + β̂₁x</span>, estimert fra data. Uten hatt (β₀, β₁) er de
        de sanne, ukjente verdiene — samme greske-mot-latinsk-logikk som μ mot x̄.
      </>
    ),
  },
  {
    tegn: "R²",
    uttale: "err i andre",
    verden: "utvalg",
    betydning: (
      <>
        Andelen av variasjonen i y som modellen forklarer:{" "}
        <span className="font-mono">R² = 1 − SS_res/SS_tot</span>. For enkel lineær regresjon er R²
        nøyaktig r². Høy R² sier at linja passer — ikke at modellen er riktig.
      </>
    ),
  },
];

// ===========================================================================
// Type 1 — ANSLÅ-SÅ-SJEKK. Seks stykker, alle før forklaringen.
// ===========================================================================

const ANSLAG: Anslag[] = [
  {
    id: "m4-a1",
    tema: "Hva p-verdien faktisk sier",
    sporsmal: (
      <>
        En studie rapporterer <strong>p = 0,03</strong>. Hva er sannsynligheten for at
        nullhypotesen er sann?
      </>
    ),
    alternativer: [
      { id: "a", label: "3 %" },
      { id: "b", label: "97 %" },
      { id: "c", label: "Under 5 %, men vi vet ikke nøyaktig" },
      { id: "d", label: "Kan ikke leses av p-verdien i det hele tatt" },
    ],
    riktigId: "d",
    fasit: (
      <>
        <strong>Kan ikke leses av p-verdien.</strong> p = 0,03 betyr: <em>hvis</em> H₀ er sann, ville
        vi sett data minst så ekstreme som våre i 3 % av gjentakelsene. Det er P(data | H₀) — ikke
        P(H₀ | data). Å regne det siste krever at du oppgir hvor sannsynlig H₀ var på forhånd, og det
        gjør en p-verdi aldri.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Dette er nøyaktig samme omvendte betinging som medisintest-oppgaven i modul 2, i ny drakt.
        Der var det P(positiv | syk) mot P(syk | positiv); her er det P(data | H₀) mot P(H₀ | data).
        Uten en prevalens — altså hvor ofte slike hypoteser er sanne i utgangspunktet — finnes det
        ingen vekslingskurs mellom de to.
      </>
    ),
  },
  {
    id: "m4-a2",
    tema: "Hva «95 %» i et konfidensintervall viser til",
    sporsmal: (
      <>
        Du har regnet ut ett 95 % konfidensintervall: <strong>(49,9 ; 54,9)</strong>. Hva er
        sannsynligheten for at den sanne μ ligger inne i akkurat dette intervallet?
      </>
    ),
    alternativer: [
      { id: "a", label: "95 %" },
      { id: "b", label: "Enten 0 eller 1 — vi vet bare ikke hvilken" },
      { id: "c", label: "Litt under 95 %, fordi vi brukte s og ikke σ" },
      { id: "d", label: "5 %" },
    ],
    riktigId: "b",
    fasit: (
      <>
        <strong>Enten 0 eller 1.</strong> μ er et fast tall, og intervallet er nå også fast — enten
        er tallet inni, eller så er det ikke. De 95 % er en egenskap ved <em>metoden</em>: gjentar du
        hele prosedyren på nye utvalg, vil 95 % av intervallene du lager inneholde μ. Det er en
        påstand om intervallene, ikke om μ.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi vil gjerne uttale oss om <em>vårt</em> intervall, for det er det vi har. Men i den
        frekventistiske rammen er ikke μ tilfeldig — det er dataene som er tilfeldige, og dermed
        intervallets endepunkter. Simulatoren med 100 intervaller lenger nede gjør forskjellen
        umiddelbart synlig: du ser nøyaktig hvilke fem som bommer.
      </>
    ),
  },
  {
    id: "m4-a3",
    tema: "To studier som «motsier hverandre»",
    sporsmal: (
      <>
        Studie A finner <strong>p = 0,04</strong> og konkluderer med effekt. Studie B, med nesten
        identisk design og størrelse, finner <strong>p = 0,06</strong> og konkluderer med ingen
        effekt. Hvor sterkt motsier de hverandre?
      </>
    ),
    alternativer: [
      { id: "a", label: "Sterkt — den ene fant effekt, den andre ikke" },
      { id: "b", label: "Moderat — de peker i ulik retning" },
      { id: "c", label: "Nesten ikke i det hele tatt — dataene er svært like" },
      { id: "d", label: "Umulig å si uten å vite utvalgsstørrelsene" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>Nesten ikke i det hele tatt.</strong> p = 0,04 og p = 0,06 svarer til nesten identiske
        testobservatorer og nesten identiske estimater. Det som skiller dem er at en vilkårlig
        terskel på 0,05 tilfeldigvis går imellom. Konklusjonene ser motsatte ut fordi vi har tvunget
        et kontinuerlig mål ned i to bokser.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Ordet «signifikant» høres ut som en egenskap ved virkeligheten, ikke som en terskelbeslutning
        vi selv har valgt. α = 0,05 er en konvensjon, ikke en naturkonstant. Rapportér derfor alltid
        selve p-verdien og et konfidensintervall — ikke bare «signifikant / ikke signifikant».
      </>
    ),
  },
  {
    id: "m4-a4",
    tema: "Mange tester på samme datasett",
    sporsmal: (
      <>
        Du tester <strong>20 uavhengige hypoteser</strong> på nivå α = 0,05, og{" "}
        <strong>alle nullhypotesene er i virkeligheten sanne</strong>. Hvor sannsynlig er det at minst
        én av dem blir «signifikant»?
      </>
    ),
    alternativer: [
      { id: "a", label: "5 % — det er jo nivået vi valgte" },
      { id: "b", label: "Rundt 20 %" },
      { id: "c", label: "Rundt 40 %" },
      { id: "d", label: "Rundt 64 %" },
    ],
    riktigId: "d",
    fasit: (
      <>
        <strong>64,2 %.</strong> Regnestykket er komplementet fra modul 2:{" "}
        <span className="font-mono">1 − (1 − 0,05)²⁰ = 1 − 0,95²⁰ = 0,642</span>. Med tjue tester er
        det altså mer sannsynlig enn ikke at du finner minst ett «funn» som ikke finnes.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi tenker på α som en garanti for hele analysen, men den gjelder <em>per test</em>. Jo flere
        spørsmål du stiller det samme datasettet, desto flere sjanser gir du tilfeldigheten. Det er
        derfor det betyr noe om hypotesene ble formulert før eller etter at dataene ble sett.
      </>
    ),
  },
  {
    id: "m4-a5",
    tema: "Korrelasjon nær null",
    sporsmal: (
      <>
        Du regner ut korrelasjonen mellom to variabler og får <strong>r = 0,00</strong>. Hva kan du
        konkludere?
      </>
    ),
    alternativer: [
      { id: "a", label: "Variablene er uavhengige" },
      { id: "b", label: "Det finnes ingen sammenheng mellom dem" },
      { id: "c", label: "Det finnes ingen lineær sammenheng — men gjerne en annen" },
      { id: "d", label: "Datasettet er for lite til å si noe" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>Ingen lineær sammenheng.</strong> r måler bare hvor godt en rett linje beskriver
        punktene. Ligger punktene på en perfekt parabel — y = x² med x symmetrisk om null — er r
        nøyaktig 0, samtidig som y er fullstendig bestemt av x. Plott alltid dataene før du tolker
        r.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi leser «korrelasjon» som «sammenheng» i dagligtale, mens den tekniske betydningen er
        smalere: <em>lineær</em> samvariasjon. Motsatt vei gjelder samme forsiktighet — en høy r sier
        heller ikke at sammenhengen er lineær, bare at en linje fanger mye av den.
      </>
    ),
  },
  {
    id: "m4-a6",
    tema: "Hvor mye smalere blir intervallet?",
    sporsmal: (
      <>
        Du har et 95 % konfidensintervall basert på <strong>n = 25</strong> målinger, og vil ha det{" "}
        <strong>halvparten så bredt</strong>. Omtrent hvor mange målinger trenger du?
      </>
    ),
    alternativer: [
      { id: "a", label: "50" },
      { id: "b", label: "75" },
      { id: "c", label: "100" },
      { id: "d", label: "625" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>Cirka 100.</strong> Bredden er proporsjonal med SE = s/√n, så halvering krever at √n
        dobles, altså at n firedobles. (Med t-fordelingen blir forholdet 2,08 og ikke helt nøyaktig
        2, fordi den kritiske t-verdien også krymper litt når df vokser — men effekten er liten.)
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Samme kvadratrot som i modul 3, nå med en pris i kroner: firedobbelt datainnsamling for
        halvparten så bred usikkerhet. Det er hele grunnen til at man planlegger utvalgsstørrelse{" "}
        <em>før</em> studien, når det fortsatt er billig å endre den.
      </>
    ),
  },
];

// ===========================================================================
// Type 3 — MÅLOPPGAVER med tilstandssjekk (metode + tall, hver for seg).
// Alle fasitene er regnet ut med src/lib/tek1501/inferens.ts.
//
// Oppgave 1–3 bygger på samme datasett, slik at kjeden estimat → intervall →
// test → tolkning henger sammen i stedet for å være tre løsrevne regnestykker.
// ===========================================================================

const MALOPPGAVER: MaloppgaveData[] = [
  {
    id: "m4-o1",
    tittel: "Feilmarginen i et 95 % konfidensintervall",
    oppgave: (
      <>
        Et laboratorium har målt herdetiden til <strong>25 prøver</strong>. Gjennomsnittet er{" "}
        <strong>52,4 minutter</strong> og utvalgsstandardavviket er <strong>6,1 minutter</strong>.
        Populasjonens standardavvik er ukjent. Regn ut <strong>feilmarginen</strong> — altså tallet
        etter «±» — i et 95 % konfidensintervall for μ.
      </>
    ),
    data: <>x̄ = 52,4 · s = 6,1 · n = 25 · nivå 95 % · σ ukjent</>,
    metoder: [
      { id: "t", label: "t-intervall: t(α/2, n − 1) · s/√n, med df = 24" },
      {
        id: "z",
        label: "z-intervall: 1,96 · s/√n",
        hvorforFeil:
          "z gjelder når σ er KJENT. Her er σ ukjent og erstattet av s, og den ekstra usikkerheten fanges av t-fordelingen. Med n = 25 er t₀,₀₂₅,₂₄ = 2,064 mot z = 1,960, så du undervurderer marginen: 2,391 i stedet for 2,518.",
      },
      {
        id: "delt-n",
        label: "t(α/2, n − 1) · s/n",
        hvorforFeil:
          "Standardfeilen er s/√n, ikke s/n. Med n i nevneren får du 0,504 i stedet for 2,518 — et intervall fem ganger for smalt. Kvadratroten er nettopp det som gjør at gevinsten ved flere målinger avtar.",
      },
    ],
    riktigMetodeId: "t",
    fasit: { verdi: 2.518, toleranse: 0.02, desimaler: 3, enhet: "minutter" },
    svarEtikett: "Feilmargin =",
    utregning: (
      <>
        <p>
          <strong>1. Velg fordeling.</strong> σ er ukjent og estimert med s ⇒ t-fordelingen, med df =
          n − 1 = 24.
        </p>
        <p className="mt-1">
          <strong>2. Standardfeilen:</strong>{" "}
          <span className="font-mono">SE = s/√n = 6,1/√25 = 6,1/5 = 1,22</span>
        </p>
        <p className="mt-1">
          <strong>3. Kritisk verdi:</strong>{" "}
          <span className="font-mono">t₀,₀₂₅ med df = 24 er 2,0639</span>
        </p>
        <p className="mt-1">
          <strong>4. Feilmargin:</strong>{" "}
          <span className="font-mono">2,0639 · 1,22 = 2,518</span> minutter, altså intervallet
          (49,88 ; 54,92).
        </p>
        <p className="mt-2 text-muted-foreground">
          Legg merke til hva de to faktorene gjør. SE avhenger av dataene og av n; den kritiske
          verdien avhenger bare av hvor sikker du vil være og av df. Vil du ha 99 % i stedet for 95
          %, er det kun den kritiske verdien som endres — og intervallet blir bredere, ikke bedre.
        </p>
      </>
    ),
  },
  {
    id: "m4-o2",
    tittel: "Testobservatoren for samme datasett",
    oppgave: (
      <>
        Samme 25 målinger som i oppgave 1 (x̄ = 52,4, s = 6,1). Leverandøren hevder at herdetiden i
        gjennomsnitt er <strong>50 minutter</strong>. Test H₀: μ = 50 mot H₁: μ ≠ 50, og regn ut{" "}
        <strong>testobservatoren</strong>.
      </>
    ),
    data: <>x̄ = 52,4 · s = 6,1 · n = 25 · μ₀ = 50 · tosidig test</>,
    metoder: [
      { id: "t", label: "Ett-utvalgs t-test: t = (x̄ − μ₀) / (s/√n)" },
      {
        id: "z",
        label: "z-test: z = (x̄ − μ₀) / (σ/√n) med σ = 6,1",
        hvorforFeil:
          "Selve tallet blir det samme (1,967), men navnet og fordelingen du sammenligner mot er feil. 6,1 er s, ikke σ — vi har estimert den. Konsekvensen kommer i neste oppgave: p-verdien må leses fra t-fordelingen med df = 24, ikke fra normalfordelingen.",
      },
      {
        id: "uten-se",
        label: "t = (x̄ − μ₀) / s",
        hvorforFeil:
          "Du deler på spredningen i DATAENE i stedet for på spredningen i ESTIMATET. Det gir 0,393 i stedet for 1,967 — fem ganger for lite, siden √25 = 5. Testobservatorer måler alltid avstand i antall standardfeil, ikke i antall standardavvik.",
      },
    ],
    riktigMetodeId: "t",
    fasit: { verdi: 1.967, toleranse: 0.02, desimaler: 3 },
    svarEtikett: "t =",
    utregning: (
      <>
        <p>
          <strong>1. Hypotesene:</strong> <span className="font-mono">H₀: μ = 50</span> mot{" "}
          <span className="font-mono">H₁: μ ≠ 50</span>. Tosidig, fordi vi ikke på forhånd hadde
          grunn til å tro at avviket måtte gå oppover.
        </p>
        <p className="mt-1">
          <strong>2. Standardfeilen</strong> er den samme som i oppgave 1:{" "}
          <span className="font-mono">SE = 6,1/5 = 1,22</span>
        </p>
        <p className="mt-1">
          <strong>3. Testobservator:</strong>{" "}
          <span className="font-mono">t = (52,4 − 50) / 1,22 = 2,4/1,22 = 1,9672</span>, med df = 24.
        </p>
        <p className="mt-2 text-muted-foreground">
          Les tallet som en setning: estimatet vårt ligger 1,97 standardfeil over det leverandøren
          hevder. Sammenlign med feilmarginen fra oppgave 1: den var 2,518, og avviket vårt er 2,4 —
          altså <em>innenfor</em> intervallet. Det er ingen tilfeldighet at de to konklusjonene
          henger sammen, og neste oppgave viser hvorfor.
        </p>
      </>
    ),
  },
  {
    id: "m4-o3",
    tittel: "p-verdien — og hva den ikke sier",
    oppgave: (
      <>
        Fortsettelse av oppgave 2: t = 1,967 med df = 24, tosidig test. Regn ut{" "}
        <strong>p-verdien</strong>.
      </>
    ),
    data: <>t = 1,9672 · df = 24 · H₁: μ ≠ 50, altså tosidig</>,
    metoder: [
      { id: "tosidig", label: "Tosidig: p = 2 · P(T > |t|) med df = 24" },
      {
        id: "ensidig",
        label: "Ensidig: p = P(T > t) med df = 24",
        hvorforFeil:
          "Ensidig gir 0,0304 og ville krysset 0,05-terskelen. Men H₁ er «≠», så avvik i BEGGE retninger teller som like ekstreme, og halearealet må dobles. Å bytte til ensidig etter å ha sett retningen på dataene er en av de mest kritiserte praksisene i faget.",
      },
      {
        id: "normal",
        label: "Tosidig fra normalfordelingen: p = 2 · (1 − Φ(1,967))",
        hvorforFeil:
          "Det gir 0,0492 — så vidt under 0,05, altså motsatt konklusjon. Med σ ukjent og n = 25 har t tyngre haler enn z, så samme observator gir større p-verdi. Forskjellen krymper når n vokser, men her er den akkurat stor nok til å snu svaret.",
      },
    ],
    riktigMetodeId: "tosidig",
    fasit: { verdi: 0.0608, toleranse: 0.002, desimaler: 4 },
    svarEtikett: "p-verdi =",
    utregning: (
      <>
        <p>
          <strong>1. Halearealet på én side:</strong>{" "}
          <span className="font-mono">P(T &gt; 1,9672) = 0,0304</span> med df = 24.
        </p>
        <p className="mt-1">
          <strong>2. Doble, fordi testen er tosidig:</strong>{" "}
          <span className="font-mono">p = 2 · 0,0304 = 0,0608</span>
        </p>
        <p className="mt-1">
          <strong>3. Konkluder:</strong> p = 0,0608 &gt; α = 0,05, så vi <em>beholder</em> H₀ på 5
          %-nivået.
        </p>
        <p className="mt-2 text-muted-foreground">
          Legg merke til at de tre oppgavene er tre måter å si det samme på: 50 ligger innenfor
          konfidensintervallet (49,88 ; 54,92), t = 1,97 er mindre enn den kritiske 2,06, og p =
          0,0608 er større enn 0,05. Det er ingen tilfeldighet — et tosidig t-intervall og en tosidig
          t-test er samme regnestykke sett fra hver sin kant.
        </p>
        <p className="mt-2 text-muted-foreground">
          Og til formuleringen: riktig konklusjon er «vi har ikke sterkt nok grunnlag til å forkaste
          at μ = 50», <em>ikke</em> «herdetiden er 50 minutter». Med et estimat på 52,4 og et
          intervall som strekker seg til 54,9 er en effekt på flere minutter fullt forenlig med
          dataene.
        </p>
      </>
    ),
  },
  {
    id: "m4-o4",
    tittel: "Konfidensintervall for en andel",
    oppgave: (
      <>
        I en spørreundersøkelse blant <strong>400 tilfeldig valgte</strong> svarer{" "}
        <strong>92</strong> at de bruker tjenesten ukentlig. Regn ut <strong>feilmarginen</strong> i
        et 95 % konfidensintervall for andelen p i populasjonen.
      </>
    ),
    data: <>x = 92 · n = 400 · p̂ = 92/400 = 0,23 · nivå 95 %</>,
    metoder: [
      { id: "wald", label: "Wald-intervall for andel: z · √(p̂(1 − p̂)/n)" },
      {
        id: "t",
        label: "t-intervall med s/√n og df = 399",
        hvorforFeil:
          "For en andel finnes det ikke noe s å estimere — spredningen følger av p̂ selv, siden en binomisk variabel har varians p(1 − p). Det er ingen ekstra ukjent parameter, og derfor brukes z, ikke t. (Med df = 399 ville tallene nesten falt sammen uansett, men begrunnelsen er feil.)",
      },
      {
        id: "uten-rot",
        label: "z · p̂(1 − p̂)/n",
        hvorforFeil:
          "Du har glemt kvadratrota. p̂(1 − p̂)/n = 0,000443 er VARIANSEN til p̂; standardfeilen er kvadratrota av den, 0,02104. Uten rota får du en feilmargin på 0,00087 — et intervall som er femti ganger for smalt.",
      },
    ],
    riktigMetodeId: "wald",
    fasit: { verdi: 0.0412, toleranse: 0.0015, desimaler: 4 },
    svarEtikett: "Feilmargin (som andel) =",
    utregning: (
      <>
        <p>
          <strong>1. Estimatet:</strong> <span className="font-mono">p̂ = 92/400 = 0,23</span>
        </p>
        <p className="mt-1">
          <strong>2. Sjekk at normaltilnærmingen holder:</strong> np̂ = 92 og n(1 − p̂) = 308, begge
          godt over 10 ⇒ Wald er forsvarlig her.
        </p>
        <p className="mt-1">
          <strong>3. Standardfeilen:</strong>{" "}
          <span className="font-mono">SE = √(0,23 · 0,77 / 400) = √0,00044275 = 0,021042</span>
        </p>
        <p className="mt-1">
          <strong>4. Feilmargin:</strong>{" "}
          <span className="font-mono">1,96 · 0,021042 = 0,04124</span>, altså intervallet (0,189 ;
          0,271) — eller «23 % ± 4,1 prosentpoeng».
        </p>
        <p className="mt-2 text-muted-foreground">
          Dette er tallet mediene kaller «feilmarginen» i meningsmålinger. Merk sjekken i steg 2:
          Wald svikter når n er liten eller p̂ ligger nær 0 eller 1 — da kan intervallet til og med
          strekke seg utenfor [0, 1], noe en andel aldri kan. I de tilfellene brukes Wilson- eller
          Agresti-Coull-intervallet i stedet.
        </p>
      </>
    ),
  },
  {
    id: "m4-o5",
    tittel: "Stigningstallet i regresjonslinja",
    oppgave: (
      <>
        Fem studenter har rapportert hvor mange timer de jobber med øvingsoppgaver per uke (x), og
        hvor mange poeng de forbedret seg på prøven (y). Finn <strong>stigningstallet β̂₁</strong> i
        regresjonslinja ŷ = β̂₀ + β̂₁x.
      </>
    ),
    data: (
      <>
        x (timer): 1, 2, 3, 4, 5
        <br />
        y (poeng): 3, 5, 4, 8, 10
      </>
    ),
    metoder: [
      { id: "ols", label: "Minste kvadraters metode: β̂₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²" },
      {
        id: "snitt",
        label: "Del gjennomsnittene: ȳ/x̄ = 6/3",
        hvorforFeil:
          "Det gir 2,0 og er en tilfeldighet at det er i nærheten. ȳ/x̄ ignorerer helt hvordan punktene varierer sammen, og gir feil svar så snart linja ikke går gjennom origo. Her er β̂₀ = 0,9, altså krysser ikke linja i null.",
      },
      {
        id: "endepunkt",
        label: "Bruk første og siste punkt: (10 − 3)/(5 − 1)",
        hvorforFeil:
          "Det gir 1,75 og kaster bort de tre midterste observasjonene. Minste kvadraters metode bruker alle punktene og minimerer summen av kvadrerte avstander — det er nettopp derfor den er robust mot at ett enkelt punkt ligger litt skjevt.",
      },
    ],
    riktigMetodeId: "ols",
    fasit: { verdi: 1.7, toleranse: 0.03, desimaler: 2, enhet: "poeng per time" },
    svarEtikett: "β̂₁ =",
    utregning: (
      <>
        <p>
          <strong>1. Gjennomsnittene:</strong>{" "}
          <span className="font-mono">x̄ = 3, ȳ = 30/5 = 6</span>
        </p>
        <p className="mt-1">
          <strong>2. Avvikene fra snittet:</strong>
          <br />
          <span className="font-mono">(x − x̄): −2, −1, 0, 1, 2</span>
          <br />
          <span className="font-mono">(y − ȳ): −3, −1, −2, 2, 4</span>
        </p>
        <p className="mt-1">
          <strong>3. Teller:</strong>{" "}
          <span className="font-mono">
            Σ(x − x̄)(y − ȳ) = 6 + 1 + 0 + 2 + 8 = 17
          </span>
          <br />
          <strong>Nevner:</strong>{" "}
          <span className="font-mono">Σ(x − x̄)² = 4 + 1 + 0 + 1 + 4 = 10</span>
        </p>
        <p className="mt-1">
          <strong>4.</strong> <span className="font-mono">β̂₁ = 17/10 = 1,70</span>, og{" "}
          <span className="font-mono">β̂₀ = ȳ − β̂₁x̄ = 6 − 1,7 · 3 = 0,90</span>.
        </p>
        <p className="mt-2 text-muted-foreground">
          Les stigningstallet med enhet: <strong>1,7 poeng per ekstra øvingstime</strong>. Det er
          alltid slik β̂₁ skal tolkes — endring i y per enhets endring i x. Og legg merke til hva som
          ikke er sagt: at det å øve mer <em>fører til</em> bedre resultat. Dataene er observert, ikke
          eksperimentelle, og en tredje faktor (motivasjon, forkunnskaper) kan drive begge deler.
        </p>
      </>
    ),
  },
  {
    id: "m4-o6",
    tittel: "Hvor mye forklarer modellen?",
    oppgave: (
      <>
        For regresjonen i oppgave 5 er den totale kvadratsummen{" "}
        <strong>SS_tot = 34,0</strong> og restkvadratsummen <strong>SS_res = 5,1</strong>. Regn ut{" "}
        <strong>R²</strong>.
      </>
    ),
    data: <>SS_tot = 34,0 (total variasjon i y) · SS_res = 5,1 (det linja ikke fanget)</>,
    metoder: [
      { id: "riktig", label: "R² = 1 − SS_res/SS_tot" },
      {
        id: "forhold",
        label: "R² = SS_res/SS_tot",
        hvorforFeil:
          "Det gir 0,15, som er andelen modellen IKKE forklarer. R² skal være andelen den forklarer, så du må trekke forholdet fra 1. En rimelighetssjekk: en linje som passer godt skal gi høy R², ikke lav.",
      },
      {
        id: "r",
        label: "R² = r, korrelasjonskoeffisienten",
        hvorforFeil:
          "For enkel lineær regresjon er R² = r², ikke r. Her er r = 0,922 og R² = 0,850. Forskjellen er at r bærer fortegn (retningen på sammenhengen) mens R² alltid ligger mellom 0 og 1 og bare måler hvor mye som forklares.",
      },
    ],
    riktigMetodeId: "riktig",
    fasit: { verdi: 0.85, toleranse: 0.01, desimaler: 2 },
    svarEtikett: "R² =",
    utregning: (
      <>
        <p>
          <strong>1. Hva de to summene er.</strong> SS_tot = Σ(y − ȳ)² måler all variasjon i y, som
          om vi bare hadde brukt gjennomsnittet som prediksjon. SS_res = Σ(y − ŷ)² måler det som er
          igjen når linja har gjort sitt.
        </p>
        <p className="mt-1">
          <strong>2. Sett inn:</strong>{" "}
          <span className="font-mono">R² = 1 − 5,1/34,0 = 1 − 0,15 = 0,85</span>
        </p>
        <p className="mt-1">
          <strong>3. Kontroll:</strong> r = 0,922, og{" "}
          <span className="font-mono">r² = 0,922² = 0,850</span> ✓
        </p>
        <p className="mt-2 text-muted-foreground">
          Formuleringen som gir uttelling: «85 % av variasjonen i poengforbedring blir forklart av
          antall øvingstimer i denne modellen». Ikke «modellen er 85 % riktig», og ikke «øving
          forklarer 85 % av resultatet». R² sier hvor godt linja passer de dataene du har — den sier
          ingenting om årsak, om modellen er den rette formen, eller om den vil holde for nye data.
        </p>
      </>
    ),
  },
];

// ===========================================================================
// Type 4 — FEILSØKING. Seks ferdige resonnementer som ender galt.
//
// Dette er modulens tyngste del med vilje: i inferens er tolkningen selve
// eksamensstoffet. De seks dekker de klassiske feilslutningene.
// ===========================================================================

const FEILSOKING: Feilsoking[] = [
  {
    id: "m4-f1",
    tittel: "«p = 0,03, altså er det 97 % sjanse for at effekten er ekte»",
    feilnavn: "p-verdien lest som P(H₀ er sann)",
    situasjon: (
      <>
        En prosjektgruppe har testet om en ny prosess gir kortere gjennomløpstid, og skriver dette i
        rapporten. Konklusjonen er feil — hvor går det galt?
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Vi satte opp H₀: ingen forskjell i gjennomløpstid, og H₁: den nye prosessen er raskere.",
        vurdering:
          "Dette holder. H₀ er formulert som «ingenting skjer» og inneholder likhetstegnet, og H₁ peker i én retning — som er greit så lenge retningen ble bestemt før dataene ble sett.",
      },
      {
        id: "l2",
        tekst: "Testen ga p = 0,03, altså under signifikansnivået α = 0,05.",
        vurdering:
          "Dette holder også. Sammenligningen mellom p og det forhåndsvalgte α er akkurat den beslutningsregelen hypotesetesting bygger på.",
      },
      {
        id: "l3",
        tekst: "Vi forkaster derfor H₀ og konkluderer med at den nye prosessen er raskere.",
        vurdering:
          "Dette holder, med en liten reservasjon om formulering. Beslutningen om å forkaste er korrekt gitt p < α. At konklusjonen kan være feil — det er nettopp den type I-feilen α tallfester — gjør ikke selve slutningen ugyldig.",
      },
      {
        id: "l4",
        tekst: "Siden p = 0,03, er det bare 3 % sannsynlighet for at H₀ er sann, altså 97 % sjanse for at effekten er ekte.",
        vurdering:
          "Her er feilen. p-verdien er P(data minst så ekstreme | H₀ sann) — betingingen står PÅ H₀. Setningen påstår P(H₀ sann | data), som er den motsatte betingingen. Nøyaktig samme forveksling som medisintesten i modul 2, og som der kan de to tallene være vidt forskjellige. For å regne P(H₀ | data) måtte du oppgitt hvor sannsynlig H₀ var på forhånd, og det gjør ingen p-verdi.",
      },
      {
        id: "l5",
        tekst: "Vi anbefaler derfor å rulle ut prosessen i hele bedriften.",
        vurdering:
          "Arver overdrivelsen fra leddet over. Anbefalingen kan godt være riktig — men den bør begrunnes med effektens STØRRELSE og et konfidensintervall, ikke med et oppdiktet sikkerhetstall på 97 %.",
      },
    ],
    feilLeddId: "l4",
    riktigResonnement: (
      <>
        Skriv setningen med betingingen synlig:{" "}
        <strong>
          «Hvis den nye prosessen ikke hadde noen effekt, ville vi sett en forskjell minst så stor
          som vår i 3 % av gjentakelsene.»
        </strong>{" "}
        Det er alt p sier. Vil du uttale deg om hvor sannsynlig hypotesen er, trenger du en
        forhåndssannsynlighet og Bayes — og det ligger utenfor rammeverket her. Praktisk erstatning
        på eksamen: rapportér effektens størrelse med konfidensintervall, så sier du noe om{" "}
        <em>hvor mye</em> og <em>hvor sikkert</em>, ikke bare «ja/nei».
      </>
    ),
  },
  {
    id: "m4-f2",
    tittel: "«p = 0,32, altså har tiltaket ingen effekt»",
    feilnavn: "Fravær av bevis lest som bevis for fravær",
    situasjon: (
      <>
        En pilotstudie med 12 deltakere har testet et ergonomitiltak. Rapporten oppsummerer slik.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Vi målte 12 deltakere før og etter, og fant en gjennomsnittlig forbedring på 4,1 enheter.",
        vurdering:
          "Dette holder som observasjon. Merk at estimatet faktisk peker i den retningen tiltaket var ment å virke — det blir viktig lenger nede.",
      },
      {
        id: "l2",
        tekst: "Standardfeilen var stor, og t-testen ga p = 0,32.",
        vurdering:
          "Riktig gjengitt. Med n = 12 og stor spredning er en høy p-verdi helt forventet, uansett om det finnes en ekte effekt eller ikke.",
      },
      {
        id: "l3",
        tekst: "Siden p > 0,05 kan vi ikke forkaste H₀.",
        vurdering:
          "Dette holder. Det er en helt korrekt beskrivelse av beslutningen: vi har ikke sterkt nok grunnlag til å forkaste. Legg merke til hvor forsiktig det er formulert — og hvor mye som endres i neste ledd.",
      },
      {
        id: "l4",
        tekst: "Tiltaket har altså ingen effekt, og vi anbefaler at det ikke innføres.",
        vurdering:
          "Her er feilen. «Vi klarte ikke å påvise en effekt» og «det finnes ingen effekt» er to helt forskjellige påstander. Med n = 12 er styrken lav: sannsynligheten for å oppdage selv en reell, middels stor effekt kan være under 50 %. Konfidensintervallet vil her typisk strekke seg fra en tydelig negativ til en tydelig positiv effekt — altså er dataene forenlige med både stor nytte og stor skade. Det eneste dataene sier, er at studien var for liten til å skille.",
      },
      {
        id: "l5",
        tekst: "Vi ser ikke behov for videre undersøkelser.",
        vurdering:
          "Følger av feilen over, og er den dyreste konsekvensen: en lovende effekt legges bort fordi pilotstudien var underdimensjonert. Riktig respons på lav styrke er å regne ut hvor stor n som trengs, ikke å avslutte.",
      },
    ],
    feilLeddId: "l4",
    riktigResonnement: (
      <>
        Formuleringen som er sann:{" "}
        <strong>«Studien hadde ikke tilstrekkelig styrke til å påvise en effekt.»</strong> Sjekk
        alltid to ting før du tolker en ikke-signifikant test: (1) hvor bredt er
        konfidensintervallet — dekker det både store positive og store negative effekter? (2) hva var
        styrken for den effektstørrelsen som ville vært praktisk interessant? Er intervallet derimot{" "}
        <em>smalt</em> og sentrert nær null, har du faktisk grunnlag for å si at en eventuell effekt
        er liten. Det er forskjellen mellom «vi vet ikke» og «vi vet at det er lite».
      </>
    ),
  },
  {
    id: "m4-f3",
    tittel: "«Sterk korrelasjon, altså virker tiltaket»",
    feilnavn: "Korrelasjon lest som kausalitet",
    situasjon: (
      <>
        En analyse av registerdata skal vurdere om bedrifter som bruker et bestemt planleggingsverktøy
        leverer raskere.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Vi hentet inn data fra 240 bedrifter om verktøysbruk og gjennomsnittlig leveringstid.",
        vurdering:
          "Dette holder som premiss. Merk ett ord som blir avgjørende senere: dataene er HENTET INN, altså observert — ingen har blitt tildelt verktøyet av en forsker.",
      },
      {
        id: "l2",
        tekst: "Korrelasjonen mellom bruksgrad og leveringstid er r = −0,68.",
        vurdering:
          "Riktig regnet og riktig gjengitt: høyere bruksgrad henger sammen med lavere leveringstid. Fortegnet er negativt fordi de to beveger seg i motsatt retning.",
      },
      {
        id: "l3",
        tekst: "Sammenhengen er sterkt signifikant, med p < 0,001.",
        vurdering:
          "Dette holder også, men det er verdt å merke seg hva testen faktisk tester: at den observerte samvariasjonen ikke skyldes tilfeldighet. Den sier ingenting om hvorfor samvariasjonen er der.",
      },
      {
        id: "l4",
        tekst: "Verktøyet reduserer altså leveringstiden, og bør innføres hos de øvrige bedriftene.",
        vurdering:
          "Her er feilen. Fra samvariasjon i observerte data følger ikke årsak. Minst tre andre forklaringer passer like godt: (a) omvendt retning — bedrifter som allerede har korte leveringstider har overskudd til å ta i bruk nye verktøy, (b) en bakenforliggende faktor — god ledelse gir både verktøybruk og korte leveringstider, (c) seleksjon — bedrifter der verktøyet ikke fungerte, sluttet å bruke det og faller ut av «bruker»-gruppen.",
      },
      {
        id: "l5",
        tekst: "Vi anslår en besparelse på 12 % ved full utrulling.",
        vurdering:
          "Arver feilen, og gjør den dyrere ved å tallfeste den. Et anslag for effekten av et TILTAK krever at sammenhengen faktisk er kausal — ellers overføres ikke tallet til de bedriftene som ikke allerede hadde de egenskapene som drev sammenhengen.",
      },
    ],
    feilLeddId: "l4",
    riktigResonnement: (
      <>
        Skill de to påstandene eksplisitt:{" "}
        <strong>«bedrifter som bruker verktøyet har kortere leveringstid»</strong> (det viser dataene)
        mot <strong>«å ta i bruk verktøyet gjør leveringstiden kortere»</strong> (det viser de ikke).
        Kausale konklusjoner krever enten randomisering — at det er en tilfeldig mekanisme, ikke
        bedriftene selv, som avgjør hvem som får verktøyet — eller en eksplisitt modell for de
        bakenforliggende faktorene. Kontrollspørsmålet du kan stille deg hver gang:{" "}
        <em>hvem bestemte hvem som havnet i hvilken gruppe?</em> Var det forskeren ved loddtrekning,
        kan du snakke om årsak. Var det deltakerne selv, kan du det ikke.
      </>
    ),
  },
  {
    id: "m4-f4",
    tittel: "«Vi fant en signifikant sammenheng blant de 20 vi testet»",
    feilnavn: "Multiple sammenligninger uten korreksjon",
    situasjon: (
      <>
        En student har et datasett med mange variabler og leter etter sammenhenger å skrive om.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Datasettet inneholder 20 mulige forklaringsvariabler for produktkvalitet.",
        vurdering:
          "Dette holder — det er bare en beskrivelse av datasettet. Rike datasett er en fordel, ikke et problem, så lenge analysen tar høyde for hvor mange spørsmål som stilles.",
      },
      {
        id: "l2",
        tekst: "Jeg testet hver av dem mot kvalitetsmålet, med α = 0,05 for hver test.",
        vurdering:
          "Her er feilen. α = 0,05 gjelder PER TEST. Med 20 tester er sannsynligheten for minst ett falskt funn 1 − 0,95²⁰ = 0,64, altså 64 %. Nivået skulle vært justert før testene ble kjørt — for eksempel Bonferroni med α/20 = 0,0025 per test — eller analysen skulle vært deklarert som utforskende.",
      },
      {
        id: "l3",
        tekst: "Nitten av testene ga p over 0,05, mens én ga p = 0,03.",
        vurdering:
          "Dette er bare observasjonen, og den er nøyaktig som forventet under ren tilfeldighet: forventet antall falske funn er 20 · 0,05 = 1. Mønsteret «nitten stille, én som lyser» er selve signaturen på problemet, ikke et unntak fra det.",
      },
      {
        id: "l4",
        tekst: "Jeg rapporterer derfor den ene signifikante sammenhengen som hovedfunn.",
        vurdering:
          "Arver feilen, og forsterker den ved å skjule de nitten andre testene. Leseren som ser p = 0,03 alene, kan ikke vite at den ble plukket ut blant tjue. Det er selve utvelgelsen som gjør tallet villedende.",
      },
    ],
    feilLeddId: "l2",
    riktigResonnement: (
      <>
        Bestem antall tester og korreksjon <em>før</em> du ser resultatene. Enkleste korreksjon er
        Bonferroni: krev <span className="font-mono">p &lt; α/m</span> per test — her 0,0025 — som
        holder sannsynligheten for minst ett falskt funn nede rundt 5 %. Prisen er lavere styrke, så
        ekte, små effekter blir lettere oversett. Det legitime alternativet er å være ærlig om
        rollen: en utforskende analyse som <em>genererer</em> en hypotese, som deretter må testes på{" "}
        <strong>nye data</strong>. Det som aldri er greit, er å rapportere det ene funnet uten å
        nevne de nitten andre testene. Simulatoren i seksjonen om multiple sammenligninger over viser
        dette direkte — der finnes det ingen ekte effekt i det hele tatt, og likevel lyser det opp.
      </>
    ),
  },
  {
    id: "m4-f5",
    tittel: "«Det er 95 % sannsynlig at μ ligger mellom 49,9 og 54,9»",
    feilnavn: "Konfidensintervall tolket som en sannsynlighet for parameteren",
    situasjon: (
      <>
        Samme herdetidsdata som i måloppgavene (x̄ = 52,4, s = 6,1, n = 25). Rapporten oppsummerer
        slik.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Med x̄ = 52,4, s = 6,1 og n = 25 er standardfeilen 6,1/5 = 1,22.",
        vurdering:
          "Dette holder. Standardfeilen er spredningen til gjennomsnittet, og s/√n er riktig regnet.",
      },
      {
        id: "l2",
        tekst: "Med t₀,₀₂₅ = 2,064 for df = 24 blir feilmarginen 2,52, altså intervallet (49,88 ; 54,92).",
        vurdering:
          "Også riktig. Både valget av t-fordelingen, frihetsgradene og utregningen er som de skal være. Intervallet i seg selv er ikke problemet.",
      },
      {
        id: "l3",
        tekst: "Det er derfor 95 % sannsynlig at den sanne μ ligger mellom 49,88 og 54,92.",
        vurdering:
          "Her er feilen. μ er et fast, ukjent tall, og etter at dataene er samlet inn er også intervallets endepunkter faste. Sannsynligheten for at et fast tall ligger i et fast intervall er 0 eller 1 — vi vet bare ikke hvilken. De 95 % er en egenskap ved PROSEDYREN: gjentar du hele framgangsmåten på nye utvalg, vil 95 % av intervallene du lager inneholde μ.",
      },
      {
        id: "l4",
        tekst: "Vi kan derfor med 95 % sikkerhet utelukke at μ er under 49,88.",
        vurdering:
          "Arver feiltolkningen. Det gyldige utsagnet er en beslutning, ikke en sannsynlighet: verdier utenfor intervallet ville blitt forkastet av en tosidig test på 5 %-nivået. Det er en helt annen — og svakere — påstand enn «95 % sikkerhet».",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Formuleringen som er sann:{" "}
        <strong>
          «Metoden som produserte dette intervallet, treffer den sanne μ i 95 % av tilfellene ved
          gjentatt prøvetaking.»
        </strong>{" "}
        Tenk på det som en ringkasting: du kaster 100 ringer mot en pinne du ikke ser, og 95 av dem
        havner rundt pinnen. Om nettopp <em>denne</em> ringen traff, vet du ikke. Simulatoren med 100
        intervaller lenger oppe på siden tegner nøyaktig dette: samme metode, hundre utvalg, og de
        fem som bommer er markert. (Vil du faktisk ha en sannsynlighetsuttalelse om μ, finnes den —
        det heter et bayesiansk kredibilitetsintervall, krever en forhåndsfordeling, og er ikke det
        vi regner ut her.)
      </>
    ),
  },
  {
    id: "m4-f6",
    tittel: "«Ved 20 timer øving gir modellen 34,9 poeng»",
    feilnavn: "Ekstrapolering utenfor dataområdet",
    situasjon: (
      <>
        Regresjonen fra måloppgave 5: ŷ = 0,90 + 1,70x, der x er øvingstimer per uke og y er
        poengforbedring. Dataene dekker x fra 1 til 5 timer. En student trekker konklusjonen under.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Modellen ŷ = 0,90 + 1,70x er tilpasset med minste kvadraters metode.",
        vurdering:
          "Dette holder. Koeffisientene er riktig estimert fra de fem observasjonene, og metoden er den rette for en enkel lineær sammenheng.",
      },
      {
        id: "l2",
        tekst: "R² = 0,85, så modellen forklarer 85 % av variasjonen i poengforbedring.",
        vurdering:
          "Riktig regnet og riktig formulert — legg merke til at det står «variasjonen i poengforbedring», ikke «resultatet». Merk samtidig at R² måler tilpasning til DE DATAENE VI HAR, i området 1–5 timer. Den sier ingenting om hvordan modellen oppfører seg utenfor.",
      },
      {
        id: "l3",
        tekst: "Setter jeg inn x = 20 timer, gir modellen ŷ = 0,90 + 1,70 · 20 = 34,9 poeng.",
        vurdering:
          "Her er feilen. Regnestykket er riktig, men innsettingen er ikke lov. Dataene dekker bare x fra 1 til 5 timer, og x = 20 ligger fire ganger utenfor. Ingenting i datasettet sier at sammenhengen fortsatt er lineær der ute — og her vet vi til og med at den ikke kan være det: prøven har et maksimalt poengtall, så en linje som vokser uten stopp må bryte sammen et sted.",
      },
      {
        id: "l4",
        tekst: "Studenter bør derfor øve 20 timer i uka for å få 35 poeng ekstra.",
        vurdering:
          "Arver feilen, og legger til en kausal påstand på toppen (jf. feilsøkingsoppgave 3): dataene er observerte, ikke fra et forsøk der noen ble tildelt et antall øvingstimer. To feil i én setning.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        En regresjonsmodell er bare gyldig i det <strong>x-området dataene dekker</strong> — her 1 til
        5 timer. Utenfor har du ingen observasjoner som kan avsløre at kurven bøyer av, flater ut
        eller snur. Praktisk regel: skriv alltid ned min- og maks-verdien for x sammen med modellen,
        og nekt å sette inn verdier utenfor. Merk også at ekstrapolering ofte avslører seg selv med
        umulige svar — samme modell gir ŷ = 0,90 poeng ved x = 0 og negative verdier for negative x,
        som viser at det lineære uttrykket er en lokal tilnærming, ikke en naturlov. Residualplottene
        i seksjonen over er verktøyet som avslører når selv <em>innenfor</em> området er feil form.
      </>
    ),
  },
];

// ===========================================================================
// Type 5 — RECALL. Kun det som må sitte i hodet uten utledning.
// ===========================================================================

const RECALL: RecallKort[] = [
  {
    id: "m4-r1",
    kategori: "formel",
    sporsmal: "Skriv konfidensintervallet for μ når σ er ukjent.",
    svar: (
      <>
        <span className="font-mono">x̄ ± t(α/2, n − 1) · s/√n</span>. Er σ kjent, byttes t mot z og s
        mot σ. Med 95 % og stor n er z = 1,96.
      </>
    ),
    hvorforUtenat:
      "Grunnformen for alle intervaller i faget: estimat ± kritisk verdi · standardfeil. Alt annet er varianter av den.",
  },
  {
    id: "m4-r2",
    kategori: "formel",
    sporsmal: "Skriv testobservatoren for ett-utvalgs t-test, med frihetsgrader.",
    svar: (
      <>
        <span className="font-mono">t = (x̄ − μ₀) / (s/√n)</span>, med{" "}
        <span className="font-mono">df = n − 1</span>. Les den som «hvor mange standardfeil ligger
        estimatet fra det H₀ påstår».
      </>
    ),
    hvorforUtenat:
      "Frihetsgradene må oppgis for å kunne slå opp p-verdien, og de glemmes rutinemessig under tidspress.",
  },
  {
    id: "m4-r3",
    kategori: "formel",
    sporsmal: "Skriv standardfeilen og konfidensintervallet for en andel.",
    svar: (
      <>
        <span className="font-mono">SE = √(p̂(1 − p̂)/n)</span> og{" "}
        <span className="font-mono">p̂ ± z · SE</span>. Tommelfingerregel for at
        normaltilnærmingen holder: np̂ ≥ 10 og n(1 − p̂) ≥ 10.
      </>
    ),
    hvorforUtenat:
      "Kvadratrota glemmes ofte, og gyldighetsbetingelsen må sjekkes eksplisitt for å få full uttelling.",
  },
  {
    id: "m4-r4",
    kategori: "formel",
    sporsmal: "Skriv stigningstallet i minste kvadraters metode, og R².",
    svar: (
      <>
        <span className="font-mono">β̂₁ = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²</span>, og{" "}
        <span className="font-mono">β̂₀ = ȳ − β̂₁x̄</span>. Videre er{" "}
        <span className="font-mono">R² = 1 − SS_res/SS_tot</span>, som for enkel lineær regresjon er
        det samme som r².
      </>
    ),
    hvorforUtenat:
      "Regnes for hånd på eksamen, og at linja alltid går gjennom (x̄, ȳ) er en gratis kontroll.",
  },
  {
    id: "m4-r5",
    kategori: "definisjon",
    sporsmal: "Hva er α, β og styrke — og hvordan henger de sammen?",
    svar: (
      <>
        <strong>α</strong> = P(forkaste H₀ | H₀ sann), type I-feil. <strong>β</strong> = P(beholde H₀
        | H₀ falsk), type II-feil. <strong>Styrke</strong> = 1 − β. Senker du α, blir det vanskeligere
        å forkaste, og β stiger — med mindre du øker n.
      </>
    ),
    hvorforUtenat:
      "Symbolene forveksles konstant, og at α↓ gir β↑ ved fast n er en standard eksamensformulering.",
  },
  {
    id: "m4-r6",
    kategori: "når-brukes-hva",
    sporsmal: "z-test eller t-test?",
    svar: (
      <>
        <strong>z:</strong> når σ er kjent, eller når du tester en andel (der spredningen følger av
        p selv). <strong>t:</strong> når σ er ukjent og erstattet av s — som er det vanlige. Med stor
        n faller de sammen, men begrunnelsen må være riktig uansett.
      </>
    ),
    hvorforUtenat:
      "Metodevalget er halve poengsummen i tilstandssjekken, og kan ikke resonneres fram hvis regelen ikke sitter.",
  },
  {
    id: "m4-r7",
    kategori: "når-brukes-hva",
    sporsmal: "Hvordan endres bredden på et konfidensintervall?",
    svar: (
      <>
        Bredden er proporsjonal med <span className="font-mono">SE = s/√n</span> ganget med den
        kritiske verdien. <strong>Firedobler du n, halveres bredden.</strong> Øker du nivået fra 95 %
        til 99 %, blir intervallet bredere — mer sikkerhet koster presisjon.
      </>
    ),
    hvorforUtenat:
      "√n-forholdet er den vanligste «hva skjer hvis»-oppgaven, og skal kunne besvares uten utregning.",
  },
  {
    id: "m4-r8",
    kategori: "felle",
    sporsmal: "Hva betyr p = 0,03 — presist?",
    svar: (
      <>
        At <em>hvis H₀ er sann</em>, ville vi sett data minst så ekstreme som våre i 3 % av
        gjentakelsene. Det er <span className="font-mono">P(data | H₀)</span>. Det er <em>ikke</em>{" "}
        P(H₀ er sann), og heller ikke sannsynligheten for at funnet er en tilfeldighet.
      </>
    ),
    hvorforUtenat:
      "Den hyppigst siterte feiltolkningen i hele faget; formuleringen må sitte ordrett for å unngå å skli ut i besvarelsen.",
  },
  {
    id: "m4-r9",
    kategori: "felle",
    sporsmal: "Hva betyr «95 %» i et 95 % konfidensintervall?",
    svar: (
      <>
        At <strong>metoden</strong> treffer den sanne parameteren i 95 % av tilfellene ved gjentatt
        prøvetaking. Det ferdige intervallet ditt inneholder enten μ eller ikke — sannsynligheten der
        er 0 eller 1.
      </>
    ),
    hvorforUtenat:
      "Formuleringen som skiller en riktig fra en gal besvarelse, og den er lett å skli på under tidspress.",
  },
  {
    id: "m4-r10",
    kategori: "felle",
    sporsmal: "Tre ting du aldri kan slutte fra en regresjonsmodell.",
    svar: (
      <>
        <strong>1.</strong> At x forårsaker y — ikke uten randomisering. <strong>2.</strong> At
        modellen gjelder utenfor x-området dataene dekker (ekstrapolering).{" "}
        <strong>3.</strong> At høy R² betyr riktig modellform — sjekk residualplottet, en tydelig
        kurve der avslører at en rett linje er feil.
      </>
    ),
    hvorforUtenat:
      "Tre separate feller som alle gir trekk, og som er lettest å unngå ved å ha lista i hodet før man skriver konklusjonen.",
  },
];

export function Modul4InferensPage() {
  return (
    <StackPageShell title="TEK-1501 Modul 4 — Inferens og regresjon" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            TEK-1501 · Modul 4 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Inferens — å si noe om det du ikke har målt
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Modul 3 gikk fra en modell til sannsynligheter. Denne modulen går motsatt vei: du har{" "}
            <em>ett</em> utvalg, og skal si noe om populasjonen det kom fra — med et ærlig mål på hvor
            usikkert det er. Regnestykkene er korte. Det som skiller besvarelsene på eksamen er om du
            klarer å si noe <em>sant</em> om hva tallene betyr, og det er langt vanskeligere enn å
            regne dem ut.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-foreground">Slik er modulen bygget:</strong> du <em>anslår</em>{" "}
            først, uten hjelp. Så <em>ser</em> du hva som skjer i simulatorene. Så <em>regner</em> du
            selv, med sjekk på både metodevalg og tall. Til slutt <em>feilsøker</em> du ferdige
            resonnementer som er gale — og den delen er tyngre her enn i noen annen modul, fordi
            feiltolkningene <em>er</em> eksamensstoffet.
          </div>
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Forutsetter modul 1–3.</strong> Fra modul 1: utvalg
            mot populasjon, og s regnet med n − 1. Fra modul 2: betinget sannsynlighet — særlig at
            P(A | B) og P(B | A) er forskjellige, som er hele nøkkelen til å tolke p-verdien riktig.
            Fra modul 3: standardisering og at gjennomsnittet har spredning σ/√n.
          </div>
          <ProvisoriskKapittelnote className="mt-3" modul="4" />
        </header>

        <CourseOutline courseId="tek1-modul4-inferens" steps={STEPS} />

        <div className="mt-10" />
        <Symboltavle id="symboler" symboler={SYMBOLER} />

        {/* --- Type 1: anslå-så-sjekk, FØR forklaringen -------------------- */}
        <AnslaSaSjekk
          id="anslag"
          anslag={ANSLAG}
          intro={
            <>
              Gjett før du leser videre. Spørsmålene under er ikke regneoppgaver — de handler om hva
              tallene <em>betyr</em>, og det er nettopp der de fleste bommer. Flere av dem er
              feiltolkninger som fortsatt står på trykk i publiserte rapporter. Ingenting telles, og
              et bom her er mer verdt enn en riktig gjetning.
            </>
          }
        />

        {/* --- Forklaring + type 2: guidede simuleringer ------------------- */}
        <section id="estimering" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Crosshair className="h-5 w-5 text-brand" /> Estimator, estimat og standardfeil
          </h2>
          <p className="leading-relaxed">
            En <strong>estimator</strong> er en oppskrift — for eksempel «legg sammen målingene og
            del på n». Den er en stokastisk variabel, fordi den gir et nytt tall for hvert utvalg. Et{" "}
            <strong>estimat</strong> er det ene tallet du faktisk fikk. Skillet virker pedantisk til
            du innser at hele modulen handler om estimatorens fordeling, ikke om ditt ene tall.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Standardfeilen</strong> SE er standardavviket til estimatoren: hvor mye tallet
            ditt ville sprikt hvis du gjentok hele undersøkelsen. For et gjennomsnitt er{" "}
            <span className="font-mono">SE = s/√n</span>. Legg merke til at dette er σ/√n fra modul 3,
            med s satt inn fordi σ er ukjent — og det er nettopp den erstatningen som gjør at vi må
            bruke t-fordelingen i stedet for z.
          </p>
          <div className="mt-3 rounded-lg border border-brand/25 bg-brand/5 p-4 text-sm">
            <strong className="text-foreground">Hele modulen på to linjer:</strong>
            <div className="mt-1 font-mono text-foreground">estimat ± kritisk verdi · SE</div>
            <div className="font-mono text-foreground">
              (estimat − H₀-verdi) / SE
            </div>
            <div className="mt-1 text-muted-foreground">
              Den første linja lager konfidensintervaller, den andre lager testobservatorer. Alt som
              kommer — gjennomsnitt, andeler, differanser, stigningstall — er den samme strukturen med
              nye estimater og nye standardfeil.
            </div>
          </div>
        </section>

        <section id="ki" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Scale className="h-5 w-5 text-brand" /> Konfidensintervall
          </h2>
          <p className="leading-relaxed">
            Et punktestimat alene er nesten verdiløst, fordi det ikke sier hvor mye det kunne ha
            bommet. Konfidensintervallet legger til den informasjonen:{" "}
            <span className="font-mono">x̄ ± t(α/2, n − 1) · s/√n</span>. Den kritiske verdien
            bestemmes av hvor sikker du vil være, standardfeilen av dataene og av n.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Så til det som faktisk telles på eksamen: <strong>hva «95 %» viser til</strong>. Det er en
            egenskap ved metoden, ikke ved ditt intervall. Simulatoren under trekker hundre utvalg fra
            den samme populasjonen og tegner hundre intervaller. Den sanne μ er en loddrett strek, og
            de intervallene som bommer er markert. Tell dem: det er cirka fem. Det er <em>det</em> de
            95 prosentene betyr — og du kan ikke se på ett enkelt intervall om det er blant de fem.
          </p>
          <ConfidenceIntervalVisualizer />
        </section>

        <section id="hypoteser" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Hypotesestrukturen — H₀, H₁ og α</h2>
          <p className="leading-relaxed">
            En hypotesetest er en bevisbyrde-ordning. <strong>H₀</strong> er «det skjer ingenting», og
            den får stå til noe annet er vist. <strong>H₁</strong> er det du mistenker. Så spør du:{" "}
            <em>hvor rart ville dette datasettet vært hvis H₀ var sann?</em> Er svaret «rart nok»,
            forkaster du.
          </p>
          <p className="mt-2 leading-relaxed">
            «Rart nok» må bestemmes <strong>før</strong> du ser dataene, og det er det α gjør. α = 0,05
            betyr at du godtar å forkaste en sann H₀ i 5 % av tilfellene. Det er et valg om
            risikoappetitt, ikke en oppdagelse.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-foreground">Fire formuleringer som er verdt å pugge:</strong>
            <ul className="mt-2 space-y-1 pl-5">
              <li className="list-disc">
                Vi <strong>forkaster</strong> H₀ — ikke «beviser H₁».
              </li>
              <li className="list-disc">
                Vi <strong>beholder</strong> H₀ — ikke «beviser at H₀ er sann».
              </li>
              <li className="list-disc">
                «Ikke signifikant» betyr <strong>ikke påvist</strong>, ikke «ingen effekt».
              </li>
              <li className="list-disc">
                Retningen i H₁ (ensidig eller tosidig) bestemmes <strong>før</strong> dataene ses.
              </li>
            </ul>
          </div>
        </section>

        <section id="pverdi" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Testobservator og p-verdi</h2>
          <p className="leading-relaxed">
            <strong>Testobservatoren</strong> er en standardisert avstand:{" "}
            <span className="font-mono">(estimat − H₀-verdi) / SE</span>. Den svarer på «hvor mange
            standardfeil unna det H₀ påstår ligger vi?». <strong>p-verdien</strong> oversetter den
            avstanden til en sannsynlighet: hvor stor andel av utfallene under H₀ er minst så ekstreme
            som vårt.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Merk betingingsretningen nøye, for det er den hele modulen står og faller på:{" "}
            <span className="font-mono">p = P(data minst så ekstreme | H₀ sann)</span>. Det er{" "}
            <em>ikke</em> P(H₀ sann | data). Kalkulatoren under lar deg skrive inn en testobservator og
            se halearealet skraveres — kjør den med samme z i ensidig og tosidig variant, og se at
            tallet dobles.
          </p>
          <PValueCalculator />
          <p className="mt-6 mb-4 leading-relaxed">
            Neste simulator er den som virkelig fester hva en p-verdi er. Sett effektstørrelsen til{" "}
            <strong>null</strong> — altså ingen ekte forskjell — og se på histogrammet av p-verdier
            fra 1500 eksperimenter: det blir <em>flatt</em>. Under en sann H₀ er alle p-verdier like
            sannsynlige, og 5 % av dem havner under 0,05 helt av seg selv. Skru så opp effekten og se
            fordelingen skyve seg mot venstre; andelen under 0,05 er da nettopp styrken.
          </p>
          <PValueDistributionSim />
          <p className="mt-6 mb-4 leading-relaxed">
            Til slutt en test i sin helhet: to grupper, justerbar forskjell, spredning og
            gruppestørrelse. Legg merke til at du kan gjøre p-verdien liten på to helt ulike måter —
            ved å øke den ekte forskjellen, eller bare ved å øke n. Det er derfor «signifikant» aldri
            er det samme som «viktig».
          </p>
          <TtestVisualizer />
        </section>

        <section id="feiltyper" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <GitCompare className="h-5 w-5 text-brand" /> Type I, type II og styrke
          </h2>
          <p className="leading-relaxed">
            En test kan bomme på to måter. <strong>Type I</strong>: forkaste en H₀ som var sann — en
            falsk alarm, med sannsynlighet α. <strong>Type II</strong>: beholde en H₀ som var falsk —
            en oversett effekt, med sannsynlighet β. <strong>Styrken</strong> 1 − β er sannsynligheten
            for å oppdage en effekt som virkelig finnes.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            De to henger sammen på en måte du bør se, ikke lese. Dra den kritiske grensen i figuren
            under: flytter du den for å krympe α, vokser β automatisk. Den eneste måten å redusere
            begge samtidig, er å gjøre kurvene smalere — altså å øke n. Prøv det med slideren, og se
            de to skraverte områdene krympe sammen.
          </p>
          <Type1Type2ErrorAreas />
          <p className="mt-6 mb-4 leading-relaxed">
            Styrkekurven under viser den praktiske konsekvensen: hvor stor effekt du i det hele tatt
            har sjanse til å oppdage, gitt n. Med n = 10 må effekten være svært stor før du oppdager
            den mer enn halvparten av gangene. Det er dette som gjør at en ikke-signifikant liten
            studie sjelden betyr «ingen effekt» — den betyr som regel bare «for lite data».
          </p>
          <PowerCurve />
        </section>

        <section id="multippel" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Når du tester mange ting samtidig</h2>
          <p className="leading-relaxed">
            α = 0,05 er en garanti <em>per test</em>. Kjører du m uavhengige tester der alle
            nullhypotesene er sanne, er sannsynligheten for minst ett falskt funn{" "}
            <span className="font-mono">1 − (1 − α)^m</span> — komplementregelen fra modul 2, brukt på
            nytt. Med m = 20 gir det 64 %.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Simulatoren under kjører nettopp det scenariet: mange tester, ingen ekte effekt noe sted.
            Alt som lyser rødt er falskt. Skru opp antall tester og se hvor fort det blir uunngåelig —
            og skru så på Bonferroni-korreksjonen for å se prisen: grensen blir så streng at ekte,
            små effekter også forsvinner.
          </p>
          <MultippelTestingSim />
        </section>

        <section id="velge" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Å velge riktig test</h2>
          <p className="mb-3 leading-relaxed">
            Tre spørsmål avgjør nesten alle testvalg på eksamen:
          </p>
          <ol className="mb-4 space-y-2 pl-5 text-sm leading-relaxed">
            <li className="list-decimal">
              <strong>Hva slags svar er utfallet?</strong> Et gjennomsnitt ⇒ t-test. En andel ⇒
              z-test for proporsjon. Antall i kategorier ⇒ kji-kvadrat.
            </li>
            <li className="list-decimal">
              <strong>Hvor mange grupper?</strong> Én ⇒ ett-utvalgstest. To ⇒ to-utvalgstest (paret
              hvis det er samme enheter målt to ganger). Tre eller flere ⇒ ANOVA, ikke mange
              t-tester.
            </li>
            <li className="list-decimal">
              <strong>Er σ kjent?</strong> Ja ⇒ z. Nei ⇒ t. Nesten alltid nei.
            </li>
          </ol>
          <p className="mb-4 leading-relaxed">
            Quizen under gir åtte scenarier, og spør om to ting for hvert: hvilken test, og hva
            p-verdien betyr i akkurat den sammenhengen. Det andre spørsmålet er det viktigste — det
            er der eksamensbesvarelser vinnes og tapes.
          </p>
          <InferenceMatchQuiz />
        </section>

        <section id="andeler" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Percent className="h-5 w-5 text-brand" /> Når svaret er en andel
          </h2>
          <p className="leading-relaxed">
            Er utfallet ja/nei, er estimatet <span className="font-mono">p̂ = x/n</span>. Standardfeilen
            følger direkte av den binomiske variansen fra modul 3:{" "}
            <span className="font-mono">SE = √(p̂(1 − p̂)/n)</span>. Det er ingen ekstra ukjent
            spredningsparameter å estimere — derfor brukes z og ikke t.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Normaltilnærmingen krever at du har nok av begge utfall:{" "}
            <strong>np̂ ≥ 10 og n(1 − p̂) ≥ 10</strong>. Er den ikke oppfylt, kan Wald-intervallet gi
            grenser utenfor [0, 1] — noe en andel aldri kan ha. Sammenligneren under viser Wald,
            Wilson og Clopper-Pearson side om side; sett n lavt og p̂ nær null, og se Wald bryte
            sammen mens de andre holder seg innenfor.
          </p>
          <ProportionCiVisualizer />
          <p className="mt-6 mb-4 leading-relaxed">
            Kalkulatoren under regner intervall og test for en enkelt andel, med gyldighetssjekken
            innebygd.
          </p>
          <ProporsjonsCalculator />
        </section>

        <section id="regresjon" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <TrendingUp className="h-5 w-5 text-brand" /> Korrelasjon og regresjon
          </h2>
          <p className="leading-relaxed">
            <strong>Korrelasjonen r</strong> er ett tall mellom −1 og 1 for hvor godt en rett linje
            beskriver to variabler. <strong>Regresjonen</strong> går et skritt lenger og oppgir
            linja: <span className="font-mono">ŷ = β̂₀ + β̂₁x</span>, valgt slik at summen av
            kvadrerte avstander fra punktene til linja blir minst mulig.
          </p>
          <p className="mt-2 leading-relaxed">
            Stigningstallet β̂₁ leses alltid med enhet: <em>endring i y per enhets endring i x</em>.{" "}
            <span className="font-mono">R² = 1 − SS_res/SS_tot</span> sier hvor stor andel av
            variasjonen i y linja fanger; for enkel lineær regresjon er det nøyaktig r². Og testen{" "}
            <span className="font-mono">t = β̂₁/SE(β̂₁)</span> avgjør om stigningen er større enn det
            tilfeldigheter alene ville gitt.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-foreground">De tre grensene for hva en regresjon kan si:</strong>{" "}
            den sier ikke at x <em>forårsaker</em> y (det krever randomisering); den gjelder ikke
            utenfor x-området dataene dekker (ekstrapolering); og en høy R² sier ikke at
            modellformen er riktig — bare at en linje passer disse punktene. Alle tre kommer igjen
            som feilsøkingsoppgaver nederst.
          </div>
        </section>

        <section id="residualer" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Residualanalyse — fikk modellen lov?</h2>
          <p className="leading-relaxed">
            <strong>Residualene</strong> er det linja bommet med: <span className="font-mono">y − ŷ</span>{" "}
            for hvert punkt. Plottet av dem mot x er den beste enkeltdiagnosen som finnes, fordi den
            fjerner den sterke trenden og forstørrer alt som er igjen. Er antakelsene oppfylt, skal
            plottet se ut som ren støy uten mønster.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Tre mønstre du må kunne kjenne igjen: en <strong>tydelig kurve</strong> betyr at
            sammenhengen ikke er lineær; en <strong>vifteform</strong> betyr at spredningen vokser med
            x, slik at standardfeilene ikke er til å stole på; og et{" "}
            <strong>enkelt punkt langt ute</strong> kan dra hele linja etter seg. Bytt mellom
            scenariene under og se hvordan et pent scatterplott kan skjule alle tre.
          </p>
          <RegresjonDiagnostikk />
          <p className="mt-6 mb-4 leading-relaxed">
            Q-Q-plottet under sjekker den siste antakelsen: at residualene er tilnærmet
            normalfordelte. Ligger punktene på diagonalen, er antakelsen grei. Bøyer de av i endene,
            har fordelingen tyngre eller lettere haler enn normalfordelingen. Dra i punktene og se
            hvordan én outlier gir seg til kjenne.
          </p>
          <QqPlotInteractive />
        </section>

        {/* --- Type 3: måloppgaver med tilstandssjekk ---------------------- */}
        <Maloppgaver
          id="maloppgaver"
          oppgaver={MALOPPGAVER}
          intro={
            <>
              Her sjekkes to ting hver for seg:{" "}
              <strong className="text-foreground">hvilken metode</strong> du mener gjelder, og{" "}
              <strong className="text-foreground">tallet</strong> du lander på. De tre første
              oppgavene bruker samme datasett med vilje — intervall, testobservator og p-verdi er tre
              måter å si det samme på, og det er verdt å se dem møtes.
            </>
          }
        />

        {/* --- Type 4: feilsøking ------------------------------------------ */}
        <Feilsokingsoppgaver
          id="feilsoking"
          oppgaver={FEILSOKING}
          intro={
            <>
              Dette er modulens viktigste del. I inferens er regnestykkene korte og mekaniske; det
              som gir og koster poeng er hva du sier at tallet betyr. De seks resonnementene under er
              de klassiske feiltolkningene, og alle seks finnes i publiserte rapporter. Klikk på det{" "}
              <strong className="text-foreground">første</strong> leddet som ikke holder — og legg
              merke til at flere av dem har helt korrekte regnestykker helt fram til tolkningen.
            </>
          }
        />

        {/* --- Type 5: recall ---------------------------------------------- */}
        <RecallKortSeksjon id="recall" kort={RECALL} />

        {/* --- Go-deep-laget, PLAN-HOST26-MODULER.md §3.3 ------------------ */}
        <section id="dypere" className="mb-12 scroll-mt-28">
          <div className="rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-500/5 p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h2 className="text-xl font-semibold">Dypere enn pensum</h2>
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                Ikke eksamensstoff
              </span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Alt over dette punktet er det du trenger til 14. desember. Bootstrap er ikke pensum,
              men det er den korteste veien til å <em>tro</em> på konfidensintervallet. I stedet for
              å slå opp en t-verdi, trekker du nye utvalg fra dataene du allerede har — med
              tilbakelegging, akkurat som urnen i modul 2 — og ser fordelingen til estimatet bygge
              seg opp foran deg. Persentilene i den fordelingen <em>er</em> intervallet. Ingen
              formel, ingen antakelse om normalfordeling. Tjue minutter her gjør resten av modul 4
              mindre magisk.
            </p>
            <BootstrapResamplingSim />
          </div>
        </section>

        {/* --- Videre ------------------------------------------------------ */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">Videre herfra</h2>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Dette var siste modul. Herfra går veien til utdypningene — særlig ANOVA og
            kji-kvadrat-testene, som er de to testene modulen nevner, men ikke regner på i detalj.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-anova" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 font-medium text-brand hover:bg-brand/20"
            >
              Utdypning: ettveis ANOVA (tre eller flere grupper)
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-proporsjoner" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypning: andeler og kji-kvadrat
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-statistisk-analyse" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Hele kjeden fra data til konklusjon
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-modul3-fordelinger" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Tilbake til modul 3
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
