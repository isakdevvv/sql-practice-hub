import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "CPython er et C-program", anchor: "cpython" },
  { title: "PyObject — alle ting er pekere", anchor: "pyobject" },
  { title: "Refcounting — hvordan Python rydder opp", anchor: "refcount" },
  { title: "GIL — én tråd om gangen", anchor: "gil" },
  { title: "Hvorfor lister er trege", anchor: "lister" },
  { title: "Når Python plutselig blir rask", anchor: "rask" },
];

export function Trinn8PythonErCPage() {
  return (
    <StackPageShell title="8. Python er C under panseret" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Hardware-stakken · Trinn 8
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Python er C under panseret — derfor er det tregt OG raskt
          </h1>
          <p className="mt-3 text-muted-foreground">
            «CPython» er det vanlige Python-interpretert, og det er
            bokstavelig talt et C-program (~600 000 linjer). Hver
            Python-int er en C-struct. Hver gang du gjør{" "}
            <code>a + b</code> i Python, kjører C-koden for å pakke ut
            verdiene, addere, og pakke inn igjen. Det er hovedgrunnen til
            at Python er treg på CPU-bundet kode.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «CPython» — PyObject-layout, refcount, GIL, list vs tuple.
            </div>
          </div>
        </div>

        <CourseOutline courseId="trinn-8-python-er-c" steps={STEPS} />

        <section id="cpython" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. CPython er et C-program</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Når du skriver:

   $ python3 script.py

…laster Linux opp en binær (typisk /usr/bin/python3.x) som er
bygget fra C-kilder (https://github.com/python/cpython).

Hva interpreterer gjør (forenklet):

  1. Les script.py som tekst
  2. Lex/parse til AST (abstract syntax tree)
  3. Kompiler AST til BYTECODE (.pyc):
       BINARY_OP, LOAD_FAST, STORE_NAME, CALL, RETURN_VALUE, ...
  4. Kjør bytecode i en evaluation loop (en kjempe-switch i C)

Eksempel — la oss se bytecoden for "x = 1 + 2":

   >>> import dis
   >>> dis.dis(lambda: 1 + 2)
     1   RESUME           0
         LOAD_CONST       1 (3)        ← compile-time-foldet til 3!
         RETURN_VALUE

  Med variabler:
   >>> dis.dis(lambda x, y: x + y)
     1   RESUME           0
         LOAD_FAST        0 (x)
         LOAD_FAST        1 (y)
         BINARY_OP        0 (+)
         RETURN_VALUE

  Hver av disse opcodene er ~10-100 linjer C-kode som tolkes
  i evaluation-loopen (Python/ceval.c).

CPython-eval-loopen, forenklet:

   for (;;) {
       opcode = *instr++;
       switch (opcode) {
         case LOAD_FAST:    /* push lokal variabel */
         case BINARY_OP:    /* utfør operasjon */
         case CALL:         /* kall en funksjon */
         ...
       }
   }

  Hver iterasjon er minst dusinvis maskininstruksjoner.
  Det er HVORFOR Python er ~30-100x tregere enn C på rene løkker.`}</pre>
          </div>
        </section>

        <section id="pyobject" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. PyObject — alle ting er pekere</h2>
          <p className="text-sm text-muted-foreground mb-4">
            I CPython er hvert Python-objekt en{" "}
            <code>PyObject*</code>{" "}— en peker til en C-struct på heapen.
            Det gjelder også «primitive» ting som int og bool.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Basis-struktur (Include/object.h):

   typedef struct _object {
       Py_ssize_t ob_refcnt;        // referansetelling
       PyTypeObject *ob_type;        // peker til type-objektet
   } PyObject;

Hver datatype utvider denne. PyLongObject (Python int):

   typedef struct {
       PyObject ob_base;             // refcount + type
       Py_ssize_t ob_size;           // antall "digits" (kan være store!)
       digit ob_digit[1];            // selve verdien, variabel lengde
   } PyLongObject;

  En 32-bits int i Python = 24-28 bytes på heapen!
  En C int = 4 bytes på stacken.

  >>> import sys
  >>> sys.getsizeof(42)
  28
  >>> sys.getsizeof(2**100)
  44       # store tall blir større — variabel digit-array


Eksempel: a = 5
   Python-side:                  C-side (CPython internals):
   a ───►  (PyObject*)  ───────► refcnt: 1
                                  type:   PyLong_Type
                                  size:   1
                                  digit:  [5]

Når du gjør b = a:
   a ───►   (samme PyObject) ◄─── b

   refcnt: 2   ← begge navn peker til samme heap-objekt

Når du gjør c = a + 1:
   a ─► refcnt: 2, value: 5
   c ─► refcnt: 1, value: 6     ← NYTT objekt allokeres

   (med mindre 6 er internert — se neste boks)

Small-int caching:
   CPython preallokerer alle int-er fra -5 til 256 og gjenbruker dem.
   >>> a = 100; b = 100; a is b
   True
   >>> a = 1000; b = 1000; a is b
   False        # nye objekter, samme verdi`}</pre>
          </div>
        </section>

        <section id="refcount" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Refcounting — hvordan Python rydder opp</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Python bruker IKKE en sweep-mark GC primært. Hver{" "}
            PyObject teller hvor mange referanser den har. Når den når 0,
            slettes objektet med en gang.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Referansetelling — operasjoner som endrer refcnt:

  Operasjon                          Effekt
  ────────────────────────────────   ──────────────────────
  x = obj                             refcnt(obj) += 1
  lst.append(obj)                     refcnt(obj) += 1
  del x                                refcnt(obj) -= 1
  x = noe_annet                       refcnt(gammel) -= 1, refcnt(ny) += 1
  funksjon returnerer (lokale dør)    refcnt på lokale -= 1

Når refcnt == 0:
  - tp_dealloc() kalles på objektet (frigjør ressurser)
  - free() kalles på minnet

Sirkulære referanser:
   a = []
   b = []
   a.append(b)
   b.append(a)
   # nå er refcnt(a) = 2, refcnt(b) = 2
   del a, b
   # refcnt(a) = 1 fra b, refcnt(b) = 1 fra a → de holder hverandre i live!

  Derfor har Python en EKSTRA cyclic GC som gjør sweep-mark
  for å fange disse. Den kjører periodisk i bakgrunnen.

Praktisk konsekvens:
  - Python deterministisk gir tilbake minne så fort scope avsluttes
  - Som regel ikke nødvendig å lukke filer manuelt — men gjør det med 'with' uansett
  - Sirkulær graf-strukturer kan lekke hvis cyclic GC er av

Manuelt refcounting i C-extensions:
  Py_INCREF(obj);    // ++refcnt
  Py_DECREF(obj);    // --refcnt, og evt. dealloc
  // Manuell INC/DEC er HOVEDFEILEN i C-extensions for Python.`}</pre>
          </div>
        </section>

        <section id="gil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. GIL — én tråd om gangen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            GIL = Global Interpreter Lock. CPython tillater bare én tråd å
            kjøre Python-bytecode om gangen. Det er fordi
            refcount-operasjonene ellers ville trenge atomic-instruksjoner,
            som er trege.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tråd-flyt UTEN GIL (i et språk uten):

  Tråd A:  LOAD_VAR  x  →  INCREF x  →  ADD  →  ...
  Tråd B:  STORE_VAR x  →  DECREF x  →  ...
                    ↑
                Race condition — refcnt kan bli korrupt.


Med GIL:

  Tråd A:  ████████ kjører bytecode ████████
  Tråd B:                                       ████████ kjører bytecode ████████
           └───────────────────┘                └───────────────────────────────┘
              har GIL                              har GIL (etter A ga slipp)

  Bare ÉN tråd kjører Python-bytecode om gangen.
  GIL frigis ved:
    - hver ~100 bytecode-instruksjoner
    - blokkering på I/O (socket read, file read, sleep)
    - eksplisitt PyThread_release_lock i C-extensions

Konsekvens:
  threading.Thread x 4 + CPU-bundet jobb → IKKE 4x speedup
  threading.Thread x 4 + I/O-bundet jobb → JA, kan være 4x speedup
  multiprocessing.Process x 4              → JA, 4x speedup (4 prosesser, 4 GIL)
  numpy/C-extensions slipper GIL i kjernen → JA, kan parallellisere

Python 3.13 har "no-GIL" som eksperimentell mode (PEP 703),
men det er ikke standard ennå.`}</pre>
          </div>
        </section>

        <section id="lister" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Hvorfor lister er trege</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En Python-liste er IKKE et array av int. Det er et array av{" "}
            <code>PyObject*</code> — pekere til objekter på heapen. Det
            betyr to ekstra indirection-er per element vs et C-array.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Layout — list i Python:

   [10, 20, 30]
        │
        ▼
   PyListObject:
   ┌────────────────┐
   │ refcnt, type   │
   │ ob_size: 3     │
   │ ob_item ────┐  │
   │ allocated:4 │  │       ← allokert plass, kan vokse uten realloc
   └─────────────│──┘
                 │
                 ▼
   ┌───┬───┬───┬───┐
   │ * │ * │ * │ * │           ← 4 PyObject* (8 bytes hver = 32 bytes)
   └─┬─┴─┬─┴─┬─┴───┘
     │   │   │
     ▼   ▼   ▼
   PyLong(10)  PyLong(20)  PyLong(30)
   28 bytes    28 bytes    28 bytes

  Totalt:   PyListObject (56 b) + array (32 b) + 3 ints (84 b)  = ~170 bytes
  C array:  3 × sizeof(int) = 12 bytes

  Plus: hver lese av lst[i] krever:
    1. Hopp inn i PyListObject (mem read)
    2. Hopp inn i ob_item-arrayet (mem read)
    3. Følg pekeren til PyLong (mem read)
    4. Pakk ut digit-arrayet
  → 4 minne-aksesser. Bare 1 i et C-array.

NumPy fikser dette:
  np.array([10, 20, 30], dtype=np.int32) lagrer
  bytes direkte — 12 bytes, ingen pekere, ingen PyObject per element.
  Loops i NumPy går i C-kode på en gang.

Tuple vs list:
  Tuple er IMMUTABLE og kan kompileres som konstant.
  En tuple-literal som (1, 2, 3) er en konstant i bytecoden.
  Ofte 10-30% raskere å allokere/lese enn list med samme innhold.`}</pre>
          </div>
        </section>

        <section id="rask" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Når Python plutselig blir rask</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Python er treg PER instruksjon, men du kan unngå instruksjonene:

1. NumPy / pandas — flytt løkken ned til C
     # Treg (10⁶ iterasjoner i Python):
     result = [a*2 + b for a, b in zip(xs, ys)]
     # Rask (samme i C):
     result = xs * 2 + ys                    # numpy-vektorisert

2. Innebygde funksjoner og str-metoder
     # Treg:
     total = 0
     for x in xs: total += x
     # Rask (C-loop med GIL holdt):
     total = sum(xs)

3. C-extensions
     - bcrypt, cryptography, lxml, regex
     - Selve jobben er ren C, returnerer kun resultatet

4. PyPy — JIT-kompilert Python
     - Kjører Python-bytecode først, så kompilerer hot loops til native
     - 3-10x raskere for typiske workloads
     - Ikke alltid drop-in (C-extensions kan klage)

5. Cython / mypyc
     - Skriv Python med type-hints, kompiler til C-extension
     - Nesten C-fart for hot funksjoner

6. Numba (@jit decorator)
     - JIT-kompilerer funksjoner som bruker NumPy
     - 100x speedup på rene matematiske loops

Strategi:
  - Profilér først: cProfile, py-spy, line_profiler
  - Optimaliser bare hotspots
  - Bytt algoritme før optimering`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : PyObject, refcount, GIL, list vs tuple.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "trinn-9-syscalls-dyp" }} className="text-brand hover:underline">
                Trinn 9 — Syscalls (dypere)
              </Link>
              : read/write/open/close, fork/exec, pipes, signaler.{" "}
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
