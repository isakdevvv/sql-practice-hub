import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Pure functions — deterministisk, ingen side-effekter", anchor: "pure" },
  { title: "Immutability — hvorfor det er gull", anchor: "immutability" },
  { title: "First-class og higher-order functions", anchor: "hof" },
  { title: "map / filter / reduce", anchor: "mfr" },
  { title: "Currying og partial application", anchor: "currying" },
  { title: "Recursion vs loops", anchor: "recursion" },
  { title: "Lazy evaluation", anchor: "lazy" },
  { title: "Monads light — Maybe / Result / IO", anchor: "monads" },
];

export function FunksjonellProgrammeringPage() {
  return (
    <StackPageShell title="Funksjonell programmering" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Phase 2.5 · Tverrfaglig
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Funksjonell programmering — språk-agnostisk
          </h1>
          <p className="mt-3 text-muted-foreground">
            CS-studenter snubler ofte i begrepene «pure function», «higher-order»,
            «immutability», «Maybe/Result». Dette kurset bygger intuisjonen i Python
            OG TypeScript — så du ser at det IKKE er Haskell-magi, men hverdags-mønstre
            du allerede bruker i React, Redux og pandas.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Funksjonell programmering» — pure vs impure quiz, map/filter/reduce
              match, currying-fyll, Maybe/Option use-case.
            </div>
          </div>
        </div>

        <CourseOutline courseId="funksjonell-programmering" steps={STEPS} />

        <section id="pure" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Pure functions — deterministisk, ingen side-effekter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <strong>pure function</strong> oppfyller to krav:
          </p>
          <ol className="list-decimal pl-5 text-sm space-y-1 mb-4">
            <li><strong>Deterministisk:</strong> samme input → samme output, alltid.</li>
            <li><strong>Ingen side-effekter:</strong> påvirker ikke noe utenfor sin egen retur-verdi.</li>
          </ol>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-success font-semibold mb-2">
              Pure
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python
def add(a: int, b: int) -> int:
    return a + b              # samme input, samme output. Ingenting endres.

// TypeScript
const add = (a: number, b: number): number => a + b;`}</pre>
          </div>
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
            <div className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2">
              Impure — fire forskjellige måter å være urein på
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# 1. Muterer argumentet
def add_one(xs: list[int]):
    xs.append(1)              # endrer caller sin liste

# 2. Leser global state
TAX = 0.25
def with_tax(price): return price * (1 + TAX)   # ikke deterministisk hvis TAX endres

# 3. I/O
def greet(name):
    print(f"Hei {name}")      # rør seg ut i verden

# 4. Tilfeldighet / klokke
import random, time
def token(): return str(random.random()) + str(time.time())`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Hvorfor pure er gull:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Testbar:</strong> ingen mocks. Bare gi input, sjekk output.</li>
              <li><strong>Cache-bar:</strong> samme input gir samme output → memoize trygt.</li>
              <li><strong>Parallelliserbar:</strong> ingen delt state = ingen race conditions.</li>
              <li><strong>Lokal forståelse:</strong> du leser funksjonen, du vet alt den gjør.</li>
            </ul>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Referential transparency:</strong> kall til en pure function kan
            erstattes med return-verdien sin uten å endre programmets oppførsel.
            <code>add(2, 3)</code> kan ALLTID byttes ut med <code>5</code>. <code>print(x)</code> kan ikke.
          </p>
        </section>

        <section id="immutability" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Immutability — hvorfor det er gull</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Immutable data = kan ikke endres etter at den er laget. Vil du «endre»? Lag
            en ny versjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Mutabel (Python list, JS array)
xs = [1, 2, 3]
xs.append(4)                  # samme objekt, nytt innhold
print(xs)                     # [1, 2, 3, 4]

# Immutable-stil (lag ny versjon)
xs = [1, 2, 3]
ys = [*xs, 4]                 # xs uendret, ys er ny

// TypeScript / React state
const xs = [1, 2, 3];
const ys = [...xs, 4];        // klassisk Redux/React-mønster
setItems(prev => [...prev, newItem]);`}</pre>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <strong className="text-foreground">Concurrency</strong>
              <p className="mt-1 text-muted-foreground">
                Hvis ingen kan ENDRE data, kan to tråder lese samtidig uten lås. Hele
                race-condition-kategorien forsvinner.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <strong className="text-foreground">Debug</strong>
              <p className="mt-1 text-muted-foreground">
                «Hvem endret denne lista?» blir et ikke-spørsmål når lista er immutable —
                den ble erstattet, ikke endret.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <strong className="text-foreground">Time travel</strong>
              <p className="mt-1 text-muted-foreground">
                Redux DevTools, Git, undo/redo — alle bygger på at gamle versjoner
                fortsatt finnes. Mutable data ville bare overskrevet historien.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <strong className="text-foreground">React-re-rendering</strong>
              <p className="mt-1 text-muted-foreground">
                React sammenligner via <code>===</code> (referanselikhet). Hvis du muterer
                state in-place, ser React samme referanse og rendrer IKKE. Ny array/objekt → re-render.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Praktisk verktøy:</strong>{" "}
            <code>immer</code> (JS) lar deg «mutere» et utkast som blir gjort om til
            immutable bak kulissene. <code>frozen=True</code> på Python dataclass eller{" "}
            <code>tuple</code> i stedet for <code>list</code> er enkleste vei i Python.
            Redux Toolkit bruker immer internt for å beholde immutability uten boilerplate.
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Python — frozen dataclass
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Bruker:
    id: int
    navn: str
    poeng: int

u = Bruker(1, "Ada", 100)
u.poeng = 200                 # FAIL — FrozenInstanceError
u2 = replace(u, poeng=200)    # OK — ny kopi, original uendret`}</pre>
          </div>
        </section>

        <section id="hof" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. First-class og higher-order functions</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>First-class:</strong> funksjoner er verdier — du kan tildele dem til
            variabler, sende som argument, returnere fra andre funksjoner, putte i lister.
            <strong> Higher-order:</strong> funksjon som tar funksjon som argument ELLER
            returnerer en funksjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — funksjon som verdi
def dobble(x): return x * 2

f = dobble                    # tilordning
print(f(3))                   # 6

handlere = [dobble, lambda x: x + 1, abs]
for h in handlere:
    print(h(-5))              # -10, -4, 5

# Higher-order: tar funksjon som arg
def anvend_to_ganger(fn, x):
    return fn(fn(x))
print(anvend_to_ganger(dobble, 3))   # 12

// TypeScript — eksakt samme idé
const dobble = (x: number) => x * 2;
const anvendToGanger = <T,>(fn: (a: T) => T, x: T): T => fn(fn(x));
anvendToGanger(dobble, 3);    // 12`}</pre>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Du bruker dette HELE TIDEN uten å tenke over det:
          </p>
          <div className="mt-2 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// React event handlers — onClick får en funksjon
<button onClick={() => save()}>Lagre</button>

// Array-metoder
[1,2,3].map(x => x * 2)
[1,2,3].filter(x => x > 1)
sorted(elever, key=lambda e: e.poeng)   # Python: sort tar en funksjon

// setTimeout / setInterval — funksjon som argument
setTimeout(() => console.log("ding"), 1000);

// Decorators i Python ER higher-order funksjoner
@cache
def fib(n): ...               # cache(fib) bytter fib ut med en wrappet versjon`}</pre>
          </div>
        </section>

        <section id="mfr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. map / filter / reduce</h2>
          <p className="text-sm text-muted-foreground mb-4">
            De tre grunnmønstrene som dekker ~80% av loops over en liste.
            Lær å SE dem så du slutter å skrive loops manuelt for ingen grunn.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              map — transformer hvert element
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — list comprehension er Python-idiomet for map
priser = [100, 200, 300]
m_moms = [p * 1.25 for p in priser]   # [125.0, 250.0, 375.0]
# Eller funksjonelt:
m_moms = list(map(lambda p: p * 1.25, priser))

// TypeScript / JavaScript
const medMoms = priser.map(p => p * 1.25);

// Generelt: map: (a -> b) -> [a] -> [b]`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              filter — behold kun de som matcher predikat
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python
voksne = [u for u in brukere if u.alder >= 18]
voksne = list(filter(lambda u: u.alder >= 18, brukere))

// TypeScript
const voksne = brukere.filter(u => u.alder >= 18);

// Generelt: filter: (a -> bool) -> [a] -> [a]`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              reduce — kollaps lista til én verdi
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python
from functools import reduce
sum_priser = reduce(lambda acc, p: acc + p, priser, 0)
# Eller bare: sum(priser)
# Lengste navn?
lengste = reduce(lambda a, b: a if len(a) > len(b) else b, navn)

// TypeScript
const sum = priser.reduce((acc, p) => acc + p, 0);
const grupper = brukere.reduce<Record<string, Bruker[]>>((acc, u) => {
  (acc[u.land] ??= []).push(u);
  return acc;
}, {});

// Generelt: reduce: (acc, a -> acc) -> acc -> [a] -> acc`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Pipeline-mønster:</strong> kombiner dem.
            <pre className="mt-2 font-mono text-xs overflow-x-auto whitespace-pre">{`# Total moms-inntekt for voksne kunder
total = (
    sum(u.kjop * 0.25 for u in brukere if u.alder >= 18)
)

const total = brukere
  .filter(u => u.alder >= 18)
  .map(u => u.kjop * 0.25)
  .reduce((a, b) => a + b, 0);`}</pre>
          </div>
        </section>

        <section id="currying" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Currying og partial application</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Currying:</strong> gjør om en funksjon som tar N argumenter til N
            funksjoner som tar ett argument hver. <strong>Partial application:</strong>{" "}
            fyll inn noen av argumentene nå, resten senere.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — partial
from functools import partial

def gang(faktor, x): return faktor * x
dobble = partial(gang, 2)     # fyller "faktor" — gjenstår "x"
print(dobble(7))              # 14

# Curry manuelt (Python har ikke innebygd auto-curry)
def gang_curried(faktor):
    def inner(x): return faktor * x
    return inner
dobble = gang_curried(2)
print(dobble(7))              # 14

// TypeScript — eksplisitt curry
const gang = (faktor: number) => (x: number) => faktor * x;
const dobble = gang(2);
dobble(7);                    // 14

// Eller Ramda / lodash sin curry-funksjon`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Hvorfor det er nyttig:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Lager spesialiserte funksjoner:</strong> <code>dobble = gang(2)</code>, <code>med_moms = legg_til(0.25)</code>.</li>
              <li><strong>Konfig-i-forveien-mønster:</strong> <code>db_query = bind_connection(conn)</code> — så bruk <code>db_query("SELECT ...")</code>.</li>
              <li><strong>Pipeline-vennlig:</strong> alle funksjonene tar samme «type» (én verdi), så de kan komponeres.</li>
              <li><strong>React:</strong> <code>onClick={`{() => handle(id)}`}</code> er en partial — du «sender med» <code>id</code> til en mer generell <code>handle</code>.</li>
            </ul>
          </div>
        </section>

        <section id="recursion" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Recursion vs loops</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Funksjonelle språk bruker rekursjon der imperative bruker loops. Begge kan
            uttrykke samme beregning — valget er om du tenker «steg-for-steg» (loop) eller
            «base case + reduksjon» (rekursjon).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Loop
def sum_loop(xs):
    total = 0
    for x in xs:
        total += x
    return total

# Rekursjon
def sum_rec(xs):
    if not xs:                # base case
        return 0
    return xs[0] + sum_rec(xs[1:])    # reduser problemet

// TypeScript rekursjon
const sumRec = (xs: number[]): number =>
  xs.length === 0 ? 0 : xs[0] + sumRec(xs.slice(1));`}</pre>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <strong className="text-foreground">Når rekursjon vinner</strong>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                <li>Trær (DOM, AST, JSON, filsystem)</li>
                <li>Graf-traversering (DFS)</li>
                <li>Divide-and-conquer (mergesort, quicksort)</li>
                <li>Problem som har samme struktur i mindre versjoner</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <strong className="text-foreground">Når loops vinner</strong>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
                <li>Flat iterasjon over array</li>
                <li>Performance-kritisk Python (call overhead)</li>
                <li>Python sin <code>RecursionError</code> ved dyp rekursjon</li>
                <li>Når base case + steg er mer rotete enn et for-loop</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Tail-call optimization (TCO):</strong> Haskell, Scheme og noen JS-engines
            optimerer rekursjon som ender med kallet (tail position) til en loop bak kulissene.
            Python gjør IKKE dette — derfor maks ca. 1000 dypt før <code>RecursionError</code>.
            Sett <code>sys.setrecursionlimit(...)</code> eller bytt til loop ved dype trær.
          </div>
        </section>

        <section id="lazy" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Lazy evaluation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Eager evaluation:</strong> regn ut alt med en gang.
            <strong> Lazy:</strong> regn ut bare når noen faktisk trenger verdien.
            Haskell er lazy by default. Python og TS gir deg lat-mønstre via generators.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — generator (lazy)
def heltall():
    n = 0
    while True:
        yield n               # «pause» her, yield én verdi
        n += 1

# Uendelig stream — fungerer kun fordi det er lazy
from itertools import islice
print(list(islice(heltall(), 5)))   # [0, 1, 2, 3, 4]

# Imperative ekvivalent ville prøvd å lage en uendelig liste = krasj

// TypeScript — generators
function* heltall() {
  let n = 0;
  while (true) yield n++;
}
const it = heltall();
[it.next().value, it.next().value, it.next().value];   // [0, 1, 2]`}</pre>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong className="text-foreground">Praktisk nytte:</strong>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-1">
              <li><strong>Streaming:</strong> les en stor fil linje-for-linje uten å laste alt.</li>
              <li><strong>Pipelines:</strong> filter | map | take(10) — bare 10 verdier blir noen gang regnet ut.</li>
              <li><strong>Uendelige sekvenser:</strong> <code>fibonacci()</code>-stream, <code>primes()</code>, klokketikk.</li>
              <li><strong>Database-cursorer:</strong> SQLite/psycopg2 returnerer en lazy iterator — ikke alle radene på en gang.</li>
            </ul>
          </div>
        </section>

        <section id="monads" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Monads light — Maybe / Result / IO</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Glem «monad» som ord et øyeblikk. Tenk på det som «en boks med regler for hvordan
            du kobler operasjoner i serie når noe kan gå galt eller mangle». Det er pattern
            du allerede bruker — bare uten å gi det navn.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Maybe / Option — verdien finnes, eller den finnes ikke
            </div>
            <p className="text-sm mb-2">
              Erstatter null/None med en eksplisitt boks.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Python — None-håndtering blir kjedelig
def finn_bruker(id):
    bruker = db.get(id)       # kan være None
    if bruker is None: return None
    profil = bruker.profil    # kan også være None
    if profil is None: return None
    return profil.epost

# Med Maybe (illustrativt — bruk f.eks. returns-pakken eller skriv din egen)
from returns.maybe import Maybe, Nothing, Some

result: Maybe[str] = (
    Maybe.from_optional(db.get(id))
    .map(lambda b: b.profil)
    .map(lambda p: p.epost)
)
# Hvis NOE i kjeden er None: hele blir Nothing. Ellers Some(epost).

// TypeScript — har ikke Maybe innebygd, men "?." kjeder gjør samme jobb:
const epost = db.get(id)?.profil?.epost;   // string | undefined

// Eller med en Option-bibliotek (fp-ts, ts-belt, neverthrow)
import { Option, some, none } from "fp-ts/Option";`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Result / Either — suksess, eller feil med info
            </div>
            <p className="text-sm mb-2">
              Erstatter <code>throw</code> med en eksplisitt sum-type. Feilen er en verdi,
              ikke en sideeffekt.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`// TypeScript — egen Result-type (eller bruk neverthrow)
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function parsTall(s: string): Result<number, string> {
  const n = Number(s);
  return isNaN(n) ? { ok: false, error: "Ikke et tall" } : { ok: true, value: n };
}

const r = parsTall("42");
if (r.ok) console.log(r.value * 2);   // TS vet at value finnes her
else console.log("Feilet:", r.error); // og at error finnes her

# Python — bruk f.eks. result-pakken, eller bare tuple:
def parse_tall(s: str) -> tuple[int | None, str | None]:
    try: return int(s), None
    except ValueError: return None, "Ikke et tall"

# Eller dataclass:
@dataclass
class Ok: value: int
@dataclass
class Err: msg: str
def parse(s: str) -> Ok | Err: ...   # Python 3.10+ unionsyntaks`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              IO — innkapslede side-effekter (Haskell-mønsteret)
            </div>
            <p className="text-sm mb-2">
              I rent funksjonelle språk er <code>print</code> ikke lov i en pure funksjon.
              IO-monaden lar deg BESKRIVE side-effekter som verdier, og kjøre dem fra
              ett sted (vanligvis <code>main</code>). Du holder logikken pure, og side-effektene
              ved kanten av programmet.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`-- Haskell
main :: IO ()
main = do
  navn <- getLine             -- IO String — leser inn
  putStrLn ("Hei " ++ navn)   -- IO () — skriver ut

# Python — samme prinsipp uten typeskillet:
# hold logikken pure, kall side-effekter fra orkestrering
def beregn_skatt(inntekt: float) -> float:   # pure
    return inntekt * 0.25

def main():                                  # orkestrering = side-effekter OK
    inntekt = float(input("Inntekt? "))
    print(beregn_skatt(inntekt))             # I/O isolert til kanten`}</pre>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Hvorfor du allerede bruker monader uten å vite det:</strong>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><code>Promise</code> i JS er en monad (<code>.then</code> er bind/flatMap).</li>
              <li>Array er en monad (<code>.flatMap</code>).</li>
              <li>Optional chaining (<code>?.</code>) er Maybe-monaden i syntaks-form.</li>
              <li>React sin <code>useState</code>-mønster og Redux-reducers er pure functions over immutable state — funksjonell kjerne, side-effekter i hooks.</li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor brukes dette i praksis</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li><strong>React:</strong> pure components, immutable state, hooks som higher-order pattern.</li>
            <li><strong>Redux:</strong> reducers er pure (state, action) → new state.</li>
            <li><strong>RxJS:</strong> hele observable-API-et er map/filter/reduce på streams.</li>
            <li><strong>Pandas:</strong> <code>.apply</code>, <code>.map</code>, <code>.agg</code> — funksjonelt over DataFrames.</li>
            <li><strong>SQL:</strong> deklarativt, ingen mutasjon — ren funksjonell tankegang på et nivå.</li>
          </ul>
          <div className="mt-4">
            <Link
              to="/stack/$slug"
              params={{ slug: "typesystemer" }}
              className="text-brand hover:underline inline-flex items-center"
            >
              Neste: Typesystemer — generics, sum types, variance
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </StackPageShell>
  );
}
