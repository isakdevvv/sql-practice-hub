import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Minneoppsett — hvor ligger hva", anchor: "minneoppsett" },
  { title: "Pekere — adresser til bytes", anchor: "pekere" },
  { title: "Stack-allokering — lokale variabler", anchor: "stack" },
  { title: "Heap-allokering — malloc og free", anchor: "heap" },
  { title: "Vanlige feil og segfaults", anchor: "feil" },
  { title: "Strukturer og alignment", anchor: "struct" },
];

export function Trinn6CMinnePage() {
  return (
    <StackPageShell title="6. C — minne og pekere" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 6
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            C — minne, pekere, og hvor bytes faktisk ligger
          </h1>
          <p className="mt-3 text-muted-foreground">
            C er et tynt slør over assembly. Det føyer til navn og
            datatyper, men under er det fortsatt bare bytes på adresser.
            Hvis du forstår hvor en variabel ligger, hvor lenge den lever,
            og hvor pekeren peker, så er C en glede. Hvis ikke, blir det
            segfaults.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «C-minne» — stack vs heap, peker-syntaks, malloc/free,
              segfault-årsaker.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-6-c-minne" steps={STEPS} />

        <section id="minneoppsett" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Minneoppsett — hvor ligger hva</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når en C-prosess kjører, har den et virtuelt adresserom som ser
            sånn ut (forenklet):
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Adresserom for en typisk Linux x86-64 prosess:

  0x7FFFFFFFFFFF  ┌─────────────────────────────┐  Høyeste adresser
                  │   STACK                     │
                  │   (vokser ↓ nedover)        │  ← rsp peker hit
                  │                              │
                  ├─────────────────────────────┤
                  │                              │
                  │       (ledig)                │
                  │                              │
                  ├─────────────────────────────┤
                  │   HEAP                      │  ← malloc returnerer her
                  │   (vokser ↑ oppover)         │
                  ├─────────────────────────────┤
                  │   BSS  — usatte globale     │  int x;     ← 0-initialisert
                  ├─────────────────────────────┤
                  │   DATA — initialiserte globale │  int x = 5;
                  ├─────────────────────────────┤
                  │   TEXT — kompilert kode (.text) │  funksjonenes maskinkode
  0x000000400000  └─────────────────────────────┘  Laveste adresser

  Hver byte har en unik 64-bit adresse. malloc(N) gir deg N
  sammenhengende bytes på heapen.

Hver region har forskjellige egenskaper:
  TEXT: read+execute (men ikke skriv) — derfor segfault ved kode-modifisering
  DATA/BSS: read+write, ikke execute
  HEAP/STACK: read+write, IKKE execute (NX bit) — derfor stack-smashing er hardere`}</pre>
          </div>
        </section>

        <section id="pekere" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Pekere — adresser til bytes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En peker er et 64-bits tall som inneholder en adresse. Type-en
            (<code>int*</code>, <code>char*</code>) sier hvor mange bytes
            som ligger der, og hvordan de skal tolkes.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`int x = 42;
int *p = &x;       // p er adressen til x

  Minne:
    Adresse        Innhold       Type
    0x7fff0010 ┌──┬──┬──┬──┐
               │2A│00│00│00│ ← x (4 bytes, little-endian, = 42)
               └──┴──┴──┴──┘
    0x7fff0018 ┌──┬──┬──┬──┬──┬──┬──┬──┐
               │10│00│ff│7f│00│00│00│00│ ← p (8 bytes = 0x7fff0010)
               └──┴──┴──┴──┴──┴──┴──┴──┘

  *p        ← "dereferens": 4 bytes på adressen i p, tolket som int → 42
  p         ← selve adressen: 0x7fff0010
  &x        ← adressen til x: samme som p
  p + 1     ← p pluss sizeof(int) bytes = 0x7fff0014

Peker-aritmetikk:
  Type    sizeof   p+1 hopper N bytes
  char*     1       1 byte
  int*      4       4 bytes
  long*     8       8 bytes
  double*   8       8 bytes
  void*     -       (UDEFINERT — kan ikke aritmetikk uten cast)

Array decay — arrays blir pekere:
  int arr[5];
  arr[2]      // ekvivalent med *(arr + 2)
  &arr[2]     // ekvivalent med arr + 2

  Du kan ikke se forskjellen mellom 'int *p' og 'int arr[]'
  inni en funksjon. Et array-argument ER en peker.`}</pre>
          </div>
        </section>

        <section id="stack" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Stack-allokering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lokale variabler ligger på stacken. Kompilatoren lager plass
            ved å trekke fra rsp i prologen, og frigjør plass ved å
            tilbakeføre i epilogen. Det er gratis (én sub-instruksjon) og
            automatisk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`void foo(void) {
    int a = 10;
    int b = 20;
    char buf[64];
}

Stack-frame for foo:

   rbp ──►  [gammelt rbp]
            [return-adresse]
   rbp-4 ── int a = 10
   rbp-8 ── int b = 20
   rbp-72 ── char buf[64] (64 bytes)
   rsp ──►  [ledig nederst]

   sub rsp, 80    ; lager 80 bytes (med litt padding for alignment)

Når foo returnerer:
   add rsp, 80    ; gir alt tilbake
   ret

Tre kjente feilmodi med stack:

  1. Stack overflow — for dyp rekursjon eller for stort buf:
       void rec(void) { int big[10000]; rec(); }
       // ENNÅ et nivå, stack vokser nedover... → SIGSEGV

  2. Dangling stack-pointer — returnere peker til lokal variabel:
       int* lager(void) {
           int x = 5;
           return &x;     // x dør når funksjonen returnerer!
       }                    // pekeren er nå garbage

  3. Buffer overflow — skrive forbi enden av en stack-buffer:
       char buf[8];
       strcpy(buf, "Dette er en lang streng");
       // skriver over return-adressen → kan kapres til shellcode`}</pre>
          </div>
        </section>

        <section id="heap" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Heap-allokering — malloc og free</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når du trenger minne som lever lenger enn én funksjon, eller
            som er for stort for stacken, bruker du heapen via{" "}
            <code>malloc</code> (og frigjør med <code>free</code>).
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`#include <stdlib.h>

int *arr = malloc(100 * sizeof(int));   // be om 400 bytes
if (arr == NULL) {                       // ALLTID sjekk!
    // out of memory
    return -1;
}
arr[0] = 42;
arr[99] = 100;
// ... bruk arr ...
free(arr);     // frigjør tilbake til allokator
arr = NULL;    // god skikk — unngå use-after-free

malloc-implementasjonen (forenklet):
  - Holder en liste over ledige minne-blokker
  - Når du spør om N bytes, finner den en passende blokk
  - Hvis ingen passer: 'sbrk'/'mmap' for å vokse heapen fra OS
  - free legger blokken tilbake i ledig-listen, slår sammen naboer

Reglene:
  ✓ ALLTID free det du malloc-er
  ✓ Sjekk NULL-retur
  ✓ Ikke free det samme to ganger (double-free → crash)
  ✓ Ikke bruk en peker etter free (use-after-free → udefinert)
  ✗ Ikke malloc(0) på en peker du allerede har — du leaker

Memory-leak-eksempel:

  void leak(void) {
      int *p = malloc(1024);
      if (some_error) return;     // glemte free!  ← LEKKER 1024 bytes
      free(p);
  }
  // Hver kall til leak() med error vokser prosessens minneforbruk.`}</pre>
          </div>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Vanlige feil og segfaults</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Segmentation fault» betyr at prosessen prøvde å lese eller
            skrive til en adresse OS-en ikke ga tillatelse til. Det er
            CPU-en som klager (MMU-en, egentlig).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klassiske segfault-årsaker:

1. NULL-peker dereferens:
     int *p = NULL;
     *p = 5;            // SIGSEGV: skrive til adresse 0

2. Bruk av uinitialisert peker:
     int *p;             // peker til "tilfeldig" adresse
     *p = 5;            // SIGSEGV (eller verre — silent corruption)

3. Skrive forbi array-grensen:
     int arr[10];
     arr[10000] = 1;    // SIGSEGV hvis adressen er ulovlig

4. Bruk etter free:
     int *p = malloc(4);
     free(p);
     *p = 5;            // udefinert oppførsel (kan virke, kan krasje)

5. Returnere peker til lokal:
     char *navn(void) { char b[16] = "ola"; return b; }
     // b dør på stacken når funksjonen returnerer

6. Skrive til read-only minne:
     char *s = "hei";   // s peker til TEXT-segmentet (ofte)
     s[0] = 'H';        // SIGSEGV — TEXT er read-only

Verktøy som hjelper:
  - valgrind --leak-check=full   : finn memory leaks og use-after-free
  - gdb a.out                     : interaktiv debugger
                                    (gdb) run → segfault → bt for stack-trace
  - AddressSanitizer (gcc -fsanitize=address) : runtime-sjekker innebygd
  - clang static analyzer         : statisk peker-analyse`}</pre>
          </div>
        </section>

        <section id="struct" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Strukturer og alignment</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En struct er bare en sammensetning av felter. Kompilatoren
            legger til padding for at hvert felt skal være aligned på en
            adresse som er delelig med sin egen størrelse — det er en
            CPU-krav for raske aksesser.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`struct Punkt {
    char  c;        // 1 byte
    int   x;        // 4 bytes
    char  d;        // 1 byte
    double y;       // 8 bytes
};

Layout (med padding):

  Offset  Innhold     Bytes
  ──────  ──────────  ─────
  0       c           1
  1-3     (padding)   3      ← int må starte på multiplum av 4
  4-7     x           4
  8       d           1
  9-15    (padding)   7      ← double må starte på multiplum av 8
  16-23   y           8

  sizeof(struct Punkt) = 24, IKKE 14.

Du kan redusere padding ved å sortere fra størst til minst:

   struct Punkt2 {
       double y;     // 8
       int    x;     // 4
       char   c;     // 1
       char   d;     // 1
       // 2 bytes padding på slutten for at neste struct skal være aligned
   };
   sizeof(struct Punkt2) = 16

Aksesser:
   struct Punkt p;
   p.x         // direkte
   (&p)->x     // via peker
   ptr->x      // hvis ptr er struct Punkt*

  Begge "->"  og "."  blir til samme mov-instruksjon i assembly —
  bare med offset-konstant.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            I trinn 7 ser vi nærmere på hvordan bytes blir til tall i
            structen — endianness, signed-tall og floats.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : stack vs heap, peker-syntaks, malloc/free, segfault-årsaker.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-7-bytes-dyp" }} className="text-brand hover:underline">
                Trinn 7 — Bytes &amp; tall
              </Link>
              : endianness, two's complement, IEEE 754.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
