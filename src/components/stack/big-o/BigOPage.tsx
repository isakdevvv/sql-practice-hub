import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BigOVisualizer } from "./BigOVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Interaktiv visualisering", anchor: "viz" },
  { title: "Hva er Big-O — intuisjon", anchor: "intuisjon" },
  { title: "De syv klassene", anchor: "klasser" },
  { title: "Analyse-regler", anchor: "regler" },
  { title: "Beste, verste og forventet", anchor: "case" },
  { title: "Eksempler — les kode, gjett Big-O", anchor: "eksempler" },
  { title: "Vanlige feller", anchor: "feller" },
];

type Klasse = {
  o: string;
  navn: string;
  vekst: string;
  kode: string;
  eksempel: string;
};

const KLASSER: Klasse[] = [
  {
    o: "O(1)",
    navn: "Konstant",
    vekst: "Samme tid uansett hvor stor n er",
    kode: "lst[5]\nd[\"nøkkel\"]\nstack.append(x)",
    eksempel: "Array-oppslag, dict-get (snitt), stack push/pop, lengden av en liste",
  },
  {
    o: "O(log n)",
    navn: "Logaritmisk",
    vekst: "Halverer arbeid for hver iterasjon",
    kode: "while lo < hi:\n    mid = (lo + hi) // 2\n    ...",
    eksempel: "Binærsøk, insert i balansert BST, finn et tall i sortert liste",
  },
  {
    o: "O(n)",
    navn: "Lineær",
    vekst: "Direkte proporsjonal med n",
    kode: "for x in lst:\n    if x == mål:\n        ...",
    eksempel: "Skann en liste, finn max/min, len(linkedlist), iterer dict",
  },
  {
    o: "O(n log n)",
    navn: "Lineærlogaritmisk",
    vekst: "n elementer, hver håndteres i log n tid",
    kode: "mergesort(arr) → del, sortér rekursivt, fletter",
    eksempel: "Mergesort, heapsort, quicksort (snitt), Python sorted()",
  },
  {
    o: "O(n²)",
    navn: "Kvadratisk",
    vekst: "Nestet løkke over samme data",
    kode: "for i in range(n):\n    for j in range(n):\n        ...",
    eksempel: "Bubble/insertion sort, dobbel-løkke for å sammenligne alle par",
  },
  {
    o: "O(2ⁿ)",
    navn: "Eksponentiell",
    vekst: "Dobler arbeid for hvert ekstra element",
    kode: "def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)",
    eksempel: "Naiv rekursiv Fibonacci, generér alle subsets, brute-force passord",
  },
  {
    o: "O(n!)",
    navn: "Faktoriell",
    vekst: "Alle permutasjoner",
    kode: "from itertools import permutations\nfor p in permutations(lst):\n    ...",
    eksempel: "Generer alle permutasjoner, brute-force handelsreisende",
  },
];

export function BigOPage() {
  return (
    <StackPageShell title="Big-O — kompleksitetsanalyse" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · Rammeverk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Big-O — hvordan algoritmer skalerer
          </h1>
          <p className="mt-3 text-muted-foreground">
            Big-O beskriver hvordan en algoritmes <em>arbeid</em> vokser når input-størrelsen
            øker. Den ignorerer konstanter og smådetaljer — du får et grovt, men kraftig,
            sammenligningsgrunnlag. Lær deg de syv klassene og tre regler, så blir analysen
            mønstergjenkjenning.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 18+ oppgaver under emnet «Big-O» — les kode og gjett kompleksitet,
              sortér vekstrater, identifiser feller.
            </div>
          </div>
        </div>

        <CourseOutline courseId="big-o" steps={STEPS} />

        <section id="viz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Interaktiv visualisering
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Lek deg fram. Skru på kurvene du vil se, dra <code>n</code> opp og ned,
            slå på log-y for å skille klassene visuelt, kjør et race mellom
            lineær- og binærsøk, og test deg selv med quiz-snippets.
          </p>
          <BigOVisualizer />
        </section>

        <section id="intuisjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Hva er Big-O — intuisjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Forestill deg to algoritmer som begge sorterer en liste. På 100 elementer
            tar de begge under et sekund. Men på 1 million elementer: den ene er ferdig
            på 0.5 sekund, den andre bruker 30 minutter. Big-O forklarer hvorfor.
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Definisjon — i praksis
            </div>
            <p className="text-sm text-foreground mb-3">
              Big-O er <strong>øvre grense på vekst</strong> når n går mot uendelig.
              <code className="ml-1">O(f(n))</code> betyr: «tiden er proporsjonal med
              <code> f(n)</code> for store n, opp til en konstant».
            </p>
            <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
              <li>Ignorer konstanter: <code>3n + 50</code> er <code>O(n)</code>, ikke <code>O(3n)</code>.</li>
              <li>Ignorer mindre ledd: <code>n² + n</code> er <code>O(n²)</code>.</li>
              <li>Vi sammenligner <em>vekstrate</em>, ikke total tid.</li>
            </ul>
          </div>
        </section>

        <section id="klasser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. De syv klassene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Nesten alle pensum-algoritmer hører til en av disse. Lær dem utenat —
            spesielt forskjellen mellom <code>O(log n)</code>, <code>O(n)</code>,{" "}
            <code>O(n log n)</code> og <code>O(n²)</code>.
          </p>
          <div className="space-y-3">
            {KLASSER.map((k) => (
              <div key={k.o} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono text-brand text-lg">{k.o}</span>
                  <span className="font-semibold">{k.navn}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{k.vekst}</p>
                <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">
                  {k.kode}
                </pre>
                <p className="mt-2 text-xs text-muted-foreground">
                  <strong className="text-foreground">Pensum:</strong> {k.eksempel}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="regler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Tre analyse-regler</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Dette er hele verktøykassa for å gå fra kode til Big-O.
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  1
                </span>
                <h3 className="font-semibold text-sm">
                  Sekvens (etter hverandre) → addisjon → behold størst
                </h3>
              </div>
              <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`for x in lst:        # O(n)
    print(x)
for x in lst:        # O(n)
    if x > 0: ...
# Total: O(n) + O(n) = O(2n) = O(n)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  2
                </span>
                <h3 className="font-semibold text-sm">
                  Nesting (løkke i løkke) → multiplikasjon
                </h3>
              </div>
              <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`for i in range(n):     # n iterasjoner
    for j in range(n): # n iterasjoner inni
        print(i, j)
# Total: n × n = O(n²)`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  3
                </span>
                <h3 className="font-semibold text-sm">
                  Halvering / dobling → logaritme
                </h3>
              </div>
              <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`lo, hi = 0, n
while lo < hi:
    mid = (lo + hi) // 2
    # halverer søkeområdet
# Total: O(log n)`}</pre>
            </div>
          </div>
        </section>

        <section id="case" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Beste, verste og forventet tilfelle</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Big-O er <em>verste tilfelle</em> by default. Men noen algoritmer har vidt
            forskjellig beste og verste — det er viktig å vite begge.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Beste</th>
                  <th className="text-left font-semibold px-4 py-2">Forventet</th>
                  <th className="text-left font-semibold px-4 py-2">Verste</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Bubble sort</td>
                  <td className="px-4 py-3 font-mono text-success">O(n)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono text-destructive">O(n²)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Insertion sort</td>
                  <td className="px-4 py-3 font-mono text-success">O(n)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono text-destructive">O(n²)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Mergesort</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Quicksort</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono text-success">O(n log n)</td>
                  <td className="px-4 py-3 font-mono text-destructive">O(n²)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Binærsøk</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Lineærsøk</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Hash-table lookup</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3 font-mono text-success">O(1)</td>
                  <td className="px-4 py-3 font-mono text-destructive">O(n)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Quicksorts verste er <code>O(n²)</code> hvis pivoten alltid er minste/største.
            Median-of-three reduserer sannsynligheten dramatisk — derfor brukes
            randomisert eller median-pivot i praksis.
          </p>
        </section>

        <section id="eksempler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksempler — les kode, gjett Big-O</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tren mønstergjenkjenning på disse seks.
          </p>
          <div className="space-y-4">
            {[
              {
                kode: `def sum_list(lst):
    total = 0
    for x in lst:
        total += x
    return total`,
                svar: "O(n)",
                forklaring: "Én løkke gjennom lst → lineær.",
              },
              {
                kode: `def has_duplicate(lst):
    for i in range(len(lst)):
        for j in range(i + 1, len(lst)):
            if lst[i] == lst[j]:
                return True
    return False`,
                svar: "O(n²)",
                forklaring:
                  "Nestet løkke. Bedre alternativ: set-konvertering gir O(n) snitt.",
              },
              {
                kode: `def binary_search(lst, mål):
    lo, hi = 0, len(lst) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if lst[mid] == mål: return mid
        elif lst[mid] < mål: lo = mid + 1
        else: hi = mid - 1
    return -1`,
                svar: "O(log n)",
                forklaring:
                  "Halverer søkeområdet hvert steg. Krever sortert input.",
              },
              {
                kode: `def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)`,
                svar: "O(2ⁿ)",
                forklaring:
                  "Hvert kall lager to nye kall. Memoization fikser det til O(n).",
              },
              {
                kode: `def pair_sum(a, b):
    for x in a:           # n
        for y in b:       # m
            if x + y == 0:
                return (x, y)
    return None`,
                svar: "O(n × m)",
                forklaring:
                  "To ulike lister — størrelsene må holdes adskilt. Med set: O(n + m).",
              },
              {
                kode: `def double_sort(lst):
    lst.sort()             # O(n log n)
    for x in lst:          # O(n)
        print(x)`,
                svar: "O(n log n)",
                forklaring:
                  "Sekvens — sorteringen dominerer. n log n + n = O(n log n).",
              },
            ].map((e, i) => (
              <details
                key={i}
                className="rounded-xl border border-border bg-card p-4"
              >
                <summary className="cursor-pointer text-sm font-medium">
                  Eksempel {i + 1}
                </summary>
                <pre className="mt-3 font-mono text-xs rounded bg-background border border-border p-3 overflow-x-auto whitespace-pre">
                  {e.kode}
                </pre>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Svar:
                  </span>
                  <span className="font-mono text-brand">{e.svar}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{e.forklaring}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«To løkker etter hverandre er O(n²)»</strong> — nei. Sekvens er
              addisjon: O(n) + O(n) = O(n). Kun NESTING gir multiplikasjon.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Skjult kompleksitet i innebygde funksjoner.</strong>{" "}
              <code>list.index(x)</code> er O(n). <code>x in lst</code> er O(n).{" "}
              <code>x in set</code> er O(1) snitt. <code>sorted()</code> er O(n log n).
              Sjekk alltid hva de innebygde funksjonene koster.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>String-konkatenering i løkke.</strong>{" "}
              <code>s = s + ord</code> N ganger lager nye strings hver gang → O(n²).
              Bruk <code>"".join(liste)</code> for O(n).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Plass-kompleksitet glemmes ofte.</strong> Rekursjon bruker O(d)
              minne på kallstacken, der d er dybden. Quicksort er O(log n) plass på
              gjennomsnitt, O(n) i verste tilfelle.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>O(1) ≠ rask.</strong> O(1) betyr «konstant», ikke «rask». En
              algoritme med 10 millioner steg er O(1) hvis tallet ikke avhenger av n.
              Mest praktisk: O(log n) eller O(n) med liten konstant slår ofte O(1) med
              stor konstant for små n.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgavene
              </Link>
              : tren mønstergjenkjenning på «hva er kompleksiteten her?»-quiz-er.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "sortering" }}
                className="text-brand hover:underline"
              >
                Sortering
              </Link>
              : se Big-O i kontekst — hvorfor mergesort slår bubble.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="big-o" />
      </div>
    </StackPageShell>
  );
}
