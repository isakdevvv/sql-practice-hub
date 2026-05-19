import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, LineChart as LineIcon } from "lucide-react";

type Tab = "intro" | "live";

export function RidgeLassoRegularizerPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Ridge & Lasso — regulariserings-laboratoriet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Hva skjer med koeffisientene når vi straffer dem? Dra λ-slideren og se Ridge (krymper
            alt) og Lasso (skyver noen til null) i sanntid. Géron kap. 4, ISLR kap. 6, MML kap. 7.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<LineIcon className="h-3.5 w-3.5" />}
          >
            1. λ-slider
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <LiveModule />}

        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Lineær regresjon</strong>: vi tilpasser{" "}
            <code>y = w₀ + w₁x₁ + w₂x₂ + ... + wₚxₚ</code> til data ved å finne w-er som minimerer
            summen av kvadrerte residualer (MSE = Mean Squared Error).
          </li>
          <li>
            <strong className="text-foreground">Overfitting</strong>: når vi har mange features (p
            stor) eller få data-punkter (n liten), kan modellen lære <em>støy</em> i
            treningsdataene. Trening-MSE blir lav, men test-MSE blir høy. Regularisering er
            motgiften.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Nye ord</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Koeffisient (w_i)">
            Vekten foran én feature. Forteller «hvor mye y endres for hver enhet x_i endres». Store
            koeffisienter = «modellen reagerer kraftig på denne featuren» — fare for overfitting.
          </Def>
          <Def term="Regulariseringsparameter λ (lambda)">
            Hvor hardt vi straffer store koeffisienter. λ = 0 betyr «ingen regulering» (vanlig
            OLS-regresjon). Stor λ tvinger koeffisientene mot null.
          </Def>
          <Def term="Ridge-regresjon (L2)">
            Vi minimerer <code>MSE + λ·Σ wᵢ²</code>. «Σ wᵢ²» er summen av kvadrerte koeffisienter.
            Resultat: alle koeffisienter krymper jevnt mot 0, men ingen blir nøyaktig 0.
          </Def>
          <Def term="Lasso-regresjon (L1)">
            Vi minimerer <code>MSE + λ·Σ |wᵢ|</code>. «Σ |wᵢ|» er summen av absoluttverdiene.
            Resultat: noen koeffisienter skyves helt til 0 — features blir <em>droppet</em>. Lasso
            gjør automatisk feature- seleksjon.
          </Def>
          <Def term="L1 vs L2 — hvorfor forskjellig?">
            Begge er straffer på «størrelse», men L1 har en hjørne i sin kost-kontur ved null.
            Optimum havner ofte i hjørnet → koeffisient blir nøyaktig null. L2 er glatt →
            koeffisientene nærmer seg null asymptotisk men er aldri nøyaktig null.
          </Def>
          <Def term="Bias-variance tradeoff">
            Lav λ = liten bias (modellen kan fange detaljer) men høy varians (modellen reagerer på
            støy). Høy λ = høy bias (for enkel) men lav varians. Optimum-λ ligger midt mellom og
            finnes via kryssvalidering.
          </Def>
          <Def term="ElasticNet">
            Kombo: <code>MSE + λ₁·Σ |wᵢ| + λ₂·Σ wᵢ²</code>. Får både Lassos feature-seleksjon og
            Ridges stabilitet ved korrelerte features.
          </Def>
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Slik er modulen bygd</h2>
        <p className="text-muted-foreground">
          Vi har generert syntetiske data med 8 features. Bare features nr. 0, 2 og 5 er{" "}
          <em>egentlig</em> relevante; resten er ren støy. En perfekt modell ville hatt null vekt på
          de fem støy-featurene. Dra λ-slideren og se hvordan Ridge vs Lasso oppdager dette.
        </p>
        <div className="mt-3">
          <Button size="sm" onClick={() => onPick("live")}>
            Start på modul 1 →
          </Button>
        </div>
      </div>
    </div>
  );
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

// ============================================================
// MODUL 1 — λ-slider med Ridge og Lasso side-ved-side
// ============================================================

const P = 8; // features
const N = 40; // samples
const TRUE_W = [3.5, 0, 2.2, 0, 0, -1.8, 0, 0]; // bare feature 0, 2, 5 er ekte

// Generér syntetiske data deterministisk (seedet) så hver render gir samme tall.
function makeData(): { X: number[][]; y: number[] } {
  let seed = 7;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1; // [-1, 1]
  }
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = 0; i < N; i++) {
    const row = Array.from({ length: P }, () => rand());
    X.push(row);
    let yi = 0;
    for (let j = 0; j < P; j++) yi += TRUE_W[j] * row[j];
    yi += rand() * 0.6; // litt støy
    y.push(yi);
  }
  return { X, y };
}

function solveRidge(X: number[][], y: number[], lambda: number): number[] {
  // Lukket form: w = (XᵀX + λI)⁻¹ Xᵀ y
  const p = X[0].length;
  // Bygg XᵀX (p×p) og Xᵀy (p)
  const XtX: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  const Xty: number[] = Array(p).fill(0);
  for (let i = 0; i < X.length; i++) {
    for (let j = 0; j < p; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k < p; k++) XtX[j][k] += X[i][j] * X[i][k];
    }
  }
  for (let j = 0; j < p; j++) XtX[j][j] += lambda;
  return solveLinearSystem(XtX, Xty);
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  // Gauss-eliminasjon. Modifiserer kopier.
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    for (let k = i + 1; k < n; k++) {
      const f = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
    }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

// Lasso via koordinat-nedstigning (en enkel implementasjon)
function solveLasso(X: number[][], y: number[], lambda: number, iters = 200): number[] {
  const n = X.length;
  const p = X[0].length;
  const w = Array(p).fill(0);
  // Forhåndsregn norm-kvadrater
  const norm = Array(p).fill(0);
  for (let j = 0; j < p; j++) for (let i = 0; i < n; i++) norm[j] += X[i][j] * X[i][j];

  for (let t = 0; t < iters; t++) {
    for (let j = 0; j < p; j++) {
      // residual eksklusiv feature j
      let rho = 0;
      for (let i = 0; i < n; i++) {
        let yhat_excl = 0;
        for (let k = 0; k < p; k++) if (k !== j) yhat_excl += X[i][k] * w[k];
        rho += X[i][j] * (y[i] - yhat_excl);
      }
      // Soft-thresholding
      if (rho < -lambda / 2) w[j] = (rho + lambda / 2) / (norm[j] || 1);
      else if (rho > lambda / 2) w[j] = (rho - lambda / 2) / (norm[j] || 1);
      else w[j] = 0;
    }
  }
  return w;
}

function computeMse(X: number[][], y: number[], w: number[]): number {
  let s = 0;
  for (let i = 0; i < X.length; i++) {
    let yhat = 0;
    for (let j = 0; j < w.length; j++) yhat += X[i][j] * w[j];
    s += (y[i] - yhat) ** 2;
  }
  return s / X.length;
}

function LiveModule() {
  const [lambda, setLambda] = useState(2);
  const { X, y } = useMemo(makeData, []);

  const wOls = useMemo(() => solveRidge(X, y, 0.0001), [X, y]);
  const wRidge = useMemo(() => solveRidge(X, y, lambda), [X, y, lambda]);
  const wLasso = useMemo(() => solveLasso(X, y, lambda), [X, y, lambda]);

  const mseOls = computeMse(X, y, wOls);
  const mseRidge = computeMse(X, y, wRidge);
  const mseLasso = computeMse(X, y, wLasso);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Eksperimentet:</strong> 40 data-punkter, 8 features. Den
        «sanne» modellen brukte bare feature 0, 2 og 5 (med vekt 3.5, 2.2, −1.8). Resten av
        features-vektene er <em>egentlig</em> 0. Vi har lagt på litt støy. Kan modellene finne ut av
        det?
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-xs text-muted-foreground">
          λ = <span className="font-mono font-semibold">{lambda.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          step={0.1}
          value={lambda}
          onChange={(e) => setLambda(Number(e.target.value))}
          className="w-full max-w-md"
        />

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="font-medium text-muted-foreground pl-2">Feature</div>
          <div className="font-medium text-muted-foreground text-center">Ridge (L2)</div>
          <div className="font-medium text-muted-foreground text-center">Lasso (L1)</div>
          {wRidge.map((_, i) => {
            const isTrue = TRUE_W[i] !== 0;
            const trueVal = TRUE_W[i];
            return (
              <div key={i} className="contents">
                <div
                  className={`pl-2 font-mono ${isTrue ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                >
                  w<sub>{i}</sub>{" "}
                  <span className="text-[10px] text-muted-foreground">
                    (ekte: {trueVal === 0 ? "0" : trueVal.toFixed(1)})
                  </span>
                </div>
                <CoefBar value={wRidge[i]} max={4} />
                <CoefBar value={wLasso[i]} max={4} zero={wLasso[i] === 0} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="MSE — OLS (λ=0)" value={mseOls.toFixed(3)} note="Vanlig regresjon" />
        <Stat label="MSE — Ridge" value={mseRidge.toFixed(3)} note="L2-straff: alle krymper" />
        <Stat
          label="MSE — Lasso"
          value={mseLasso.toFixed(3)}
          note={`L1-straff: ${wLasso.filter((v) => v === 0).length}/8 = 0`}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Sjekkliste:</strong>
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          <li>Med λ = 0 vil OLS-vektene være «riktig nok» men også gi vekt til støy-features.</li>
          <li>Skru opp λ. Ridge: alle vektene krymper jevnt, men ingen blir 0.</li>
          <li>Lasso: noen vekter (særlig støy-features 1, 3, 4, 6, 7) skyves til 0.</li>
          <li>
            For stor λ → også de ekte feature-vektene krymper for mye → MSE øker. Det er sweet-spot
            mellom 0.5 og 5.
          </li>
        </ul>
      </div>
    </div>
  );
}

function CoefBar({ value, max, zero }: { value: number; max: number; zero?: boolean }) {
  const sign = value >= 0 ? 1 : -1;
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-4 rounded bg-muted overflow-hidden relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div
          className={`absolute top-0 bottom-0 ${
            zero ? "bg-muted-foreground/30" : sign > 0 ? "bg-brand" : "bg-amber-500"
          }`}
          style={{
            left: sign > 0 ? "50%" : `${50 - pct / 2}%`,
            width: `${pct / 2}%`,
          }}
        />
      </div>
      <span
        className={`font-mono text-[10px] w-12 text-right ${zero ? "text-muted-foreground" : ""}`}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-xs">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-base">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{note}</div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Ridge (L2)</strong>: bra når alle features har litt
          signal og du vil unngå at noen vekter blir enorme — typisk når features er korrelerte.
        </li>
        <li>
          <strong className="text-foreground">Lasso (L1)</strong>: bra når du har <em>mange</em>{" "}
          features og mistanken er at de fleste er irrelevante. Lasso gir deg automatisk
          feature-seleksjon.
        </li>
        <li>
          <strong className="text-foreground">Hvordan velger man λ?</strong> Kryssvalidering: prøv
          flere λ-verdier, måle validering-MSE per λ, velg den som minimerer.
        </li>
        <li>
          Hvis du er usikker — <strong className="text-foreground">ElasticNet</strong> kombinerer L1
          + L2 og er en god default.
        </li>
      </ul>
    </section>
  );
}
