import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva en transistor faktisk er", anchor: "hva" },
  { title: "Halvledere — hvorfor silisium leder noen ganger", anchor: "halvleder" },
  { title: "MOSFET — gate styrer strømmen", anchor: "mosfet" },
  { title: "NMOS og PMOS — to varianter, en CMOS", anchor: "nmos-pmos" },
  { title: "Transistoren som digital bryter", anchor: "bryter" },
  { title: "Fra én transistor til en milliard", anchor: "skalering" },
];

export function Trinn1TransistorPage() {
  return (
    <StackPageShell title="1. Transistoren som bryter" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 1
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transistoren — bryteren som datamaskinen er bygd av
          </h1>
          <p className="mt-3 text-muted-foreground">
            Alt — hver eneste bit som beveger seg gjennom CPU-en din nå —
            koker ned til milliarder av små brytere som slås av og på. Vi
            starter helt nederst: hva er en transistor egentlig, og hvorfor
            kan den virke som en bryter uten bevegelige deler?
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Transistor» — match NMOS/PMOS, gate-spenninger, hvordan
              switchen leder eller blokkerer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-1-transistor" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva en transistor faktisk er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En transistor er en bryter med tre bein. Ett av beina (gate)
            bestemmer om de to andre (source og drain) er koblet sammen
            elektrisk eller ikke. Ingen mekanikk, ingen relé — bare et
            elektrisk felt som åpner eller stenger en kanal i en silisiumbit.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Symbol for en NMOS-transistor:

                  Drain  (D)
                    │
                    │
        Gate (G) ──┤│
                    │
                    │
                  Source (S)

Tre bein:
  G = gate    — kontroll-input (spenning hit styrer bryteren)
  D = drain   — strøm ut
  S = source  — strøm inn (vanligvis koblet til GND for NMOS)

Tenk på det som en kran:
  G = håndtaket    (du styrer det)
  D / S = røret    (vannet flyter eller ikke)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Når gate-spenningen er over en terskel (Vt, typisk ~0.5V), åpnes
            en ledende kanal mellom source og drain. Under terskelen er
            kanalen stengt og ingen strøm går gjennom. Det er hele
            hemmeligheten bak digital elektronikk.
          </p>
        </section>

        <section id="halvleder" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Halvledere — hvorfor silisium leder noen ganger</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Silisium i ren form er en isolator (omtrent). Men ved å blande
            inn små mengder andre atomer (doping) kan vi gjøre det til en
            leder vi kan slå av og på.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Si  Si  Si  Si        Rent silisium:
                       hvert Si-atom deler 4 elektroner
Si  Si  Si  Si         med naboene. Ingen frie elektroner.
                       (isolator)
Si  Si  Si  Si


Si  Si  Si  Si        n-dopet silisium:
                       Erstatt noen Si med P (5 valenselektroner).
Si  Si  P*  Si        Ett ekstra elektron blir til overs — fritt!
        ↓              (P* = fosfor med løst elektron)
Si  Si  Si  Si        Resultat: ledende, mange frie elektroner.


Si  Si  Si  Si        p-dopet silisium:
                       Erstatt noen Si med B (3 valenselektroner).
Si  Si  B°  Si        Mangler ett — et "hull" der et elektron burde vært.
        ↑              (B° = bor med hull)
Si  Si  Si  Si        Resultat: ledende via hull som "flyttes".`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hele trikset er PN-overgangen — der p-dopet og n-dopet silisium
            møtes. Avhengig av hvilken vei spenningen står, slipper den
            strøm gjennom eller ikke. MOSFETen lager en slik overgang som
            styres av et tredje elektrode, gaten.
          </p>
        </section>

        <section id="mosfet" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. MOSFET — gate styrer strømmen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            MOSFET står for{" "}
            <strong>Metal-Oxide-Semiconductor Field-Effect Transistor</strong>.
            En metallplate (gate) ligger over silisiumet, med en tynn
            isolerende oksidlag mellom. Når vi setter spenning på gaten,
            tiltrekker det ladninger som danner en ledende kanal i silisiumet
            UNDER oksidet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tverrsnitt av en NMOS-transistor:

       Source            Gate (metall)            Drain
         │                   │                      │
       ┌─┴─┐  ┌─────────────┴──────────────┐    ┌─┴─┐
       │ + │  │     oksid (SiO2, isolator)  │    │ + │
       │ n │  └─────────────────────────────┘    │ n │     n+ = sterkt n-dopet
       └───┘                                      └───┘
             p-substrat (p-dopet silisium)
       ─────────────────────────────────────────────


Når Vgs = 0V (gate på samme spenning som source):
  Ingen kanal under gate. Source og drain er ELEKTRISK SEPARERT
  av p-substratet. INGEN strøm flyter.
                                                    ┌─────────┐
                                                    │  AV  ✗  │
                                                    └─────────┘

Når Vgs > Vt (gate over terskelen, typisk +1V til +3.3V):
  Positiv ladning på gate tiltrekker elektroner i p-substratet.
  En tynn n-kanal dannes RETT UNDER oksidet:

       Source            Gate            Drain
         │ + │===========================│ + │
              ↑↑↑↑ inversjon ↑↑↑↑
         elektroner tiltrukket av gate-spenning
                                                    ┌─────────┐
                                                    │  PÅ  ✓  │
                                                    └─────────┘`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Vi setter aldri noen strøm GJENNOM gaten (oksidlaget er en
            isolator). Vi setter bare en spenning. Det er derfor MOSFETer
            bruker så lite strøm når de bare står — det er bare lade-strøm
            inn til en bittelliten kondensator.
          </p>
        </section>

        <section id="nmos-pmos" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. NMOS og PMOS — to varianter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det finnes to grunnvarianter, og moderne CPU-er bruker BEGGE i
            par. Det kalles CMOS (Complementary MOS) — den dominerende
            teknologien i all moderne digital elektronikk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`        NMOS                           PMOS
   (n-type, n-kanal)              (p-type, p-kanal)

        D                              D
        │                              │
    G ──┤│ (har n-substrat)        G ──┤O (sirkel = invertert)
        │                              │
        S                              S


Sannhetstabell:

  NMOS:                          PMOS:
    Vg = LAV   → AV (åpen)         Vg = LAV   → PÅ (lukket)
    Vg = HØY   → PÅ (lukket)       Vg = HØY   → AV (åpen)

  altså: NMOS leder når gate er HØY
         PMOS leder når gate er LAV     (motsatt!)


CMOS-inverter — bygd av én PMOS og én NMOS:

           Vdd (+3.3V)
            │
          ──┤O   PMOS (leder når input = LAV)
       │    │
   IN──┤    ├── OUT
       │    │
          ──┤│   NMOS (leder når input = HØY)
            │
           GND (0V)

  IN = 0  ► PMOS leder, NMOS av    ► OUT = Vdd = 1
  IN = 1  ► PMOS av, NMOS leder    ► OUT = GND = 0

  Det er en NOT-port! Bygd av nøyaktig 2 transistorer.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Geniet i CMOS: i steady state (når inngangen ikke endrer seg) er
            ALLTID nøyaktig én av de to transistorene AV. Det betyr at det
            ikke flyter strøm fra Vdd til GND. Det er derfor batteridrevne
            enheter funker — strøm brukes nesten bare under bryting.
          </p>
        </section>

        <section id="bryter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Transistoren som digital bryter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vi bryr oss ikke om strømmer og spenninger i detalj. Vi bryr oss
            om to nivåer: «høyt» (logisk 1, typisk Vdd) og «lavt» (logisk 0,
            typisk GND). Alt mellom er en analog mellomgreie vi prøver å unngå.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Spenning vs logisk verdi:

   Vdd  ┤━━━━━━━━━━━ "1" (typisk 3.3V eller 1.2V i moderne chips)
        │
        │ (forbudt sone — kort overgang)
        │
   GND  ┤━━━━━━━━━━━ "0" (0V)

Tid på inngangen:        Tid på utgangen (etter inverter):

   1  ┌───┐                    1   ┐   ┌──
      │   │                        │   │
   0  ┘   └───                 0   └───┘

           ↑
       En transistor-switch tar typisk 10-100 picosekunder å bytte.
       (1 ps = 10⁻¹² sekunder. På 1 ns bytter den 10 ganger.)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Akkurat dette — å definere TO nivåer og kalle dem 0 og 1 — er
            grunnen til at all digital logikk kan stables ovenpå transistorer.
            Resten av kurset er bare oppskrifter for hvordan man kobler
            transistor-brytere sammen til mer komplekse mønstre.
          </p>
        </section>

        <section id="skalering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Fra én transistor til en milliard</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En moderne CPU har 10-100 milliarder transistorer på en chip på
            størrelse med en fingernegl. Hver transistor er bygd med
            litografi — vi belyser silisiumet gjennom en maske, og kjemiske
            prosesser etser ut mønsteret.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Skala over tid (Moores lov — fordoblet hvert ~2. år):

  År    Transistorer pr. chip   "Node" (gate-lengde)
  ────  ──────────────────────  ────────────────────
  1971  2 300       (Intel 4004)        10 µm
  1985  275 000     (Intel 386)         1.5 µm
  2000  42 000 000  (Pentium 4)         180 nm
  2010  1 170 000 000  (Core i7)        32 nm
  2024  ~100 000 000 000  (M-series)    3 nm

  3 nm = 30 atomer på rad. Vi nærmer oss fysiske grenser.

Hva betyr "én chip"?

   ┌────────────────────────────────────┐
   │ Wafer (300 mm silisium-skive)      │
   │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐         │   <- 100+ chips per wafer
   │  │ │ │ │ │ │ │ │ │ │ │ │         │
   │  └──┘ └──┘ └──┘ └──┘ └──┘         │
   │  ...                               │
   └────────────────────────────────────┘
                ↓
             En chip:
        ┌─────────────────┐
        │  CPU-kjerner    │   <- 10 mrd. transistorer
        │  L1/L2/L3-cache │      som er bare brytere
        │  GPU, NPU       │      stablet i pent mønster
        │  I/O, minne-ctl │
        └─────────────────┘`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Poenget: det som ser ut som magi er bare en absurd MENGDE
            transistorer som hver gjør én enkel ting — slippe strøm gjennom
            eller stenge den. Resten av denne kurslinjen viser hvordan vi
            bygger oss oppover, ett lag av abstraksjon om gangen.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : match transistor-typer, gate-spenninger, hvordan switchen virker.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-2-nand-porter" }} className="text-brand hover:underline">
                Trinn 2 — NAND og logiske porter
              </Link>
              : bygg AND, OR, NOT, XOR fra bare NAND. <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
