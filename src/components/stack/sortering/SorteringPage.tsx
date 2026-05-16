import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SortingVisualizer } from "./SortingVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Hvorfor sortere", anchor: "hvorfor" },
  { title: "Interaktiv: se sorteringen kjøre", anchor: "interaktiv" },
  { title: "Bubble sort", anchor: "bubble" },
  { title: "Selection sort", anchor: "selection" },
  { title: "Insertion sort", anchor: "insertion" },
  { title: "Mergesort (divide & conquer)", anchor: "merge" },
  { title: "Quicksort", anchor: "quick" },
  { title: "Heapsort", anchor: "heap" },
  { title: "Sammenligning + stabilitet", anchor: "sammenligning" },
];

export function SorteringPage() {
  return (
    <StackPageShell title="Sortering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · Kap 18-19
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sortering — seks algoritmer du må kunne
          </h1>
          <p className="mt-3 text-muted-foreground">
            Bubble, selection, insertion (de tre <code>O(n²)</code>), og mergesort, quicksort,
            heapsort (de tre <code>O(n log n)</code>). Lær hva hver gjør, beste/verste
            tilfelle, og når du velger hvilken.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 15+ oppgaver under emnet «Sortering» — match algoritme til egenskap,
              sortér steg, fyll inn pivot-valg.
            </div>
          </div>
        </div>

        <CourseOutline courseId="sortering" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor sortere</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sortert data åpner for raske algoritmer som ellers ville vært umulige —
            binærsøk (<code>O(log n)</code>), effektive merge-operasjoner, og rask
            duplikatfjerning. Sortering er også en pedagogisk gullgruve: det er det
            beste stedet å lære om Big-O, divide-and-conquer, stabilitet og in-place
            algoritmer.
          </p>
        </section>

        <section id="interaktiv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            2. Interaktiv: se sorteringen kjøre
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg algoritme, stokk arrayet, og trykk Play — eller bla steg for steg.
            Gule søyler blir sammenliknet, røde blir byttet, grønne er ferdig sortert.
            Pseudokoden ved siden av lyser opp på den linja som kjøres akkurat nå.
            Sammenlign hvor fort tellerne vokser for <code>O(n²)</code>-sortene mot{" "}
            <code>O(n log n)</code> — særlig på <code>n = 32</code>.
          </p>
          <SortingVisualizer />
        </section>

        <section id="bubble" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bubble sort — O(n²)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Gå gjennom lista, bytt om naboer som er i feil rekkefølge, gjenta til
            ingen bytter trengs. Største element «bobler» til høyre hver runde.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def bubble_sort(lst):
    n = len(lst)
    for i in range(n - 1):
        byttet = False
        for j in range(n - 1 - i):
            if lst[j] > lst[j + 1]:
                lst[j], lst[j + 1] = lst[j + 1], lst[j]
                byttet = True
        if not byttet:        # tidlig exit om allerede sortert
            break
    return lst`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Beste:</strong> <code>O(n)</code> (allerede sortert + tidlig exit).{" "}
            <strong>Verste:</strong> <code>O(n²)</code> (omvendt sortert). Brukes
            sjelden i praksis — pedagogisk verdi.
          </p>
        </section>

        <section id="selection" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Selection sort — O(n²)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Finn minste element, bytt med første. Finn nest minste, bytt med andre.
            Osv. Antall bytter er bare <code>O(n)</code> — billig om bytter er dyre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def selection_sort(lst):
    n = len(lst)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if lst[j] < lst[min_idx]:
                min_idx = j
        lst[i], lst[min_idx] = lst[min_idx], lst[i]
    return lst`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Beste = forventet = verste:</strong> alltid <code>O(n²)</code>{" "}
            sammenligninger, men kun <code>O(n)</code> bytter. Ikke stabil.
          </p>
        </section>

        <section id="insertion" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Insertion sort — O(n²)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            For hvert nye element, sett det inn på riktig plass i den allerede
            sorterte starten. Hjernen din gjør dette med kortstokk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def insertion_sort(lst):
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j + 1] = lst[j]
            j -= 1
        lst[j + 1] = key
    return lst`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Beste:</strong> <code>O(n)</code> (allerede sortert).{" "}
            <strong>Verste:</strong> <code>O(n²)</code>. <strong>Stabil og in-place.</strong>{" "}
            Brukes i praksis for SMÅ lister (n &lt; 50) eller nesten-sorterte data —
            Python sin Timsort bruker insertion sort på small runs internt.
          </p>
        </section>

        <section id="merge" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Mergesort — O(n log n), stabil</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klassisk divide-and-conquer: del lista i to, sortér hver halvdel rekursivt,
            flett resultatene sammen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def mergesort(lst):
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    venstre = mergesort(lst[:mid])
    hoyre   = mergesort(lst[mid:])
    return merge(venstre, hoyre)

def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i]); i += 1
        else:
            result.append(b[j]); j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Garanti:</strong> alltid <code>O(n log n)</code> uansett input —
            ingen verste-tilfelle-fallgruver. <strong>Stabil.</strong>{" "}
            <strong>Ikke in-place</strong> — bruker <code>O(n)</code> ekstra minne.
          </p>
        </section>

        <section id="quick" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Quicksort — O(n log n) snitt, O(n²) verste</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg en <em>pivot</em>, partisjoner lista i &lt; pivot, = pivot, &gt; pivot,
            sortér de to ytterdelene rekursivt. I praksis raskere enn mergesort fordi den
            kan gjøres in-place med god cache-bruk.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import random

def quicksort(lst):
    if len(lst) <= 1:
        return lst
    pivot = random.choice(lst)       # eller median-of-three
    mindre  = [x for x in lst if x < pivot]
    likt    = [x for x in lst if x == pivot]
    storre  = [x for x in lst if x > pivot]
    return quicksort(mindre) + likt + quicksort(storre)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Verste tilfelle</strong> <code>O(n²)</code> hvis pivoten alltid er
            minste eller største element (eks. allerede sortert med fast pivot på første).
            <strong> Median-of-three</strong> (sjekk første, midt, siste — velg medianen)
            reduserer sannsynligheten kraftig. Randomisert pivot fjerner adversarial
            patterns. <strong>Ikke stabil.</strong>
          </p>
        </section>

        <section id="heap" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Heapsort — O(n log n)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bygg en heap fra lista, pop ut minste (eller største) element gjentatte
            ganger. Hver pop er <code>O(log n)</code>, og vi popper n ganger.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import heapq

def heapsort(lst):
    h = list(lst)
    heapq.heapify(h)              # O(n)
    return [heapq.heappop(h) for _ in range(len(h))]  # n × O(log n)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Garanti:</strong> alltid <code>O(n log n)</code>. <strong>In-place</strong>{" "}
            kan implementeres ved å bruke array-en selv. <strong>Ikke stabil.</strong>{" "}
            Python sin <code>heapq</code> er en min-heap.
          </p>
        </section>

        <section id="sammenligning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Sammenligning + stabilitet</h2>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Beste</th>
                  <th className="text-left font-semibold px-4 py-2">Snitt</th>
                  <th className="text-left font-semibold px-4 py-2">Verste</th>
                  <th className="text-left font-semibold px-4 py-2">Plass</th>
                  <th className="text-left font-semibold px-4 py-2">Stabil?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Bubble</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Selection</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3">Nei</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Insertion</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Mergesort</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                  <td className="px-4 py-3">Ja</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Quicksort</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono text-destructive">O(n²)</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                  <td className="px-4 py-3">Nei</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Heapsort</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3">Nei</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Stabilitet — hva betyr det?
            </div>
            <p className="text-foreground mb-2">
              En sortering er <strong>stabil</strong> hvis to elementer med samme nøkkel
              beholder sin opprinnelige rekkefølge. Viktig når du sorterer på flere
              kriterier i sekvens — eks. først på navn, så på alder.
            </p>
            <pre className="font-mono text-xs rounded bg-background border border-border p-2 overflow-x-auto whitespace-pre">{`# Input:  [(Ane, 30), (Bo, 25), (Ane, 22)]
# Stabil sort by age:    [(Ane, 22), (Bo, 25), (Ane, 30)]
# Ustabil kan gi:        [(Ane, 22), (Bo, 25), (Ane, 30)]
#                        eller en annen ordning av Ane-radene`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 15+ sorterings-oppgaver — sortér steg i mergesort, gjett antall
              sammenligninger, finn pivot.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "lenkede-strukturer" }}
                className="text-brand hover:underline"
              >
                Lenkede strukturer
              </Link>
              : heapq + sortering henger sammen.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="sortering" />
      </div>
    </StackPageShell>
  );
}
