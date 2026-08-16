import { Link } from "@tanstack/react-router";
import { ArrowRight, Activity, BarChart4, Bell, Layers, Sigma, Sparkles } from "lucide-react";
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

// Gjenbrukte simulatorer fra de eksisterende temasidene. Modulen redigerer dem
// ikke — den setter dem inn i riktig rekkefølge i forhold til anslagene.
import { DistributionExplorer } from "@/components/stack/tek1-fordelinger/DistributionExplorer";
import { DistributionMatcher } from "@/components/stack/tek1-fordelinger/DistributionMatcher";
import { CltDemonstrator } from "@/components/stack/tek1-fordelinger/CltDemonstrator";
import { FordelingerVisualizer } from "@/components/stack/tek1-kontinuerlige-fordelinger/FordelingerVisualizer";
import { GaltonBrett } from "@/components/stack/tek1-forventning-clt/GaltonBrett";
import { StandardfeilBygger } from "@/components/stack/tek1-forventning-clt/StandardfeilBygger";
import { DistributionPlotter } from "@/components/stack/tek1-distribusjons-plotter/DistributionPlotter";

// ---------------------------------------------------------------------------
// TEK-1501 Modul 3 — Stokastiske variabler og fordelinger.
// Spor C i plan-tek-1501.md, atomene C1–C13.
//
// Samme arkitektur som modul 1 og 2 (PLAN-HOST26-MODULER.md §3):
// anslå-så-sjekk FØR forklaringen → guidede simuleringer UNDER →
// måloppgaver med tilstandssjekk ETTER → feilsøking SIST → recall til slutt.
//
// Modulens ene idé: slutt å liste opp enkeltutfall, og bytt dem ut med en
// FUNKSJON som gir sannsynlighet til hver verdi. Da kan hele situasjoner
// beskrives med to–tre tall (parameterne), og de samme regnestykkene gjenbrukes
// på tvers av helt ulike problemer.
//
// Alle fasitene i måloppgavene er regnet ut med src/lib/tek1501/fordelinger.ts,
// ikke skrevet inn for hånd (§3.1).
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Symbolene først", anchor: "symboler" },
  { title: "Anslå — før du leser", anchor: "anslag" },
  { title: "Stokastisk variabel", anchor: "variabel" },
  { title: "Diskret: PMF og CDF", anchor: "diskret" },
  { title: "Kontinuerlig: tetthet (interaktiv)", anchor: "kontinuerlig" },
  { title: "Forventning og varians", anchor: "forventning" },
  { title: "Binomisk og Poisson (interaktiv)", anchor: "binomisk" },
  { title: "Normalfordelingen og z (interaktiv)", anchor: "normal" },
  { title: "Sentralgrenseteoremet (interaktiv)", anchor: "clt" },
  { title: "Velge riktig fordeling", anchor: "velge" },
  { title: "Måloppgaver", anchor: "maloppgaver" },
  { title: "Feilsøking", anchor: "feilsoking" },
  { title: "Recall-kort", anchor: "recall" },
  { title: "Dypere enn pensum", anchor: "dypere" },
];

// ===========================================================================
// Symboltavle — progressiv scaffolding. Ingen av disse brukes før de står her.
// ===========================================================================

const SYMBOLER: SymbolRad[] = [
  {
    tegn: "μ",
    uttale: "my",
    verden: "populasjon",
    kjentFraFor: "modul 1",
    betydning: (
      <>
        Populasjonsgjennomsnittet — det sanne, ukjente snittet. I denne modulen får det en ny og
        skarpere betydning: det er <em>forventningsverdien</em> til fordelingen.
      </>
    ),
  },
  {
    tegn: "σ",
    uttale: "sigma (liten)",
    verden: "populasjon",
    kjentFraFor: "modul 1",
    betydning: (
      <>
        Populasjonsstandardavviket. <span className="font-mono">σ²</span> er variansen — samme tall
        kvadrert, og det er varianser man kan legge sammen, ikke standardavvik.
      </>
    ),
  },
  {
    tegn: "X",
    uttale: "stor X",
    verden: "generelt",
    betydning: (
      <>
        <strong>Den stokastiske variabelen</strong> — regelen som gjør et utfall om til et tall.
        Stor bokstav betyr «ikke bestemt ennå»: X er selve mekanismen, ikke et måleresultat.
      </>
    ),
  },
  {
    tegn: "x",
    uttale: "liten x",
    verden: "generelt",
    betydning: (
      <>
        En <strong>konkret verdi</strong> X kan ta. Derfor skrives spørsmål som «P(X = x)»: hva er
        sannsynligheten for at mekanismen lander på nettopp dette tallet?
      </>
    ),
  },
  {
    tegn: "f(x)",
    uttale: "eff av x",
    verden: "generelt",
    betydning: (
      <>
        <strong>Punktsannsynlighet</strong> når X er diskret: f(x) = P(X = x), og alle f-verdiene
        summerer til 1. Når X er kontinuerlig heter f(x) <strong>tetthet</strong> og er noe annet —
        se neste rad.
      </>
    ),
  },
  {
    tegn: "F(x)",
    uttale: "stor eff av x",
    verden: "generelt",
    betydning: (
      <>
        <strong>Den kumulative fordelingen</strong>: F(x) = P(X ≤ x). Den vokser fra 0 til 1 og går
        aldri nedover. Nesten alle oppgaver kan skrives om til to F-oppslag, fordi P(a &lt; X ≤ b) =
        F(b) − F(a).
      </>
    ),
  },
  {
    tegn: "E[X]",
    uttale: "e av x, «forventningen til X»",
    verden: "populasjon",
    betydning: (
      <>
        <strong>Forventningsverdien</strong> — tyngdepunktet i fordelingen, og snittet du nærmer deg
        hvis du gjentar forsøket uendelig mange ganger. Skrives også μ. Merk at E[X] ikke trenger å
        være en mulig verdi: forventningen til et terningkast er 3,5.
      </>
    ),
  },
  {
    tegn: "Var(X)",
    uttale: "varians av X",
    verden: "populasjon",
    betydning: (
      <>
        <strong>Variansen</strong>: E[(X − μ)²], altså middelverdien av kvadrerte avvik fra
        forventningen. Regnesnarveien er{" "}
        <span className="font-mono">Var(X) = E[X²] − (E[X])²</span>.
      </>
    ),
  },
  {
    tegn: "n, p",
    uttale: "en, pe",
    verden: "generelt",
    betydning: (
      <>
        Parameterne i den <strong>binomiske</strong> fordelingen: n uavhengige forsøk, hvert med
        suksesssannsynlighet p. Advarsel som blir viktig i modul 4: bokstaven p gjenbrukes der om
        noe helt annet (p-verdien).
      </>
    ),
  },
  {
    tegn: "λ",
    uttale: "lambda",
    verden: "generelt",
    betydning: (
      <>
        Parameteren i <strong>Poisson</strong>-fordelingen: forventet antall hendelser i det
        intervallet du ser på. Skifter du intervall, skalerer λ med: 3 per time gir λ = 1,5 per
        halvtime.
      </>
    ),
  },
  {
    tegn: "N(μ, σ²)",
    uttale: "en av my, sigma i andre",
    verden: "populasjon",
    betydning: (
      <>
        <strong>Normalfordelingen</strong> med forventning μ og varians σ². Merk at det er{" "}
        <em>variansen</em> som står i parentesen, ikke standardavviket — en klassisk kilde til
        faktor-feil.
      </>
    ),
  },
  {
    tegn: "Z",
    uttale: "zett",
    verden: "generelt",
    betydning: (
      <>
        <strong>Standardnormalen</strong>: Z ~ N(0, 1). Enhver normalfordelt X gjøres om til Z ved{" "}
        <span className="font-mono">Z = (X − μ)/σ</span>. Z teller hvor mange standardavvik du er
        fra forventningen, og er derfor enhetsløs.
      </>
    ),
  },
  {
    tegn: "X̄",
    uttale: "x-strek",
    verden: "utvalg",
    kjentFraFor: "modul 1",
    betydning: (
      <>
        Gjennomsnittet av n observasjoner. Her får det en ny rolle: X̄ er selv en stokastisk
        variabel, med sin egen fordeling. Hele modul 4 hviler på det skiftet.
      </>
    ),
  },
];

// ===========================================================================
// Type 1 — ANSLÅ-SÅ-SJEKK. Seks stykker, alle før forklaringen.
// ===========================================================================

const ANSLAG: Anslag[] = [
  {
    id: "m3-a1",
    tema: "Binomisk — det «forventede» utfallet",
    sporsmal: (
      <>
        Du kaster en ærlig mynt <strong>ti ganger</strong>. Forventet antall kron er 5. Hvor
        sannsynlig er det at du faktisk får <strong>nøyaktig 5</strong> kron?
      </>
    ),
    alternativer: [
      { id: "a", label: "Rundt 50 % — det er jo det forventede utfallet" },
      { id: "b", label: "Rundt 35 %" },
      { id: "c", label: "Rundt 25 %" },
      { id: "d", label: "Rundt 10 %" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>24,6 %.</strong> Regnestykket er 10C5 · 0,5⁵ · 0,5⁵ = 252/1024. Det mest sannsynlige
        enkeltutfallet er altså langt fra å være sannsynlig — det er bare mer sannsynlig enn hvert av
        de ti andre.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi blander sammen <em>forventningen</em> (et tyngdepunkt) med <em>det som skjer</em> (én av
        elleve mulige verdier). Forventningen forteller hvor fordelingen balanserer, ikke hvor mye
        sannsynlighet som ligger i akkurat det punktet. Jo flere mulige utfall, desto mindre får hver
        av dem — også toppen.
      </>
    ),
  },
  {
    id: "m3-a2",
    tema: "Tetthet er ikke sannsynlighet",
    sporsmal: (
      <>
        For en kontinuerlig fordeling tegner vi en kurve f(x). Kan kurven ha en{" "}
        <strong>høyde over 1</strong>?
      </>
    ),
    alternativer: [
      { id: "a", label: "Nei — ingen sannsynlighet kan være over 1" },
      { id: "b", label: "Ja, uten videre — høyden er ikke en sannsynlighet" },
      { id: "c", label: "Bare for diskrete fordelinger" },
      { id: "d", label: "Bare hvis fordelingen er skjev" },
    ],
    riktigId: "b",
    fasit: (
      <>
        <strong>Ja.</strong> Det som må være 1 er <em>arealet</em> under hele kurven, ikke høyden. En
        normalfordeling med standardavvik 0,25 har topphøyde omtrent 1,60. Kurven er en{" "}
        <em>tetthet</em>: sannsynlighet per enhet av x. Gjør du x-aksen smalere, må kurven bli
        høyere for at arealet fortsatt skal bli 1.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        For diskrete fordelinger <em>er</em> stolpehøyden en sannsynlighet, og vi drar den vanen med
        oss. Konsekvensen er verdt å merke seg: for en kontinuerlig X er P(X = 3) nøyaktig 0. Bare
        intervaller har sannsynlighet, og derfor spiller det heller ingen rolle om du skriver ≤ eller
        &lt; i kontinuerlige oppgaver.
      </>
    ),
  },
  {
    id: "m3-a3",
    tema: "Poisson — «ingenting skjer»",
    sporsmal: (
      <>
        En vaktsentral får i snitt <strong>én alarm per døgn</strong>, uavhengig av hverandre. Hvor
        sannsynlig er det at et tilfeldig døgn går <strong>helt uten</strong> alarm?
      </>
    ),
    alternativer: [
      { id: "a", label: "Nesten null — snittet er jo 1" },
      { id: "b", label: "Rundt 10 %" },
      { id: "c", label: "Rundt 37 %" },
      { id: "d", label: "Rundt 50 %" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>36,8 %.</strong> Med Poisson og λ = 1 er P(X = 0) = e⁻¹. Mer enn hvert tredje døgn er
        altså stille — samtidig som snittet er nøyaktig 1. Hemmeligheten ligger i halen: noen døgn
        gir to, tre eller fire alarmer og drar snittet opp igjen.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi leser «i snitt én per døgn» som «omtrent én hvert døgn», altså som noe jevnt fordelt. Men
        Poisson beskriver hendelser som kommer <em>klumpvis og tilfeldig</em>. Er du interessert i
        bemanning eller kapasitet, er det klumpene som betyr noe, ikke snittet.
      </>
    ),
  },
  {
    id: "m3-a4",
    tema: "Normalfordelingen — hvor sjelden er tre standardavvik?",
    sporsmal: (
      <>
        En produksjonsprosess gir normalfordelte mål. Av <strong>1000 enheter</strong>, hvor mange
        havner mer enn <strong>tre standardavvik</strong> fra forventningen (i en av retningene)?
      </>
    ),
    alternativer: [
      { id: "a", label: "Rundt 50" },
      { id: "b", label: "Rundt 30" },
      { id: "c", label: "Rundt 10" },
      { id: "d", label: "Rundt 3" },
    ],
    riktigId: "d",
    fasit: (
      <>
        <strong>Cirka 2,7 av 1000.</strong> Innenfor ±1σ ligger 68 %, innenfor ±2σ ligger 95 %, og
        innenfor ±3σ ligger 99,73 %. Utenfor blir det bare 0,27 % igjen — og det er fordelt på begge
        haler, altså 0,135 % i hver.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Normalfordelingens haler faller av <em>ekstremt</em> fort — som e^(−z²/2). Vår intuisjon er
        vant til å tenke lineært, så vi undervurderer hvor raskt sannsynligheten forsvinner. Dette er
        forresten grunnen til at 68–95–99,7-regelen er verdt å kunne utenat: den erstatter en
        tabelloppslag i tre av fire tilfeller.
      </>
    ),
  },
  {
    id: "m3-a5",
    tema: "Sentralgrenseteoremet",
    sporsmal: (
      <>
        Du trekker fra en <strong>kraftig høyreskjev</strong> fordeling (ventetider — mange korte,
        noen svært lange). Du tar <strong>30 verdier om gangen</strong> og regner gjennomsnittet, og
        gjentar det tusen ganger. Hvordan ser fordelingen av de tusen gjennomsnittene ut?
      </>
    ),
    alternativer: [
      { id: "a", label: "Like skjev som grunnfordelingen — skjevheten forsvinner ikke" },
      { id: "b", label: "Litt mindre skjev, men fortsatt tydelig skjev" },
      { id: "c", label: "Nesten symmetrisk og klokkeformet" },
      { id: "d", label: "Flat — alle gjennomsnitt blir omtrent like sannsynlige" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>Nesten symmetrisk og klokkeformet.</strong> Det er sentralgrenseteoremet: uansett
        hvordan grunnfordelingen ser ut, blir fordelingen til <em>gjennomsnittet</em> tilnærmet
        normal når n er stor nok. Og den blir smalere: spredningen er σ/√30, ikke σ.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Det føles som om skjevhet må «arves». Men et gjennomsnitt er en sum, og i en sum utligner de
        lange ventetidene hverandre mot de korte. Merk nøyaktig hva teoremet lover:{" "}
        <strong>gjennomsnittene</strong> blir normalfordelte. Rådataene blir like skjeve som før,
        uansett hvor mange du samler.
      </>
    ),
  },
  {
    id: "m3-a6",
    tema: "Hvor mye krymper spredningen?",
    sporsmal: (
      <>
        Du måler noe med en usikkerhet på σ = 8. Du vil halvere usikkerheten i gjennomsnittet ditt.
        Hvor mange målinger må du ta, om du i dag tar <strong>25</strong>?
      </>
    ),
    alternativer: [
      { id: "a", label: "50 — dobbelt så mange" },
      { id: "b", label: "75" },
      { id: "c", label: "100 — fire ganger så mange" },
      { id: "d", label: "625" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>100.</strong> Spredningen til gjennomsnittet er σ/√n. Skal den halveres, må √n
        dobles, og da må n firedobles. Fra 25 til 100 målinger gir σ/5 → σ/10.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi antar at dobbelt så mye arbeid gir dobbelt så god presisjon. Kvadratroten gjør at
        avkastningen faller raskt: de første målingene er svært verdifulle, de siste nesten ikke.
        Dette ene forholdet forklarer hvorfor store studier er så dyre — og det kommer tilbake i
        modul 4 som bredden på et konfidensintervall.
      </>
    ),
  },
];

// ===========================================================================
// Type 3 — MÅLOPPGAVER med tilstandssjekk (metode + tall, hver for seg).
// Alle fasitene er regnet ut med src/lib/tek1501/fordelinger.ts.
// ===========================================================================

const MALOPPGAVER: MaloppgaveData[] = [
  {
    id: "m3-o1",
    tittel: "Binomisk — to defekte blant tjue",
    oppgave: (
      <>
        En maskin produserer enheter der <strong>10 %</strong> er defekte, uavhengig av hverandre. Du
        plukker <strong>20 enheter</strong> fra en stor produksjonsserie. Hva er sannsynligheten for
        at <strong>nøyaktig 2</strong> av dem er defekte?
      </>
    ),
    data: <>n = 20 · p = 0,10 · søker P(X = 2)</>,
    metoder: [
      { id: "binom", label: "Binomisk: P(X = k) = nCk · p^k · (1 − p)^(n − k)" },
      {
        id: "poisson",
        label: "Poisson med λ = n·p = 2",
        hvorforFeil:
          "Poisson er en TILNÆRMING til binomisk, gyldig når n er stor og p liten. Her gir den 0,2707 mot det eksakte 0,2852 — nær, men ikke riktig. Når både n og p er oppgitt, bruk binomisk direkte.",
      },
      {
        id: "hyper",
        label: "Hypergeometrisk uten tilbakelegging",
        hvorforFeil:
          "Hypergeometrisk krever at du kjenner populasjonsstørrelsen N og antall defekte K i den. Her er serien «stor» og andelen konstant på 10 % — det er nettopp forutsetningen for binomisk.",
      },
    ],
    riktigMetodeId: "binom",
    fasit: { verdi: 0.2852, toleranse: 0.002, desimaler: 4 },
    svarEtikett: "P(X = 2) =",
    utregning: (
      <>
        <p>
          <strong>1. Sjekk forutsetningene.</strong> Fast antall forsøk (20), to utfall per forsøk
          (defekt / ikke), uavhengighet, og konstant p. Alle fire holder ⇒ binomisk.
        </p>
        <p className="mt-1">
          <strong>2. Sett inn:</strong>{" "}
          <span className="font-mono">P(X = 2) = 20C2 · 0,10² · 0,90¹⁸</span>
        </p>
        <p className="mt-1">
          <strong>3. Regn ledd for ledd:</strong> 20C2 = 190, 0,10² = 0,01, 0,90¹⁸ = 0,150095.
          Produktet blir <span className="font-mono">190 · 0,01 · 0,150095 = 0,28518</span>.
        </p>
        <p className="mt-2 text-muted-foreground">
          Legg merke til hva de tre faktorene gjør: 0,10² er sannsynligheten for at de to bestemte
          enhetene er defekte, 0,90¹⁸ at de øvrige atten ikke er det, og 190 teller hvor mange måter
          «de to» kan velges på. Alle binomiske oppgaver har nøyaktig denne strukturen.
        </p>
      </>
    ),
  },
  {
    id: "m3-o2",
    tittel: "Poisson — minst én alarm på en halvtime",
    oppgave: (
      <>
        En vaktsentral får alarmer uavhengig av hverandre, i snitt <strong>3 per time</strong>. Hva
        er sannsynligheten for at det kommer <strong>minst én</strong> alarm i løpet av en halv time?
      </>
    ),
    data: <>rate = 3 per time · intervall = 0,5 time · søker P(X ≥ 1)</>,
    metoder: [
      { id: "poisson", label: "Poisson med λ skalert til intervallet, via komplementet 1 − P(X = 0)" },
      {
        id: "uskalert",
        label: "Poisson med λ = 3, via 1 − P(X = 0)",
        hvorforFeil:
          "Da regner du på en hel time, ikke en halv. λ er forventet antall i DET intervallet oppgaven spør om, og må skaleres: 3 per time gir 1,5 per halvtime. Svaret ditt blir 0,9502 i stedet for 0,7769.",
      },
      {
        id: "binom",
        label: "Binomisk med n = 30 minutter og p = 0,05 per minutt",
        hvorforFeil:
          "Tanken er riktig — Poisson ER grensen av binomisk når intervallet deles stadig finere — men oppdelingen i minutter er vilkårlig, og utelukker at to alarmer kan komme i samme minutt. Når oppgaven gir en rate per tidsenhet, er Poisson den tiltenkte modellen.",
      },
    ],
    riktigMetodeId: "poisson",
    fasit: { verdi: 0.7769, toleranse: 0.002, desimaler: 4 },
    svarEtikett: "P(X ≥ 1) =",
    utregning: (
      <>
        <p>
          <strong>1. Skaler λ til riktig intervall:</strong>{" "}
          <span className="font-mono">λ = 3 · 0,5 = 1,5</span> alarmer per halvtime.
        </p>
        <p className="mt-1">
          <strong>2. Snu spørsmålet.</strong> «Minst én» har uendelig mange utfall; komplementet har
          ett. Samme grep som i modul 2.
        </p>
        <p className="mt-1">
          <strong>3.</strong> <span className="font-mono">P(X = 0) = e^(−1,5) · 1,5⁰ / 0! = 0,22313</span>
        </p>
        <p className="mt-1">
          <strong>4.</strong> <span className="font-mono">P(X ≥ 1) = 1 − 0,22313 = 0,77687</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Skaleringen i steg 1 er den eneste virkelige fellen i Poisson-oppgaver. Les alltid to
          ganger hvilket intervall oppgaven spør om, og skriv ned λ med enhet — «1,5 per halvtime» —
          før du regner.
        </p>
      </>
    ),
  },
  {
    id: "m3-o3",
    tittel: "Normalfordeling — standardiser og slå opp",
    oppgave: (
      <>
        Bruddstyrken til et materiale er normalfordelt med forventning <strong>500 N</strong> og
        standardavvik <strong>40 N</strong>. Hva er sannsynligheten for at en tilfeldig prøve tåler{" "}
        <strong>mer enn 560 N</strong>?
      </>
    ),
    data: <>X ~ N(500, 40²) · søker P(X &gt; 560)</>,
    metoder: [
      { id: "z", label: "Standardiser: Z = (x − μ)/σ, slå opp Φ(z) og ta 1 − Φ(z)" },
      {
        id: "glemtkomplement",
        label: "Standardiser og bruk Φ(z) direkte",
        hvorforFeil:
          "Φ(z) er P(Z ≤ z), altså sannsynligheten for at prøven tåler MINDRE enn 560 N. Det gir 0,9332. Oppgaven spør etter halen på den andre siden, så du må trekke fra 1.",
      },
      {
        id: "varians",
        label: "Standardiser med variansen: Z = (x − μ)/σ²",
        hvorforFeil:
          "Standardavviket σ = 40 skal i nevneren, ikke variansen σ² = 1600. Med σ² får du z = 0,0375, altså nesten null — som ville betydd at 560 N er en helt vanlig verdi. Notasjonen N(500, 40²) oppgir variansen, men formelen bruker σ.",
      },
    ],
    riktigMetodeId: "z",
    fasit: { verdi: 0.0668, toleranse: 0.0015, desimaler: 4 },
    svarEtikett: "P(X > 560) =",
    utregning: (
      <>
        <p>
          <strong>1. Standardiser:</strong>{" "}
          <span className="font-mono">z = (560 − 500) / 40 = 1,50</span>. 560 N ligger altså
          halvannet standardavvik over forventningen.
        </p>
        <p className="mt-1">
          <strong>2. Slå opp:</strong> <span className="font-mono">Φ(1,50) = 0,9332</span> — det er
          arealet til venstre.
        </p>
        <p className="mt-1">
          <strong>3. Ta halen:</strong> <span className="font-mono">1 − 0,9332 = 0,0668</span>,
          altså cirka 6,7 %.
        </p>
        <p className="mt-2 text-muted-foreground">
          Tegn kurven og skraver det du er ute etter <em>før</em> du slår opp. Tabellen gir alltid
          arealet til venstre, så skissen avgjør om svaret er Φ(z) eller 1 − Φ(z). Det tar fem
          sekunder og fjerner den vanligste feilen i hele kapittelet.
        </p>
      </>
    ),
  },
  {
    id: "m3-o4",
    tittel: "Sentralgrenseteoremet — fordelingen til gjennomsnittet",
    oppgave: (
      <>
        En populasjon har forventning <strong>50</strong> og standardavvik <strong>8</strong>.
        Fordelingen er ikke normal. Du trekker et utvalg på <strong>n = 64</strong> og regner
        gjennomsnittet. Hva er sannsynligheten for at gjennomsnittet blir{" "}
        <strong>større enn 51</strong>?
      </>
    ),
    data: <>μ = 50 · σ = 8 · n = 64 · søker P(X̄ &gt; 51)</>,
    metoder: [
      { id: "clt", label: "Sentralgrenseteoremet: X̄ ≈ N(μ, σ²/n), altså standardfeil σ/√n" },
      {
        id: "raa",
        label: "Standardiser med σ = 8 direkte",
        hvorforFeil:
          "Da regner du på ÉN observasjon, ikke på gjennomsnittet av 64. Du får z = 0,125 og svaret 0,4503. Gjennomsnittet spriker mye mindre enn enkeltmålinger — det er hele poenget med å ta mange målinger.",
      },
      {
        id: "delt-n",
        label: "Standardfeil = σ/n = 8/64",
        hvorforFeil:
          "Det er kvadratroten av n som står i nevneren, ikke n. Med σ/n får du en standardfeil på 0,125 i stedet for 1, altså åtte ganger for smal fordeling, og svaret 0,0000. Sjekk enheten: variansen deles på n, og når du tar rota blir det √n.",
      },
    ],
    riktigMetodeId: "clt",
    fasit: { verdi: 0.1587, toleranse: 0.003, desimaler: 4 },
    svarEtikett: "P(X̄ > 51) =",
    utregning: (
      <>
        <p>
          <strong>1. Fordelingen til X̄.</strong> Med n = 64 er n stor nok til at
          sentralgrenseteoremet gjelder, uansett hvordan grunnfordelingen ser ut:{" "}
          <span className="font-mono">X̄ ≈ N(50, 8²/64)</span>.
        </p>
        <p className="mt-1">
          <strong>2. Standardfeilen:</strong>{" "}
          <span className="font-mono">σ/√n = 8/√64 = 8/8 = 1</span>
        </p>
        <p className="mt-1">
          <strong>3. Standardiser:</strong>{" "}
          <span className="font-mono">z = (51 − 50) / 1 = 1,00</span>
        </p>
        <p className="mt-1">
          <strong>4.</strong> <span className="font-mono">1 − Φ(1,00) = 1 − 0,8413 = 0,1587</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Sammenlign med feilsvaret 0,4503 som du får ved å bruke σ = 8. Forskjellen er ikke en
          detalj: et gjennomsnitt som ligger ett poeng over μ er helt uinteressant for én måling,
          men ganske uvanlig for et snitt av 64. Å skille «spredningen i dataene» fra «spredningen i
          estimatet» er broen inn til modul 4.
        </p>
      </>
    ),
  },
  {
    id: "m3-o5",
    tittel: "Varians fra en sannsynlighetstabell",
    oppgave: (
      <>
        Antall feilmeldinger X et system gir i løpet av en time har fordelingen under. Regn ut{" "}
        <strong>Var(X)</strong>.
      </>
    ),
    data: (
      <>
        x: 0, 1, 2, 3
        <br />
        P(X = x): 0,4 &nbsp; 0,3 &nbsp; 0,2 &nbsp; 0,1
      </>
    ),
    metoder: [
      { id: "riktig", label: "Var(X) = E[X²] − (E[X])²" },
      {
        id: "uten-kvadrat",
        label: "Var(X) = E[X²]",
        hvorforFeil:
          "E[X²] = 2,0 er bare første ledd. Variansen måler avvik fra forventningen, så (E[X])² må trekkes fra. Uten det får du 2,0 i stedet for 1,0 — nøyaktig dobbelt så mye her.",
      },
      {
        id: "utvalg",
        label: "Del kvadratsummen på n − 1, som stikkprøvevariansen i modul 1",
        hvorforFeil:
          "n − 1 hører til når du har DATA og estimerer en ukjent varians. Her er hele fordelingen oppgitt — det finnes ingen ukjent parameter å korrigere for, og ingen n å dele på. Vekting med sannsynlighetene er hele regnestykket.",
      },
    ],
    riktigMetodeId: "riktig",
    fasit: { verdi: 1.0, toleranse: 0.02, desimaler: 2 },
    svarEtikett: "Var(X) =",
    utregning: (
      <>
        <p>
          <strong>1. Forventningen:</strong>{" "}
          <span className="font-mono">
            E[X] = 0·0,4 + 1·0,3 + 2·0,2 + 3·0,1 = 0 + 0,3 + 0,4 + 0,3 = 1,0
          </span>
        </p>
        <p className="mt-1">
          <strong>2. Andre moment:</strong>{" "}
          <span className="font-mono">
            E[X²] = 0·0,4 + 1·0,3 + 4·0,2 + 9·0,1 = 0 + 0,3 + 0,8 + 0,9 = 2,0
          </span>
        </p>
        <p className="mt-1">
          <strong>3. Trekk fra:</strong>{" "}
          <span className="font-mono">Var(X) = 2,0 − 1,0² = 1,0</span>, og{" "}
          <span className="font-mono">σ = √1,0 = 1,0</span>.
        </p>
        <p className="mt-2 text-muted-foreground">
          Gratis feilsjekk: sannsynlighetene må summere til 1 (0,4 + 0,3 + 0,2 + 0,1 = 1 ✓), og en
          varians kan aldri bli negativ. Får du et negativt tall ut av E[X²] − (E[X])², har du
          glemt å kvadrere x-verdiene i første ledd.
        </p>
      </>
    ),
  },
  {
    id: "m3-o6",
    tittel: "Uten tilbakelegging — når binomisk ikke gjelder",
    oppgave: (
      <>
        En kasse inneholder <strong>20 enheter, hvorav 5 er defekte</strong>. Du trekker ut{" "}
        <strong>4 enheter</strong> til kontroll, uten å legge dem tilbake. Hva er sannsynligheten for
        at <strong>nøyaktig 1</strong> av de fire er defekt?
      </>
    ),
    data: <>N = 20 · K = 5 defekte · n = 4 trekk uten tilbakelegging · søker P(X = 1)</>,
    metoder: [
      { id: "hyper", label: "Hypergeometrisk: P(X = k) = [KCk · (N−K)C(n−k)] / NCn" },
      {
        id: "binom",
        label: "Binomisk med n = 4 og p = 5/20 = 0,25",
        hvorforFeil:
          "Binomisk forutsetter at p er den samme i hvert trekk. Uten tilbakelegging endres den: har du først trukket en defekt, er det 4 defekte igjen av 19. Du får 0,4219 mot det riktige 0,4696 — feilen er liten her, men vokser når utvalget er stort i forhold til kassa.",
      },
      {
        id: "poisson",
        label: "Poisson med λ = 1",
        hvorforFeil:
          "Poisson beskriver antall hendelser i et intervall når det ikke finnes noe naturlig «antall forsøk». Her er antall forsøk oppgitt og lite (4), og populasjonen er endelig og liten (20). Ingen av Poissons forutsetninger er oppfylt.",
      },
    ],
    riktigMetodeId: "hyper",
    fasit: { verdi: 0.4696, toleranse: 0.003, desimaler: 4 },
    svarEtikett: "P(X = 1) =",
    utregning: (
      <>
        <p>
          <strong>1. Kjenn igjen modellen.</strong> Endelig populasjon (N = 20), kjent antall
          «suksesser» i den (K = 5), og trekning <em>uten</em> tilbakelegging ⇒ hypergeometrisk.
        </p>
        <p className="mt-1">
          <strong>2. Tell tre ting:</strong> måter å velge 1 defekt av 5 (
          <span className="font-mono">5C1 = 5</span>), måter å velge 3 hele av 15 (
          <span className="font-mono">15C3 = 455</span>), og totalt antall måter å velge 4 av 20 (
          <span className="font-mono">20C4 = 4845</span>).
        </p>
        <p className="mt-1">
          <strong>3. Del:</strong>{" "}
          <span className="font-mono">(5 · 455) / 4845 = 2275 / 4845 = 0,46956</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Tommelfingerregelen som avgjør valget: er utvalget mindre enn cirka 5 % av populasjonen,
          er binomisk en god nok tilnærming. Her er 4 av 20 hele 20 %, og da må hypergeometrisk
          brukes. Merk hvordan tellingen er ren kombinatorikk fra modul 2 — teller og nevner, ikke
          noe mer.
        </p>
      </>
    ),
  },
];

// ===========================================================================
// Type 4 — FEILSØKING. Ferdige resonnementer som ender galt.
// ===========================================================================

const FEILSOKING: Feilsoking[] = [
  {
    id: "m3-f1",
    tittel: "«Tettheten er 1,6, altså 160 % sannsynlighet»",
    feilnavn: "Tetthet forvekslet med sannsynlighet",
    situasjon: (
      <>
        En student skal beskrive måleusikkerheten til et instrument og skriver følgende. Konklusjonen
        er umulig — hvor kommer feilen inn?
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Målefeilen er normalfordelt med forventning 0 og standardavvik 0,25 mm.",
        vurdering:
          "Dette holder. En symmetrisk målefeil rundt null er en helt vanlig og rimelig modell, og standardavviket er oppgitt med enhet.",
      },
      {
        id: "l2",
        tekst: "Tettheten i toppunktet er f(0) = 1 / (0,25 · √(2π)) ≈ 1,60.",
        vurdering:
          "Riktig regnet. Formelen for normaltettheten er brukt korrekt, og verdien 1,60 er den faktiske topphøyden når σ = 0,25. At tallet er over 1 er helt i orden — det er ikke en sannsynlighet.",
      },
      {
        id: "l3",
        tekst: "Sannsynligheten for at målefeilen er nøyaktig 0 mm er derfor 1,60, altså 160 %.",
        vurdering:
          "Her er feilen. To ting går galt samtidig. For det første er f(x) en TETTHET — sannsynlighet per millimeter — ikke en sannsynlighet, og den kan derfor godt overstige 1. For det andre er sannsynligheten for at en kontinuerlig variabel treffer én bestemt verdi eksakt alltid 0, fordi et punkt har bredde null og dermed areal null.",
      },
      {
        id: "l4",
        tekst: "Instrumentet er derfor praktisk talt alltid nøyaktig.",
        vurdering:
          "Arver feilen over. Med riktig regning: sannsynligheten for at feilen ligger innenfor ±0,1 mm er Φ(0,4) − Φ(−0,4) ≈ 0,31 — altså bommer instrumentet mer enn 0,1 mm i to av tre målinger.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        For kontinuerlige fordelinger har bare <strong>intervaller</strong> sannsynlighet, og
        sannsynligheten er <em>arealet</em> under kurven:{" "}
        <span className="font-mono">P(a &lt; X &lt; b) = ∫ f(x) dx = F(b) − F(a)</span>. Høyden f(x)
        sier bare hvor tett sannsynligheten ligger akkurat der. Praktisk konsekvens å ta med seg: i
        kontinuerlige oppgaver spiller det ingen rolle om du skriver ≤ eller &lt;, for endepunktet
        bidrar med null. I diskrete oppgaver er det derimot helt avgjørende.
      </>
    ),
  },
  {
    id: "m3-f2",
    tittel: "«Binomisk går fint, det er jo suksess eller fiasko»",
    feilnavn: "Binomisk brukt uten tilbakelegging",
    situasjon: (
      <>
        En kvalitetsansvarlig skal regne ut sannsynligheten for at en stikkprøve avslører defekter i
        en liten batch, og resonnerer slik.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Kassa har 20 enheter, og vi vet at 5 av dem er defekte.",
        vurdering:
          "Dette holder — det er premisset. Merk at vi kjenner både populasjonsstørrelsen og det eksakte antallet defekte i den; det er en uvanlig sterk opplysning, og den peker mot hypergeometrisk.",
      },
      {
        id: "l2",
        tekst: "Vi trekker 4 enheter uten tilbakelegging.",
        vurdering:
          "Også dette er bare premisset, korrekt gjengitt. «Uten tilbakelegging» er den opplysningen som skal utløse et varsel når modellen skal velges.",
      },
      {
        id: "l3",
        tekst:
          "Hvert trekk er enten defekt eller helt, med sannsynlighet p = 5/20 = 0,25. Vi bruker binomisk med n = 4.",
        vurdering:
          "Her er feilen. Binomisk krever at p er KONSTANT gjennom alle forsøkene, og det forutsetter tilbakelegging eller en populasjon så stor at trekket ikke merkes. Her er andre trekk 4/19 eller 5/19 avhengig av hva som skjedde først. Fire trekk av tjue er 20 % av kassa — altfor mye til at p kan regnes som uendret.",
      },
      {
        id: "l4",
        tekst: "Sannsynligheten for nøyaktig én defekt blir da 4C1 · 0,25 · 0,75³ = 0,4219.",
        vurdering:
          "Riktig regnet ut fra feil modell. Det eksakte svaret er 0,4696. Avviket på fem prosentpoeng ser lite ut, men det er systematisk, og det vokser fort når stikkprøven blir større i forhold til kassa.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Bruk hypergeometrisk:{" "}
        <span className="font-mono">P(X = 1) = (5C1 · 15C3) / 20C4 = 2275/4845 ≈ 0,4696</span>.
        Sjekklista før du velger binomisk er kort:{" "}
        <strong>er antall forsøk fast, er de uavhengige, og er p den samme hver gang?</strong> Legges
        det ikke tilbake, faller det siste kravet — med mindre populasjonen er stor nok til at det
        ikke merkes. Tommelfingerregelen: n mindre enn cirka 5 % av N, så er binomisk godt nok.
      </>
    ),
  },
  {
    id: "m3-f3",
    tittel: "«Med σ = 15 er et snitt på 104 helt vanlig»",
    feilnavn: "Spredningen i data forvekslet med spredningen i gjennomsnittet",
    situasjon: (
      <>
        Et laboratorium har målt 100 prøver og fått et gjennomsnitt på 104, mens referanseverdien er
        100. Vurderingen deres lyder slik.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Enkeltmålinger er normalfordelte med forventning 100 og standardavvik 15.",
        vurdering:
          "Dette holder som premiss, og det er riktig oppgitt: 15 beskriver hvor mye ÉN måling spriker.",
      },
      {
        id: "l2",
        tekst: "Vi har målt 100 prøver og fått gjennomsnittet 104.",
        vurdering:
          "En ren observasjon, korrekt gjengitt. Merk at det er et gjennomsnitt, ikke en enkeltmåling — det er nettopp dette som blir oversett i neste ledd.",
      },
      {
        id: "l3",
        tekst: "104 ligger (104 − 100)/15 = 0,27 standardavvik fra forventningen.",
        vurdering:
          "Her er feilen. Nevneren skal være standardfeilen til GJENNOMSNITTET, ikke standardavviket til enkeltmålinger: σ/√n = 15/√100 = 1,5. Riktig z er (104 − 100)/1,5 = 2,67, ikke 0,27 — en faktor 10 i forskjell, fordi √100 = 10.",
      },
      {
        id: "l4",
        tekst: "Det er helt innenfor det normale, så avviket skyldes tilfeldig variasjon.",
        vurdering:
          "Arver feilen. Med riktig z = 2,67 er tosidig sannsynlighet omtrent 0,008 — altså under én prosent. Et snitt på 104 fra 100 prøver er et sterkt signal om at noe faktisk er forskjøvet, selv om en enkeltmåling på 104 ville vært helt uinteressant.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Skill de to spredningene ved alltid å skrive ned hvilken størrelse du standardiserer:{" "}
        <span className="font-mono">én måling ⇒ σ</span>, <span className="font-mono">et snitt av n ⇒ σ/√n</span>.
        Kvadratroten er hele forskjellen mellom «uinteressant» og «alarmerende» her. Dette er også
        grunnen til at store utvalg kan avdekke små effekter: gjennomsnittets fordeling krymper,
        mens dataenes ikke gjør det.
      </>
    ),
  },
  {
    id: "m3-f4",
    tittel: "«Sentralgrenseteoremet gjør dataene mine normalfordelte»",
    feilnavn: "CLT anvendt på rådata i stedet for på gjennomsnittet",
    situasjon: (
      <>
        En student skal begrunne bruken av en normalbasert metode på kraftig høyreskjeve
        responstidsdata, og skriver dette.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Responstidene er kraftig høyreskjeve — de fleste er korte, noen få er svært lange.",
        vurdering:
          "Dette holder, og det er en helt vanlig og korrekt observasjon for ventetids- og responstidsdata.",
      },
      {
        id: "l2",
        tekst: "Jeg har samlet 2000 målinger, altså et stort utvalg.",
        vurdering:
          "En ren observasjon om datamengden. Den er sann, men legg merke til at den ennå ikke sier noe om hvilken størrelse som blir normalfordelt.",
      },
      {
        id: "l3",
        tekst:
          "Sentralgrenseteoremet sier at med så stort n blir dataene tilnærmet normalfordelte, så jeg kan behandle dem som normale.",
        vurdering:
          "Her er feilen. Sentralgrenseteoremet sier ingenting om rådataene. Det sier at fordelingen til GJENNOMSNITTET X̄ nærmer seg normalfordelingen når n vokser. Samler du 2000 responstider i stedet for 20, får du et mer detaljert bilde av den samme skjeve fordelingen — den blir ikke penere, bare tydeligere.",
      },
      {
        id: "l4",
        tekst: "Jeg bruker derfor μ ± 2σ som et intervall som dekker cirka 95 % av responstidene.",
        vurdering:
          "Arver feilen, og gir et konkret galt resultat: på skjeve data vil μ − 2σ ofte være negativ (umulig for en ventetid), og den øvre grensen vil ligge langt under den reelle 97,5-persentilen. Til å beskrive selve dataene bør du bruke persentiler direkte, ikke μ ± 2σ.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Formuler teoremet med den størrelsen det faktisk handler om:{" "}
        <strong>
          X̄ er tilnærmet N(μ, σ²/n) når n er stor, uansett hvilken fordeling observasjonene kommer
          fra.
        </strong>{" "}
        Det gjør normalbaserte metoder gyldige for <em>gjennomsnitt, andeler og differanser mellom
        gjennomsnitt</em> — som er nettopp det modul 4 handler om. Det gjør dem ikke gyldige for
        utsagn om enkeltobservasjoner. Kontrollspørsmålet: «hvilken størrelse påstår jeg er
        normalfordelt — én måling, eller snittet av mange?»
      </>
    ),
  },
];

// ===========================================================================
// Type 5 — RECALL. Kun det som må sitte i hodet uten utledning.
// ===========================================================================

const RECALL: RecallKort[] = [
  {
    id: "m3-r1",
    kategori: "formel",
    sporsmal: "Skriv punktsannsynligheten for binomisk fordeling, med forventning og varians.",
    svar: (
      <>
        <span className="font-mono">P(X = k) = nCk · p^k · (1 − p)^(n − k)</span>, med{" "}
        <span className="font-mono">E[X] = np</span> og{" "}
        <span className="font-mono">Var(X) = np(1 − p)</span>.
      </>
    ),
    hvorforUtenat:
      "Den mest brukte diskrete fordelingen på eksamen, og E og Var brukes ofte uten at man rekker å utlede dem.",
  },
  {
    id: "m3-r2",
    kategori: "formel",
    sporsmal: "Skriv Poisson-fordelingen, med forventning og varians.",
    svar: (
      <>
        <span className="font-mono">P(X = k) = e^(−λ) · λ^k / k!</span>, med{" "}
        <span className="font-mono">E[X] = Var(X) = λ</span>. At forventning og varians er samme
        tall er Poissons signatur.
      </>
    ),
    hvorforUtenat:
      "λ-skaleringen til riktig intervall er den vanligste feilen, og formelen må sitte for at man skal se den.",
  },
  {
    id: "m3-r3",
    kategori: "formel",
    sporsmal: "Hvordan regnes varians raskest ut fra en sannsynlighetstabell?",
    svar: (
      <>
        <span className="font-mono">Var(X) = E[X²] − (E[X])²</span>, der begge forventningene er
        sannsynlighetsvektede summer. Standardavviket er kvadratrota av dette.
      </>
    ),
    hvorforUtenat:
      "Snarveien sparer et helt regnestykke sammenlignet med definisjonen E[(X − μ)²], og gjøres for hånd på eksamen.",
  },
  {
    id: "m3-r4",
    kategori: "formel",
    sporsmal: "Skriv standardiseringen, og fordelingen til gjennomsnittet under CLT.",
    svar: (
      <>
        <span className="font-mono">Z = (X − μ)/σ</span> for én observasjon, og{" "}
        <span className="font-mono">X̄ ≈ N(μ, σ²/n)</span>, altså{" "}
        <span className="font-mono">Z = (X̄ − μ)/(σ/√n)</span> for et gjennomsnitt.
      </>
    ),
    hvorforUtenat:
      "De to linjene ser nesten like ut, og forskjellen på σ og σ/√n er den dyreste enkeltfeilen i faget.",
  },
  {
    id: "m3-r5",
    kategori: "definisjon",
    sporsmal: "68–95–99,7: hva står tallene for?",
    svar: (
      <>
        Andelen av en normalfordeling som ligger innenfor ±1σ, ±2σ og ±3σ fra forventningen. Utenfor
        ±2σ ligger 5 % (2,5 % i hver hale) — det er derfor 1,96 dukker opp overalt i modul 4.
      </>
    ),
    hvorforUtenat:
      "Erstatter et tabelloppslag i de fleste tilfeller, og gir en umiddelbar rimelighetssjekk på svaret.",
  },
  {
    id: "m3-r6",
    kategori: "når-brukes-hva",
    sporsmal: "Binomisk, hypergeometrisk eller Poisson?",
    svar: (
      <>
        <strong>Binomisk:</strong> fast antall forsøk n, konstant p, uavhengige (med tilbakelegging
        eller stor populasjon). <strong>Hypergeometrisk:</strong> samme, men uten tilbakelegging fra
        en endelig populasjon der N og K er kjent. <strong>Poisson:</strong> ingen naturlig «antall
        forsøk», bare en rate λ per intervall.
      </>
    ),
    hvorforUtenat:
      "Metodevalget er hele oppgaven; når fordelingen er riktig valgt er innsettingen mekanisk.",
  },
  {
    id: "m3-r7",
    kategori: "når-brukes-hva",
    sporsmal: "Når kan Poisson brukes som tilnærming til binomisk?",
    svar: (
      <>
        Når n er stor og p liten, i praksis n ≥ 50 og np &lt; 5. Sett{" "}
        <span className="font-mono">λ = np</span>. Er både n og p oppgitt, regn eksakt binomisk med
        mindre oppgaven ber om tilnærmingen.
      </>
    ),
    hvorforUtenat:
      "Grensene er vilkårlige å utlede, og en oppgave som ber om «tilnærming» forventer at du kjenner dem.",
  },
  {
    id: "m3-r8",
    kategori: "felle",
    sporsmal: "Hva betyr det at f(3) = 1,6 for en kontinuerlig fordeling?",
    svar: (
      <>
        At tettheten er 1,6 <em>per enhet av x</em> akkurat der — ikke at noe har 160 %
        sannsynlighet. For kontinuerlige variabler er P(X = 3) = 0; bare intervaller har
        sannsynlighet, og den er arealet under kurven.
      </>
    ),
    hvorforUtenat:
      "Skillet mellom tetthet og sannsynlighet er et definisjonsspørsmål som ikke kan resonneres fram i eksamenssituasjonen.",
  },
  {
    id: "m3-r9",
    kategori: "felle",
    sporsmal: "Hva sier sentralgrenseteoremet — og hva sier det ikke?",
    svar: (
      <>
        <strong>Sier:</strong> fordelingen til gjennomsnittet X̄ nærmer seg normalfordelingen når n
        vokser, uansett hvordan grunnfordelingen ser ut. <strong>Sier ikke:</strong> at dataene selv
        blir normalfordelte. Flere observasjoner fra en skjev fordeling gir en tydeligere skjev
        fordeling, ikke en pen.
      </>
    ),
    hvorforUtenat:
      "Feiltolkningen brukes rutinemessig til å rettferdiggjøre metoder som ikke gjelder, og er en klassisk eksamensfelle.",
  },
  {
    id: "m3-r10",
    kategori: "definisjon",
    sporsmal: "Hva er forskjellen på f(x) og F(x)?",
    svar: (
      <>
        <span className="font-mono">f(x)</span> er punktsannsynligheten (diskret) eller tettheten
        (kontinuerlig). <span className="font-mono">F(x) = P(X ≤ x)</span> er den kumulative: alt til
        og med x. Nøkkelen til nesten alle oppgaver er{" "}
        <span className="font-mono">P(a &lt; X ≤ b) = F(b) − F(a)</span>.
      </>
    ),
    hvorforUtenat:
      "Tabeller og kalkulatorfunksjoner gir F, mens oppgaveteksten spør om intervaller — omregningen må gå automatisk.",
  },
];

export function Modul3FordelingerPage() {
  return (
    <StackPageShell
      title="TEK-1501 Modul 3 — Stokastiske variabler og fordelinger"
      group="eksamen"
    >
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            TEK-1501 · Modul 3 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Fordelinger — å bytte ut lista med en modell
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            I modul 2 talte du opp utfall ett for ett. Det fungerer for terninger og lottorekker, og
            bryter sammen for alt annet. Denne modulen innfører grepet som løser det: gi hvert utfall
            et <em>tall</em>, og beskriv hvordan sannsynligheten fordeler seg over tallene med en
            funksjon. Da er hele situasjonen fanget i to–tre parametere — og noen få standardformer
            dekker overraskende mye av virkeligheten.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-foreground">Slik er modulen bygget:</strong> du <em>anslår</em>{" "}
            først, uten hjelp. Så <em>ser</em> du hva som skjer i simulatorene. Så <em>regner</em> du
            selv, med sjekk på både metodevalg og tall. Til slutt <em>feilsøker</em> du ferdige
            resonnementer som er gale. Kortene nederst er bare sluttsjekken — de er ikke der du lærer
            stoffet.
          </div>
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Forutsetter modul 1 og 2.</strong> Fra modul 1
            trenger du skillet mellom utvalg og populasjon, og hva varians er. Fra modul 2 trenger du
            å telle muligheter og å multiplisere uavhengige sannsynligheter — den binomiske formelen
            er bokstavelig talt en kombinasjon ganget med et produkt.
          </div>
          <ProvisoriskKapittelnote className="mt-3" modul="3" />
        </header>

        <CourseOutline courseId="tek1-modul3-fordelinger" steps={STEPS} />

        <div className="mt-10" />
        <Symboltavle id="symboler" symboler={SYMBOLER} />

        {/* --- Type 1: anslå-så-sjekk, FØR forklaringen -------------------- */}
        <AnslaSaSjekk
          id="anslag"
          anslag={ANSLAG}
          intro={
            <>
              Gjett før du leser videre. Fordelinger er der tallene begynner å oppføre seg annerledes
              enn magefølelsen — særlig når det gjelder haler, tetthet og hva som skjer med et
              gjennomsnitt. Ingenting telles, og et bom her er mer verdt enn en riktig gjetning.
            </>
          }
        />

        {/* --- Forklaring + type 2: guidede simuleringer ------------------- */}
        <section id="variabel" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Sigma className="h-5 w-5 text-brand" /> Stokastisk variabel — regelen som gir utfall et
            tall
          </h2>
          <p className="leading-relaxed">
            En <strong>stokastisk variabel</strong> X er ikke et tall. Den er en <em>regel</em> som
            oversetter hvert utfall i utfallsrommet til et tall. Kaster du to terninger, er utfallet
            «fire og fem» — og X kan være summen (9), det største øyet (5), eller antall seksere (0).
            Samme forsøk, tre helt ulike stokastiske variabler.
          </p>
          <p className="mt-2 leading-relaxed">
            Gevinsten er at vi slipper å håndtere utfallsrommet direkte. I stedet for en liste over
            36 terningpar kan vi snakke om sannsynlighetene for verdiene 2 til 12. Notasjonen holder
            de to nivåene fra hverandre:{" "}
            <strong>stor X er mekanismen, liten x er en verdi den kan gi</strong>. Derfor skrives
            spørsmål som P(X = x).
          </p>
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <strong className="text-foreground">Diskret eller kontinuerlig?</strong> Kan du{" "}
            <em>telle</em> de mulige verdiene — 0, 1, 2, … — er X diskret: antall defekte, antall
            alarmer, antall kron. Kan verdien i prinsippet være hva som helst i et intervall, er den
            kontinuerlig: lengde, tid, temperatur, vekt. Skillet avgjør hele regnemaskineriet, og det
            er det første du bør fastslå i enhver oppgave.
          </div>
        </section>

        <section id="diskret" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <BarChart4 className="h-5 w-5 text-brand" /> Diskret: punktsannsynlighet og kumulativ
          </h2>
          <p className="leading-relaxed">
            For en diskret X er <span className="font-mono">f(x) = P(X = x)</span> — en stolpe per
            mulig verdi. To krav må alltid holde: hver stolpe er mellom 0 og 1, og alle stolpene
            summerer til nøyaktig 1. Det siste er en gratis feilsjekk du bør gjøre hver gang du får
            en tabell.
          </p>
          <p className="mt-2 leading-relaxed">
            Den <strong>kumulative</strong> <span className="font-mono">F(x) = P(X ≤ x)</span> legger
            sammen alle stolpene til og med x, og blir en trapp som klatrer fra 0 til 1. Grunnen til
            at den er verdt egen notasjon er at tabellverk og kalkulatorer nesten alltid gir deg F,
            mens oppgaveteksten spør om et intervall. Oversettelsen er alltid den samme:{" "}
            <span className="font-mono">P(a &lt; X ≤ b) = F(b) − F(a)</span>, og{" "}
            <span className="font-mono">P(X ≥ a) = 1 − F(a − 1)</span> for heltallsvariabler.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-foreground">Endepunktene teller — i diskrete oppgaver.</strong>{" "}
            P(X ≥ 3) og P(X &gt; 3) er forskjellige tall når X er diskret, fordi P(X = 3) er større
            enn null. Les alltid om oppgaven sier «minst», «mer enn», «høyst» eller «under», og skriv
            om til F-form før du regner.
          </div>
        </section>

        <section id="kontinuerlig" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Kontinuerlig: tetthet er ikke sannsynlighet</h2>
          <p className="leading-relaxed">
            For en kontinuerlig X finnes det ingen stolper å legge sammen — det er uendelig mange
            mulige verdier, og hver enkelt har sannsynlighet nøyaktig <strong>0</strong>. Det høres
            galt ut, men følger av at et punkt ikke har bredde. Sannsynlighet bor i{" "}
            <em>intervaller</em>, og den er <strong>arealet</strong> under tetthetskurven.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Kurven f(x) er derfor sannsynlighet <em>per enhet av x</em>, ikke sannsynlighet. Den kan
            godt ha høyde over 1, så lenge det totale arealet er 1. I simulatoren under kan du dra
            grensene og se arealet P(a ≤ X ≤ b) endre seg samtidig på tetthetskurven og på den
            kumulative kurven — det er den koblingen som gjør F(b) − F(a) selvforklarende.
          </p>
          <FordelingerVisualizer />
        </section>

        <section id="forventning" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Forventning og varians — fordelingens to tall</h2>
          <p className="leading-relaxed">
            <strong>Forventningen</strong> E[X] er tyngdepunktet: den verdien fordelingen ville
            balansert på hvis stolpene var lodd på en vektstang. Regnestykket er en vektet sum,{" "}
            <span className="font-mono">E[X] = Σ x · P(X = x)</span>, der sannsynlighetene er
            vektene. At forventningen ikke trenger å være en mulig verdi — 3,5 for en terning — er en
            påminnelse om at den er et balansepunkt, ikke en prediksjon.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Variansen</strong> Var(X) måler hvor langt fra tyngdepunktet fordelingen typisk
            ligger, målt i kvadrerte enheter:{" "}
            <span className="font-mono">Var(X) = E[(X − μ)²] = E[X²] − (E[X])²</span>. Den siste
            formen er den du bruker i praksis. Standardavviket σ = √Var(X) bringer oss tilbake til
            målenhetene, og er derfor det som rapporteres.
          </p>
          <div className="mt-3 rounded-lg border border-brand/25 bg-brand/5 p-4 text-sm">
            <strong className="text-foreground">Hvorfor varians og ikke standardavvik i
            regnestykkene:</strong>{" "}
            varianser til uavhengige variabler kan legges sammen —{" "}
            <span className="font-mono">Var(X + Y) = Var(X) + Var(Y)</span> — mens standardavvik ikke
            kan. Det er derfor σ/√n dukker opp: variansen til et gjennomsnitt er σ²/n, og
            kvadratrota av det er σ/√n.
          </div>
        </section>

        <section id="binomisk" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Layers className="h-5 w-5 text-brand" /> De diskrete arbeidshestene
          </h2>
          <p className="leading-relaxed">
            <strong>Binomisk (n, p)</strong> teller suksesser i n uavhengige forsøk med samme
            suksesssannsynlighet p. Formelen{" "}
            <span className="font-mono">P(X = k) = nCk · p^k · (1 − p)^(n − k)</span> er ren modul
            2: <em>nCk</em> teller hvor mange måter de k suksessene kan plasseres på, og resten er
            multiplikasjonssetningen for uavhengige hendelser.
          </p>
          <p className="mt-2 leading-relaxed">
            <strong>Hypergeometrisk</strong> er den samme situasjonen <em>uten tilbakelegging</em>,
            fra en endelig populasjon der du kjenner N og antall suksesser K. Da endrer p seg for
            hvert trekk, og binomisk gjelder ikke lenger.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            <strong>Poisson (λ)</strong> brukes når det ikke finnes noe naturlig «antall forsøk» —
            bare en rate: kunder per time, feil per kilometer, klikk per døgn. Parameteren λ er
            forventet antall i akkurat det intervallet du ser på, og må skaleres når intervallet
            endres. Utforsk formene i velgeren under: skru på n og p, og se hvordan binomisk blir
            symmetrisk når p nærmer seg 0,5 og skjev når p er liten.
          </p>
          <DistributionExplorer />
        </section>

        <section id="normal" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Bell className="h-5 w-5 text-brand" /> Normalfordelingen og standardiseringen
          </h2>
          <p className="leading-relaxed">
            <strong>N(μ, σ²)</strong> er symmetrisk om μ, og σ styrer bredden. Det finnes uendelig
            mange normalfordelinger, én for hvert par (μ, σ) — og det ville krevd uendelig mange
            tabeller. Løsningen er <strong>standardisering</strong>:{" "}
            <span className="font-mono">Z = (X − μ)/σ</span> gjør enhver normalfordeling om til den
            samme, N(0, 1). Z sier hvor mange standardavvik du er fra forventningen, og er derfor
            enhetsløs: en høyde og en bruddstyrke kan sammenlignes direkte i z-verdier.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Ett råd som fjerner den vanligste feilen: <strong>tegn kurven og skraver</strong> det du
            er ute etter før du slår opp. Tabellen gir alltid arealet til venstre, Φ(z), så skissen
            avgjør om svaret er Φ(z), 1 − Φ(z) eller en differanse. Kurven under skygger halene ved
            5 %-nivået og oppgir kritiske verdier numerisk — de samme tallene som blir grensene i
            modul 4.
          </p>
          <DistributionPlotter />
        </section>

        <section id="clt" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Activity className="h-5 w-5 text-brand" /> Sentralgrenseteoremet
          </h2>
          <p className="leading-relaxed">
            Teoremet sier én ting, og det er verdt å lære utenat med akkurat de ordene:{" "}
            <strong>
              fordelingen til gjennomsnittet X̄ av n uavhengige observasjoner nærmer seg N(μ, σ²/n)
              når n vokser
            </strong>{" "}
            — uansett hvordan grunnfordelingen ser ut. Legg merke til hva det <em>ikke</em> sier:
            ingenting om at dataene blir normalfordelte. Det er gjennomsnittet som pyntes, ikke
            observasjonene.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Galton-brettet under er den fysiske versjonen. Hver kule møter en rekke pinner og velger
            høyre eller venstre i hver — altså en sum av mange uavhengige småbidrag. Haugen som
            bygger seg opp nederst er klokkeformet, uten at noen har lagt inn en klokkekurve. Se det
            skje før du leser videre; det er lettere å tro på enn formelen.
          </p>
          <GaltonBrett />
          <p className="mt-6 mb-4 leading-relaxed">
            Neste steg er å velge en fordeling som <em>ikke</em> ligner en klokke i det hele tatt, og
            se gjennomsnittene bli normale likevel. Prøv en kraftig skjev fordeling med n = 2, og
            skru deg oppover til n = 30. To ting skjer samtidig: formen blir symmetrisk,{" "}
            <em>og</em> fordelingen blir smalere.
          </p>
          <CltDemonstrator />
          <p className="mt-6 mb-4 leading-relaxed">
            Den andre halvparten — at fordelingen krymper — er den som brukes mest, og som er lettest
            å rote med. Spredningen i <strong>dataene</strong> er σ og krymper aldri, uansett hvor
            mange målinger du tar. Spredningen i <strong>gjennomsnittet</strong> er σ/√n og krymper
            med kvadratrota. Byggeren under viser de to side om side.
          </p>
          <StandardfeilBygger />
        </section>

        <section id="velge" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Å velge riktig fordeling</h2>
          <p className="mb-3 leading-relaxed">
            På eksamen er valget av fordeling hele oppgaven; innsettingen etterpå er mekanisk. Fire
            spørsmål avgjør nesten alltid:
          </p>
          <ol className="mb-4 space-y-2 pl-5 text-sm leading-relaxed">
            <li className="list-decimal">
              <strong>Teller jeg noe, eller måler jeg noe?</strong> Telling ⇒ diskret. Måling ⇒
              kontinuerlig.
            </li>
            <li className="list-decimal">
              <strong>Er antall forsøk oppgitt?</strong> Ja ⇒ binomisk eller hypergeometrisk. Nei,
              bare en rate ⇒ Poisson.
            </li>
            <li className="list-decimal">
              <strong>Legges det tilbake?</strong> Ja, eller populasjonen er stor ⇒ binomisk. Nei, og
              populasjonen er liten ⇒ hypergeometrisk.
            </li>
            <li className="list-decimal">
              <strong>Er det et gjennomsnitt?</strong> Da er svaret normalfordeling via
              sentralgrenseteoremet, med standardfeil σ/√n — nesten uansett hva dataene kommer fra.
            </li>
          </ol>
          <p className="mb-4 leading-relaxed">
            Test deg selv i utfordringen under: du får et datasett og skal gjette hvilken fordeling
            det kom fra, og etterpå ser du hvor godt hver kandidat faktisk passer. Poenget er ikke å
            treffe hver gang — det er å bli kjent med hvordan formene ser ut, slik at
            oppgaveteksten begynner å høres ut som en fordeling.
          </p>
          <DistributionMatcher />
        </section>

        {/* --- Type 3: måloppgaver med tilstandssjekk ---------------------- */}
        <Maloppgaver id="maloppgaver" oppgaver={MALOPPGAVER} />

        {/* --- Type 4: feilsøking ------------------------------------------ */}
        <Feilsokingsoppgaver id="feilsoking" oppgaver={FEILSOKING} />

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
              Alt over dette punktet er det du trenger til 14. desember. Under ligger et kart over
              hvordan fordelingene henger sammen: binomisk blir Poisson når n vokser og p krymper,
              Poisson blir normal når λ blir stor, og eksponentialfordelingen er ventetiden mellom
              Poisson-hendelser. Ingen av sammenhengene blir spurt om direkte — men de forklarer
              hvorfor tilnærmingene i recall-kortene i det hele tatt fungerer, og de gjør de åtte
              fordelingene til én familie i stedet for åtte formler.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Verktøyet under er den samme velgeren som over, men brukt til et annet formål: sett to
              fordelinger til å ligne hverandre og se hvor tilnærmingen holder og hvor den slipper.
            </p>
            <FordelingerVisualizer />
          </div>
        </section>

        {/* --- Videre ------------------------------------------------------ */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">Videre herfra</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-modul4-inferens" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 font-medium text-brand hover:bg-brand/20"
            >
              Modul 4 — Inferens og regresjon
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-diskrete-fordelinger" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypende leksjon: diskrete fordelinger
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-kontinuerlige-fordelinger" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypende leksjon: kontinuerlige fordelinger
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-forventning-clt" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypende leksjon: forventning, varians og CLT
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
