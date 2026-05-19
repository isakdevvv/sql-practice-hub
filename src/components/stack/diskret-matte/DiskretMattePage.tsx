import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle, CheckCircle2, Brain } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { AbcMengder } from "./figures/AbcMengder";
import { QuantorVis } from "./figures/QuantorVis";
import { NumberSets } from "./figures/NumberSets";
import { StepProof } from "./figures/StepProof";
import { ProofBuilder } from "./figures/ProofBuilder";
import { TruthTableBuilder } from "./figures/TruthTableBuilder";
import { VennSandbox } from "./figures/VennSandbox";
import { FunctionTypeVis } from "./figures/FunctionTypeVis";
import { ChooseKExplorer } from "./figures/ChooseKExplorer";
import { PascalTriangle } from "./figures/PascalTriangle";
import { InductionDominoes } from "./figures/InductionDominoes";
import { RelationGrid } from "./figures/RelationGrid";
import { HasseDiagram } from "./figures/HasseDiagram";
import { GraphSandbox } from "./figures/GraphSandbox";
import { ModClock } from "./figures/ModClock";
import { SectionQuiz } from "./figures/SectionQuiz";
import { FunctionOutputMatch } from "./funksjons-ovinger/FunctionOutputMatch";
import { ImageSetPartitioner } from "./funksjons-ovinger/ImageSetPartitioner";
import { FiberPicker } from "./funksjons-ovinger/FiberPicker";
import { CompositionTracer } from "./funksjons-ovinger/CompositionTracer";

const STEPS = [
  { title: "Mattens ABC — mengder, ∈ ⊆ ∀ ∃, tallmengder", anchor: "abc" },
  { title: "Propositional logic — sannhetsverdier og konnektiver", anchor: "logikk" },
  { title: "Bevis-strategier (direkte, kontrapositiv, motsigelse)", anchor: "bevis" },
  { title: "Mengder — union, snitt, differanse, delmengde", anchor: "mengder" },
  { title: "Funksjoner og relasjoner — injektiv, surjektiv, bijektiv", anchor: "funksjoner" },
  { title: "Relasjoner og partielle ordninger", anchor: "relasjoner" },
  { title: "Kombinatorikk — permutasjoner og kombinasjoner", anchor: "kombinatorikk" },
  { title: "Matematisk induksjon", anchor: "induksjon" },
  { title: "Grafer — noder, kanter, stier, trær", anchor: "grafer" },
  { title: "Modulær aritmetikk — mod, kongruens, hashing", anchor: "mod" },
  { title: "Oppsummering og neste steg", anchor: "oppsummering" },
];

export function DiskretMattePage() {
  return (
    <StackPageShell title="Diskret matematikk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Fase 0 · Math foundations
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Diskret matematikk — språket bak algoritmer
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tellbare strukturer: utsagn, mengder, grafer, heltall. Hver algoritme
            uttrykker noe i ett av disse domenene. Lær vokabularet først, så blir
            algoritme-pensumet plutselig veldig mye lettere.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> hver seksjon har en
              interaktiv figur du kan klikke på, samt en mini-oppgave med fasit.{" "}
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgavene
              </Link>{" "}
              under «Math foundations» drillere det samme.
            </div>
          </div>
        </div>

        <CourseOutline courseId="diskret-matte" steps={STEPS} />

        {/* ============================================================ */}
        {/* 0. MATTENS ABC — fra null */}
        {/* ============================================================ */}
        <section id="abc" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">0. Mattens ABC — start her</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før vi snakker om logikk, induksjon eller grafer: la oss kalibrere
            notasjonen. Disse symbolene — <code>∈, ⊆, ∀, ∃, ℕ, ℤ, ℚ, ℝ</code> — er
            språket alt videre stoff bygger på. Tre korte øvelser:
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">A. Hva er en mengde?</h3>
              <p className="text-xs text-muted-foreground mb-2">
                En mengde er en uordnet samling av unike ting. Klikk gjennom modus 1, 2,
                3 i figuren under for å bygge intuisjon for{" "}
                <code>{`{...}`}</code>, <code>∈</code>, og <code>⊆</code>.
              </p>
              <AbcMengder />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">B. Tallmengder — ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Alle tall du møter i kurset tilhører en av disse fire familier (i tillegg
                til ℂ — komplekse tall — som vi ikke trenger her). Familiene er nøstet:
                ℕ er innebygd i ℤ, som er innebygd i ℚ, som er innebygd i ℝ.
              </p>
              <NumberSets />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">C. Kvantorer — ∀ og ∃</h3>
              <p className="text-xs text-muted-foreground mb-2">
                «For alle» og «det finnes» er det språket bevis er skrevet i. Velg et
                predikat og se kvantorene vurderes konkret.
              </p>
              <QuantorVis />
            </div>
          </div>

          <FallBox>
            <strong>Hvorfor denne seksjonen finnes:</strong> de fleste lærebøker forutsetter
            at du kan denne notasjonen, og dropper den rett i magen på deg på side 2. Hvis
            du har slitt med diskret matte før, er det 80% sjanse for at dette var
            grunnen — ikke matematikken, men notasjonen.
          </FallBox>

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="abc"
            nextSection={{ title: "Propositional logic", anchor: "logikk" }}
            questions={[
              {
                prompt: "La A = {2, 4, 6, 8}. Hvilket utsagn er sant?",
                options: [
                  { text: "3 ∈ A", correct: false, rationale: "3 er IKKE i A — A inneholder bare partall (2, 4, 6, 8)." },
                  { text: "4 ∈ A", correct: true, rationale: "4 er ett av elementene i A." },
                  { text: "{4} ∈ A", correct: false, rationale: "{4} er en MENGDE som inneholder 4 — ikke selve tallet. Vi har 4 ∈ A, men {4} ⊆ A." },
                  { text: "A ∈ A", correct: false, rationale: "A er ikke et element i seg selv — det ville krevd at A inneholdt seg selv som element." },
                ],
              },
              {
                prompt: "Hvilket tall hører til en STØRRE familie enn ℚ?",
                options: [
                  { text: "1/3", correct: false, rationale: "1/3 er rasjonalt — i ℚ, men ikke større enn ℚ." },
                  { text: "−7", correct: false, rationale: "−7 ∈ ℤ ⊂ ℚ — i ℚ." },
                  { text: "π", correct: true, rationale: "π er irrasjonalt — i ℝ men ikke i ℚ. ℝ er strengt større enn ℚ." },
                  { text: "0", correct: false, rationale: "0 er heltall — i ℕ ⊂ ℤ ⊂ ℚ." },
                ],
              },
              {
                prompt: "På domene {1, 2, 3, 4, 5}, hvilket utsagn er SANT?",
                options: [
                  { text: "∀x : x > 0", correct: true, rationale: "Alle elementene 1..5 er positive — ∀ holder." },
                  { text: "∀x : x er primtall", correct: false, rationale: "1 og 4 er IKKE primtall — motbevis nok til å gjøre ∀ usann." },
                  { text: "∃x : x > 10", correct: false, rationale: "Maks er 5 — ingen vitne finnes for ∃." },
                  { text: "∀x : x < 0", correct: false, rationale: "Ingen elementer er negative." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 1. LOGIKK */}
        {/* ============================================================ */}
        <section id="logikk" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">1. Propositional logic</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et utsagn (proposisjon) er en setning som er enten <strong>sant</strong> (T) eller
            <strong> usant</strong> (F). Variabler skrives <code>p, q, r, ...</code> og
            kombineres med konnektiver. Logikk er det formelle språket for hver{" "}
            <code>if</code>-setning, hver SQL-<code>WHERE</code>, hver type-sjekk.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Konnektiv        Symbol     Leses                Sant når
─────────────────────────────────────────────────────────────────
Negasjon         ¬p         "ikke p"             p er usant
Konjunksjon      p ∧ q      "p og q"             begge sanne
Disjunksjon      p ∨ q      "p eller q"          minst én sann
Implikasjon      p → q      "hvis p, så q"       ikke (p ∧ ¬q)
Bikondisjonal    p ↔ q      "p hvis og bare hvis q"   p og q har samme verdi
Eks-eller        p ⊕ q      "p XOR q"            nøyaktig én sann`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Sannhetstabell-bygger</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Skriv inn et uttrykk (eller velg en preset) og se sannhetstabellen genereres
            automatisk. Eksperimenter: er <code>p → q</code> det samme som{" "}
            <code>¬p ∨ q</code>?
          </p>
          <TruthTableBuilder />

          <FallBox>
            <strong>Felle:</strong> <code>p → q</code> er IKKE «p forårsaker q». Det er
            kun «ikke begge p sann og q usann». Derfor er «hvis månen er av ost, er 1+1=3»
            et sant utsagn — premisset er usant, og en implikasjon med usant premiss er
            alltid sann (vacuously true).
          </FallBox>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              De Morgans lover — viktigste identitet
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`¬(p ∧ q)  ≡  ¬p ∨ ¬q
¬(p ∨ q)  ≡  ¬p ∧ ¬q

Eksempel — SQL:
  NOT (age > 18 AND has_license)
  ≡ age <= 18 OR NOT has_license

Eksempel — kode:
  if not (a > 0 and b > 0):     # «hvis IKKE begge positive»
  ekvivalent med:
  if a <= 0 or b <= 0:          # «hvis MINST ÉN ikke-positiv»`}</pre>
          </div>

          <ProblemBox
            title="Mini-oppgave — sannhetstabell"
            problem={
              <>
                Vis at <code>p → q</code> og <code>¬q → ¬p</code> (kontrapositivet) har
                identisk sannhetstabell.
              </>
            }
            answer={
              <>
                Begge gir T,F,T,T for (TT, TF, FT, FF). Sjekk i builder-en over: p→q er F
                kun ved p=T,q=F. ¬q→¬p er F kun ved ¬q=T,¬p=F → q=F,p=T. Samme rad.
                Derfor er kontrapositivet logisk ekvivalent — en av de mest brukte
                bevis-triksene.
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="logikk"
            nextSection={{ title: "Bevis-strategier", anchor: "bevis" }}
            questions={[
              {
                prompt: "p = T, q = F. Hva er sannhetsverdien til (p → q) ∧ (q → p)?",
                options: [
                  { text: "T", correct: false, rationale: "Begge må være sanne for ∧. p→q = F (T→F er den eneste falske raden). Da er hele konjunksjonen F." },
                  { text: "F", correct: true, rationale: "p → q = F (siden T → F). En F i et ∧-uttrykk gjør hele F. (q → p = T er irrelevant.)" },
                  { text: "Kommer an på r", correct: false, rationale: "Det er ingen r i uttrykket." },
                  { text: "Ikke definert", correct: false, rationale: "Hver kombinasjon av p, q gir en presis sannhetsverdi." },
                ],
              },
              {
                prompt: "Hva er den De-Morgan-ekvivalente skrivemåten av ¬(a ∨ b ∨ c)?",
                options: [
                  { text: "¬a ∨ ¬b ∨ ¬c", correct: false, rationale: "Operatoren må snus til ∧ etter De Morgan." },
                  { text: "¬a ∧ ¬b ∧ ¬c", correct: true, rationale: "De Morgan: ¬(A ∨ B) = ¬A ∧ ¬B, generaliseres til vilkårlig mange." },
                  { text: "a ∧ b ∧ c", correct: false, rationale: "Du må også negere hvert ledd." },
                  { text: "¬a ∧ b ∧ c", correct: false, rationale: "Bare ÉN er negert — De Morgan negerer hvert ledd." },
                ],
              },
              {
                prompt: "Implikasjonen p → q er logisk EKVIVALENT med...",
                options: [
                  { text: "¬p ∨ q", correct: true, rationale: "Klassisk omskriving — sjekk sannhetstabellen i builder-en. Brukes mye i SAT/SMT." },
                  { text: "p ∧ ¬q", correct: false, rationale: "Det er NEGASJONEN av p → q." },
                  { text: "q → p (konvers)", correct: false, rationale: "Konversen er ikke logisk ekvivalent — vanlig forvekslings-fellet." },
                  { text: "¬p ∧ q", correct: false, rationale: "Sammenlign sannhetstabellene: ¬p ∧ q og p → q er ulike på (T, T)." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 2. BEVIS-STRATEGIER */}
        {/* ============================================================ */}
        <section id="bevis" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">2. Bevis-strategier</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tre standard-mønstre du møter overalt: direkte bevis, kontrapositiv, og
            motsigelse. Velg det som gir kortest argument for påstanden din.
          </p>

          <div className="rounded-xl border border-border bg-card p-4 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Oppskrifts-kort
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="text-foreground">Direkte (p → q):</strong>{" "}
                <span className="text-muted-foreground">
                  Anta p. Vis q som logisk konsekvens, steg for steg.
                </span>
              </li>
              <li>
                <strong className="text-foreground">Kontrapositiv (¬q → ¬p):</strong>{" "}
                <span className="text-muted-foreground">
                  Vis at ¬q medfører ¬p. Logisk ekvivalent med direkte bevis.
                </span>
              </li>
              <li>
                <strong className="text-foreground">Motsigelse:</strong>{" "}
                <span className="text-muted-foreground">
                  Anta påstanden er usann. Utled en motsigelse. Da må påstanden være sann.
                </span>
              </li>
            </ul>
          </div>

          <h3 className="text-sm font-semibold mb-2 mt-6">Direkte bevis — steg-for-steg</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Det enkleste bevis-mønsteret: gå fra antagelse til konklusjon via algebraiske
            skritt.
          </p>
          <StepProof
            title="Hvis n er partall, så er n² partall"
            claim="∀n ∈ ℤ : (n partall) → (n² partall)"
            steps={[
              {
                label: "Antagelse",
                line: "Anta n er partall.",
                highlight: "partall",
                hint: "Direkte bevis starter med å anta premisset (det «hvis»-leddet).",
              },
              {
                label: "Steg 1",
                line: "Per definisjon:  n = 2k  for et heltall k.",
                highlight: "n = 2k",
                hint: "Bruk definisjonen av partall — alltid 2 ganger et heltall.",
              },
              {
                label: "Steg 2",
                line: "Da:  n² = (2k)² = 4k²",
                highlight: "4k²",
                hint: "Algebra: kvadrér begge sider.",
              },
              {
                label: "Steg 3",
                line: "         = 2 · (2k²)",
                highlight: "2 · (2k²)",
                hint: "Faktoriser ut 2 — vis at n² er på formen 2·(heltall).",
              },
              {
                label: "QED",
                line: "Altså er n² partall (av formen 2·heltall). ✓",
                highlight: "n² partall",
                hint: "Konklusjon: per definisjon av partall — direkte bevis fullført.",
              },
            ]}
          />

          <h3 className="text-sm font-semibold mb-2 mt-6">Kontrapositiv — steg-for-steg</h3>
          <p className="text-xs text-muted-foreground mb-3">
            «Vis at hvis n² er partall, så er n partall.» Direkte forsøk er vanskelig —
            men kontrapositivet er enkelt.
          </p>
          <StepProof
            title="Hvis n² er partall, så er n partall"
            claim="∀n ∈ ℤ : (n² partall) → (n partall)"
            steps={[
              {
                label: "Strategi",
                line: "Vi viser kontrapositivet:  (n oddetall) → (n² oddetall).",
                highlight: "kontrapositivet",
                hint: "Kontrapositiv av p → q er ¬q → ¬p — logisk ekvivalent. Negér konklusjonen og premisset, snu retningen.",
              },
              {
                label: "Antagelse",
                line: "Anta n er oddetall.",
                highlight: "oddetall",
                hint: "Nytt premiss: anta den negerte konklusjonen.",
              },
              {
                label: "Steg 1",
                line: "Per definisjon:  n = 2k + 1  for et heltall k.",
                highlight: "n = 2k + 1",
                hint: "Definisjon av oddetall: alltid 2k + 1.",
              },
              {
                label: "Steg 2",
                line: "n² = (2k + 1)² = 4k² + 4k + 1",
                highlight: "4k² + 4k + 1",
                hint: "Algebra: utvid kvadratet.",
              },
              {
                label: "Steg 3",
                line: "    = 2(2k² + 2k) + 1",
                highlight: "2(2k² + 2k) + 1",
                hint: "Faktoriser ut 2 fra de første to leddene — viser at n² er på formen 2·heltall + 1.",
              },
              {
                label: "QED",
                line: "Altså er n² oddetall.   Da gjelder også kontrapositivet:  n² partall ⇒ n partall. ✓",
                highlight: "kontrapositivet",
                hint: "Vi har vist (n oddetall) → (n² oddetall). Det er ekvivalent med originalpåstanden via kontrapositiv.",
              },
            ]}
          />

          <FallBox>
            <strong>Felle:</strong> kontrapositiv ≠ invers. <code>p → q</code> har
            kontrapositiv <code>¬q → ¬p</code> (ekvivalent), men invers er{" "}
            <code>¬p → ¬q</code> (IKKE ekvivalent). Ikke bytt rekkefølge når du negerer.
          </FallBox>

          <h3 className="text-sm font-semibold mb-2 mt-6">Bygg ditt eget bevis — Proof Lego</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Nå er det din tur. Plukk bevisstegene fra poolen og legg dem i riktig
            rekkefølge. Systemet sjekker logikken: hver linje må ha sine forutsetninger
            etablert på et tidligere steg.
          </p>
          <ProofBuilder
            title="Bygg: summen av to oddetall er partall"
            claim="∀m, n ∈ ℤ : (m oddetall ∧ n oddetall) → (m + n partall)"
            setup="Anta m og n er oddetall."
            hint="Direkte bevis. Start med definisjonen av oddetall for begge — m = 2j+1 og n = 2k+1. Adder, faktoriser, vis at summen er av formen 2·heltall."
            pieces={[
              {
                id: "def-m",
                label: "Steg 1",
                text: "Per definisjon:  m = 2j + 1  for et heltall j.",
                justification: "Definisjon av oddetall anvendt på m.",
              },
              {
                id: "def-n",
                label: "Steg 2",
                text: "Per definisjon:  n = 2k + 1  for et heltall k.",
                justification: "Definisjon av oddetall anvendt på n.",
              },
              {
                id: "sum",
                label: "Steg 3",
                text: "m + n  =  (2j + 1) + (2k + 1)",
                deps: ["def-m", "def-n"],
                justification: "Substituer begge definisjoner inn i summen.",
              },
              {
                id: "simplify",
                label: "Steg 4",
                text: "        =  2j + 2k + 2  =  2(j + k + 1)",
                deps: ["sum"],
                justification: "Algebra: samle 2-er og faktoriser ut.",
              },
              {
                id: "qed",
                label: "QED",
                text: "Altså er m + n av formen 2·(heltall), så m + n er partall. ✓",
                deps: ["simplify"],
                justification: "Definisjon av partall: et tall er partall hvis det kan skrives som 2·k for et heltall k.",
              },
            ]}
          />

          <h3 className="text-sm font-semibold mb-2 mt-6">Klassisk motsigelse-bevis: √2 er irrasjonelt</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Det mest berømte bevis ved motsigelse. Pythagoras hadde sannsynligvis dette i
            hodet da han oppdaget at irrasjonale tall fantes — og det skapte krise i den
            greske matematikken.
          </p>
          <StepProof
            title="√2 er irrasjonelt"
            claim="Det finnes ingen heltall a, b med b ≠ 0 slik at √2 = a/b."
            steps={[
              {
                label: "Antagelse",
                line: "Anta √2 = a/b, hvor a/b er på fullt forkortet form.",
                highlight: "fullt forkortet form",
                hint: "Motsigelses-strategien: anta det motsatte av påstanden. «Fullt forkortet» betyr gcd(a, b) = 1 — vi har dratt ut alle felles faktorer.",
              },
              {
                label: "Steg 1",
                line: "Kvadrér begge sider:   2 = a²/b²",
                highlight: "a²/b²",
                hint: "Kvadrér likningen for å bli kvitt rota.",
              },
              {
                label: "Steg 2",
                line: "Multipliser med b²:   2b² = a²",
                highlight: "2b²",
                hint: "Da er a² av formen 2·(et heltall) — altså a² er partall.",
              },
              {
                label: "Steg 3",
                line: "a² partall  ⇒  a partall   (kontrapositiv av oddetall² = oddetall)",
                highlight: "a partall",
                hint: "Hvis a² er partall, må a selv være partall (vist tidligere).",
              },
              {
                label: "Steg 4",
                line: "Skriv a = 2k.   Da:  2b² = (2k)² = 4k²,  så b² = 2k²",
                highlight: ["a = 2k", "b² = 2k²"],
                hint: "Substituer a = 2k tilbake. b² blir også av formen 2·(noe).",
              },
              {
                label: "Steg 5",
                line: "b² partall  ⇒  b partall",
                highlight: "b partall",
                hint: "Samme argument som for a: b² partall ⇒ b partall.",
              },
              {
                label: "Motsigelse",
                line: "Da deler 2 både a og b.   Men gcd(a, b) = 1!   ⊥",
                highlight: "⊥",
                hint: "Vi har en motsigelse: antok at brøken var fullt forkortet, men begge er partall (kan forkortes med 2).",
              },
              {
                label: "QED",
                line: "Antagelsen må være feil.   Altså finnes ingen slik a/b.   √2 er irrasjonelt. ✓",
                highlight: "irrasjonelt",
                hint: "Motsigelses-prinsippet: hvis antagelsen leder til en motsigelse, må antagelsen være usann — så det opprinnelige utsagnet er sant.",
              },
            ]}
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="bevis"
            nextSection={{ title: "Mengder", anchor: "mengder" }}
            questions={[
              {
                prompt: "Du skal vise «hvis x² er irrasjonelt, så er x irrasjonelt». Hvilken strategi gir kortest bevis?",
                options: [
                  { text: "Direkte: anta x² irrasjonelt, utled at x irrasjonelt", correct: false, rationale: "Vanskelig å gå fra «x² irrasjonelt» direkte til en strukturell påstand om x." },
                  { text: "Kontrapositiv: anta x rasjonelt, vis at x² rasjonelt", correct: true, rationale: "Hvis x = a/b, så x² = a²/b² — også brøk-form, altså rasjonelt. Kontrapositiv av p→q er ¬q→¬p, og er ekvivalent." },
                  { text: "Motsigelse: anta x² rasjonelt og se hvor det går", correct: false, rationale: "Du har snudd premiss og konklusjon — det er ikke motsigelse, det er konversen." },
                  { text: "Induksjon på x", correct: false, rationale: "Induksjon er for naturlige tall, ikke for et kontinuerlig x." },
                ],
              },
              {
                prompt: "Hva er FORSKJELLEN mellom «kontrapositiv» og «motsigelse»?",
                options: [
                  {
                    text: "Kontrapositiv: vis ¬q → ¬p direkte. Motsigelse: anta p ∧ ¬q og utled noe absurd.",
                    correct: true,
                    rationale:
                      "Kontrapositiv er en logisk omskriving og krever ingen motsigelse. Motsigelse antar negasjonen av påstanden og leter etter ⊥.",
                  },
                  { text: "De er samme metode med ulikt navn", correct: false, rationale: "Lignende, men forskjellige: kontrapositiv-beviset trenger ikke å lede til motsigelse." },
                  { text: "Motsigelse er svakere — kun for irrasjonale tall", correct: false, rationale: "Motsigelse er en generell teknikk." },
                  { text: "Kontrapositiv finnes ikke i klassisk logikk", correct: false, rationale: "Den er en grunn-identitet: (p → q) ≡ (¬q → ¬p)." },
                ],
              },
              {
                prompt: "Hvilken påstand er INVERSEN av «hvis n er primtall og n > 2, så n er oddetall»?",
                options: [
                  { text: "Hvis n er oddetall, så er n primtall og n > 2", correct: false, rationale: "Det er KONVERSEN (q → p), ikke inversen." },
                  { text: "Hvis n IKKE er primtall eller n ≤ 2, så er n IKKE oddetall (n partall)", correct: true, rationale: "Invers er ¬p → ¬q. IKKE logisk ekvivalent med originalen (akkurat slik konvers ikke er)." },
                  { text: "Hvis n er partall, så er n ikke primtall eller n ≤ 2", correct: false, rationale: "Det er KONTRAPOSITIVET — logisk ekvivalent med originalen." },
                  { text: "Det finnes ingen primtall > 2 som er oddetall", correct: false, rationale: "Det er en (usann) negasjon av påstanden, ikke en invers." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 3. MENGDER */}
        {/* ============================================================ */}
        <section id="mengder" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">3. Mengder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En mengde er en uordnet samling unike elementer. Skrives med klammer:
            <code>{` {1, 2, 3}`}</code>. Rekkefølge og duplikater betyr ingenting:
            <code>{` {1, 2, 3} = {3, 1, 2, 1}`}</code>.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Operasjon         Symbol     Definisjon
──────────────────────────────────────────────────────────
Union             A ∪ B      x ∈ A eller x ∈ B
Snitt             A ∩ B      x ∈ A og x ∈ B
Differanse        A \\ B      x ∈ A og x ∉ B
Symmetrisk diff   A ⊕ B      i A eller B, men ikke begge
Komplement        Aᶜ         x ∉ A (i et univers U)
Delmengde         A ⊆ B      hvert x ∈ A er også i B
Ekte delmengde    A ⊂ B      A ⊆ B og A ≠ B
Tom mengde        ∅          { }
Kardinalitet      |A|        antall elementer i A
Potensmengde      𝒫(A)       mengden av alle delmengder, |𝒫(A)| = 2^|A|`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Venn-sandkasse</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk en operasjon — det skraverte området er resultatet. Slidere endrer
            kardinalitet. Se inkluderings-eksklusjons-formelen oppdatere seg live.
          </p>
          <VennSandbox />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Inkludering–eksklusjon (2 og 3 mengder)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`|A ∪ B|  =  |A| + |B| − |A ∩ B|

|A ∪ B ∪ C|  =  |A| + |B| + |C|
                − |A ∩ B| − |A ∩ C| − |B ∩ C|
                + |A ∩ B ∩ C|

Eksempel — kurs-overlapp:
  30 studenter. 18 tar matte, 15 fysikk, 8 begge.
  Hvor mange tar minst ett?
  |M ∪ F| = 18 + 15 − 8 = 25
  Hvor mange tar ingen? 30 − 25 = 5.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til SQL:</strong> <code>UNION</code> = ∪, <code>INTERSECT</code> =
            ∩, <code>EXCEPT</code> = \. Relasjonsalgebra (SQL sin teoretiske base) ER
            mengdelære på rader. Når du forstår mengder, forstår du joins.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — inkludering/eksklusjon"
            problem={
              <>
                Av 100 personer drikker 60 kaffe, 50 te, 30 begge. Hvor mange drikker
                ingen av delene?
              </>
            }
            answer={
              <>
                |K ∪ T| = 60 + 50 − 30 = 80. Da drikker 100 − 80 = <strong>20</strong>{" "}
                hverken kaffe eller te.
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="mengder"
            nextSection={{ title: "Funksjoner", anchor: "funksjoner" }}
            questions={[
              {
                prompt: "A = {1, 2, 3}, B = {2, 3, 4, 5}. Hva er A ∩ B?",
                options: [
                  { text: "{1, 2, 3, 4, 5}", correct: false, rationale: "Det er UNION A ∪ B." },
                  { text: "{2, 3}", correct: true, rationale: "Snitt = elementer i BEGGE. 2 og 3 finnes i både A og B." },
                  { text: "{1}", correct: false, rationale: "{1} er A \\ B (i A men ikke i B), ikke snitt." },
                  { text: "{4, 5}", correct: false, rationale: "Det er B \\ A — i B men ikke i A." },
                ],
              },
              {
                prompt: "Hvor mange delmengder har {a, b, c, d, e}?",
                options: [
                  { text: "5", correct: false, rationale: "Det er |A|, antall elementer — ikke antall delmengder." },
                  { text: "25", correct: false, rationale: "5² = 25, men formelen er 2ⁿ ikke n²." },
                  { text: "32", correct: true, rationale: "2⁵ = 32. Hvert element har 2 valg (med/ikke med), så 2ⁿ totalt." },
                  { text: "120", correct: false, rationale: "5! = 120 — det er antall permutasjoner, ikke delmengder." },
                ],
              },
              {
                prompt: "I en gruppe på 50: 30 liker matte, 25 liker fysikk, 10 liker BEGGE. Hvor mange liker INGEN av fagene?",
                options: [
                  { text: "5", correct: true, rationale: "|M ∪ F| = 30 + 25 − 10 = 45. Ingen av fagene: 50 − 45 = 5." },
                  { text: "10", correct: false, rationale: "10 er antallet som liker begge, ikke ingen." },
                  { text: "15", correct: false, rationale: "Du har glemt å trekke fra snittet i inkludering-eksklusjon." },
                  { text: "0", correct: false, rationale: "Med 50 − 45 = 5 er det ikke 0." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 4. FUNKSJONER */}
        {/* ============================================================ */}
        <section id="funksjoner" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">4. Funksjoner og relasjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En funksjon <code>f: A → B</code> tilordner hver <code>x ∈ A</code> nøyaktig
            én <code>f(x) ∈ B</code>. A er definisjonsmengde, B er kodomene.
            Bilde-mengden <code>f(A)</code> er det som faktisk treffes.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Type           Definisjon                              Tankebilde
──────────────────────────────────────────────────────────────────────
Injektiv       x₁ ≠ x₂ → f(x₁) ≠ f(x₂)                 én-til-én
(1-1)          ingen kollisjoner i resultatet

Surjektiv      ∀y ∈ B, ∃x ∈ A: f(x) = y                dekker hele B
(onto)         hele B blir truffet

Bijektiv       både injektiv og surjektiv              perfekt match
               (har invers f⁻¹)

Sammensetning  (g∘f)(x) = g(f(x))                      kjøre f, så g
Identitet      id(x) = x                                gjør ingenting`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Funksjonstype-visualisering</h3>
          <FunctionTypeVis />

          <h3 className="text-sm font-semibold mb-2 mt-6">Øvinger — tolke hva funksjonen produserer</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Fire progressive øvinger: les én verdi, finn hele bildet, finn fiberen til
            en y, og spor en komposisjon. Hver øving har «lær»-modus (fasit synlig) og
            «prøv»-modus (test deg selv).
          </p>

          <div className="space-y-4">
            <FunctionOutputMatch
              id="lin-2x-plus-1"
              rule="f(x) = 2x + 1"
              fn={(x) => 2 * x + 1}
              domain={[0, 1, 2, 3, 4]}
              explanation="Lineær funksjon: legg merke til at differensen mellom nabo-output er konstant (2). Det er karakteristisk for ax + b."
            />

            <ImageSetPartitioner
              id="sq-1to3"
              rule="f(x) = x²,  A = {1, 2, 3},  B = {1, 2, ..., 9}"
              A={[1, 2, 3]}
              B={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
              fn={(x) => x * x}
              explanation="Bildet f(A) = {1, 4, 9} — bare kvadratene av elementene i A. Selv om kodomenet B inneholder mange tall, treffer ikke f alle. Det er forskjellen på «kodomene» og «verdimengde / bilde»."
            />

            <FiberPicker
              id="sq-pm3"
              rule="f(x) = x²,  A = {−3, −2, −1, 0, 1, 2, 3}"
              A={[-3, -2, -1, 0, 1, 2, 3]}
              B={[0, 1, 4, 9]}
              fn={(x) => x * x}
              targets={[0, 1, 4, 9]}
              explanation="Fiberen f⁻¹({y}) = {x ∈ A : f(x) = y}. For y = 4 er det {−2, 2} — to elementer. Det er presis grunnen til at x² IKKE er injektiv på ℝ: fiberen til de fleste y inneholder mer enn ett element."
            />

            <CompositionTracer
              id="comp-main"
              variants={[
                {
                  id: "fx-plus-1__gxsq",
                  title: "f(x)=x+1, g(x)=x²",
                  f: { label: "f(x) = x + 1", fn: (x) => x + 1 },
                  g: { label: "g(x) = x²", fn: (x) => x * x },
                  xs: [0, 1, 2, 3],
                  explanation: "(g∘f)(x) = (x+1)². Merk: g∘f og f∘g er nesten alltid forskjellige — bytt rekkefølge og se hva som skjer.",
                },
                {
                  id: "fx2x__gx_plus_3",
                  title: "f(x)=2x, g(x)=x+3",
                  f: { label: "f(x) = 2x", fn: (x) => 2 * x },
                  g: { label: "g(x) = x + 3", fn: (x) => x + 3 },
                  xs: [0, 1, 2, 5],
                  explanation: "(g∘f)(x) = 2x + 3. Lineære funksjoner komponert gir en ny lineær funksjon.",
                },
                {
                  id: "fxsq__gx_minus_1",
                  title: "f(x)=x², g(x)=x−1",
                  f: { label: "f(x) = x²", fn: (x) => x * x },
                  g: { label: "g(x) = x − 1", fn: (x) => x - 1 },
                  xs: [0, 1, 2, 3],
                  explanation: "(g∘f)(x) = x² − 1. Når f ikke er injektiv, arver g∘f det: g(f(−2)) = g(f(2)) = 3.",
                },
              ]}
            />
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempler — varierte domener
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`f(x) = x²  (ℝ → ℝ)   — IKKE injektiv (f(-2) = f(2) = 4)
                       IKKE surjektiv (-1 treffes ikke)

f(x) = 2x  (ℝ → ℝ)   — bijektiv (invers er f⁻¹(y) = y/2)

f(x) = x²  (ℕ → ℕ)   — injektiv, men ikke surjektiv (2 treffes ikke)

f(x) = ⌊x⌋  (ℝ → ℤ)  — surjektiv (hvert heltall treffes), ikke injektiv
                       (alle x ∈ [3, 4) går til 3)`}</pre>
          </div>

          <FallBox>
            <strong>Bro til hashing:</strong> en hash-funksjon ER en funksjon
            (deterministisk), men sjelden injektiv — kollisjoner finnes. En
            kryptografisk hash er praktisk talt injektiv (kollisjoner umulige å
            konstruere). Bijektive funksjoner har invers — kryptering med en
            symmetrisk nøkkel er en bijeksjon.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — funksjonstype"
            problem={
              <>
                Er <code>f(x) = x³</code> fra ℝ → ℝ injektiv, surjektiv eller bijektiv?
              </>
            }
            answer={
              <>
                <strong>Bijektiv.</strong> Injektiv: x³ er strengt voksende, så ulike x
                gir ulike y. Surjektiv: for hvert y ∈ ℝ finnes x = ∛y. Invers: f⁻¹(y) =
                ∛y. (Merk: x² er IKKE bijektiv på ℝ — den feiler både injeksjon og
                surjeksjon.)
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="funksjoner"
            nextSection={{ title: "Relasjoner", anchor: "relasjoner" }}
            questions={[
              {
                prompt: "f: ℝ → ℝ med f(x) = x². Hvilken klassifisering passer?",
                options: [
                  { text: "Bijektiv", correct: false, rationale: "Verken injektiv (f(−2) = f(2) = 4) eller surjektiv (negative tall treffes ikke)." },
                  { text: "Injektiv, ikke surjektiv", correct: false, rationale: "f(−2) = f(2): kollisjon, så ikke injektiv." },
                  { text: "Surjektiv, ikke injektiv", correct: false, rationale: "Negative tall i kodomenet ℝ treffes aldri av x²." },
                  { text: "Verken injektiv eller surjektiv", correct: true, rationale: "Begge svikter på ℝ → ℝ. Hadde vi byttet kodomene til [0, ∞), ville den blitt surjektiv." },
                ],
              },
              {
                prompt: "f(x) = 2x + 3 fra ℝ → ℝ. Hva er f⁻¹?",
                options: [
                  { text: "f⁻¹(y) = (y − 3) / 2", correct: true, rationale: "Sett y = 2x + 3, løs for x: x = (y − 3) / 2. Funksjonen er bijektiv (lineær med stigningstall ≠ 0), så har invers." },
                  { text: "f⁻¹(y) = 2y + 3", correct: false, rationale: "Det er bare samme f på y. Inversen reverserer operasjonen." },
                  { text: "f⁻¹(y) = (y + 3) / 2", correct: false, rationale: "Fortegns-feil — vi trekker FRA 3, ikke legger til." },
                  { text: "Finnes ikke — f er ikke bijektiv", correct: false, rationale: "f er bijektiv (lineær med stigningstall 2 ≠ 0)." },
                ],
              },
              {
                prompt: "Hvorfor sier vi at en HASH-funksjon ikke er injektiv?",
                options: [
                  { text: "Fordi den ikke er deterministisk", correct: false, rationale: "Hash ER deterministisk: samme input gir alltid samme output." },
                  {
                    text: "Fordi flere ulike inputs kan gi samme hash-verdi (kollisjon)",
                    correct: true,
                    rationale: "Injektiv = ingen kollisjoner. Hash mapper et stort/uendelig input-rom til et begrenset output-rom — kollisjoner er uunngåelige (skuffeprinsippet).",
                  },
                  { text: "Fordi hash er en envegs-funksjon", correct: false, rationale: "Envegs ≠ ikke-injektiv. Envegs handler om beregningsvansker, injeksjon om kollisjoner." },
                  { text: "Fordi hash returnerer NULL", correct: false, rationale: "Hash returnerer alltid en konkret verdi." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 4b. RELASJONER */}
        {/* ============================================================ */}
        <section id="relasjoner" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">5. Relasjoner og partielle ordninger</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <strong>binær relasjon</strong> R på en mengde A er bare en delmengde av
            A × A — et utvalg av par. Vi skriver <code>a R b</code> for «paret (a, b) er i
            R». Funksjoner er en spesiell type relasjon, men relasjoner er mer generelle:
            de trenger ikke «én-output-per-input»-regel.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Egenskap          Definisjon                              Eksempel
─────────────────────────────────────────────────────────────────
Refleksiv         ∀a: (a, a) ∈ R                          «=», «≤», «deler»
Symmetrisk        (a, b) ∈ R ⇒ (b, a) ∈ R                 «=», «søsken til»
Antisymmetrisk    (a, b), (b, a) ∈ R ⇒ a = b              «≤», «⊆»
Transitiv         (a, b), (b, c) ∈ R ⇒ (a, c) ∈ R         «=», «≤», «<»
Ekvivalens        Refleksiv + symmetrisk + transitiv       «samme rest mod n»
Partiell orden    Refleksiv + antisymmetrisk + transitiv   «⊆», «deler», «≤»`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Relasjons-grid — eksperimenter</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Velg en preset, eller bygg din egen relasjon. Hver av de fire egenskapene
            sjekkes live.
          </p>
          <RelationGrid />

          <h3 className="text-sm font-semibold mb-2 mt-6">Hasse-diagram — visualisering av partiell orden</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Når relasjonen er en partiell orden, kan vi tegne den uten å vise refleksive
            løkker eller transitive snarveier. Bare de «umiddelbare» dekningene tegnes.
          </p>
          <HasseDiagram />

          <FallBox>
            <strong>Hvorfor relasjoner er overalt i CS:</strong> primærnøkler i databaser er
            funksjonelle relasjoner. Subtype-systemer (Cat ⊆ Animal) er partielle
            ordninger. Avhengighets-grafer for builds er strenge partielle ordninger.
            Versjonering med vector clocks bruker partielle ordninger på hendelser.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — klassifiser relasjonen"
            problem={
              <>
                La R på ℤ være «a R b ⇔ a − b er delelig med 5». Er R en ekvivalens-
                relasjon? Hvis ja, beskriv ekvivalens-klassene.
              </>
            }
            answer={
              <>
                <strong>Ja, det er en ekvivalens-relasjon.</strong>
                <br />
                Refleksiv: a − a = 0, delelig med 5 ✓<br />
                Symmetrisk: 5 deler (a − b) ⇒ 5 deler (b − a) ✓<br />
                Transitiv: 5 deler (a − b) og (b − c) ⇒ 5 deler summen (a − c) ✓<br />
                Ekvivalens-klassene er [0], [1], [2], [3], [4] — alle heltall med samme
                rest mod 5. Dette er presis konstruksjonen av <code>ℤ/5ℤ</code>.
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="relasjoner"
            nextSection={{ title: "Kombinatorikk", anchor: "kombinatorikk" }}
            questions={[
              {
                prompt: "Hvilken kombinasjon av egenskaper definerer en EKVIVALENS-relasjon?",
                options: [
                  { text: "Refleksiv + antisymmetrisk + transitiv", correct: false, rationale: "Det er PARTIELL ORDEN (f.eks. ⊆, ≤)." },
                  { text: "Refleksiv + symmetrisk + transitiv", correct: true, rationale: "Klassisk: ekvivalens-relasjoner partisjonerer mengden i klasser. Eks: «=», «samme rest mod n»." },
                  { text: "Symmetrisk + transitiv", correct: false, rationale: "Trenger refleksivitet — uten den ville ikke alle elementer havne i en klasse." },
                  { text: "Bare transitiv", correct: false, rationale: "For svakt — gir ikke partisjonering." },
                ],
              },
              {
                prompt: "Er relasjonen «a deler b» på ℤ⁺ en partiell orden?",
                options: [
                  { text: "Ja", correct: true, rationale: "Refleksiv (a|a), antisymmetrisk (a|b ∧ b|a ⇒ a=b for positive heltall), transitiv (a|b ∧ b|c ⇒ a|c). Hasse-diagrammet i denne seksjonen viser delere av 24." },
                  { text: "Nei — den er ikke transitiv", correct: false, rationale: "Den ER transitiv: hvis a deler b og b deler c, så deler a også c." },
                  { text: "Nei — den er symmetrisk", correct: false, rationale: "Den er IKKE symmetrisk (2 deler 4 men 4 deler ikke 2). Det er presis det som gjør den til partiell orden snarere enn ekvivalens." },
                  { text: "Bare på primtall", correct: false, rationale: "Gjelder hele ℤ⁺." },
                ],
              },
              {
                prompt: "I et Hasse-diagram for en partiell orden, hvorfor tegnes IKKE refleksive løkker (a ≤ a)?",
                options: [
                  { text: "De er forbudt i grafer", correct: false, rationale: "Generelt finnes selv-løkker, men i Hasse-konvensjon utelates de." },
                  { text: "De er implisitte — refleksivitet antas alltid i partiell orden", correct: true, rationale: "Hasse-diagrammet er en RYDDET tegning: bare dekninger (umiddelbare oppoverkanter). Refleksivitet og transitivitet er underforstått." },
                  { text: "De ville gjort grafen syklisk", correct: false, rationale: "Selv-løkker er ikke vanlige sykler i denne sammenheng." },
                  { text: "De gjelder bare for ekvivalens-relasjoner", correct: false, rationale: "Refleksivitet gjelder også partielle ordninger." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 5. KOMBINATORIKK */}
        {/* ============================================================ */}
        <section id="kombinatorikk" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">6. Kombinatorikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Hvor mange måter?» Fire grunnregler bygger nesten alt.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Multiplikasjonsregelen:
  k uavhengige valg, n_i alternativer hver
  ⇒ n_1 · n_2 · ... · n_k totale utfall
  Eks: 4-sifret PIN: 10 · 10 · 10 · 10 = 10 000

Addisjonsregelen:
  Disjunkte tilfeller — adder antall i hvert.
  Eks: 1 av 4 røde eller 1 av 3 blå kort: 4 + 3 = 7.

Permutasjon (rekkefølge teller):
  P(n, k) = n! / (n−k)!
  Eks: topp-3 av 10 løpere: P(10, 3) = 10·9·8 = 720

Kombinasjon (rekkefølge teller IKKE):
  C(n, k) = (n choose k) = n! / (k!·(n−k)!)
  Eks: 5-korts hånd av 52 kort: C(52, 5) = 2 598 960`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Perm vs. komb — interaktivt</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Toggle mellom permutasjon og kombinasjon, juster n og k, og se alle
            utvalgene listes opp. Legg merke til at P(n,k) = C(n,k) · k! — hver
            kombinasjon gir k! permutasjoner.
          </p>
          <ChooseKExplorer />

          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Pascals trekant</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Klikk et tall — du ser begge «foreldre» (C(n−1, k−1) og C(n−1, k)) bli
              fremhevet og rekurrensen vises. Rad-sum = 2ⁿ er antall delmengder av en
              n-mengde.
            </p>
            <PascalTriangle />
          </div>

          <FallBox>
            <strong>Felle:</strong> spør deg alltid: <em>betyr rekkefølgen noe?</em> Hvis
            ja, permutasjon. Hvis nei, kombinasjon. Ekstra fallgruve: «med eller uten
            tilbakelegging?» — med tilbakelegging gir <code>nᵏ</code> (uavhengige valg),
            uten gir P(n,k) eller C(n,k).
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — kombinatorikk"
            problem={
              <>
                Hvor mange forskjellige passord på 8 tegn finnes, hvor hvert tegn er en
                bokstav (26 mulige) eller et siffer (10 mulige)?
              </>
            }
            answer={
              <>
                Multiplikasjonsregelen: 36 valg per posisjon, 8 posisjoner.
                <br />
                <strong>36⁸ ≈ 2.82 · 10¹²</strong> (rundt 2,8 billioner). Til
                sammenligning: 8 bokstaver alene = 26⁸ ≈ 209 milliarder. Å legge til
                sifrene gir 13× flere kombinasjoner.
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="kombinatorikk"
            nextSection={{ title: "Matematisk induksjon", anchor: "induksjon" }}
            questions={[
              {
                prompt: "Du skal velge 4 kort fra en kortstokk på 52. Hvor mange ulike HENDER (rekkefølge teller ikke)?",
                options: [
                  { text: "P(52, 4) = 6 497 400", correct: false, rationale: "Det er permutasjon — rekkefølge teller. En hånd har ikke rekkefølge." },
                  { text: "C(52, 4) = 270 725", correct: true, rationale: "Kombinasjon: C(52, 4) = 52!/(4!·48!) = 270 725. Bytt «rekkefølge teller IKKE» → C(n, k)." },
                  { text: "52⁴ = 7 311 616", correct: false, rationale: "Det forutsetter at samme kort kan plukkes flere ganger." },
                  { text: "52 · 4 = 208", correct: false, rationale: "Ikke en standard kombinatorikk-formel." },
                ],
              },
              {
                prompt: "10 personer går inn i en heis. Hvor mange ulike måter kan 3 av dem gå ut i FØRSTE etasje (rekkefølge irrelevant)?",
                options: [
                  { text: "C(10, 3) = 120", correct: true, rationale: "Vi velger UTEN rekkefølge: C(10, 3) = 120." },
                  { text: "P(10, 3) = 720", correct: false, rationale: "Det ville vært riktig hvis vi hadde brydd oss om hvem som gikk ut FØRST, ANDRE, TREDJE." },
                  { text: "3¹⁰ = 59 049", correct: false, rationale: "Det er hvis hver person uavhengig velger blant 3 etasjer." },
                  { text: "10! = 3 628 800", correct: false, rationale: "10! er alle permutasjoner av hele gruppen." },
                ],
              },
              {
                prompt: "Rad 5 i Pascals trekant er 1, 5, 10, 10, 5, 1. Hva er summen?",
                options: [
                  { text: "32", correct: true, rationale: "Σₖ C(n, k) = 2ⁿ. For n = 5: 2⁵ = 32. Også summen 1+5+10+10+5+1 = 32." },
                  { text: "25", correct: false, rationale: "5² = 25, men formelen er 2ⁿ ikke n²." },
                  { text: "120", correct: false, rationale: "5! = 120 — ikke rad-sum." },
                  { text: "10", correct: false, rationale: "Det er bare C(5, 2) eller C(5, 3) — én verdi i raden, ikke summen." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 6. INDUKSJON */}
        {/* ============================================================ */}
        <section id="induksjon" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">7. Matematisk induksjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For å vise at en påstand P(n) holder for ALLE n ≥ n₀: vis basistilfelle og
            steg. Tankebildet er dominoer — vipp den første, vis at hver feller den
            neste, så faller alle.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Strukturen til et induksjonsbevis:

  1. BASIS:    Vis P(n₀) er sann (typisk n₀ = 0 eller 1).
  2. STEG:     Anta P(k) sann (induksjonshypotesen, IH).
               Vis at P(k+1) følger fra IH.
  3. KONKLUSJON: Da gjelder P(n) for alle n ≥ n₀.`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Eksempel-bevis steg-for-steg</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk «Neste» for å gå gjennom et fullstendig induksjonsbevis av Gauss-formelen.
            Hvert algebraisk skritt fremheves med farge.
          </p>
          <StepProof
            title="Gauss-formelen: Σᵢ₌₁ⁿ i = n(n+1)/2"
            claim="For alle n ≥ 1 gjelder: 1 + 2 + 3 + ... + n = n(n+1)/2"
            steps={[
              {
                label: "Basis",
                line: "n = 1:   venstre = 1,   høyre = 1·2/2 = 1   ✓",
                highlight: "n = 1",
                hint: "Vi starter med det enkleste tilfellet. Sjekk at formelen stemmer for n = 1.",
              },
              {
                label: "IH",
                line: "Anta:  1 + 2 + ... + k = k(k+1)/2",
                highlight: "k(k+1)/2",
                hint: "Induksjonshypotesen (IH): anta påstanden gjelder for n = k. Vi vil bruke dette i neste steg.",
              },
              {
                label: "Steg",
                line: "Σᵢ₌₁ᵏ⁺¹ i  =  (1 + 2 + ... + k)  +  (k+1)",
                highlight: "(k+1)",
                hint: "Splitt summen opp til n = k+1: alle de gamle leddene pluss det nye (k+1).",
              },
              {
                label: "Steg",
                line: "             =  k(k+1)/2  +  (k+1)",
                highlight: "k(k+1)/2",
                hint: "Bruk IH til å erstatte (1 + 2 + ... + k) med k(k+1)/2.",
              },
              {
                label: "Steg",
                line: "             =  (k+1)·[k/2 + 1]",
                highlight: "(k+1)",
                hint: "Faktoriser ut den felles (k+1) fra begge leddene.",
              },
              {
                label: "Steg",
                line: "             =  (k+1)·(k+2)/2",
                highlight: "(k+2)/2",
                hint: "Forenkle: k/2 + 1 = (k + 2)/2.",
              },
              {
                label: "QED",
                line: "Det er formelen for n = k+1.  ✓",
                highlight: "k+1",
                hint: "Vi har vist at hvis P(k), så P(k+1). Sammen med basis: P(n) gjelder for alle n ≥ 1.",
              },
            ]}
          />

          <h3 className="text-sm font-semibold mb-2 mt-6">Domino-modellen</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk «Velt» — første brikke faller (basis), så feller hver brikke den
            neste (steget). Summen Σ₁..n oppdateres og verifiseres mot formelen.
          </p>
          <InductionDominoes />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Sterk induksjon (når «P(k) sann» ikke er nok)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Vanlig induksjon:    P(k) → P(k+1)
Sterk induksjon:     P(n₀) ∧ P(n₀+1) ∧ ... ∧ P(k) → P(k+1)

Brukes når P(k+1) avhenger av FLERE tidligere — typisk i rekursjons-bevis:
hver delproblems-størrelse er ulik. Eks: Fibonacci-egenskaper,
algoritme-korrekthet for splitt-og-hersk.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til rekursjon:</strong> et rekursivt program HAR sin korrekthet
            bevist ved induksjon. Basistilfelle = base case, steget = de rekursive kall.
            Hvis du sliter med å se hvorfor en rekursjon stemmer, skriv den som et
            induksjonsbevis.
          </FallBox>

          <h3 className="text-sm font-semibold mb-2 mt-6">Bygg et induksjonsbevis — Proof Lego</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Vis at 2ⁿ &gt; n for alle n ≥ 1. Plukk bevisstegene fra poolen og legg dem i
            riktig rekkefølge — fra basis via IH til konklusjon.
          </p>
          <ProofBuilder
            title="Bygg: 2ⁿ > n for alle n ≥ 1"
            claim="∀n ∈ ℕ, n ≥ 1 : 2ⁿ > n"
            hint="Standard induksjons-mal: BASIS for n=1, deretter ANTA P(k), så VIS at P(k+1) følger. I steget bruker du IH (2ᵏ > k) sammen med at 2 ≥ 1 for k ≥ 1."
            pieces={[
              {
                id: "basis",
                label: "Basis",
                text: "n = 1:  2¹ = 2 > 1 ✓",
                justification: "Det enkleste tilfellet — sjekk at påstanden holder for startverdien.",
              },
              {
                id: "ih",
                label: "IH",
                text: "Anta som induksjonshypotese:  2ᵏ > k.",
                justification: "Induksjonshypotesen — vi vil bruke denne i steget.",
              },
              {
                id: "step1",
                label: "Steg",
                text: "Vi vil vise:  2ᵏ⁺¹ > k + 1.",
                deps: ["ih"],
                justification: "Formuler målet for induksjonssteget.",
              },
              {
                id: "step2",
                label: "Steg",
                text: "2ᵏ⁺¹  =  2 · 2ᵏ",
                deps: ["step1"],
                justification: "Eksponent-regel.",
              },
              {
                id: "step3",
                label: "Steg",
                text: "       >  2 · k     (ved IH: 2ᵏ > k)",
                deps: ["step2", "ih"],
                justification: "Bruk IH til å erstatte 2ᵏ med en mindre nedre grense.",
              },
              {
                id: "step4",
                label: "Steg",
                text: "       =  k + k  ≥  k + 1     (siden k ≥ 1)",
                deps: ["step3"],
                justification: "Algebra: 2k = k + k, og k ≥ 1 fra premisset n ≥ 1.",
              },
              {
                id: "qed",
                label: "QED",
                text: "Altså 2ᵏ⁺¹ > k + 1, så P(k+1) holder.   Ved induksjon gjelder for alle n ≥ 1. ✓",
                deps: ["basis", "step4"],
                justification: "Basis + steg = induksjon. Konklusjon: påstanden gjelder for alle n ≥ 1.",
              },
            ]}
          />

          <ProblemBox
            title="Mini-oppgave — kvadratsum"
            problem={
              <>
                Vis ved induksjon at <code>Σᵢ₌₁ⁿ i² = n(n+1)(2n+1)/6</code>.
              </>
            }
            answer={
              <>
                <strong>Basis:</strong> n=1 ⇒ venstre = 1, høyre = 1·2·3/6 = 1 ✓<br />
                <strong>Steg:</strong> anta Σ₁..k = k(k+1)(2k+1)/6 (IH). Da:
                <br />
                Σ₁..(k+1) = k(k+1)(2k+1)/6 + (k+1)²
                <br />= (k+1) · [k(2k+1)/6 + (k+1)]
                <br />= (k+1) · [k(2k+1) + 6(k+1)] / 6
                <br />= (k+1)(2k² + 7k + 6)/6 = (k+1)(k+2)(2k+3)/6 ✓<br />
                Som er formelen for n = k+1.
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="induksjon"
            nextSection={{ title: "Grafer", anchor: "grafer" }}
            questions={[
              {
                prompt: "I et induksjonsbevis: hva er BASIS-tilfellet?",
                options: [
                  { text: "Den endelige konklusjonen om alle n", correct: false, rationale: "Det er målet — basis er det enkleste utgangspunktet, typisk n = 0 eller 1." },
                  { text: "Den minste verdien av n hvor P(n) skal verifiseres direkte", correct: true, rationale: "Basis er domino #1 — den må vippes manuelt for at resten skal kunne falle." },
                  { text: "Antagelsen P(k) er sann", correct: false, rationale: "Det er induksjonshypotesen (IH), ikke basis." },
                  { text: "Beviset av P(k+1) fra P(k)", correct: false, rationale: "Det er induksjonssteget, ikke basis." },
                ],
              },
              {
                prompt: "Når trenger du STERK induksjon i stedet for vanlig?",
                options: [
                  { text: "Når basisverdien er n = 0", correct: false, rationale: "Basisverdien påvirker ikke valg av styrke." },
                  { text: "Når P(k+1) avhenger av flere tidligere ledd, ikke bare P(k)", correct: true, rationale: "Eks: Fibonacci F(n) = F(n−1) + F(n−2) — steget trenger BÅDE P(k) og P(k−1). Da må IH dekke alle tidligere, ikke bare nærmeste." },
                  { text: "Når påstanden handler om grafer", correct: false, rationale: "Domenet er irrelevant." },
                  { text: "Når n er irrasjonalt", correct: false, rationale: "Induksjon kjører på ℕ (naturlige tall) uansett." },
                ],
              },
              {
                prompt: "Hva er IH (induksjonshypotesen) i et bevis av Σ i = n(n+1)/2?",
                options: [
                  { text: "Anta formelen er sann for alle n", correct: false, rationale: "Det er det vi vil VISE — IH ville vært sirkulært argument." },
                  { text: "Anta Σ₁..k i = k(k+1)/2 for et fastsatt k", correct: true, rationale: "IH er antagelsen at påstanden gjelder for ett bestemt k. Steget viser så at den også gjelder for k+1." },
                  { text: "Anta n = 1", correct: false, rationale: "Det er BASIS-tilfellet, ikke IH." },
                  { text: "Anta Σ = 0", correct: false, rationale: "Bare sant for n = 0 og ikke nyttig som IH." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 7. GRAFER */}
        {/* ============================================================ */}
        <section id="grafer" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">8. Grafer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En graf <code>G = (V, E)</code> er noder V og kanter E. Den abstrakte
            modellen for nettverk, kart, avhengigheter, sosiale grafer. Halve
            algoritme-pensumet handler om grafer.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Begrep                Definisjon
────────────────────────────────────────────────────────
Node (vertex)         Et element i V
Kant (edge)           Et par {u, v} med u, v ∈ V
Grad deg(v)           Antall kanter på v
Sti                   Sekvens av noder forbundet med kanter
Syklus                Sti som starter og slutter i samme node
Sammenhengende        Sti finnes mellom alle nodepar
Tre                   Sammenhengende graf UTEN sykler
                      → |E| = |V| − 1 alltid
Skog                  Disjunkt union av trær
Rettet (digraph)      Kanter har retning (u → v ≠ v → u)
Vektet                Hver kant har en vekt w(u,v)
DAG                   Rettet graf uten sykler (topologisk sort mulig)
Bipartitt             Noder deles i to grupper, kanter kun mellom
Komplett (Kₙ)         Alle nodepar har en kant; |E| = C(n,2)`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Graf-galleri</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Klikk presetene for å se klassiske grafstrukturer. Naboliste, grader og
            komponent-tall regnes ut live.
          </p>
          <GraphSandbox />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre representasjoner — når bruke hva?
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Naboliste:    adj[u] = [v1, v2, ...]      O(|V|+|E|) plass
              Standard for sparse grafer. Hurtig å iterere naboer.

Nabomatrise:  M[u][v] = 1 hvis kant         O(|V|²) plass
              O(1) kant-oppslag, men bruker mye plass. Bra for tette grafer.

Kantliste:    [(u1, v1), (u2, v2), ...]   O(|E|) plass
              Bra for algoritmer som sorterer kanter (Kruskals MST).`}</pre>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Handshake-lemmaet
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Σ_{v ∈ V} deg(v) = 2|E|

«Summen av grader er dobbelt antall kanter».
Hver kant bidrar 1 til grad-summen i hver ende.

Konsekvens: antallet noder med oddetalls-grad er alltid PARTALL.`}</pre>
          </div>

          <FallBox>
            <strong>Bro til AI og OS:</strong> BFS, DFS, Dijkstra, A* — alle opererer på
            grafer. Status-rommet i AI-søk ER en graf. Avhengighets-grafer i build-systemer.
            Ressurs-allokerings-grafer for deadlock. Når du ser «kan jeg komme fra X til
            Y under disse begrensningene?», tenk graf.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — tre-karakterisering"
            problem={
              <>
                En sammenhengende graf G har 12 noder. Hvor mange kanter har G hvis vi
                vet at G er et tre? Hva er minste og største kant-antall hvis G IKKE er
                spesifisert som tre?
              </>
            }
            answer={
              <>
                Tre: <strong>|E| = |V| − 1 = 11</strong>.<br />
                Generelt sammenhengende: minst 11 kanter (ellers ikke koblet), maks{" "}
                <code>C(12, 2) = 66</code> kanter (komplett graf K₁₂).
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="grafer"
            nextSection={{ title: "Modulær aritmetikk", anchor: "mod" }}
            questions={[
              {
                prompt: "En graf har 7 noder med gradene (5, 3, 3, 2, 2, 2, 1). Hvor mange kanter?",
                options: [
                  { text: "9", correct: true, rationale: "Σ deg = 5+3+3+2+2+2+1 = 18 = 2·|E|, så |E| = 9. Handshake-lemma." },
                  { text: "18", correct: false, rationale: "18 er Σ deg, ikke |E|. Hver kant teller 2 i grad-summen." },
                  { text: "7", correct: false, rationale: "Det er |V|, ikke |E|." },
                  { text: "Ugyldig sekvens", correct: false, rationale: "Sum er 18 (partall) — sekvensen passerer minimum-sjekk for gyldighet." },
                ],
              },
              {
                prompt: "Hva er den TYPISKE forskjellen mellom et tre og en generell sammenhengende graf?",
                options: [
                  { text: "Treet har akkurat |V| − 1 kanter og ingen sykler", correct: true, rationale: "Sammenhengende + |E| = |V| − 1 ⇔ tre. Mer enn |V| − 1 kanter i en sammenhengende graf ⇒ minst én syklus." },
                  { text: "Treet er rettet, generell graf er urettet", correct: false, rationale: "Trær kan være urettede også. Rotskifte er en separat operasjon." },
                  { text: "Treet er vektet, generell graf er uvektet", correct: false, rationale: "Vekting har ingenting med tre-egenskap å gjøre." },
                  { text: "Treet har sirkler, generell graf ikke", correct: false, rationale: "Motsatt: trær har ingen sykler per definisjon." },
                ],
              },
              {
                prompt: "BFS i en uvektet graf — hva garanterer den?",
                options: [
                  { text: "Korteste vei målt i ANTALL KANTER fra startnoden", correct: true, rationale: "BFS utforsker alle naboer på samme dybde før den går dypere. Det gjør at første gang du møter en node, har du brukt færrest mulig kanter." },
                  { text: "Korteste vei i en vektet graf", correct: false, rationale: "Det krever Dijkstra. BFS ignorerer kantvekter." },
                  { text: "Finner alle sykler", correct: false, rationale: "BFS finner et BFS-tre, ikke alle sykler eksplisitt." },
                  { text: "Sorterer noder etter grad", correct: false, rationale: "Det er ikke BFS sin funksjon." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* 8. MOD */}
        {/* ============================================================ */}
        <section id="mod" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">9. Modulær aritmetikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>a mod n</code> er resten når a deles med n. Vi skriver{" "}
            <code>a ≡ b (mod n)</code> når a og b gir samme rest — altså n deler
            differansen.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempler:
  17 mod 5  =  2          (17 = 3·5 + 2)
  17 ≡ 2 (mod 5)          (17 og 2 gir samme rest)
  17 ≡ -3 (mod 5)         (negative tilfeller: -3 + 5 = 2)

Egenskaper (mod n):
  (a + b) mod n  =  ((a mod n) + (b mod n)) mod n
  (a · b) mod n  =  ((a mod n) · (b mod n)) mod n
  (a^k) mod n     kan beregnes med fast eksponentiering

Klokke-aritmetikk: hva er kl 23 + 5 timer?
  23 + 5 = 28,  28 mod 24 = 4   ⇒ kl 04`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2">Mod-klokke</h3>
          <p className="text-xs text-muted-foreground mb-3">
            En sirkel med n posisjoner. Dra a og b — rød og cyan markerer hvor de
            «lander». Grønn er resultatet av operasjonen mod n.
          </p>
          <ModClock />

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Bruk: hash-tabell-indeksering
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def hash_index(key, table_size):
    return hash(key) % table_size

# table_size = 7
# hash("alice") = 4823957
# 4823957 mod 7 = 2  → legg i bucket 2

# Kollisjoner uunngåelig: mange ulike nøkler havner i samme bucket.
# Løsning: chaining (liste i bucket), eller open addressing (prøv neste).`}</pre>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Fast eksponentiering — beregne a^k mod n raskt
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def pow_mod(a, k, n):
    """Beregn a^k mod n i O(log k) tid."""
    result = 1
    a = a % n
    while k > 0:
        if k % 2 == 1:
            result = (result * a) % n
        a = (a * a) % n
        k //= 2
    return result

# pow_mod(3, 1000, 7) = 4  — uten å regne 3^1000 (et tall med 478 sifre).
# Dette er hjørnesteinen i RSA-kryptering.`}</pre>
          </div>

          <h3 className="text-sm font-semibold mb-2 mt-6">Euklids algoritme — gcd steg-for-steg</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Den eldste ikke-trivielle algoritmen vi kjenner (~300 fvt). Bruk: gcd er
            nøkkelen til modulær invers, brøkforkortelse og RSA. Hovedidé:{" "}
            <code>gcd(a, b) = gcd(b, a mod b)</code>.
          </p>
          <StepProof
            title="Beregn gcd(252, 198) med Euklid"
            claim="gcd(a, b) = gcd(b, a mod b), gjenta til resten er 0. Siste ikke-null rest er svaret."
            steps={[
              {
                label: "Start",
                line: "gcd(252, 198) = ?",
                hint: "Vi vil finne største felles divisor for 252 og 198.",
              },
              {
                label: "1",
                line: "252 = 1 · 198 + 54",
                highlight: "54",
                hint: "Del 252 på 198: kvotient 1, rest 54. Den nye gcd-en er gcd(198, 54).",
              },
              {
                label: "2",
                line: "198 = 3 · 54 + 36",
                highlight: "36",
                hint: "Erstatt paret (252, 198) → (198, 54). Del 198 på 54: rest 36.",
              },
              {
                label: "3",
                line: "54 = 1 · 36 + 18",
                highlight: "18",
                hint: "Nytt par (54, 36). Rest 18.",
              },
              {
                label: "4",
                line: "36 = 2 · 18 + 0",
                highlight: "0",
                hint: "Resten ble 0 — stopp. Den FORRIGE resten (18) er gcd.",
              },
              {
                label: "QED",
                line: "gcd(252, 198) = 18",
                highlight: "18",
                hint: "Sjekk: 252 = 14·18, 198 = 11·18. Ingen større tall deler begge. Algoritmen kjører i O(log min(a,b)) tid.",
              },
            ]}
          />

          <FallBox>
            <strong>Bro til kryptografi:</strong> RSA er fullt og helt modulær
            aritmetikk. Diffie-Hellman, Fermats lille teorem (aᵖ⁻¹ ≡ 1 mod p for primtall
            p), Eulers totient-funksjon φ(n) — alle bygger på <code>(mod p)</code> med
            primtall p. Hash, sjekksummer (CRC), pseudoslump — alt mod-aritmetikk.
          </FallBox>

          <ProblemBox
            title="Mini-oppgave — modulær aritmetikk"
            problem={
              <>
                Hva er (7¹⁰⁰) mod 11? <br />
                <span className="text-muted-foreground">
                  Tips: Fermats lille teorem sier at aᵖ⁻¹ ≡ 1 (mod p) for primtall p og a
                  ikke delelig med p.
                </span>
              </>
            }
            answer={
              <>
                11 er primtall, så 7¹⁰ ≡ 1 (mod 11) ved Fermat.
                <br />
                7¹⁰⁰ = (7¹⁰)¹⁰ ≡ 1¹⁰ = <strong>1</strong> (mod 11).
                <br />
                Dette trikset er hvorfor mod-eksponentiering er beregnings-vennlig: store
                eksponenter «kollapser» modulo primtall.
              </>
            }
          />

          <SectionQuiz
            courseId="diskret-matte"
            sectionId="mod"
            nextSection={{ title: "Oppsummering", anchor: "oppsummering" }}
            questions={[
              {
                prompt: "Hva er −7 mod 5?",
                options: [
                  { text: "−2", correct: false, rationale: "Mod-resultatet skal ALLTID være ikke-negativt, mellom 0 og n−1. Legg til 5 til du får riktig: −7 + 5 = −2 + 5 = 3." },
                  { text: "3", correct: true, rationale: "−7 = −2·5 + 3 (kvotient −2, rest 3). Verifikasjon: 3 og −7 differ med 10 = 2·5. Eller: −7 + 5 + 5 = 3." },
                  { text: "−7", correct: false, rationale: "Mod-resultatet er ALLTID i [0, n−1]." },
                  { text: "7", correct: false, rationale: "7 ≥ n = 5 — for stor." },
                ],
              },
              {
                prompt: "Hash-tabell med 8 buckets. Du har hash-verdiene {17, 25, 33, 41}. Hvilke kollisjoner får du?",
                options: [
                  { text: "Ingen kollisjoner", correct: false, rationale: "17 mod 8 = 1, 25 mod 8 = 1, 33 mod 8 = 1, 41 mod 8 = 1 — ALLE kolliderer i bucket 1!" },
                  { text: "Alle fire i samme bucket (bucket 1)", correct: true, rationale: "Hver verdi gir rest 1 mod 8: 17 = 2·8 + 1, 25 = 3·8 + 1, 33 = 4·8 + 1, 41 = 5·8 + 1. Klassisk patologisk-input." },
                  { text: "To og to par-kollisjoner", correct: false, rationale: "Sjekk for hånd: 17 mod 8 = 1, 25 mod 8 = 1 — all fire faktisk lander i samme bucket." },
                  { text: "17 og 25 kolliderer, de andre er unike", correct: false, rationale: "Alle fire kolliderer." },
                ],
              },
              {
                prompt: "Når har et tall a en MODULÆR INVERS modulo n?",
                options: [
                  { text: "Alltid, så lenge a ≠ 0", correct: false, rationale: "Eks: 2 mod 4 har ingen invers (2x ≡ 1 mod 4 har ingen løsning siden gcd(2, 4) = 2)." },
                  { text: "Hvis og bare hvis gcd(a, n) = 1", correct: true, rationale: "Bézout: gcd = 1 ⇔ ∃ x, y: ax + ny = 1 ⇔ ax ≡ 1 (mod n). Dette er hvorfor RSA krever koprime tall." },
                  { text: "Bare når n er primtall", correct: false, rationale: "Tilstrekkelig (alle a < n koprime med p) men ikke nødvendig — 4⁻¹ mod 9 = 7 finnes selv om 9 ikke er primtall." },
                  { text: "Bare når a er oddetall", correct: false, rationale: "Paritet er ikke avgjørende." },
                ],
              },
            ]}
          />
        </section>

        {/* ============================================================ */}
        {/* OPPSUMMERING */}
        {/* ============================================================ */}
        <section id="oppsummering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">10. Oppsummering — hva nå?</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
              Sjekkliste — kan du forklare?
            </div>
            <ul className="space-y-1.5 text-sm">
              <Check>Hvorfor p → q er sann når p er usann (vacuous truth)</Check>
              <Check>De Morgans lover anvendt på et SQL-WHERE</Check>
              <Check>Inkluderings-eksklusjons-formelen for to og tre mengder</Check>
              <Check>Forskjellen mellom injektiv, surjektiv, bijektiv</Check>
              <Check>Permutasjon vs. kombinasjon — hvilken og hvorfor</Check>
              <Check>Strukturen i et induksjonsbevis (basis → steg → konklusjon)</Check>
              <Check>Når en graf er et tre (|E| = |V| − 1 + sammenhengende)</Check>
              <Check>Handshake-lemmaet og hva det innebærer</Check>
              <Check>Hva «a ≡ b (mod n)» betyr og hvordan finne den</Check>
              <Check>Hvorfor mod-aritmetikk er hjørnesteinen i RSA</Check>
            </ul>
          </div>

          {/* SRS-drill CTA — løfter fram FSRS-modus filtrert på diskret-matte-kortene */}
          <Link
            to="/cards"
            search={{ mode: "study", category: "praktisk" } as never}
            className="block rounded-xl border-2 border-brand/40 bg-brand/5 hover:bg-brand/10 hover:border-brand p-5 mb-4 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-brand/15 p-2 shrink-0">
                <Brain className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Drill med spaced repetition →
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  20 flashcards for diskret matte — tautologier, De Morgan, Bayes-form,
                  induksjon, handshake-lemma, Fermat, Euklid. FSRS-algoritmen viser hvert
                  kort akkurat når du er i ferd med å glemme det.
                </p>
                <div className="mt-2 text-xs text-brand font-medium inline-flex items-center gap-1">
                  Åpne i SRS-modus
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <h3 className="font-semibold mb-2">Neste steg</h3>
            <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
              <li>
                <Link to="/drag" className="text-brand hover:underline">
                  Drag-oppgaver
                </Link>{" "}
                — filtrer på «Math foundations» / «Diskret matte» for 40+ kort med
                sannhetstabeller, mengde-operasjoner, n-velg-k, induksjon og mod.
              </li>
              <li>
                <Link
                  to="/stack/$slug"
                  params={{ slug: "sannsynlighet" }}
                  className="text-brand hover:underline"
                >
                  Sannsynlighet
                </Link>{" "}
                — bygger direkte på mengder (Ω er en mengde, hendelser er delmengder).
                <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
              </li>
              <li>
                <Link
                  to="/stack/$slug"
                  params={{ slug: "algoritmer" }}
                  className="text-brand hover:underline"
                >
                  Algoritmer
                </Link>{" "}
                — Big-O-bevis bruker induksjon, alle datastrukturer er grafer eller
                lineære oppslag.
              </li>
              <li>
                <Link
                  to="/stack/$slug"
                  params={{ slug: "kryptografi" }}
                  className="text-brand hover:underline"
                >
                  Kryptografi
                </Link>{" "}
                — modulær aritmetikk i praksis.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </StackPageShell>
  );
}

function FallBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      <div className="text-xs text-foreground">{children}</div>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
      <span className="text-foreground/90">{children}</span>
    </li>
  );
}

function ProblemBox({
  title,
  problem,
  answer,
}: {
  title: string;
  problem: React.ReactNode;
  answer: React.ReactNode;
}) {
  return (
    <details className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4 group">
      <summary className="cursor-pointer text-sm font-semibold text-foreground select-none">
        <span className="text-xs uppercase tracking-wider text-brand font-semibold">
          {title}
        </span>
        <div className="mt-1 font-normal text-foreground/90">{problem}</div>
        <div className="mt-1 text-[11px] text-muted-foreground italic group-open:hidden">
          Klikk for å se fasit ↓
        </div>
      </summary>
      <div className="mt-3 pt-3 border-t border-brand/20 text-sm text-foreground/90 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
