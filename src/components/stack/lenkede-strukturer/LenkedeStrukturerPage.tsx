import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { LinkedStructuresVisualizer } from "./LinkedStructuresVisualizer";
import { Stack as StackIllustration } from "@/components/illustrations";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Hva er en lenket struktur", anchor: "hva" },
  { title: "Interaktiv visualisering", anchor: "visualisering" },
  { title: "Linked list", anchor: "linked-list" },
  { title: "Stack (LIFO)", anchor: "stack" },
  { title: "Queue (FIFO)", anchor: "queue" },
  { title: "Deque — best av begge", anchor: "deque" },
  { title: "Prioritetskø + heapq", anchor: "prioritetsko" },
  { title: "Postfix-evaluator (praktisk bruk)", anchor: "postfix" },
  { title: "Sammenligningstabell", anchor: "sammenligning" },
];

export function LenkedeStrukturerPage() {
  return (
    <StackPageShell title="Lenkede strukturer — list, stack, kø" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="text-brand shrink-0" aria-hidden>
              <StackIllustration size={64} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Algoritmer · Kap 20
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Lenket liste, stack, kø, prioritetskø
              </h1>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground">
            Fire datastrukturer som virker like ved første øyekast, men har vidt forskjellig
            oppførsel. Lær hvilken som passer hvor — det er det som skiller en god løsning
            fra en treg.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 14+ oppgaver under emnet «Lenkede strukturer» — sortér push/pop-sekvens,
              fyll inn LinkedList-metoder, quiz om FIFO/LIFO.
            </div>
          </div>
        </div>

        <CourseOutline courseId="lenkede-strukturer" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er en lenket struktur</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En lenket struktur lagrer elementer i <strong>noder</strong> som hver peker på
            neste. Sammenlignet med en array:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Array / Python list
              </div>
              <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
                <li>Sammenhengende minne</li>
                <li>Oppslag på indeks <code>O(1)</code></li>
                <li>Insert/slett i midten <code>O(n)</code></li>
                <li>Vokser ved å reallokere</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Lenket struktur
              </div>
              <ul className="space-y-1 text-sm text-foreground list-disc pl-5">
                <li>Noder spredt i minnet, koblet med pekere</li>
                <li>Oppslag på indeks <code>O(n)</code> (må iterere)</li>
                <li>Insert/slett ved kjent node <code>O(1)</code></li>
                <li>Vokser ved å allokere én node</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Interaktiv visualisering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bytt mellom de fem strukturene og kjør operasjoner — se hvordan nodene flyttes,
            hvor <code>head</code>/<code>tail</code>/<code>top</code>/<code>front</code> sitter,
            og hvilken Python-linje som tilsvarer. Det å fysisk se en node fade inn foran head
            er forskjellen mellom å pugge og å forstå.
          </p>
          <LinkedStructuresVisualizer />
        </section>

        <section id="linked-list" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Linked list</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hver Node holder et element og en peker til neste Node. Klassen{" "}
            <code>LinkedList</code> holder peker til head og tail (og typisk en{" "}
            <code>_size</code>-teller).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class Node:
    def __init__(self, e):
        self._element = e
        self._next = None

class LinkedList:
    def __init__(self):
        self._head = None
        self._tail = None
        self._size = 0

    def add_first(self, e):           # O(1)
        new = Node(e)
        new._next = self._head
        self._head = new
        if self._tail is None:
            self._tail = new
        self._size += 1

    def add_last(self, e):            # O(1) takket være tail-peker
        new = Node(e)
        if self._tail is None:
            self._head = self._tail = new
        else:
            self._tail._next = new
            self._tail = new
        self._size += 1

    def remove_first(self):           # O(1)
        if self._size == 0:
            return None
        temp = self._head
        self._head = self._head._next
        if self._head is None:
            self._tail = None
        self._size -= 1
        return temp`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Trekk:</strong> tail-peker gjør <code>add_last</code> billig.
            Uten den ville hvert tillegg vært <code>O(n)</code> (måtte traversere til
            slutten først). <strong>Fallgruve:</strong> <code>remove_last</code> er{" "}
            <code>O(n)</code> i en single-linked list — du må gå til nest-siste node for å
            sette tail. Double-linked list løser dette.
          </p>
        </section>

        <section id="stack" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Stack — LIFO</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Last-In-First-Out: det siste du la inn er det første du tar ut. Som en
            stable med tallerkener — du legger på toppen, du tar fra toppen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Med Python list — enkelt
stack = []
stack.append(1)         # push    O(1) amortisert
stack.append(2)
stack.append(3)
stack.pop()             # → 3     O(1)
stack.pop()             # → 2
# Toppen er alltid lst[-1]

# Med deque (litt mer minne-effektivt, samme API)
from collections import deque
stack = deque()
stack.append(1)
stack.pop()`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bruksområder:</strong> postfix/infix-evaluering, undo-funksjon,
            rekursjon-simulering, parantes-balanse-sjekk, DFS-traversering, kallstacken
            i programmet ditt.
          </p>
        </section>

        <section id="queue" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Queue — FIFO</h2>
          <p className="text-sm text-muted-foreground mb-3">
            First-In-First-Out: den som kom først blir behandlet først. Som kø i
            butikken.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from collections import deque

queue = deque()
queue.append("Per")           # enqueue (bak)   O(1)
queue.append("Kari")
queue.append("Ola")
queue.popleft()               # dequeue (foran) O(1) → "Per"
queue.popleft()                                  # → "Kari"

# OBS: ikke bruk vanlig list — lst.pop(0) er O(n)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bruksområder:</strong> BFS-traversering, oppgave-køer, print-spool,
            simulering av servere, level-order traversering av tre.{" "}
            <strong>Viktig:</strong> bruk <code>deque</code>, ikke vanlig{" "}
            <code>list</code> —{" "}
            <code>lst.pop(0)</code> er <code>O(n)</code> fordi alle elementene må
            flyttes ett hakk.
          </p>
        </section>

        <section id="deque" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Deque — best av begge</h2>
          <p className="text-sm text-muted-foreground mb-3">
            «Double-ended queue». Push og pop fra <em>begge ender</em> er <code>O(1)</code>.
            Kan brukes som både stack og kø — derfor er det Python sin go-to.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from collections import deque

dq = deque([10, 20, 30])
dq.appendleft(5)    # [5, 10, 20, 30]     O(1)
dq.append(40)       # [5, 10, 20, 30, 40] O(1)
dq.popleft()        # → 5,  [10, 20, 30, 40]
dq.pop()            # → 40, [10, 20, 30]`}</pre>
          </div>
        </section>

        <section id="prioritetsko" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Prioritetskø + heapq</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Elementer har en <em>prioritet</em>. Du tar alltid ut det elementet med
            HØYEST prioritet (eller LAVEST, avhenger av implementasjon). Python sin{" "}
            <code>heapq</code> er en min-heap basert på en array.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import heapq

# Bygg fra liste
pq = [5, 1, 4, 2, 3]
heapq.heapify(pq)         # O(n)

heapq.heappush(pq, 0)     # O(log n)
heapq.heappop(pq)         # → 0  (min)     O(log n)
heapq.heappop(pq)         # → 1
heapq.heappop(pq)         # → 2

# Med tuple = (prioritet, payload)
pq = []
heapq.heappush(pq, (3, "lav prioritet"))
heapq.heappush(pq, (1, "høyest"))
heapq.heappush(pq, (2, "midt"))
heapq.heappop(pq)         # → (1, "høyest")`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Bruksområder:</strong> Dijkstra (korteste vei), Huffman-koding,
            event-simulering, top-K-problemer, scheduling. heapq er en MIN-heap; for
            maks: putt inn <code>(-pri, payload)</code> eller bruk{" "}
            <code>heapq._heapify_max</code>.
          </p>
        </section>

        <section id="postfix" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Postfix-evaluator — klassisk stack-bruk</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Postfix-notasjon (Reverse Polish): operatorer kommer ETTER operandene.{" "}
            <code>(4 + 5) * 3</code> blir <code>4 5 + 3 *</code>. Trivielt å evaluere
            med en stack.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from collections import deque

def eval_postfix(expr):
    stack = deque()
    for token in expr.split():
        if token in ('+', '-', '*', '/', '%', '^'):
            b = stack.pop()         # andre operand
            a = stack.pop()         # første operand
            if   token == '+': stack.append(a + b)
            elif token == '-': stack.append(a - b)
            elif token == '*': stack.append(a * b)
            elif token == '/': stack.append(a // b)
            elif token == '%': stack.append(a % b)
            elif token == '^': stack.append(a ** b)
        else:
            stack.append(int(token))
    return stack.pop()

eval_postfix("4 5 + 3 *")    # → 27
eval_postfix("3 4 + 5 * 2 -") # → 33`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Algoritmen er <code>O(n)</code> i antall tokens. Operatorer trenger ikke
            parenteser eller presedens-regler — selve rekkefølgen i strengen avgjør alt.
          </p>
        </section>

        <section id="sammenligning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Sammenligning</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Struktur</th>
                  <th className="text-left font-semibold px-4 py-2">Mønster</th>
                  <th className="text-left font-semibold px-4 py-2">Insert</th>
                  <th className="text-left font-semibold px-4 py-2">Remove</th>
                  <th className="text-left font-semibold px-4 py-2">Python</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Liste (array)</td>
                  <td className="px-4 py-3 text-muted-foreground">Indekserbar</td>
                  <td className="px-4 py-3 font-mono">O(1) end, O(n) midt</td>
                  <td className="px-4 py-3 font-mono">O(1) end, O(n) midt</td>
                  <td className="px-4 py-3"><code>list</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Linked list</td>
                  <td className="px-4 py-3 text-muted-foreground">Sekvensiell</td>
                  <td className="px-4 py-3 font-mono">O(1) end, O(n) midt</td>
                  <td className="px-4 py-3 font-mono">O(1) head</td>
                  <td className="px-4 py-3"><code>collections.deque</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Stack (LIFO)</td>
                  <td className="px-4 py-3 text-muted-foreground">Push/pop én ende</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3"><code>list</code>, <code>deque</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Queue (FIFO)</td>
                  <td className="px-4 py-3 text-muted-foreground">Push bak / pop foran</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3"><code>deque</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Deque</td>
                  <td className="px-4 py-3 text-muted-foreground">Begge ender</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3 font-mono">O(1)</td>
                  <td className="px-4 py-3"><code>collections.deque</code></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-medium">Prioritetskø</td>
                  <td className="px-4 py-3 text-muted-foreground">Min/max først</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                  <td className="px-4 py-3"><code>heapq</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : push/pop-rekkefølge, FIFO vs LIFO, postfix-evaluering, heapq.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "rekursjon" }}
                className="text-brand hover:underline"
              >
                Rekursjon
              </Link>
              : rekursjon bruker kallstacken — DFS bruker stack, BFS bruker kø.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="lenkede-strukturer" />
      </div>
    </StackPageShell>
  );
}
