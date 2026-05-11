import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hvorfor DP — to forutsetninger", anchor: "hvorfor" },
  { title: "Memoisering vs tabulering", anchor: "memo-tab" },
  { title: "Fibonacci — kanonisk eksempel", anchor: "fib" },
  { title: "0/1 Knapsack", anchor: "knapsack" },
  { title: "Longest common subsequence", anchor: "lcs" },
  { title: "Coin change og edit distance", anchor: "coin-edit" },
  { title: "Når er et problem DP?", anchor: "gjenkjenn" },
];

export function DynamicProgrammingPage() {
  return (
    <StackPageShell title="Dynamic programming" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Algoritmer · DP
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dynamic programming — gjenbruk svar, vinn tid
          </h1>
          <p className="mt-3 text-muted-foreground">
            DP er ikke en algoritme — det er en strategi: bryt problemet i
            mindre delproblemer, løs hver én gang, husk svaret. Forskjellen
            mellom et eksponentielt og polynomisk svar er ofte én tabell.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              har 9 oppgaver under «Dynamic programming» — gjenkjenn DP-problem,
              sortér DP-tabell-fylling, fill inn rekursjon.
            </div>
          </div>
        </div>

        <CourseOutline courseId="dynamic-programming" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor DP — to forutsetninger</h2>
          <p className="text-sm text-muted-foreground mb-3">
            DP gir mening når problemet har <strong>begge</strong> disse
            egenskapene:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5 mb-3">
            <li>
              <strong>Overlapping subproblems:</strong> den naive rekursive
              løsningen kaller seg selv på samme input mange ganger.
            </li>
            <li>
              <strong>Optimal substructure:</strong> optimal løsning på
              hovedproblemet kan bygges fra optimal løsning på delproblemene.
            </li>
          </ul>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`fib(5) uten DP — eksponentielt:

                  fib(5)
                /        \\
            fib(4)        fib(3)
           /     \\        /    \\
        fib(3)  fib(2) fib(2) fib(1)
        /  \\    / \\    / \\
     fib(2) f(1) f(1) f(0) f(1) f(0)
      /  \\
  fib(1) fib(0)

  fib(2) regnes 3 ganger
  fib(3) regnes 2 ganger
  -> O(2^n)

Med DP — hver fib(k) regnes EN gang -> O(n)`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            Det er denne overlappingen som gjør at memoisering bytter
            eksponentiell tid for lineær.
          </p>
        </section>

        <section id="memo-tab" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Memoisering vs tabulering</h2>
          <p className="text-sm text-muted-foreground mb-3">
            To måter å implementere DP på — top-down (memo) eller bottom-up
            (tab). Begge gir samme kompleksitet, men de har ulike fordeler.
          </p>
          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">Memoisering (top-down)</th>
                  <th className="text-left font-semibold px-4 py-2">Tabulering (bottom-up)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Stil</td>
                  <td className="px-4 py-3">Rekursjon + cache</td>
                  <td className="px-4 py-3">Iterativ + 1D/2D-array</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Regner</td>
                  <td className="px-4 py-3">Bare delproblemer som faktisk trengs</td>
                  <td className="px-4 py-3">ALLE delproblemer (kan være sløsing)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Stack-overhead</td>
                  <td className="px-4 py-3 text-destructive">Risiko for stack overflow</td>
                  <td className="px-4 py-3">Ingen rekursjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Lesbarhet</td>
                  <td className="px-4 py-3">Følger naturlig rekursjon</td>
                  <td className="px-4 py-3">Krever å tenke ut rekkefølge</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Minne-optimering</td>
                  <td className="px-4 py-3">Vanskeligere</td>
                  <td className="px-4 py-3">Lett — kan kaste gamle rader</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Memoisering med functools
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

# Tabulering
def fib_tab(n):
    if n < 2: return n
    dp = [0] * (n+1)
    dp[1] = 1
    for i in range(2, n+1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Tabulering med O(1) minne
def fib_o1(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`}</pre>
          </div>
        </section>

        <section id="fib" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Fibonacci — kanonisk eksempel</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fibonacci illustrerer alle DP-konseptene i mikroformat. Hvis du
            forstår fib med DP, har du strukturen til å løse hvilket som helst
            DP-problem.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`State:         dp[i] = i-te fibonacci-tall
Base case:     dp[0] = 0, dp[1] = 1
Transisjon:    dp[i] = dp[i-1] + dp[i-2]
Svar:          dp[n]

Tabell for n=6:
  i      0  1  2  3  4  5  6
  dp[i]  0  1  1  2  3  5  8

Tid:  O(n)        Plass:  O(n) -> O(1) hvis vi bare trenger forrige to`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Steg-for-steg-mønster</strong> for alle DP-problemer:
            (1) definer state, (2) base case, (3) transisjon, (4) iterasjons-rekkefølge,
            (5) returner svar. Skriv det i en kommentar ØVERST i koden — det er
            verdt det.
          </p>
        </section>

        <section id="knapsack" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. 0/1 Knapsack</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Du har en sekk med kapasitet W og n varer, hver med vekt w[i] og
            verdi v[i]. Velg en delmengde med maks verdi som passer i sekken.
            «0/1» betyr du tar EN av hver vare eller ingen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`State:        dp[i][w] = maks verdi med varer 1..i og kapasitet w
Base case:    dp[0][w] = 0 for alle w
Transisjon:
  - Hopp over vare i:        dp[i-1][w]
  - Ta vare i (hvis plass):  dp[i-1][w - w[i]] + v[i]
  dp[i][w] = max av de to

def knapsack(vekt, verdi, W):
    n = len(vekt)
    dp = [[0] * (W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(W+1):
            dp[i][w] = dp[i-1][w]                    # hopp over
            if vekt[i-1] <= w:
                dp[i][w] = max(
                    dp[i][w],
                    dp[i-1][w - vekt[i-1]] + verdi[i-1]
                )
    return dp[n][W]

Tid:  O(n*W)       Plass:  O(n*W) -> O(W) med to rader`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Merk:</strong> <code>O(n·W)</code> er «pseudo-polynomisk» —
            W er VERDIEN, ikke antall bits. For W=10^9 er tabellen for stor.
            For slike tilfeller trenger du andre teknikker (LP-relaksering,
            approksimasjonsalgoritmer).
          </p>
        </section>

        <section id="lcs" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Longest common subsequence (LCS)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Gitt to strenger, finn lengste subsekvens som er felles for begge.
            «Subsekvens» beholder rekkefølgen men trenger ikke være
            sammenhengende. Brukes i diff (<code>git diff</code>),
            bioinformatikk (DNA-alignment).
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`State:        dp[i][j] = LCS-lengde av X[..i] og Y[..j]
Base case:    dp[0][j] = dp[i][0] = 0
Transisjon:
  hvis X[i] == Y[j]:  dp[i][j] = dp[i-1][j-1] + 1
  ellers:             dp[i][j] = max(dp[i-1][j], dp[i][j-1])

Eksempel X="ABCBDAB", Y="BDCAB":

      ""  B  D  C  A  B
  ""   0  0  0  0  0  0
  A    0  0  0  0  1  1
  B    0  1  1  1  1  2
  C    0  1  1  2  2  2
  B    0  1  1  2  2  3
  D    0  1  2  2  2  3
  A    0  1  2  2  3  3
  B    0  1  2  2  3  4    <- LCS-lengde

LCS er "BCAB" (én av flere mulige)

Tid:  O(m*n)`}</pre>
          </div>
        </section>

        <section id="coin-edit" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Coin change og edit distance</h2>
          <p className="text-sm text-muted-foreground mb-3">
            To andre kanoniske DP-problemer du må kjenne igjen.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Coin change — minimum antall mynter for beløp N
# State:  dp[i] = min mynter for å lage i
# Base:   dp[0] = 0,  dp[i] = inf for i > 0
# Trans:  dp[i] = min(dp[i - mynt] + 1) for mynt i myntsett

def coin_change(mynter, N):
    dp = [float('inf')] * (N + 1)
    dp[0] = 0
    for i in range(1, N + 1):
        for m in mynter:
            if m <= i:
                dp[i] = min(dp[i], dp[i - m] + 1)
    return dp[N] if dp[N] != float('inf') else -1

# Tid: O(N * |mynter|)`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 mb-3">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Edit distance (Levenshtein) — min antall operasjoner
# (insert, delete, replace) for a -> b
# State:  dp[i][j] = avstand mellom a[..i] og b[..j]
# Base:   dp[0][j] = j,  dp[i][0] = i
# Trans:
#   hvis a[i] == b[j]:  dp[i][j] = dp[i-1][j-1]
#   ellers: dp[i][j] = 1 + min(dp[i-1][j],    # delete a[i]
#                              dp[i][j-1],    # insert b[j]
#                              dp[i-1][j-1])  # replace

def levenshtein(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j],
                                   dp[i][j-1],
                                   dp[i-1][j-1])
    return dp[m][n]`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Brukes til:</strong> spell-checking, fuzzy search,
            DNA-alignment, autocorrect, stavekontroll.
          </p>
        </section>

        <section id="gjenkjenn" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Når er et problem DP?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Gjenkjenne DP-problemer er det vanskeligste. Spør deg selv:
          </p>
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5 text-sm mb-3">
            <ol className="space-y-2 list-decimal pl-5">
              <li>
                <strong>«Finn maks/min/antall/finnes»</strong> over en mengde
                valg? Klassisk DP-trigger.
              </li>
              <li>
                <strong>Kan jeg skrive en rekursiv løsning</strong> som velger
                «ta eller hopp over», «venstre eller høyre», «inkluder eller
                ekskluder»?
              </li>
              <li>
                <strong>Vil samme deltilstand</strong> dukke opp flere ganger i
                rekursjonen? (Hvis ikke = ren divide-and-conquer.)
              </li>
              <li>
                <strong>Kan jeg beskrive state med få parametere</strong> (eks.
                indeks i, gjenværende kapasitet w)? Hvis state har 1-2 ints, er
                DP nesten alltid mulig.
              </li>
            </ol>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Klassiske DP-mønstre:</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li><strong>1D-DP:</strong> Fibonacci, climbing stairs, house robber, coin change.</li>
            <li><strong>2D-DP (to strenger):</strong> LCS, edit distance, regex match.</li>
            <li><strong>2D-DP (grid):</strong> unique paths, min path sum, dungeon game.</li>
            <li><strong>0/1 valg:</strong> knapsack, subset sum, partition equal sum.</li>
            <li><strong>Intervall-DP:</strong> matrix chain multiplication, palindrome partitioning, burst balloons.</li>
            <li><strong>DP på trær:</strong> max sum path, robber III.</li>
            <li><strong>Bitmask-DP:</strong> traveling salesman (TSP), n &lt; 20.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Når du har gjenkjent mønsteret, er resten formelle: definer state,
            base case, transisjon, rekkefølge, svar.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 9 DP-oppgaver — fyll tabell, gjenkjenn DP-problem, kalkuler kompleksitet.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "rekursjon" }}
                className="text-brand hover:underline"
              >
                Rekursjon
              </Link>
              : DP bygger direkte på rekursiv tenking.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
