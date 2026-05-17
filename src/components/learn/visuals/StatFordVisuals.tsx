// Visual diagrams for TEK-1501 statistics flashcards.
// Each component is a theme-aware SVG that renders a recognizable statistics
// figure — PDF/PMF plots, sampling distributions, hypothesis-test regions,
// probability trees, boxplots, confidence-interval bands, etc.
//
// Conventions (matches Visuals.tsx):
//   - <figure> wrapper with <figcaption>
//   - root <svg> uses class "text-foreground" so currentColor follows theme
//   - fills use color-mix with var(--brand) / var(--success) / var(--muted)
//   - strokes use STROKE = "currentColor"
//   - keep things small + responsive (max-w-md / max-w-sm)

import { useEffect, useState, type FC } from "react";

const STROKE = "currentColor";

// ----- small math helpers (avoid pulling in any deps) ---------------------

const factorial = (n: number): number => {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
};

const choose = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let num = 1;
  let den = 1;
  for (let i = 1; i <= k; i++) {
    num *= n - k + i;
    den *= i;
  }
  return num / den;
};

const normalPdf = (x: number, mu = 0, sigma = 1): number => {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
};

// Abramowitz approximation for the standard normal CDF.
const normalCdf = (x: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp(-0.5 * x * x);
  const p =
    d *
    t *
    (0.319381530 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
};

// Box-Muller (for samples used by CLT / CI visualisations).
const sampleNormal = (mu = 0, sigma = 1): number => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ==========================================================================
// DESKRIPTIV STATISTIKK
// ==========================================================================

// ----- Mean vs median, illustrating outlier sensitivity --------------------
export const MeanVsMedian: FC = () => {
  // Data on a 0..100 axis: cluster + one big outlier.
  const data = [20, 22, 24, 25, 26, 28, 30, 95];
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((s, x) => s + x, 0) / data.length;
  const median = (sorted[3] + sorted[4]) / 2;
  const xOf = (v: number) => 30 + (v / 100) * 320;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 380 140" className="w-full max-w-md mx-auto text-foreground">
        {/* axis */}
        <line x1="30" y1="90" x2="360" y2="90" stroke={STROKE} strokeWidth="1" />
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={xOf(t)} y1="88" x2={xOf(t)} y2="92" stroke={STROKE} />
            <text x={xOf(t)} y="104" textAnchor="middle" className="text-[9px] fill-current opacity-60">{t}</text>
          </g>
        ))}
        {/* data dots */}
        {data.map((v, i) => (
          <circle
            key={i}
            cx={xOf(v)}
            cy="80"
            r="5"
            fill={v === 95 ? "color-mix(in oklch, var(--destructive) 60%, transparent)" : "color-mix(in oklch, var(--brand) 50%, transparent)"}
            stroke={STROKE}
            strokeWidth="0.8"
          />
        ))}
        <text x={xOf(95)} y="68" textAnchor="middle" className="text-[9px] fill-current opacity-70">outlier</text>

        {/* median marker */}
        <line x1={xOf(median)} y1="40" x2={xOf(median)} y2="90" stroke="var(--success)" strokeWidth="2" />
        <text x={xOf(median)} y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>
          median {median}
        </text>

        {/* mean marker */}
        <line x1={xOf(mean)} y1="40" x2={xOf(mean)} y2="90" stroke="var(--brand)" strokeWidth="2" strokeDasharray="3 2" />
        <text x={xOf(mean)} y="22" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--brand)" }}>
          mean {mean.toFixed(1)}
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Én outlier (95) drar mean langt mot høyre — median sitter stille i midten av dataene.
      </figcaption>
    </figure>
  );
};

// ----- Variance: dots, mean, squared deviations as squares -----------------
export const VarianceSquares: FC = () => {
  const data = [2, 4, 4, 6, 8];
  const mean = data.reduce((s, x) => s + x, 0) / data.length; // 4.8
  const xOf = (v: number) => 30 + ((v - 0) / 10) * 280;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
        {/* axis */}
        <line x1="30" y1="120" x2="320" y2="120" stroke={STROKE} />
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <g key={t}>
            <line x1={xOf(t)} y1="118" x2={xOf(t)} y2="122" stroke={STROKE} />
            <text x={xOf(t)} y="134" textAnchor="middle" className="text-[9px] fill-current opacity-60">{t}</text>
          </g>
        ))}
        {/* mean line */}
        <line x1={xOf(mean)} y1="20" x2={xOf(mean)} y2="120" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={xOf(mean)} y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--brand)" }}>
          x̄ = {mean}
        </text>
        {/* squares: side = |x - mean| * 6 px */}
        {data.map((v, i) => {
          const side = Math.abs(v - mean) * 8;
          const x1 = Math.min(xOf(v), xOf(mean));
          return (
            <g key={i}>
              <rect
                x={x1}
                y={120 - side}
                width={side}
                height={side}
                fill="color-mix(in oklch, var(--success) 20%, transparent)"
                stroke="var(--success)"
                strokeWidth="0.8"
                opacity="0.85"
              />
              <circle cx={xOf(v)} cy="120" r="3.5" fill="var(--brand)" stroke={STROKE} strokeWidth="0.5" />
            </g>
          );
        })}
        <text x="175" y="160" textAnchor="middle" className="text-[10px] fill-current opacity-80">
          Varians = snittet av kvadratenes areal
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Hvert kvadrat har side |xᵢ − x̄|. Varians måler gjennomsnittlig kvadratisk avstand fra mean.
      </figcaption>
    </figure>
  );
};

// ----- Boxplot anatomy ----------------------------------------------------
export const BoxplotAnatomy: FC = () => {
  // 5-tall: min=5, Q1=20, median=32, Q3=45, max=70, outlier at 85
  const xOf = (v: number) => 30 + (v / 100) * 320;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
        {/* axis */}
        <line x1="30" y1="140" x2="360" y2="140" stroke={STROKE} />
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={xOf(t)} y1="138" x2={xOf(t)} y2="142" stroke={STROKE} />
            <text x={xOf(t)} y="154" textAnchor="middle" className="text-[9px] fill-current opacity-60">{t}</text>
          </g>
        ))}

        {/* whisker low */}
        <line x1={xOf(5)} y1="80" x2={xOf(20)} y2="80" stroke={STROKE} strokeWidth="1.2" />
        <line x1={xOf(5)} y1="68" x2={xOf(5)} y2="92" stroke={STROKE} strokeWidth="1.2" />
        {/* box */}
        <rect
          x={xOf(20)}
          y="56"
          width={xOf(45) - xOf(20)}
          height="48"
          fill="color-mix(in oklch, var(--brand) 18%, transparent)"
          stroke={STROKE}
          strokeWidth="1.5"
        />
        {/* median */}
        <line x1={xOf(32)} y1="56" x2={xOf(32)} y2="104" stroke="var(--success)" strokeWidth="2.5" />
        {/* whisker high */}
        <line x1={xOf(45)} y1="80" x2={xOf(70)} y2="80" stroke={STROKE} strokeWidth="1.2" />
        <line x1={xOf(70)} y1="68" x2={xOf(70)} y2="92" stroke={STROKE} strokeWidth="1.2" />
        {/* outlier */}
        <circle cx={xOf(85)} cy="80" r="3.5" fill="color-mix(in oklch, var(--destructive) 50%, transparent)" stroke={STROKE} />

        {/* labels */}
        <g className="text-[9px] fill-current">
          <text x={xOf(5)} y="40" textAnchor="middle">min</text>
          <text x={xOf(20)} y="40" textAnchor="middle">Q1</text>
          <text x={xOf(32)} y="40" textAnchor="middle" className="font-semibold" style={{ fill: "var(--success)" }}>median</text>
          <text x={xOf(45)} y="40" textAnchor="middle">Q3</text>
          <text x={xOf(70)} y="40" textAnchor="middle">whisker</text>
          <text x={xOf(85)} y="60" textAnchor="middle" className="opacity-80">outlier</text>
        </g>
        {/* IQR brace */}
        <line x1={xOf(20)} y1="120" x2={xOf(45)} y2="120" stroke="var(--brand)" strokeWidth="1.5" />
        <line x1={xOf(20)} y1="116" x2={xOf(20)} y2="124" stroke="var(--brand)" />
        <line x1={xOf(45)} y1="116" x2={xOf(45)} y2="124" stroke="var(--brand)" />
        <text x={(xOf(20) + xOf(45)) / 2} y="134" textAnchor="middle" className="text-[10px] font-semibold" style={{ fill: "var(--brand)" }}>
          IQR = Q3 − Q1
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Boksplott-anatomi — boksen er Q1..Q3 (midtre 50 %), whiskers strekker maks 1.5·IQR.
      </figcaption>
    </figure>
  );
};

// ----- Skewness gallery (left, sym, right) ---------------------------------
export const SkewnessGallery: FC = () => {
  // pre-baked PDF-like shapes
  const N = 60;
  const W = 110;
  const H = 80;
  const baseline = H - 6;
  const right = (i: number) => {
    const x = i / N;
    // gamma-ish skewed right
    return 4.5 * Math.pow(x, 1.2) * Math.exp(-3 * x);
  };
  const sym = (i: number) => {
    const x = (i / N - 0.5) * 4;
    return Math.exp(-0.5 * x * x);
  };
  const left = (i: number) => right(N - i);
  const path = (fn: (i: number) => number, color: string) => {
    let max = 0;
    for (let i = 0; i <= N; i++) max = Math.max(max, fn(i));
    let d = `M 5 ${baseline}`;
    for (let i = 0; i <= N; i++) {
      const x = 5 + (i / N) * (W - 10);
      const y = baseline - (fn(i) / max) * (H - 18);
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L ${W - 5} ${baseline} Z`;
    return <path d={d} fill={`color-mix(in oklch, ${color} 22%, transparent)`} stroke={color} strokeWidth="1.2" />;
  };
  const median = (W - 10) * 0.5 + 5;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W * 3 + 20} ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <g transform="translate(0,0)">
          {path(left, "var(--brand)")}
          <line x1="5" y1={baseline} x2={W - 5} y2={baseline} stroke={STROKE} />
          {/* median ~ approx where area is half — use 0.62 visually */}
          <line x1={(W - 10) * 0.62 + 5} y1={baseline} x2={(W - 10) * 0.62 + 5} y2={baseline - 50} stroke="var(--success)" strokeDasharray="3 2" />
          {/* mean further left of median */}
          <line x1={(W - 10) * 0.46 + 5} y1={baseline} x2={(W - 10) * 0.46 + 5} y2={baseline - 50} stroke="var(--brand)" strokeDasharray="3 2" />
          <text x={W / 2} y={H + 18} textAnchor="middle" className="text-[10px] fill-current">venstreskjev</text>
          <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[8px] fill-current opacity-60">mean &lt; median</text>
        </g>
        <g transform={`translate(${W + 10},0)`}>
          {path(sym, "var(--success)")}
          <line x1="5" y1={baseline} x2={W - 5} y2={baseline} stroke={STROKE} />
          <line x1={median} y1={baseline} x2={median} y2={baseline - 50} stroke="var(--brand)" strokeDasharray="3 2" />
          <text x={W / 2} y={H + 18} textAnchor="middle" className="text-[10px] fill-current">symmetrisk</text>
          <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[8px] fill-current opacity-60">mean ≈ median</text>
        </g>
        <g transform={`translate(${2 * (W + 10)},0)`}>
          {path(right, "var(--brand)")}
          <line x1="5" y1={baseline} x2={W - 5} y2={baseline} stroke={STROKE} />
          <line x1={(W - 10) * 0.38 + 5} y1={baseline} x2={(W - 10) * 0.38 + 5} y2={baseline - 50} stroke="var(--success)" strokeDasharray="3 2" />
          <line x1={(W - 10) * 0.54 + 5} y1={baseline} x2={(W - 10) * 0.54 + 5} y2={baseline - 50} stroke="var(--brand)" strokeDasharray="3 2" />
          <text x={W / 2} y={H + 18} textAnchor="middle" className="text-[10px] fill-current">høyreskjev</text>
          <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[8px] fill-current opacity-60">mean &gt; median</text>
        </g>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Skjevhet — halen peker mot ekstremverdiene; mean blir trukket mot halen, median ikke.
      </figcaption>
    </figure>
  );
};

// ----- Histogram with adjustable bin count --------------------------------
export const HistogramBins: FC = () => {
  const [bins, setBins] = useState(10);
  // Fake bi-modal data set
  const data = (() => {
    const out: number[] = [];
    for (let i = 0; i < 200; i++) out.push(sampleNormal(35, 6));
    for (let i = 0; i < 150; i++) out.push(sampleNormal(70, 8));
    return out;
  })();
  const min = 10;
  const max = 100;
  const counts = new Array(bins).fill(0) as number[];
  for (const v of data) {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(((v - min) / (max - min)) * bins)));
    counts[b]++;
  }
  const peak = Math.max(...counts);
  const W = 340;
  const H = 120;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 360 ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2="350" y2={H} stroke={STROKE} />
        {counts.map((c, i) => {
          const bw = W / bins;
          const x = 10 + i * bw;
          const h = peak ? (c / peak) * (H - 10) : 0;
          return (
            <rect
              key={i}
              x={x + 0.5}
              y={H - h}
              width={bw - 1}
              height={h}
              fill="color-mix(in oklch, var(--brand) 30%, transparent)"
              stroke={STROKE}
              strokeWidth="0.5"
            />
          );
        })}
        <text x="180" y={H + 24} textAnchor="middle" className="text-[10px] fill-current opacity-70">
          {bins} bins · n = {data.length}
        </text>
      </svg>
      <div className="flex items-center justify-center gap-2 mt-1">
        <label className="text-[10px] text-muted-foreground">bins</label>
        <input
          type="range"
          min={2}
          max={50}
          value={bins}
          onChange={(e) => setBins(Number(e.target.value))}
          className="w-44 accent-[var(--brand)]"
        />
        <span className="text-[10px] font-mono text-muted-foreground w-6">{bins}</span>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        For få bins skjuler bimodaliteten; for mange viser bare støy. Dra slideren.
      </figcaption>
    </figure>
  );
};

// ==========================================================================
// SANNSYNLIGHET
// ==========================================================================

// ----- Probability axioms as a sample space + events -----------------------
export const ProbAxioms: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-md mx-auto text-foreground">
      {/* Omega */}
      <rect x="10" y="10" width="300" height="160" fill="color-mix(in oklch, var(--muted) 40%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="20" y="26" className="text-[10px] fill-current font-mono">Ω  (P(Ω) = 1)</text>
      {/* A */}
      <circle cx="120" cy="100" r="50" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="120" y="105" textAnchor="middle" className="text-[12px] fill-current font-semibold">A</text>
      {/* B disjoint */}
      <circle cx="230" cy="100" r="42" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="230" y="105" textAnchor="middle" className="text-[12px] fill-current font-semibold">B</text>
      <text x="175" y="160" textAnchor="middle" className="text-[10px] fill-current opacity-70">A ∩ B = ∅  ⇒  P(A ∪ B) = P(A) + P(B)</text>
      <text x="175" y="174" textAnchor="middle" className="text-[10px] fill-current opacity-70">0 ≤ P(·) ≤ 1</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Kolmogorov: ikke-negativ, total 1, addisjon for disjunkte hendelser.
    </figcaption>
  </figure>
);

// ----- Inclusion-exclusion (A ∪ B) ----------------------------------------
export const InclusionExclusion: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-md mx-auto text-foreground">
      <defs>
        <clipPath id="ieA">
          <circle cx="130" cy="90" r="55" />
        </clipPath>
      </defs>
      <circle cx="130" cy="90" r="55" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <circle cx="200" cy="90" r="55" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <g clipPath="url(#ieA)">
        <circle cx="200" cy="90" r="55" fill="color-mix(in oklch, var(--success) 55%, transparent)" />
      </g>
      <text x="105" y="95" textAnchor="middle" className="text-[12px] fill-current font-semibold">A</text>
      <text x="225" y="95" textAnchor="middle" className="text-[12px] fill-current font-semibold">B</text>
      <text x="165" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono">
        P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
      </text>
      <text x="165" y="172" textAnchor="middle" className="text-[9px] fill-current opacity-60">
        snittet (grønt) telles to ganger om vi bare summerer
      </text>
    </svg>
  </figure>
);

// ----- Conditional probability — restrict sample space to B ----------------
export const ConditionalProb: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-2 gap-3">
      <svg viewBox="0 0 200 150" className="w-full text-foreground">
        <rect x="6" y="6" width="188" height="138" fill="color-mix(in oklch, var(--muted) 30%, transparent)" stroke={STROKE} />
        <text x="14" y="20" className="text-[9px] fill-current font-mono">Ω</text>
        <circle cx="80" cy="85" r="40" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
        <circle cx="135" cy="85" r="40" fill="color-mix(in oklch, var(--success) 30%, transparent)" stroke={STROKE} />
        <text x="60" y="90" textAnchor="middle" className="text-[11px] fill-current font-semibold">A</text>
        <text x="155" y="90" textAnchor="middle" className="text-[11px] fill-current font-semibold">B</text>
        <text x="100" y="140" textAnchor="middle" className="text-[9px] fill-current opacity-70">før — hele Ω</text>
      </svg>
      <svg viewBox="0 0 200 150" className="w-full text-foreground">
        <rect x="6" y="6" width="188" height="138" fill="none" stroke={STROKE} strokeDasharray="3 3" opacity="0.4" />
        <circle cx="135" cy="85" r="40" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} strokeWidth="2" />
        <defs>
          <clipPath id="cpClip">
            <circle cx="135" cy="85" r="40" />
          </clipPath>
        </defs>
        <g clipPath="url(#cpClip)">
          <circle cx="80" cy="85" r="40" fill="color-mix(in oklch, var(--brand) 60%, transparent)" />
        </g>
        <text x="155" y="90" textAnchor="middle" className="text-[11px] fill-current font-semibold">B</text>
        <text x="100" y="140" textAnchor="middle" className="text-[9px] fill-current opacity-70">P(A|B) = areal(A∩B) / areal(B)</text>
      </svg>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Betinging «zoomer inn» på B: ny universalmengde er B, brøkdelen av A i B er P(A|B).
    </figcaption>
  </figure>
);

// ----- Bayes tree for a diagnostic test -----------------------------------
export const BayesTree: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
      {/* root */}
      <circle cx="40" cy="110" r="14" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="40" y="114" textAnchor="middle" className="text-[10px] fill-current">Ω</text>

      {/* branch to Syk / Frisk */}
      <line x1="54" y1="105" x2="150" y2="60" stroke={STROKE} />
      <line x1="54" y1="115" x2="150" y2="160" stroke={STROKE} />
      <text x="95" y="74" textAnchor="middle" className="text-[9px] fill-current font-mono">P(S)=0.01</text>
      <text x="95" y="148" textAnchor="middle" className="text-[9px] fill-current font-mono">P(F)=0.99</text>

      <rect x="150" y="48" width="60" height="24" rx="3" fill="color-mix(in oklch, var(--destructive) 25%, transparent)" stroke={STROKE} />
      <text x="180" y="64" textAnchor="middle" className="text-[10px] fill-current font-semibold">Syk</text>
      <rect x="150" y="148" width="60" height="24" rx="3" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} />
      <text x="180" y="164" textAnchor="middle" className="text-[10px] fill-current font-semibold">Frisk</text>

      {/* second branch */}
      <line x1="210" y1="56" x2="290" y2="32" stroke={STROKE} />
      <line x1="210" y1="64" x2="290" y2="80" stroke={STROKE} />
      <line x1="210" y1="156" x2="290" y2="136" stroke={STROKE} />
      <line x1="210" y1="164" x2="290" y2="190" stroke={STROKE} />

      <text x="248" y="42" textAnchor="middle" className="text-[8px] fill-current font-mono opacity-80">+|S=0.99</text>
      <text x="248" y="80" textAnchor="middle" className="text-[8px] fill-current font-mono opacity-60">−|S=0.01</text>
      <text x="248" y="138" textAnchor="middle" className="text-[8px] fill-current font-mono opacity-60">+|F=0.05</text>
      <text x="248" y="190" textAnchor="middle" className="text-[8px] fill-current font-mono opacity-80">−|F=0.95</text>

      {/* leaves */}
      <text x="320" y="28" className="text-[9px] fill-current font-mono">+  0.0099</text>
      <text x="320" y="84" className="text-[9px] fill-current font-mono opacity-60">−  0.0001</text>
      <text x="320" y="140" className="text-[9px] fill-current font-mono">+  0.0495</text>
      <text x="320" y="194" className="text-[9px] fill-current font-mono opacity-60">−  0.9405</text>

      <text x="190" y="210" textAnchor="middle" className="text-[10px] fill-current font-mono">
        P(S|+) = 0.0099 / (0.0099 + 0.0495) ≈ 17 %
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Sannsynlighetstre for Bayes — multipliser langs greinene, summer i nevner.
    </figcaption>
  </figure>
);

// ----- Independent vs dependent (2x2 contingency) ------------------------
export const Independence: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-2 gap-3 text-[10px]">
      <div className="rounded border border-success/40 p-2">
        <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1 text-center">uavhengig</div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/30"><th className="border border-border px-1.5 py-0.5"></th><th className="border border-border px-1.5 py-0.5">B</th><th className="border border-border px-1.5 py-0.5">¬B</th></tr>
          </thead>
          <tbody>
            <tr><td className="border border-border px-1.5 py-0.5 font-semibold">A</td><td className="border border-border px-1.5 py-0.5 font-mono">0.18</td><td className="border border-border px-1.5 py-0.5 font-mono">0.42</td></tr>
            <tr><td className="border border-border px-1.5 py-0.5 font-semibold">¬A</td><td className="border border-border px-1.5 py-0.5 font-mono">0.12</td><td className="border border-border px-1.5 py-0.5 font-mono">0.28</td></tr>
          </tbody>
        </table>
        <div className="text-[9px] text-muted-foreground mt-1 font-mono text-center">
          0.18 = 0.6 · 0.3 ✓
        </div>
      </div>
      <div className="rounded border border-destructive/40 p-2">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1 text-center">avhengig</div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/30"><th className="border border-border px-1.5 py-0.5"></th><th className="border border-border px-1.5 py-0.5">B</th><th className="border border-border px-1.5 py-0.5">¬B</th></tr>
          </thead>
          <tbody>
            <tr><td className="border border-border px-1.5 py-0.5 font-semibold">A</td><td className="border border-border px-1.5 py-0.5 font-mono">0.25</td><td className="border border-border px-1.5 py-0.5 font-mono">0.35</td></tr>
            <tr><td className="border border-border px-1.5 py-0.5 font-semibold">¬A</td><td className="border border-border px-1.5 py-0.5 font-mono">0.05</td><td className="border border-border px-1.5 py-0.5 font-mono">0.35</td></tr>
          </tbody>
        </table>
        <div className="text-[9px] text-muted-foreground mt-1 font-mono text-center">
          0.25 ≠ 0.6 · 0.3 = 0.18
        </div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      A og B er uavhengige ⇔ P(A∩B) = P(A)·P(B) i hver celle.
    </figcaption>
  </figure>
);

// ----- Total probability via partition -----------------------------------
export const TotalProbability: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 170" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="10" width="300" height="120" fill="none" stroke={STROKE} />
      {/* partition B1 B2 B3 */}
      <line x1="110" y1="10" x2="110" y2="130" stroke={STROKE} strokeDasharray="3 2" />
      <line x1="210" y1="10" x2="210" y2="130" stroke={STROKE} strokeDasharray="3 2" />
      <text x="60" y="28" textAnchor="middle" className="text-[10px] fill-current font-mono">B₁</text>
      <text x="160" y="28" textAnchor="middle" className="text-[10px] fill-current font-mono">B₂</text>
      <text x="260" y="28" textAnchor="middle" className="text-[10px] fill-current font-mono">B₃</text>
      {/* A as an ellipse crossing all */}
      <ellipse cx="160" cy="80" rx="120" ry="32" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke="var(--success)" strokeWidth="1.5" />
      <text x="160" y="84" textAnchor="middle" className="text-[12px] fill-current font-semibold">A</text>
      <text x="160" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono">
        P(A) = Σᵢ P(A|Bᵢ) · P(Bᵢ)
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Partisjon deler Ω. A skjæres opp i biter A∩Bᵢ — summer dem.
    </figcaption>
  </figure>
);

// ==========================================================================
// KOMBINATORIKK
// ==========================================================================

// ----- Permutations: ordered tree (3 of 4) --------------------------------
export const PermutationTree: FC = () => {
  // 4 items A B C D, choose 3 in order
  const items = ["A", "B", "C", "D"];
  return (
    <figure className="my-4">
      <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
        <circle cx="30" cy="110" r="11" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
        <text x="30" y="114" textAnchor="middle" className="text-[9px] fill-current">·</text>
        {/* layer 1: 4 choices */}
        {items.map((it, i) => {
          const y1 = 30 + i * 50;
          return (
            <g key={it}>
              <line x1="41" y1="110" x2="89" y2={y1} stroke={STROKE} strokeWidth="0.8" />
              <circle cx="100" cy={y1} r="10" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
              <text x="100" y={y1 + 3} textAnchor="middle" className="text-[9px] fill-current font-mono">{it}</text>
              {/* layer 2: 3 choices each */}
              {items.filter((x) => x !== it).map((it2, j) => {
                const y2 = y1 - 20 + j * 20;
                return (
                  <g key={it2}>
                    <line x1="111" y1={y1} x2="179" y2={y2} stroke={STROKE} strokeWidth="0.5" opacity="0.7" />
                    <circle cx="190" cy={y2} r="8" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} strokeWidth="0.6" />
                    <text x="190" y={y2 + 3} textAnchor="middle" className="text-[8px] fill-current font-mono">{it2}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
        <text x="290" y="40" textAnchor="middle" className="text-[10px] fill-current font-mono">P(4,3) = 4·3·2</text>
        <text x="290" y="58" textAnchor="middle" className="text-[10px] fill-current font-mono">= 24</text>
        <text x="290" y="80" textAnchor="middle" className="text-[10px] fill-current opacity-70">rekkefølge teller</text>

        <text x="290" y="170" textAnchor="middle" className="text-[10px] fill-current font-mono">P(n,k)</text>
        <text x="290" y="186" textAnchor="middle" className="text-[10px] fill-current font-mono">= n!/(n−k)!</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Tre nivåer: 4 valg · 3 · 2 = 24 ordnede 3-tupler.
      </figcaption>
    </figure>
  );
};

// ----- Combinations: grid showing duplicates as same set ------------------
export const CombinationGrid: FC = () => {
  // Show all 6 ordered pairs of {A,B,C} taken 2 at a time, then group by set
  const ordered = [
    ["A", "B"],
    ["A", "C"],
    ["B", "A"],
    ["B", "C"],
    ["C", "A"],
    ["C", "B"],
  ];
  const sets = [
    { key: "AB", members: ["A,B", "B,A"] },
    { key: "AC", members: ["A,C", "C,A"] },
    { key: "BC", members: ["B,C", "C,B"] },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="rounded border border-border p-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-center text-muted-foreground">
            P(3,2) = 6 ordnede par
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {ordered.map((p) => (
              <span
                key={p.join("")}
                className="rounded bg-brand/15 px-2 py-1 text-center font-mono text-[10px]"
              >
                ({p.join(",")})
              </span>
            ))}
          </div>
        </div>
        <div className="rounded border border-border p-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-center text-success">
            C(3,2) = 3 mengder
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {sets.map((s) => (
              <div key={s.key} className="rounded bg-success/15 px-2 py-1">
                <span className="font-mono text-[11px] font-semibold">{`{${s.key[0]},${s.key[1]}}`}</span>
                <span className="text-[9px] text-muted-foreground ml-2 font-mono">= {s.members.join(" = ")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Hver mengde svarer til k! ordnede sekvenser ⇒ C(n,k) = P(n,k)/k!.
      </figcaption>
    </figure>
  );
};

// ----- Permutation vs combination decision flow --------------------------
export const PermVsComb: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      <rect x="100" y="10" width="160" height="36" rx="6" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="33" textAnchor="middle" className="text-[11px] fill-current font-semibold">
        Spiller rekkefølgen rolle?
      </text>
      <line x1="140" y1="46" x2="60" y2="80" stroke={STROKE} />
      <line x1="220" y1="46" x2="300" y2="80" stroke={STROKE} />
      <text x="90" y="76" textAnchor="middle" className="text-[10px] fill-current font-mono">JA</text>
      <text x="270" y="76" textAnchor="middle" className="text-[10px] fill-current font-mono">NEI</text>

      <rect x="10" y="84" width="100" height="44" rx="6" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="60" y="105" textAnchor="middle" className="text-[11px] fill-current font-semibold">Permutasjon</text>
      <text x="60" y="120" textAnchor="middle" className="text-[10px] fill-current font-mono">P(n,k)=n!/(n−k)!</text>

      <rect x="250" y="84" width="100" height="44" rx="6" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="300" y="105" textAnchor="middle" className="text-[11px] fill-current font-semibold">Kombinasjon</text>
      <text x="300" y="120" textAnchor="middle" className="text-[10px] fill-current font-mono">C(n,k)=n!/k!(n−k)!</text>

      <text x="60" y="158" textAnchor="middle" className="text-[9px] fill-current opacity-70">pall · kode</text>
      <text x="60" y="172" textAnchor="middle" className="text-[9px] fill-current opacity-70">rangering · sekvens</text>
      <text x="300" y="158" textAnchor="middle" className="text-[9px] fill-current opacity-70">komité · utvalg</text>
      <text x="300" y="172" textAnchor="middle" className="text-[9px] fill-current opacity-70">lottokupong · hånd</text>
    </svg>
  </figure>
);

// ==========================================================================
// FORDELINGER
// ==========================================================================

// ----- Discrete vs continuous random variable (PMF vs PDF) ----------------
export const RandomVariablePmfPdf: FC = () => {
  const W = 150;
  const H = 100;
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-3">
        <svg viewBox={`0 0 ${W + 10} ${H + 30}`} className="w-full text-foreground">
          <line x1="10" y1={H} x2={W} y2={H} stroke={STROKE} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const p = choose(5, k) * Math.pow(0.5, 5);
            const x = 20 + k * 22;
            const h = p * H * 3.2;
            return (
              <g key={k}>
                <rect
                  x={x - 7}
                  y={H - h}
                  width="14"
                  height={h}
                  fill="color-mix(in oklch, var(--brand) 35%, transparent)"
                  stroke={STROKE}
                />
                <text x={x} y={H + 14} textAnchor="middle" className="text-[9px] fill-current">{k}</text>
              </g>
            );
          })}
          <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[10px] fill-current font-semibold">PMF (diskret)</text>
        </svg>
        <svg viewBox={`0 0 ${W + 10} ${H + 30}`} className="w-full text-foreground">
          <line x1="10" y1={H} x2={W} y2={H} stroke={STROKE} />
          {(() => {
            const N = 60;
            let d = `M 10 ${H}`;
            for (let i = 0; i <= N; i++) {
              const x = 10 + (i / N) * (W - 10);
              const z = -2 + (i / N) * 4;
              const y = H - normalPdf(z) * 110;
              d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
            }
            d += ` L ${W} ${H} Z`;
            return <path d={d} fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke="var(--success)" strokeWidth="1.5" />;
          })()}
          <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[10px] fill-current font-semibold">PDF (kontinuerlig)</text>
        </svg>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Diskret: P(X=k) er stolper. Kontinuerlig: P(a≤X≤b) er arealet under kurven.
      </figcaption>
    </figure>
  );
};

// ----- Expected value as balance point ------------------------------------
export const ExpectedValueBalance: FC = () => {
  const vals = [
    { x: 1, p: 0.1 },
    { x: 2, p: 0.2 },
    { x: 3, p: 0.4 },
    { x: 4, p: 0.2 },
    { x: 5, p: 0.1 },
  ];
  const ex = vals.reduce((s, v) => s + v.x * v.p, 0); // 3
  const xOf = (x: number) => 30 + ((x - 0.5) / 5) * 320;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 380 160" className="w-full max-w-md mx-auto text-foreground">
        {/* balance beam */}
        <line x1="30" y1="100" x2="360" y2="100" stroke={STROKE} strokeWidth="2" />
        {/* fulcrum */}
        <polygon
          points={`${xOf(ex)},108 ${xOf(ex) - 12},132 ${xOf(ex) + 12},132`}
          fill="color-mix(in oklch, var(--brand) 60%, transparent)"
          stroke={STROKE}
        />
        <text x={xOf(ex)} y="148" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--brand)" }}>
          E[X] = {ex}
        </text>
        {/* stacks for each value, proportional to probability */}
        {vals.map((v) => {
          const stacks = Math.round(v.p * 10);
          return (
            <g key={v.x}>
              {Array.from({ length: stacks }).map((_, i) => (
                <rect
                  key={i}
                  x={xOf(v.x) - 12}
                  y={94 - i * 8}
                  width="24"
                  height="6"
                  fill="color-mix(in oklch, var(--success) 35%, transparent)"
                  stroke={STROKE}
                  strokeWidth="0.5"
                />
              ))}
              <text x={xOf(v.x)} y="118" textAnchor="middle" className="text-[10px] fill-current">{v.x}</text>
              <text x={xOf(v.x)} y={86 - stacks * 8} textAnchor="middle" className="text-[8px] fill-current opacity-70 font-mono">{v.p}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        E[X] er det punktet stolpene «balanserer» rundt — vektet middel av verdiene.
      </figcaption>
    </figure>
  );
};

// ----- Binomial PMF, with adjustable n, p ---------------------------------
export const BinomialPMF: FC = () => {
  const [n, setN] = useState(15);
  const [p, setP] = useState(0.4);
  const W = 340;
  const H = 120;
  const probs: number[] = [];
  for (let k = 0; k <= n; k++) probs.push(choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k));
  const peak = Math.max(...probs);
  const mean = n * p;
  const variance = n * p * (1 - p);
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 360 ${H + 35}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2="350" y2={H} stroke={STROKE} />
        {probs.map((pr, k) => {
          const bw = W / (n + 1);
          const x = 10 + k * bw;
          const h = peak ? (pr / peak) * (H - 16) : 0;
          return (
            <rect
              key={k}
              x={x + 0.5}
              y={H - h}
              width={bw - 1}
              height={h}
              fill="color-mix(in oklch, var(--brand) 35%, transparent)"
              stroke={STROKE}
              strokeWidth="0.6"
            />
          );
        })}
        {/* mean line */}
        <line
          x1={10 + ((mean + 0.5) * W) / (n + 1)}
          y1="0"
          x2={10 + ((mean + 0.5) * W) / (n + 1)}
          y2={H}
          stroke="var(--success)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <text x={180} y={H + 16} textAnchor="middle" className="text-[10px] fill-current font-mono">
          B(n={n}, p={p.toFixed(2)}) · E={mean.toFixed(2)} · Var={variance.toFixed(2)}
        </text>
        <text x={180} y={H + 30} textAnchor="middle" className="text-[9px] fill-current opacity-60">
          stiplet linje = E[X] = np
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto mt-1 text-[10px]">
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground w-4">n</label>
          <input type="range" min={1} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} className="flex-1 accent-[var(--brand)]" />
          <span className="font-mono w-6 text-right">{n}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground w-4">p</label>
          <input type="range" min={1} max={99} value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)} className="flex-1 accent-[var(--brand)]" />
          <span className="font-mono w-9 text-right">{p.toFixed(2)}</span>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Sannsynlighet for k suksesser i n forsøk. Symmetrisk når p=0.5, skjev ellers.
      </figcaption>
    </figure>
  );
};

// ----- Bernoulli single-trial -------------------------------------------
export const BernoulliBars: FC = () => {
  const [p, setP] = useState(0.7);
  return (
    <figure className="my-4">
      <svg viewBox="0 0 320 150" className="w-full max-w-sm mx-auto text-foreground">
        <line x1="20" y1="110" x2="300" y2="110" stroke={STROKE} />
        <rect x="60" y={110 - (1 - p) * 100} width="60" height={(1 - p) * 100} fill="color-mix(in oklch, var(--destructive) 30%, transparent)" stroke={STROKE} />
        <text x="90" y="125" textAnchor="middle" className="text-[10px] fill-current">0 (fiasko)</text>
        <text x="90" y={108 - (1 - p) * 100} textAnchor="middle" className="text-[9px] fill-current font-mono">{(1 - p).toFixed(2)}</text>

        <rect x="200" y={110 - p * 100} width="60" height={p * 100} fill="color-mix(in oklch, var(--success) 30%, transparent)" stroke={STROKE} />
        <text x="230" y="125" textAnchor="middle" className="text-[10px] fill-current">1 (suksess)</text>
        <text x="230" y={108 - p * 100} textAnchor="middle" className="text-[9px] fill-current font-mono">{p.toFixed(2)}</text>

        <text x="160" y="145" textAnchor="middle" className="text-[10px] fill-current font-mono">
          E={p.toFixed(2)} · Var={(p * (1 - p)).toFixed(3)}
        </text>
      </svg>
      <div className="flex items-center gap-2 max-w-xs mx-auto text-[10px]">
        <label className="text-muted-foreground">p</label>
        <input type="range" min={1} max={99} value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)} className="flex-1 accent-[var(--brand)]" />
        <span className="font-mono w-9 text-right">{p.toFixed(2)}</span>
      </div>
    </figure>
  );
};

// ----- Poisson PMF -------------------------------------------------------
export const PoissonPMF: FC = () => {
  const [lambda, setLambda] = useState(4);
  const kmax = Math.max(15, Math.ceil(lambda * 3));
  const W = 320;
  const H = 110;
  const probs: number[] = [];
  for (let k = 0; k <= kmax; k++) {
    probs.push((Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k));
  }
  const peak = Math.max(...probs);
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 340 ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2="330" y2={H} stroke={STROKE} />
        {probs.map((pr, k) => {
          const bw = W / (kmax + 1);
          const x = 10 + k * bw;
          const h = peak ? (pr / peak) * (H - 12) : 0;
          return (
            <rect
              key={k}
              x={x + 0.5}
              y={H - h}
              width={bw - 1}
              height={h}
              fill="color-mix(in oklch, var(--success) 35%, transparent)"
              stroke={STROKE}
              strokeWidth="0.6"
            />
          );
        })}
        <text x={170} y={H + 18} textAnchor="middle" className="text-[10px] fill-current font-mono">
          Poi(λ={lambda.toFixed(1)}) · E=Var=λ
        </text>
      </svg>
      <div className="flex items-center gap-2 max-w-xs mx-auto text-[10px]">
        <label className="text-muted-foreground">λ</label>
        <input type="range" min={5} max={150} value={Math.round(lambda * 10)} onChange={(e) => setLambda(Number(e.target.value) / 10)} className="flex-1 accent-[var(--brand)]" />
        <span className="font-mono w-9 text-right">{lambda.toFixed(1)}</span>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Antall sjeldne hendelser per intervall. Større λ → kurven flytter og brer seg.
      </figcaption>
    </figure>
  );
};

// ----- Poisson vs binomial limit ----------------------------------------
export const PoissonVsBinomial: FC = () => {
  const n = 50;
  const p = 0.1;
  const lam = n * p;
  const kmax = 15;
  const bin: number[] = [];
  const poi: number[] = [];
  for (let k = 0; k <= kmax; k++) {
    bin.push(choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k));
    poi.push((Math.exp(-lam) * Math.pow(lam, k)) / factorial(k));
  }
  const peak = Math.max(...bin, ...poi);
  const W = 330;
  const H = 120;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 350 ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2="340" y2={H} stroke={STROKE} />
        {bin.map((b, k) => {
          const bw = W / (kmax + 1);
          const x = 10 + k * bw;
          const h = (b / peak) * (H - 12);
          return (
            <rect
              key={`b${k}`}
              x={x + 1}
              y={H - h}
              width={bw / 2 - 1}
              height={h}
              fill="color-mix(in oklch, var(--brand) 35%, transparent)"
              stroke="var(--brand)"
              strokeWidth="0.5"
            />
          );
        })}
        {poi.map((p2, k) => {
          const bw = W / (kmax + 1);
          const x = 10 + k * bw + bw / 2;
          const h = (p2 / peak) * (H - 12);
          return (
            <rect
              key={`p${k}`}
              x={x}
              y={H - h}
              width={bw / 2 - 1}
              height={h}
              fill="color-mix(in oklch, var(--success) 35%, transparent)"
              stroke="var(--success)"
              strokeWidth="0.5"
            />
          );
        })}
        <g className="text-[9px] font-mono">
          <rect x="240" y="8" width="10" height="10" fill="color-mix(in oklch, var(--brand) 35%, transparent)" stroke="var(--brand)" />
          <text x="254" y="17" className="fill-current">B(50, 0.1)</text>
          <rect x="240" y="22" width="10" height="10" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke="var(--success)" />
          <text x="254" y="31" className="fill-current">Poi(5)</text>
        </g>
        <text x={170} y={H + 16} textAnchor="middle" className="text-[10px] fill-current font-mono">
          stort n, lite p ⇒ B(n,p) ≈ Poi(np)
        </text>
      </svg>
    </figure>
  );
};

// ----- Hypergeometric vs binomial (with/without replacement) -----------
export const HypergeometricUrn: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-2 gap-3 text-[10px]">
      <div className="rounded border border-border p-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-center text-muted-foreground">
          MED tilbakelegging → binomisk
        </div>
        <svg viewBox="0 0 160 80" className="w-full text-foreground">
          <ellipse cx="40" cy="40" rx="32" ry="28" fill="color-mix(in oklch, var(--muted) 40%, transparent)" stroke={STROKE} />
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              cx={28 + (i % 4) * 8}
              cy={28 + Math.floor(i / 4) * 12}
              r="3.5"
              fill={i < 3 ? "color-mix(in oklch, var(--success) 60%, transparent)" : "color-mix(in oklch, var(--brand) 30%, transparent)"}
              stroke={STROKE}
              strokeWidth="0.4"
            />
          ))}
          <path d="M82 40 L 130 40" stroke={STROKE} markerEnd="url(#hgArr)" />
          <path d="M130 56 Q 100 70 80 56" stroke={STROKE} strokeDasharray="2 2" fill="none" markerEnd="url(#hgArr)" />
          <circle cx="140" cy="40" r="6" fill="color-mix(in oklch, var(--success) 60%, transparent)" stroke={STROKE} />
          <text x="105" y="34" textAnchor="middle" className="text-[8px] fill-current font-mono">trekk</text>
          <text x="105" y="76" textAnchor="middle" className="text-[8px] fill-current font-mono opacity-70">legg tilbake</text>
          <defs>
            <marker id="hgArr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L6 3 L0 6 z" fill={STROKE} />
            </marker>
          </defs>
        </svg>
        <div className="text-center font-mono text-[10px] mt-1">P konstant ⇒ B(n,p)</div>
      </div>
      <div className="rounded border border-border p-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-center text-muted-foreground">
          UTEN tilbakelegging → hypergeo
        </div>
        <svg viewBox="0 0 160 80" className="w-full text-foreground">
          <ellipse cx="40" cy="40" rx="32" ry="28" fill="color-mix(in oklch, var(--muted) 40%, transparent)" stroke={STROKE} />
          {Array.from({ length: 7 }).map((_, i) => (
            <circle
              key={i}
              cx={28 + (i % 4) * 8}
              cy={28 + Math.floor(i / 4) * 12}
              r="3.5"
              fill={i < 2 ? "color-mix(in oklch, var(--success) 60%, transparent)" : "color-mix(in oklch, var(--brand) 30%, transparent)"}
              stroke={STROKE}
              strokeWidth="0.4"
            />
          ))}
          <path d="M82 40 L 130 40" stroke={STROKE} markerEnd="url(#hg2)" />
          <circle cx="140" cy="40" r="6" fill="color-mix(in oklch, var(--success) 60%, transparent)" stroke={STROKE} />
          <text x="105" y="34" textAnchor="middle" className="text-[8px] fill-current font-mono">trekk</text>
          <text x="105" y="68" textAnchor="middle" className="text-[8px] fill-current font-mono opacity-70">behold</text>
          <defs>
            <marker id="hg2" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L6 3 L0 6 z" fill={STROKE} />
            </marker>
          </defs>
        </svg>
        <div className="text-center font-mono text-[10px] mt-1">P endres ⇒ Hyp(N,K,n)</div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Stor N: hypergeometrisk ≈ binomisk fordi P endres minimalt mellom trekkene.
    </figcaption>
  </figure>
);

// ----- Uniform PDF ------------------------------------------------------
export const UniformPDF: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 140" className="w-full max-w-md mx-auto text-foreground">
      <line x1="20" y1="100" x2="300" y2="100" stroke={STROKE} />
      {/* a..b rectangle */}
      <rect x="80" y="50" width="160" height="50" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke="var(--brand)" strokeWidth="1.5" />
      <line x1="20" y1="100" x2="80" y2="100" stroke={STROKE} />
      <line x1="240" y1="100" x2="300" y2="100" stroke={STROKE} />
      <text x="80" y="115" textAnchor="middle" className="text-[10px] fill-current font-mono">a</text>
      <text x="240" y="115" textAnchor="middle" className="text-[10px] fill-current font-mono">b</text>
      <text x="160" y="78" textAnchor="middle" className="text-[11px] fill-current font-mono">f(x) = 1/(b−a)</text>
      <text x="160" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        E = (a+b)/2 · Var = (b−a)²/12
      </text>
    </svg>
  </figure>
);

// ----- Exponential PDF with memoryless illustration --------------------
export const ExponentialPDF: FC = () => {
  const [lambda, setLambda] = useState(0.5);
  const W = 320;
  const H = 110;
  const N = 80;
  let d = `M 20 ${H}`;
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * 8;
    const y = lambda * Math.exp(-lambda * x);
    const px = 20 + (x / 8) * (W - 40);
    const py = H - y * 110;
    d += ` L ${px.toFixed(2)} ${Math.max(10, py).toFixed(2)}`;
  }
  d += ` L ${W - 20} ${H} Z`;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W + 10} ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="20" y1={H} x2={W - 10} y2={H} stroke={STROKE} />
        <path d={d} fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke="var(--brand)" strokeWidth="1.5" />
        <text x={W / 2} y={H + 16} textAnchor="middle" className="text-[10px] fill-current font-mono">
          f(x)=λe^(−λx) · E=1/λ={(1 / lambda).toFixed(2)}
        </text>
        <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          memoryless: P(X&gt;s+t | X&gt;s) = P(X&gt;t)
        </text>
      </svg>
      <div className="flex items-center gap-2 max-w-xs mx-auto text-[10px]">
        <label className="text-muted-foreground">λ</label>
        <input type="range" min={1} max={30} value={Math.round(lambda * 10)} onChange={(e) => setLambda(Number(e.target.value) / 10)} className="flex-1 accent-[var(--brand)]" />
        <span className="font-mono w-9 text-right">{lambda.toFixed(1)}</span>
      </div>
    </figure>
  );
};

// ----- Normal PDF + 68/95/99.7 rule ------------------------------------
export const NormalCurve: FC = () => {
  const W = 360;
  const H = 140;
  const N = 100;
  const cx = W / 2;
  const sigma = 50; // px per σ
  const top = 30;
  const yOf = (z: number) => top + (1 - Math.exp(-0.5 * z * z)) * (H - 30);
  let path = `M 10 ${H}`;
  for (let i = 0; i <= N; i++) {
    const z = -3.5 + (i / N) * 7;
    const x = cx + z * sigma;
    if (x < 10 || x > W - 10) continue;
    const y = top + (1 - Math.exp(-0.5 * z * z)) * (H - 30);
    path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  path += ` L ${W - 10} ${H} Z`;
  // shaded ±1σ
  const buildBand = (zLo: number, zHi: number) => {
    let p = `M ${cx + zLo * sigma} ${H}`;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const z = zLo + (i / steps) * (zHi - zLo);
      const x = cx + z * sigma;
      const y = top + (1 - Math.exp(-0.5 * z * z)) * (H - 30);
      p += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    p += ` L ${cx + zHi * sigma} ${H} Z`;
    return p;
  };
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <path d={path} fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke="var(--brand)" strokeWidth="1.5" />
        <path d={buildBand(-1, 1)} fill="color-mix(in oklch, var(--brand) 30%, transparent)" />
        <path d={buildBand(-2, -1)} fill="color-mix(in oklch, var(--success) 20%, transparent)" />
        <path d={buildBand(1, 2)} fill="color-mix(in oklch, var(--success) 20%, transparent)" />
        <line x1="10" y1={H} x2={W - 10} y2={H} stroke={STROKE} />
        {/* tick marks for σ */}
        {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
          <g key={z}>
            <line x1={cx + z * sigma} y1={H - 2} x2={cx + z * sigma} y2={H + 4} stroke={STROKE} />
            <text x={cx + z * sigma} y={H + 14} textAnchor="middle" className="text-[9px] fill-current opacity-60">
              {z === 0 ? "μ" : `${z > 0 ? "+" : ""}${z}σ`}
            </text>
          </g>
        ))}
        {/* labels */}
        <text x={cx} y={yOf(0) - 6} textAnchor="middle" className="text-[10px] fill-current font-semibold">68 %</text>
        <text x={cx - sigma * 1.5} y={H - 30} textAnchor="middle" className="text-[9px] fill-current opacity-80">+13.5 %</text>
        <text x={cx + sigma * 1.5} y={H - 30} textAnchor="middle" className="text-[9px] fill-current opacity-80">+13.5 %</text>
        <text x={cx} y={H + 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
          68 / 95 / 99.7 — innen ±1σ / ±2σ / ±3σ
        </text>
      </svg>
    </figure>
  );
};

// ----- Standardisation: same Z, different N ------------------------------
export const Standardization: FC = () => {
  const W = 360;
  const H = 130;
  const pathFor = (mu: number, sigma: number, color: string) => {
    let d = `M 10 ${H - 20}`;
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const x = -4 + (i / N) * 8;
      const z = (x - mu) / sigma;
      const y = Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
      const px = 10 + ((x + 4) / 8) * (W - 20);
      const py = H - 20 - y * 200;
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
    }
    d += ` L ${W - 10} ${H - 20} Z`;
    return <path d={d} fill={`color-mix(in oklch, ${color} 18%, transparent)`} stroke={color} strokeWidth="1.4" />;
  };
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H - 20} x2={W - 10} y2={H - 20} stroke={STROKE} />
        {pathFor(-1, 0.7, "var(--brand)")}
        {pathFor(1, 1.4, "var(--success)")}
        {/* Z scale below */}
        <text x={W / 2} y={H + 12} textAnchor="middle" className="text-[10px] fill-current font-mono">
          Z = (X − μ)/σ ⇒ samme N(0,1) for begge
        </text>
      </svg>
    </figure>
  );
};

// ----- CLT animation — running mean of samples from a U(0,1) -------------
export const CltAnimation: FC = () => {
  const [n, setN] = useState(2);
  const [tick, setTick] = useState(0);
  // accumulate samples — recompute on tick
  const numSamples = 600;
  const means: number[] = [];
  for (let s = 0; s < numSamples; s++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Math.random(); // U(0,1)
    means.push(sum / n);
  }
  // histogram
  const bins = 30;
  const counts = new Array(bins).fill(0) as number[];
  for (const m of means) {
    const b = Math.min(bins - 1, Math.max(0, Math.floor(m * bins)));
    counts[b]++;
  }
  const peak = Math.max(...counts);
  const W = 340;
  const H = 120;
  const bw = W / bins;
  // overlay normal pdf with mu=0.5, sigma = sqrt(1/(12n))
  const sigma = Math.sqrt(1 / (12 * n));
  let np = `M 10 ${H}`;
  for (let i = 0; i <= 60; i++) {
    const x = i / 60;
    const px = 10 + x * W;
    const py = H - normalPdf(x, 0.5, sigma) * H * 0.07;
    np += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
  }
  // Hint that tick triggers re-render
  void tick;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 360 ${H + 20}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2={350} y2={H} stroke={STROKE} />
        {counts.map((c, i) => {
          const h = peak ? (c / peak) * (H - 12) : 0;
          return (
            <rect
              key={i}
              x={10 + i * bw + 0.4}
              y={H - h}
              width={bw - 0.8}
              height={h}
              fill="color-mix(in oklch, var(--brand) 30%, transparent)"
              stroke={STROKE}
              strokeWidth="0.4"
            />
          );
        })}
        <path d={np} fill="none" stroke="var(--success)" strokeWidth="1.5" />
        <text x={180} y={H + 14} textAnchor="middle" className="text-[10px] fill-current font-mono">
          n = {n} · {numSamples} gjennomsnitt fra U(0,1) · σ̂ = {sigma.toFixed(3)}
        </text>
      </svg>
      <div className="flex items-center gap-2 max-w-md mx-auto text-[10px] mt-1">
        <label className="text-muted-foreground w-16">utvalg n</label>
        <input type="range" min={1} max={50} value={n} onChange={(e) => setN(Number(e.target.value))} className="flex-1 accent-[var(--brand)]" />
        <span className="font-mono w-6 text-right">{n}</span>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="text-[10px] rounded border border-border bg-card/60 px-2 py-0.5 hover:bg-card"
        >
          ny trekning
        </button>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Gjennomsnittet av n trekninger blir mer og mer normalfordelt — selv om grunnfordelingen er flat (U).
      </figcaption>
    </figure>
  );
};

// ----- Chi-square pdf overlay (df=1,3,5,10) ---------------------------
export const ChiSquaredCurves: FC = () => {
  const W = 340;
  const H = 130;
  // chi-square pdf via series approx using log gamma is overkill — use
  // f(x; k) = (1 / (2^(k/2) * Γ(k/2))) * x^(k/2 - 1) * e^(-x/2)
  // For integer k/2 we can compute Γ.
  const gammaHalf = (k: number) => {
    // Γ(k/2): if k even, (k/2 -1)!; if odd, ((k-2)/2)!! * sqrt(pi)/2^...
    if (k % 2 === 0) return factorial(k / 2 - 1);
    // odd k: Γ(k/2) = ((k-2)!! / 2^((k-1)/2)) * sqrt(pi)
    let dd = 1;
    for (let i = k - 2; i > 0; i -= 2) dd *= i;
    return (dd / Math.pow(2, (k - 1) / 2)) * Math.sqrt(Math.PI);
  };
  const pdf = (x: number, k: number) =>
    x <= 0 ? 0 : (1 / (Math.pow(2, k / 2) * gammaHalf(k))) * Math.pow(x, k / 2 - 1) * Math.exp(-x / 2);
  const maxX = 20;
  const curves = [1, 3, 5, 10];
  const colors = ["var(--brand)", "var(--success)", "var(--brand)", "var(--success)"];
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W + 20} ${H + 20}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2={W + 10} y2={H} stroke={STROKE} />
        {curves.map((k, idx) => {
          let d = `M 10 ${H}`;
          for (let i = 0; i <= 100; i++) {
            const x = (i / 100) * maxX;
            const y = Math.min(0.3, pdf(x, k));
            const px = 10 + (x / maxX) * W;
            const py = H - y * (H - 10) * 1.6;
            d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
          }
          return (
            <path
              key={k}
              d={d}
              fill="none"
              stroke={colors[idx]}
              strokeWidth={1.5}
              opacity={0.7 + idx * 0.07}
              strokeDasharray={idx % 2 ? "3 2" : "0"}
            />
          );
        })}
        <g className="text-[9px] font-mono fill-current">
          {curves.map((k, i) => (
            <g key={k}>
              <line x1={210} y1={20 + i * 12} x2={228} y2={20 + i * 12} stroke={colors[i]} strokeDasharray={i % 2 ? "3 2" : "0"} />
              <text x={232} y={24 + i * 12}>χ²(k={k})</text>
            </g>
          ))}
        </g>
        <text x={W / 2} y={H + 14} textAnchor="middle" className="text-[10px] fill-current opacity-70">
          E[χ²]=k · Var=2k · høyreskjev, blir mer normal når k vokser
        </text>
      </svg>
    </figure>
  );
};

// ----- Student-t vs normal --------------------------------------------
export const StudentTVsNormal: FC = () => {
  const W = 340;
  const H = 130;
  const pdfT = (x: number, nu: number) => {
    // (Γ((nu+1)/2) / (sqrt(nu π) Γ(nu/2))) (1 + x²/nu)^(-(nu+1)/2)
    // We use a fixed-shape approximation for the legend visual — normalize
    // numerically so areas are comparable.
    const inner = Math.pow(1 + (x * x) / nu, -((nu + 1) / 2));
    return inner;
  };
  const normalize = (fn: (x: number) => number) => {
    let sum = 0;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = -4 + (i / N) * 8;
      sum += fn(x);
    }
    const dx = 8 / N;
    return sum * dx;
  };
  const buildPath = (fn: (x: number) => number, color: string, dashed: boolean) => {
    const Z = normalize(fn);
    let d = `M 10 ${H}`;
    for (let i = 0; i <= 100; i++) {
      const x = -4 + (i / 100) * 8;
      const y = fn(x) / Z;
      const px = 10 + ((x + 4) / 8) * W;
      const py = H - y * 220;
      d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
    }
    return <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? "4 3" : "0"} />;
  };
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W + 20} ${H + 20}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2={W + 10} y2={H} stroke={STROKE} />
        {buildPath((x) => Math.exp(-0.5 * x * x), "var(--brand)", false)}
        {buildPath((x) => pdfT(x, 3), "var(--success)", true)}
        <g className="text-[9px] font-mono fill-current">
          <line x1="220" y1="20" x2="240" y2="20" stroke="var(--brand)" strokeWidth="1.5" />
          <text x="244" y="24">N(0,1)</text>
          <line x1="220" y1="34" x2="240" y2="34" stroke="var(--success)" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="244" y="38">t(ν=3)</text>
        </g>
        <text x={W / 2} y={H + 14} textAnchor="middle" className="text-[10px] fill-current opacity-70">
          t har tyngre haler — mer sannsynlig med ekstreme verdier ved liten n
        </text>
      </svg>
    </figure>
  );
};

// ==========================================================================
// INFERENS
// ==========================================================================

// ----- Unbiased estimator: many samples, mean of means ------------------
export const UnbiasedEstimator: FC = () => {
  const [tick, setTick] = useState(0);
  const trueMu = 50;
  const sigma = 8;
  const sampleN = 8;
  // generate 30 sample means
  const meansList: number[] = [];
  for (let s = 0; s < 30; s++) {
    let m = 0;
    for (let i = 0; i < sampleN; i++) m += sampleNormal(trueMu, sigma);
    meansList.push(m / sampleN);
  }
  const avg = meansList.reduce((s, v) => s + v, 0) / meansList.length;
  void tick;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 160" className="w-full max-w-md mx-auto text-foreground">
        <line x1="20" y1="120" x2="340" y2="120" stroke={STROKE} />
        {[30, 40, 50, 60, 70].map((t) => (
          <g key={t}>
            <line x1={20 + ((t - 30) / 40) * 320} y1="118" x2={20 + ((t - 30) / 40) * 320} y2="122" stroke={STROKE} />
            <text x={20 + ((t - 30) / 40) * 320} y="134" textAnchor="middle" className="text-[9px] fill-current opacity-60">{t}</text>
          </g>
        ))}
        {/* true mu */}
        <line x1={20 + ((trueMu - 30) / 40) * 320} y1="20" x2={20 + ((trueMu - 30) / 40) * 320} y2="120" stroke="var(--success)" strokeWidth="2" />
        <text x={20 + ((trueMu - 30) / 40) * 320} y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>μ = {trueMu}</text>

        {meansList.map((m, i) => (
          <circle
            key={i}
            cx={20 + ((m - 30) / 40) * 320}
            cy={30 + (i % 6) * 12}
            r="3"
            fill="color-mix(in oklch, var(--brand) 40%, transparent)"
            stroke={STROKE}
            strokeWidth="0.4"
          />
        ))}
        <text x="180" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono">
          snitt av x̄-ene ≈ {avg.toFixed(2)} — treffer μ i snitt
        </text>
      </svg>
      <div className="text-center mt-1">
        <button
          onClick={() => setTick((t) => t + 1)}
          className="text-[10px] rounded border border-border bg-card/60 px-2 py-0.5 hover:bg-card"
        >
          ny trekning
        </button>
      </div>
    </figure>
  );
};

// ----- Confidence interval — formula visual -----------------------------
export const CIFormula: FC = () => {
  const xbar = 50;
  const moe = 3;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 150" className="w-full max-w-md mx-auto text-foreground">
        {/* normal curve faint */}
        {(() => {
          const W = 320;
          const H = 100;
          const cx = 180;
          const sigma = 35;
          let d = `M 20 ${H}`;
          for (let i = 0; i <= 60; i++) {
            const z = -3 + (i / 60) * 6;
            const x = cx + z * sigma;
            const y = H - Math.exp(-0.5 * z * z) * 60;
            d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
          }
          d += ` L ${W} ${H} Z`;
          return <path d={d} fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke="var(--brand)" strokeWidth="1" />;
        })()}
        {/* CI band */}
        <rect x={180 - 35 * 1.96 / 2} y={40} width={35 * 1.96} height={62} fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke="var(--success)" strokeDasharray="3 2" />
        <line x1="180" y1="30" x2="180" y2="102" stroke="var(--brand)" strokeWidth="2" />
        <text x="180" y="22" textAnchor="middle" className="text-[10px] fill-current font-semibold">x̄ = {xbar}</text>
        <line x1={180 - 35 * 1.96 / 2} y1="105" x2={180 + 35 * 1.96 / 2} y2="105" stroke="var(--success)" strokeWidth="2" />
        <text x="105" y="120" textAnchor="middle" className="text-[10px] fill-current font-mono">x̄ − 1.96·SE</text>
        <text x="255" y="120" textAnchor="middle" className="text-[10px] fill-current font-mono">x̄ + 1.96·SE</text>
        <text x="180" y="142" textAnchor="middle" className="text-[10px] fill-current opacity-70">
          [{(xbar - moe).toFixed(1)}, {(xbar + moe).toFixed(1)}] — 95 % CI
        </text>
      </svg>
    </figure>
  );
};

// ----- CI band — many samples, count which cover μ ----------------------
export const CIBand: FC = () => {
  const [tick, setTick] = useState(0);
  const mu = 100;
  const sigma = 10;
  const n = 30;
  const z = 1.96;
  const se = sigma / Math.sqrt(n);
  // 25 CIs
  const cis: { lo: number; hi: number; covers: boolean }[] = [];
  for (let s = 0; s < 25; s++) {
    let m = 0;
    for (let i = 0; i < n; i++) m += sampleNormal(mu, sigma);
    m /= n;
    const lo = m - z * se;
    const hi = m + z * se;
    cis.push({ lo, hi, covers: lo <= mu && mu <= hi });
  }
  const covers = cis.filter((c) => c.covers).length;
  const xOf = (v: number) => 30 + ((v - 90) / 20) * 310;
  void tick;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
        {/* μ line */}
        <line x1={xOf(mu)} y1="10" x2={xOf(mu)} y2="200" stroke="var(--success)" strokeWidth="2" />
        <text x={xOf(mu)} y="208" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>μ = {mu}</text>
        {cis.map((c, i) => {
          const y = 18 + i * 7;
          const color = c.covers ? "var(--brand)" : "var(--destructive)";
          return (
            <g key={i}>
              <line x1={xOf(c.lo)} y1={y} x2={xOf(c.hi)} y2={y} stroke={color} strokeWidth="1.5" />
              <line x1={xOf(c.lo)} y1={y - 3} x2={xOf(c.lo)} y2={y + 3} stroke={color} strokeWidth="1.5" />
              <line x1={xOf(c.hi)} y1={y - 3} x2={xOf(c.hi)} y2={y + 3} stroke={color} strokeWidth="1.5" />
              <circle cx={xOf((c.lo + c.hi) / 2)} cy={y} r="1.5" fill={color} />
            </g>
          );
        })}
      </svg>
      <div className="text-center mt-1 text-[10px]">
        <span className="font-mono">{covers} av 25 dekker μ</span>{" "}
        <button
          onClick={() => setTick((t) => t + 1)}
          className="ml-3 rounded border border-border bg-card/60 px-2 py-0.5 hover:bg-card"
        >
          nye 25 trekninger
        </button>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Hvert trinn er et 95 %-CI fra én ny stikkprøve. I lengden dekker ~95 % av båndene den sanne μ.
      </figcaption>
    </figure>
  );
};

// ----- Hypothesis test rejection regions --------------------------------
export const HypothesisRegions: FC = () => {
  const W = 360;
  const H = 130;
  const cx = W / 2;
  const sigma = 50;
  const path = (() => {
    let d = `M 10 ${H}`;
    for (let i = 0; i <= 100; i++) {
      const z = -3.5 + (i / 100) * 7;
      const x = cx + z * sigma;
      if (x < 10 || x > W - 10) continue;
      const y = H - Math.exp(-0.5 * z * z) * 100;
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L ${W - 10} ${H} Z`;
    return d;
  })();
  const buildTail = (zStart: number, sign: 1 | -1) => {
    let p = `M ${cx + zStart * sigma * sign} ${H}`;
    for (let i = 0; i <= 30; i++) {
      const z = zStart + (i / 30) * 3 * sign;
      const x = cx + z * sigma * sign;
      const y = H - Math.exp(-0.5 * z * z) * 100;
      p += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    p += ` L ${cx + (zStart + 3) * sigma * sign} ${H} Z`;
    return p;
  };
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <path d={path} fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke="var(--brand)" strokeWidth="1.5" />
        <path d={buildTail(1.96, 1)} fill="color-mix(in oklch, var(--destructive) 35%, transparent)" />
        <path d={buildTail(1.96, -1)} fill="color-mix(in oklch, var(--destructive) 35%, transparent)" />
        <line x1="10" y1={H} x2={W - 10} y2={H} stroke={STROKE} />
        {[-2, -1, 0, 1, 2].map((z) => (
          <text key={z} x={cx + z * sigma} y={H + 12} textAnchor="middle" className="text-[9px] fill-current opacity-60">
            {z === 0 ? "0" : `${z > 0 ? "+" : ""}${z}`}
          </text>
        ))}
        <text x={cx - sigma * 2.5} y={H - 6} textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--destructive)" }}>α/2</text>
        <text x={cx + sigma * 2.5} y={H - 6} textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--destructive)" }}>α/2</text>
        <text x={cx} y="40" textAnchor="middle" className="text-[10px] fill-current font-semibold">behold H₀</text>
        <text x={cx} y={H + 26} textAnchor="middle" className="text-[10px] fill-current font-mono">
          tosidig test ved α=0.05 ⇒ |z| &gt; 1.96 forkaster H₀
        </text>
      </svg>
    </figure>
  );
};

// ----- Type I / Type II errors as overlapping distributions -------------
export const TypeIandII: FC = () => {
  const [delta, setDelta] = useState(2);
  const W = 360;
  const H = 140;
  const cx = 130;
  const sigma = 40;
  const z = 1.645;
  const crit = cx + z * sigma;
  const pathFor = (mu0: number, color: string) => {
    let d = `M 10 ${H - 10}`;
    for (let i = 0; i <= 100; i++) {
      const zz = -3 + (i / 100) * 6;
      const x = mu0 + zz * sigma;
      if (x < 10 || x > W - 10) continue;
      const y = H - 10 - Math.exp(-0.5 * zz * zz) * 90;
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L ${W - 10} ${H - 10} Z`;
    return <path d={d} fill={`color-mix(in oklch, ${color} 15%, transparent)`} stroke={color} strokeWidth="1.4" />;
  };
  // alpha region (right of crit, under H0)
  const buildAlpha = () => {
    let p = `M ${crit} ${H - 10}`;
    for (let i = 0; i <= 30; i++) {
      const zz = z + (i / 30) * 3;
      const x = cx + zz * sigma;
      const y = H - 10 - Math.exp(-0.5 * zz * zz) * 90;
      p += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    p += ` L ${cx + (z + 3) * sigma} ${H - 10} Z`;
    return p;
  };
  const muA = cx + delta * sigma;
  // beta region (left of crit, under H1)
  const buildBeta = () => {
    let p = `M ${cx + (delta - 3) * sigma} ${H - 10}`;
    const start = -3;
    const end = (crit - muA) / sigma;
    for (let i = 0; i <= 30; i++) {
      const zz = start + (i / 30) * (end - start);
      const x = muA + zz * sigma;
      const y = H - 10 - Math.exp(-0.5 * zz * zz) * 90;
      p += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    p += ` L ${crit} ${H - 10} Z`;
    return p;
  };
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full max-w-md mx-auto text-foreground">
        {pathFor(cx, "var(--brand)")}
        {pathFor(muA, "var(--success)")}
        <path d={buildAlpha()} fill="color-mix(in oklch, var(--destructive) 35%, transparent)" />
        <path d={buildBeta()} fill="color-mix(in oklch, var(--muted) 60%, transparent)" />
        <line x1="10" y1={H - 10} x2={W - 10} y2={H - 10} stroke={STROKE} />
        <line x1={crit} y1="10" x2={crit} y2={H - 10} stroke={STROKE} strokeDasharray="3 2" />
        <text x={cx} y="22" textAnchor="middle" className="text-[10px] fill-current font-semibold">H₀</text>
        <text x={muA} y="22" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>H₁</text>
        <text x={crit} y={H + 12} textAnchor="middle" className="text-[9px] fill-current font-mono">krit.</text>
        <text x={crit + 28} y={H - 80} className="text-[10px] fill-current font-semibold" style={{ fill: "var(--destructive)" }}>α</text>
        <text x={crit - 35} y={H - 60} className="text-[10px] fill-current opacity-70">β</text>
        <text x={muA + 50} y={H - 100} className="text-[9px] fill-current opacity-60">styrke = 1−β</text>
      </svg>
      <div className="flex items-center gap-2 max-w-xs mx-auto text-[10px]">
        <label className="text-muted-foreground w-16">effekt Δ</label>
        <input type="range" min={5} max={45} value={Math.round(delta * 10)} onChange={(e) => setDelta(Number(e.target.value) / 10)} className="flex-1 accent-[var(--brand)]" />
        <span className="font-mono w-9 text-right">{delta.toFixed(1)}σ</span>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        α = falsk alarm under H₀. β = vi misser effekten under H₁. Større effekt eller mer data ⇒ mindre β.
      </figcaption>
    </figure>
  );
};

// ----- p-value: shade area more extreme than observed -------------------
export const PValueArea: FC = () => {
  const [tObs, setTObs] = useState(1.6);
  const W = 340;
  const H = 130;
  const cx = W / 2;
  const sigma = 45;
  const pathBase = (() => {
    let d = `M 10 ${H}`;
    for (let i = 0; i <= 100; i++) {
      const z = -3.5 + (i / 100) * 7;
      const x = cx + z * sigma;
      if (x < 10 || x > W - 10) continue;
      const y = H - Math.exp(-0.5 * z * z) * 100;
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    d += ` L ${W - 10} ${H} Z`;
    return d;
  })();
  const buildShade = (sign: 1 | -1) => {
    let p = `M ${cx + tObs * sigma * sign} ${H}`;
    const start = tObs * sign;
    const end = 3.5 * sign;
    for (let i = 0; i <= 30; i++) {
      const z = start + (i / 30) * (end - start);
      const x = cx + z * sigma;
      const y = H - Math.exp(-0.5 * z * z) * 100;
      p += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    p += ` L ${cx + 3.5 * sigma * sign} ${H} Z`;
    return p;
  };
  const pTwo = 2 * (1 - normalCdf(Math.abs(tObs)));
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W + 10} ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <path d={pathBase} fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke="var(--brand)" strokeWidth="1.4" />
        <path d={buildShade(1)} fill="color-mix(in oklch, var(--destructive) 35%, transparent)" />
        <path d={buildShade(-1)} fill="color-mix(in oklch, var(--destructive) 35%, transparent)" />
        <line x1="10" y1={H} x2={W - 10} y2={H} stroke={STROKE} />
        <line x1={cx + tObs * sigma} y1="10" x2={cx + tObs * sigma} y2={H} stroke="var(--destructive)" strokeWidth="1.4" />
        <text x={cx + tObs * sigma} y="20" textAnchor="middle" className="text-[10px] fill-current font-mono" style={{ fill: "var(--destructive)" }}>
          obs = {tObs.toFixed(2)}
        </text>
        <text x={W / 2} y={H + 16} textAnchor="middle" className="text-[10px] fill-current font-mono">
          tosidig p ≈ {pTwo.toFixed(3)}
        </text>
        <text x={W / 2} y={H + 28} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          p = areal av {`{|Z| ≥ |obs|}`} under H₀
        </text>
      </svg>
      <div className="flex items-center gap-2 max-w-xs mx-auto text-[10px]">
        <label className="text-muted-foreground w-14">|obs|</label>
        <input type="range" min={1} max={32} value={Math.round(tObs * 10)} onChange={(e) => setTObs(Number(e.target.value) / 10)} className="flex-1 accent-[var(--brand)]" />
        <span className="font-mono w-9 text-right">{tObs.toFixed(1)}</span>
      </div>
    </figure>
  );
};

// ----- t-test schematic -------------------------------------------------
export const TTestSchematic: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="20" width="120" height="50" rx="4" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="70" y="40" textAnchor="middle" className="text-[10px] fill-current font-semibold">Data</text>
      <text x="70" y="56" textAnchor="middle" className="text-[9px] fill-current font-mono">x̄, s, n</text>

      <rect x="150" y="100" width="80" height="40" rx="4" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} />
      <text x="190" y="118" textAnchor="middle" className="text-[10px] fill-current font-semibold">H₀: μ = μ₀</text>
      <text x="190" y="132" textAnchor="middle" className="text-[9px] fill-current opacity-70">antakelse</text>

      <line x1="130" y1="60" x2="245" y2="60" stroke={STROKE} markerEnd="url(#tArr)" />
      <line x1="190" y1="100" x2="245" y2="80" stroke={STROKE} markerEnd="url(#tArr)" />
      <rect x="245" y="40" width="120" height="46" rx="4" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="305" y="58" textAnchor="middle" className="text-[10px] fill-current font-mono">t = (x̄ − μ₀)</text>
      <text x="305" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono">    / (s/√n)</text>

      <line x1="305" y1="86" x2="305" y2="115" stroke={STROKE} markerEnd="url(#tArr)" />
      <rect x="240" y="115" width="130" height="50" rx="4" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="305" y="134" textAnchor="middle" className="text-[10px] fill-current">Slå opp i t(n−1)</text>
      <text x="305" y="150" textAnchor="middle" className="text-[9px] fill-current opacity-70">→ p-verdi → konkluder</text>

      <defs>
        <marker id="tArr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
  </figure>
);

// ----- Two-sample t-test: two histograms ------------------------------
export const TwoSampleT: FC = () => {
  // pre-generated samples for determinism
  const s1 = [9, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
  const s2 = [12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18];
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const m1 = mean(s1);
  const m2 = mean(s2);
  const min = 8;
  const max = 20;
  const W = 320;
  const H = 80;
  const xOf = (v: number) => 20 + ((v - min) / (max - min)) * W;
  const histogram = (arr: number[], baseY: number, color: string) => {
    const bins = 12;
    const counts = new Array(bins).fill(0) as number[];
    for (const v of arr) counts[Math.min(bins - 1, Math.max(0, Math.floor(((v - min) / (max - min)) * bins)))]++;
    const peak = Math.max(...counts);
    return counts.map((c, i) => {
      const bw = W / bins;
      const x = 20 + i * bw;
      const h = (c / peak) * (H - 20);
      return (
        <rect
          key={i}
          x={x + 0.5}
          y={baseY - h}
          width={bw - 1}
          height={h}
          fill={`color-mix(in oklch, ${color} 25%, transparent)`}
          stroke={color}
          strokeWidth="0.6"
        />
      );
    });
  };
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W + 30} ${H * 2 + 30}`} className="w-full max-w-md mx-auto text-foreground">
        {histogram(s1, H, "var(--brand)")}
        <line x1={xOf(m1)} y1={H - 60} x2={xOf(m1)} y2={H} stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={xOf(m1) + 4} y={H - 50} className="text-[9px] fill-current font-mono" style={{ fill: "var(--brand)" }}>
          x̄₁={m1.toFixed(1)}
        </text>
        {histogram(s2, H * 2, "var(--success)")}
        <line x1={xOf(m2)} y1={H + 20} x2={xOf(m2)} y2={H * 2} stroke="var(--success)" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={xOf(m2) + 4} y={H + 30} className="text-[9px] fill-current font-mono" style={{ fill: "var(--success)" }}>
          x̄₂={m2.toFixed(1)}
        </text>
        <line x1="20" y1={H * 2} x2={W + 20} y2={H * 2} stroke={STROKE} />
        <text x={W / 2 + 10} y={H * 2 + 18} textAnchor="middle" className="text-[10px] fill-current font-mono">
          t = (x̄₁ − x̄₂) / SE_pooled
        </text>
      </svg>
    </figure>
  );
};

// ----- Chi-square test: contingency table with O and E -----------------
export const ChiSquareContingency: FC = () => {
  const observed = [
    [30, 40, 30],
    [20, 20, 60],
  ];
  const rowTot = observed.map((r) => r.reduce((s, v) => s + v, 0));
  const colTot = observed[0].map((_, j) => observed.reduce((s, r) => s + r[j], 0));
  const tot = rowTot.reduce((s, v) => s + v, 0);
  const expected = observed.map((r, i) => r.map((_, j) => (rowTot[i] * colTot[j]) / tot));
  let chi = 0;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) chi += Math.pow(observed[i][j] - expected[i][j], 2) / expected[i][j];
  return (
    <figure className="my-4">
      <div className="text-[10px]">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-muted/40">
              <th className="border border-border px-2 py-1"></th>
              <th className="border border-border px-2 py-1">A</th>
              <th className="border border-border px-2 py-1">B</th>
              <th className="border border-border px-2 py-1">C</th>
              <th className="border border-border px-2 py-1 font-mono opacity-70">total</th>
            </tr>
          </thead>
          <tbody>
            {observed.map((row, i) => (
              <tr key={i}>
                <td className="border border-border px-2 py-1 font-semibold">{["Gruppe 1", "Gruppe 2"][i]}</td>
                {row.map((O, j) => (
                  <td key={j} className="border border-border px-1 py-1 font-mono">
                    <div>{O}</div>
                    <div className="text-[8px] opacity-60">E={expected[i][j].toFixed(1)}</div>
                  </td>
                ))}
                <td className="border border-border px-2 py-1 font-mono opacity-70">{rowTot[i]}</td>
              </tr>
            ))}
            <tr className="bg-muted/30">
              <td className="border border-border px-2 py-1 font-mono opacity-70">total</td>
              {colTot.map((c, i) => <td key={i} className="border border-border px-2 py-1 font-mono opacity-70">{c}</td>)}
              <td className="border border-border px-2 py-1 font-mono opacity-70">{tot}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-center text-[11px] font-mono mt-2">
          χ² = Σ (O − E)² / E = <span className="font-semibold text-[var(--brand)]">{chi.toFixed(2)}</span> · df = (2−1)(3−1) = 2
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        E_ij = (radtotal · kolonnetotal) / total. Stort χ² ⇒ O ligger langt fra E ⇒ avhengighet.
      </figcaption>
    </figure>
  );
};

// ----- CI interpretation: 95 % of long-run CIs cover μ (animated frames) ----
export const CIInterpretation: FC = () => {
  const [autoTick, setAutoTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAutoTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);
  const mu = 50;
  const sigma = 10;
  const n = 25;
  const z = 1.96;
  const se = sigma / Math.sqrt(n);
  // 12 CIs
  const cis: { lo: number; hi: number; covers: boolean }[] = [];
  for (let s = 0; s < 12; s++) {
    let m = 0;
    for (let i = 0; i < n; i++) m += sampleNormal(mu, sigma);
    m /= n;
    cis.push({ lo: m - z * se, hi: m + z * se, covers: Math.abs(m - mu) < z * se });
  }
  const covers = cis.filter((c) => c.covers).length;
  const xOf = (v: number) => 30 + ((v - 40) / 20) * 310;
  void autoTick;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
        <line x1={xOf(mu)} y1="10" x2={xOf(mu)} y2="170" stroke="var(--success)" strokeWidth="2" />
        <text x={xOf(mu)} y="178" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>μ (fast)</text>
        {cis.map((c, i) => {
          const y = 16 + i * 12;
          const color = c.covers ? "var(--brand)" : "var(--destructive)";
          return (
            <g key={i}>
              <line x1={xOf(c.lo)} y1={y} x2={xOf(c.hi)} y2={y} stroke={color} strokeWidth="1.6" />
              <line x1={xOf(c.lo)} y1={y - 3} x2={xOf(c.lo)} y2={y + 3} stroke={color} strokeWidth="1.6" />
              <line x1={xOf(c.hi)} y1={y - 3} x2={xOf(c.hi)} y2={y + 3} stroke={color} strokeWidth="1.6" />
            </g>
          );
        })}
        <text x={340} y={16} textAnchor="end" className="text-[9px] fill-current font-mono">{covers}/12 dekker</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        μ er fast. CIENE er tilfeldige. 95 %-tolkningen handler om hvor mange CI som dekker μ over mange gjentakelser.
      </figcaption>
    </figure>
  );
};

// ==========================================================================
// PROPORSJONER
// ==========================================================================

// ----- Sampling distribution of p̂ (normal approximation) ---------------
export const PropSamplingDist: FC = () => {
  const [p, setP] = useState(0.3);
  const [n, setN] = useState(100);
  const sigma = Math.sqrt((p * (1 - p)) / n);
  const W = 340;
  const H = 110;
  let d = `M 10 ${H}`;
  for (let i = 0; i <= 80; i++) {
    const x = i / 80;
    const y = normalPdf(x, p, sigma);
    const px = 10 + x * W;
    const py = Math.max(8, H - y * 5);
    d += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
  }
  d += ` L ${10 + W} ${H} Z`;
  const ok = n * p >= 10 && n * (1 - p) >= 10;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W + 20} ${H + 30}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="10" y1={H} x2={W + 10} y2={H} stroke={STROKE} />
        <path d={d} fill={`color-mix(in oklch, ${ok ? "var(--brand)" : "var(--destructive)"} 22%, transparent)`} stroke={ok ? "var(--brand)" : "var(--destructive)"} strokeWidth="1.5" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={10 + t * W} y1={H} x2={10 + t * W} y2={H + 3} stroke={STROKE} />
            <text x={10 + t * W} y={H + 14} textAnchor="middle" className="text-[9px] fill-current opacity-60">{t}</text>
          </g>
        ))}
        <line x1={10 + p * W} y1={20} x2={10 + p * W} y2={H} stroke="var(--success)" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={10 + p * W} y="16" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>p = {p.toFixed(2)}</text>
        <text x={W / 2 + 10} y={H + 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
          {ok ? "CLT-OK" : "CLT BRUTT"} · SE = √(p(1−p)/n) = {sigma.toFixed(3)}
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-[10px] mt-1">
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground w-4">p</label>
          <input type="range" min={1} max={99} value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)} className="flex-1 accent-[var(--brand)]" />
          <span className="font-mono w-9 text-right">{p.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-muted-foreground w-4">n</label>
          <input type="range" min={5} max={500} value={n} onChange={(e) => setN(Number(e.target.value))} className="flex-1 accent-[var(--brand)]" />
          <span className="font-mono w-12 text-right">{n}</span>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Krever np ≥ 10 OG n(1−p) ≥ 10. Liten n eller ekstreme p ⇒ tilnærmingen feiler.
      </figcaption>
    </figure>
  );
};

// ----- Wald vs Wilson CI comparison ---------------------------------------
export const WaldVsWilson: FC = () => {
  const samples = [
    { n: 20, x: 0 },
    { n: 20, x: 2 },
    { n: 100, x: 50 },
    { n: 100, x: 95 },
    { n: 500, x: 250 },
  ];
  // Wilson CI (95 %)
  const wilson = (x: number, n: number) => {
    const z = 1.96;
    const ph = x / n;
    const denom = 1 + (z * z) / n;
    const center = (ph + (z * z) / (2 * n)) / denom;
    const margin = (z / denom) * Math.sqrt((ph * (1 - ph)) / n + (z * z) / (4 * n * n));
    return [center - margin, center + margin];
  };
  const wald = (x: number, n: number) => {
    const z = 1.96;
    const ph = x / n;
    const se = Math.sqrt((ph * (1 - ph)) / n);
    return [ph - z * se, ph + z * se];
  };
  const xOf = (v: number) => 20 + Math.max(0, Math.min(1, v)) * 320;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
        <line x1="20" y1="180" x2="340" y2="180" stroke={STROKE} />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={xOf(t)} y1={178} x2={xOf(t)} y2={182} stroke={STROKE} />
            <text x={xOf(t)} y={194} textAnchor="middle" className="text-[9px] fill-current opacity-60">{t}</text>
          </g>
        ))}
        {samples.map((s, i) => {
          const [wL, wH] = wilson(s.x, s.n);
          const [aL, aH] = wald(s.x, s.n);
          const y = 16 + i * 30;
          return (
            <g key={i}>
              <text x={4} y={y + 8} className="text-[9px] fill-current font-mono">{s.x}/{s.n}</text>
              <line x1={xOf(aL)} y1={y} x2={xOf(aH)} y2={y} stroke="var(--destructive)" strokeWidth="2" />
              <line x1={xOf(aL)} y1={y - 3} x2={xOf(aL)} y2={y + 3} stroke="var(--destructive)" strokeWidth="2" />
              <line x1={xOf(aH)} y1={y - 3} x2={xOf(aH)} y2={y + 3} stroke="var(--destructive)" strokeWidth="2" />
              <line x1={xOf(wL)} y1={y + 10} x2={xOf(wH)} y2={y + 10} stroke="var(--success)" strokeWidth="2" />
              <line x1={xOf(wL)} y1={y + 7} x2={xOf(wL)} y2={y + 13} stroke="var(--success)" strokeWidth="2" />
              <line x1={xOf(wH)} y1={y + 7} x2={xOf(wH)} y2={y + 13} stroke="var(--success)" strokeWidth="2" />
            </g>
          );
        })}
        <g className="text-[9px] fill-current font-mono">
          <line x1="240" y1="10" x2="260" y2="10" stroke="var(--destructive)" strokeWidth="2" />
          <text x="264" y="13">Wald</text>
          <line x1="240" y1="22" x2="260" y2="22" stroke="var(--success)" strokeWidth="2" />
          <text x="264" y="25">Wilson</text>
        </g>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Ved p̂ nær 0 eller 1 kollapser Wald-CI. Wilson holder seg innenfor [0,1] og er asymmetrisk.
      </figcaption>
    </figure>
  );
};

// ----- Sample-size formula visual ----------------------------------------
export const SampleSizeMargin: FC = () => {
  const ns = [100, 400, 1000, 2500];
  const margins = ns.map((n) => (1.96 * Math.sqrt(0.25 / n)) * 100);
  return (
    <figure className="my-4">
      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
        {ns.map((n, i) => (
          <div key={n} className="rounded border border-border bg-card/40 p-2">
            <div className="font-mono font-semibold">n = {n}</div>
            <div className="text-[10px] text-muted-foreground mt-1">margin ≈</div>
            <div className="text-[14px] font-mono font-semibold" style={{ color: "var(--brand)" }}>±{margins[i].toFixed(1)}%</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        n = z²·p̂(1−p̂)/E². Marginen krymper med √n — fire ganger så stor utvalg halverer feilen.
      </figcaption>
    </figure>
  );
};

// ----- OR vs RR — when they diverge --------------------------------------
export const OrVsRr: FC = () => {
  // build table for varying p2 and constant ratio between groups
  const rows = [
    { p1: 0.02, p2: 0.01 },
    { p1: 0.1, p2: 0.05 },
    { p1: 0.4, p2: 0.2 },
    { p1: 0.8, p2: 0.4 },
  ];
  return (
    <figure className="my-4">
      <table className="text-[10px] w-full border-collapse text-center">
        <thead>
          <tr className="bg-muted/40">
            <th className="border border-border px-1.5 py-0.5">p₁</th>
            <th className="border border-border px-1.5 py-0.5">p₂</th>
            <th className="border border-border px-1.5 py-0.5">RR = p₁/p₂</th>
            <th className="border border-border px-1.5 py-0.5">OR</th>
            <th className="border border-border px-1.5 py-0.5">OR / RR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const rr = r.p1 / r.p2;
            const or = (r.p1 / (1 - r.p1)) / (r.p2 / (1 - r.p2));
            return (
              <tr key={r.p1}>
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.p1}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono">{r.p2}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono">{rr.toFixed(2)}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono">{or.toFixed(2)}</td>
                <td className="border border-border px-1.5 py-0.5 font-mono" style={{ color: or / rr > 1.4 ? "var(--destructive)" : "inherit" }}>
                  {(or / rr).toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Når p er liten: OR ≈ RR. Når p vokser: OR overdriver effekten.
      </figcaption>
    </figure>
  );
};

// ----- Pooled vs unpooled SE summary -------------------------------------
export const PooledVsUnpooled: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-2 gap-3 text-[10px]">
      <div className="rounded border-2 border-brand/40 p-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-center" style={{ color: "var(--brand)" }}>
          KI for p₁ − p₂
        </div>
        <div className="font-mono text-center text-[11px] mb-1">UNPOOLED</div>
        <pre className="text-[9.5px] font-mono whitespace-pre-wrap leading-relaxed">{`SE = √(p̂₁(1−p̂₁)/n₁
   + p̂₂(1−p̂₂)/n₂)

→ ulike p̂ᵢ — ingen
   antakelse om likhet`}</pre>
      </div>
      <div className="rounded border-2 border-success/40 p-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-center" style={{ color: "var(--success)" }}>
          Test av H₀: p₁ = p₂
        </div>
        <div className="font-mono text-center text-[11px] mb-1">POOLED</div>
        <pre className="text-[9.5px] font-mono whitespace-pre-wrap leading-relaxed">{`p̂ = (x₁+x₂)/(n₁+n₂)
SE = √(p̂(1−p̂)
    · (1/n₁ + 1/n₂))

→ under H₀ er p like —
   samme p estimeres`}</pre>
      </div>
    </div>
  </figure>
);

// ==========================================================================
// REGISTRY
// ==========================================================================

export const STAT_FORD_VISUALS: Record<string, FC> = {
  // Deskriptiv
  "stat-ford-mean-vs-median": MeanVsMedian,
  "stat-ford-variance-squares": VarianceSquares,
  "stat-ford-boxplot-anatomy": BoxplotAnatomy,
  "stat-ford-skewness": SkewnessGallery,
  "stat-ford-histogram-bins": HistogramBins,
  // Sannsynlighet
  "stat-ford-prob-axioms": ProbAxioms,
  "stat-ford-inclusion-exclusion": InclusionExclusion,
  "stat-ford-conditional": ConditionalProb,
  "stat-ford-bayes-tree": BayesTree,
  "stat-ford-independence": Independence,
  "stat-ford-total-prob": TotalProbability,
  // Kombinatorikk
  "stat-ford-perm-tree": PermutationTree,
  "stat-ford-comb-grid": CombinationGrid,
  "stat-ford-perm-vs-comb": PermVsComb,
  // Fordelinger
  "stat-ford-rv-pmf-pdf": RandomVariablePmfPdf,
  "stat-ford-expected-balance": ExpectedValueBalance,
  "stat-ford-bernoulli": BernoulliBars,
  "stat-ford-binomial": BinomialPMF,
  "stat-ford-poisson": PoissonPMF,
  "stat-ford-poisson-vs-binomial": PoissonVsBinomial,
  "stat-ford-hypergeom": HypergeometricUrn,
  "stat-ford-uniform": UniformPDF,
  "stat-ford-exponential": ExponentialPDF,
  "stat-ford-normal": NormalCurve,
  "stat-ford-standardize": Standardization,
  "stat-ford-clt": CltAnimation,
  "stat-ford-chi2": ChiSquaredCurves,
  "stat-ford-t-vs-normal": StudentTVsNormal,
  // Inferens
  "stat-ford-unbiased": UnbiasedEstimator,
  "stat-ford-ci-formula": CIFormula,
  "stat-ford-ci-band": CIBand,
  "stat-ford-ci-interpretation": CIInterpretation,
  "stat-ford-hypothesis-regions": HypothesisRegions,
  "stat-ford-type-i-ii": TypeIandII,
  "stat-ford-p-value": PValueArea,
  "stat-ford-t-test": TTestSchematic,
  "stat-ford-two-sample-t": TwoSampleT,
  "stat-ford-chi2-test": ChiSquareContingency,
  // Proporsjoner
  "stat-ford-prop-sampling": PropSamplingDist,
  "stat-ford-wald-vs-wilson": WaldVsWilson,
  "stat-ford-sample-size": SampleSizeMargin,
  "stat-ford-or-vs-rr": OrVsRr,
  "stat-ford-pooled-vs-unpooled": PooledVsUnpooled,
};
