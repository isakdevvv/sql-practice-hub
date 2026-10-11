import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// DataSplitVisualizer — viser hvordan train/val/test (eller train/test) deler
// et datasett. Med "stratified"-toggle balanseres klassefordelingen i hver
// split. Studenten ser stolper m/ klassefarger + faktisk telling/andel.
// --------------------------------------------------------------------------

type Strategy = "70-15-15" | "80-20" | "60-20-20";

interface Item {
  i: number;
  label: 0 | 1;
}

function makeItems(n: number, posFrac: number): Item[] {
  const out: Item[] = [];
  // Sorter slik at klassene står ujevnt fordelt → tilfeldig split blir skjev.
  const nPos = Math.round(n * posFrac);
  for (let i = 0; i < nPos; i++) out.push({ i, label: 1 });
  for (let i = nPos; i < n; i++) out.push({ i, label: 0 });
  // En lett "shuffle" som likevel bevarer den skjeve rekkefølgen synlig:
  // hopper hvert N-te element så at positive klumper seg litt mot starten.
  out.sort((a, b) => (a.i * 31) % 7 - (b.i * 31) % 7);
  return out;
}

// Sekvensiell split — bevarer rekkefølgen.
function sequentialSplit(items: Item[], fractions: number[]): Item[][] {
  const out: Item[][] = fractions.map(() => []);
  let idx = 0;
  for (let s = 0; s < fractions.length; s++) {
    const take = s === fractions.length - 1 ? items.length - idx : Math.round(items.length * fractions[s]);
    for (let k = 0; k < take && idx < items.length; k++, idx++) out[s].push(items[idx]);
  }
  return out;
}

// Stratifisert: del hver klasse hver for seg og slå sammen, slik at hver split
// får tilsvarende andel som hele datasettet.
function stratifiedSplit(items: Item[], fractions: number[]): Item[][] {
  const byClass: Record<number, Item[]> = { 0: [], 1: [] };
  for (const it of items) byClass[it.label].push(it);
  const out: Item[][] = fractions.map(() => []);
  for (const cls of [0, 1] as const) {
    const arr = byClass[cls];
    let idx = 0;
    for (let s = 0; s < fractions.length; s++) {
      const take = s === fractions.length - 1 ? arr.length - idx : Math.round(arr.length * fractions[s]);
      for (let k = 0; k < take && idx < arr.length; k++, idx++) out[s].push(arr[idx]);
    }
  }
  return out;
}

const STRAT_FRACS: Record<Strategy, number[]> = {
  "70-15-15": [0.7, 0.15, 0.15],
  "80-20": [0.8, 0.2],
  "60-20-20": [0.6, 0.2, 0.2],
};

const STRAT_LABELS: Record<Strategy, string[]> = {
  "70-15-15": ["Train 70 %", "Val 15 %", "Test 15 %"],
  "80-20": ["Train 80 %", "Test 20 %"],
  "60-20-20": ["Train 60 %", "Val 20 %", "Test 20 %"],
};

const SPLIT_COLORS = [
  "rgb(99 102 241)", // train  (indigo)
  "rgb(234 179 8)", // val    (amber)
  "rgb(244 63 94)", // test   (rose)
];

export function DataSplitVisualizer() {
  const [strategy, setStrategy] = useState<Strategy>("70-15-15");
  const [stratified, setStratified] = useState(true);
  const [posFrac, setPosFrac] = useState(0.2);
  const [n] = useState(200);

  const items = useMemo(() => makeItems(n, posFrac), [n, posFrac]);
  const fractions = STRAT_FRACS[strategy];
  const labels = STRAT_LABELS[strategy];
  const splits = useMemo(
    () => (stratified ? stratifiedSplit(items, fractions) : sequentialSplit(items, fractions)),
    [items, fractions, stratified],
  );

  // Tegn 200 items som små ruter i et grid.
  const cols = 40;
  const rows = Math.ceil(n / cols);
  const cell = 12;
  const gap = 1;
  const gridW = cols * (cell + gap);
  const gridH = rows * (cell + gap);

  // Bygg item → splitIndex-map for fargelegging.
  const splitOf = useMemo(() => {
    const map = new Map<number, number>();
    splits.forEach((arr, s) => arr.forEach((it) => map.set(it.i, s)));
    return map;
  }, [splits]);

  // Bygg klassebalanse pr split.
  const stats = splits.map((arr) => {
    const pos = arr.filter((it) => it.label === 1).length;
    return { total: arr.length, pos, neg: arr.length - pos };
  });
  const overallPos = items.filter((it) => it.label === 1).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <span className="text-muted-foreground">Split-strategi:</span>
        {(Object.keys(STRAT_FRACS) as Strategy[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStrategy(s)}
            className={`px-2 py-1 rounded border ${
              strategy === s
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-muted-foreground ml-3">Stratifisering:</span>
        <button
          type="button"
          onClick={() => setStratified(false)}
          className={`px-2 py-1 rounded border ${
            !stratified
              ? "border-brand bg-brand/10 text-brand"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Av (sekvensiell)
        </button>
        <button
          type="button"
          onClick={() => setStratified(true)}
          className={`px-2 py-1 rounded border ${
            stratified
              ? "border-brand bg-brand/10 text-brand"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          På
        </button>
        <span className="text-muted-foreground ml-3">Positiv-andel:</span>
        <input
          type="range"
          min={0.05}
          max={0.5}
          step={0.05}
          value={posFrac}
          onChange={(e) => setPosFrac(parseFloat(e.target.value))}
          className="w-28"
        />
        <span className="font-mono text-muted-foreground w-10">{(posFrac * 100).toFixed(0)} %</span>
      </div>

      {/* Datasett-grid: hver celle farges etter split, kant farges etter klasse */}
      <div className="text-xs text-muted-foreground mb-1">
        Datasett ({n} eksempler · {overallPos} positive · {n - overallPos} negative)
      </div>
      <svg viewBox={`0 0 ${gridW} ${gridH}`} className="w-full" style={{ maxHeight: 120 }}>
        {items.map((it) => {
          const idxInGrid = items.indexOf(it);
          const r = Math.floor(idxInGrid / cols);
          const c = idxInGrid % cols;
          const s = splitOf.get(it.i) ?? 0;
          return (
            <rect
              key={it.i}
              x={c * (cell + gap)}
              y={r * (cell + gap)}
              width={cell}
              height={cell}
              fill={SPLIT_COLORS[s]}
              fillOpacity={0.85}
              stroke={it.label === 1 ? "rgb(0 0 0)" : "none"}
              strokeOpacity={it.label === 1 ? 0.4 : 0}
              strokeWidth={1}
            />
          );
        })}
      </svg>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Farge = split · svart kant = positiv klasse (label 1)
      </div>

      {/* Stolpe per split med klassebalanse */}
      <div className="mt-4 space-y-2">
        {splits.map((arr, s) => {
          const st = stats[s];
          const posPct = st.total > 0 ? (st.pos / st.total) * 100 : 0;
          return (
            <div key={s}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium" style={{ color: SPLIT_COLORS[s] }}>
                  {labels[s]}
                </span>
                <span className="font-mono text-muted-foreground">
                  n = {st.total} · pos {st.pos} ({posPct.toFixed(1)} %) · neg {st.neg}
                </span>
              </div>
              <div className="h-5 rounded overflow-hidden border border-border flex">
                <div
                  className="h-full"
                  style={{
                    width: `${posPct}%`,
                    background: "rgb(244 63 94)",
                    opacity: 0.7,
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${100 - posPct}%`,
                    background: "rgb(59 130 246)",
                    opacity: 0.4,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong className="text-brand">Hva å se etter:</strong>{" "}
        Sett positiv-andel til 5–10 % og slå <em>stratifisering av</em>: nå sees at
        test-settet kan ende med 0 positive (rosa stolpe er borte). Slå{" "}
        <em>på</em> igjen og se at hver split holder samme andel som hele settet —
        det er hele poenget med <code>stratify=y</code> i sklearn. Bytt mellom 80/20
        (kun train/test) og 60/20/20: jo mer du gjør «kikking», jo mindre er igjen
        til faktisk å trene.
      </div>
    </div>
  );
}
