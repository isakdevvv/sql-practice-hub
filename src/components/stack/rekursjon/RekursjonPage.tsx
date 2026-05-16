import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const RecursionVisualizer = lazy(() =>
  import("./RecursionVisualizer").then((m) => ({ default: m.RecursionVisualizer })),
);

const STEPS = [
  { title: "Interaktiv visualisering", anchor: "visualisering" },
  { title: "Hva er rekursjon", anchor: "hva" },
  { title: "Anatomi — base case + rekursivt steg", anchor: "anatomi" },
  { title: "Kallstacken — hva skjer i minnet", anchor: "kallstack" },
  { title: "Klassiske eksempler", anchor: "eksempler" },
  { title: "Rekursjon vs iterasjon", anchor: "vs-iterasjon" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function RekursjonPage() {
  return (
    <StackPageShell title="Rekursjon" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · Kap 15
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Rekursjon — funksjoner som kaller seg selv
          </h1>
          <p className="mt-3 text-muted-foreground">
            En rekursiv funksjon kaller seg selv på et MINDRE problem, helt til problemet
            er så lite at det kan løses direkte (base case). Det er den naturlige formen for
            problemer som har en selv-lik struktur — trær, lister-i-lister, og «del-og-hersk».
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 12 oppgaver under emnet «Rekursjon» — fyll inn base case, sortér
              kallstack-rekkefølge, quiz om output.
            </div>
          </div>
        </div>

        <CourseOutline courseId="rekursjon" steps={STEPS} />

        <section id="visualisering" className="mb-12">
          <h2 className="text-xl font-semibold mb-2">
            Interaktiv: se rekursjonen brette seg ut
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg en funksjon, sett <code>n</code>, og steg gjennom kallene én og én — eller
            trykk Play. Til venstre ser du kallstacken bygge seg opp og rive seg ned igjen.
            Til høyre ser du selve rekursjonstreet med pending (gult), returnert (grønt)
            og — for naiv fib — duplikat-noder i rødt som motiverer memoisering.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <RecursionVisualizer />
          </Suspense>
        </section>

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er rekursjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En rekursiv funksjon er en funksjon som <strong>kaller seg selv</strong> med et
            mindre argument. Eksempel — fakultet:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def fakultet(n):
    if n <= 1:           # base case
        return 1
    return n * fakultet(n - 1)   # rekursivt steg

fakultet(4)
# = 4 * fakultet(3)
# = 4 * 3 * fakultet(2)
# = 4 * 3 * 2 * fakultet(1)
# = 4 * 3 * 2 * 1
# = 24`}</pre>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Hver gang funksjonen kaller seg selv, kommer den ett steg nærmere base case.
            Når base case treffer, returnerer funksjonen et konkret svar, og «kjeden»
            bygges ned igjen.
          </p>
        </section>

        <section id="anatomi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Anatomi — base case + rekursivt steg</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alle rekursive funksjoner har akkurat to deler. Glem den ene, og du får
            enten feil svar eller uendelig løkke.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-success/40 bg-success/5 p-5">
              <div className="text-xs uppercase tracking-wider text-success font-semibold mb-2">
                Base case
              </div>
              <p className="text-sm text-foreground mb-2">
                Det enkleste problemet — der vi vet svaret uten å rekurrere.
              </p>
              <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`if n <= 1:
    return 1`}</pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Uten base case kaller funksjonen seg selv for alltid →{" "}
                <code>RecursionError</code>.
              </p>
            </div>
            <div className="rounded-xl border border-brand/40 bg-brand/5 p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Rekursivt steg
              </div>
              <p className="text-sm text-foreground mb-2">
                Reduser problemet til et MINDRE problem av samme type, og kombiner.
              </p>
              <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`return n * fakultet(n - 1)`}</pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Hvis det rekursive kallet ikke gjør problemet mindre, treffer aldri
                base case.
              </p>
            </div>
          </div>
        </section>

        <section id="kallstack" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Kallstacken — hva skjer i minnet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver gang en funksjon kalles, legges en <em>frame</em> på <strong>kallstacken</strong>
            med lokale variabler og hvor vi var i koden. Når funksjonen returnerer,
            popper rammen av og vi går tilbake til foreldrekallet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`fakultet(3) kalles
| frame: fakultet(3), n=3, venter på fakultet(2)
|
└─ fakultet(2) kalles
   | frame: fakultet(2), n=2, venter på fakultet(1)
   |
   └─ fakultet(1) kalles
      | frame: fakultet(1), n=1 → returnerer 1
      |
   ↑ returnerer 1 til fakultet(2)
   | fakultet(2) regner 2 * 1 = 2, returnerer 2
   |
↑ returnerer 2 til fakultet(3)
| fakultet(3) regner 3 * 2 = 6, returnerer 6`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Konsekvens:</strong> hver rekursjonsdybde koster minne (én frame). Python
            har default-grense på ~1000 dybder. Veldig dyp rekursjon kaster{" "}
            <code>RecursionError: maximum recursion depth exceeded</code>.
          </p>
        </section>

        <section id="eksempler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Klassiske eksempler</h2>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-2">Flatten av nestede lister</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Naturlig rekursiv struktur: en liste kan inneholde lister som kan inneholde
                lister. Base case: et element som ikke er en liste.
              </p>
              <pre className="font-mono text-xs rounded bg-background border border-border p-3 overflow-x-auto whitespace-pre">{`def flatten(nested_list):
    flat_list = []
    for item in nested_list:
        if isinstance(item, list):
            flat_list.extend(flatten(item))   # rekursivt steg
        else:
            flat_list.append(item)            # base case-handling
    return flat_list

flatten([1, [2, 3], 4, [5, [12, 13], 6]])
# [1, 2, 3, 4, 5, 12, 13, 6]`}</pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-2">Fibonacci (naiv vs. memoized)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Naiv versjon er <code>O(2ⁿ)</code> fordi samme delproblem regnes ut mange ganger.
                Memoization gjør det til <code>O(n)</code>.
              </p>
              <pre className="font-mono text-xs rounded bg-background border border-border p-3 overflow-x-auto whitespace-pre">{`# Naiv — O(2ⁿ), elendig på n > 30
def fib(n):
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)

# Med memoization — O(n)
from functools import lru_cache
@lru_cache(maxsize=None)
def fib_memo(n):
    if n < 2: return n
    return fib_memo(n - 1) + fib_memo(n - 2)`}</pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-2">Ruler / divide-and-conquer</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Tegn en linjal: stikk øverst, så halv-så-høye stikker på halve avstander.
                Klassisk «del problemet i to»-mønster.
              </p>
              <pre className="font-mono text-xs rounded bg-background border border-border p-3 overflow-x-auto whitespace-pre">{`def ruler(left, right, height, rul):
    if height <= 0:        # base case
        return
    mid = (left + right) // 2
    ruler(left, mid, height - 1, rul)   # rekursivt: venstre halvdel
    rul[mid] = height                    # gjør jobb
    ruler(mid, right, height - 1, rul)   # rekursivt: høyre halvdel`}</pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Mønster: rekursjon venstre → jobb i midten → rekursjon høyre. Dette er
                også formen til <strong>in-order traversering</strong> av binærtre.
              </p>
            </div>
          </div>
        </section>

        <section id="vs-iterasjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Rekursjon vs iterasjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alt som kan løses rekursivt kan også løses iterativt — og motsatt. Valget
            handler om lesbarhet og strukturen til problemet.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-1/3">Velg rekursjon når...</th>
                  <th className="text-left font-semibold px-4 py-2">Velg iterasjon når...</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">
                    Problemet HAR en selv-lik struktur (tre, nestet liste, divide & conquer)
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    En enkel løkke gjør jobben uten å gjenta seg selv
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">
                    Du trenger flere «retninger» (eks. venstre + høyre i et tre)
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Rekursjonsdybden kan overskride 1000
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">
                    Kallstacken naturlig matcher problemets struktur
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Du bryr deg om hver siste mikrosekund (rekursjon har overhead)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Mangler base case</strong> → uendelig rekursjon →{" "}
              <code>RecursionError</code>. Skriv base case FØRST når du designer.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Rekursjonen reduserer ikke problemet</strong> — eks.{" "}
              <code>fakultet(n)</code> som kaller <code>fakultet(n)</code> i stedet for{" "}
              <code>fakultet(n - 1)</code>. Hver kall MÅ gjøre problemet mindre.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Eksponentiell tid pga. dobbeltarbeid</strong> — naiv Fibonacci
              regner <code>fib(5)</code> mange ganger. Bruk memoization med{" "}
              <code>@lru_cache</code> eller bygg en lookup-tabell.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Muterende default-argument</strong> — <code>def f(x, lst=[]):</code>{" "}
              deler lista mellom alle kall. Bruk <code>lst=None</code> og initialiser inni.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Tail-call-optimalisering finnes IKKE i Python.</strong> Andre språk
              kan resirkulere stackframes for hale-rekursjon, men Python beholder dem alle.
              For dyp rekursjon: skriv om til iterasjon med eksplisitt stack.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 12 oppgaver under «Rekursjon» — fyll inn base case, gjett output, sortér
              kallstack.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "sortering" }}
                className="text-brand hover:underline"
              >
                Sortering
              </Link>
              : mergesort og quicksort bruker samme «del-og-hersk»-mønster.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="rekursjon" />
      </div>
    </StackPageShell>
  );
}
