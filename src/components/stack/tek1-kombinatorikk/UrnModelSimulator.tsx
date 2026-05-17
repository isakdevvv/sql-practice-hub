import { useMemo, useState } from "react";

// UrnModelSimulator
// Urne med W hvite og B sorte kuler. Trekk k stykker.
// Mode: med tilbakelegging (binomial) vs uten tilbakelegging (hypergeometrisk).
// Vis sannsynligheten P(X = r hvite) for r = 0..k som bar chart, og lar
// brukeren sammenligne de to fordelingene side ved side når parametrene er like.

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k > n - k) k = n - k;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

function binomialPmf(k: number, r: number, p: number): number {
  // P(X = r) = C(k,r) p^r (1-p)^(k-r)
  return comb(k, r) * Math.pow(p, r) * Math.pow(1 - p, k - r);
}

function hyperPmf(N: number, K: number, k: number, r: number): number {
  // P(X = r) = C(K,r)·C(N-K, k-r) / C(N,k)
  if (r < 0 || r > k || r > K || k - r > N - K) return 0;
  return (comb(K, r) * comb(N - K, k - r)) / comb(N, k);
}

type Mode = "without" | "with" | "compare";

export function UrnModelSimulator() {
  const [W, setW] = useState(6); // hvite
  const [B, setB] = useState(4); // sorte
  const [k, setK] = useState(3);
  const [mode, setMode] = useState<Mode>("without");
  const [drawn, setDrawn] = useState<number[]>([]); // antall hvite per trekning

  const N = W + B;
  const p = N > 0 ? W / N : 0;

  // PMFer for r = 0..k
  const rs = useMemo(() => Array.from({ length: k + 1 }, (_, i) => i), [k]);
  const pmfBinom = useMemo(() => rs.map((r) => binomialPmf(k, r, p)), [rs, k, p]);
  const pmfHyper = useMemo(() => rs.map((r) => hyperPmf(N, W, k, r)), [rs, N, W, k]);

  // Telle-måter (uten tilbakelegging): for hver r, antall = C(W,r)·C(B,k-r).
  const counts = useMemo(
    () =>
      rs.map((r) => {
        if (r > W || k - r > B) return 0;
        return comb(W, r) * comb(B, k - r);
      }),
    [rs, W, B, k],
  );
  const totalCount = comb(N, k);

  function drawOnce(withRepl: boolean) {
    let hvit = 0;
    if (withRepl) {
      for (let i = 0; i < k; i++) {
        if (Math.random() < p) hvit++;
      }
    } else {
      // bygg ball-array, shuffle, ta de første k
      const balls: number[] = [];
      for (let i = 0; i < W; i++) balls.push(1);
      for (let i = 0; i < B; i++) balls.push(0);
      for (let i = balls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balls[i], balls[j]] = [balls[j], balls[i]];
      }
      hvit = balls.slice(0, k).reduce((s, b) => s + b, 0);
    }
    return hvit;
  }

  function trekkN(times: number) {
    const useRepl = mode === "with";
    const out: number[] = [];
    for (let i = 0; i < times; i++) out.push(drawOnce(useRepl));
    setDrawn((d) => [...d, ...out].slice(-500));
  }
  function reset() {
    setDrawn([]);
  }

  const obsCount: Record<number, number> = {};
  for (const r of drawn) obsCount[r] = (obsCount[r] ?? 0) + 1;
  const total = drawn.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Urnemodell — binomial vs hypergeometrisk
        </div>
        <div className="flex gap-1 text-xs">
          {(["without", "with", "compare"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setDrawn([]);
              }}
              className={`rounded-md px-2.5 py-1 font-medium border ${mode === m ? "bg-brand text-brand-foreground border-brand" : "border-border bg-background hover:border-brand/40"}`}
            >
              {m === "without" && "Uten tilbakelegging"}
              {m === "with" && "Med tilbakelegging"}
              {m === "compare" && "Sammenlign"}
            </button>
          ))}
        </div>
      </div>

      {/* Parametere */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            W = {W} (hvite)
          </span>
          <input
            type="range"
            min={1}
            max={15}
            value={W}
            onChange={(e) => {
              setW(Number(e.target.value));
              setDrawn([]);
            }}
            className="w-full"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            B = {B} (sorte)
          </span>
          <input
            type="range"
            min={1}
            max={15}
            value={B}
            onChange={(e) => {
              setB(Number(e.target.value));
              setDrawn([]);
            }}
            className="w-full"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            k = {k} (trekkes)
          </span>
          <input
            type="range"
            min={1}
            max={Math.min(N, 10)}
            value={k}
            onChange={(e) => {
              setK(Number(e.target.value));
              setDrawn([]);
            }}
            className="w-full"
          />
        </label>
      </div>

      {/* Visualisert urne */}
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-xs text-muted-foreground mb-2">
          Urne: N = W + B = {W} + {B} = <strong>{N}</strong>, p = W/N ={" "}
          {p.toFixed(3)}
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: W }).map((_, i) => (
            <span
              key={`w-${i}`}
              className="inline-block h-5 w-5 rounded-full border border-zinc-400 bg-white shadow-sm"
              title="hvit"
            />
          ))}
          {Array.from({ length: B }).map((_, i) => (
            <span
              key={`b-${i}`}
              className="inline-block h-5 w-5 rounded-full bg-zinc-800 dark:bg-zinc-200 shadow-sm"
              title="sort"
            />
          ))}
        </div>
      </div>

      {/* Telle-måter (gjelder uten tilbakelegging) */}
      {(mode === "without" || mode === "compare") && (
        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
          <div className="text-muted-foreground">
            Antall måter å trekke <strong>r hvite</strong> av {k} (uten
            tilbakelegging) = C(W,r) · C(B,k−r). Totalt: C({N},{k}) ={" "}
            {totalCount.toLocaleString("nb-NO")}.
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 font-mono">
            {rs.map((r) => (
              <div key={r} className="contents">
                <div className="text-muted-foreground">
                  r={r}: C({W},{r})·C({B},{k - r}) = {comb(W, r)}·{comb(B, k - r)} ={" "}
                  <span className="text-foreground">{counts[r]}</span>
                </div>
                <div className="text-right text-muted-foreground">
                  {totalCount > 0
                    ? ((counts[r] / totalCount) * 100).toFixed(2)
                    : "0"}
                  %
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart av PMF */}
      <div className="rounded-lg border border-border bg-background p-3 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">
          P(X = r hvite av {k}):
        </div>
        <div className="space-y-1.5">
          {rs.map((r) => {
            const pH = pmfHyper[r];
            const pBn = pmfBinom[r];
            const obs = total > 0 ? (obsCount[r] ?? 0) / total : 0;
            const showH = mode === "without" || mode === "compare";
            const showB = mode === "with" || mode === "compare";
            return (
              <div key={r} className="text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span>r = {r}</span>
                  <span className="text-muted-foreground space-x-3">
                    {showH && (
                      <span>
                        hyper{" "}
                        <span className="text-brand">{(pH * 100).toFixed(2)}%</span>
                      </span>
                    )}
                    {showB && (
                      <span>
                        binom{" "}
                        <span className="text-violet-500">{(pBn * 100).toFixed(2)}%</span>
                      </span>
                    )}
                    {total > 0 && (
                      <span>
                        obs <span className="text-foreground">{(obs * 100).toFixed(1)}%</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex gap-1 h-3">
                  {showH && (
                    <div
                      className="bg-brand rounded-sm"
                      style={{ width: `${Math.max(1, pH * 100)}%` }}
                    />
                  )}
                  {showB && (
                    <div
                      className="bg-violet-500/80 rounded-sm"
                      style={{ width: `${Math.max(1, pBn * 100)}%` }}
                    />
                  )}
                  {total > 0 && (
                    <div
                      className="bg-foreground/30 rounded-sm"
                      style={{ width: `${Math.max(1, obs * 100)}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trekk-knapper (kun når én modus, ikke "compare") */}
      {mode !== "compare" && (
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => trekkN(1)}
            className="rounded-lg bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
          >
            Trekk {k}
          </button>
          <button
            onClick={() => trekkN(100)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
          >
            Trekk 100 ganger
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
          >
            Nullstill ({total})
          </button>
          <span className="text-xs text-muted-foreground ml-auto">
            {mode === "without"
              ? "Trekker uten tilbakelegging (hypergeometrisk)."
              : "Trekker med tilbakelegging — kulen legges tilbake (binomial)."}
          </span>
        </div>
      )}

      {mode === "compare" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <strong>Tommelfingerregel:</strong> hypergeometrisk og binomial er
          tilnærmet like når k er liten i forhold til N (k/N {"<"} 0.1). Her er
          k/N = {k}/{N} = {(k / N).toFixed(2)}.{" "}
          {k / N < 0.1
            ? "Forskjellen er liten."
            : "Forskjellen er merkbar — uten tilbakelegging har lavere varians."}
        </div>
      )}
    </div>
  );
}
