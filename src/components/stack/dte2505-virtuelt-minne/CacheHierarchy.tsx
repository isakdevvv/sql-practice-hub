import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Cache-hierarki — fysisk visualisering av tilgangstid per nivå.
 *
 * Brukeren ser fem horisontale "bokser":
 *   CPU register → L1 → L2 → L3 → RAM → SSD
 *
 * Hver med typisk størrelse + tilgangstid. Når brukeren "leser en
 * adresse" animerer vi pilen som hopper nedover nivåene til den
 * treffer (sannsynlighet bestemmes av hit-rate-slideren). Toggle
 * for sequential vs random viser hvorfor sequential trekker mer
 * fordel av cache-lines.
 *
 * Recharts: gjennomsnittlig tilgangstid som funksjon av L1-hit-rate.
 */

type Level = {
  key: string;
  name: string;
  size: string;
  // Latency in nanoseconds (for plot/math). SSD shown as μs.
  latencyNs: number;
  display: string;
  color: string;
};

const LEVELS: Level[] = [
  { key: "reg", name: "CPU-register", size: "~1 KB", latencyNs: 0.3, display: "~0.3 ns", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" },
  { key: "l1", name: "L1-cache", size: "32 KB", latencyNs: 1, display: "~1 ns", color: "bg-sky-500/20 border-sky-500/40 text-sky-500" },
  { key: "l2", name: "L2-cache", size: "256 KB", latencyNs: 3, display: "~3 ns", color: "bg-indigo-500/20 border-indigo-500/40 text-indigo-500" },
  { key: "l3", name: "L3-cache", size: "8 MB", latencyNs: 10, display: "~10 ns", color: "bg-violet-500/20 border-violet-500/40 text-violet-500" },
  { key: "ram", name: "Hoved-RAM", size: "16 GB", latencyNs: 100, display: "~100 ns", color: "bg-amber-500/20 border-amber-500/40 text-amber-500" },
  { key: "ssd", name: "SSD / disk", size: "1 TB", latencyNs: 100_000, display: "~100 μs", color: "bg-rose-500/20 border-rose-500/40 text-rose-500" },
];

// LCG for deterministic but seedable hit/miss draws
function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pickLevel(rng: () => number, hitRate: number, sequential: boolean): number {
  // hitRate is L1-hit. Lower levels cascade with a similar but lower hit-rate.
  // Sequential access: very high spatial locality → cache lines amplify hits.
  const r = rng();
  const l1 = sequential ? Math.min(0.99, hitRate + 0.06) : hitRate;
  if (r < l1) return 1; // L1
  const l2 = sequential ? 0.92 : 0.75;
  if (r < l1 + (1 - l1) * l2) return 2; // L2
  const l3 = sequential ? 0.85 : 0.65;
  if (r < l1 + (1 - l1) * l2 + (1 - l1) * (1 - l2) * l3) return 3; // L3
  const ram = sequential ? 0.98 : 0.92;
  if (r < l1 + (1 - l1) * l2 + (1 - l1) * (1 - l2) * l3 + (1 - l1) * (1 - l2) * (1 - l3) * ram) return 4; // RAM
  return 5; // SSD
}

function avgAccessTime(hitRate: number, sequential: boolean): number {
  // Recursive miss-rate model
  const l1 = sequential ? Math.min(0.99, hitRate + 0.06) : hitRate;
  const l2 = sequential ? 0.92 : 0.75;
  const l3 = sequential ? 0.85 : 0.65;
  const ram = sequential ? 0.98 : 0.92;
  const pL1 = l1;
  const pL2 = (1 - l1) * l2;
  const pL3 = (1 - l1) * (1 - l2) * l3;
  const pRam = (1 - l1) * (1 - l2) * (1 - l3) * ram;
  const pSsd = (1 - l1) * (1 - l2) * (1 - l3) * (1 - ram);
  return (
    pL1 * LEVELS[1].latencyNs +
    pL2 * LEVELS[2].latencyNs +
    pL3 * LEVELS[3].latencyNs +
    pRam * LEVELS[4].latencyNs +
    pSsd * LEVELS[5].latencyNs
  );
}

export function CacheHierarchy() {
  const [hitRate, setHitRate] = useState(0.9);
  const [sequential, setSequential] = useState(true);
  const [address, setAddress] = useState("0x1A2B3C");
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [hopIdx, setHopIdx] = useState(0); // for stepped animation
  const [stats, setStats] = useState({ accesses: 0, totalNs: 0, lastNs: 0 });
  const rngRef = useRef(makeRng(42));

  function fireLookup() {
    const target = pickLevel(rngRef.current, hitRate, sequential);
    setActiveLevel(target);
    setHopIdx(1); // start hopping from L1
    // Update stats once known target picked
    const lat = LEVELS[target].latencyNs;
    setStats((s) => ({
      accesses: s.accesses + 1,
      totalNs: s.totalNs + lat,
      lastNs: lat,
    }));
  }

  // Animate hops L1 -> L2 -> ... until target reached
  useEffect(() => {
    if (activeLevel === null) return;
    if (hopIdx > activeLevel) return;
    const timer = window.setTimeout(() => {
      setHopIdx((h) => h + 1);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [hopIdx, activeLevel]);

  // Curve data: avg access time vs L1 hit rate
  const curveData = useMemo(() => {
    const xs = Array.from({ length: 21 }, (_, i) => i * 0.05);
    return xs.map((h) => ({
      hit: Math.round(h * 100),
      seq: Math.log10(avgAccessTime(h, true) + 1),
      rand: Math.log10(avgAccessTime(h, false) + 1),
    }));
  }, []);
  const avgNow = avgAccessTime(hitRate, sequential);

  function reset() {
    setActiveLevel(null);
    setHopIdx(0);
    setStats({ accesses: 0, totalNs: 0, lastNs: 0 });
    rngRef.current = makeRng(42);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Controls */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <label className="block text-xs text-muted-foreground sm:col-span-2">
          <div className="flex justify-between mb-1">
            <span>L1 hit-rate: {(hitRate * 100).toFixed(0)} %</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={0.99}
            step={0.01}
            value={hitRate}
            onChange={(e) => setHitRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            className={`text-xs rounded-md border px-3 py-1.5 ${sequential ? "border-brand bg-brand/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
            onClick={() => setSequential(true)}
          >
            Sekvensiell
          </button>
          <button
            type="button"
            className={`text-xs rounded-md border px-3 py-1.5 ${!sequential ? "border-brand bg-brand/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
            onClick={() => setSequential(false)}
          >
            Tilfeldig
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          {/* Address input + fire */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 font-mono text-xs rounded-md border border-border bg-background px-2 py-1.5"
              placeholder="0x..."
            />
            <button
              type="button"
              onClick={fireLookup}
              className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20"
            >
              Slå opp adresse
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs rounded-md border border-border bg-background px-2 py-1.5 hover:bg-muted"
            >
              Reset
            </button>
          </div>

          {/* Stacked level boxes */}
          <div className="space-y-1.5">
            {LEVELS.map((lv, idx) => {
              const isHit = activeLevel === idx;
              const isProbing = hopIdx >= 1 && hopIdx <= idx && (activeLevel === null || idx <= activeLevel);
              const animClass =
                activeLevel === null
                  ? ""
                  : isHit && hopIdx > idx
                    ? "ring-2 ring-emerald-500"
                    : isProbing && hopIdx === idx
                      ? "ring-2 ring-amber-500 animate-pulse"
                      : "opacity-70";
              return (
                <div
                  key={lv.key}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition ${lv.color} ${animClass}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] uppercase shrink-0 opacity-80">L{idx}</span>
                    <span className="font-semibold text-sm truncate">{lv.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
                    <span className="opacity-80">{lv.size}</span>
                    <span className="font-bold">{lv.display}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {activeLevel !== null && hopIdx > activeLevel && (
            <div className="mt-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs">
              Treff på <strong>{LEVELS[activeLevel].name}</strong> — gikk gjennom{" "}
              {activeLevel} miss{activeLevel === 1 ? "" : "er"} for å komme dit.
              Tid: <span className="font-mono">{LEVELS[activeLevel].display}</span>
            </div>
          )}

          {/* Stats */}
          {stats.accesses > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-md border border-border p-2">
                <div className="text-muted-foreground">Aksesser</div>
                <div className="font-mono text-foreground">{stats.accesses}</div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-muted-foreground">Snitt-tid</div>
                <div className="font-mono text-foreground">
                  {(stats.totalNs / stats.accesses).toFixed(1)} ns
                </div>
              </div>
              <div className="rounded-md border border-border p-2">
                <div className="text-muted-foreground">Sist</div>
                <div className="font-mono text-foreground">
                  {stats.lastNs < 1000 ? `${stats.lastNs.toFixed(1)} ns` : `${(stats.lastNs / 1000).toFixed(1)} μs`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recharts: avg access time */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            Gjennomsnittlig tilgangstid (log₁₀ ns) som funksjon av L1-hit-rate
          </div>
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.1} strokeDasharray="3 3" />
                <XAxis
                  dataKey="hit"
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  strokeOpacity={0.5}
                  label={{ value: "L1 hit %", position: "insideBottom", offset: -5, fontSize: 10 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  strokeOpacity={0.5}
                  label={{ value: "log ns", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, background: "var(--card, #fff)", border: "1px solid var(--border, #ccc)", borderRadius: 6 }}
                  formatter={(v: number, n: string) => [
                    `${(10 ** v).toFixed(1)} ns`,
                    n === "seq" ? "Sekvensiell" : "Tilfeldig",
                  ]}
                  labelFormatter={(l) => `Hit-rate ${l}%`}
                />
                <Line type="monotone" dataKey="seq" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="rand" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs mt-1">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-emerald-500" /> Sekvensiell</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 bg-rose-500" /> Tilfeldig</span>
          </div>
          <div className="mt-3 rounded-md border border-border bg-background p-3 text-xs">
            <div className="font-semibold text-foreground mb-1">Din konfigurasjon</div>
            <div className="text-muted-foreground">
              Snitt-tilgangstid:{" "}
              <span className="font-mono text-foreground">
                {avgNow < 1000 ? `${avgNow.toFixed(1)} ns` : `${(avgNow / 1000).toFixed(2)} μs`}
              </span>
            </div>
            <div className="text-muted-foreground">
              vs. ren RAM:{" "}
              <span className="font-mono text-foreground">{(100).toFixed(0)} ns</span>{" "}
              ({((100 / Math.max(0.1, avgNow))).toFixed(1)}× speedup)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-emerald-500 mb-0.5">Hvorfor er sekvensiell raskere?</div>
          <div className="text-muted-foreground">
            CPU-en henter ikke ett byte, men en hel <strong>cache-linje</strong> (vanligvis 64 byte).
            Sekvensiell tilgang treffer de neste 63 bytene gratis fra L1.
          </div>
        </div>
        <div className="rounded-md border border-border p-2.5">
          <div className="font-semibold text-rose-500 mb-0.5">Latens-kløften</div>
          <div className="text-muted-foreground">
            L1 → RAM er 100× tregere. RAM → SSD er ytterligere 1000×. Cache-trefferate{" "}
            avgjør om koden din føles rask eller treg, mer enn algoritmevalg ofte gjør.
          </div>
        </div>
      </div>
    </div>
  );
}
