import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { CpuVisualizer } from "@/components/stack/trinn-4-cpu/CpuVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Visualisering — fetch-decode-execute live", anchor: "visualisering" },
  { title: "CPU-blokkdiagram — én tegning", anchor: "blokk" },
  { title: "Fetch — hente instruksjon fra minne", anchor: "fetch" },
  { title: "Decode — bestemme hva instruksjonen er", anchor: "decode" },
  { title: "Execute — ALU, register-skriv, hopp", anchor: "execute" },
  { title: "Pipeline — flere instruksjoner samtidig", anchor: "pipeline" },
  { title: "Cache-hierarki — hvor minne kommer fra", anchor: "cache" },
  { title: "RISC vs CISC", anchor: "risc-cisc" },
];

export function Trinn4CpuPage() {
  return (
    <StackPageShell title="4. CPU" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            CPU-en — fetch, decode, execute
          </h1>
          <p className="mt-3 text-muted-foreground">
            Vi har transistorer, porter, addere, registre. Nå monterer vi
            dem sammen til en CPU. Den gjør én ting i en evig loop: hente en
            instruksjon, finne ut hva den betyr, og utføre den. Igjen og
            igjen, milliarder ganger i sekundet.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «CPU-arkitektur» — fetch-decode-execute rekkefølge,
              register-roller, RISC vs CISC, cache-hierarki.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-4-cpu" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Visualisering — fetch-decode-execute live
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før vi går gjennom hver fase i prosa: prøv visualiseringen
            under. Velg et lite program, så steges du gjennom de fire
            fasene (fetch, decode, execute, writeback) én om gangen. Du
            ser PC (program counter), IR (instruksjons-register),
            register-fila, ALU-en og RAM lyse opp etter hvert som
            dataene flyter mellom dem.
          </p>
          <CpuVisualizer />
          <p className="mt-3 text-xs text-muted-foreground">
            Tips: start med <span className="font-mono">MOV R0, 5</span>{" "}
            (enklest — kun immediate), gå videre til{" "}
            <span className="font-mono">LOAD</span> /{" "}
            <span className="font-mono">STORE</span> for å se data-bussen
            mot RAM, og avslutt med «Sum 1..3» for et fullt program med
            løkke (PC inkrementerer, JNZ hopper).
          </p>
        </section>

        <section id="blokk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. CPU-blokkdiagram — én tegning</h2>
          <p className="text-sm text-muted-foreground mb-4">
            La oss begynne med å se hele CPU-en på et skall-nivå. Detaljene
            kommer etterpå, men dette bildet er kartet du holder i hodet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Forenklet RISC-CPU:

  ┌─────────────────────────────────────────────────────────┐
  │                          CPU                              │
  │                                                           │
  │   ┌──────┐    ┌──────────┐    ┌──────────────────┐       │
  │   │  PC  │───►│ Instr.   │───►│ Control unit     │       │
  │   │ (PC) │    │ Memory   │    │ (decoder)        │       │
  │   └──────┘    └──────────┘    └─┬────────┬───────┘       │
  │      ▲                          │        │                │
  │      │                          │ steuer │ steuer         │
  │      │                          ▼        ▼                │
  │      │                       ┌──────┐  ┌────┐             │
  │      │                       │ ALU  │  │MUX │             │
  │      │                       │      │  │    │             │
  │      └───────────────────────┘ +,- │  └────┘             │
  │                              │ etc.│                       │
  │                              └──┬──┘                       │
  │                                 │                          │
  │                          ┌──────▼───────┐                  │
  │                          │  Register-   │                  │
  │                          │  fil         │                  │
  │                          │  (x0..x31)   │                  │
  │                          └──────┬───────┘                  │
  └─────────────────────────────────┼──────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │  RAM      │   ← lager byte-adressert
                              │ (data)    │     data, programmer
                              └───────────┘

Hovedaktørene:
  PC          : Program Counter, peker til neste instruksjon i RAM
  Instr. mem  : RAM som inneholder programmet (bytes)
  Decoder     : leser instruksjonen og lager kontroll-signaler
  ALU         : utfører +, -, AND, OR, shift, sammenligning
  Register-fil: 32 (eller flere) registre, 32 eller 64 bits hver
  RAM         : adresserbart minne for variabler/heap/stack`}</pre>
          </div>
        </section>

        <section id="fetch" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Fetch — hente instruksjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver klokkesyklus (eller -gruppe) gjør CPU-en dette først: bruk
            verdien i PC som adresse, les ut 4 bytes (en 32-bit instruksjon
            på RISC-V), og legg den i Instruction Register (IR).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Fetch-syklus:

  PC = 0x1000                  (vi vil ha instruksjonen på adresse 0x1000)
        │
        ▼
  ┌─────────────┐
  │  Memory     │ ──► henter 4 bytes på 0x1000
  │  read       │
  └─────┬───────┘
        │
        ▼
  IR = 0x00b50533     (instruksjonen — vi vet ikke hva den betyr ennå)

Samtidig: PC := PC + 4  (forberede neste fetch)


I sann CPU er det selvsagt mer optimering:
  - Instruksjons-cache (I-cache) — RAM er treg, så vi har en
    liten kopi rett ved siden av decoder-en. Når PC peker inn i
    cachen, slipper vi 200+ klokkesykluser ventetid.
  - Prefetch — CPU prøver å forutsi neste 8-16 instruksjoner og
    laste dem opp før decoder-en spør.`}</pre>
          </div>
        </section>

        <section id="decode" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Decode — hva betyr instruksjonen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            32 bits er bare bytes. Decoder-en deler dem opp i felter etter
            ISA-en (Instruction Set Architecture). Resultatet er kontroll-signaler:
            hvilken ALU-operasjon? Hvilke registre? Lagre i RAM eller register?
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel: RISC-V "add x10, x10, x11" — koden 0x00b50533

  31      25 24    20 19    15 14  12 11      7 6      0
  ┌─────────┬────────┬────────┬──────┬─────────┬────────┐
  │ funct7  │  rs2   │  rs1   │funct3│   rd    │ opcode │
  │ 0000000 │ 01011  │ 01010  │ 000  │  01010  │0110011 │
  └─────────┴────────┴────────┴──────┴─────────┴────────┘
       0      x11      x10     ADD     x10      R-type

  Decoder leser opcode (0110011 = R-type aritmetikk).
  Den ser funct3=000 og funct7=0000000 → operasjonen er ADD.
  rs1 og rs2 sier hvilke registre skal leses (x10 og x11).
  rd sier hvor resultatet skal skrives (x10).

Kontroll-signaler som decoder-en lager:
  RegRead     = 1           (vi skal lese registre)
  ALUop       = ADD
  RegWrite    = 1           (vi skal skrive resultatet)
  RegWriteSrc = ALU         (verdien kommer fra ALU)
  MemRead     = 0           (vi rører ikke RAM)
  MemWrite    = 0
  Branch      = 0           (ingen hopp)`}</pre>
          </div>
        </section>

        <section id="execute" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Execute — ALU, register-skriv, hopp</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Med signalene fra decoder-en utfører resten av CPU-en
            operasjonen. ALU-en regner ut, register-filen skrives, eller
            RAM leses/skrives.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Execute "add x10, x10, x11":

  1. Les x10 og x11 fra register-filen   ──► a = x10, b = x11
  2. Send a, b til ALU med ALUop = ADD    ──► result = a + b
  3. RegWrite=1 og rd=x10                 ──► x10 := result
  4. PC := PC + 4                          ──► neste instruksjon

Hele instruksjonen tok 1 klokkesyklus i en enkel implementering.


For en LOAD: lw x10, 0(x11)
  1. Les x11 fra reg.fil  ──► base = x11
  2. ALU: base + 0          ──► adresse
  3. MemRead på adressen   ──► data = RAM[adresse]
  4. RegWrite: x10 := data

For en BRANCH: beq x10, x11, label
  1. Les x10, x11
  2. ALU: x10 - x11 (sammenligning gjennom subtraksjon)
  3. Hvis Zero-flag fra ALU:  PC := PC + offset
     Ellers:                  PC := PC + 4`}</pre>
          </div>
        </section>

        <section id="pipeline" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Pipeline — flere instruksjoner samtidig</h2>
          <p className="text-sm text-muted-foreground mb-4">
            I praksis utfører moderne CPU-er fetch på instruksjon N+3 mens
            decoder jobber med N+2 og ALU med N+1 og register-skriv med N.
            Hver fase er en stage i et samlebånd.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klassisk 5-stage pipeline (RISC-V):

    IF ── ID ── EX ── MEM ── WB
   fetch decode exec  memory write-back

  Klokkesyklus:   1     2     3     4     5     6     7     8
  Instr 1:        IF    ID    EX   MEM   WB
  Instr 2:              IF    ID    EX   MEM   WB
  Instr 3:                    IF    ID    EX   MEM   WB
  Instr 4:                          IF    ID    EX   MEM   WB

  Resultat: én instruksjon fullføres PER klokkesyklus
  (i et perfekt scenario uten avhengigheter).

Problemer:
  - Data-hazard: Instr 2 trenger resultatet av Instr 1.
    Forwarding: send resultatet rett fra EX til neste EX uten
    å vente på WB.
  - Branch-hazard: Vet ikke om vi skal hoppe før EX er ferdig.
    Branch prediction: gjett, og rygg tilbake hvis feil.
  - Stall: hvis ingenting hjelper, sett en NOP i pipelinen.

Moderne CPU-er har 14-20 stages, kan ha 4-6 instruksjoner i
parallell (superscalar), og kjører "out of order".`}</pre>
          </div>
        </section>

        <section id="cache" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Cache-hierarki</h2>
          <p className="text-sm text-muted-foreground mb-4">
            RAM er tregt. CPU-en holder kopier av mye-brukte data nær seg.
            Typisk i 3 nivåer L1/L2/L3, hver større men tregere.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Minnehierarki — størrelse vs latency:

  Lag      Størrelse    Tid (klokkesykluser)   Tid (ns ved 3 GHz)
  ───────  ───────────  ────────────────────   ──────────────────
  Register     ~256 B           0 (gratis)            0
  L1 cache     32-64 KB         3-4                   1 ns
  L2 cache     256-512 KB       10-15                 4 ns
  L3 cache     8-32 MB          30-50                 15 ns
  RAM          8-128 GB         200-300              100 ns
  SSD          1+ TB            ~150 000             50 µs
  HDD          ditto            ~30 000 000          10 ms
  Nettverk     —                10⁷-10⁹              ms-s

  Mellom L1 og RAM er det 100x forskjell. Mellom RAM og SSD
  500x. Mellom RAM og HDD 100 000x.

Hva betyr dette for kode?
  - Data-localitet teller (les bytes i rekkefølge — cache-vennlig)
  - Random access til 4 GB array er TREGT
  - Hvorfor en for-loop over en array er raskere enn en linked list:
    arrayet ligger i sammenhengende minne ► cache-treff ► raskt.`}</pre>
          </div>
        </section>

        <section id="risc-cisc" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. RISC vs CISC</h2>
          <p className="text-sm text-muted-foreground mb-4">
            To filosofier for instruksjonssett. RISC: få, enkle, raske
            instruksjoner. CISC: mange, mektige instruksjoner som
            potensielt gjør mer per instruksjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`                RISC (RISC-V, ARM)        CISC (x86, x86-64)
                ────────────────────       ─────────────────────
  Instruksjoner   ~50-200                   ~1000+
  Format          fast lengde (4 B)         variabel (1-15 B)
  Operander       reg, reg, reg            reg, reg, mem, reg+reg*8+offset, ...
  Eksempel        add x1, x2, x3            add eax, [rsp+8]
                                            (RAM aksess i samme instruksjon)

  Filosofi        kompiler optimaliserer    instruksjonen optimaliserer
                  enkel hardware            kompleks hardware

  Strømforbruk    lavt (mobil, embedded)    historisk høyt (desktop, server)
  Praksis         alle mobil-CPU-er, M1/M2  Intel/AMD desktop & server

Moderne realitet:
  - x86-CPU-er oversetter CISC-instruksjoner til interne RISC-aktige
    "micro-ops" i front-end. Innenfor chippen jobber den med µops.
  - Skillene er mer historiske enn praktiske i dag.
  - Hva som teller: ISA-stabilitet, ecosystem, kompilator-støtte.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            I trinn 5 ser vi på faktisk assembly. Vi bruker x86-64 (det de
            fleste laptops har) og refererer til RISC-V der det er enklere.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : register-roller, fetch-decode-execute, cache, RISC vs CISC.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-5-assembly" }} className="text-brand hover:underline">
                Trinn 5 — Assembly
              </Link>
              : mov, add, jmp, call, ret. <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="cpu" />
      </div>
    </StackPageShell>
  );
}
