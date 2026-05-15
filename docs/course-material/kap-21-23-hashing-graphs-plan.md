# Kapittelpakke: Hashing, Grafer og Vektede Grafer

Denne planen oversetter brukerens bokkapitler 21-23 til en original læringspakke for appen. I dagens app er temaene allerede lagt inn som:

- `Python kap. 24`: Hashing
- `Python kap. 25`: Grafer - DFS og BFS
- `Python kap. 26`: Vektede grafer - MST og Dijkstra

Ikke renummerer appens eksisterende kapittel 21-23 uten en egen migrering. De brukes allerede til sortering, lenkede lister/køer og binære søketrær. Riktig kortsiktig løsning er å la bokkapittel 21-23 mappe til appkapittel 24-26.

## Status I Repoet

Eksisterende dekning:

- Kap. 24 forklarer hashing, hash-tabell, kollisjoner, separat chaining, lineær probing, load factor, rehashing og `__hash__`/`__eq__`.
- Kap. 25 forklarer grafbegreper, nabomatrise, naboliste, DFS, BFS, korteste sti i uvektet graf og når DFS/BFS passer.
- Kap. 26 forklarer vektede grafer, minimum spanning tree, Prim, Dijkstra, heap-versjon, negative vekter og forskjellen mellom Prim og Dijkstra.
- Figurene finnes i `src/components/learn/python-figures/PythonFigures.tsx`: hash-layout, chaining, probing, adjacency list, DFS, BFS, weighted graph, Prim, Dijkstra-tabell.

Reell feil/gap:

- `src/lib/learn/dragExercises.ts` har eldre oppgaver med `topic: "Python kap. 21"`, `22`, `23` som handler om hashing/grafer/vektede grafer. De binder mot feil kapitler i dagens app.
- Kap. 24-26 har bare 3 drag-oppgaver hver. Det er brukbart minimum, men for tynt for eksamensøving.
- Flere bokøvinger og metoder er ikke representert som egne praktiske oppgaver.

## Anbefalt Migrering

1. Behold kapitteltekstene som `24`, `25`, `26`.
2. Flytt/dupliser de feilnummererte `d-py21-*`, `d-py22-*`, `d-py23-*`-oppgavene til riktige topics:
   - Hashing: `Python kap. 24`
   - Grafer: `Python kap. 25`
   - Vektede grafer: `Python kap. 26`
3. Endre ID-er slik at de matcher ny topic, for eksempel `d-py21-quiz-hash-purpose` -> `d-py24-quiz-hash-purpose`.
4. Ikke slett de gamle oppgavene før du har sjekket at ingen UI eller progress-data forventer ID-ene.
5. Legg til nye oppgaver til hvert kapittel ender med 6-8 relevante øvinger.

## Kapittel 24: Hashing

Læringsmål:

- Forklare hvorfor hashing gir O(1) forventet søk, innsetting og sletting.
- Skille mellom hash code, komprimering til tabellindeks og faktisk lagring.
- Forklare kollisjon og håndtere den med separat chaining og open addressing.
- Beregne load factor og vite når rehashing trengs.
- Skrive trygge `__eq__` og `__hash__` for egne immutable nøkkelobjekter.

Viktige metoder/begreper å dekke:

- `hash(obj)`
- `obj.__hash__()`
- `obj.__eq__(other)`
- `dict[key] = value`
- `dict.get(key)`
- `key in dict`
- `set.add(element)`
- `set.remove(element)`
- `set.__contains__`
- load factor: `n / capacity`
- rehash: ny tabell, ny kapasitet, legg inn alle elementer på nytt

Mangler som bør legges til:

- Tombstones ved sletting i open addressing.
- Hvorfor mutable objekter er farlige som hash-nøkler.
- Kort om hash randomization/HashDoS, uten å gå dypt.
- Forskjell på linear probing, quadratic probing og double hashing.
- Set-operasjoner: union, intersection, difference.

Originale øvingsideer:

- Beregn tabellindeks for flere nøkler med `hash_code % 8`.
- Marker probe-sekvensen for lineær probing etter en kollisjon.
- Velg riktig kollisjonsstrategi for små, tette og sparse tabeller.
- Finn feilen i en klasse som definerer `__eq__` men mangler `__hash__`.
- Implementer en liten `HashSet` med chaining.
- Forklar hva som skjer når load factor passerer 0.75.

Visualer som gir mest verdi:

- Rehash-over-tid: tabell med 4 plasser -> 8 plasser, samme nøkler får nye indekser.
- Tombstone-figur: occupied, deleted, empty og hvorfor søk ikke kan stoppe ved deleted.

## Kapittel 25: Grafer, DFS og BFS

Læringsmål:

- Modellere problemer som noder og kanter.
- Skille rettet/urettet, vektet/uvektet, simple/complete, cycle/tree/spanning tree.
- Representere grafer med edge list, adjacency matrix og adjacency list.
- Traversere grafer med DFS og BFS.
- Bruke BFS til korteste sti i uvektet graf.
- Bruke DFS/BFS til connectivity og connected components.

Viktige metoder/begreper å dekke:

- `Graph(vertices, edges)`
- `getSize()`
- `getVertices()`
- `getVertex(index)`
- `getIndex(vertex)`
- `getNeighbors(index)`
- `getDegree(index)`
- `addVertex(vertex)`
- `addEdge(u, v)`
- `dfs(start)`
- `bfs(start)`
- `Tree.getRoot()`
- `Tree.getParent(index)`
- `Tree.getSearchOrders()`
- `Tree.getPath(index)`
- `Tree.printPath(index)`

Mangler som bør legges til:

- Connected components som konkret algoritme.
- Cycle detection i både urettet og rettet graf.
- Bipartite-test med BFS-farger.
- Topologisk sort for rettede acykliske grafer.
- Path reconstruction fra `parent`.
- Tydelig skille mellom adjacency vertex list og adjacency edge list.

Originale øvingsideer:

- Bygg adjacency list fra en edge list.
- Konverter adjacency matrix til adjacency list.
- Spor BFS-køen steg for steg.
- Spor DFS-rekursjonsstacken steg for steg.
- Finn connected components i en graf med to separate grupper.
- Rekonstruer korteste uvektede sti fra en `parent`-tabell.
- Test om en graf er bipartite ved å fargelegge nivåer.

Visualer som gir mest verdi:

- Directed graph med topologisk sort.
- Connected components med tre farger.
- Parent-tabell -> path reconstruction.

## Kapittel 26: Vektede Grafer, MST og Dijkstra

Læringsmål:

- Representere vektede kanter i adjacency lists.
- Forklare forskjellen på shortest path og minimum spanning tree.
- Kjøre Prim steg for steg.
- Kjøre Dijkstra steg for steg.
- Rekonstruere korteste sti med parent-tabell.
- Vite hvorfor Dijkstra krever ikke-negative vekter.

Viktige metoder/begreper å dekke:

- `WeightedEdge(u, v, weight)`
- `WeightedGraph(vertices, weighted_edges)`
- `addEdge(u, v, weight)`
- `getWeight(u, v)`
- `printWeightedEdges()`
- `getMinimumSpanningTree(startingIndex=0)`
- `MST.getTotalWeight()`
- `getShortestPath(sourceIndex)`
- `ShortestPathTree.getCost(index)`
- `ShortestPathTree.printAllPaths()`
- `heapq.heappush`
- `heapq.heappop`
- `UnionFind.find`
- `UnionFind.union`

Mangler som bør legges til:

- Kruskal med union-find.
- Path reconstruction etter Dijkstra.
- Priority queue/lazy deletion i Dijkstra.
- Effektiv `isInT`-liste/set for O(1)-medlemskap.
- Bellman-Ford som "bruk dette ved negative vekter" på konseptnivå.
- Spanning forest for ikke-sammenhengende grafer.

Originale øvingsideer:

- Velg neste kant i Prim gitt et delvis MST.
- Kjør én Dijkstra-relaxation og oppdater cost/parent.
- Finn hvorfor en foreslått MST er ugyldig fordi den har sykel.
- Implementer `isInT`-optimaliseringen.
- Implementer Kruskal med union-find på en liten graf.
- Sammenlign BFS, Dijkstra og Prim på samme graf og forklar hvorfor svarene er ulike.

Visualer som gir mest verdi:

- Kruskal: sorterte kanter og union-find-komponenter.
- Dijkstra: graf + cost/parent-tabell + rekonstruert sti.
- Prim vs Dijkstra: samme startgraf, ulikt valgkriterium markert.

## Bokoppgaver Som Gir Mest Læringsverdi

Ikke kopier oppgaveteksten. Lag egne varianter med egne data.

Høy verdi:

- Hashing: implementer `Map` med linear probing; sammenlign hash-funksjoner; implementer set-operasjoner.
- Grafer: connected components, shortest path i uvektet graf, bipartite-test, topologisk sort, visualiser graf fra fil.
- Vektede grafer: Kruskal, adjacency matrix-variant av Prim/Dijkstra, shortest path fra fil, MST fra fil, effektiv medlemskapstest med `isInT`.

Lavere prioritet for første runde:

- Store GUI-oppgaver som krever mye Tkinter/Canvas-arbeid.
- Nine-tail/weighted-nine-tail som egne store case studies. De er gode, men bør komme etter at basisalgoritmene sitter.
- Hamiltonian cycle/TSP. Viktig konsept, men kan forvirre før DFS/BFS/MST/Dijkstra er trygg.

## Agentoppdeling

Bruk separate agenter med disjunkte skriveområder:

- Agent A: rydd `dragExercises.ts` topic/ID-konflikt for hashing.
- Agent B: rydd `dragExercises.ts` topic/ID-konflikt for grafer.
- Agent C: rydd `dragExercises.ts` topic/ID-konflikt for vektede grafer.
- Agent D: legg til nye figurer i `PythonFigures.tsx`.
- Agent E: utvid kapitteltekstene i `pythonChapters.tsx` etter at figurene er klare.

Viktig: Siden `dragExercises.ts` er en append-only storfil, bør én integrator til slutt samle endringene og kjøre typecheck. Parallelle agenter kan planlegge samtidig, men ikke skrive samme fil samtidig uten worktree og bevisst merge.
