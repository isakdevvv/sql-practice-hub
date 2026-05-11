import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor typer? Hva problemet egentlig er", anchor: "hvorfor" },
  { title: "Static vs dynamic, weak vs strong, structural vs nominal", anchor: "aksene" },
  { title: "Generics og parametric polymorphism", anchor: "generics" },
  { title: "Variance — covariant, contravariant, invariant", anchor: "variance" },
  { title: "Sum types — discriminated unions, Result, Option", anchor: "sum" },
  { title: "Product types — records og tupler", anchor: "product" },
  { title: "Type narrowing", anchor: "narrowing" },
  { title: "Phantom og dependent types — intro", anchor: "avansert" },
];

export function TypesystemerPage() {
  return (
    <StackPageShell title="Typesystemer" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Phase 2.5 · Tverrfaglig
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Typesystemer — en akseguide
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hva ER et typesystem? Hvorfor sier Python-folk «duck typing» og TS-folk
            «structural»? Hva betyr <code>covariant</code> egentlig? Dette kurset
            etablerer aksene først, så blir generics, variance, sum types og narrowing
            naturlige bygge-blokker. Eksempler i Python type hints OG TypeScript.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Typesystemer» — static vs dynamic match, generics-fyll, variance-quiz,
              narrowing-match.
            </div>
          </div>
        </div>

        <CourseOutline courseId="typesystemer" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor typer? Hva problemet egentlig er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et typesystem er et lett-vekts bevissystem som rejekter klasser av programmer
            FØR du kjører dem. «Du kan ikke legge sammen et tall og en streng» er ikke
            poenget — poenget er at typer hjelper deg å designe APIer der visse feil ikke
            kan oppstå.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python (uten typer)
def betal(bruker, beløp):
    bruker.saldo -= beløp     # hva er bruker? Et dict? Et objekt? None?
                              # hva er beløp? float? Decimal? streng?

# Python (med typer)
from decimal import Decimal
from dataclasses import dataclass

@dataclass
class Bruker:
    id: int
    saldo: Decimal

def betal(bruker: Bruker, beløp: Decimal) -> None:
    bruker.saldo -= beløp

// TypeScript
interface Bruker { id: number; saldo: number; }
function betal(bruker: Bruker, belop: number): void {
  bruker.saldo -= belop;
}`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Hva typer gir deg:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Dokumentasjon som ikke kan lyve:</strong> signaturen er sann eller koden kompilerer ikke.</li>
              <li><strong>Autocomplete + refactoring:</strong> IDE-en vet hva som finnes.</li>
              <li><strong>Tidlig feildeteksjon:</strong> feil før prod, ikke kl. 03:00 på vakt.</li>
              <li><strong>Designverktøy:</strong> «kan jeg uttrykke dette i typer?» tvinger frem bedre datamodell.</li>
            </ul>
          </div>
        </section>

        <section id="aksene" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Tre uavhengige akser</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Folk blander disse hele tiden. De er uavhengige.
          </p>

          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Akse</th>
                  <th className="text-left font-semibold px-4 py-2">Spørsmål</th>
                  <th className="text-left font-semibold px-4 py-2">Eksempler</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Static ↔ Dynamic</td>
                  <td className="px-4 py-3 text-muted-foreground">Når sjekkes typene — ved kompilering eller ved kjøring?</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">Static: TS, Java, Rust. Dynamic: Python, JS, Ruby.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Weak ↔ Strong</td>
                  <td className="px-4 py-3 text-muted-foreground">Hvor villig er språket til å konvertere automatisk?</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">Weak: JS (<code>"5" + 1 === "51"</code>), C. Strong: Python (<code>"5" + 1</code> → TypeError), Haskell.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Structural ↔ Nominal</td>
                  <td className="px-4 py-3 text-muted-foreground">Er typer like fordi de HETER det samme, eller fordi de SER like ut?</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">Structural: TS, Go interfaces. Nominal: Java, C#, Rust.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Structural vs nominal — konkret eksempel
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — structural ("duck typing for typer")
interface Punkt { x: number; y: number; }
interface Vektor { x: number; y: number; }

const p: Punkt = { x: 1, y: 2 };
const v: Vektor = p;          // OK — samme STRUKTUR, navnet er irrelevant

// Java/C#/Rust — nominal (illustrasjon)
class Punkt { ... }
class Vektor { ... }          // samme felt, men forskjellig type
Punkt p = new Punkt();
Vektor v = p;                 // FEIL — forskjellige NAVN`}</pre>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Python er <strong>dynamic + strong + (semi-)structural via protocols</strong>.
            TypeScript er <strong>static + strong + structural</strong>. JavaScript er{" "}
            <strong>dynamic + weak</strong>. Vanlig misforståelse: «Python er weak» — nei,
            Python er strong (ingen implicit coercion), bare dynamic.
          </p>
        </section>

        <section id="generics" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Generics og parametric polymorphism</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Polymorfi</strong> = «kan ha mange former». <strong>Parametric:</strong>{" "}
            funksjonen virker for ALLE typer, fordi den ikke bryr seg om hva typen ER.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — TypeVar
from typing import TypeVar

T = TypeVar("T")

def forste(xs: list[T]) -> T:        # virker for list[int], list[str], list[Bruker] ...
    return xs[0]

forste([1, 2, 3])           # T = int   → returnerer int
forste(["a", "b"])          # T = str   → returnerer str

# Python 3.12+ ny syntaks:
def forste[T](xs: list[T]) -> T:
    return xs[0]

// TypeScript — <T>
function forste<T>(xs: T[]): T {
  return xs[0];
}

forste([1, 2, 3]);                 // T = number
forste<string>(["a", "b"]);        // eksplisitt T = string`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Bounded generics — sett krav på T
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — bound
from typing import TypeVar
from numbers import Number

N = TypeVar("N", bound=Number)
def dobble(x: N) -> N: return x * 2     # T må være Number-aktig

# Constraint (ikke bound, men "et av disse"):
S = TypeVar("S", str, bytes)
def lengde(x: S) -> int: return len(x)

// TypeScript — extends
function siste<T extends { length: number }>(xs: T[]): T {
  return xs[xs.length - 1];
}

// Generics over to typer
function par<A, B>(a: A, b: B): [A, B] { return [a, b]; }`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Parametric vs ad-hoc:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Parametric (generics):</strong> samme implementasjon, mange typer (<code>forste&lt;T&gt;</code>).</li>
              <li><strong>Ad-hoc (overloading):</strong> forskjellige implementasjoner per type (<code>+</code> for int, float, streng — Python via <code>__add__</code>; TS via overloads).</li>
              <li><strong>Subtype:</strong> kjør «den samme» metoden via arv (klassisk OOP).</li>
            </ul>
          </div>
        </section>

        <section id="variance" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Variance — covariant, contravariant, invariant</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Variance svarer på: «hvis <code>Hund</code> er en undertype av <code>Dyr</code>,
            er da <code>List[Hund]</code> en undertype av <code>List[Dyr]</code>?». Svaret er IKKE
            opplagt og kan velte programmer.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Covariant — beveger seg «samme vei»
            </div>
            <p className="text-sm mb-2">
              Hvis A &lt;: B, så er <code>F[A]</code> &lt;: <code>F[B]</code>. Gjelder for
              read-only beholdere.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — readonly array er covariant
class Dyr {}
class Hund extends Dyr {}

const hunder: readonly Hund[] = [new Hund()];
const dyr: readonly Dyr[] = hunder;     // OK — bare lese, så trygt

# Python — Sequence er covariant
from typing import Sequence
def les_dyr(xs: Sequence[Dyr]) -> None: ...
les_dyr([Hund(), Hund()])             # OK`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Contravariant — beveger seg «motsatt vei»
            </div>
            <p className="text-sm mb-2">
              Hvis A &lt;: B, så er <code>F[B]</code> &lt;: <code>F[A]</code>. Gjelder for
              «konsumenter» — funksjons-argumenter.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — funksjons-parametere er contravariant
type DyrHandler = (d: Dyr) => void;
type HundHandler = (h: Hund) => void;

const handleDyr: DyrHandler = (d) => console.log(d);
const slot: HundHandler = handleDyr;
// OK: en handler som tar enhver Dyr, kan også brukes der vi forventer Hund-handler
// (Hund ER et Dyr, så DyrHandler aksepterer den).

# Python: Callable[[X], R] er contravariant i X.
from typing import Callable
def kjor(h: Callable[[Hund], None]) -> None: ...
def handler(d: Dyr) -> None: ...
kjor(handler)                  # OK — handler aksepterer ALLE Dyr, inkludert Hund`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Invariant — ingen subtype-relasjon
            </div>
            <p className="text-sm mb-2">
              Gjelder for «både les og skriv»-beholdere. Tillater du både, må A == B.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — vanlige (mutable) arrays er IKKE strengt invariant i TS,
// men Python sin List er det:

# Python — list[T] er INVARIANT
from typing import List
def behandle(xs: List[Dyr]) -> None:
    xs.append(Dyr())          # ← her er problemet
hunder: List[Hund] = [Hund()]
behandle(hunder)              # mypy: FEIL
# Hadde det vært tillatt, ville behandle puttet en Dyr (ikke Hund!) i hunder-lista.

// TypeScript — Box<T> som både get og set er invariant
class Box<T> {
  constructor(public val: T) {}
  set(v: T) { this.val = v; }
  get(): T { return this.val; }
}
// Box<Hund> kan ikke trygt brukes som Box<Dyr>:
// noen kunne kalt .set(new Dyr()) og ødelagt typen.`}</pre>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Tommelfingerregel (Liskov):</strong> en parameter (du LESER inn) er covariant.
            En return-type (du PRODUSERER ut) er covariant. Hvis du både leser og skriver,
            er invariance trygt. Java sin <code>Object[]</code> er feilaktig covariant og kan
            kaste <code>ArrayStoreException</code> ved runtime — godt eksempel på hvorfor
            variance MÅ stemme.
          </div>
        </section>

        <section id="sum" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Sum types — discriminated unions, Result, Option</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Sum type</strong> = «enten A eller B (men ikke begge)». Kalles også
            tagged union eller discriminated union. Datatype-revolusjonen som mange
            mainstream-språk endelig får.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — discriminated union
type Form =
  | { kind: "sirkel"; radius: number }
  | { kind: "firkant"; side: number }
  | { kind: "rektangel"; w: number; h: number };

function areal(f: Form): number {
  switch (f.kind) {
    case "sirkel":    return Math.PI * f.radius ** 2;
    case "firkant":   return f.side ** 2;
    case "rektangel": return f.w * f.h;
    // TS gir feil hvis du glemmer en case — exhaustiveness check
  }
}

# Python 3.10+ — match med dataclasses
from dataclasses import dataclass

@dataclass
class Sirkel: radius: float
@dataclass
class Firkant: side: float
@dataclass
class Rektangel: w: float; h: float

Form = Sirkel | Firkant | Rektangel        # union-type

def areal(f: Form) -> float:
    match f:
        case Sirkel(r):       return 3.14 * r * r
        case Firkant(s):      return s * s
        case Rektangel(w, h): return w * h`}</pre>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Klassikere — Option og Result
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// Option / Maybe — verdi eller fravær (uten null-helvete)
type Option<T> = { kind: "some"; value: T } | { kind: "none" };

// Result / Either — suksess eller feil
type Result<T, E> = { kind: "ok"; value: T } | { kind: "err"; error: E };

function trygtDivider(a: number, b: number): Result<number, string> {
  return b === 0
    ? { kind: "err", error: "Divisjon med null" }
    : { kind: "ok", value: a / b };
}

# Tilsvarende i Python — dataclass + match
@dataclass class Ok[T]: value: T
@dataclass class Err[E]: error: E
Result = Ok[T] | Err[E]      # Python 3.12+ generic syntax`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hvorfor sum types &gt; null/exceptions:</strong> compileren TVINGER deg
            til å håndtere alle tilfeller. Du kan ikke «glemme» feil-grenen som man kan
            med try/except. Rust og Haskell gjør all feilhåndtering på denne måten.
          </p>
        </section>

        <section id="product" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Product types — records og tupler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Product type</strong> = «A OG B samtidig». En record/struct/objekt er en
            product type. Hvis A har 3 verdier og B har 4 verdier, har A×B = 12 mulige
            verdier. Derav navnet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — record (med navngitte felt)
interface Punkt { x: number; y: number; }

// Tuple — uten navn, posisjon teller
type Par = [number, string];

const p: Punkt = { x: 1, y: 2 };
const par: Par = [42, "ja"];

# Python — dataclass og NamedTuple
from dataclasses import dataclass
from typing import NamedTuple

@dataclass
class Punkt: x: float; y: float

class Par(NamedTuple):
    n: int
    s: str

p = Punkt(1.0, 2.0)
par = Par(42, "ja")
# Vanlig tuple uten navn:
t: tuple[int, str] = (42, "ja")`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Mental modell:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Product (A og B):</strong> begge feltene må fylles. Antall verdier = |A| × |B|.</li>
              <li><strong>Sum (A eller B):</strong> ett av tilfellene er aktivt. Antall verdier = |A| + |B|.</li>
              <li>Hele algebraic data types-tradisjonen (ADT) bygger på disse to og rekursive kombinasjoner.</li>
            </ul>
          </div>
        </section>

        <section id="narrowing" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Type narrowing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Narrowing = «den deklarerte typen er bredere enn det compileren KAN bevise her».
            Compileren ser at du har gjort en sjekk og smal-ner typen i den grenen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — fire klassiske narrowing-mønstre
function f(x: string | number | null) {
  if (x === null) return;            // null-sjekk
  if (typeof x === "string") {       // typeof
    x.toUpperCase();                 // TS vet x: string her
  } else {
    x.toFixed(2);                    // TS vet x: number her
  }
}

class Hund {}
class Katt {}
function lyd(dyr: Hund | Katt) {
  if (dyr instanceof Hund) return "voff";   // instanceof
  return "mjau";
}

// Discriminated union — sjekk diskriminanten
type R = { kind: "ok"; v: number } | { kind: "err"; msg: string };
function vis(r: R) {
  if (r.kind === "ok") return r.v;          // r: { kind: "ok"; v: number }
  return r.msg;                             // r: { kind: "err"; msg: string }
}

# Python — isinstance, match, None-sjekk
def f(x: str | int | None) -> None:
    if x is None: return
    if isinstance(x, str): print(x.upper())
    else: print(x + 1)             # mypy vet x: int

# match med pattern + as-binding
def vis(r: Ok | Err) -> str:
    match r:
        case Ok(v): return str(v)
        case Err(msg): return msg`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Vanlig forvirring — Type vs Value:</strong> i TypeScript brukes
            <code> typeof x === "string"</code> (value-nivå, sjekker runtime-tag) ulikt fra
            <code> type X = typeof foo</code> (type-nivå, henter typen til en verdi).
            <code>instanceof</code> finnes bare for klasser — strings og objekter har ikke
            instanceof; for dem bruker du <code>typeof</code> eller diskriminerings-felt.
          </div>
        </section>

        <section id="avansert" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Phantom og dependent types — intro</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Avanserte triks — du trenger dem sjelden, men de er forklaringen på «hvordan
            koder Rust og Haskell-folk skriver?».
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Phantom types — type-parameter som ikke lagres
            </div>
            <p className="text-sm mb-2">
              En generisk type-parameter brukes BARE for å skille typer på compile-time —
              ingen runtime-verdi. Brukes for å forhindre forvekslinger.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — brand types
type UserId   = number & { readonly __brand: "UserId" };
type OrderId  = number & { readonly __brand: "OrderId" };

const u: UserId  = 42 as UserId;
const o: OrderId = 7  as OrderId;

function hentBruker(id: UserId) { /* ... */ }
hentBruker(u);                    // OK
hentBruker(o);                    // FEIL — kan ikke bruke OrderId der UserId trengs
hentBruker(42);                   // FEIL — number er ikke UserId

# Python — NewType
from typing import NewType
UserId = NewType("UserId", int)
OrderId = NewType("OrderId", int)

def hent_bruker(id: UserId) -> None: ...
hent_bruker(UserId(42))
hent_bruker(OrderId(7))           # mypy: FEIL`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Dependent types — typer som avhenger av verdier
            </div>
            <p className="text-sm mb-2">
              Du kan uttrykke ting som «<code>Vector&lt;n&gt;</code> der n er en konkret tall-verdi» —
              compileren passer på at to vektorer matcher. Krever språk som Idris,
              Agda, Coq, Lean. Litt i Rust via const-generics, litt i TS via template
              literal types.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`-- Idris (illustrasjon)
zipMed : (Vect n a) -> (Vect n b) -> Vect n (a, b)
-- Compiler nekter å zipe to vektorer av ulik lengde

// TypeScript glimt — fixed-length tuple
type Vec3 = readonly [number, number, number];
function pluss(a: Vec3, b: Vec3): Vec3 {
  return [a[0]+b[0], a[1]+b[1], a[2]+b[2]] as const;
}

// Rust glimt — const generics
fn pluss<const N: usize>(a: [f64; N], b: [f64; N]) -> [f64; N] {
    /* ... */
}`}</pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Hva du tar med deg:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li>Phantom types bruker du i hverdagskode for å skille «to ints som ikke skal blandes».</li>
              <li>Dependent types er sjelden i bruk daglig, men forklarer hvorfor folk bygger bevissystemer (Lean for matematikk, Idris for trygge nettverksprotokoller).</li>
              <li>Mer typer er ikke alltid bedre. Riktig dose typer for problemet.</li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor brukes dette</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li><strong>TypeScript-kode i React:</strong> discriminated unions for actions, generics i hooks (<code>useState&lt;T&gt;</code>), narrowing i komponent-props.</li>
            <li><strong>Python type hints:</strong> mypy/pyright fanger bugs før du kjører tester. Brukes mye i FastAPI, pydantic, SQLAlchemy 2.0.</li>
            <li><strong>Rust:</strong> Option/Result tvinger feilhåndtering. Variance er innebygd i type-systemet.</li>
            <li><strong>Database-modeller:</strong> sum types passer der du i dag bruker «status»-streng — gjør ugyldige tilstander urepresenterbare.</li>
          </ul>
          <div className="mt-4">
            <Link
              to="/stack/$slug"
              params={{ slug: "funksjonell-programmering" }}
              className="text-brand hover:underline inline-flex items-center"
            >
              Tilbake: Funksjonell programmering
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </StackPageShell>
  );
}
