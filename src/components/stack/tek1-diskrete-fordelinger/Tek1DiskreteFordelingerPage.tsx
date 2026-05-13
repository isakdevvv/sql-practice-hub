import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {Lightbulb, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { StackPageShell } from "@/components/stack/StackPageShell";

function logFact(n: number): number {
  if (n <= 1) return 0;
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}
function logComb(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logFact(n) - logFact(k) - logFact(n - k);
}
function binomPmf(n: number, p: number, k: number): number {
  return Math.exp(logComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}
function hyperPmf(N: number, K: number, n: number, k: number): number {
  if (k < 0 || k > Math.min(K, n)) return 0;
  if (n - k > N - K) return 0;
  return Math.exp(logComb(K, k) + logComb(N - K, n - k) - logComb(N, n));
}
function poisPmf(lam: number, k: number): number {
  return Math.exp(-lam + k * Math.log(lam) - logFact(k));
}

type Dist = "binom" | "hyper" | "poisson";

function PmfExplorer() {
  const [dist, setDist] = useState<Dist>("binom");
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.3);
  const [N, setBigN] = useState(20);
  const [K, setK] = useState(5);
  const [draw, setDraw] = useState(5);
  const [lam, setLam] = useState(3);

  const data = useMemo(() => {
    const out: { k: number; pmf: number }[] = [];
    if (dist === "binom") {
      for (let k = 0; k <= n; k++) out.push({ k, pmf: binomPmf(n, p, k) });
    } else if (dist === "hyper") {
      const maxk = Math.min(K, draw);
      for (let k = 0; k <= maxk; k++)
        out.push({ k, pmf: hyperPmf(N, K, draw, k) });
    } else {
      const maxk = Math.max(15, Math.ceil(lam * 3));
      for (let k = 0; k <= maxk; k++) out.push({ k, pmf: poisPmf(lam, k) });
    }
    return out;
  }, [dist, n, p, N, K, draw, lam]);

  const mean = useMemo(() => {
    if (dist === "binom") return n * p;
    if (dist === "hyper") return (draw * K) / N;
    return lam;
  }, [dist, n, p, N, K, draw, lam]);

  const variance = useMemo(() => {
    if (dist === "binom") return n * p * (1 - p);
    if (dist === "hyper") return draw * (K / N) * ((N - K) / N) * ((N - draw) / (N - 1));
    return lam;
  }, [dist, n, p, N, K, draw, lam]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          PMF-utforsker
        </div>
        <div className="flex gap-1.5">
          {(["binom", "hyper", "poisson"] as Dist[]).map((d) => (
            <button
              key={d}
              onClick={() => setDist(d)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (dist === d
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {d === "binom" ? "Binomisk" : d === "hyper" ? "Hypergeometrisk" : "Poisson"}
            </button>
          ))}
        </div>
      </div>

      {dist === "binom" && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              n = {n} (antall forsøk)
            </span>
            <input
              type="range"
              min={1}
              max={40}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              p = {p.toFixed(2)} (suksess-sannsynlighet)
            </span>
            <input
              type="range"
              min={0.01}
              max={0.99}
              step={0.01}
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}

      {dist === "hyper" && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              N = {N} (totalt)
            </span>
            <input
              type="range"
              min={2}
              max={60}
              value={N}
              onChange={(e) => setBigN(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              K = {K} (suksesser)
            </span>
            <input
              type="range"
              min={0}
              max={N}
              value={K}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              n = {draw} (trekkes)
            </span>
            <input
              type="range"
              min={1}
              max={Math.min(N, 20)}
              value={draw}
              onChange={(e) => setDraw(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}

      {dist === "poisson" && (
        <div className="text-sm">
          <label>
            <span className="block text-xs text-muted-foreground mb-1">
              λ = {lam.toFixed(2)} (forventet antall)
            </span>
            <input
              type="range"
              min={0.1}
              max={20}
              step={0.1}
              value={lam}
              onChange={(e) => setLam(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}

      <div className="h-56 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="k" />
            <YAxis tickFormatter={(v) => v.toFixed(2)} />
            <Tooltip formatter={(v: number) => v.toFixed(4)} />
            <Bar dataKey="pmf" fill="var(--brand, #4f46e5)" />
            <ReferenceLine x={Math.round(mean)} stroke="hsl(var(--success, 142 76% 36%))" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-muted-foreground font-mono space-y-0.5">
        <div>E[X] = μ = {mean.toFixed(3)}</div>
        <div>Var(X) = σ² = {variance.toFixed(3)}</div>
        <div>σ = {Math.sqrt(variance).toFixed(3)}</div>
      </div>
    </div>
  );
}

export function Tek1DiskreteFordelingerPage() {
  return (
    <StackPageShell title="Modul 3a — Diskrete fordelinger" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 3a · Eksamen-tyngdepunkt
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Diskrete fordelinger — binomisk, hypergeometrisk, Poisson
          </h1>
          <p className="mt-3 text-muted-foreground">
            En diskret stokastisk variabel X tar heltallsverdier. Vi beskriver
            den med PMF (Probability Mass Function): p(x) = P(X = x). Tre
            fordelinger dekker mesteparten av eksamen-oppgavene — bytt mellom
            dem og se hvordan PMF endrer seg.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              Den grønne stiplede linjen viser E[X]. Endre parametrene — se hvor
              tyngdepunktet flytter seg.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. PMF — live utforskning</h2>
          <PmfExplorer />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Binomisk fordeling</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Antall suksesser i n uavhengige forsøk</strong> med samme
            suksess-sannsynlighet p. Kjenneord: «n uavhengige forsøk», «med
            tilbakelegging».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X ~ Bin(n, p)

PMF:  P(X = k) = C(n, k) · pᵏ · (1-p)ⁿ⁻ᵏ      for k = 0, 1, ..., n

E[X]    = np
Var(X)  = np(1-p)
σ       = √(np(1-p))

Eks: kvalitetskontroll
  10 % defekte. Trekk 20 enheter MED tilbakelegging.
  X = antall defekte.  X ~ Bin(20, 0.10)

  P(X = 2) = C(20,2)·0.10²·0.90¹⁸ = 190·0.01·0.1501 ≈ 0.285
  P(X ≤ 2) = P(0) + P(1) + P(2) ≈ 0.677
  E[X] = 2,  Var(X) = 1.8`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Hypergeometrisk fordeling</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Samme situasjon, men <strong>uten tilbakelegging</strong>. Trekkene
            er ikke uavhengige.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X ~ Hyper(N, K, n)
  N = totalt antall
  K = antall suksesser i populasjonen
  n = antall trukket

PMF:  P(X = k) = C(K, k) · C(N-K, n-k) / C(N, n)

E[X]   = n · K/N
Var(X) = n · K/N · (N-K)/N · (N-n)/(N-1)
                                ↑ "endelig-populasjons-korreksjon"

Eks: kvalitetskontroll
  20 enheter, 2 defekte. Trekk 5 UTEN tilbakelegging.
  X = antall defekte.  X ~ Hyper(20, 2, 5)

  P(X = 0) = C(2,0)·C(18,5) / C(20,5) = 8568/15504 ≈ 0.553
  P(X ≥ 1) = 1 - 0.553 ≈ 0.447
  E[X] = 5·2/20 = 0.5

Tommelfingerregel: hvis n/N < 0.1, kan binomisk brukes som tilnærming.`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Poisson-fordelingen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Antall hendelser i et fast intervall</strong> når
            hendelsene skjer uavhengig og med konstant rate λ. Kjenneord:
            «antall feil pr. time», «antall ankomster pr. min».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`X ~ Poi(λ)

PMF:  P(X = k) = e⁻ᵅ · λᵏ / k!      for k = 0, 1, 2, ...

E[X]   = λ
Var(X) = λ                  ← mean = varians (kjennetegn for Poisson!)
σ      = √λ

Eks: kundeankomster
  Et bankhjelpevindu får i snitt 5 kunder pr. time.
  X = antall kunder i en time.  X ~ Poi(5)

  P(X = 3) = e⁻⁵·5³/3! = 0.00674·125/6 ≈ 0.140
  P(X ≥ 8) = 1 - P(X ≤ 7) ≈ 0.133

Skala-egenskap: hvis X ~ Poi(λ) pr. time,
                  så Y = antall i T timer ~ Poi(λT).

Poisson-tilnærming til binomisk:
  Hvis n er stor og p er liten, og np ≈ λ er moderat,
  så Bin(n,p) ≈ Poi(λ=np).
  Brukbar når n ≥ 50 og np ≤ 5.`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Hvilken velge?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Situasjon</th>
                  <th className="text-left font-semibold px-4 py-2">Fordeling</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Faste n forsøk, hvert med samme p</td>
                  <td className="px-4 py-3 text-muted-foreground">Binomisk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Trekk uten tilbakelegging fra endelig populasjon</td>
                  <td className="px-4 py-3 text-muted-foreground">Hypergeometrisk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">Antall hendelser i fast tid/areal, konstant rate</td>
                  <td className="px-4 py-3 text-muted-foreground">Poisson</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3">«Hvor mange forsøk før første suksess?»</td>
                  <td className="px-4 py-3 text-muted-foreground">Geometrisk (P(X=k)=(1-p)^(k-1)·p)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Tilbakelegging-test.</strong> «Trekk 5 av 20» — er det
              med eller uten tilbakelegging? Default i kontekst av
              kvalitetskontroll er UTEN. Sjekk om n/N {"<"} 0.1 — i så fall kan
              binomisk brukes som tilnærming.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>n-1 vs n i hypergeometrisk varians.</strong>{" "}
              Endelig-populasjons-korreksjon (N-n)/(N-1) blir glemt. Når n=1
              eller N=∞ reduserer formelen seg til binomisk varians.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Poisson-skala.</strong> Hvis raten er pr. time og du
              spørres om 30 min, må λ halveres. Vanlig fallgruve.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>P(X ≥ 1) vs P(X = 1).</strong> Bruk komplement:
              P(X ≥ 1) = 1 − P(X = 0). Mange skriver bare P(X = 1) — feil.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-kontinuerlige-fordelinger" }}
                className="text-brand hover:underline"
              >
                Modul 3b — Kontinuerlige fordelinger
              </Link>
              : normal, eksponential, t, kji².
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighetsfordelinger».
            </li>
          </ul>
        </div>
              <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "tek-1501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til TEK-1501-hub
          </Link>
        </div>
</div>
    </StackPageShell>
  );
}
