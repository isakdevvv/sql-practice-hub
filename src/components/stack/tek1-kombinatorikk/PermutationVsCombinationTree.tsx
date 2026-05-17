import { useMemo, useState } from "react";

// PermutationVsCombinationTree
// Brukeren velger n bokstaver (A..G, opptil 7) og r (1..n) og toggler mellom
// "Permutasjoner P(n,r)" og "Kombinasjoner C(n,r)". Vi tegner et tre der
// hvert nivå = ett valg. For permutasjoner er hvert blad en unik ordnet
// sekvens. For kombinasjoner gråes duplikat-sekvenser ut (de som ikke er
// sortert) — slik at de gjenværende svarte er nettopp r!-grupperinger av
// P(n,r) blader, dvs. C(n,r).

const ALL_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function perm(n: number, r: number): number {
  let p = 1;
  for (let i = 0; i < r; i++) p *= n - i;
  return p;
}

function comb(n: number, r: number): number {
  return perm(n, r) / fact(r);
}

type Path = string[];

// Generer alle ordnede sekvenser av lengde r fra letters (uten gjentakelse).
function enumeratePerms(letters: string[], r: number): Path[] {
  if (r === 0) return [[]];
  const out: Path[] = [];
  for (let i = 0; i < letters.length; i++) {
    const rest = [...letters.slice(0, i), ...letters.slice(i + 1)];
    for (const tail of enumeratePerms(rest, r - 1)) {
      out.push([letters[i], ...tail]);
    }
  }
  return out;
}

function isSorted(seq: string[]): boolean {
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] <= seq[i - 1]) return false;
  }
  return true;
}

export function PermutationVsCombinationTree() {
  const [n, setN] = useState(4);
  const [r, setR] = useState(2);
  const [mode, setMode] = useState<"perm" | "comb">("perm");
  const [expandAll, setExpandAll] = useState(true);

  const letters = useMemo(() => ALL_LETTERS.slice(0, n), [n]);

  // Generer alle blader (P(n,r) stk).
  const leaves = useMemo(() => enumeratePerms(letters, r), [letters, r]);
  const sortedLeaves = useMemo(
    () => leaves.filter((seq) => isSorted(seq)),
    [leaves],
  );

  const pCount = perm(n, r);
  const cCount = comb(n, r);

  // Tegn et tre nivå for nivå. På hvert nivå har vi et "remaining"-sett av
  // bokstaver. For kompakthet tegner vi som radvis grupperte chips.
  // Vi viser maks 4 nivåer for å holde plassen rimelig — n*r=4*3=24 blader er
  // grensen vi tåler å rendre lesbart.
  const tooBig = pCount > 60;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          P(n,r) vs C(n,r) — tre-utfoldelse
        </div>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setMode("perm")}
            className={`rounded-md px-3 py-1.5 font-medium border ${mode === "perm" ? "bg-brand text-brand-foreground border-brand" : "border-border bg-background hover:border-brand/40"}`}
          >
            Permutasjoner P(n,r)
          </button>
          <button
            onClick={() => setMode("comb")}
            className={`rounded-md px-3 py-1.5 font-medium border ${mode === "comb" ? "bg-brand text-brand-foreground border-brand" : "border-border bg-background hover:border-brand/40"}`}
          >
            Kombinasjoner C(n,r)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            n = {n} (totalt antall bokstaver)
          </span>
          <input
            type="range"
            min={3}
            max={7}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              setN(v);
              if (r > v) setR(v);
            }}
            className="w-full"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            r = {r} (antall som velges)
          </span>
          <input
            type="range"
            min={1}
            max={Math.min(n, 4)}
            value={r}
            onChange={(e) => setR(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      {/* Klikkbare bokstav-chips for å visualisere "elementer"-settet */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">Elementer:</span>
        {letters.map((L) => (
          <span
            key={L}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-brand/40 bg-brand/10 font-mono font-semibold text-brand"
          >
            {L}
          </span>
        ))}
      </div>

      {/* Tellere */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">n! / (n−r)!</div>
          <div className="font-mono text-base font-semibold">P({n},{r}) = {pCount}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">P(n,r) / r!</div>
          <div className="font-mono text-base font-semibold">÷ r! = ÷ {fact(r)}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-2">
          <div className="text-muted-foreground">n! / (r!(n−r)!)</div>
          <div className="font-mono text-base font-semibold text-brand">C({n},{r}) = {cCount}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="rounded-md border border-border bg-background px-3 py-1 text-xs hover:border-brand/40"
        >
          {expandAll ? "Skjul tre" : "Vis tre"}
        </button>
        <span className="text-xs text-muted-foreground">
          {mode === "perm"
            ? "Alle blader er unike ordnede valg."
            : `r! = ${fact(r)} ordninger per kombinasjon — duplikatene gråes ut.`}
        </span>
      </div>

      {expandAll && (
        <div className="overflow-x-auto">
          {tooBig ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              Treet er for stort til å vises (P({n},{r}) = {pCount} blader).
              Reduser n eller r for å se utfoldelsen.
            </div>
          ) : (
            <TreeRender
              letters={letters}
              r={r}
              highlightSorted={mode === "comb"}
            />
          )}
        </div>
      )}

      {!tooBig && (
        <div className="text-xs text-muted-foreground">
          {mode === "perm" ? (
            <>
              Du leser <strong>{pCount}</strong> blader — én for hver mulig
              rekkefølge.
            </>
          ) : (
            <>
              Av <strong>{pCount}</strong> ordnede sekvenser er bare{" "}
              <strong className="text-brand">{sortedLeaves.length}</strong>{" "}
              sortert (én per kombinasjon). De gråe er samme utvalg i annen
              rekkefølge.
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TreeRender({
  letters,
  r,
  highlightSorted,
}: {
  letters: string[];
  r: number;
  highlightSorted: boolean;
}) {
  // Rekursivt: ved hvert nivå, lag en rad av "valgte tidligere"-prefiks + en
  // gren per gjenværende bokstav. Vi tegner som nested kolonner.
  return (
    <div className="font-mono text-xs">
      <Branch
        prefix={[]}
        remaining={letters}
        depth={r}
        highlightSorted={highlightSorted}
      />
    </div>
  );
}

function Branch({
  prefix,
  remaining,
  depth,
  highlightSorted,
}: {
  prefix: string[];
  remaining: string[];
  depth: number;
  highlightSorted: boolean;
}) {
  if (depth === 0) {
    const sorted = !highlightSorted || isSorted(prefix);
    return (
      <span
        className={`inline-block rounded-md border px-2 py-0.5 m-0.5 ${
          sorted
            ? "border-brand/40 bg-brand/10 text-foreground"
            : "border-border bg-background text-muted-foreground/40 line-through"
        }`}
        title={sorted ? "Tellet" : "Duplikat — samme utvalg, annen rekkefølge"}
      >
        {prefix.join("")}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-3 pl-2 border-l border-border/60 ml-1 my-0.5">
      {remaining.map((L) => {
        const newPrefix = [...prefix, L];
        const newRemaining = remaining.filter((x) => x !== L);
        return (
          <div key={L} className="min-w-0">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-foreground font-semibold">→{L}</span>
              {depth === 1 && <span className="text-foreground/70">⇒</span>}
            </div>
            <Branch
              prefix={newPrefix}
              remaining={newRemaining}
              depth={depth - 1}
              highlightSorted={highlightSorted}
            />
          </div>
        );
      })}
    </div>
  );
}
