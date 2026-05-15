import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { GateVisualizer } from "./GateVisualizer";

const STEPS = [
  { title: "Interaktiv port-bygger", anchor: "visualizer" },
  { title: "Hva en logisk port er", anchor: "hva" },
  { title: "NAND — den universelle porten", anchor: "nand" },
  { title: "Bygge NOT, AND, OR fra NAND", anchor: "bygging" },
  { title: "XOR og kombinatorisk logikk", anchor: "xor" },
  { title: "Sannhetstabeller som design-verktøy", anchor: "sannhetstabell" },
  { title: "Eksempel — en 2-til-1 multiplexer", anchor: "mux" },
];

export function Trinn2NandPorterPage() {
  return (
    <StackPageShell title="2. NAND og logiske porter" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 2
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            NAND-porten — én port for å bygge alle andre
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vi har transistorer. Nå pakker vi dem inn i den minste praktiske
            byggeklossen: en logisk port. NAND er spesiell — alt annet kan
            bygges av kun NAND-er. Det er en av matematikkens elegante
            grunnpilarer at universet av digital logikk koker ned til én
            port.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Logiske porter» — match porter til sannhetsverdier, bygg
              AND fra NAND, kombinatorikk-quiz.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-2-nand-porter" steps={STEPS} />

        <section id="visualizer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv port-bygger
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vri på bryterne, bytt port-type, og se hvordan ledningene lyser
            grønt når de fører 1. I de tre siste modusene bygger vi AND, OR
            og en hel halvadder fra kun NAND-porter — det er hele poenget
            med «funksjonelt komplett».
          </p>
          <GateVisualizer />
        </section>

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva en logisk port er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En port tar én eller flere binære innganger (0 eller 1) og
            produserer én utgang. Bak hver port sitter et lite nett av
            transistorer som vi nå ser bort fra — vi tenker på porten som
            black-box med en sannhetstabell.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Grunnportene:

  AND          OR           NOT          NAND          NOR          XOR
  A B Y        A B Y        A Y          A B Y         A B Y        A B Y
  0 0 0        0 0 0        0 1          0 0 1         0 0 1        0 0 0
  0 1 0        0 1 1        1 0          0 1 1         0 1 0        0 1 1
  1 0 0        1 0 1                     1 0 1         1 0 0        1 0 1
  1 1 1        1 1 1                     1 1 0         1 1 0        1 1 0

  Symboler:

   A ─┐                A ─┐               A ─▷○─ Y
       D── Y                ▷── Y       (NOT = trekant + boble)
   B ─┘                B ─┘
      (AND, flat front)    (OR, buet front)

  NAND = AND etterfulgt av NOT (en boble på utgangen):

   A ─┐
       D○── Y
   B ─┘

  Y = 0 BARE når A=1 OG B=1. Ellers er Y = 1. "Not AND".`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            En port lager én ny bit. Tusenvis av porter satt sammen kan
            implementere alle aritmetiske, sammenlignende og styringslige
            operasjoner CPU-en din gjør. Vi skal se det skje konkret i de
            neste trinnene.
          </p>
        </section>

        <section id="nand" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. NAND — den universelle porten</h2>
          <p className="text-sm text-muted-foreground mb-4">
            NAND er «funksjonelt komplett»: enhver boolsk funksjon kan
            uttrykkes med kun NAND-er. Det betyr i praksis at en hel CPU kan
            bygges fra én eneste type port — og produsenter elsker det fordi
            det forenkler litografi-prosessen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`En NAND-port består av 4 transistorer i CMOS:

           Vdd
            │
       ┌────┴────┐
       │         │
     ──┤O P1   P2├O──   <- to PMOS i parallell, pullup mot Vdd
       │         │
       └─┬───┬───┘
         │   │
         └─┬─┘────────── Y (utgang)
           │
        ─┐ │ ┌─
       N1└─┤ │   <- to NMOS i serie, pulldown mot GND
       ┌─┐ │ ┌─
     A─┤   │   ├─N2
       │   │   │
       └─┬─┴─┬─┘
         GND     (gates: P1 og N1 styres av A, P2 og N2 av B)

  A=1, B=1  ► begge NMOS leder (serie OK), begge PMOS av  ► Y=GND=0
  ellers    ► minst én NMOS av, minst én PMOS leder       ► Y=Vdd=1

  Det er nøyaktig NAND-tabellen.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Bare 4 transistorer per NAND, og CMOS bruker nesten ingen strøm i
            ro. Det er derfor man kan stable milliarder uten å smelte
            chippen.
          </p>
        </section>

        <section id="bygging" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bygge NOT, AND, OR fra NAND</h2>
          <p className="text-sm text-muted-foreground mb-4">
            La oss vise konkret hvordan vi konstruerer de andre portene fra
            kun NAND-er. Dette er ikke akademisk — det er sånn produsenter
            faktisk gjør det når de optimaliserer for én ports-type.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`NOT fra NAND (kort-slutt begge inngangene):

  A ──┬─┐
       │ NAND──── Y    Y = NAND(A,A) = NOT A
  A ──┴─┘

  Sannhetstabell:  A=0 → NAND(0,0) = 1
                   A=1 → NAND(1,1) = 0    ✓ riktig


AND fra NAND (NAND fulgt av NOT):

  A ──┐
       NAND─── X ──┬─┐
  B ──┘             │ NAND──── Y    Y = NOT(NAND(A,B)) = AND(A,B)
                X──┴─┘

  Brukt 2 NANDer for én AND. Litt bortkastet, men prinsippet stemmer.


OR fra NAND (DeMorgan: A OR B = NOT(NOT A AND NOT B)):

  A ──┬─┐
       │ NAND──── (NOT A) ─┐
  A ──┴─┘                    NAND──── Y
                              │
  B ──┬─┐                     │
       │ NAND──── (NOT B) ─┘
  B ──┴─┘

  Y = NAND(NOT A, NOT B) = NOT(NOT A AND NOT B) = A OR B    ✓


Det er hele DeMorgan i ett bilde:
    A OR B  =  NOT(NOT A AND NOT B)
    A AND B =  NOT(NOT A OR NOT B)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            DeMorgans lover er ikke filosofi — det er praktisk
            kretsdesign. De gir oss to ekvivalente måter å implementere det
            samme på, og vi velger den som er enklest/raskest å bygge.
          </p>
        </section>

        <section id="xor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. XOR og kombinatorisk logikk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            XOR (exclusive OR) er «sann hvis nøyaktig én av inngangene er
            sann». Den er hjertet i adder-en vi bygger i neste trinn.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`XOR fra 4 NAND-er:

  A ──┬────────┐
      │         │ NAND──── M1 ──┐
      │   B ──┬─┘                │ NAND──── M3 ──┐
      │       │                  │                │ NAND─── Y
      │       │                  │                │
      └───┐   └──── M1 ──────────┘                │
          │                                        │
   A ─────┤  NAND──── M2 ────────────────────────┘
   B ─────┘

  Tegningen er forenklet — fyll inn fra sannhetstabellen:

   A B │ Y = A XOR B
   ────┼─────────────
   0 0 │ 0
   0 1 │ 1     (en av dem er 1)
   1 0 │ 1     (en av dem er 1)
   1 1 │ 0     (begge — ikke "exclusive")

  Boolsk uttrykk: Y = (A AND NOT B) OR (NOT A AND B)
                    = A·B' + A'·B

Hierarki:
  4 NANDer ────► 1 XOR
  ?? NANDer ────► 1 adder
  millioner NANDer ────► 1 CPU`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Kombinatorisk logikk = utgangen er en ren funksjon av inngangene
            akkurat nå (ingen hukommelse). I trinn 3 legger vi på{" "}
            <em>sekvensiell</em> logikk (flip-flop) som kan huske én bit
            mellom klokke-tikk.
          </p>
        </section>

        <section id="sannhetstabell" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Sannhetstabeller som design-verktøy</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når du skal bygge en krets, starter du med sannhetstabellen.
            Deretter «leser av» kretsen ved å se på radene som gir 1.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel: en «majority of 3»-port.
Y = 1 hvis flertallet av A, B, C er 1.

  A B C │ Y
  ──────┼───
  0 0 0 │ 0
  0 0 1 │ 0
  0 1 0 │ 0
  0 1 1 │ 1   ← rad gir 1: NOT A · B · C
  1 0 0 │ 0
  1 0 1 │ 1   ← rad gir 1: A · NOT B · C
  1 1 0 │ 1   ← rad gir 1: A · B · NOT C
  1 1 1 │ 1   ← rad gir 1: A · B · C

Sum-of-products (bare ta hver 1-rad og OR dem):
  Y = A'BC + AB'C + ABC' + ABC

Forenklet (Karnaugh-kart):
  Y = AB + BC + AC

Implementering: 3 AND-porter + 1 OR med 3 innganger.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hele digital design er denne workflow-en: bestem hva du vil ha
            (sannhetstabellen), forenkle uttrykket (Karnaugh-kart eller
            algebra), legg ut portene. Det blir litt tørt — men det er
            grunnen til at en CPU faktisk funker.
          </p>
        </section>

        <section id="mux" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksempel — en 2-til-1 multiplexer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En multiplexer (MUX) velger mellom to innganger basert på en
            kontroll-bit. Den er overalt i CPU-en — i ALU-en, i
            register-filen, i instruksjonsdekoderen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`2-til-1 MUX:
  Hvis S = 0  ► Y = A
  Hvis S = 1  ► Y = B

  Sannhetstabell:
    S A B │ Y
    ──────┼───
    0 0 0 │ 0
    0 0 1 │ 0
    0 1 0 │ 1     <- S=0, så Y = A = 1
    0 1 1 │ 1
    1 0 0 │ 0
    1 0 1 │ 1     <- S=1, så Y = B = 1
    1 1 0 │ 0
    1 1 1 │ 1

  Y = A·NOT(S) + B·S


  Skjematisk:

      A ──┐
           AND──┐
   NOT(S)─┘     │
                OR── Y
      B ──┐     │
           AND──┘
       S ─┘

  4 inverter (NOT) + 2 AND + 1 OR. Eller, alt fra NAND:
  ~10 NAND-porter. Hver NAND ~4 transistorer. ~40 transistorer
  for én MUX. En moderne CPU har millioner av dem.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Når vi i trinn 4 ser på CPU-en, vil du se MUX-er overalt: «velg
            mellom register 1 og register 2», «velg mellom add-resultat og
            sub-resultat», «velg mellom PC+4 og hopp-adresse». Det er den
            samme byggeklossen om og om igjen.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : sannhetsverdier, bygg AND fra NAND, kombinatorikk-quiz.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-3-adders" }} className="text-brand hover:underline">
                Trinn 3 — Adders &amp; flip-flops
              </Link>
              : fra logiske porter til addisjon og hukommelse.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
