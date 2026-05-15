import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { AdderVisualizer } from "./AdderVisualizer";

const STEPS = [
  { title: "Interaktiv visualisering", anchor: "viz" },
  { title: "Hva er en adder", anchor: "hva" },
  { title: "Half-adder — to bits inn, sum og carry", anchor: "half" },
  { title: "Full-adder — håndterer carry-in", anchor: "full" },
  { title: "Ripple-carry — 8 bits adder fra 8 full-addere", anchor: "ripple" },
  { title: "SR-latch og D-flip-flop — å huske én bit", anchor: "flipflop" },
  { title: "Register — flere flip-flopper i takt", anchor: "register" },
];

export function Trinn3AddersPage() {
  return (
    <StackPageShell title="3. Adders & flip-flops" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 3
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Adders &amp; flip-flops — fra logikk til aritmetikk og minne
          </h1>
          <p className="mt-3 text-muted-foreground">
            To kvalitative sprang i dette trinnet. Først bygger vi en{" "}
            <em>adder</em> — kretsen som regner ut 1+1=10. Så bygger vi en
            flip-flop — den minste bygesteinen som kan{" "}
            <em>huske</em> én bit mellom klokke-tikk. Til sammen blir det
            registre, og dermed grunnlaget for en CPU.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «CPU-arkitektur» — register-roller og hierarki.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-3-adders" steps={STEPS} />

        <section id="viz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Interaktiv visualisering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vipp bits, se hvilke wires som lyser opp, og la carry-en ringle
            gjennom 4-bit ripple-carry-adderen ett steg om gangen. Bytt til
            subtraksjons-modus for å se hvordan to&apos;s complement gjør samme
            adder om til en subtraktor (A - B = A + ~B + 1).
          </p>
          <AdderVisualizer />
        </section>

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er en adder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vi vil regne med tall, og tall lagres som binære bit-strenger.
            En adder er en krets som tar to bit-strenger og produserer
            summen. Akkurat slik du gjør på papir — med carry — bare på
            binær form og i hardware.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Binær addisjon, akkurat som på papir:

        1   ←── carry
   0 1 1 1     (7)
 + 0 1 0 1     (5)
 ─────────
   1 1 0 0    (12)

Hver kolonne tar to bits inn + en eventuell carry inn,
og produserer en sum-bit og en carry-bit ut.

Det er nøyaktig hva en full-adder gjør, og det er den vi
bygger nå.`}</pre>
          </div>
        </section>

        <section id="half" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Half-adder — to bits inn, sum og carry</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En half-adder tar to bits (A, B) og produserer sum (S) og carry
            (C). Den er «half» fordi den ikke tar carry-in — den brukes
            bare på den minst signifikante bit-en.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sannhetstabell:

  A B │ S  C
  ────┼──────
  0 0 │ 0  0
  0 1 │ 1  0
  1 0 │ 1  0
  1 1 │ 0  1     ← 1+1 = 10 binært (sum=0, carry=1)

Boolske uttrykk:
  S = A XOR B
  C = A AND B

Krets:
                ┌──── XOR ──── S
   A ──────┬────┤
            │    │
   B ──┬───┘    │
        │        │
        └────────┤
                ┌──── AND ──── C
   A ──────────┤
   B ──────────┘

Bare to porter. Trivielt.`}</pre>
          </div>
        </section>

        <section id="full" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Full-adder — håndterer carry-in</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver kolonne utenom den minst signifikante må kunne ta i mot en
            carry fra kolonnen til høyre. Det krever en full-adder med tre
            innganger: A, B, Cin.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Sannhetstabell (tre innganger, to utganger):

  A B Cin │ S  Cout
  ────────┼─────────
  0 0  0  │ 0   0
  0 0  1  │ 1   0
  0 1  0  │ 1   0
  0 1  1  │ 0   1    ← 1+1 = 10
  1 0  0  │ 1   0
  1 0  1  │ 0   1
  1 1  0  │ 0   1
  1 1  1  │ 1   1    ← 1+1+1 = 11

Boolske uttrykk:
  S    = A XOR B XOR Cin
  Cout = (A AND B) OR (Cin AND (A XOR B))

Krets (en full-adder er bare to half-addere + en OR):

          ┌──────── XOR ───────────┐
          │                          XOR ──── S
   A ─────┤                          │
          │                  ┌──────┘
   B ─────┤            Cin ──┘
          │
          │          ┌──── AND ──┐
          ├──────────┤            │
          │     B ───┘            │
                                   OR ──── Cout
          ┌──── AND ──────────────┘
   Cin ───┤
   A⊕B ───┘

To half-addere + en OR. Pent.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Notér: vi sier ALU-en «adderer», men den lager også substraksjon
            (A - B = A + (NOT B) + 1, via two's complement — se trinn 7),
            sammenligning, multipliasjon. Adder-en er ALU-ens hjerte.
          </p>
        </section>

        <section id="ripple" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Ripple-carry adder — 8 bits fra 8 full-addere</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Å bygge en N-bits adder er nå bare å stable N full-addere og
            koble Cout til neste Cin. Det heter ripple-carry fordi carry-en
            «ringler» fra høyre mot venstre gjennom alle.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`8-bit ripple-carry adder:

  A7 B7   A6 B6   A5 B5   A4 B4   A3 B3   A2 B2   A1 B1   A0 B0
   │  │    │  │    │  │    │  │    │  │    │  │    │  │    │  │
   ▼  ▼    ▼  ▼    ▼  ▼    ▼  ▼    ▼  ▼    ▼  ▼    ▼  ▼    ▼  ▼
  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
  │FA7 │◄─│FA6 │◄─│FA5 │◄─│FA4 │◄─│FA3 │◄─│FA2 │◄─│FA1 │◄─│FA0 │◄── 0 (Cin)
  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘  └─┬──┘
    │       │       │       │       │       │       │       │
    ▼       ▼       ▼       ▼       ▼       ▼       ▼       ▼
   S7      S6      S5      S4      S3      S2      S1      S0
   │
   ▼
  Cout (overflow-bit)

Hver FA = full-adder. Cout går videre til Cin på neste.

Tidskostnad: hvis hver FA bruker T tid, så bruker en N-bits
ripple-carry NT tid. Det er sakte ved store N. Derfor finnes
det smartere strukturer (carry-lookahead, carry-save) — som
ikke trenger å vente på carry-en.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Når du i Python skriver <code>a + b</code> og a, b er 64-bits
            heltall, kjører ALU-en effektivt en 64-bits adder. Den bruker
            ikke ripple-carry alene, men en kombinasjon av lookahead-strategier
            for å holde forsinkelsen lav.
          </p>
        </section>

        <section id="flipflop" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. SR-latch og D-flip-flop — huske én bit</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hittil har alle porter vært{" "}
            <em>kombinatoriske</em>: utgangen er kun en funksjon av
            inngangene. For å bygge minne trenger vi feedback —
            en krets som husker hva som ble satt forrige gang.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`SR-latch (Set-Reset) bygd av to NOR-porter:

   S ──┐
        NOR ──┬────── Q
   ─────┐    │
        ▼    │
   ┌──────────┘
   │
   │   ┌──────────┐
   └──►│ NOR      ├────── /Q  (motsatt av Q)
   R ─►│          │
       └──────────┘

  S=1, R=0  ► Q=1 ("sett")
  S=0, R=1  ► Q=0 ("reset")
  S=0, R=0  ► Q HOLDER forrige verdi    ← det er hukommelse!
  S=1, R=1  ► forbudt (begge utganger 0)


D-flip-flop (data + clock):
  Vi vil unngå det forbudte mønsteret og bare ha én data-input.
  D-flip-flopen leser D på stigende kant av clock og holder den
  til neste stigende kant.

       D ──┬────► gated SR-latch ────► Q
            │
       CLK ─┘     (klokken styrer NÅR vi leser D)

  Tidsplan:
              D:     ┌──────┐         ┌─────
              CLK:   _▁▁_▁▁_▁▁_▁▁_▁▁_▁▁_     <- klokken tikker
              Q:     ─────────┐    ┌─────
                              └────┘
                          ↑                ↑
                  D leses ved stigende kant av CLK`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            En D-flip-flop husker nøyaktig én bit. Den endrer seg bare når
            klokken tikker. Det er hele synkron digital design — alt skjer
            «på taktslag».
          </p>
        </section>

        <section id="register" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Register — flere flip-flopper i takt</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et register er bare N flip-flopper koblet i parallell, med felles
            klokke. Det husker N bits. En 64-bits CPU har registre på 64
            bits — dvs. 64 flip-flopper hver.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`8-bits register:

  D7 ──►┌──┐    D6 ──►┌──┐    ...    D0 ──►┌──┐
        │FF│           │FF│                 │FF│
   ┌───►│  │───► Q7    │  │───► Q6     ...  │  │───► Q0
   │    └──┘           └──┘                 └──┘
   │     ▲              ▲                    ▲
  CLK ───┴──────────────┴────────────────────┘

  På hver stigende klokkekant:
    Q0..Q7 oppdateres med D0..D7
  Mellom klokkekantene:
    Q0..Q7 HOLDER verdien

Det er en byte (8 bits) som kan oppdateres atomisk hver klokkesyklus.

Hva slags registre har en CPU?
  - Program Counter (PC)   — peker til neste instruksjon
  - Instruction Register (IR) — instruksjonen som dekodes nå
  - Generelle registre (x86: RAX, RBX, ... eller RV: x0..x31)
  - Status-flags (zero, carry, overflow, negative)
  - Stack pointer (SP)
  - Mer.. alle er flip-flop-rekker, alle styres av samme klokke.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Med adder, registre og litt styringslogikk har vi nå alt vi
            trenger for å bygge en ekte CPU. Det er hva neste trinn
            handler om.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : register-roller, fetch-decode-execute.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-4-cpu" }} className="text-brand hover:underline">
                Trinn 4 — CPU
              </Link>
              : fetch, decode, execute, ALU og kontrollogikk.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
