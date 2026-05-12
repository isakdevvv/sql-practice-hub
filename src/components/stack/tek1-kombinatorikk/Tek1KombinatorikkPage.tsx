import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

function fact(n: number): number {
  if (n < 0 || !Number.isFinite(n)) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function perm(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k > n - k) k = n - k;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

function KombinatorikkCalculator() {
  const [n, setN] = useState(8);
  const [k, setK] = useState(3);
  const results = useMemo(
    () => ({
      fact: fact(n),
      perm: perm(n, k),
      comb: comb(n, k),
      permRep: Math.pow(n, k),
      combRep: comb(n + k - 1, k),
    }),
    [n, k],
  );
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Kombinatorikk-kalkulator
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground mb-1">
            n = {n} (totalt antall)
          </span>
          <input
            type="range"
            min={1}
            max={15}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              setN(v);
              if (k > v) setK(v);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground mb-1">
            k = {k} (antall valg)
          </span>
          <input
            type="range"
            min={0}
            max={n}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <div className="space-y-1.5 text-sm font-mono">
        <div className="flex justify-between">
          <span className="text-muted-foreground">n! =</span>
          <span className="font-semibold">{results.fact.toLocaleString("nb-NO")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            P(n,k) = n!/(n−k)! (uten tilbakelegging, rekkefølge teller) =
          </span>
          <span className="font-semibold">{results.perm.toLocaleString("nb-NO")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            C(n,k) = n!/(k!(n−k)!) (uten tilbakelegging, uten rekkefølge) =
          </span>
          <span className="font-semibold text-brand">
            {results.comb.toLocaleString("nb-NO")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            n^k (med tilbakelegging, rekkefølge teller) =
          </span>
          <span className="font-semibold">{results.permRep.toLocaleString("nb-NO")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            C(n+k−1,k) (med tilbakelegging, uten rekkefølge) =
          </span>
          <span className="font-semibold">{results.combRep.toLocaleString("nb-NO")}</span>
        </div>
      </div>
    </div>
  );
}

function TrekkSimulator() {
  const [N, setN] = useState(20);
  const [K, setK] = useState(5);
  const [n, setn] = useState(3);
  const [drawn, setDrawn] = useState<{ defekt: number }[]>([]);

  function trekk() {
    const balls: number[] = [];
    for (let i = 0; i < K; i++) balls.push(1);
    for (let i = 0; i < N - K; i++) balls.push(0);
    // Fisher-Yates
    for (let i = balls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [balls[i], balls[j]] = [balls[j], balls[i]];
    }
    const drawn1 = balls.slice(0, n);
    setDrawn((d) =>
      [...d, { defekt: drawn1.reduce((s, b) => s + b, 0) }].slice(-50),
    );
  }
  function reset() {
    setDrawn([]);
  }

  const pTheoretisk = useMemo(() => {
    // hypergeometric: P(X = x) = C(K,x)*C(N-K,n-x)/C(N,n)
    const out: Record<number, number> = {};
    for (let x = 0; x <= Math.min(K, n); x++) {
      out[x] = (comb(K, x) * comb(N - K, n - x)) / comb(N, n);
    }
    return out;
  }, [N, K, n]);

  const obs: Record<number, number> = {};
  for (const d of drawn) obs[d.defekt] = (obs[d.defekt] ?? 0) + 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Trekksimulator (uten tilbakelegging — hypergeometrisk)
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            N = {N} (totalt)
          </span>
          <input
            type="range"
            min={5}
            max={50}
            value={N}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            K = {K} (defekte)
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
            n = {n} (trekkes)
          </span>
          <input
            type="range"
            min={1}
            max={Math.min(N, 15)}
            value={n}
            onChange={(e) => setn(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={trekk}
          className="rounded-lg bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
        >
          Trekk {n}
        </button>
        <button
          onClick={() => {
            for (let i = 0; i < 100; i++) trekk();
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
        >
          Trekk 100 ganger
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
        >
          Nullstill ({drawn.length})
        </button>
      </div>
      <div className="text-xs font-mono space-y-1">
        <div className="text-muted-foreground">
          Empirisk vs. teoretisk fordeling av antall defekte:
        </div>
        {Array.from({ length: Math.min(K, n) + 1 }).map((_, x) => {
          const obsP = drawn.length > 0 ? (obs[x] ?? 0) / drawn.length : 0;
          const teorP = pTheoretisk[x] ?? 0;
          return (
            <div key={x} className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground">X={x}:</span>
              <span className="w-20 text-foreground">
                obs {(obsP * 100).toFixed(1)}%
              </span>
              <span className="w-20 text-brand">
                teor {(teorP * 100).toFixed(1)}%
              </span>
              <div className="flex-1 flex gap-1">
                <div
                  className="h-2 bg-foreground/40"
                  style={{ width: `${obsP * 100}%` }}
                />
                <div
                  className="h-2 bg-brand"
                  style={{ width: `${teorP * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Tek1KombinatorikkPage() {
  return (
    <StackPageShell title="Modul 2b — Kombinatorikk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 2b
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kombinatorikk — telleregler som skalerer
          </h1>
          <p className="mt-3 text-muted-foreground">
            For å beregne sannsynligheter med likestilte utfall trenger vi å
            telle. Tre formler dekker det meste: multiplikasjonsprinsippet,
            permutasjon (n!/(n−k)!) og kombinasjon (C(n,k)). Bonus: trekninger
            med eller uten tilbakelegging — som styrer hvilken fordeling
            (binomisk vs. hypergeometrisk) vi bruker i Modul 3.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              Endre n/k under for å se hvordan tallene eksploderer. Permutasjon
              vokser raskest — derfor er enumerering ofte upraktisk og vi må
              bruke formelen.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Multiplikasjonsprinsippet</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvis du har k valg etter hverandre, der valg i kan tas på nᵢ måter,
            så er antall sekvenser n₁·n₂·…·nₖ. Brukes som byggekloss for alt
            annet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eks 1:  3 forretter, 4 hovedretter, 2 desserter → 3·4·2 = 24 menyer
Eks 2:  Passord på 6 tegn fra 26 bokstaver → 26⁶ ≈ 309 millioner
Eks 3:  Bilskilt: 2 bokstaver + 5 tall → 26²·10⁵ = 67.6 millioner`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Permutasjon vs. kombinasjon</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Spør deg selv: <strong>spiller rekkefølgen rolle?</strong> Hvis ja
            → permutasjon. Hvis nei → kombinasjon.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Permutasjon (RANGERING — rekkefølge teller):
  P(n,k) = n·(n-1)·…·(n-k+1) = n! / (n-k)!

  Eks: 8 løpere, hvor mange topp-3-podier?
       P(8,3) = 8·7·6 = 336

Kombinasjon (UTVALG — rekkefølge teller IKKE):
  C(n,k) = n! / (k! · (n-k)!)

  Eks: 8 personer, velg ut 3 til en gruppe
       C(8,3) = 56

Forholdet:  C(n,k) = P(n,k) / k!
  (Hver kombinasjon kan ordnes på k! måter.)`}</pre>
          </div>
          <KombinatorikkCalculator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Med eller uten tilbakelegging
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Avgjørende for hvilken fordeling vi bruker i Modul 3.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Med tilbakelegging (uavhengige trekk):
  - Hvert trekk har samme P
  - Antall utfall: n^k  (rekkefølge teller)
                  C(n+k-1, k)  (rekkefølge teller IKKE — multiset)
  → Binomisk fordeling i Modul 3

Uten tilbakelegging (avhengige trekk):
  - P endrer seg fra trekk til trekk
  - Antall utfall: P(n,k) eller C(n,k) etter rekkefølge
  → Hypergeometrisk fordeling i Modul 3

Konkret: 20 enheter, 5 defekte. Trekk 3, P(alle defekte)?
  Uten tilbakelegging: (5/20)·(4/19)·(3/18) = 60/6840 ≈ 0.00877
  Med tilbakelegging:  (5/20)³ = 0.015625`}</pre>
          </div>
          <TrekkSimulator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Multinomial</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Generalisering av kombinasjon når vi deler n objekter inn i mer enn
            to grupper.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Multinomial-koeffisient:
  n! / (n₁! · n₂! · … · nₖ!)
  der n₁ + n₂ + … + nₖ = n

Eks: 10 personer skal deles i 3 grupper på 5, 3 og 2.
  10! / (5! · 3! · 2!) = 2520 måter

Spesialtilfelle: bokstaver i et ord (med duplikater).
  Antall ulike anagrammer av "STATISTIKK":
  10! / (2! · 2! · 2! · 1! · 1! · 1! · 1!) = 453 600
  (S×2, T×2, I×2, A, K×... — telle hver bokstav)`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Lotto-eksempel</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Norsk Lotto: kryss av 7 av 34. Trekkes 7 uten tilbakelegging.

Antall mulige trekninger = C(34,7) = 5 379 616
Antall vinnertrekninger  = 1

P(7 rette) = 1 / 5 379 616 ≈ 1.86 × 10⁻⁷

For 6 rette:
  Du må treffe 6 av dine 7 vinnertall: C(7,6) = 7
  Og bomme på 1 av 27 andre: C(27,1) = 27
  Gunstige = 7 · 27 = 189
  P(6 rette) = 189 / 5 379 616 ≈ 3.51 × 10⁻⁵`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Spiller rekkefølgen rolle?</strong> Tenk gjennom problemet
              før du velger formel. «Trekker 3 kort» — er det 1., 2., 3. trekk
              eller bare en hånd? Hånd = kombinasjon, sekvens = permutasjon.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Tilbakelegging.</strong> «Etter hverandre» antyder uten
              tilbakelegging. «Trekk en kule, noter farge, legg tilbake» er med
              tilbakelegging.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>n−k kontra k i C(n,k).</strong> Symmetri:
              C(n,k) = C(n, n−k). Velg det som gir minst regning.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              under «Sannsynlighet & kombinatorikk» — permutasjon/kombinasjon-fill.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-diskrete-fordelinger" }}
                className="text-brand hover:underline"
              >
                Modul 3a — Diskrete fordelinger
              </Link>
              : binomisk (med tilbakelegging) og hypergeometrisk (uten).
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
