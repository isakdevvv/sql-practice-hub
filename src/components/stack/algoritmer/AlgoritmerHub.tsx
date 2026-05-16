import { Link } from "@tanstack/react-router";
import { ArrowRight, GitBranch, Layers, Workflow, Hash, Binary, Network, Recycle, FileWarning, Boxes } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

// Hub for the DTE-2511 «Algoritmer og datastrukturer»-pensum.
// Each link goes to a /stack/<slug> mini-course with theory + drill exercises.
// Big-O is the cross-cutting framework — students should start there.

type Course = {
  slug: string;
  title: string;
  kapittel: string;
  shortDescription: string;
  Icon: typeof Hash;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "big-o",
    title: "Big-O — kompleksitetsanalyse",
    kapittel: "Tverrgående",
    shortDescription:
      "Vekstrater (O(1), O(log n), O(n), O(n²)), beste/verste/forventet tilfelle. Rammeverket alle de andre temaene bruker.",
    Icon: Workflow,
    status: "ready",
  },
  {
    slug: "rekursjon",
    title: "Rekursjon",
    kapittel: "Kap 15",
    shortDescription:
      "Base case, rekursivt steg, kallstack. Faktorial, Fibonacci, flatten, tail-call-betraktninger.",
    Icon: Recycle,
    status: "ready",
  },
  {
    slug: "sortering",
    title: "Sortering",
    kapittel: "Kap 18-19",
    shortDescription:
      "Bubble, insertion, selection, merge, quick, heap. Stabilitet, beste/verste, divide-and-conquer.",
    Icon: Layers,
    status: "ready",
  },
  {
    slug: "lenkede-strukturer",
    title: "Lenket liste, stack, kø, prioritetskø",
    kapittel: "Kap 20",
    shortDescription:
      "Single/double linked list, push/pop, FIFO/LIFO, deque, heapq, postfix-evaluator.",
    Icon: Boxes,
    status: "ready",
  },
  {
    slug: "filer-exceptions",
    title: "Filer og exceptions",
    kapittel: "Kap 11",
    shortDescription:
      "with-open, try/except/else/finally, custom exception-klasser, pickle.",
    Icon: FileWarning,
    status: "coming-soon",
  },
  {
    slug: "tuples-sets-dicts",
    title: "Tuples, sets og dictionaries",
    kapittel: "Kap 7",
    shortDescription:
      "Mengdeoperasjoner, comprehensions, dict-i-dict, sortering med key=...",
    Icon: GitBranch,
    status: "coming-soon",
  },
  {
    slug: "binaere-soketrear",
    title: "Binære søketrær (BST)",
    kapittel: "Kap 21",
    shortDescription:
      "Insert, søk, traversering (in/pre/post-order), heap, Huffman.",
    Icon: Binary,
    status: "coming-soon",
  },
  {
    slug: "hashing",
    title: "Hashing",
    kapittel: "Kap 22",
    shortDescription:
      "Hash-funksjoner, kollisjon, chaining vs open addressing, lastfaktor, bitwise % når base 2.",
    Icon: Hash,
    status: "coming-soon",
  },
  {
    slug: "grafer",
    title: "Grafer — BFS, DFS, Prim, Dijkstra",
    kapittel: "Kap 23",
    shortDescription:
      "Naboliste vs nabomatrise, traversering, korteste vei, minste utspennende tre.",
    Icon: Network,
    status: "coming-soon",
  },
];

const BIG_O_TABLE = [
  { o: "O(1)", navn: "Konstant", eks: "array-oppslag, dict-get (snitt), stack push/pop" },
  { o: "O(log n)", navn: "Logaritmisk", eks: "binærsøk, BST-insert (balansert)" },
  { o: "O(n)", navn: "Lineær", eks: "skann en liste, finn max, LinkedList-traversering" },
  { o: "O(n log n)", navn: "Lineærlogaritmisk", eks: "mergesort, heapsort, quicksort (snitt)" },
  { o: "O(n²)", navn: "Kvadratisk", eks: "bubble/insertion sort, nestede løkker over samme liste" },
  { o: "O(2ⁿ)", navn: "Eksponentiell", eks: "naiv rekursiv Fibonacci, brute-force subsets" },
  { o: "O(n!)", navn: "Faktoriell", eks: "permutasjoner, brute-force TSP" },
];

export function AlgoritmerHub() {
  return (
    <StackPageShell title="Algoritmer og datastrukturer" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2511 · Pensum
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Algoritmer og datastrukturer
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Ni mini-kurs som dekker hele pensum: rekursjon, sortering, lenkede
            strukturer, trær, hashing og grafer — alle med Big-O som rammeverk.
            Hver del har teori, drag-oppgaver, og kjørbare Python-eksempler.
          </p>
        </div>

        {/* Big-O cheatsheet — alltid synlig fordi det er rammeverket */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Big-O — cheatsheet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Alle algoritmer i pensum klassifiseres med Big-O. Lær deg disse syv
            kategoriene utenat — så blir analysen mønstergjenkjenning.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">O(…)</th>
                  <th className="text-left font-semibold px-4 py-2 w-40">Navn</th>
                  <th className="text-left font-semibold px-4 py-2">Eksempel fra pensum</th>
                </tr>
              </thead>
              <tbody>
                {BIG_O_TABLE.map((r) => (
                  <tr key={r.o} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand">{r.o}</td>
                    <td className="px-4 py-3">{r.navn}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.eks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Kurs-grid */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div
                    key={c.slug}
                    className="rounded-xl border border-border bg-card/30 p-5 opacity-60"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground leading-tight">
                          {c.title}
                        </h3>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        kommer
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{c.kapittel}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {c.shortDescription}
                    </p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-brand" />
                      <h3 className="font-semibold text-foreground leading-tight">
                        {c.title}
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                      klar
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{c.kapittel}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Hvor passer dette inn */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> hvert kurs har
              fyll-inn, match og quiz under sitt emne — sjekk poeng på{" "}
              <Link to="/drag" className="text-brand hover:underline">
                /drag
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Python:</strong> kjør sortering, BFS,
              quicksort i nettleseren under{" "}
              <Link to="/python" className="text-brand hover:underline">
                /python
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">Repetisjonskort:</strong> begreper og
              Big-O på{" "}
              <Link to="/cards" className="text-brand hover:underline">
                /cards
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
