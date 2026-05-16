import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SearchVisualizer } from "@/components/stack/sok-algoritmer/SearchVisualizer";

const STEPS = [
  { title: "Array-søk — oppvarming og visualisering", anchor: "array-sok" },
  { title: "Søk som AI-problem", anchor: "intro" },
  { title: "Uinformert søk — BFS, DFS, UCS", anchor: "uninformert" },
  { title: "Iterative deepening", anchor: "ids" },
  { title: "Informert søk — heuristikker", anchor: "heuristikk" },
  { title: "Greedy best-first og A*", anchor: "astar" },
  { title: "Admissible og konsistente heuristikker", anchor: "admissible" },
  { title: "Egenskaper — completeness, optimality, kompleksitet", anchor: "egenskaper" },
  { title: "Når velger du hva?", anchor: "valg" },
];

export function SokAlgoritmerPage() {
  return (
    <StackPageShell title="Søkealgoritmer i AI" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Søk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Søkealgoritmer — fra BFS til A*
          </h1>
          <p className="mt-3 text-muted-foreground">
            AI-søk handler om å finne en sekvens av handlinger fra en starttilstand til
            en måltilstand. Algoritmene er de samme som i grafteori, men perspektivet
            er nytt: vi har et stort (ofte uendelig) tilstandsrom og må velge en
            strategi for å utforske det.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Forskjell fra grafer-trinnet:</span> der
              implementerte vi BFS/DFS på en konkret graf. Her bruker vi søk som
              <em> AI-paradigme</em>: tilstandsrom, heuristikker, og hvorfor A* er
              optimalt.
            </div>
          </div>
        </div>

        <CourseOutline courseId="sok-algoritmer" steps={STEPS} />

        <section id="array-sok" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            0. Array-søk — oppvarming
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Før vi går løs på BFS/DFS/A* på grafer, er det verdt å se klassisk
            søk i en talliste. Det er samme idé — utforsk et søkerom så smart
            som mulig — bare i én dimensjon. Visualiseringen lar deg sette
            target, velge algoritme og steppe gjennom hver sammenligning.
          </p>
          <SearchVisualizer />
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Sammenheng:</strong> invarianten «målet ligger i a[lo..hi]»
            i binærsøk er samme tankesett som «målet ligger et sted i frontier»
            i AI-søk. Forskjellen er at AI-frontieren er en mengde noder, ikke
            et indeksintervall.
          </p>
        </section>

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Søk som AI-problem</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et søkeproblem består av fem komponenter. Når du klarer å beskrive et
            problem i disse termene, har du «redusert det til søk».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Et søkeproblem:
  1. Tilstandsrom        — alle mulige situasjoner
  2. Starttilstand       — der vi begynner
  3. Måltest             — er denne tilstanden et mål?
  4. Handlinger / actions — hva kan vi gjøre fra hver tilstand?
  5. Kostfunksjon        — step_cost(s, a, s')

  Løsning = sekvens av handlinger fra start til mål.
  Optimal løsning = løsningen med lavest totalkost.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Eksempel:</strong> Romania-kartet fra Russell &amp; Norvig. Tilstand
            = by, handlinger = naboveier, kostnad = kilometer. Mål = Bucharest.
          </p>
        </section>

        <section id="uninformert" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Uinformert søk</h2>
          <p className="text-sm text-muted-foreground mb-4">
            «Uinformert» (eller «blind») betyr at algoritmen ikke har noen anelse om
            hvor målet ligger — den prøver bare i en eller annen rekkefølge.
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                BFS — Breadth-First Search
              </div>
              <p className="text-sm text-foreground mb-2">
                Bruker en <strong>FIFO-kø (queue)</strong>. Utforsker grunne noder først.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Complete: ja (hvis grenfaktor b er endelig)</li>
                <li>Optimal: ja, hvis alle kostnader er like</li>
                <li>Tid og minne: O(b^d), der d = dybde til grunneste mål</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                DFS — Depth-First Search
              </div>
              <p className="text-sm text-foreground mb-2">
                Bruker en <strong>LIFO-stack</strong>. Går dypt før den backtracker.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Complete: nei (kan loope hvis tilstandsrommet er uendelig)</li>
                <li>Optimal: nei</li>
                <li>Tid: O(b^m), men minne bare O(b·m) — billigere enn BFS</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                UCS — Uniform-Cost Search (Dijkstra)
              </div>
              <p className="text-sm text-foreground mb-2">
                Bruker en <strong>prioritetskø</strong> sortert på <code>g(n)</code>{" "}
                (akkumulert kost fra start). Pakker ut noden med lavest g først.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Complete: ja, hvis alle kostnader &gt; 0</li>
                <li>Optimal: ja — alltid</li>
                <li>Reduserer til BFS når alle kostnader er like</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Felles pseudokode (graph search)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function GRAPH-SEARCH(problem, frontier):
  frontier <- {Node(start)}
  explored <- {}
  while frontier not empty:
    node <- frontier.pop()                # FIFO / LIFO / priority
    if goal_test(node.state): return path(node)
    explored.add(node.state)
    for action in actions(node.state):
      child <- expand(node, action)
      if child.state not in explored
         and child not in frontier:
        frontier.add(child)
  return failure`}</pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Forskjellen mellom BFS, DFS og UCS ligger BARE i hvordan{" "}
              <code>frontier</code> er implementert. Alt annet er identisk.
            </p>
          </div>
        </section>

        <section id="ids" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Iterative deepening (IDS)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kombinerer DFS sin minne-effektivitet med BFS sin garanti om å finne
            grunneste mål. Kjør DFS med dybdebegrensning, og øk grensen med 1 hvis
            målet ikke ble funnet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`function IDS(problem):
  for depth = 0, 1, 2, ...:
    result <- DEPTH-LIMITED-SEARCH(problem, depth)
    if result != cutoff: return result

Egenskaper:
  Complete  = ja
  Optimal   = ja (hvis like kostnader)
  Tid       = O(b^d)  ← samme orden som BFS
  Minne     = O(b·d)  ← samme som DFS

Hvorfor ikke kastet bort tid? De ytre lagene
domineres av det innerste laget (b^d).`}</pre>
          </div>
        </section>

        <section id="heuristikk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Informert søk — heuristikker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En <strong>heuristikk h(n)</strong> er et estimat av kostnaden fra noden n
            til målet. «Informert» søk bruker h til å prioritere lovende noder.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Notasjon:
  g(n) = faktisk kostnad fra start til n
  h(n) = ESTIMAT av kostnad fra n til mål
  f(n) = g(n) + h(n)   ← total estimert kost gjennom n

Eksempler på heuristikker:
  - 8-puzzle:      antall feilplasserte brikker
  - 8-puzzle:      sum av Manhattan-distanser
  - Romania-kart:  rettlinjet luftavstand til Bucharest
  - Grid-rute:     Manhattan- eller Euklidsk distanse`}</pre>
          </div>
        </section>

        <section id="astar" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Greedy best-first og A*</h2>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Greedy best-first
              </div>
              <p className="text-sm text-foreground mb-2">
                Velger alltid noden med lavest <code>h(n)</code>. Ignorerer kostnad
                så langt.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Rask, men IKKE optimal — kan velge omveier med kort luftavstand</li>
                <li>Ikke complete uten cycle-check</li>
              </ul>
            </div>

            <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                A* — best av begge verdener
              </div>
              <p className="text-sm text-foreground mb-2">
                Bruker <code>f(n) = g(n) + h(n)</code>. Velger noden med lavest{" "}
                <strong>estimert total kostnad</strong>.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre mt-2">{`function A_STAR(problem, h):
  frontier <- priority_queue ordered by f(n)
  frontier.push(start, f(start) = h(start))
  while frontier not empty:
    n <- frontier.pop()              # lavest f
    if goal_test(n): return path(n)
    for child in expand(n):
      g(child) = g(n) + cost(n, child)
      f(child) = g(child) + h(child)
      add child to frontier`}</pre>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Intuisjon:</strong> g balanserer mot «kortest reell vei», h drar oss
            mot målet. A* finner alltid den optimale ruten — gitt at h oppfyller
            kravene i neste seksjon.
          </p>
        </section>

        <section id="admissible" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Admissible og konsistente heuristikker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Egenskapene til <code>h</code> bestemmer om A* er garantert optimal.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Admissible
              </div>
              <p className="text-sm text-foreground mb-2">
                h(n) ≤ faktisk kostnad fra n til mål.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>Aldri overestimere</li>
                <li>Garanterer A* optimal i <em>tree search</em></li>
                <li>Eks.: luftavstand er admissible på et veikart</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Konsistent (monotonic)
              </div>
              <p className="text-sm text-foreground mb-2">
                h(n) ≤ cost(n, n') + h(n') for hver nabo n'.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-5">
                <li>«Trekantulikheten»</li>
                <li>Konsistent ⇒ admissible</li>
                <li>Garanterer A* optimal også i <em>graph search</em></li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Tips:</strong> hvis du er i tvil — sjekk konsistens. Det er det
            sterkere kravet, og det gir mest fleksibilitet i implementasjonen.
          </p>
        </section>

        <section id="egenskaper" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Egenskaper — oversikt</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Complete</th>
                  <th className="text-left font-semibold px-4 py-2">Optimal</th>
                  <th className="text-left font-semibold px-4 py-2">Tid</th>
                  <th className="text-left font-semibold px-4 py-2">Minne</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">BFS</td><td className="px-4 py-3">ja</td><td className="px-4 py-3">like kostnader</td><td className="px-4 py-3">O(b^d)</td><td className="px-4 py-3">O(b^d)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">DFS</td><td className="px-4 py-3">nei</td><td className="px-4 py-3">nei</td><td className="px-4 py-3">O(b^m)</td><td className="px-4 py-3">O(b·m)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">UCS</td><td className="px-4 py-3">ja</td><td className="px-4 py-3">ja</td><td className="px-4 py-3">O(b^(1+C*/ε))</td><td className="px-4 py-3">tilsvarende</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">IDS</td><td className="px-4 py-3">ja</td><td className="px-4 py-3">like kostnader</td><td className="px-4 py-3">O(b^d)</td><td className="px-4 py-3">O(b·d)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Greedy</td><td className="px-4 py-3">nei</td><td className="px-4 py-3">nei</td><td className="px-4 py-3">O(b^m)</td><td className="px-4 py-3">O(b^m)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">A*</td><td className="px-4 py-3">ja</td><td className="px-4 py-3">ja (admissible/konsistent)</td><td className="px-4 py-3">eksponentiell, men ofte bra</td><td className="px-4 py-3">eksponentiell</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>b</strong> = branching factor, <strong>d</strong> = dybde til
            grunneste mål, <strong>m</strong> = maksimal dybde i tilstandsrommet,{" "}
            <strong>C*</strong> = optimal kostnad, <strong>ε</strong> = minste
            stegkost.
          </p>
        </section>

        <section id="valg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Når velger du hva?</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Like kostnader, lite tilstandsrom:</strong> BFS holder. Enkelt og
              optimalt.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Dypt tre, lite minne:</strong> DFS eller IDS. IDS gir optimalitet
              gratis hvis kostnadene er like.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Ulike kostnader, ingen heuristikk:</strong> UCS / Dijkstra.
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <strong>Du har en god heuristikk:</strong> A*. Det dominerer alle de
              andre i praksis.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Eksamenstrap:</strong> «Hvorfor er ikke greedy alltid optimalt?» —
              fordi den ignorerer g(n). Konstruér et eksempel der en stor omvei har
              kort luftavstand og greedy faller i fellen.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Søk (AI)»: BFS vs DFS, A* heuristikk-match, admissible vs
              konsistent.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "csp" }} className="text-brand hover:underline">
                Constraint Satisfaction Problems
              </Link>{" "}
              — et søk med struktur som lar oss bruke smartere heuristikker.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
