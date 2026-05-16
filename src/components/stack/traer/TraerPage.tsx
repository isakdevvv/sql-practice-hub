import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";
import { lazy, Suspense } from "react";
import { VisualizerSkeleton } from "@/components/visualizer-shell";

const TreeVisualizer = lazy(() =>
  import("./TreeVisualizer").then((m) => ({ default: m.TreeVisualizer })),
);

const STEPS = [
  { title: "Interaktiv: bygg og traverser tre", anchor: "visualisering" },
  { title: "Binærtre — grunnbegrepene", anchor: "basics" },
  { title: "Binary Search Tree (BST)", anchor: "bst" },
  { title: "Traversering", anchor: "traversering" },
  { title: "Balanserte trær (AVL)", anchor: "balansert" },
  { title: "Heap — tre vs array", anchor: "heap" },
  { title: "BST vs hash — trade-offs", anchor: "tradeoffs" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function TraerPage() {
  return (
    <StackPageShell title="Trær" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · Datastrukturer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Trær — hierarki, søk og prioritet
          </h1>
          <p className="mt-3 text-muted-foreground">
            Trær er den datastrukturen som dukker opp overalt: filsystem, DOM,
            indekser i database, expression-parsing, prioritetskøer. Lær
            terminologien én gang, så blir alt det andre lett.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 10 oppgaver under emnet «Trær» — match terminologi, sortér
              BST-innsetting, traverser inorder/preorder.
            </div>
          </div>
        </div>

        <CourseOutline courseId="traer" steps={STEPS} />

        <section id="visualisering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Interaktiv: bygg og traverser tre</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Bytt mellom modusene under: bygg ditt eget binære søketre, animer de
            fire traverseringene, eller kjør AVL-rotasjoner steg for steg på et
            ubalansert tre. Layout: x-aksen er inorder-rekkefølge, y-aksen er
            dybde — så et BST står alltid sortert fra venstre til høyre.
          </p>
          <Suspense fallback={<VisualizerSkeleton />}>
            <TreeVisualizer />
          </Suspense>
        </section>

        <section id="basics" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Binærtre — grunnbegrepene</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et tre er noder koblet sammen uten sykler. <strong>Binærtre</strong>{" "}
            betyr at hver node har maks to barn — venstre og høyre. Begrepene
            må sitte før du går videre:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`             [10]          <- root (rotnode, dybde 0)
            /    \\
         [5]      [15]       <- interne noder (dybde 1)
        /   \\       \\
      [3]   [7]     [20]     <- løvnoder (leafs, dybde 2)

  height(rot) = 2            (lengste vei rot -> løv)
  depth([7])  = 2            (avstand fra rot)
  size        = 6            (antall noder totalt)`}</pre>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li><strong>Root:</strong> noden uten forelder.</li>
            <li><strong>Leaf / løv:</strong> node uten barn.</li>
            <li><strong>Depth:</strong> avstand fra rot ned til en node.</li>
            <li><strong>Height:</strong> lengste vei fra noden ned til en løv. Treets høyde = høyden av roten.</li>
            <li><strong>Subtree:</strong> hver node er rot i sitt eget undertre.</li>
          </ul>
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`class Node:
    def __init__(self, key):
        self.key = key
        self.venstre = None
        self.hoyre = None`}</pre>
          </div>
        </section>

        <section id="bst" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Binary Search Tree (BST)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            BST er et binærtre med en <strong>invariant</strong>: for hver node
            er alle nøkler i venstre subtree mindre enn noden, og alle i høyre
            subtree større. Det gjør søk til <code>O(h)</code> der h er treets
            høyde.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def insert(rot, key):
    if rot is None:
        return Node(key)
    if key < rot.key:
        rot.venstre = insert(rot.venstre, key)
    elif key > rot.key:
        rot.hoyre = insert(rot.hoyre, key)
    return rot   # duplikater ignoreres her

def search(rot, key):
    if rot is None or rot.key == key:
        return rot
    if key < rot.key:
        return search(rot.venstre, key)
    return search(rot.hoyre, key)`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Sletting er trickyest. Tre tilfeller:
          </p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-5 mb-3">
            <li>Løvnode: bare fjern den.</li>
            <li>Ett barn: erstatt noden med barnet.</li>
            <li>To barn: finn <em>inorder successor</em> (minste i høyre subtree), kopier verdien opp, slett successor rekursivt.</li>
          </ol>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def min_node(n):
    while n.venstre is not None:
        n = n.venstre
    return n

def delete(rot, key):
    if rot is None: return None
    if key < rot.key:
        rot.venstre = delete(rot.venstre, key)
    elif key > rot.key:
        rot.hoyre = delete(rot.hoyre, key)
    else:
        if rot.venstre is None: return rot.hoyre
        if rot.hoyre is None: return rot.venstre
        succ = min_node(rot.hoyre)        # inorder successor
        rot.key = succ.key
        rot.hoyre = delete(rot.hoyre, succ.key)
    return rot`}</pre>
          </div>
        </section>

        <section id="traversering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Traversering</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fire klassiske måter å besøke alle noder. Tre er DFS-baserte
            (rekursjon), én er BFS-basert (kø).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`             [10]
            /    \\
         [5]      [15]
        /   \\       \\
      [3]   [7]     [20]

  Preorder  (rot, V, H):  10, 5, 3, 7, 15, 20
  Inorder   (V, rot, H):  3, 5, 7, 10, 15, 20    <- sortert!
  Postorder (V, H, rot):  3, 7, 5, 20, 15, 10
  Level-order (BFS):      10, 5, 15, 3, 7, 20`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def inorder(n, acc):
    if n is None: return
    inorder(n.venstre, acc)
    acc.append(n.key)
    inorder(n.hoyre, acc)

from collections import deque
def level_order(rot):
    q, ut = deque([rot]), []
    while q:
        n = q.popleft()
        if n is None: continue
        ut.append(n.key)
        q.append(n.venstre); q.append(n.hoyre)
    return ut`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Hvorfor velge hva:</strong> inorder gir sortert utskrift av
            BST. Postorder brukes for å slette/frigjøre treet (barn først). Preorder
            for å kopiere/serialisere treet (rot først). Level-order for
            shortest-path-spørsmål.
          </p>
        </section>

        <section id="balansert" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Balanserte trær — AVL</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En BST kan bli <strong>skewed</strong> hvis du setter inn allerede
            sortert data — alt havner til høyre, treet blir en lenkeliste,
            søk degraderer til <code>O(n)</code>. Balanserte trær fikser dette
            ved å rotere noder under innsetting.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Skewed BST (insert 1,2,3,4,5):

   [1]
     \\
     [2]
       \\
       [3]
         \\
         [4]
           \\
           [5]    h = 4, O(n) søk

AVL etter samme inserts:

       [2]
      /   \\
    [1]   [4]
         /   \\
       [3]   [5]    h = 2, O(log n) søk`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>AVL-invariant:</strong> for hver node er forskjellen i høyde
            mellom venstre og høyre subtree maks 1. Når en innsetting bryter det,
            roterer vi:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li><strong>Single rotation</strong> (LL eller RR): én rotasjon mot motsatt side.</li>
            <li><strong>Double rotation</strong> (LR eller RL): først rotere barnet, så noden.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Konsekvens: alle operasjoner garanteres <code>O(log n)</code>. Andre
            varianter: Red-Black trær (mindre strikt balanse, brukt i Java
            TreeMap og Linux scheduler), B-trær (mange barn per node, brukes i
            databaser).
          </p>
        </section>

        <section id="heap" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Heap — tre vs array</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En <strong>min-heap</strong> er et komplett binærtre der hver
            forelder er mindre enn begge barna. Roten er alltid minste element.
            Konsept-mentalt er det et tre, men implementeres som en array.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Som tre:                       Som array:

         [1]                     index:  0  1  2  3  4  5  6
        /   \\                    verdi: [1, 3, 2, 7, 5, 4, 8]
     [3]    [2]
    / \\    / \\
  [7] [5][4] [8]

  parent(i) = (i - 1) // 2
  venstre(i) = 2*i + 1
  hoyre(i)   = 2*i + 2`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Array-representasjonen sparer minne (ingen pekere) og er
            cache-vennlig. Push er <code>O(log n)</code> (sift-up), pop er{" "}
            <code>O(log n)</code> (sift-down).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import heapq

h = []
heapq.heappush(h, 5)      # O(log n)
heapq.heappush(h, 1)
heapq.heappush(h, 3)
minste = heapq.heappop(h) # O(log n), gir 1

# Bygg fra liste: O(n), bedre enn n pushes
heapq.heapify([5, 1, 3, 7, 2])`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Bruksområder:</strong> prioritetskø, Dijkstra, scheduler,
            top-K-spørsmål, mediankalkulasjon (to heaps).
          </p>
        </section>

        <section id="tradeoffs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. BST vs hash — trade-offs</h2>
          <div className="overflow-x-auto rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Operasjon</th>
                  <th className="text-left font-semibold px-4 py-2">Balansert BST</th>
                  <th className="text-left font-semibold px-4 py-2">Hash-tabell</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Lookup / insert / delete</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                  <td className="px-4 py-3 font-mono">O(1) snitt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Sortert traversering</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                  <td className="px-4 py-3 font-mono">O(n log n) (sortér først)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Range-query (alle i [a, b])</td>
                  <td className="px-4 py-3 font-mono">O(log n + k)</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Min / max</td>
                  <td className="px-4 py-3 font-mono">O(log n)</td>
                  <td className="px-4 py-3 font-mono">O(n)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Verste tilfelle</td>
                  <td className="px-4 py-3 font-mono">O(log n) garantert</td>
                  <td className="px-4 py-3 font-mono text-destructive">O(n) ved kollisjoner</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Velg hash</strong> hvis du bare trenger lookup-by-key.
            <strong> Velg BST</strong> (eller TreeMap / SortedDict) hvis du
            trenger sortert iterering, range-queries, eller forutsigbar worst-case.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Vanlige feller</h2>
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-5 text-sm">
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Skewed tree:</strong> innsetting av allerede sortert data
                i en ubalansert BST gir <code>O(n)</code>. Bruk AVL/Red-Black
                eller shuffle input.
              </li>
              <li>
                <strong>Tror inorder traversering virker for alle trær:</strong>{" "}
                inorder gir sortert utskrift KUN for BST. Andre trær gir bare en
                vilkårlig rekkefølge.
              </li>
              <li>
                <strong>Glemmer at heap ikke er sortert internt:</strong> en heap
                garanterer bare at roten er minste/største. Resten er delvis
                sortert. Skal du iterere sortert må du pop'e alle.
              </li>
              <li>
                <strong>Rekursjon stack overflow:</strong> dypt tre + rekursiv
                traversering kan sprenge stack i Python (default limit 1000).
                Bruk iterativ traversering med eksplisitt stack hvis
                trærne er store.
              </li>
              <li>
                <strong>Sletting i BST:</strong> two-children-tilfellet
                glemmes ofte. Husk inorder-successor.
              </li>
              <li>
                <strong>Tror BST er rask uten balanse:</strong> Python har INGEN
                balansert BST i standardbiblioteket. <code>dict</code> er hash,
                ikke tre. Bruk <code>sortedcontainers.SortedDict</code> eller
                implementer AVL.
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 10 oppgaver om trær — BST-insert, traversering, AVL.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "grafer-dypere" }}
                className="text-brand hover:underline"
              >
                Grafer (algo)
              </Link>
              : trær er en spesialform av grafer.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="traer" />
      </div>
    </StackPageShell>
  );
}
