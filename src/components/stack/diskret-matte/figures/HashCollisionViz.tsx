import { useMemo, useState } from "react";

type Strategy = "chain" | "linear";

const DEFAULT_KEYS = [
  "alice",
  "bob",
  "carol",
  "dave",
  "eve",
  "frank",
  "grace",
  "heidi",
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

type Bucket = {
  // For chaining: list of keys at this bucket
  chain: { key: string; rawHash: number }[];
  // For linear probing: single key (if any) and the original hash slot
  probed?: { key: string; rawHash: number; originalSlot: number; probes: number };
};

function computeBuckets(
  keys: string[],
  size: number,
  strat: Strategy,
): { buckets: Bucket[]; rejected: string[]; totalProbes: number; maxProbes: number } {
  const buckets: Bucket[] = Array.from({ length: size }, () => ({ chain: [] }));
  const rejected: string[] = [];
  let totalProbes = 0;
  let maxProbes = 0;

  for (const k of keys) {
    const h = hashStr(k);
    const slot = h % size;
    if (strat === "chain") {
      buckets[slot].chain.push({ key: k, rawHash: h });
      totalProbes += 1;
      maxProbes = Math.max(maxProbes, buckets[slot].chain.length);
    } else {
      let probes = 0;
      let i = slot;
      let placed = false;
      while (probes < size) {
        if (!buckets[i].probed) {
          buckets[i].probed = {
            key: k,
            rawHash: h,
            originalSlot: slot,
            probes: probes + 1,
          };
          placed = true;
          totalProbes += probes + 1;
          maxProbes = Math.max(maxProbes, probes + 1);
          break;
        }
        i = (i + 1) % size;
        probes++;
      }
      if (!placed) rejected.push(k);
    }
  }
  return { buckets, rejected, totalProbes, maxProbes };
}

export function HashCollisionViz() {
  const [size, setSize] = useState(7);
  const [strat, setStrat] = useState<Strategy>("chain");
  const [keys, setKeys] = useState<string[]>(DEFAULT_KEYS);
  const [newKey, setNewKey] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);

  const { buckets, rejected, maxProbes } = useMemo(
    () => computeBuckets(keys, size, strat),
    [keys, size, strat],
  );

  const addKey = () => {
    const k = newKey.trim();
    if (!k) return;
    if (keys.includes(k)) return;
    setKeys([...keys, k]);
    setNewKey("");
    setHighlight(k);
  };
  const removeKey = (k: string) => {
    setKeys(keys.filter((x) => x !== k));
    if (highlight === k) setHighlight(null);
  };

  const collisions = useMemo(() => {
    if (strat === "chain") {
      return buckets.reduce((acc, b) => acc + Math.max(0, b.chain.length - 1), 0);
    }
    return buckets.reduce(
      (acc, b) => acc + (b.probed ? b.probed.probes - 1 : 0),
      0,
    );
  }, [buckets, strat]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Hash-tabell — mod n indeksering
        </div>
        <div className="flex flex-wrap gap-1">
          {(["chain", "linear"] as Strategy[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStrat(s)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                strat === s
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {s === "chain" ? "Chaining" : "Linear probing"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-3 text-xs">
        <label className="flex items-center gap-1">
          <span className="text-muted-foreground">table_size</span>
          <input
            type="number"
            min={2}
            max={20}
            value={size}
            onChange={(e) =>
              setSize(Math.max(2, Math.min(20, parseInt(e.target.value, 10) || 7)))
            }
            className="w-16 bg-background border border-border rounded px-2 py-1 font-mono"
          />
        </label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="ny nøkkel"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addKey();
            }}
            className="bg-background border border-border rounded px-2 py-1 font-mono w-32"
          />
          <button
            type="button"
            onClick={addKey}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            + sett inn
          </button>
        </div>
        <button
          type="button"
          onClick={() => setKeys(DEFAULT_KEYS)}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => setKeys([])}
          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
        >
          Tøm
        </button>
      </div>

      {/* Key chips */}
      <div className="flex flex-wrap gap-1 mb-3">
        {keys.map((k) => {
          const h = hashStr(k);
          const slot = h % size;
          return (
            <button
              key={k}
              type="button"
              onClick={() => removeKey(k)}
              onMouseEnter={() => setHighlight(k)}
              onMouseLeave={() => setHighlight(null)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                highlight === k
                  ? "border-brand bg-brand/15"
                  : "border-border hover:bg-muted"
              }`}
              title="Klikk for å fjerne"
            >
              {k} <span className="text-muted-foreground">→ {h} % {size} = {slot}</span>
            </button>
          );
        })}
      </div>

      {/* Buckets */}
      <div className="rounded-xl border border-border bg-background p-3 overflow-x-auto">
        <div className="flex gap-2 min-w-fit">
          {buckets.map((b, i) => {
            const isChain = strat === "chain";
            const items = isChain
              ? b.chain
              : b.probed
                ? [b.probed]
                : [];
            const collided = isChain
              ? b.chain.length > 1
              : b.probed
                ? b.probed.probes > 1
                : false;
            return (
              <div
                key={i}
                className={`flex-1 min-w-[80px] rounded border-2 ${
                  collided ? "border-amber-500/60" : "border-border"
                }`}
              >
                <div className="text-[10px] text-center bg-muted/50 px-1 py-0.5 font-mono">
                  [{i}]
                </div>
                <div className="p-1 min-h-[60px] space-y-0.5">
                  {items.length === 0 && (
                    <div className="text-[10px] text-muted-foreground text-center italic">
                      tom
                    </div>
                  )}
                  {items.map((item, j) => {
                    const isProbed =
                      !isChain &&
                      "originalSlot" in item &&
                      item.originalSlot !== i;
                    const isHighlight =
                      highlight && "key" in item && item.key === highlight;
                    return (
                      <div
                        key={j}
                        className={`text-[10px] font-mono rounded px-1 py-0.5 ${
                          isHighlight
                            ? "bg-brand text-brand-foreground"
                            : isProbed
                              ? "bg-amber-500/20"
                              : "bg-muted"
                        }`}
                        title={
                          isProbed && "originalSlot" in item
                            ? `Original slot: ${item.originalSlot}, probes: ${item.probes}`
                            : undefined
                        }
                      >
                        {"key" in item ? item.key : ""}
                        {isProbed && "probes" in item && (
                          <span className="text-[9px] opacity-70">
                            {" "}
                            ↻{item.probes}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Kollisjoner</div>
          <div className="font-mono font-bold text-base">{collisions}</div>
        </div>
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] uppercase text-muted-foreground">
            {strat === "chain" ? "Max kjede-lengde" : "Max probes"}
          </div>
          <div className="font-mono font-bold text-base">{maxProbes}</div>
        </div>
        <div className="rounded border border-border bg-background p-2">
          <div className="text-[10px] uppercase text-muted-foreground">Load factor</div>
          <div className="font-mono font-bold text-base">
            {(keys.length / size).toFixed(2)}
          </div>
        </div>
      </div>

      {rejected.length > 0 && (
        <div className="mt-2 text-[11px] rounded px-2 py-1 bg-rose-500/15 text-rose-700 dark:text-rose-300">
          Tabellen er full — kunne ikke plassere: {rejected.join(", ")}
        </div>
      )}

      <div className="mt-2 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Lese-trikset:</strong> hash gir et veldig
        stort tall; <code>% n</code> brettet det inn til en gyldig indeks. Kollisjoner
        er uunngåelig (Schubladenprinsippet). Prøv et primtall som <code>table_size</code> —
        det fordeler resten mer jevnt enn et sammensatt tall.
      </div>
    </div>
  );
}
