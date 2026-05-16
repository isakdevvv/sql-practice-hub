import { Link } from "@tanstack/react-router";
import { Lightbulb, Infinity as InfinityIcon, AlertTriangle, ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { TspDpVisualizer } from "./TspDpVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "DP-prinsipp", anchor: "intro" },
  { title: "Memoization vs tabulation", anchor: "memo-vs-tab" },
  { title: "Klassisk: Fibonacci", anchor: "fib" },
  { title: "0/1 Knapsack", anchor: "knap" },
  { title: "TSP — brute force", anchor: "tsp-bf" },
  { title: "Held-Karp DP for TSP", anchor: "held-karp" },
  { title: "Interaktiv: Held-Karp DP-tabell", anchor: "held-karp-vis" },
  { title: "DP og RL", anchor: "dp-rl" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function DpPage() {
  return (
    <StackPageShell title="Dynamic Programming og TSP" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Dynamic Programming
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dynamic Programming — del og lagre
          </h1>
          <p className="mt-3 text-muted-foreground">
            DP er bunnen i RL, optimal kontroll, og hundrevis av algoritmiske
            problemer. Sentralt: gjenkjenne at et stort problem består av små
            overlappende del-problemer — og lagre svarene så vi ikke regner samme
            ting to ganger.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> DP virker når problemet
              har 1) optimal substructure (svaret kan bygges fra svarene til del-
              problemene) og 2) overlapping subproblems (samme del-problem dukker
              opp flere ganger).
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-dp" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. DP-prinsipp</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`To krav for at DP virker:

1. OPTIMAL SUBSTRUCTURE
   Optimal løsning på problem P kan bygges av optimale løsninger
   på del-problemer.
   Eks: korteste vei A→C går via B → korteste vei A→B + B→C.

2. OVERLAPPING SUBPROBLEMS
   Samme del-problem regnes ut flere ganger i naiv rekursjon.
   Eks: Fibonacci — fib(5) trenger fib(3) og fib(4),
        som begge trenger fib(2), som begge trenger fib(1)...

Forskjell DP vs Divide & Conquer:
   D&C:  del-problemer er DISJUNKTE (mergesort: hver halvdel uavhengig)
   DP:   del-problemer OVERLAPPER → vi MÅ memoize

Trinn for å designe en DP-løsning:
   1. Identifisér tilstanden (variablene som beskriver del-problemet)
   2. Skriv rekurrens (hvordan løsningen bygges fra mindre tilstander)
   3. Identifisér basistilfeller
   4. Velg memoization eller tabulation
   5. Tenk på minne (kan vi rolle tabellen?)`}</pre>
          </div>
        </section>

        <section id="memo-vs-tab" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Memoization vs tabulation</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`MEMOIZATION (top-down):
   Skriv vanlig rekursjon. Lagre svarene i en cache (dict / array).
   Sjekk cache før vi rekurser.

   def fib_memo(n, cache={}):
       if n < 2: return n
       if n in cache: return cache[n]
       cache[n] = fib_memo(n-1) + fib_memo(n-2)
       return cache[n]

   Fordeler: enkelt å skrive (bare cache + base case).
             Beregner KUN del-problemer vi faktisk trenger.
   Ulemper:  rekursjon-stack — kan stack-overflow for store n.

TABULATION (bottom-up):
   Iterér gjennom alle tilstandene fra base case og opp. Fyll en
   array. Aldri rekursjon.

   def fib_tab(n):
       dp = [0] * (n+1)
       dp[1] = 1
       for i in range(2, n+1):
           dp[i] = dp[i-1] + dp[i-2]
       return dp[n]

   Fordeler: ingen rekursjon, ofte raskere konstant.
             Lett å rolle tabellen for O(1) minne.
   Ulemper:  må beregne ALLE tilstandene, selv dem vi ikke trenger.

Velg memoization når tilstandsrommet er sparsomt brukt.
Velg tabulation når du må ha hele tabellen, eller minne er kritisk.`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Memoization (top-down)</th>
                  <th className="text-left font-semibold px-4 py-2">Tabulation (bottom-up)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Retning</td>
                  <td className="px-4 py-2 text-muted-foreground">Rekursjon med cache fra n nedover</td>
                  <td className="px-4 py-2 text-muted-foreground">Iterasjon fra base case og oppover</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Tid</td>
                  <td className="px-4 py-2 text-muted-foreground">O(antall reachable subproblems)</td>
                  <td className="px-4 py-2 text-muted-foreground">O(antall subproblems totalt)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Minne</td>
                  <td className="px-4 py-2 text-muted-foreground">O(antall reachable) + stack-frames</td>
                  <td className="px-4 py-2 text-muted-foreground">O(tabell-størrelse), ofte rullbar</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Risiko</td>
                  <td className="px-4 py-2 text-muted-foreground">Stack-overflow ved dyp rekursjon</td>
                  <td className="px-4 py-2 text-muted-foreground">Beregner unyttige tilstander</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Bra på</td>
                  <td className="px-4 py-2 text-muted-foreground">Sparse tilstandsrom</td>
                  <td className="px-4 py-2 text-muted-foreground">Tett tilstandsrom, minne-kritisk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="fib" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Klassisk: Fibonacci</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Naiv rekursjon — eksponensiell (O(2ⁿ)):

   def fib(n):
       if n < 2: return n
       return fib(n-1) + fib(n-2)

Hvorfor så tregt? Tre av kall:
                   fib(5)
                  /      \\
              fib(4)     fib(3)        ← fib(3) regnes 2x
              /   \\     /    \\
          fib(3) fib(2) fib(2) fib(1)  ← fib(2) regnes 3x
          /  \\
      fib(2) fib(1)

   Med memoization: O(n) tid (hver fib(i) regnes 1x), O(n) minne.
   Med tabulation:  O(n) tid, O(n) eller O(1) minne (rull tabellen).

   Rullert tabulation:
       def fib_rolled(n):
           a, b = 0, 1
           for _ in range(n):
               a, b = b, a + b
           return a`}</pre>
          </div>
        </section>

        <section id="knap" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. 0/1 Knapsack</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klassisk DP-problem: gitt N gjenstander med vekt og verdi, og en
            ryggsekk med maks-vekt W — velg subset som maksimerer verdi.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Tilstand: dp[i][w] = maks verdi med de første i gjenstandene
                    og en vekt-kapasitet på w.

Rekurrens (gjenstand i har vekt w_i og verdi v_i):

   dp[i][w] = dp[i-1][w]                            (utelat i)
              max(dp[i-1][w], dp[i-1][w-w_i] + v_i) (ta i, hvis w_i ≤ w)

Basis: dp[0][w] = 0 for alle w (ingen gjenstander).

Algoritme:
   for i in 1..N:
       for w in 0..W:
           dp[i][w] = dp[i-1][w]
           if w_i ≤ w:
               dp[i][w] = max(dp[i][w], dp[i-1][w-w_i] + v_i)
   return dp[N][W]

Tid: O(N · W).      Minne: O(N · W), kan rolles til O(W).

NB: Pseudo-polynomial! W står i kapasiteten — hvis W = 10⁹ er det
treigt. Da bruker man approksimasjonsalgoritmer eller branch-and-bound.`}</pre>
          </div>
        </section>

        <section id="tsp-bf" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. TSP — brute force</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Travelling Salesman: gitt n byer og avstander mellom dem, finn korteste
            rundtur som besøker hver by nøyaktig én gang.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`BRUTE FORCE:
   Generer alle permutasjoner av (n−1) byer (start er fast).
   Beregn lengden av hver tour. Behold beste.

   Tid: O(n!)
        n=10: ~3.6M ruter           — ms
        n=15: ~87 milliarder        — minutter
        n=20: ~2.4 · 10¹⁸           — umulig
        n=25: ~1.5 · 10²⁵           — umulig

TSP er NP-hardt. Ingen polynomisk algoritme er kjent (P ≠ NP-hypotesen).
Men DP gir oss MYE bedre enn O(n!).`}</pre>
          </div>
        </section>

        <section id="held-karp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Held-Karp DP for TSP</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Held-Karp (1962): O(2ⁿ · n²) — eksponensiell, men MYE bedre enn n!.

TILSTAND: dp[S][i] = korteste vei som starter i by 0, besøker
                     EKSAKT mengden S av byer, og slutter i by i.

   S er et SUBSET av {0, 1, ..., n-1}, representert som bitmask.

REKURRENS:
   dp[S][i] = min over j i S \\ {i}:
              dp[S \\ {i}][j]  +  dist(j, i)

BASIS:
   dp[{0}][0] = 0
   (alle andre dp[{0}][i] = ∞)

OPPSETT:
   for S i alle subsets av {0..n-1} som inneholder 0:
       for i in S, i ≠ 0:
           dp[S][i] = min over j i S, j ≠ i:
                      dp[S \\ {i}][j] + dist(j, i)

   answer = min over i ≠ 0:
            dp[{0..n-1}][i] + dist(i, 0)        # lukk turen

n=20: 2²⁰ · 20² = ~400M operasjoner — sekunder.
n=25: 2²⁵ · 25² = ~21G — minutter.
n=30: 2³⁰ · 30² = ~970G — timer.

For n>30: bruk heuristikker (ACO, Christofides, GA), eller integer
programming-løsere som Concorde.

TSP er DET kanoniske eksemplet på «DP for kombinatorisk problem»
og kombinerer fint med eksamen-pensum: DP, ACO og GA fra
metaheuristikk-trinnet, og brute-force som baseline.`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Metode</th>
                  <th className="text-left font-semibold px-4 py-2">Kompleksitet</th>
                  <th className="text-left font-semibold px-4 py-2">Garanti</th>
                  <th className="text-left font-semibold px-4 py-2">Praktisk n</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Brute force</td>
                  <td className="px-4 py-2 text-muted-foreground">O(n!)</td>
                  <td className="px-4 py-2 text-muted-foreground">Eksakt</td>
                  <td className="px-4 py-2 text-muted-foreground">n ≤ 12</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Held-Karp DP</td>
                  <td className="px-4 py-2 text-muted-foreground">O(2ⁿ·n²)</td>
                  <td className="px-4 py-2 text-muted-foreground">Eksakt</td>
                  <td className="px-4 py-2 text-muted-foreground">n ≤ 25–30</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Branch &amp; bound</td>
                  <td className="px-4 py-2 text-muted-foreground">Verste fall O(n!), praksis raskere</td>
                  <td className="px-4 py-2 text-muted-foreground">Eksakt</td>
                  <td className="px-4 py-2 text-muted-foreground">n ≤ ~60</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Christofides</td>
                  <td className="px-4 py-2 text-muted-foreground">O(n³)</td>
                  <td className="px-4 py-2 text-muted-foreground">≤ 1.5 × optimum (metrisk)</td>
                  <td className="px-4 py-2 text-muted-foreground">n ≤ 10 000+</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">GA / ACO / 2-opt</td>
                  <td className="px-4 py-2 text-muted-foreground">Stokastisk, justerbar</td>
                  <td className="px-4 py-2 text-muted-foreground">Ingen — heuristisk</td>
                  <td className="px-4 py-2 text-muted-foreground">n &gt; 1000 i praksis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="held-karp-vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            7. Interaktiv: Held-Karp DP-tabell, steg-for-steg
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg 4 eller 5 byer. Klikk «Fyll neste celle» for å se DP-tabellen
            bygges opp én tilstand av gangen — fra base case <code>dp[{`{0}`}][0]=0</code>,
            via subsets med 2 byer, deretter 3, og så videre. Den gule kanten i
            byene viser hvilken tidligere celle som ga minimumsverdi.
          </p>
          <TspDpVisualizer />
        </section>

        <section id="dp-rl" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. DP og RL</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Value Iteration og Policy Iteration ER dynamic programming. Bellman-
            likningen er rekurrens-relasjonen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bellman optimality:
    V*(s) = max_a  Σ_{s'} P(s'|s,a) · [ R(s,a,s') + γ V*(s') ]

Gjenkjenne DP-strukturen:
   - Tilstand: state s
   - Rekurrens: V(s) avhenger av V(s') for neste states
   - Overlappende subproblemer: mange (s, a) leder til samme s'
   - Optimal substructure: π*(s) komponeres av π*(s') for fremtidige states

Value Iteration = tabulation av V over alle states.
Policy Iteration = også DP — men evaluerings-steget er en LINEÆR LIGNING
som kan løses i lukket form, ikke iterert backup.

Dette er hvorfor RL og DP er to sider av samme sak. Forskjellen:
   - Klassisk DP:  hele modellen er kjent (P og R)
   - RL:           lærer V eller Q ved sampling fra ukjent miljø`}</pre>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Problem</th>
                  <th className="text-left font-semibold px-4 py-2">Tilstand</th>
                  <th className="text-left font-semibold px-4 py-2">Substruktur</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Fibonacci</td>
                  <td className="px-4 py-2 text-muted-foreground">n (én indeks)</td>
                  <td className="px-4 py-2 text-muted-foreground">fib(n) = fib(n−1) + fib(n−2)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">0/1 Knapsack</td>
                  <td className="px-4 py-2 text-muted-foreground">(i, w) — gjenstand-indeks + kapasitet</td>
                  <td className="px-4 py-2 text-muted-foreground">max(ta i, hopp over i)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">LCS</td>
                  <td className="px-4 py-2 text-muted-foreground">(i, j) — prefiks-lengder i to strenger</td>
                  <td className="px-4 py-2 text-muted-foreground">match → 1 + LCS(i−1,j−1), else max(...)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Edit distance</td>
                  <td className="px-4 py-2 text-muted-foreground">(i, j) — prefiks-lengder</td>
                  <td className="px-4 py-2 text-muted-foreground">min(insert, delete, replace) + 1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">TSP (Held-Karp)</td>
                  <td className="px-4 py-2 text-muted-foreground">(S, i) — besøkt sett + slutt-by</td>
                  <td className="px-4 py-2 text-muted-foreground">min_j  dp[S\\{`{i}`}][j] + dist(j, i)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-medium">Coin change</td>
                  <td className="px-4 py-2 text-muted-foreground">resterende sum</td>
                  <td className="px-4 py-2 text-muted-foreground">min over hver mynt c: 1 + dp[s−c]</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Når DP IKKE er løsningen:</span> hvis
              det IKKE finnes optimal substruktur (eks: korteste vei med negative
              sykluser — Bellman-Ford trengs, ikke ren DP), eller hvis problemet
              er greedy-løsbart (Dijkstra, MST). Et annet rødt flagg: hvis du må
              «tenke deg om om» når du formulerer rekurrensen, har du sannsynligvis
              ikke en gyldig DP-struktur. Prøv først å verifisere{" "}
              <em>Bellman&apos;s principle of optimality</em> — kan optimal løsning
              for (n) faktisk bygges fra optimale løsninger for &lt; n?
            </div>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Når kan DP brukes?»</strong> Optimal
              substructure + overlapping subproblems.
            </li>
            <li>
              <strong className="text-foreground">«Memoization vs tabulation?»</strong>{" "}
              Top-down med cache (memo) vs bottom-up over tabell (tab). Memo
              regner kun det som trengs; tab er ofte enklere å analysere og kan
              spare minne.
            </li>
            <li>
              <strong className="text-foreground">«Tids- og minne-kompleksitet for 0/1 knapsack?»</strong>{" "}
              O(N·W) tid, O(N·W) minne (kan rolles til O(W)). Pseudo-polynomial i
              W.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor er Held-Karp DP bedre enn brute force?»</strong>{" "}
              O(2ⁿ·n²) vs O(n!). 2ⁿ&lt;n! for n≥6.
            </li>
            <li>
              <strong className="text-foreground">«Hvor brukes DP i RL?»</strong>{" "}
              Value Iteration og Policy Iteration — Bellman backup er rekurrens-
              relasjonen.
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <InfinityIcon className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dynamic-programming" }} className="text-brand hover:underline">
                DP-trinnet i algoritme-sporet
              </Link>{" "}
              for flere DP-eksempler (LCS, edit distance).
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-reinforcement" }} className="text-brand hover:underline">
                Reinforcement Learning
              </Link>{" "}
              for DP anvendt på MDP.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-genetic-algorithms" }} className="text-brand hover:underline">
                Genetic algorithms
              </Link>{" "}
              for heuristisk TSP — sammenligning eksakt vs approx.
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2501-hub
          </Link>
        </div>
        <RelatedVisualizers slug="tsp-dp" />
</div>
    </StackPageShell>
  );
}
