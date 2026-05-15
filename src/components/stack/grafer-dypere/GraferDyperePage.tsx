import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { GraphAlgoVisualizer } from "./GraphAlgoVisualizer";

const STEPS = [
  { title: "Interaktiv: BFS/DFS/Dijkstra", anchor: "interaktiv" },
  { title: "Representasjon — list vs matrise", anchor: "rep" },
  { title: "BFS og DFS", anchor: "bfs-dfs" },
  { title: "Dijkstra (vektede grafer)", anchor: "dijkstra" },
  { title: "MST — Prim og Kruskal", anchor: "mst" },
  { title: "Topologisk sortering", anchor: "topo" },
  { title: "A* — heuristisk søk", anchor: "astar" },
  { title: "Klassiske grafproblemer", anchor: "klassiske" },
];

export function GraferDyperePage() {
  return (
    <StackPageShell title="Grafer (algo)" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · Grafer dypere
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Grafer — algoritmene som driver alt fra GPS til Git
          </h1>
          <p className="mt-3 text-muted-foreground">
            Veikart, dependency-grafer, sosiale nettverk, kompilator-IR.
            Algoritmene er få og gjenbrukbare — BFS, DFS, Dijkstra, MST,
            topo-sort, A*. Lær når hver passer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 12 oppgaver under «Grafer (algo)» — sortér Dijkstra-steg,
              match algoritme til problem, finn topologisk orden.
            </div>
          </div>
        </div>

        <CourseOutline courseId="grafer-dypere" steps={STEPS} />

        <section id="interaktiv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Interaktiv: kjør BFS/DFS/Dijkstra
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg algoritme og startnode, så trykk <strong>Steg</strong> for å
            utforske én nabo om gangen — eller la <strong>Spill av</strong> gå
            i valgt tempo. Følg med på køen/stacken/heapen nederst og hvilke
            kanter som blir fete. Grafen er bygget for å være regnbar for
            hånd, så test om du klarer å forutsi neste steg.
          </p>
          <GraphAlgoVisualizer />
        </section>

        <section id="rep" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Representasjon — list vs matrise</h2>
          <p className="text-sm text-muted-foreground mb-3">
            En graf G = (V, E) består av noder (vertices) og kanter (edges).
            Hvordan du lagrer dem styrer kompleksiteten på alt annet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel:
       (A)---5---(B)
        |  \\      |
        2   1     3
        |    \\    |
       (C)---4---(D)

Adjacency list (sparse — typisk best):
  A: [(B,5), (C,2), (D,1)]
  B: [(A,5), (D,3)]
  C: [(A,2), (D,4)]
  D: [(A,1), (B,3), (C,4)]

  Plass: O(V + E)
  «Naboer til v»: O(deg(v))
  «Finnes kant u-v?»: O(deg(u))

Adjacency matrix (dense):
       A  B  C  D
    A [ 0  5  2  1 ]
    B [ 5  0  0  3 ]
    C [ 2  0  0  4 ]
    D [ 1  3  4  0 ]

  Plass: O(V^2)
  «Finnes kant u-v?»: O(1)
  «Naboer til v»: O(V)`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Tommelfingerregel:</strong> hvis E &lt;&lt; V², bruk
            adjacency list. Sosial-nettverk-grafer, web-grafer, road-network
            er sparse — list er nesten alltid riktig.
          </p>
        </section>

        <section id="bfs-dfs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. BFS og DFS</h2>
          <p className="text-sm text-muted-foreground mb-3">
            To grunntraverseringer. Forskjellen er datastrukturen: BFS bruker
            kø (FIFO), DFS bruker stack (LIFO eller rekursjon).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from collections import deque

def bfs(graf, start):
    besokt = {start}
    q = deque([start])
    while q:
        v = q.popleft()
        yield v
        for nabo in graf[v]:
            if nabo not in besokt:
                besokt.add(nabo)
                q.append(nabo)

def dfs(graf, start):
    besokt = set()
    stack = [start]
    while stack:
        v = stack.pop()
        if v in besokt: continue
        besokt.add(v)
        yield v
        for nabo in graf[v]:
            if nabo not in besokt:
                stack.append(nabo)`}</pre>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li><strong>BFS</strong> finner korteste vei i <em>uvektet</em> graf — antall kanter.</li>
            <li><strong>DFS</strong> brukes for å finne sykler, sammenhengende komponenter, og som basis for topologisk sortering.</li>
            <li>Begge: tid <code>O(V + E)</code>, plass <code>O(V)</code>.</li>
          </ul>
        </section>

        <section id="dijkstra" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Dijkstra — korteste vei med vekter</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Når kanter har positive vekter (avstand, kostnad, tid) er BFS
            utilstrekkelig. Dijkstra bruker en min-heap til å alltid utvide
            den nærmeste ubehandlede noden.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`import heapq

def dijkstra(graf, start):
    dist = {v: float('inf') for v in graf}
    dist[start] = 0
    heap = [(0, start)]
    while heap:
        d, v = heapq.heappop(heap)
        if d > dist[v]:
            continue                       # stale entry
        for nabo, vekt in graf[v]:
            ny = d + vekt
            if ny < dist[nabo]:
                dist[nabo] = ny
                heapq.heappush(heap, (ny, nabo))
    return dist`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Kompleksitet:</strong> <code>O((V + E) log V)</code> med
            binary heap. <strong>Krav:</strong> alle vekter ≥ 0. Negative
            vekter krever Bellman-Ford <code>O(V·E)</code> som også oppdager
            negative sykler.
          </p>
        </section>

        <section id="mst" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. MST — Prim og Kruskal</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Minimum spanning tree: en delmengde av kanter som binder sammen
            ALLE noder med MINIMUM total vekt. Brukes til nettverksdesign,
            clustering, bildesegmentering.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Prim (vokse tre fra én startnode):
  - Start fra en vilkårlig node, sett i tre T
  - Gjenta: legg til den BILLIGSTE kanten som
    forbinder T med en node UTENFOR T
  - Stopp når alle noder er i T

Kruskal (sortere kanter, hopp over de som danner sykel):
  - Sortér alle kanter etter vekt
  - For hver kant i sortert orden:
        hvis den ikke skaper sykel -> ta den
        (bruk union-find til å sjekke)
  - Stopp etter V-1 kanter`}</pre>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li><strong>Prim:</strong> <code>O(E log V)</code> med heap. Bra på tette grafer.</li>
            <li><strong>Kruskal:</strong> <code>O(E log E)</code>. Bra på sparse grafer; trenger union-find.</li>
            <li>Begge gir et MST. Hvis vekter er unike, er MST unikt.</li>
          </ul>
        </section>

        <section id="topo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Topologisk sortering — DAG</h2>
          <p className="text-sm text-muted-foreground mb-3">
            For en <strong>rettet asyklisk graf</strong> (DAG): en lineær
            ordning av noder slik at hver kant går fremover. Brukes til:
            byggesystemer (make, gradle), kursavhengigheter, scheduling,
            spreadsheet-recalc.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Kahn's algoritme (BFS-basert):

def topo_sort(graf):
    in_grad = {v: 0 for v in graf}
    for v in graf:
        for u in graf[v]:
            in_grad[u] += 1

    q = deque([v for v in graf if in_grad[v] == 0])
    orden = []
    while q:
        v = q.popleft()
        orden.append(v)
        for u in graf[v]:
            in_grad[u] -= 1
            if in_grad[u] == 0:
                q.append(u)

    if len(orden) != len(graf):
        raise ValueError("Graf har sykel — ingen topo-orden")
    return orden`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Eksempel:</strong> kurset «Algoritmer» krever «Python».
            Kanten Python → Algoritmer betyr «Python må komme før». Topo-sort
            gir en gyldig kursrekkefølge. Tid: <code>O(V + E)</code>.
          </p>
        </section>

        <section id="astar" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. A* — heuristisk søk</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Dijkstra utforsker UNIFORMT i alle retninger. A* bruker en{" "}
            <strong>heuristikk h(n)</strong> som estimerer gjenværende
            avstand til mål, og prioriterer noder som ser ut til å lede mot
            målet. Klassisk i GPS og spill-AI.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`A* prioriterer på  f(n) = g(n) + h(n)
  g(n) = faktisk kost fra start til n   (kjent)
  h(n) = estimert kost fra n til mål    (heuristikk)

import heapq

def astar(start, mal, naboer, h):
    g = {start: 0}
    heap = [(h(start), start)]
    forrige = {}
    while heap:
        _, v = heapq.heappop(heap)
        if v == mal:
            return rekonstruer(forrige, mal)
        for nabo, vekt in naboer(v):
            ny_g = g[v] + vekt
            if ny_g < g.get(nabo, float('inf')):
                g[nabo] = ny_g
                forrige[nabo] = v
                heapq.heappush(heap, (ny_g + h(nabo), nabo))
    return None`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Admissible heuristikk:</strong> h(n) må aldri{" "}
            <em>overestimere</em> den faktiske gjenværende avstanden. Da
            garanterer A* optimal løsning.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li><strong>h(n) = 0:</strong> A* degenererer til Dijkstra.</li>
            <li><strong>Manhattan-avstand</strong> på grid: admissible.</li>
            <li><strong>Euklidsk avstand</strong>: admissible når kanter ikke straffer mer enn ren avstand.</li>
            <li><strong>Overestimerer:</strong> rask, men ingen optimalitetsgaranti (grådig best-first search).</li>
          </ul>
        </section>

        <section id="klassiske" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Klassiske grafproblemer</h2>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Problem</th>
                  <th className="text-left font-semibold px-4 py-2">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Kompleksitet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Korteste vei (uvektet)</td>
                  <td className="px-4 py-3">BFS</td>
                  <td className="px-4 py-3 font-mono">O(V + E)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Korteste vei (vektet, ikke-neg.)</td>
                  <td className="px-4 py-3">Dijkstra</td>
                  <td className="px-4 py-3 font-mono">O((V+E) log V)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Korteste vei (kan ha neg.)</td>
                  <td className="px-4 py-3">Bellman-Ford</td>
                  <td className="px-4 py-3 font-mono">O(V·E)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Korteste vei alle-til-alle</td>
                  <td className="px-4 py-3">Floyd-Warshall</td>
                  <td className="px-4 py-3 font-mono">O(V³)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Minimum spanning tree</td>
                  <td className="px-4 py-3">Prim / Kruskal</td>
                  <td className="px-4 py-3 font-mono">O(E log V)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Topologisk orden (DAG)</td>
                  <td className="px-4 py-3">Kahn / DFS</td>
                  <td className="px-4 py-3 font-mono">O(V + E)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Sykel-deteksjon</td>
                  <td className="px-4 py-3">DFS (back-edges)</td>
                  <td className="px-4 py-3 font-mono">O(V + E)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Sammenhengende komponenter</td>
                  <td className="px-4 py-3">BFS / DFS / Union-Find</td>
                  <td className="px-4 py-3 font-mono">O(V + E)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksamenstips
            </div>
            <p className="text-foreground">
              Gjenkjenne problemet er halve jobben. «Hvordan komme fra A til B
              med minst tid?» → Dijkstra. «Bygg infrastruktur som forbinder alle
              for minst kost» → MST. «Kan jeg gjennomføre disse oppgavene gitt
              avhengighetene?» → topo-sort. «Hvor mange klikker mellom to
              Wikipedia-artikler?» → BFS.
            </p>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 12 grafoppgaver — Dijkstra-steg, topo-sort, MST.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dynamic-programming" }}
                className="text-brand hover:underline"
              >
                Dynamic programming
              </Link>
              : mange graf-problemer løses elegant med DP.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
