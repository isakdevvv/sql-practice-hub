import { Link } from "@tanstack/react-router";
import { ArrowRight, Dice5, GitBranch, Grid3x3, Layers, Sparkles } from "lucide-react";
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
// Bygget for denne modulen: framdriftsplanen legger «mengdelære, Venn-diagram»
// til uke 34, og modulen hadde bare prosa om det.
import { VennMengdelab } from "./VennMengdelab";
import { NaturligeFrekvenser } from "@/components/stack/tek1-sannsynlighet/NaturligeFrekvenser";
import { ConditionalProbabilityGrid } from "@/components/stack/tek1-sannsynlighet/ConditionalProbabilityGrid";
import { BayesUpdater } from "@/components/stack/tek1-sannsynlighet/BayesUpdater";
import { ProbabilityTreeDiagram } from "@/components/stack/tek1-sannsynlighet/ProbabilityTreeDiagram";
import { MontyHallSimulator } from "@/components/stack/tek1-sannsynlighet/MontyHallSimulator";
import { UrnModelSimulator } from "@/components/stack/tek1-kombinatorikk/UrnModelSimulator";
import { PermutationVsCombinationTree } from "@/components/stack/tek1-kombinatorikk/PermutationVsCombinationTree";

// ---------------------------------------------------------------------------
// TEK-1501 Modul 2 — Sannsynlighet (spor B i plan-tek-1501.md, atomene B1–B9).
//
// Samme arkitektur som modul 1 (PLAN-HOST26-MODULER.md §3): anslå-så-sjekk FØR
// forklaringen → guidede simuleringer UNDER → måloppgaver med tilstandssjekk
// ETTER → feilsøking SIST → recall til slutt.
//
// Modulen er den mest intuisjons-fiendtlige i hele faget. Nesten alle de klassiske
// feilslutningene i statistikk bor her: base rate-neglekt, omvendt betinging,
// gambler's fallacy, og antatt uavhengighet. Derfor er anslagene og feilsøkingen
// tyngre vektet her enn i modul 1 — det er ikke formlene som er vanskelige, det er
// å oppdage at man har brukt feil formel.
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Symbolene først", anchor: "symboler" },
  { title: "Anslå — før du leser", anchor: "anslag" },
  { title: "Utfallsrom og hendelser", anchor: "utfallsrom" },
  { title: "Telle muligheter (interaktiv)", anchor: "kombinatorikk" },
  { title: "Trekning m/uten tilbakelegging (interaktiv)", anchor: "urne" },
  { title: "Betinget sannsynlighet (interaktiv)", anchor: "betinget" },
  { title: "Uavhengighet", anchor: "uavhengighet" },
  { title: "Sannsynlighetstre (interaktiv)", anchor: "tre" },
  { title: "Bayes (interaktiv)", anchor: "bayes" },
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
    tegn: "Ω",
    uttale: "omega (stor)",
    verden: "generelt",
    betydning: (
      <>
        <strong>Utfallsrommet</strong> — mengden av alt som i det hele tatt kan skje i forsøket. Ett
        terningkast har Ω = {"{1, 2, 3, 4, 5, 6}"}.
      </>
    ),
  },
  {
    tegn: "A, B",
    uttale: "a, be",
    verden: "generelt",
    betydning: (
      <>
        <strong>Hendelser</strong> — delmengder av Ω, altså «noe av det som kan skje». «Terningen
        viser partall» er hendelsen {"{2, 4, 6}"}.
      </>
    ),
  },
  {
    tegn: "P(A)",
    uttale: "pe av a",
    verden: "generelt",
    betydning: <>Sannsynligheten for at hendelsen A inntreffer. Alltid et tall mellom 0 og 1.</>,
  },
  {
    tegn: "Aᶜ",
    uttale: "a-komplement",
    verden: "generelt",
    betydning: (
      <>
        <strong>Komplementet</strong> — alt i Ω som <em>ikke</em> er A. Det gjelder alltid at{" "}
        <span className="font-mono">P(Aᶜ) = 1 − P(A)</span>, og den ene linja løser overraskende
        mange oppgaver.
      </>
    ),
  },
  {
    tegn: "A ∩ B",
    uttale: "a snitt be",
    verden: "generelt",
    betydning: (
      <>
        <strong>Snittet</strong> — begge inntreffer. På norsk: «A <em>og</em> B».
      </>
    ),
  },
  {
    tegn: "A ∪ B",
    uttale: "a union be",
    verden: "generelt",
    betydning: (
      <>
        <strong>Unionen</strong> — minst én av dem inntreffer. På norsk: «A <em>eller</em> B», og
        «eller» inkluderer her at begge skjer.
      </>
    ),
  },
  {
    tegn: "P(A | B)",
    uttale: "pe av a gitt be",
    verden: "generelt",
    betydning: (
      <>
        <strong>Betinget sannsynlighet</strong> — sannsynligheten for A når vi allerede vet at B har
        skjedd. Loddrett strek leses «gitt». Merk at dette er et helt annet tall enn P(B | A); å
        bytte om på dem er modulens dyreste feil.
      </>
    ),
  },
  {
    tegn: "n!",
    uttale: "en fakultet",
    verden: "generelt",
    betydning: (
      <>
        Produktet av alle heltall fra 1 til n: 5! = 5·4·3·2·1 = 120. Antall måter å stille n ulike
        ting i rekkefølge. Per definisjon er 0! = 1.
      </>
    ),
  },
  {
    tegn: "nPk",
    uttale: "en pe kå",
    verden: "generelt",
    betydning: (
      <>
        Antall <strong>ordnede</strong> utvalg av k blant n:{" "}
        <span className="font-mono">n! / (n − k)!</span>. Bruk den når rekkefølgen betyr noe.
      </>
    ),
  },
  {
    tegn: "nCk",
    uttale: "en se kå, eller «n over k»",
    verden: "generelt",
    betydning: (
      <>
        Antall <strong>uordnede</strong> utvalg av k blant n:{" "}
        <span className="font-mono">n! / (k!(n − k)!)</span>. Bruk den når rekkefølgen er
        likegyldig. Skrives også <span className="font-mono">C(n, k)</span>.
      </>
    ),
  },
];

// ===========================================================================
// Type 1 — ANSLÅ-SÅ-SJEKK. Seks stykker, alle før forklaringen.
// ===========================================================================

const ANSLAG: Anslag[] = [
  {
    id: "m2-a1",
    tema: "Betinget sannsynlighet — medisinsk test",
    sporsmal: (
      <>
        En sykdom finnes hos <strong>0,5 %</strong> av befolkningen. En test finner sykdommen hos{" "}
        <strong>99 %</strong> av dem som har den, og gir riktig svar hos <strong>95 %</strong> av
        dem som ikke har den. Du tester tilfeldig positivt. Hvor sannsynlig er det at du faktisk er
        syk?
      </>
    ),
    alternativer: [
      { id: "a", label: "Rundt 99 % — testen er jo 99 % sikker" },
      { id: "b", label: "Rundt 95 %" },
      { id: "c", label: "Rundt 50 %" },
      { id: "d", label: "Rundt 9 %" },
    ],
    riktigId: "d",
    fasit: (
      <>
        Cirka <strong>9 %</strong>. Tenk på 100 000 personer. 500 er syke, og 495 av dem tester
        positivt. 99 500 er friske, men 5 % av dem — altså 4 975 personer — tester positivt likevel.
        Blant de 495 + 4 975 = 5 470 positive er bare 495 faktisk syke: 495 / 5 470 ≈ 0,0905. De
        falske positive drukner de ekte, rett og slett fordi det er så mange flere friske å ta feil
        av.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi hører «99 % sikker test» og leser det som «99 % sannsynlig at jeg er syk». Men tallet 99
        % er P(positiv | syk) — sannsynligheten for utslag <em>gitt</em> sykdom. Spørsmålet ditt er
        P(syk | positiv), som er den motsatte betingingen. De to er bare like når sykdommen er
        omtrent like vanlig som den er uvanlig.
      </>
    ),
  },
  {
    id: "m2-a2",
    tema: "Kombinatorikk — bursdagsproblemet",
    sporsmal: (
      <>
        Det er <strong>23 tilfeldige personer</strong> i et rom. Hvor sannsynlig er det at minst to
        av dem har bursdag på samme dato?
      </>
    ),
    alternativer: [
      { id: "a", label: "Rundt 5 % — 23 av 365 er jo veldig få" },
      { id: "b", label: "Rundt 12 %" },
      { id: "c", label: "Rundt 30 %" },
      { id: "d", label: "Rundt 50 %" },
    ],
    riktigId: "d",
    fasit: (
      <>
        Litt over <strong>50 %</strong> (50,7 %). Nøkkelen er at det ikke finnes 23 muligheter, men
        23 over 2 = <strong>253 par</strong> av personer som kan matche. Regnestykket går via
        komplementet: sannsynligheten for at <em>alle</em> har ulike datoer er 365/365 · 364/365 ·
        363/365 · … · 343/365 ≈ 0,493, og svaret er 1 − 0,493.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi sammenligner ubevisst med et annet spørsmål: «hvor sannsynlig er det at noen har bursdag
        samme dag som <em>meg</em>?» Der er det bare 22 sammenligninger, og svaret er de ~6 % vi
        føler. Antall par vokser kvadratisk i antall personer, og intuisjonen vår teller lineært.
      </>
    ),
  },
  {
    id: "m2-a3",
    tema: "Uavhengighet — myntkast",
    sporsmal: (
      <>
        Du kaster en ærlig mynt åtte ganger, og får <strong>kron alle åtte gangene</strong>. Hva er
        sannsynligheten for kron på det niende kastet?
      </>
    ),
    alternativer: [
      { id: "a", label: "Under 50 % — mynten «skylder» oss en mynt nå" },
      { id: "b", label: "Nøyaktig 50 %" },
      { id: "c", label: "Over 50 % — den er tydeligvis skjev mot kron" },
      { id: "d", label: "1 / 2⁹, altså under 0,2 %" },
    ],
    riktigId: "b",
    fasit: (
      <>
        Fortsatt nøyaktig <strong>50 %</strong>. Mynten har ingen hukommelse. Det er sant at
        sannsynligheten for ni kron <em>på rad, sett på forhånd</em>, er 1/2⁹ ≈ 0,2 % — men de åtte
        første har allerede skjedd, og de koster ingenting lenger. Formelt: kastene er uavhengige,
        så P(kron | åtte kron før) = P(kron) = 0,5.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Dette er «gambler's fallacy». Vi vet at lange serier er sjeldne, og konkluderer at serien
        «må» ta slutt. Men det som er sjeldent, er å <em>starte</em> en slik serie. Når du allerede
        står midt i den, er du forbi det sjeldne. Alternativ d er forresten svaret på et annet,
        gyldig spørsmål — bare ikke dette.
      </>
    ),
  },
  {
    id: "m2-a4",
    tema: "Uordnet telling — håndtrykk",
    sporsmal: (
      <>
        Ti personer møtes, og <strong>alle hilser på alle</strong> nøyaktig én gang. Hvor mange
        håndtrykk blir det til sammen?
      </>
    ),
    alternativer: [
      { id: "a", label: "20" },
      { id: "b", label: "45" },
      { id: "c", label: "90" },
      { id: "d", label: "100" },
    ],
    riktigId: "b",
    fasit: (
      <>
        <strong>45.</strong> Hver person hilser på ni andre, som gir 10 · 9 = 90 — men da har vi
        talt hvert håndtrykk to ganger (én gang fra hver hånd). Svaret er 90/2 = 45, som er nøyaktig
        10C2: antall måter å velge 2 av 10 når rekkefølgen ikke betyr noe. Et håndtrykk mellom Ada
        og Bo er det samme som mellom Bo og Ada.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        90 er svaret på det ordnede spørsmålet — antall <em>par med retning</em>. Hele forskjellen
        mellom nPk og nCk er faktoren k! som fjerner de rekkefølgene vi ikke vil telle. Her er k =
        2, så vi deler på 2! = 2.
      </>
    ),
  },
  {
    id: "m2-a5",
    tema: "Like sannsynlige utfall",
    sporsmal: (
      <>
        I Lotto trekkes 7 tall blant 34. Hva er mest sannsynlig å bli trukket:{" "}
        <strong>1-2-3-4-5-6-7</strong>, eller en spredt rekke som{" "}
        <strong>3-11-17-22-28-30-33</strong>?
      </>
    ),
    alternativer: [
      { id: "a", label: "Den spredte rekka — den ser mye mer tilfeldig ut" },
      { id: "b", label: "1-2-3-4-5-6-7 — sammenhengende tall er lettere å trekke" },
      { id: "c", label: "Nøyaktig like sannsynlige" },
      { id: "d", label: "Den spredte, men bare marginalt" },
    ],
    riktigId: "c",
    fasit: (
      <>
        <strong>Nøyaktig like sannsynlige</strong> — begge har sannsynlighet 1 / 5 379 616.
        Trekningen ser bare på hvilke kuler som kommer ut, ikke på om resultatet ser mønstret ut for
        oss. Det som <em>er</em> sant, er at det finnes ekstremt mange flere «spredte» rekker enn
        «pene» rekker, så du vil nesten alltid <em>se</em> en spredt rekke. Men det er en påstand om
        en stor gruppe av rekker, ikke om én bestemt rekke.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi forveksler en <em>enkelt hendelse</em> med den <em>klassen</em> den tilhører. Det er en
        generell felle i hele modulen, og den kommer igjen når vi skal telle: første spørsmål er
        alltid «hvor mange enkeltutfall er det, og teller jeg dem én eller flere ganger?».
      </>
    ),
  },
  {
    id: "m2-a6",
    tema: "Betinget — to barn",
    sporsmal: (
      <>
        En familie har to barn. Du får vite at <strong>minst ett av dem er jente</strong>. Hva er
        sannsynligheten for at begge er jenter? (Anta at gutt og jente er like sannsynlig og
        uavhengig per barn.)
      </>
    ),
    alternativer: [
      { id: "a", label: "1/2" },
      { id: "b", label: "1/3" },
      { id: "c", label: "1/4" },
      { id: "d", label: "2/3" },
    ],
    riktigId: "b",
    fasit: (
      <>
        <strong>1/3.</strong> Skriv ut utfallsrommet med eldst først: JJ, JG, GJ, GG — fire like
        sannsynlige utfall. Opplysningen «minst én jente» stryker GG, så vi står igjen med tre like
        sannsynlige utfall: JJ, JG, GJ. Bare ett av dem har to jenter.
      </>
    ),
    hvorforBommerIntuisjonen: (
      <>
        Vi hører opplysningen som «ett bestemt barn er jente» — og da <em>er</em> svaret 1/2, fordi
        det andre barnet er uavhengig. «Minst én» sier derimot ikke hvilket, og beholder derfor to
        blandede utfall i stedet for ett. Dette er kjernen i betinging: informasjon virker ved å{" "}
        <em>krympe utfallsrommet</em>, og nøyaktig hvilke utfall som blir strøket avgjør svaret.
      </>
    ),
  },
];

// ===========================================================================
// Type 3 — MÅLOPPGAVER med tilstandssjekk (metode + tall, hver for seg).
// ===========================================================================

const MALOPPGAVER: MaloppgaveData[] = [
  {
    id: "m2-o1",
    tittel: "Lotto — hvor mange rekker finnes?",
    oppgave: (
      <>
        I Lotto trekkes <strong>7 tall blant 34</strong>. Rekkefølgen tallene trekkes i har ingen
        betydning for om du har vunnet. Hvor mange ulike rekker finnes det?
      </>
    ),
    data: <>n = 34, k = 7, rekkefølgen betyr ikke noe</>,
    metoder: [
      {
        id: "komb",
        label: "Kombinasjoner: nCk = n! / (k!(n − k)!)",
      },
      {
        id: "perm",
        label: "Permutasjoner: nPk = n! / (n − k)!",
        hvorforFeil:
          "Da teller du hver rekke én gang for hver rekkefølge tallene kunne kommet ut i — altså 7! = 5040 ganger for mye. Svaret ditt blir 27 113 264 640 i stedet for 5 379 616.",
      },
      {
        id: "potens",
        label: "Med tilbakelegging: n^k = 34⁷",
        hvorforFeil:
          "34⁷ forutsetter at samme kule kan trekkes flere ganger, og at rekkefølgen teller. I Lotto legges ikke kulene tilbake, og rekkefølgen er likegyldig — begge deler er galt her.",
      },
    ],
    riktigMetodeId: "komb",
    fasit: { verdi: 5379616, toleranse: 0.5, desimaler: 0 },
    svarEtikett: "Antall rekker =",
    utregning: (
      <>
        <p>
          <strong>1. Velg formel.</strong> Uten tilbakelegging (en kule trekkes ikke to ganger) og
          uten rekkefølge (7-3-1 er samme rekke som 1-3-7) ⇒ kombinasjoner.
        </p>
        <p className="mt-1">
          <strong>2. Sett inn:</strong> <span className="font-mono">34C7 = 34! / (7! · 27!)</span>
        </p>
        <p className="mt-1">
          <strong>3. Forkort før du regner.</strong> Alt fra 27! og ned stryker mot 34!, så det som
          står igjen er <span className="font-mono">(34·33·32·31·30·29·28) / (7·6·5·4·3·2·1)</span>.
        </p>
        <p className="mt-1">
          <strong>4. Regn:</strong> teller = 27 113 264 640, nevner = 5 040, som gir{" "}
          <span className="font-mono">5 379 616</span>.
        </p>
        <p className="mt-2 text-muted-foreground">
          Forkortingen i steg 3 er ikke et triks for å spare tid — den er nødvendig. 34! er rundt
          3·10³⁸, og en lommekalkulator mister presisjon eller gir overflyt hvis du prøver å regne
          teller og nevner hver for seg.
        </p>
      </>
    ),
  },
  {
    id: "m2-o2",
    tittel: "PIN-koder med fire ulike sifre",
    oppgave: (
      <>
        Hvor mange fire-sifrede PIN-koder kan lages av sifrene 0–9 hvis{" "}
        <strong>ingen siffer får gjentas</strong>?
      </>
    ),
    data: <>n = 10 sifre, k = 4 posisjoner, ingen gjentakelse</>,
    metoder: [
      {
        id: "perm",
        label: "Permutasjoner: nPk = n! / (n − k)!",
      },
      {
        id: "komb",
        label: "Kombinasjoner: nCk = n! / (k!(n − k)!)",
        hvorforFeil:
          "Kombinasjoner ser bort fra rekkefølge, men 1234 og 4321 er to forskjellige PIN-koder. Du får 210 i stedet for 5040 — nøyaktig 4! = 24 ganger for lite.",
      },
      {
        id: "potens",
        label: "n^k = 10⁴",
        hvorforFeil:
          "10⁴ = 10 000 er svaret når gjentakelse ER lov (den vanlige PIN-koden). Her er gjentakelse forbudt, så antall valg krymper for hver posisjon: 10, så 9, så 8, så 7.",
      },
    ],
    riktigMetodeId: "perm",
    fasit: { verdi: 5040, toleranse: 0.5, desimaler: 0 },
    svarEtikett: "Antall koder =",
    utregning: (
      <>
        <p>
          <strong>1. Rekkefølgen teller</strong> (1234 ≠ 4321), og{" "}
          <strong>gjentakelse er forbudt</strong> ⇒ ordnet utvalg uten tilbakelegging, altså nPk.
        </p>
        <p className="mt-1">
          <strong>2.</strong>{" "}
          <span className="font-mono">10P4 = 10! / 6! = 10 · 9 · 8 · 7 = 5040</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Legg merke til at tellingen «10 valg, så 9, så 8, så 7» er hele utledningen av formelen.
          Du trenger strengt tatt aldri å huske nPk — hvis du klarer å beskrive valgene i
          rekkefølge, faller produktet ut av seg selv.
        </p>
      </>
    ),
  },
  {
    id: "m2-o3",
    tittel: "Bayes — hva betyr en positiv test?",
    oppgave: (
      <>
        Dette er anslag 1, nå regnet ut. En sykdom rammer <strong>0,5 %</strong> av befolkningen.
        Testen gir utslag hos <strong>99 %</strong> av de syke (sensitiviteten), og gir riktig
        negativt svar hos <strong>95 %</strong> av de friske (spesifisiteten). En tilfeldig person
        tester positivt. Regn ut sannsynligheten for at personen faktisk er syk.
      </>
    ),
    data: (
      <>
        P(syk) = 0,005 · P(positiv | syk) = 0,99 · P(negativ | frisk) = 0,95, altså P(positiv |
        frisk) = 0,05
      </>
    ),
    metoder: [
      {
        id: "bayes",
        label:
          "Bayes: P(syk | positiv) = P(positiv | syk)·P(syk) / P(positiv), med total sannsynlighet i nevneren",
      },
      {
        id: "sensitivitet",
        label: "Svaret er sensitiviteten, altså 0,99",
        hvorforFeil:
          "Sensitiviteten er P(positiv | syk) — sannsynligheten for utslag gitt at du er syk. Spørsmålet er den motsatte betingingen, P(syk | positiv). Å bytte om de to er den enkeltfeilen som gjør denne oppgavetypen berømt.",
      },
      {
        id: "produkt",
        label: "Multiplisér prevalens og sensitivitet: 0,005 · 0,99",
        hvorforFeil:
          "Det gir P(syk OG positiv) = 0,00495, altså andelen av HELE befolkningen som både er syk og tester positivt. Du mangler siste steg: å dele på andelen som tester positivt i det hele tatt.",
      },
    ],
    riktigMetodeId: "bayes",
    fasit: { verdi: 0.0905, toleranse: 0.002, desimaler: 4 },
    svarEtikett: "P(syk | positiv) =",
    utregning: (
      <>
        <p>
          <strong>1. Teller — de ekte positive:</strong>{" "}
          <span className="font-mono">P(positiv | syk) · P(syk) = 0,99 · 0,005 = 0,00495</span>
        </p>
        <p className="mt-1">
          <strong>2. Nevner — alle positive, uansett årsak.</strong> Her brukes setningen om total
          sannsynlighet: en positiv test kommer enten fra en syk eller fra en frisk.
          <br />
          <span className="font-mono">
            P(positiv) = 0,99 · 0,005 + 0,05 · 0,995 = 0,00495 + 0,04975 = 0,0547
          </span>
        </p>
        <p className="mt-1">
          <strong>3. Del:</strong> <span className="font-mono">0,00495 / 0,0547 ≈ 0,0905</span>,
          altså cirka 9 %.
        </p>
        <p className="mt-2 text-muted-foreground">
          Se på de to leddene i nevneren: 0,00495 mot 0,04975. De falske positive er ti ganger så
          mange som de ekte, utelukkende fordi det er 199 friske per syk. Det er hele forklaringen
          på det kontraintuitive svaret — og grunnen til at prevalensen aldri kan utelates fra
          regnestykket.
        </p>
      </>
    ),
  },
  {
    id: "m2-o4",
    tittel: "Minst én komponent svikter",
    oppgave: (
      <>
        Et system har <strong>fire komponenter</strong> som svikter uavhengig av hverandre. Hver
        enkelt svikter med sannsynlighet <strong>0,03</strong> i løpet av et år. Hva er
        sannsynligheten for at <strong>minst én</strong> av dem svikter i løpet av året?
      </>
    ),
    data: <>n = 4 uavhengige komponenter, P(svikt per komponent) = 0,03</>,
    metoder: [
      {
        id: "komplement",
        label: "Komplementregelen: 1 − P(ingen svikter) = 1 − 0,97⁴",
      },
      {
        id: "sum",
        label: "Legg sammen: 4 · 0,03 = 0,12",
        hvorforFeil:
          "Addisjon uten korreksjon teller tilfellene der flere svikter samtidig flere ganger. Her blir feilen liten (0,12 mot 0,1147), men metoden er prinsipielt gal — med P = 0,3 per komponent ville den gitt 1,2, altså en «sannsynlighet» over 1.",
      },
      {
        id: "produkt",
        label: "Multiplisér: 0,03⁴",
        hvorforFeil:
          "0,03⁴ = 0,00000081 er sannsynligheten for at ALLE fire svikter samtidig, ikke at minst én gjør det. Multiplikasjon av sviktsannsynlighetene svarer på «og», ikke på «minst én».",
      },
    ],
    riktigMetodeId: "komplement",
    fasit: { verdi: 0.1147, toleranse: 0.001, desimaler: 4 },
    svarEtikett: "P(minst én svikter) =",
    utregning: (
      <>
        <p>
          <strong>1. Snu spørsmålet.</strong> «Minst én» har mange utfall (én, to, tre eller fire
          svikter). Komplementet har bare ett: ingen svikter. Det er alltid det lettere
          regnestykket.
        </p>
        <p className="mt-1">
          <strong>2. Ingen svikter.</strong> Uavhengighet gjør at vi kan multiplisere:{" "}
          <span className="font-mono">0,97⁴ = 0,88529</span>
        </p>
        <p className="mt-1">
          <strong>3. Trekk fra 1:</strong>{" "}
          <span className="font-mono">1 − 0,88529 = 0,11471 ≈ 0,1147</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Regelen å ta med seg: når oppgaven sier «minst én», skriv{" "}
          <span className="font-mono">1 − P(ingen)</span> før du gjør noe annet. Uten uavhengighet
          gjelder derimot ikke steg 2 — da kan du ikke bare multiplisere.
        </p>
      </>
    ),
  },
  {
    id: "m2-o5",
    tittel: "To røde kuler uten tilbakelegging",
    oppgave: (
      <>
        En urne inneholder <strong>12 kuler: 5 røde og 7 blå</strong>. Du trekker{" "}
        <strong>to kuler uten tilbakelegging</strong>. Hva er sannsynligheten for at begge er røde?
      </>
    ),
    data: <>N = 12 kuler, 5 røde, 2 trekk, ingen tilbakelegging</>,
    metoder: [
      {
        id: "uten",
        label: "Multiplikasjonssetningen med betinging: P(rød₁) · P(rød₂ | rød₁)",
      },
      {
        id: "med",
        label: "Med tilbakelegging: (5/12)²",
        hvorforFeil:
          "Da later du som om den første kula legges tilbake, slik at urnen er uendret ved andre trekk. Svaret blir 0,1736 i stedet for 0,1515 — for høyt, fordi det andre trekket i virkeligheten har én rød kule mindre å ta av.",
      },
      {
        id: "add",
        label: "Addisjon: 5/12 + 4/11",
        hvorforFeil:
          "Addisjon svarer på «minst én av delene», ikke på «begge deler». «Og» gir multiplikasjon; «eller» gir addisjon. Her ville svaret dessuten blitt 0,78, som er åpenbart for stort.",
      },
    ],
    riktigMetodeId: "uten",
    fasit: { verdi: 0.1515, toleranse: 0.002, desimaler: 4 },
    svarEtikett: "P(begge røde) =",
    utregning: (
      <>
        <p>
          <strong>1. Første trekk:</strong> <span className="font-mono">P(rød₁) = 5/12</span>
        </p>
        <p className="mt-1">
          <strong>2. Andre trekk, gitt at det første var rødt.</strong> Nå er det 11 kuler igjen,
          hvorav 4 røde: <span className="font-mono">P(rød₂ | rød₁) = 4/11</span>
        </p>
        <p className="mt-1">
          <strong>3. Multiplikasjonssetningen:</strong>{" "}
          <span className="font-mono">P(rød₁ ∩ rød₂) = (5/12) · (4/11) = 20/132 ≈ 0,1515</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Samme svar via kombinatorikk:{" "}
          <span className="font-mono">5C2 / 12C2 = 10 / 66 ≈ 0,1515</span>. At de to veiene møtes er
          ikke tilfeldig — det er samme telling sett fra to kanter, og det er verdt å kunne begge,
          fordi eksamensoppgaver er formulert i begge språk.
        </p>
      </>
    ),
  },
];

// ===========================================================================
// Type 4 — FEILSØKING. Fire ferdige resonnementer som ender galt.
// ===========================================================================

const FEILSOKING: Feilsoking[] = [
  {
    id: "m2-f1",
    tittel: "«Testen er 99 % sikker, så jeg er nesten sikkert syk»",
    feilnavn: "Omvendt betinging (P(A|B) forvekslet med P(B|A))",
    situasjon: (
      <>
        En pasient har testet positivt på screeningtesten fra oppgave 3, og skriver følgende i et
        innlegg. Konklusjonen er feil — hvor går det galt?
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Sykdommen finnes hos 0,5 % av befolkningen, så P(syk) = 0,005.",
        vurdering:
          "Dette holder. Prevalensen er den marginale sannsynligheten for sykdom før vi vet noe om testen, og 0,5 % = 0,005 er korrekt omgjort.",
      },
      {
        id: "l2",
        tekst: "Testen fanger opp 99 % av de syke, altså P(positiv | syk) = 0,99.",
        vurdering:
          "Dette holder også, og det er verdt å merke seg hvor presist det er skrevet: betingingen står på riktig side av streken. Sensitiviteten ER P(positiv | syk).",
      },
      {
        id: "l3",
        tekst: "Jeg testet positivt. Sannsynligheten for at jeg er syk er derfor 0,99.",
        vurdering:
          "Her er feilen. Leddet over ga P(positiv | syk). Setningen her påstår P(syk | positiv). Det er to helt forskjellige størrelser, og de er bare like når P(syk) = P(positiv) — noe som er langt fra tilfellet her. Riktig verktøy er Bayes, som binder de to sammen via prevalensen: P(syk | positiv) = P(positiv | syk)·P(syk) / P(positiv) ≈ 0,09.",
      },
      {
        id: "l4",
        tekst: "Jeg bør derfor forberede meg på et sykdomsforløp.",
        vurdering:
          "Denne følger logisk av leddet før, og er ikke i seg selv en tankefeil — den arver bare feilen ovenfor. Med det riktige tallet (9 %) ville den rimelige konklusjonen vært å ta en oppfølgende, mer spesifikk test.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Regn ut nevneren først. Blant 100 000 personer tester 495 syke positivt og 4 975 friske
        positivt. Andelen ekte blant de positive er 495 / 5 470 ≈ <strong>9 %</strong>. Testen har
        altså flyttet troen på sykdom fra 0,5 % til 9 % — en attendobling, som er mye, men langt fra
        «nesten sikkert». Huskeregelen:{" "}
        <strong>
          så snart en oppgave gir deg P(B | A) og spør etter P(A | B), er det Bayes, og prevalensen
          kan aldri utelates.
        </strong>
      </>
    ),
  },
  {
    id: "m2-f2",
    tittel: "«Rødt er overdue på ruletten»",
    feilnavn: "Gambler's fallacy (uavhengighet oversett)",
    situasjon: (
      <>
        En spiller har notert de siste spinnene på et rulettbord og skriver ned strategien sin slik.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Hjulet har 18 røde, 18 svarte og én grønn rute, så P(rød) = 18/37 på hvert spinn.",
        vurdering:
          "Dette holder. Utfallsrommet er talt riktig, og den grønne nullen er tatt med — den er nettopp grunnen til at rødt er litt under 50 %.",
      },
      {
        id: "l2",
        tekst: "De siste åtte spinnene har alle vist svart.",
        vurdering:
          "Dette er en ren observasjon, og den er ikke feil. Den er faktisk uvanlig: (19/37)⁸ ≈ 0,4 % hvis vi ser den på forhånd. Men «uvanlig» og «umulig» er ikke det samme, og en serie som allerede har skjedd har sannsynlighet 1.",
      },
      {
        id: "l3",
        tekst: "Sannsynligheten for ni svarte på rad er svært lav, bare rundt 0,2 %.",
        vurdering:
          "Selve tallet er riktig regnet, og påstanden er sann — som utsagn om ni spinn sett på forhånd. Leddet er ikke feilen i seg selv. Feilen oppstår først når dette tallet brukes om det niende spinnet alene.",
      },
      {
        id: "l4",
        tekst: "Derfor er sannsynligheten for rødt på neste spinn nå langt over 50 %.",
        vurdering:
          "Her er feilen. Hjulet har ingen hukommelse: spinnene er uavhengige, så P(rød | åtte svarte) = P(rød) = 18/37 ≈ 48,6 %. Tallet fra forrige ledd gjaldt hele serien på ni sett fra start. Nå er de åtte første allerede realisert, og betinget på dem sitter du igjen med ett vanlig spinn.",
      },
      {
        id: "l5",
        tekst: "Jeg dobler derfor innsatsen på rødt.",
        vurdering:
          "Konsekvensen av feilen over. Med riktig sannsynlighet er forventet gevinst negativ uansett innsats — og dobling endrer bare størrelsen på tapet, ikke fortegnet.",
      },
    ],
    feilLeddId: "l4",
    riktigResonnement: (
      <>
        Formelt: hendelsene er uavhengige, og da er{" "}
        <span className="font-mono">P(A | B) = P(A)</span> per definisjon. Historikken er irrelevant
        informasjon. Testen du kan bruke for å avsløre feilen hos deg selv:{" "}
        <em>hvilken fysisk mekanisme skulle overføre informasjon fra forrige spinn til neste?</em>{" "}
        Finnes den ikke, er hendelsene uavhengige. (Motsatt: trekker du kort fra en kortstokk{" "}
        <em>uten</em> å legge tilbake, finnes mekanismen — kortet er borte — og da er de ikke
        uavhengige.)
      </>
    ),
  },
  {
    id: "m2-f3",
    tittel: "«To dødsfall i samme familie kan ikke være tilfeldig»",
    feilnavn: "Antatt uavhengighet der den ikke gjelder",
    situasjon: (
      <>
        En sakkyndig skal vurdere om to plutselige spedbarnsdødsfall i samme familie kan skyldes
        tilfeldighet, og resonnerer slik i retten.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst:
          "Ett tilfelle av krybbedød forekommer hos omtrent 1 av 8500 spedbarn i denne gruppen.",
        vurdering:
          "Dette holder som utgangspunkt — det er en marginal rate hentet fra statistikk, og den kan diskuteres empirisk, men den er ikke en logisk feil.",
      },
      {
        id: "l2",
        tekst:
          "Sannsynligheten for to slike dødsfall i samme familie er derfor (1/8500)² ≈ 1 av 73 millioner.",
        vurdering:
          "Her er feilen. Å multiplisere krever uavhengighet, og to barn i samme familie deler gener, bomiljø, røykevaner i hjemmet og sovevaner. Hvis familien har en ukjent risikofaktor, er P(andre dødsfall | første dødsfall) mye høyere enn 1/8500 — kanskje ti ganger så høy. Riktig regnestykke er P(A) · P(B | A), og multiplikasjon med P(B) alene er et spesialtilfelle som må begrunnes, ikke antas.",
      },
      {
        id: "l3",
        tekst: "En så liten sannsynlighet betyr at tilfeldighet praktisk talt kan utelukkes.",
        vurdering:
          "Dette leddet arver feilen over, men inneholder også en egen svakhet: en liten sannsynlighet under én hypotese sier ingenting alene. Den må sammenlignes med sannsynligheten for de samme dataene under alternativhypotesen — og hvis også den er svært liten, er ikke sammenligningen avgjørende.",
      },
      {
        id: "l4",
        tekst: "Dødsfallene må derfor ha en annen forklaring enn naturlige årsaker.",
        vurdering:
          "Konklusjonen som følger av de to leddene over. Merk at dette er samme omvendte betinging som i første feilsøkingsoppgave, i ny drakt: fra P(data | uskyldig) er liten sluttes P(uskyldig | data) er liten.",
      },
    ],
    feilLeddId: "l2",
    riktigResonnement: (
      <>
        Bruk <span className="font-mono">P(A ∩ B) = P(A) · P(B | A)</span> — den gjelder alltid. Den
        forenklede formen <span className="font-mono">P(A) · P(B)</span> gjelder kun når hendelsene
        faktisk er uavhengige, og for søsken i samme hjem er de nesten sikkert ikke det. Sjekklisten
        før du multipliserer to sannsynligheter:{" "}
        <strong>deler de to hendelsene noen felles årsak?</strong> Gjør de det, må du betinge. Dette
        resonnementet er ikke konstruert for oppgavens skyld — varianter av det har ført til reelle
        justismord.
      </>
    ),
  },
  {
    id: "m2-f4",
    tittel: "«Vi kan sette sammen 336 ulike komiteer»",
    feilnavn: "Ordnet telling der rekkefølgen ikke betyr noe",
    situasjon: (
      <>
        En studentforening skal velge en komité på tre personer blant åtte kandidater. Alle tre får
        samme rolle. Sekretæren regner ut antall mulige komiteer slik.
      </>
    ),
    ledd: [
      {
        id: "l1",
        tekst: "Det er åtte kandidater, og vi skal velge tre av dem.",
        vurdering:
          "Dette holder. Oppgaven er riktig oppfattet: n = 8, k = 3, og ingen kandidat kan velges to ganger.",
      },
      {
        id: "l2",
        tekst: "Til første plass har vi 8 valg, til andre 7 og til tredje 6.",
        vurdering:
          "Regnestykket er riktig så langt — men legg merke til ordet «plass». Det smugler inn en rekkefølge som oppgaven ikke har. Hvis de tre hadde hatt ulike roller (leder, kasserer, sekretær), ville dette vært helt korrekt.",
      },
      {
        id: "l3",
        tekst: "Antall mulige komiteer er derfor 8 · 7 · 6 = 336.",
        vurdering:
          "Her er feilen. 336 teller ordnede utvalg. Komiteen {Ada, Bo, Cato} er talt seks ganger — én gang for hver av de 3! = 6 rekkefølgene de kunne blitt valgt i. Siden alle tre har samme rolle, er det én og samme komité.",
      },
      {
        id: "l4",
        tekst: "Vi trenger altså å vurdere 336 alternativer før avstemningen.",
        vurdering:
          "Følger av leddet over. Med riktig telling er tallet 56, som er en ganske annen arbeidsmengde.",
      },
    ],
    feilLeddId: "l3",
    riktigResonnement: (
      <>
        Del på antall rekkefølger du har overtalt:{" "}
        <span className="font-mono">8C3 = (8 · 7 · 6) / 3! = 336 / 6 = 56</span>. Spørsmålet som
        avgjør hver eneste kombinatorikkoppgave er ett:{" "}
        <strong>hvis jeg bytter om på to av de valgte, har jeg da fått noe nytt?</strong> Ja ⇒
        permutasjon (nPk). Nei ⇒ kombinasjon (nCk). Her ville en ombytting gitt samme komité, så vi
        deler på k!.
      </>
    ),
  },
];

// ===========================================================================
// Type 5 — RECALL. Kun det som må sitte i hodet uten utledning.
// ===========================================================================

const RECALL: RecallKort[] = [
  {
    id: "m2-r1",
    kategori: "formel",
    sporsmal: "Skriv addisjonssetningen for P(A ∪ B).",
    svar: (
      <>
        <span className="font-mono">P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</span>. Snittet trekkes fra
        fordi det ellers telles i begge leddene.
      </>
    ),
    hvorforUtenat:
      "Grunnregel som brukes i nesten alle oppgaver med «eller»; å glemme minusleddet gir sannsynligheter over 1.",
  },
  {
    id: "m2-r2",
    kategori: "formel",
    sporsmal: "Skriv definisjonen av betinget sannsynlighet P(A | B).",
    svar: (
      <>
        <span className="font-mono">P(A | B) = P(A ∩ B) / P(B)</span>, forutsatt P(B) &gt; 0. Vi
        krymper utfallsrommet til B, og spør hvor stor del av det nye rommet som er A.
      </>
    ),
    hvorforUtenat:
      "Alt i modulen — multiplikasjonssetningen, uavhengighet og Bayes — er omskrivinger av denne ene linja.",
  },
  {
    id: "m2-r3",
    kategori: "formel",
    sporsmal: "Skriv multiplikasjonssetningen for P(A ∩ B).",
    svar: (
      <>
        <span className="font-mono">P(A ∩ B) = P(A) · P(B | A)</span> — og den gjelder{" "}
        <em>alltid</em>. Bare når A og B er uavhengige forenkles den til{" "}
        <span className="font-mono">P(A) · P(B)</span>.
      </>
    ),
    hvorforUtenat:
      "Den generelle formen er den du bør ha i hodet; den forenklede varianten er en felle når uavhengighet ikke er sjekket.",
  },
  {
    id: "m2-r4",
    kategori: "formel",
    sporsmal: "Skriv Bayes' teorem, med nevneren skrevet ut.",
    svar: (
      <>
        <span className="font-mono">P(A | B) = P(B | A)·P(A) / P(B)</span>, der nevneren oftest må
        bygges med setningen om total sannsynlighet:{" "}
        <span className="font-mono">P(B) = P(B | A)·P(A) + P(B | Aᶜ)·P(Aᶜ)</span>.
      </>
    ),
    hvorforUtenat:
      "Nevneren er der folk stopper. Å huske formelen uten den utskrevne nevneren hjelper ikke på eksamen.",
  },
  {
    id: "m2-r5",
    kategori: "definisjon",
    sporsmal: "Hva er den formelle testen på at A og B er uavhengige?",
    svar: (
      <>
        <span className="font-mono">P(A ∩ B) = P(A) · P(B)</span>. Ekvivalent:{" "}
        <span className="font-mono">P(A | B) = P(A)</span> — det å vite at B skjedde endrer ikke
        troen på A.
      </>
    ),
    hvorforUtenat:
      "Uavhengighet er en betingelse som må sjekkes eller begrunnes, ikke en antakelse man tar med seg gratis.",
  },
  {
    id: "m2-r6",
    kategori: "når-brukes-hva",
    sporsmal: "nPk eller nCk — hvordan avgjør du?",
    svar: (
      <>
        Spør: <strong>hvis jeg bytter om på to av de valgte, har jeg fått noe nytt?</strong> Ja ⇒
        rekkefølgen teller ⇒ <span className="font-mono">nPk = n!/(n−k)!</span>. Nei ⇒{" "}
        <span className="font-mono">nCk = n!/(k!(n−k)!)</span>. Forholdet mellom dem er alltid
        faktoren k!.
      </>
    ),
    hvorforUtenat:
      "Metodevalget er hele oppgaven i kombinatorikk; er det riktig, er utregningen mekanisk.",
  },
  {
    id: "m2-r7",
    kategori: "når-brukes-hva",
    sporsmal: "Oppgaven sier «minst én». Hva gjør du først?",
    svar: (
      <>
        Skriv <span className="font-mono">P(minst én) = 1 − P(ingen)</span>. «Minst én» har mange
        utfall, komplementet har ett. Ved uavhengighet blir P(ingen) et enkelt produkt.
      </>
    ),
    hvorforUtenat:
      "Ren mønstergjenkjenning som sparer mye tid, og som eksamensoppgaver bruker igjen og igjen.",
  },
  {
    id: "m2-r8",
    kategori: "felle",
    sporsmal: "Hvorfor er P(A | B) og P(B | A) ikke det samme?",
    svar: (
      <>
        De har ulike nevnere: den ene deler på P(B), den andre på P(A). P(positiv | syk) = 0,99 og
        P(syk | positiv) ≈ 0,09 i samme eksempel. Bayes er nettopp <em>vekslingskursen</em> mellom
        dem, og prevalensen er kursen.
      </>
    ),
    hvorforUtenat:
      "Den hyppigste feilslutningen i hele faget, og den dukker opp igjen i modul 4 som feiltolkning av p-verdien.",
  },
  {
    id: "m2-r9",
    kategori: "felle",
    sporsmal: "Disjunkte hendelser eller uavhengige hendelser — hva er forskjellen?",
    svar: (
      <>
        <strong>Disjunkte</strong> (uforenlige): kan ikke skje samtidig, P(A ∩ B) = 0.{" "}
        <strong>Uavhengige</strong>: P(A ∩ B) = P(A)·P(B). To hendelser med positiv sannsynlighet
        kan aldri være begge deler — er de disjunkte, gjør det å vite at B skjedde A umulig, og det
        er maksimal avhengighet.
      </>
    ),
    hvorforUtenat:
      "Ordene høres beslektet ut og blandes rutinemessig, men de peker på motsatte ting.",
  },
];

export function Modul2SannsynlighetPage() {
  return (
    <StackPageShell title="TEK-1501 Modul 2 — Sannsynlighet" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            TEK-1501 · Modul 2 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sannsynlighet — å regne på det som ennå ikke har skjedd
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Modul 1 beskrev data du allerede har målt. Denne modulen handler om det motsatte: å si
            noe om utfall før de inntreffer. Formlene er få og korte. Det vanskelige er å oppdage
            hvilken av dem situasjonen krever — og der bommer intuisjonen så systematisk at flere av
            feilene har egne navn.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-foreground">Slik er modulen bygget:</strong> du <em>anslår</em>{" "}
            først, uten hjelp. Så <em>ser</em> du hva som skjer i simulatorene. Så <em>regner</em>{" "}
            du selv, med sjekk på både metodevalg og tall. Til slutt <em>feilsøker</em> du ferdige
            resonnementer som er gale. Kortene nederst er bare sluttsjekken — de er ikke der du
            lærer stoffet.
          </div>
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Forutsetter modul 1.</strong> Skillet mellom utvalg
            og populasjon derfra er det samme skillet som går igjen her, i ny form: forskjellen
            mellom det som <em>faktisk skjedde</em> og det som <em>kunne ha skjedd</em>.
          </div>
          <ProvisoriskKapittelnote className="mt-3" modul="2" />
        </header>

        <CourseOutline courseId="tek1-modul2-sannsynlighet" steps={STEPS} />

        <div className="mt-10" />
        <Symboltavle id="symboler" symboler={SYMBOLER} />

        {/* --- Type 1: anslå-så-sjekk, FØR forklaringen -------------------- */}
        <AnslaSaSjekk
          id="anslag"
          anslag={ANSLAG}
          intro={
            <>
              Gjett før du leser videre. Denne modulen er der statistisk intuisjon bommer hardest —
              flere av spørsmålene under har svar som fortsatt overrasker folk som har regnet på dem
              i årevis. Ingenting telles, og et bom her er mer verdt enn en riktig gjetning.
            </>
          }
        />

        {/* --- Forklaring + type 2: guidede simuleringer ------------------- */}
        <section id="utfallsrom" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Layers className="h-5 w-5 text-brand" /> Utfallsrom, hendelser og de tre grunnreglene
          </h2>
          <p className="leading-relaxed">
            <strong>Utfallsrommet Ω</strong> er lista over alt som kan skje. En{" "}
            <strong>hendelse</strong> er en delmengde av den lista. Når alle enkeltutfall er like
            sannsynlige — terning, kortstokk, lodd — reduseres hele sannsynlighetsregning til
            telling: <span className="font-mono">P(A) = antall utfall i A / antall utfall i Ω</span>
            . Det er derfor kombinatorikk kommer først: du kan ikke regne brøken uten å kunne telle
            teller og nevner.
          </p>
          <p className="mt-2 leading-relaxed">
            Alt annet bygger på tre regler. <strong>Én:</strong> en sannsynlighet ligger alltid
            mellom 0 og 1. <strong>To:</strong> P(Ω) = 1, altså skjer <em>noe</em>.{" "}
            <strong>Tre:</strong> for hendelser som ikke kan inntreffe samtidig, legges
            sannsynlighetene sammen. Ut av den siste faller både addisjonssetningen{" "}
            <span className="font-mono">P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</span> og
            komplementregelen <span className="font-mono">P(Aᶜ) = 1 − P(A)</span>.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            Minusleddet i addisjonssetningen er ikke pynt: uten det telles utfallene som ligger i
            både A og B to ganger, og du kan ende med en «sannsynlighet» over 1. Det er en gratis
            feilsjekk å ta med seg gjennom hele faget — får du et tall utenfor [0, 1], har du gjort
            noe galt, alltid. Du trenger ikke tro meg på det: huk av «glem minusleddet» i laben
            under og dra sirklene til summen sprekker.
          </p>
          <VennMengdelab />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Arealene i figuren er ikke skjematiske — de regnes ut fra tallene du setter, så
            overlappet er nøyaktig P(A ∩ B). Dra snittet mot null, og sirklene glir fra hverandre av
            seg selv: det er hva <em>disjunkt</em> betyr. Legg også merke til at snittet er låst til
            et intervall. Nedre grense er ingen programmeringsdetalj — når P(A) + P(B) overstiger 1,{" "}
            <em>må</em> mengdene overlappe, for det er ikke plass til noe annet i Ω.
          </p>
        </section>

        <section id="kombinatorikk" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Dice5 className="h-5 w-5 text-brand" /> Å telle muligheter
          </h2>
          <p className="mb-3 leading-relaxed">
            To spørsmål avgjør hvilken telleformel du skal bruke, og de er de eneste to spørsmålene
            som finnes:
          </p>
          <ol className="mb-4 space-y-2 pl-5 text-sm leading-relaxed">
            <li className="list-decimal">
              <strong>Kan samme element velges flere ganger?</strong> Legges kula tilbake i urnen,
              eller ikke?
            </li>
            <li className="list-decimal">
              <strong>Betyr rekkefølgen noe?</strong> Hvis du bytter om på to av de valgte — har du
              da fått noe nytt?
            </li>
          </ol>
          <p className="mb-4 leading-relaxed">
            Svarer du «nei, nei» får du <span className="font-mono">nCk</span> (håndtrykk,
            lottorekker, komiteer). «Nei, ja» gir <span className="font-mono">nPk</span> (PIN-koder
            uten gjentakelse, pallplasser). «Ja, ja» gir <span className="font-mono">n^k</span>{" "}
            (vanlige PIN-koder). Simulatoren under viser de to første side om side: samme n og k,
            ulikt svar, og du kan se nøyaktig hvilke rekkefølger som slås sammen når k! deles bort.
          </p>
          <PermutationVsCombinationTree />
        </section>

        <section id="urne" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">
            Med eller uten tilbakelegging — hvorfor det endrer alt
          </h2>
          <p className="mb-4 leading-relaxed">
            Legges kula tilbake, er trekkene <em>uavhengige</em>: urnen er identisk hver gang, og du
            kan multiplisere de samme sannsynlighetene. Legges den ikke tilbake, endrer det første
            trekket vilkårene for det andre, og du må bruke en <em>betinget</em> sannsynlighet i
            andre faktor. Dette er det enkleste stedet i faget å se hva betinging faktisk gjør, så
            bruk litt tid på simulatoren: skru tilbakelegging av og på, og følg med på hvordan andre
            trekk endrer seg.
          </p>
          <UrnModelSimulator />
        </section>

        <section id="betinget" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Grid3x3 className="h-5 w-5 text-brand" /> Betinget sannsynlighet
          </h2>
          <p className="leading-relaxed">
            <span className="font-mono">P(A | B) = P(A ∩ B) / P(B)</span> ser ut som en
            teknikalitet, men sier noe enkelt: <strong>kast bort alt som ikke er B</strong>, og spør
            hvor stor del av det som er igjen, som er A. Ny informasjon virker ved å krympe
            utfallsrommet — det er hele mekanismen, og det er også svaret på to-barn-anslaget over.
          </p>
          <p className="mt-2 mb-4 leading-relaxed">
            I rutenettet under er hele kvadratet Ω. Klikk på en kolonne for å betinge på den:
            kolonnen blir det nye utfallsrommet, og brøken regnes om. Legg spesielt merke til at P(A
            | B) og P(B | A) leser <em>ulike</em> retninger i det samme nettet.
          </p>
          <ConditionalProbabilityGrid />
        </section>

        <section id="uavhengighet" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Uavhengighet — og hva det ikke er</h2>
          <p className="leading-relaxed">
            A og B er uavhengige når <span className="font-mono">P(A ∩ B) = P(A) · P(B)</span>, som
            er det samme som å si <span className="font-mono">P(A | B) = P(A)</span>: å få vite at B
            skjedde forandrer ingenting. Dette er en <em>betingelse som må begrunnes</em>, ikke en
            standardinnstilling. Praktisk test: finnes det en mekanisme som kan overføre informasjon
            fra den ene hendelsen til den andre? Myntkast — nei. Korttrekk uten tilbakelegging — ja,
            kortet er borte. To søsken i samme hjem — ja, de deler gener og miljø.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-foreground">Disjunkt er ikke det samme som uavhengig.</strong>{" "}
            Disjunkte hendelser kan ikke skje samtidig: P(A ∩ B) = 0. Det er ikke uavhengighet — det
            er den sterkest mulige avhengigheten, for da gjør det å vite at B skjedde A umulig. To
            hendelser med positiv sannsynlighet kan aldri være både disjunkte og uavhengige.
          </div>
        </section>

        <section id="tre" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <GitBranch className="h-5 w-5 text-brand" /> Sannsynlighetstreet — arbeidshesten
          </h2>
          <p className="mb-4 leading-relaxed">
            Nesten alle flerstegsoppgaver løses av det samme bildet. Hver gren bærer en betinget
            sannsynlighet, du <strong>multipliserer langs</strong> en gren for å få sannsynligheten
            for hele forløpet, og du <strong>summerer på tvers</strong> av grener som ender i samme
            utfall. Den summeringen er setningen om total sannsynlighet, og det er akkurat den som
            blir nevneren i Bayes.
          </p>
          <ProbabilityTreeDiagram />
        </section>

        <section id="bayes" className="mb-12 scroll-mt-28">
          <h2 className="mb-3 text-xl font-semibold">Bayes — å snu betingingen</h2>
          <p className="leading-relaxed">
            Du kjenner ofte P(utslag | årsak), men vil vite P(årsak | utslag). Testen forteller deg
            hvor ofte den slår ut hos syke; du vil vite hvor ofte et utslag betyr sykdom. Bayes er
            vekslingskursen mellom de to:
          </p>
          <p className="my-3 rounded-lg border border-border bg-muted/40 p-3 text-center font-mono text-sm">
            P(A | B) = P(B | A) · P(A) / P(B)
          </p>
          <p className="leading-relaxed">
            Nevneren P(B) er nesten aldri oppgitt direkte — den må bygges med total sannsynlighet:{" "}
            <span className="font-mono">P(B) = P(B | A)·P(A) + P(B | Aᶜ)·P(Aᶜ)</span>. Det er der de
            fleste stopper, og det er også der forklaringen bor: når P(A) er svært liten, dominerer
            det andre leddet nevneren, og svaret blir lite uansett hvor god testen er.
          </p>
          <p className="mt-3 mb-4 leading-relaxed">
            Regn først i <strong>naturlige frekvenser</strong> — «av 100 000 personer …» — ikke i
            desimaltall. Effekten er godt dokumentert: samme oppgave løses langt oftere riktig når
            den formuleres i antall mennesker enn i sannsynligheter. Verktøyet under gjør nettopp
            den oversettelsen for deg.
          </p>
          <NaturligeFrekvenser />
          <p className="mt-6 mb-4 leading-relaxed">
            Skru så på parameterne selv. Sett sensitiviteten til 100 % og se at svaret{" "}
            <em>fortsatt</em> ikke blir høyt når prevalensen er lav — det er spesifisiteten og
            prevalensen som styrer, ikke sensitiviteten alene.
          </p>
          <BayesUpdater />
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
              Alt over dette punktet er det du trenger til 14. desember. Monty Hall-problemet er
              ikke pensum, men det er den reneste demonstrasjonen som finnes av modulens hovedpoeng:
              at <em>hvordan</em> du fikk informasjonen avgjør hva den er verdt. Verten åpner ikke
              en tilfeldig dør — han vet hvor gevinsten er, og det er nettopp den kunnskapen som
              gjør at det lønner seg å bytte. Ti minutter her skjerper betinget sannsynlighet mer
              enn ti oppgaver til.
            </p>
            <MontyHallSimulator />
          </div>
        </section>

        {/* --- Videre ------------------------------------------------------ */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 font-semibold">Videre herfra</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-fordelinger" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 font-medium text-brand hover:bg-brand/20"
            >
              Modul 3 — fordelinger (velgeren)
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-sannsynlighet" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypende leksjon: sannsynlighet og mengdelære
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "tek1-kombinatorikk" }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
            >
              Utdypende leksjon: kombinatorikk
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
