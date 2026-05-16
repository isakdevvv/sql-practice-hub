import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const BitsDypVisualizer = lazy(() =>
  import("./BitsDypVisualizer").then((m) => ({ default: m.BitsDypVisualizer })),
);

const STEPS = [
  { title: "Bit-manipulasjon — interaktiv", anchor: "bit-vis" },
  { title: "Bits, bytes og hex", anchor: "bits-bytes" },
  { title: "Endianness — big vs little", anchor: "endian" },
  { title: "Unsigned heltall", anchor: "unsigned" },
  { title: "Signed — two's complement", anchor: "signed" },
  { title: "IEEE 754 — floats og doubles", anchor: "float" },
  { title: "Tekst — ASCII, UTF-8, surrogater", anchor: "tekst" },
];

export function Trinn7BytesDypPage() {
  return (
    <StackPageShell title="7. Bytes & str — dypere" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 7
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bytes &amp; tall — hva bytene faktisk betyr
          </h1>
          <p className="mt-3 text-muted-foreground">
            Bytes er bare bytes. Det er TOLKNINGEN som gir dem mening — som
            heltall, flyttall, tegn, eller noe helt annet. Vi går nøyaktig
            gjennom alle de vanlige tolkningene. Når du ser
            «UnicodeDecodeError» eller «integer overflow» igjen, skal du
            kunne tegne ut hva som skjedde.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Bytes-representasjon» — endianness, signed-tall, IEEE 754.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-7-bytes-dyp" steps={STEPS} />

        <section id="bit-vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Bit-manipulasjon — prøv selv
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bytene er bare bits. Operatorene under er hvordan vi faktisk
            jobber med dem — i C, Python, Java, SQL, alt. Klikk på bits,
            dra på slidere, og se hvordan AND/OR/XOR, skift, to-er-komplement
            og bitmasker oppfører seg.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <BitsDypVisualizer />
          </Suspense>
        </section>

        <section id="bits-bytes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Bits, bytes og hex</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`En byte = 8 bits, 256 mulige verdier.

Skrivemåter for tallet 165:

  Desimal:  165
  Binær:    10100101
  Hex:      0xA5         ← to hex-tegn per byte, mye lettere å lese

Hver hex-tegn = 4 bits (nibble):

  bin    hex
  0000   0
  0001   1
  ...
  1001   9
  1010   A
  1011   B
  ...
  1111   F

  10100101  =  1010 0101  =  A 5  =  0xA5
              ────  ────
              øvre  nedre
              nibble nibble

To hex-tegn = 8 bits = 1 byte = 0..255 (unsigned) eller -128..127 (signed).

Hex-dump-format (vanlig i debuggere):

  Offset      Bytes                                       ASCII
  ─────────   ──────────────────────────────────────────  ────────────────
  00000000:   48 65 6c 6c 6f 2c 20 77  6f 72 6c 64 21 0a    Hello, world!.
  00000010:   00 00 00 00 00 00 00 00  00 00 00 00 00 00    ..............

  16 bytes per linje, gruppe-på-8, hex til venstre og
  printable-ASCII til høyre.`}</pre>
          </div>
        </section>

        <section id="endian" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Endianness — big vs little</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Multi-byte verdier (16/32/64 bits) kan lagres på to måter i
            minne: med mest signifikante byte først (big-endian) eller
            sist (little-endian).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`32-bits tall:  0x12345678
  (mest signifikant byte = 0x12, minst = 0x78)

  Big-endian (BE) — MSB først, "som vi skriver":

    Adresse:  0x0000  0x0001  0x0002  0x0003
    Byte:     0x12    0x34    0x56    0x78
              MSB                     LSB

  Little-endian (LE) — LSB først, "snudd":

    Adresse:  0x0000  0x0001  0x0002  0x0003
    Byte:     0x78    0x56    0x34    0x12
              LSB                     MSB

Hvem bruker hva?
  x86/x86-64   :  little-endian  ← det du har
  ARM (vanlig) :  little-endian
  RISC-V        :  little-endian
  PowerPC       :  begge (konfigurerbart)
  Nettverk     :  big-endian (kalt "network byte order")

Hvorfor vi bryr oss:
  - Binær fil skrevet på BE-system og lest på LE-system blir feil
  - Send 32-bit int over socket: må konvertere til BE først (htonl)
  - Hex-dump fra en LE-fil ser "snudd" ut hvis du tenker
    desimalt — int 1 lagres som "01 00 00 00", ikke "00 00 00 01".

C-funksjoner for konvertering:
  htons() / htonl()   host → network (big-endian)
  ntohs() / ntohl()   network → host

Python:
  import struct
  struct.pack(">I", 0x12345678)   # b'\\x12\\x34\\x56\\x78' (big)
  struct.pack("<I", 0x12345678)   # b'\\x78\\x56\\x34\\x12' (little)`}</pre>
          </div>
        </section>

        <section id="unsigned" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Unsigned heltall</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Unsigned = "positiv eller null". Alle bits brukes til verdien.

  8-bit  uint8_t  :  0 .. 255
  16-bit uint16_t :  0 .. 65 535
  32-bit uint32_t :  0 .. 4 294 967 295
  64-bit uint64_t :  0 .. 18 446 744 073 709 551 615

Verdiformel:
  verdi = b7·2⁷ + b6·2⁶ + b5·2⁵ + ... + b1·2¹ + b0·2⁰

Eksempel: 0b10100101 = 1·128 + 0·64 + 1·32 + 0·16 + 0·8 + 1·4 + 0·2 + 1·1
                     = 128 + 32 + 4 + 1
                     = 165 ✓

Overflow (uint8_t):
  255 + 1 = ?
     11111111
   + 00000001
   ──────────
   1 00000000   ← carry-out, men det er bare 8 bits → 0

  Resultatet er 0 (modulo 256). I C er unsigned overflow definert
  oppførsel (wraps around). For signed er det UDEFINERT — UB.`}</pre>
          </div>
        </section>

        <section id="signed" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Signed — two's complement</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Negative tall er lagret som «two's complement» — den enkleste
            metoden for hardware. ALU-en trenger ikke en egen
            subtraksjons-krets; samme adder fungerer.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Two's complement — hvordan negere et tall:

  1. Inverter alle bits (NOT)
  2. Legg til 1

  Eksempel: -5 i 8-bit:
    5     = 0000 0101
    NOT 5 = 1111 1010
    + 1   = 1111 1011    ← det er -5 (= 0xFB)

  Sjekk: 5 + (-5) =
    0000 0101
  + 1111 1011
  ──────────
  1 0000 0000  ← carry ut, men 8 bits → 0 ✓

Rekkevidde for signed:
  int8_t  : -128 .. +127     (1 negativ mer enn positiv)
  int16_t : -32 768 .. +32 767
  int32_t : -2 147 483 648 .. +2 147 483 647   ← MAX_INT i Java/C
  int64_t : ~ ±9.2 × 10¹⁸

Hvordan vet vi om det er negativt? MSB (mest signifikante bit).
  MSB = 0  →  positivt eller null
  MSB = 1  →  negativt

Konvertere signed → desimal:
  0x80 (= 1000 0000) i int8_t:
    MSB er 1, så det er negativt.
    Inverter+1 for å finne magnitude:
       1000 0000  →  0111 1111 + 1 = 1000 0000 = 128
    Verdi: -128.

Eksamen-felle: int overflow er udefinert i C. Eksempel:
  int x = INT_MAX;
  x = x + 1;   // teknisk UB, kompilatoren kan anta det ikke skjer`}</pre>
          </div>
        </section>

        <section id="float" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. IEEE 754 — floats og doubles</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et flyttall i C/Python/JS er ikke et heltall med komma. Det er
            sign-exponent-mantissa, en form for binær vitenskapelig
            notasjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Single precision (float, 32 bits):

   31 30        23 22                                0
  ┌───┬───────────┬───────────────────────────────────┐
  │ S │  Exponent │            Mantissa               │
  │ 1 │   8 bits  │            23 bits                │
  └───┴───────────┴───────────────────────────────────┘

  Verdi = (-1)^S × 1.M × 2^(E-127)

  S = sign-bit (0 = positiv, 1 = negativ)
  E = exponent + bias (127). Faktisk exponent = E - 127.
  M = mantissa. Det er ALLTID en implisitt 1 før kommaet.


Double precision (double, 64 bits):

   63 62          52 51                                                  0
  ┌───┬─────────────┬───────────────────────────────────────────────────┐
  │ S │   Exponent  │                  Mantissa                         │
  │ 1 │   11 bits   │                  52 bits                          │
  └───┴─────────────┴───────────────────────────────────────────────────┘

  Verdi = (-1)^S × 1.M × 2^(E-1023)

Eksempel: tallet 5.5 som float (32 bit):
  5.5  = 101.1 (binær)  = 1.011 × 2²

  S = 0          (positiv)
  E = 2 + 127 = 129 = 10000001
  M = 01100...0  (23 bits, "011" + 20 nuller)

  Resultat: 0 10000001 01100000000000000000000
           = 0x40B00000

Spesialverdier:
  0.0     : E=0, M=0
  Inf     : E=255 (all 1s), M=0
  -Inf    : E=255, M=0, S=1
  NaN     : E=255, M ≠ 0
  Denormal: E=0, M ≠ 0 (veldig små tall, sub-normal)

Det er hvorfor 0.1 + 0.2 != 0.3 i alle disse språkene:
  0.1 har INGEN eksakt binær representasjon (akkurat som 1/3 i desimal).
  0.1 ≈ 0.10000000000000000555...
  0.2 ≈ 0.20000000000000001110...
  sum = 0.30000000000000004440...`}</pre>
          </div>
        </section>

        <section id="tekst" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Tekst — ASCII, UTF-8</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tekst er bare bytes med en avtalt tolkning. ASCII bruker 7
            bits per tegn (128 mulige). UTF-8 utvider til hele Unicode
            (over 1 million tegn) ved å bruke variabel lengde.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ASCII (7-bit, lagret som 1 byte):

  Tegn   Dec   Hex   Bin
  ─────  ────  ────  ──────────
  '0'    48    0x30  0011 0000
  '9'    57    0x39  0011 1001
  'A'    65    0x41  0100 0001
  'Z'    90    0x5A  0101 1010
  'a'    97    0x61  0110 0001
  'z'    122   0x7A  0111 1010
   ' '   32    0x20  0010 0000
  '\\n'   10    0x0A  0000 1010

  Konvertering: 'A' - 'a' = -32 = +0x20 forskjellen mellom store/små.

UTF-8 — variable-lengde encoding av Unicode:

  Codepoint range   Bytes  Mønster
  ────────────────  ─────  ─────────────────────────────────
  U+0000  - U+007F   1     0xxxxxxx                          ← rene ASCII
  U+0080  - U+07FF   2     110xxxxx 10xxxxxx
  U+0800  - U+FFFF   3     1110xxxx 10xxxxxx 10xxxxxx
  U+10000 - U+10FFFF 4     11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

Eksempel: 'ø' har Unicode codepoint U+00F8

  0x00F8 = 0000 0000 1111 1000

  Mønster for 2-byte: 110xxxxx 10xxxxxx
                       110 00011  10 111000
                       = 0xC3      0xB8

  Så 'ø' i UTF-8 = 0xC3 0xB8 (TO bytes, ikke én!)

Klassisk felle i Python 2 / web:
  s = "hellø"            # 6 bytes i UTF-8, 5 tegn
  len(s)                  # 6 i Python 2 (bytes), 5 i Python 3 (str)
  s.encode("latin-1")     # ulikt fra UTF-8 — 'ø' = 0xF8 i latin-1

  Hvis filen er lagret som UTF-8 men du leser den som latin-1
  kommer 'ø' (én tegn) ut som 'Ã¸' (to tegn).  ← den mojibake.`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : endianness, signed-tall, IEEE 754-felter.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-8-python-er-c" }} className="text-brand hover:underline">
                Trinn 8 — Python er C under panseret
              </Link>
              : PyObject, refcount, GIL.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="bits-dyp" />
      </div>
    </StackPageShell>
  );
}
