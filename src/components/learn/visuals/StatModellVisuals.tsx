// Visuelle komponenter for statistikk-modeller og diagnostikk-flashcards.
// Topics: Regresjon, Regresjon-diagnostikk, ANOVA, CV-varianter,
// Logistisk regresjon, LDA-QDA-NB. Alle komponenter er tema-aware SVG
// (text-foreground + currentColor stroke) i en <figure> med <figcaption>.

import { useEffect, useState, type FC } from "react";

const STROKE = "currentColor";

// ====================================================================
// SMÅ HJELPERE
// ====================================================================

const BRAND = (a: number) => `color-mix(in oklch, var(--brand) ${a}%, transparent)`;
const SUCCESS = (a: number) => `color-mix(in oklch, var(--success) ${a}%, transparent)`;
const DESTR = (a: number) => `color-mix(in oklch, var(--destructive) ${a}%, transparent)`;
const MUTED = (a: number) => `color-mix(in oklch, var(--muted) ${a}%, transparent)`;

// ====================================================================
// REGRESJON
// ====================================================================

// ---------- Pearson r — tre scatter-plott med ulik korrelasjon -----
export const PearsonR: FC = () => {
  // Deterministiske "pseudo-tilfeldige" punkter (samme hver render).
  const seed = (n: number) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const makePoints = (rho: number, count = 24) => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const u = seed(i * 3 + 1);
      const v = seed(i * 7 + 2);
      const x = u;
      const noise = v - 0.5;
      const y = rho * (x - 0.5) + 0.5 + (1 - Math.abs(rho)) * noise * 0.8;
      pts.push({ x, y: Math.max(0.02, Math.min(0.98, y)) });
    }
    return pts;
  };
  const renderPanel = (rho: number, label: string) => {
    const pts = makePoints(rho);
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 100 100" className="w-full max-w-[120px] text-foreground">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke={STROKE} strokeWidth="0.5" />
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x * 100}
              cy={100 - p.y * 100}
              r="1.6"
              fill={BRAND(60)}
              stroke={STROKE}
              strokeWidth="0.3"
            />
          ))}
        </svg>
        <div className="text-[10px] font-mono mt-1">r ≈ {rho.toFixed(2)}</div>
        <div className="text-[9px] text-muted-foreground">{label}</div>
      </div>
    );
  };
  return (
    <figure className="my-4">
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {renderPanel(0.95, "sterk positiv")}
        {renderPanel(0.0, "ingen lineær")}
        {renderPanel(-0.85, "sterk negativ")}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Pearson r måler styrken på lineær sammenheng — r = 0 betyr ikke
        «ingen sammenheng», bare ingen lineær.
      </figcaption>
    </figure>
  );
};

// ---------- OLS-fit med scatter, linje og residual-linjer ----------
export const OlsFit: FC = () => {
  // Punkter i data-koordinater (x, y) i [0,10] x [0,10].
  const pts = [
    { x: 1, y: 1.5 },
    { x: 1.8, y: 3.0 },
    { x: 2.5, y: 2.6 },
    { x: 3.2, y: 4.1 },
    { x: 4.0, y: 4.4 },
    { x: 4.8, y: 5.6 },
    { x: 5.5, y: 5.3 },
    { x: 6.2, y: 7.0 },
    { x: 7.0, y: 6.8 },
    { x: 7.8, y: 8.4 },
    { x: 8.5, y: 8.0 },
    { x: 9.2, y: 9.5 },
  ];
  // Beregn OLS β̂.
  const xBar = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const yBar = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const num = pts.reduce((s, p) => s + (p.x - xBar) * (p.y - yBar), 0);
  const den = pts.reduce((s, p) => s + (p.x - xBar) ** 2, 0);
  const b1 = num / den;
  const b0 = yBar - b1 * xBar;
  const fx = (x: number) => b0 + b1 * x;
  // SVG: x ∈ [0,10] → [40, 360]; y ∈ [0,10] → [180, 20].
  const X = (x: number) => 40 + x * 32;
  const Y = (y: number) => 180 - y * 16;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
        {/* akser */}
        <line x1="40" y1="180" x2="370" y2="180" stroke={STROKE} strokeWidth="1" />
        <line x1="40" y1="20" x2="40" y2="180" stroke={STROKE} strokeWidth="1" />
        <text x="370" y="195" textAnchor="end" className="text-[9px] fill-current opacity-70">x</text>
        <text x="30" y="25" textAnchor="end" className="text-[9px] fill-current opacity-70">y</text>
        {/* residual-linjer (vertikale strek) */}
        {pts.map((p, i) => (
          <line
            key={`r-${i}`}
            x1={X(p.x)}
            y1={Y(p.y)}
            x2={X(p.x)}
            y2={Y(fx(p.x))}
            stroke={DESTR(80).replace("transparent", "transparent")}
            strokeOpacity="0.55"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        ))}
        {/* regresjonslinje */}
        <line
          x1={X(0)}
          y1={Y(fx(0))}
          x2={X(10)}
          y2={Y(fx(10))}
          stroke={STROKE}
          strokeWidth="1.8"
        />
        {/* punkter */}
        {pts.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={X(p.x)}
            cy={Y(p.y)}
            r="3"
            fill={BRAND(70)}
            stroke={STROKE}
            strokeWidth="0.6"
          />
        ))}
        {/* (x̄, ȳ) */}
        <circle cx={X(xBar)} cy={Y(yBar)} r="4" fill={SUCCESS(85)} stroke={STROKE} strokeWidth="1" />
        <text x={X(xBar) + 6} y={Y(yBar) - 6} className="text-[9px] fill-current font-mono">(x̄, ȳ)</text>
        {/* formel */}
        <text x="200" y="210" textAnchor="middle" className="text-[10px] fill-current font-mono">
          ŷ = {b0.toFixed(2)} + {b1.toFixed(2)}·x — minimerer Σ(y − ŷ)²
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Minste kvadraters metode — linjen som minimerer summen av kvadrerte
        vertikale residualer (stiplede streker).
      </figcaption>
    </figure>
  );
};

// ---------- R² — variansdekomposisjon SS_tot = SS_reg + SS_res ----
export const RSquaredDecomp: FC = () => {
  const SS_reg = 72;
  const SS_res = 28;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
        <text x="180" y="18" textAnchor="middle" className="text-[11px] fill-current font-semibold">
          SS_total = SS_regresjon + SS_residual
        </text>
        {/* SS_tot bar */}
        <text x="20" y="55" className="text-[10px] fill-current font-mono">SS_tot</text>
        <rect x="70" y="42" width="270" height="22" fill={MUTED(55)} stroke={STROKE} strokeWidth="1" />
        <text x="205" y="58" textAnchor="middle" className="text-[10px] fill-current font-mono">100 %</text>
        {/* SS_reg + SS_res stack */}
        <text x="20" y="105" className="text-[10px] fill-current font-mono">stack</text>
        <rect
          x="70"
          y="92"
          width={270 * (SS_reg / 100)}
          height="22"
          fill={SUCCESS(45)}
          stroke={STROKE}
          strokeWidth="1"
        />
        <rect
          x={70 + 270 * (SS_reg / 100)}
          y="92"
          width={270 * (SS_res / 100)}
          height="22"
          fill={DESTR(35)}
          stroke={STROKE}
          strokeWidth="1"
        />
        <text x={70 + 135 * (SS_reg / 100)} y="108" textAnchor="middle" className="text-[10px] fill-current font-mono">
          SS_reg ({SS_reg} %)
        </text>
        <text
          x={70 + 270 * (SS_reg / 100) + 135 * (SS_res / 100)}
          y="108"
          textAnchor="middle"
          className="text-[10px] fill-current font-mono"
        >
          res ({SS_res} %)
        </text>
        {/* R² konklusjon */}
        <text x="180" y="148" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">
          R² = SS_reg / SS_tot = {(SS_reg / 100).toFixed(2)}
        </text>
        <text x="180" y="165" textAnchor="middle" className="text-[10px] fill-current opacity-70">
          {SS_reg} % av variasjonen i y forklares av modellen
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        R² er bare brøken av variansen modellen klarte å forklare.
      </figcaption>
    </figure>
  );
};

// ---------- Residual-plot: god vs. heteroskedastisk vs. kurvatur vs outlier ----
export const ResidualPatterns: FC = () => {
  const seed = (n: number) => {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const makeGood = (i: number) => (seed(i) - 0.5) * 1.5;
  const makeHetero = (i: number, x: number) => (seed(i) - 0.5) * (0.4 + x * 1.8);
  const makeCurve = (x: number, i: number) => (x - 0.5) * (x - 0.5) * 4 - 0.4 + (seed(i) - 0.5) * 0.3;
  const makeOutlier = (i: number) => {
    if (i === 9) return 2.6; // én sterk outlier
    return (seed(i) - 0.5) * 1.2;
  };
  const panels: { title: string; fn: (i: number, x: number) => number; subtitle: string; ok: boolean }[] = [
    { title: "OK", fn: (i) => makeGood(i), subtitle: "tilfeldig sky rundt 0", ok: true },
    { title: "Heteroskedastisitet", fn: (i, x) => makeHetero(i, x), subtitle: "trakt — varians vokser", ok: false },
    { title: "Ikke-linearitet", fn: (i, x) => makeCurve(x, i), subtitle: "U/krumning i residualer", ok: false },
    { title: "Outlier", fn: (i) => makeOutlier(i), subtitle: "ett punkt langt unna", ok: false },
  ];
  const n = 22;
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {panels.map((pan, pi) => (
          <div key={pan.title} className="text-center">
            <svg viewBox="0 0 100 70" className="w-full text-foreground">
              <rect x="2" y="2" width="96" height="66" fill="none" stroke={STROKE} strokeWidth="0.5" />
              {/* y=0 linje */}
              <line x1="2" y1="35" x2="98" y2="35" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
              {Array.from({ length: n }).map((_, i) => {
                const x = (i + 0.5) / n;
                const r = pan.fn(i + pi * 100, x);
                const cy = Math.max(4, Math.min(66, 35 - r * 12));
                return (
                  <circle
                    key={i}
                    cx={4 + x * 92}
                    cy={cy}
                    r="1.5"
                    fill={pan.ok ? SUCCESS(70) : DESTR(70)}
                    stroke={STROKE}
                    strokeWidth="0.3"
                  />
                );
              })}
            </svg>
            <div className={`text-[10px] mt-1 font-semibold ${pan.ok ? "text-success" : "text-destructive"}`}>
              {pan.title}
            </div>
            <div className="text-[9px] text-muted-foreground">{pan.subtitle}</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Residualplott er hovedverktøyet for å sjekke OLS-antakelsene.
      </figcaption>
    </figure>
  );
};

// ---------- Korrelasjon vs. kausalitet — spurious -------------------
export const CorrVsCausation: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Tre noder */}
      <circle cx="60" cy="60" r="28" fill={BRAND(20)} stroke={STROKE} strokeWidth="1.5" />
      <text x="60" y="64" textAnchor="middle" className="text-[10px] fill-current font-semibold">Iskrem</text>

      <circle cx="320" cy="60" r="28" fill={BRAND(20)} stroke={STROKE} strokeWidth="1.5" />
      <text x="320" y="64" textAnchor="middle" className="text-[10px] fill-current font-semibold">Drukning</text>

      <circle cx="190" cy="160" r="28" fill={SUCCESS(35)} stroke={STROKE} strokeWidth="1.5" />
      <text x="190" y="158" textAnchor="middle" className="text-[10px] fill-current font-semibold">Sommer</text>
      <text x="190" y="172" textAnchor="middle" className="text-[8px] fill-current opacity-70">(skjult)</text>

      {/* korrelasjon (stiplet) */}
      <line x1="92" y1="60" x2="288" y2="60" stroke={STROKE} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="190" y="50" textAnchor="middle" className="text-[10px] fill-current font-mono">
        r ≈ 0.8
      </text>
      <text x="190" y="80" textAnchor="middle" className="text-[9px] fill-current opacity-70 italic">
        observert korrelasjon
      </text>

      {/* sanne årsaker */}
      <path d="M170 145 L 80 85" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCC)" />
      <path d="M210 145 L 300 85" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCC)" />
      <text x="115" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-80">forårsaker</text>
      <text x="265" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-80">forårsaker</text>

      <defs>
        <marker id="arrCC" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Spurious korrelasjon — en skjult «confounder» (sommer) skaper falsk
      sammenheng mellom iskrem og drukninger.
    </figcaption>
  </figure>
);

// ====================================================================
// REGRESJON-DIAGNOSTIKK
// ====================================================================

// ---------- 4 OLS-antakelser som ikon-grid ------------------------
export const OlsAssumptions: FC = () => {
  const items: { title: string; subtitle: string }[] = [
    { title: "Linearitet", subtitle: "E[y|x] = β₀ + β₁x" },
    { title: "Uavhengighet", subtitle: "ε_i ⊥ ε_j" },
    { title: "Homoskedastisitet", subtitle: "Var(ε) = σ² (konstant)" },
    { title: "Normalitet", subtitle: "ε ~ N(0, σ²)" },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        {items.map((it, i) => (
          <div key={it.title} className="rounded border border-border bg-card/60 p-2">
            <div className="flex items-baseline gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-brand text-[10px] font-mono font-semibold">
                {i + 1}
              </span>
              <span className="text-[11px] font-semibold">{it.title}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-1">{it.subtitle}</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        De 4 OLS-antakelsene — brytes en av disse, blir SE og p-verdier
        upålitelige, selv om β̂ ofte fortsatt er forventningsrett.
      </figcaption>
    </figure>
  );
};

// ---------- Heteroskedastisitet — trakt-mønster ---------------------
export const Heteroskedasticity: FC = () => {
  const seed = (n: number) => {
    const x = Math.sin(n * 91.13) * 24571.7;
    return x - Math.floor(x);
  };
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
        <text x="180" y="16" textAnchor="middle" className="text-[11px] fill-current font-semibold">
          Residualer mot ŷ — trakt-form
        </text>
        <rect x="40" y="30" width="300" height="130" fill="none" stroke={STROKE} strokeWidth="0.5" />
        <line x1="40" y1="95" x2="340" y2="95" stroke={STROKE} strokeDasharray="3 3" opacity="0.5" />
        {/* trakt-omriss */}
        <path d="M40 90 L 340 30" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        <path d="M40 100 L 340 160" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6" />
        {/* punkter */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = i / 40;
          const spread = 5 + x * 50;
          const r = (seed(i + 1) - 0.5) * 2 * spread;
          return (
            <circle
              key={i}
              cx={40 + x * 300}
              cy={95 + r}
              r="1.8"
              fill={DESTR(55)}
              stroke={STROKE}
              strokeWidth="0.3"
            />
          );
        })}
        <text x="190" y="175" textAnchor="middle" className="text-[10px] fill-current opacity-70">
          varians vokser med ŷ → SE underestimert, p-verdier for små
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Heteroskedastisitet — typisk trakt. Fiks: log-transform y, WLS,
        eller robuste SE (HC3).
      </figcaption>
    </figure>
  );
};

// ---------- Q-Q-plot --------------------------------------------------
export const QQPlot: FC = () => {
  // Lager to paneler: «normalt» og «tunge haler» (S-form).
  // Approks normal quantile fra rang via inv-normal (Beasley-Springer ville vært
  // overkill; bruker en monoton approks for visualisering).
  const invNorm = (p: number) => {
    // Acklam-approks (forenklet) — godt nok for plot.
    const a = [-39.6968302866, 220.946098424, -275.928510446, 138.357751867, -30.6647980662, 2.50662827745];
    const b = [-54.4760987983, 161.585836858, -155.698979859, 66.8013118877, -13.2806815528];
    const c = [-7.78489400244e-3, -0.322396458041, -2.40075827717, -2.5497325354, 4.37466414146, 2.93816398269];
    const d = [7.78469570904e-3, 0.32246712907, 2.445134137, 3.75440866191];
    const plow = 0.02425;
    const phigh = 1 - plow;
    let q: number;
    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= phigh) {
      q = p - 0.5;
      const r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
  };
  const seed = (n: number) => {
    const x = Math.sin(n * 7.31) * 9173.1;
    return x - Math.floor(x);
  };
  // Sample fra "normal" via inv-normal av uniform.
  const N = 28;
  const sampleNormal: number[] = [];
  for (let i = 0; i < N; i++) sampleNormal.push(invNorm(seed(i + 1)));
  sampleNormal.sort((a, b) => a - b);
  // Sample fra "tunge haler" — multipliser med factor som vokser nær endene.
  const sampleHeavy: number[] = [];
  for (let i = 0; i < N; i++) {
    const u = seed(i + 100);
    const z = invNorm(u);
    sampleHeavy.push(z * (1 + Math.abs(z) * 0.6));
  }
  sampleHeavy.sort((a, b) => a - b);
  const renderPanel = (samples: number[], title: string, ok: boolean) => {
    const xMin = -3, xMax = 3, yMin = -4, yMax = 4;
    const X = (x: number) => 8 + ((x - xMin) / (xMax - xMin)) * 84;
    const Y = (y: number) => 92 - ((y - yMin) / (yMax - yMin)) * 84;
    return (
      <div className="text-center">
        <svg viewBox="0 0 100 100" className="w-full text-foreground">
          <rect x="8" y="8" width="84" height="84" fill="none" stroke={STROKE} strokeWidth="0.5" />
          {/* y=x referanse */}
          <line x1={X(-3)} y1={Y(-3)} x2={X(3)} y2={Y(3)} stroke={STROKE} strokeWidth="0.6" opacity="0.6" />
          {samples.map((s, i) => {
            const q = invNorm((i + 0.5) / N);
            return (
              <circle
                key={i}
                cx={X(q)}
                cy={Y(s)}
                r="1.4"
                fill={ok ? SUCCESS(70) : DESTR(70)}
                stroke={STROKE}
                strokeWidth="0.3"
              />
            );
          })}
        </svg>
        <div className={`text-[10px] mt-1 font-semibold ${ok ? "text-success" : "text-destructive"}`}>{title}</div>
      </div>
    );
  };
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {renderPanel(sampleNormal, "Normalfordelt", true)}
        {renderPanel(sampleHeavy, "Tunge haler — S-form", false)}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Q-Q-plott — sorterte residualer mot teoretiske normal-kvantiler.
        Følger diagonalen ⇒ normalfordelt.
      </figcaption>
    </figure>
  );
};

// ---------- Outlier vs leverage vs influence ---------------------
export const OutlierLeverageInfluence: FC = () => {
  const panels: { title: string; subtitle: string; pts: { x: number; y: number; mark?: boolean }[] }[] = [
    {
      title: "Outlier (kun)",
      subtitle: "uvanlig y, vanlig x",
      pts: [
        ...Array.from({ length: 9 }).map((_, i) => ({ x: 1 + i, y: 1 + i * 0.9 + (i % 3 - 1) * 0.3 })),
        { x: 5, y: 9.5, mark: true },
      ],
    },
    {
      title: "Leverage (kun)",
      subtitle: "uvanlig x, følger trend",
      pts: [
        ...Array.from({ length: 9 }).map((_, i) => ({ x: 1 + i * 0.6, y: 1 + i * 0.6 + (i % 3 - 1) * 0.2 })),
        { x: 10, y: 10, mark: true },
      ],
    },
    {
      title: "Influence",
      subtitle: "outlier + leverage",
      pts: [
        ...Array.from({ length: 9 }).map((_, i) => ({ x: 1 + i * 0.6, y: 1 + i * 0.6 + (i % 3 - 1) * 0.2 })),
        { x: 10, y: 1.5, mark: true },
      ],
    },
  ];
  const X = (x: number) => 8 + (x / 11) * 84;
  const Y = (y: number) => 92 - (y / 11) * 84;
  return (
    <figure className="my-4">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {panels.map((p) => (
          <div key={p.title} className="text-center">
            <svg viewBox="0 0 100 100" className="w-full text-foreground">
              <rect x="8" y="8" width="84" height="84" fill="none" stroke={STROKE} strokeWidth="0.5" />
              {p.pts.map((pt, i) => (
                <circle
                  key={i}
                  cx={X(pt.x)}
                  cy={Y(pt.y)}
                  r={pt.mark ? 3 : 1.8}
                  fill={pt.mark ? DESTR(80) : BRAND(60)}
                  stroke={STROKE}
                  strokeWidth="0.4"
                />
              ))}
            </svg>
            <div className="text-[10px] font-semibold mt-1">{p.title}</div>
            <div className="text-[9px] text-muted-foreground">{p.subtitle}</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Cook's D fanger nettopp INFLUENCE — kombinasjonen av outlier (stor
        residual) og leverage (uvanlig x).
      </figcaption>
    </figure>
  );
};

// ---------- R² vs R²_adj ved tilfeldige prediktorer -----------
export const RSquaredVsAdj: FC = () => {
  // Modell-eksempel: hver ny ekstra prediktor er ren støy, så R² stiger
  // litt mens R²_adj kan synke.
  const n = 50;
  const points: { p: number; r2: number; r2adj: number }[] = [];
  let r2 = 0.45;
  for (let p = 1; p <= 15; p++) {
    // Etter p=3 begynner ekstra prediktorer å være støy.
    if (p <= 3) r2 += 0.06;
    else r2 += 0.005 + 0.0003 * (p - 3);
    if (r2 > 0.98) r2 = 0.98;
    const r2a = 1 - (1 - r2) * (n - 1) / (n - p - 1);
    points.push({ p, r2, r2adj: r2a });
  }
  const W = 360, H = 180;
  const X = (p: number) => 40 + ((p - 1) / 14) * (W - 60);
  const Y = (y: number) => H - 30 - y * (H - 60);
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        {/* akser */}
        <line x1="40" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        <line x1="40" y1="20" x2="40" y2={H - 30} stroke={STROKE} />
        <text x="35" y="25" textAnchor="end" className="text-[9px] fill-current opacity-70">1.0</text>
        <text x="35" y={Y(0.5) + 3} textAnchor="end" className="text-[9px] fill-current opacity-70">0.5</text>
        <text x="35" y={H - 27} textAnchor="end" className="text-[9px] fill-current opacity-70">0</text>
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          antall prediktorer (p)
        </text>
        {/* R²-kurve */}
        <polyline
          fill="none"
          stroke={BRAND(90).replace("transparent", "transparent")}
          strokeOpacity="0.9"
          strokeWidth="2"
          points={points.map((pt) => `${X(pt.p)},${Y(pt.r2)}`).join(" ")}
        />
        {/* R²_adj-kurve */}
        <polyline
          fill="none"
          stroke={DESTR(90).replace("transparent", "transparent")}
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeDasharray="4 2"
          points={points.map((pt) => `${X(pt.p)},${Y(pt.r2adj)}`).join(" ")}
        />
        {/* Legender */}
        <rect x={W - 130} y="30" width="10" height="3" fill={BRAND(90)} />
        <text x={W - 115} y="34" className="text-[9px] fill-current">R² (alltid opp)</text>
        <rect x={W - 130} y="46" width="10" height="3" fill={DESTR(90)} />
        <text x={W - 115} y="50" className="text-[9px] fill-current">R²_adj (straffer p)</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        R² stiger uansett om du legger til en støy-prediktor. R²_adj straffer
        ekstra prediktorer og kan falle.
      </figcaption>
    </figure>
  );
};

// ---------- Multikollinearitet — overlappende sirkler ---------
export const MulticollinearityVenn: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 200" className="w-full max-w-md mx-auto text-foreground">
      <text x="160" y="18" textAnchor="middle" className="text-[11px] fill-current font-semibold">
        x₁ og x₂ deler informasjon om y
      </text>
      {/* y-sirkel (variansen i y) */}
      <circle cx="160" cy="110" r="60" fill="none" stroke={STROKE} strokeWidth="1.5" />
      <text x="160" y="50" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">y</text>
      {/* x1 */}
      <circle cx="115" cy="125" r="40" fill={BRAND(30)} stroke={STROKE} strokeWidth="1" />
      <text x="85" y="135" textAnchor="middle" className="text-[10px] fill-current font-mono">x₁</text>
      {/* x2 (overlapper x1 sterkt) */}
      <circle cx="145" cy="125" r="40" fill={SUCCESS(30)} stroke={STROKE} strokeWidth="1" />
      <text x="180" y="135" textAnchor="middle" className="text-[10px] fill-current font-mono">x₂</text>
      {/* Annotering */}
      <text x="130" y="175" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        overlapp = delt forklaringskraft
      </text>
      <text x="160" y="192" textAnchor="middle" className="text-[10px] fill-current font-mono">
        VIF_j = 1 / (1 − R_j²)
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Stort overlapp ⇒ unikt bidrag fra hver x blir lite ⇒ SE eksploderer.
      VIF &gt; 5 bekymring, &gt; 10 alvorlig.
    </figcaption>
  </figure>
);

// ====================================================================
// ANOVA
// ====================================================================

// ---------- ANOVA: between vs within varians ------------------------
export const AnovaBetweenWithin: FC = () => {
  // Tre grupper med ulike middel og spredning rundt grand mean.
  // Tegnes som dot-plots over en felles x-akse.
  const groups = [
    { mean: 3, color: BRAND(70), label: "Gruppe A" },
    { mean: 5, color: SUCCESS(70), label: "Gruppe B" },
    { mean: 7, color: DESTR(70), label: "Gruppe C" },
  ];
  const seed = (n: number) => {
    const x = Math.sin(n * 39.13) * 5471.7;
    return x - Math.floor(x);
  };
  const W = 360, H = 200;
  const X = (v: number) => 30 + (v / 10) * (W - 60);
  const grandMean = groups.reduce((s, g) => s + g.mean, 0) / groups.length;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        {/* akse */}
        <line x1="30" y1={H - 40} x2={W - 30} y2={H - 40} stroke={STROKE} />
        {/* Grand mean (stiplet) */}
        <line x1={X(grandMean)} y1="20" x2={X(grandMean)} y2={H - 40} stroke={STROKE} strokeDasharray="4 2" opacity="0.7" />
        <text x={X(grandMean)} y="16" textAnchor="middle" className="text-[9px] fill-current opacity-70">
          x̄.. (grand)
        </text>
        {groups.map((g, gi) => {
          const yBase = 50 + gi * 40;
          return (
            <g key={g.label}>
              {/* gruppe-mean tick */}
              <line x1={X(g.mean)} y1={yBase - 14} x2={X(g.mean)} y2={yBase + 14} stroke={STROKE} strokeWidth="2" />
              <text x={X(g.mean)} y={yBase - 18} textAnchor="middle" className="text-[9px] fill-current font-mono">x̄{gi + 1}</text>
              {/* between-pil fra grand til gruppe-mean */}
              <line
                x1={X(grandMean)}
                y1={yBase}
                x2={X(g.mean)}
                y2={yBase}
                stroke={STROKE}
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              {/* dataspredning rundt gruppe-mean */}
              {Array.from({ length: 10 }).map((_, i) => {
                const noise = (seed(gi * 100 + i + 1) - 0.5) * 1.6;
                const x = g.mean + noise;
                return (
                  <circle
                    key={i}
                    cx={X(x)}
                    cy={yBase + (seed(gi * 50 + i) - 0.5) * 12}
                    r="2.2"
                    fill={g.color}
                    stroke={STROKE}
                    strokeWidth="0.4"
                  />
                );
              })}
              <text x={W - 35} y={yBase + 4} textAnchor="end" className="text-[9px] fill-current opacity-80">
                {g.label}
              </text>
            </g>
          );
        })}
        {/* Tekster */}
        <text x={W / 2} y={H - 22} textAnchor="middle" className="text-[10px] fill-current font-mono">
          F = MS_between / MS_within
        </text>
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          stor F når gruppe-snitt skiller seg mer enn restspredningen kan forklare
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Stiplet pil = BETWEEN-varians (avstand mellom gruppe-mean og grand
        mean). Spredning av prikker = WITHIN-varians.
      </figcaption>
    </figure>
  );
};

// ---------- ANOVA SS-dekomponering ---------------------------------
export const AnovaSsDecomp: FC = () => {
  const SS_b = 60;
  const SS_w = 40;
  return (
    <figure className="my-4">
      <svg viewBox="0 0 360 160" className="w-full max-w-md mx-auto text-foreground">
        <text x="180" y="18" textAnchor="middle" className="text-[11px] fill-current font-semibold">
          SS_total = SS_between + SS_within
        </text>
        <text x="40" y="58" className="text-[10px] fill-current font-mono">SS_tot</text>
        <rect x="100" y="42" width="240" height="22" fill={MUTED(55)} stroke={STROKE} />
        <text x="40" y="108" className="text-[10px] fill-current font-mono">stack</text>
        <rect x="100" y="92" width={240 * (SS_b / 100)} height="22" fill={BRAND(45)} stroke={STROKE} />
        <rect x={100 + 240 * (SS_b / 100)} y="92" width={240 * (SS_w / 100)} height="22" fill={SUCCESS(40)} stroke={STROKE} />
        <text x={100 + 120 * (SS_b / 100)} y="108" textAnchor="middle" className="text-[9px] fill-current font-mono">
          SS_b (k−1 df)
        </text>
        <text x={100 + 240 * (SS_b / 100) + 120 * (SS_w / 100)} y="108" textAnchor="middle" className="text-[9px] fill-current font-mono">
          SS_w (N−k df)
        </text>
        <text x="180" y="140" textAnchor="middle" className="text-[10px] fill-current font-mono">
          F = (SS_b/(k−1)) / (SS_w/(N−k))
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        All variasjon dekomponeres i mellom-gruppe og innen-gruppe.
      </figcaption>
    </figure>
  );
};

// ---------- F-fordeling med kritisk verdi -------------------------
export const FDistribution: FC = () => {
  // Approks F-tetthet for df1=2, df2=20.
  const fPdf = (x: number) => {
    if (x <= 0) return 0;
    const d1 = 2, d2 = 20;
    // f(x) ∝ (d1*x)^(d1/2) * d2^(d2/2) / ((d1*x + d2)^((d1+d2)/2)) / x
    const num = Math.pow(d1 * x, d1 / 2) * Math.pow(d2, d2 / 2);
    const den = Math.pow(d1 * x + d2, (d1 + d2) / 2);
    return (num / den) / x;
  };
  const W = 360, H = 180;
  const xMax = 6;
  const samples = 100;
  const pts: { x: number; y: number }[] = [];
  let yMax = 0;
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * xMax;
    const y = fPdf(x);
    if (Number.isFinite(y)) {
      pts.push({ x, y });
      if (y > yMax) yMax = y;
    }
  }
  const X = (x: number) => 30 + (x / xMax) * (W - 50);
  const Y = (y: number) => H - 30 - (y / yMax) * (H - 60);
  const fCrit = 3.49; // F_{0.05, 2, 20} ≈ 3.49
  const fObs = 5.2;
  // Skygger for kritisk område og observert F
  const critArea = pts
    .filter((p) => p.x >= fCrit)
    .map((p) => `${X(p.x)},${Y(p.y)}`)
    .join(" ");
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        {/* x-akse */}
        <line x1="30" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        {/* skygge kritisk område */}
        {critArea && (
          <polygon
            points={`${X(fCrit)},${H - 30} ${critArea} ${X(xMax)},${H - 30}`}
            fill={DESTR(40)}
          />
        )}
        {/* tetthet */}
        <polyline
          fill="none"
          stroke={STROKE}
          strokeWidth="1.5"
          points={pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")}
        />
        {/* F_crit-linje */}
        <line x1={X(fCrit)} y1={Y(0)} x2={X(fCrit)} y2={Y(fPdf(fCrit))} stroke={STROKE} strokeDasharray="3 3" />
        <text x={X(fCrit)} y={H - 12} textAnchor="middle" className="text-[9px] fill-current font-mono">
          F_crit = {fCrit}
        </text>
        {/* F_obs-pil */}
        <line x1={X(fObs)} y1={H - 30} x2={X(fObs)} y2={H - 60} stroke={STROKE} strokeWidth="2" />
        <text x={X(fObs)} y={H - 65} textAnchor="middle" className="text-[10px] fill-current font-mono">
          F_obs = {fObs}
        </text>
        {/* α-label */}
        <text x={X(fCrit) + 25} y="50" className="text-[9px] fill-current opacity-80">α = 0.05</text>
        <line x1={X(fCrit) + 22} y1="48" x2={X(fCrit + 0.8)} y2={Y(fPdf(fCrit + 0.8)) - 4} stroke={STROKE} strokeWidth="0.5" />
        <text x={W / 2} y={H - 4} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          F-fordeling (df₁=2, df₂=20) — forkast H₀ hvis F_obs &gt; F_crit
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        F-fordelingen er høyre-skjev. ANOVA er alltid en høyre-hale-test —
        kun store F-er gir signifikans.
      </figcaption>
    </figure>
  );
};

// ---------- FWER vs antall tester -------------------------------------
export const FwerCurve: FC = () => {
  const alpha = 0.05;
  const ms = Array.from({ length: 21 }).map((_, i) => i);
  const W = 360, H = 170;
  const xMax = 20;
  const X = (m: number) => 30 + (m / xMax) * (W - 50);
  const Y = (p: number) => H - 30 - p * (H - 60);
  const pts = ms.map((m) => ({ m, p: 1 - Math.pow(1 - alpha, m) }));
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="30" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        <line x1="30" y1="20" x2="30" y2={H - 30} stroke={STROKE} />
        <text x="25" y={Y(1) + 3} textAnchor="end" className="text-[9px] fill-current opacity-70">1.0</text>
        <text x="25" y={Y(0.5) + 3} textAnchor="end" className="text-[9px] fill-current opacity-70">0.5</text>
        {/* α = 0.05 referanse */}
        <line x1="30" y1={Y(alpha)} x2={W - 20} y2={Y(alpha)} stroke={STROKE} strokeDasharray="3 3" opacity="0.6" />
        <text x={W - 22} y={Y(alpha) - 3} textAnchor="end" className="text-[9px] fill-current opacity-70">α = 0.05</text>
        <polyline
          fill="none"
          stroke={DESTR(80).replace("transparent", "transparent")}
          strokeOpacity="0.9"
          strokeWidth="2"
          points={pts.map((p) => `${X(p.m)},${Y(p.p)}`).join(" ")}
        />
        {/* marker m=6 (4 grupper → 6 par) */}
        <circle cx={X(6)} cy={Y(1 - Math.pow(1 - alpha, 6))} r="3" fill={DESTR(80)} stroke={STROKE} strokeWidth="0.5" />
        <text x={X(6) + 6} y={Y(1 - Math.pow(1 - alpha, 6)) - 4} className="text-[9px] fill-current font-mono">
          m=6 → 26.5 %
        </text>
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          antall tester m (parvise t-tester)
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        FWER = 1 − (1 − α)^m — derfor blåser parvise t-tester opp falske
        positiver, og vi bruker ANOVA + post-hoc med korreksjon.
      </figcaption>
    </figure>
  );
};

// ====================================================================
// CV-VARIANTER
// ====================================================================

// ---------- k-fold visualisert (k=5) -----------------------------
export const KFoldGrid: FC = () => {
  const k = 5;
  return (
    <figure className="my-4">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-1 text-[10px]">
          {/* header */}
          <div className="font-mono opacity-70">iterasjon</div>
          {Array.from({ length: k }).map((_, i) => (
            <div key={i} className="text-center font-mono opacity-70">fold {i + 1}</div>
          ))}
          {/* rader */}
          {Array.from({ length: k }).map((_, row) => (
            <>
              <div key={`l-${row}`} className="font-mono py-1">{row + 1}</div>
              {Array.from({ length: k }).map((_, col) => {
                const isTest = col === row;
                return (
                  <div
                    key={`c-${row}-${col}`}
                    className={`h-7 rounded text-center text-[9px] font-mono font-semibold leading-7 ${
                      isTest
                        ? "bg-destructive/25 text-destructive border border-destructive/40"
                        : "bg-success/15 text-success border border-success/30"
                    }`}
                  >
                    {isTest ? "TEST" : "train"}
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-success/30 border border-success/50" /> trening
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-destructive/30 border border-destructive/50" /> test
          </span>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        5-fold CV — hver fold er test nøyaktig én gang. CV-estimatet er
        snittet av de 5 MSE-ene.
      </figcaption>
    </figure>
  );
};

// ---------- LOOCV vs k-fold — varians/bias tradeoff -------------
export const LoocvVsKfold: FC = () => {
  // Animert toggle mellom 5-fold og LOOCV.
  const [showLoo, setShowLoo] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setShowLoo((v) => !v), 3000);
    return () => clearInterval(id);
  }, []);
  const cells = 20;
  const k = showLoo ? 20 : 5;
  const iter = showLoo ? 1 : 0; // viser kun første iterasjon for klarhet
  return (
    <figure className="my-4">
      <div className="max-w-md mx-auto text-center">
        <div className="text-[11px] font-mono mb-2">
          {showLoo ? "LOOCV (k = n)" : "k-fold (k = 5)"}
        </div>
        <div className="grid grid-cols-20 gap-[2px]" style={{ gridTemplateColumns: `repeat(${cells}, minmax(0,1fr))` }}>
          {Array.from({ length: cells }).map((_, i) => {
            const foldSize = cells / k;
            const fold = Math.floor(i / foldSize);
            const isTest = fold === iter;
            return (
              <div
                key={i}
                className={`h-5 rounded-sm transition-colors duration-500 ${
                  isTest
                    ? "bg-destructive/40 border border-destructive/60"
                    : "bg-success/20 border border-success/40"
                }`}
              />
            );
          })}
        </div>
        <div className="text-[10px] text-muted-foreground mt-3">
          {showLoo
            ? "én test-rad om gangen — n treninger, høy varians på snittet"
            : "fire trenings-bånd + ett test-bånd — sweet spot k=5 eller 10"}
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        LOOCV gir lav bias (n−1 treningspunkter) men høy varians (modellene er
        nesten identiske). 5/10-fold er en bedre tradeoff.
      </figcaption>
    </figure>
  );
};

// ---------- StratifiedKFold — bevarer klassebalanse -----------
export const StratifiedKFold: FC = () => {
  // Datasett: 20 punkter, 4 minoritet (rød) og 16 majoritet (blå).
  // Naïv KFold kan tilfeldigvis legge alle 4 minoritet i samme fold.
  const data: ("A" | "B")[] = [
    "A", "B", "A", "A", "B", "B", "A", "B", "B", "B",
    "B", "B", "A", "B", "B", "B", "B", "B", "B", "B",
  ];
  const k = 4;
  const foldSize = data.length / k;
  // Naïv: bare ta i rekkefølge.
  const naive: ("A" | "B")[][] = Array.from({ length: k }).map((_, f) =>
    data.slice(f * foldSize, (f + 1) * foldSize)
  );
  // Stratified: del klassene separat og spre.
  const idxA = data.map((c, i) => (c === "A" ? i : -1)).filter((i) => i >= 0);
  const idxB = data.map((c, i) => (c === "B" ? i : -1)).filter((i) => i >= 0);
  const stratified: ("A" | "B")[][] = Array.from({ length: k }).map(() => []);
  idxA.forEach((i, k2) => stratified[k2 % k].push(data[i]));
  idxB.forEach((i, k2) => stratified[k2 % k].push(data[i]));
  const renderRow = (folds: ("A" | "B")[][], label: string, ok: boolean) => (
    <div className="mb-2">
      <div className="text-[10px] font-semibold mb-1 flex items-center gap-2">
        <span className={ok ? "text-success" : "text-destructive"}>{ok ? "✓" : "✗"}</span>
        {label}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {folds.map((fold, fi) => (
          <div key={fi} className="border border-border rounded p-1">
            <div className="text-[9px] text-muted-foreground text-center mb-1 font-mono">fold {fi + 1}</div>
            <div className="flex flex-wrap gap-[2px] justify-center">
              {fold.map((c, i) => (
                <span
                  key={i}
                  className={`inline-block h-3 w-3 rounded-sm ${
                    c === "A" ? "bg-destructive/70 border border-destructive" : "bg-brand/40 border border-brand/60"
                  }`}
                />
              ))}
            </div>
            <div className="text-[8px] text-center mt-1 font-mono opacity-70">
              A={fold.filter((c) => c === "A").length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <figure className="my-4">
      <div className="max-w-md mx-auto">
        {renderRow(naive, "Naïv KFold — én fold uten minoritet", false)}
        {renderRow(stratified, "StratifiedKFold — A spredt jevnt", true)}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Ved ubalansert data: bruk StratifiedKFold for å sikre at hver fold har
        riktig klassefordeling.
      </figcaption>
    </figure>
  );
};

// ---------- GroupKFold ----------------------------------------------
export const GroupKFoldFig: FC = () => {
  // 6 pasienter, hver med 3 observasjoner. Naïv split blander pasient på tvers.
  const patients = ["P1", "P2", "P3", "P4", "P5", "P6"];
  const obsPerPatient = 3;
  // Naïv: del alle 18 obs sekvensielt i 3 folder → samme pasient kan havne i flere folder.
  // Group: del på pasient, ikke obs.
  return (
    <figure className="my-4">
      <div className="max-w-md mx-auto space-y-3">
        <div>
          <div className="text-[10px] font-semibold text-destructive mb-1">✗ Naïv KFold — pasient i både train og test</div>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 3 }).map((_, foldIdx) => (
              <div key={foldIdx} className="border border-border rounded p-1">
                <div className="text-[9px] font-mono text-center opacity-70 mb-1">fold {foldIdx + 1}</div>
                <div className="flex flex-wrap gap-[2px]">
                  {patients.flatMap((p, pi) =>
                    Array.from({ length: obsPerPatient }).map((_, oi) => {
                      const globalIdx = pi * obsPerPatient + oi;
                      const inFold = Math.floor(globalIdx / 6) === foldIdx;
                      if (!inFold) return null;
                      return (
                        <span
                          key={`${pi}-${oi}`}
                          className="px-1 rounded bg-destructive/30 border border-destructive/50 text-[8px] font-mono"
                        >
                          {p}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-success mb-1">✓ GroupKFold — pasient bare på én side</div>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 3 }).map((_, foldIdx) => (
              <div key={foldIdx} className="border border-border rounded p-1">
                <div className="text-[9px] font-mono text-center opacity-70 mb-1">fold {foldIdx + 1}</div>
                <div className="flex flex-wrap gap-[2px]">
                  {patients
                    .filter((_, pi) => pi % 3 === foldIdx)
                    .flatMap((p) =>
                      Array.from({ length: obsPerPatient }).map((_, oi) => (
                        <span
                          key={`${p}-${oi}`}
                          className="px-1 rounded bg-success/30 border border-success/50 text-[8px] font-mono"
                        >
                          {p}
                        </span>
                      ))
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Når observasjoner er klyngede (samme pasient/bruker), må alle obs fra
        én gruppe ligge i samme fold — ellers lekker gruppe-mønstre.
      </figcaption>
    </figure>
  );
};

// ---------- TimeSeriesSplit ----------------------------------
export const TimeSeriesSplit: FC = () => {
  const N = 20;
  const splits = 4;
  // Splits: train = [0..startTest), test = [startTest..startTest+block)
  const block = Math.floor(N / (splits + 1));
  return (
    <figure className="my-4">
      <div className="max-w-md mx-auto space-y-1">
        <div className="text-[10px] opacity-70 mb-1 font-mono">tid →</div>
        {Array.from({ length: splits }).map((_, s) => {
          const startTest = (s + 1) * block;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className="text-[9px] font-mono w-12 opacity-70">split {s + 1}</span>
              <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}>
                {Array.from({ length: N }).map((_, i) => {
                  let cls = "bg-muted/40";
                  if (i < startTest) cls = "bg-success/30 border-success/50";
                  else if (i < startTest + block) cls = "bg-destructive/30 border-destructive/50";
                  return <div key={i} className={`h-4 rounded-sm border ${cls}`} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-3">
        TimeSeriesSplit — train alltid før test kronologisk. Treningssettet
        VOKSER for hver split, test rykker fremover.
      </figcaption>
    </figure>
  );
};

// ---------- CV-bias-varians vs k -----------------------------
export const CvBiasVariance: FC = () => {
  const ks = [2, 3, 5, 10, 20, 50, 100];
  const bias = (k: number) => 0.45 / k + 0.02; // høy ved lav k
  const variance = (k: number) => 0.08 + 0.005 * k; // høy ved høy k
  const W = 360, H = 180;
  const X = (k: number) => 35 + (Math.log2(k) / Math.log2(100)) * (W - 60);
  const Y = (v: number) => H - 30 - v * (H - 60) * 1.2;
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="35" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        <line x1="35" y1="20" x2="35" y2={H - 30} stroke={STROKE} />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          k (log-skala)
        </text>
        {[2, 5, 10, 20, 50, 100].map((k) => (
          <g key={k}>
            <text x={X(k)} y={H - 18} textAnchor="middle" className="text-[8px] fill-current opacity-60">{k}</text>
            <line x1={X(k)} y1={H - 30} x2={X(k)} y2={H - 28} stroke={STROKE} />
          </g>
        ))}
        {/* bias */}
        <polyline
          fill="none"
          stroke={BRAND(85)}
          strokeOpacity="0.9"
          strokeWidth="2"
          points={ks.map((k) => `${X(k)},${Y(bias(k))}`).join(" ")}
        />
        {/* variance */}
        <polyline
          fill="none"
          stroke={DESTR(85)}
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeDasharray="4 2"
          points={ks.map((k) => `${X(k)},${Y(variance(k))}`).join(" ")}
        />
        {/* sweet spot */}
        <line x1={X(10)} y1="20" x2={X(10)} y2={H - 30} stroke={STROKE} strokeDasharray="2 2" opacity="0.5" />
        <text x={X(10) + 4} y="30" className="text-[9px] fill-current opacity-80">sweet spot</text>
        {/* legender */}
        <rect x={W - 110} y="30" width="10" height="3" fill={BRAND(85)} />
        <text x={W - 95} y="34" className="text-[9px] fill-current">bias</text>
        <rect x={W - 110} y="44" width="10" height="3" fill={DESTR(85)} />
        <text x={W - 95} y="48" className="text-[9px] fill-current">varians</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Lav k → få trenings-punkter ⇒ høy bias. Høy k → korrelerte modeller
        ⇒ høy varians. k = 5–10 er sweet spot.
      </figcaption>
    </figure>
  );
};

// ---------- CV-pipeline-leakage ---------------------------------
export const CvPipelineLeakage: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-md mx-auto text-[11px]">
      <div className="rounded border-2 border-destructive/40 bg-destructive/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
          ✗ Lekkasje
        </div>
        <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed">{`X = scaler.fit_transform(X)  # ← lærer av ALLE
cross_val_score(model, X, y, cv=5)
# val-folden farger scaler.mean_`}</pre>
      </div>
      <div className="rounded border-2 border-success/40 bg-success/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1">
          ✓ Pipeline
        </div>
        <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed">{`pipe = Pipeline([
  ("sc", StandardScaler()),
  ("clf", LogisticRegression()),
])
cross_val_score(pipe, X, y, cv=5)
# scaler re-fit-es INNE i hver fold`}</pre>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      All preprocessing må pakkes i Pipeline — ellers ser den «framtidige»
      val-folden info før modellen trenes.
    </figcaption>
  </figure>
);

// ====================================================================
// LOGISTISK REGRESJON
// ====================================================================

// ---------- Sigmoid-kurve ----------------------------------
export const SigmoidCurve: FC = () => {
  const W = 360, H = 200;
  const xMin = -6, xMax = 6;
  const X = (x: number) => 35 + ((x - xMin) / (xMax - xMin)) * (W - 50);
  const Y = (y: number) => H - 30 - y * (H - 60);
  const samples = 100;
  const sig = (z: number) => 1 / (1 + Math.exp(-z));
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const z = xMin + (i / samples) * (xMax - xMin);
    pts.push(`${X(z)},${Y(sig(z))}`);
  }
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        {/* akser */}
        <line x1="35" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        <line x1="35" y1="20" x2="35" y2={H - 30} stroke={STROKE} />
        {/* 0.5-terskel */}
        <line x1="35" y1={Y(0.5)} x2={W - 20} y2={Y(0.5)} stroke={STROKE} strokeDasharray="3 3" opacity="0.5" />
        <text x={W - 22} y={Y(0.5) - 3} textAnchor="end" className="text-[9px] fill-current opacity-70">
          terskel = 0.5
        </text>
        {/* z=0 */}
        <line x1={X(0)} y1="20" x2={X(0)} y2={H - 30} stroke={STROKE} strokeDasharray="2 2" opacity="0.4" />
        {/* 1.0 ref */}
        <line x1="35" y1={Y(1)} x2={W - 20} y2={Y(1)} stroke={STROKE} strokeDasharray="2 2" opacity="0.3" />
        <text x="32" y={Y(1) + 3} textAnchor="end" className="text-[9px] fill-current opacity-70">1</text>
        <text x="32" y={Y(0.5) + 3} textAnchor="end" className="text-[9px] fill-current opacity-70">0.5</text>
        <text x="32" y={Y(0) + 3} textAnchor="end" className="text-[9px] fill-current opacity-70">0</text>
        {/* kurve */}
        <polyline
          fill="none"
          stroke={BRAND(95)}
          strokeOpacity="0.95"
          strokeWidth="2.2"
          points={pts.join(" ")}
        />
        {/* punkt på (0, 0.5) */}
        <circle cx={X(0)} cy={Y(0.5)} r="3.5" fill={SUCCESS(80)} stroke={STROKE} strokeWidth="1" />
        <text x={X(0) + 6} y={Y(0.5) - 6} className="text-[9px] fill-current font-mono">σ(0)=0.5</text>
        {/* akse-tekst */}
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          z = β₀ + β₁x (lineær score / log-odds)
        </text>
        <text x={W - 22} y="22" textAnchor="end" className="text-[10px] fill-current font-mono">σ(z) = 1/(1+e^−z)</text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Sigmoid mapper hele R inn i (0,1). Lineær score blir sannsynlighet
        som kan tolkes og kalibreres.
      </figcaption>
    </figure>
  );
};

// ---------- ROC-kurve med AUC-skygge ---------------------
export const RocCurve: FC = () => {
  // Konstruerer en ROC-kurve som er bedre enn random.
  // Bruker eksplisitt poly-tilnærming.
  const pts: { fpr: number; tpr: number }[] = [];
  const n = 40;
  for (let i = 0; i <= n; i++) {
    const fpr = i / n;
    const tpr = Math.min(1, Math.pow(fpr, 0.35) + 0.05);
    pts.push({ fpr, tpr });
  }
  // approks AUC (trapes)
  let auc = 0;
  for (let i = 1; i < pts.length; i++) {
    auc += ((pts[i].tpr + pts[i - 1].tpr) / 2) * (pts[i].fpr - pts[i - 1].fpr);
  }
  const W = 220, H = 220;
  const X = (v: number) => 30 + v * (W - 50);
  const Y = (v: number) => H - 30 - v * (H - 60);
  const areaPts = pts.map((p) => `${X(p.fpr)},${Y(p.tpr)}`).join(" ");
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto text-foreground">
        {/* akser */}
        <line x1="30" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        <line x1="30" y1="20" x2="30" y2={H - 30} stroke={STROKE} />
        {/* AUC-skygge */}
        <polygon
          points={`${X(0)},${Y(0)} ${areaPts} ${X(1)},${Y(0)}`}
          fill={SUCCESS(35)}
          opacity="0.8"
        />
        {/* diagonal (random) */}
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke={STROKE} strokeDasharray="4 3" opacity="0.5" />
        {/* ROC-kurve */}
        <polyline
          fill="none"
          stroke={BRAND(95)}
          strokeOpacity="0.95"
          strokeWidth="2"
          points={areaPts}
        />
        {/* punkter for tre terskler */}
        {[8, 18, 30].map((i) => (
          <circle
            key={i}
            cx={X(pts[i].fpr)}
            cy={Y(pts[i].tpr)}
            r="3"
            fill={DESTR(80)}
            stroke={STROKE}
            strokeWidth="0.6"
          />
        ))}
        {/* labels */}
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          FPR = FP / (FP+TN)
        </text>
        <text x="14" y={H / 2} textAnchor="middle" className="text-[9px] fill-current opacity-70" transform={`rotate(-90, 14, ${H / 2})`}>
          TPR = TP / (TP+FN)
        </text>
        <text x={W - 28} y="40" textAnchor="end" className="text-[10px] fill-current font-mono font-semibold">
          AUC ≈ {auc.toFixed(2)}
        </text>
        <text x={W - 28} y="54" textAnchor="end" className="text-[9px] fill-current opacity-70">
          random = 0.5
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        ROC-kurven sveiper gjennom alle terskler. AUC er arealet under —
        sannsynligheten for at modellen rangerer et tilfeldig positivt
        høyere enn et tilfeldig negativt.
      </figcaption>
    </figure>
  );
};

// ---------- Log-loss vs MSE for binær y ---------------------
export const LogLossVsMse: FC = () => {
  // Når y=1, plotter vi tap som funksjon av p̂ ∈ (0,1).
  const W = 320, H = 180;
  const X = (p: number) => 35 + p * (W - 55);
  const Y = (l: number) => H - 30 - (l / 5) * (H - 60);
  const samples = 100;
  const logloss: string[] = [];
  const mse: string[] = [];
  for (let i = 1; i < samples; i++) {
    const p = i / samples;
    logloss.push(`${X(p)},${Y(-Math.log(p))}`);
    mse.push(`${X(p)},${Y((1 - p) ** 2)}`);
  }
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="35" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        <line x1="35" y1="20" x2="35" y2={H - 30} stroke={STROKE} />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          predikert p̂ (når sann y = 1)
        </text>
        <polyline fill="none" stroke={DESTR(90)} strokeWidth="2" points={logloss.join(" ")} />
        <polyline fill="none" stroke={BRAND(90)} strokeWidth="2" strokeDasharray="4 2" points={mse.join(" ")} />
        {/* legend */}
        <rect x={W - 110} y="30" width="10" height="3" fill={DESTR(90)} />
        <text x={W - 95} y="34" className="text-[9px] fill-current">log-loss</text>
        <rect x={W - 110} y="46" width="10" height="3" fill={BRAND(90)} />
        <text x={W - 95} y="50" className="text-[9px] fill-current">MSE</text>
        {/* annotering */}
        <text x={X(0.05) + 4} y={Y(3)} className="text-[9px] fill-current opacity-80">
          log-loss → ∞ ved p̂ → 0
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Log-loss straffer trygge feil knusende hardt (kurven divergerer).
        MSE er flat ved feilen — derfor er log-loss riktig tap for sannsynligheter.
      </figcaption>
    </figure>
  );
};

// ---------- Softmax → sannsynlighetsfordeling ---------------
export const SoftmaxBars: FC = () => {
  const logits = [2.1, 1.0, 0.3, -0.5];
  const labels = ["katt", "hund", "fugl", "fisk"];
  const exps = logits.map((z) => Math.exp(z));
  const sum = exps.reduce((s, v) => s + v, 0);
  const probs = exps.map((e) => e / sum);
  return (
    <figure className="my-4">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-3">
          {labels.map((l, i) => (
            <div key={l} className="text-center">
              <div className="text-[9px] font-mono opacity-70">z = {logits[i].toFixed(1)}</div>
              <div className="h-24 flex items-end justify-center mt-1 border-b border-border">
                <div
                  className="w-8 bg-brand/60 border border-brand rounded-t"
                  style={{ height: `${probs[i] * 100}%` }}
                />
              </div>
              <div className="text-[10px] font-mono mt-1 font-semibold">{(probs[i] * 100).toFixed(0)} %</div>
              <div className="text-[10px]">{l}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-center font-mono mt-3 opacity-80">
          P(y=k|x) = e^{"{z_k}"} / Σⱼ e^{"{z_j}"} — sum = 1.0
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Softmax normaliserer rå logits til en gyldig sannsynlighetsfordeling
        over K klasser. Reduserer til sigmoid når K=2.
      </figcaption>
    </figure>
  );
};

// ---------- Klasseubalanse + terskel-justering ------------
export const ClassImbalance: FC = () => {
  // Vis to fordelinger der negativ er mye større enn positiv,
  // og en terskel som kan flyttes vekk fra 0.5.
  const W = 360, H = 180;
  const X = (p: number) => 30 + p * (W - 50);
  const Y = (v: number) => H - 30 - (v / 10) * (H - 60);
  const negPdf = (p: number) => 9 * Math.exp(-Math.pow((p - 0.2) / 0.13, 2));
  const posPdf = (p: number) => 1.2 * Math.exp(-Math.pow((p - 0.65) / 0.18, 2));
  const npts: string[] = [];
  const ppts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const p = i / 100;
    npts.push(`${X(p)},${Y(negPdf(p))}`);
    ppts.push(`${X(p)},${Y(posPdf(p))}`);
  }
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto text-foreground">
        <line x1="30" y1={H - 30} x2={W - 20} y2={H - 30} stroke={STROKE} />
        {/* Negative tetthet */}
        <polygon
          points={`${X(0)},${Y(0)} ${npts.join(" ")} ${X(1)},${Y(0)}`}
          fill={BRAND(35)}
        />
        {/* Positive tetthet */}
        <polygon
          points={`${X(0)},${Y(0)} ${ppts.join(" ")} ${X(1)},${Y(0)}`}
          fill={DESTR(40)}
        />
        {/* Standard-terskel 0.5 */}
        <line x1={X(0.5)} y1="20" x2={X(0.5)} y2={H - 30} stroke={STROKE} strokeDasharray="3 3" opacity="0.7" />
        <text x={X(0.5)} y="18" textAnchor="middle" className="text-[9px] fill-current opacity-70">0.5</text>
        {/* Optimal-terskel 0.3 */}
        <line x1={X(0.3)} y1="20" x2={X(0.3)} y2={H - 30} stroke={DESTR(95)} strokeWidth="1.5" />
        <text x={X(0.3)} y="18" textAnchor="middle" className="text-[9px] fill-current font-semibold">0.30 ← bedre</text>
        {/* legend */}
        <rect x={W - 110} y="40" width="10" height="6" fill={BRAND(35)} />
        <text x={W - 95} y="46" className="text-[9px] fill-current">negativ (98 %)</text>
        <rect x={W - 110} y="55" width="10" height="6" fill={DESTR(40)} />
        <text x={W - 95} y="61" className="text-[9px] fill-current">positiv (2 %)</text>
        <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-current opacity-70">
          predikert sannsynlighet
        </text>
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        Med ubalanserte klasser er 0.5 sjelden optimal. Senk terskelen for å
        fange flere positive — bytt evaluerings-metric fra accuracy til F1/recall.
      </figcaption>
    </figure>
  );
};

// ---------- Perfect separation ---------------------------
export const PerfectSeparation: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
      <text x="180" y="18" textAnchor="middle" className="text-[11px] fill-current font-semibold">
        Perfekt separasjon — MLE divergerer
      </text>
      <line x1="20" y1="120" x2="340" y2="120" stroke={STROKE} />
      {/* Negative klasser (venstre) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <circle key={`n-${i}`} cx={40 + i * 18} cy={120} r="5" fill={BRAND(60)} stroke={STROKE} />
      ))}
      {/* Positive klasser (høyre) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <circle key={`p-${i}`} cx={200 + i * 18} cy={120} r="5" fill={DESTR(60)} stroke={STROKE} />
      ))}
      {/* Hull mellom dem */}
      <rect x="135" y="55" width="60" height="120" fill={SUCCESS(15)} stroke={STROKE} strokeDasharray="3 3" />
      <text x="165" y="50" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        ingen overlapp
      </text>
      {/* Sigmoid-pil mot ekstremverdier */}
      <text x="165" y="150" textAnchor="middle" className="text-[10px] fill-current font-mono">β → ±∞</text>
      <text x="165" y="166" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        L2-reg (default C=1) holder β endelig
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Når klassene er lineært separerbare, prøver MLE å gjøre sigmoid til en
      stegfunksjon — β eksploderer. Regularisering stopper det.
    </figcaption>
  </figure>
);

// ====================================================================
// LDA / QDA / NAIVE BAYES
// ====================================================================

// ---------- Generativ vs diskriminativ ----------------
export const GenerativeVsDiscriminative: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-md mx-auto text-[11px]">
      <div className="rounded border border-border p-3">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
          Generativ
        </div>
        <div className="font-mono text-[10px]">P(x | y) · P(y)</div>
        <div className="text-[10px] mt-2">
          Modellerer hvordan dataene <em>oppstår</em>. Kan generere nye
          samples. Bayes-teoremet gir P(y|x).
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 italic">
          LDA, QDA, Naive Bayes, GMM
        </div>
      </div>
      <div className="rounded border border-border p-3">
        <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1">
          Diskriminativ
        </div>
        <div className="font-mono text-[10px]">P(y | x) direkte</div>
        <div className="text-[10px] mt-2">
          Modellerer kun beslutningsgrensa. Kan IKKE generere data. Mer
          dataeffektivt for klassifisering.
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 italic">
          Logistisk reg, SVM, beslutningstre, NN
        </div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Begge gir til slutt P(y|x), men generative modellerer hele datafordelingen.
    </figcaption>
  </figure>
);

// ---------- LDA-beslutningsgrense (lineær) -------------------
export const LdaBoundary: FC = () => {
  // To klasser, samme kovarians → lineær grense.
  const seed = (n: number) => {
    const x = Math.sin(n * 19.13) * 3217.1;
    return x - Math.floor(x);
  };
  const W = 240, H = 200;
  const X = (x: number) => 20 + x * (W - 40);
  const Y = (y: number) => H - 30 - y * (H - 50);
  // Klasse A: senter (0.3, 0.4), Klasse B: senter (0.7, 0.6), samme spredning.
  const pa: { x: number; y: number }[] = [];
  const pb: { x: number; y: number }[] = [];
  for (let i = 0; i < 30; i++) {
    pa.push({
      x: 0.3 + (seed(i + 1) - 0.5) * 0.28,
      y: 0.4 + (seed(i + 50) - 0.5) * 0.28,
    });
    pb.push({
      x: 0.7 + (seed(i + 200) - 0.5) * 0.28,
      y: 0.6 + (seed(i + 300) - 0.5) * 0.28,
    });
  }
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto text-foreground">
        <text x={W / 2} y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
          LDA — lik kovarians ⇒ lineær grense
        </text>
        <rect x="20" y="20" width={W - 40} height={H - 50} fill="none" stroke={STROKE} strokeWidth="0.5" />
        {/* Ellipser (felles form) */}
        <ellipse cx={X(0.3)} cy={Y(0.4)} rx="38" ry="28" transform={`rotate(20 ${X(0.3)} ${Y(0.4)})`} fill={BRAND(15)} stroke={STROKE} strokeWidth="0.6" />
        <ellipse cx={X(0.7)} cy={Y(0.6)} rx="38" ry="28" transform={`rotate(20 ${X(0.7)} ${Y(0.6)})`} fill={DESTR(15)} stroke={STROKE} strokeWidth="0.6" />
        {/* Lineær grense */}
        <line x1={X(0.3)} y1={Y(0.9)} x2={X(0.7)} y2={Y(0.1)} stroke={STROKE} strokeWidth="1.5" />
        {pa.map((p, i) => (
          <circle key={`a-${i}`} cx={X(p.x)} cy={Y(p.y)} r="2" fill={BRAND(80)} stroke={STROKE} strokeWidth="0.3" />
        ))}
        {pb.map((p, i) => (
          <circle key={`b-${i}`} cx={X(p.x)} cy={Y(p.y)} r="2" fill={DESTR(80)} stroke={STROKE} strokeWidth="0.3" />
        ))}
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        LDA antar samme Σ for begge klasser — grensa blir et hyperplan.
      </figcaption>
    </figure>
  );
};

// ---------- QDA-beslutningsgrense (kvadratisk) -------------
export const QdaBoundary: FC = () => {
  const seed = (n: number) => {
    const x = Math.sin(n * 21.13) * 6217.1;
    return x - Math.floor(x);
  };
  const W = 240, H = 200;
  const X = (x: number) => 20 + x * (W - 40);
  const Y = (y: number) => H - 30 - y * (H - 50);
  // Klasse A: liten spredning rundt (0.3, 0.5). Klasse B: stor spredning rundt (0.6, 0.5).
  const pa: { x: number; y: number }[] = [];
  const pb: { x: number; y: number }[] = [];
  for (let i = 0; i < 25; i++) {
    pa.push({ x: 0.3 + (seed(i + 1) - 0.5) * 0.18, y: 0.5 + (seed(i + 80) - 0.5) * 0.18 });
    pb.push({ x: 0.6 + (seed(i + 500) - 0.5) * 0.5, y: 0.5 + (seed(i + 700) - 0.5) * 0.5 });
  }
  // Kvadratisk grense: tegnes som en buet kurve som omslutter klasse A.
  const curve: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 2;
    const cx = 0.42 + Math.cos(t) * 0.13;
    const cy = 0.5 + Math.sin(t) * 0.13;
    curve.push(`${X(cx)},${Y(cy)}`);
  }
  return (
    <figure className="my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto text-foreground">
        <text x={W / 2} y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
          QDA — ulik kovarians ⇒ buet grense
        </text>
        <rect x="20" y="20" width={W - 40} height={H - 50} fill="none" stroke={STROKE} strokeWidth="0.5" />
        {/* Liten ellipse A */}
        <ellipse cx={X(0.3)} cy={Y(0.5)} rx="22" ry="22" fill={BRAND(15)} stroke={STROKE} strokeWidth="0.6" />
        {/* Stor ellipse B */}
        <ellipse cx={X(0.6)} cy={Y(0.5)} rx="60" ry="50" fill={DESTR(15)} stroke={STROKE} strokeWidth="0.6" />
        {/* Beslutningsgrense (lukket buet) */}
        <polyline fill="none" stroke={STROKE} strokeWidth="1.5" points={curve.join(" ")} />
        {pa.map((p, i) => (
          <circle key={`a-${i}`} cx={X(p.x)} cy={Y(p.y)} r="2" fill={BRAND(80)} stroke={STROKE} strokeWidth="0.3" />
        ))}
        {pb.map((p, i) => (
          <circle key={`b-${i}`} cx={X(p.x)} cy={Y(p.y)} r="2" fill={DESTR(80)} stroke={STROKE} strokeWidth="0.3" />
        ))}
      </svg>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
        QDA estimerer egen Σ_k per klasse — grensa blir kvadratisk
        (ellipse/hyperbel). Lavere bias, høyere varians.
      </figcaption>
    </figure>
  );
};

// ---------- Naive Bayes — uavhengighet visualisert -------
export const NaiveBayesIndependence: FC = () => {
  // To paneler: ekte felles tetthet (korrelert) vs NB-antagelse (produkt av marginale)
  const W = 220, H = 200;
  const X = (x: number) => 20 + x * (W - 40);
  const Y = (y: number) => H - 30 - y * (H - 50);
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-foreground">
            <text x={W / 2} y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
              Ekte P(x₁, x₂ | y)
            </text>
            <rect x="20" y="20" width={W - 40} height={H - 50} fill="none" stroke={STROKE} strokeWidth="0.5" />
            <ellipse
              cx={X(0.5)}
              cy={Y(0.5)}
              rx="56"
              ry="22"
              transform={`rotate(35 ${X(0.5)} ${Y(0.5)})`}
              fill={BRAND(35)}
              stroke={STROKE}
            />
            <text x={W / 2} y={H - 10} textAnchor="middle" className="text-[9px] fill-current opacity-70">
              korrelert
            </text>
          </svg>
        </div>
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-foreground">
            <text x={W / 2} y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
              NB-antagelse: P(x₁|y)·P(x₂|y)
            </text>
            <rect x="20" y="20" width={W - 40} height={H - 50} fill="none" stroke={STROKE} strokeWidth="0.5" />
            <ellipse cx={X(0.5)} cy={Y(0.5)} rx="55" ry="32" fill={SUCCESS(35)} stroke={STROKE} />
            <text x={W / 2} y={H - 10} textAnchor="middle" className="text-[9px] fill-current opacity-70">
              akse-justert
            </text>
          </svg>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Naive Bayes antar at features er betinget uavhengige gitt klassen —
        modellen er aksejustert, ikke rotert. Antagelsen er nesten alltid usann
        men gir få parametre.
      </figcaption>
    </figure>
  );
};

// ---------- Bayes-klassifikator: posterior fra likelihood + prior -----
export const BayesClassifierFig: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      <text x="190" y="16" textAnchor="middle" className="text-[11px] fill-current font-semibold">
        P(y=k | x) = π_k · f_k(x) / Σⱼ π_j · f_j(x)
      </text>
      {/* prior */}
      <rect x="20" y="50" width="80" height="50" fill={BRAND(30)} stroke={STROKE} />
      <text x="60" y="70" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">π_k</text>
      <text x="60" y="86" textAnchor="middle" className="text-[9px] fill-current opacity-70">prior</text>
      <text x="60" y="115" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        hvor vanlig klassen er
      </text>
      {/* likelihood */}
      <rect x="130" y="50" width="80" height="50" fill={SUCCESS(30)} stroke={STROKE} />
      <text x="170" y="70" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">f_k(x)</text>
      <text x="170" y="86" textAnchor="middle" className="text-[9px] fill-current opacity-70">likelihood</text>
      <text x="170" y="115" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        hvor sannsynlig x er
      </text>
      {/* posterior */}
      <rect x="280" y="50" width="80" height="50" fill={DESTR(30)} stroke={STROKE} />
      <text x="320" y="70" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">P(y|x)</text>
      <text x="320" y="86" textAnchor="middle" className="text-[9px] fill-current opacity-70">posterior</text>
      <text x="320" y="115" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        velg klassen med MAX
      </text>
      <path d="M100 75 L 128 75" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrBC)" />
      <path d="M210 75 L 278 75" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrBC)" />
      <text x="245" y="68" textAnchor="middle" className="text-[9px] fill-current opacity-70">normaliser</text>
      <text x="190" y="150" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Bayes-klassifikatoren har lavest mulig feilrate (Bayes-feilen).
      </text>
      <defs>
        <marker id="arrBC" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Generative klassifikatorer estimerer π_k og f_k(x) separat, og bruker
      Bayes for å rangere klassene.
    </figcaption>
  </figure>
);

// ---------- LDA vs QDA — når velge hva ---------------
export const LdaVsQdaTradeoff: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-md mx-auto text-[11px]">
      <div className="rounded border border-border p-3">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">LDA</div>
        <ul className="text-[10px] space-y-1">
          <li>• 1 felles Σ — få parametre</li>
          <li>• Lav varians, høyere bias</li>
          <li>• Bra ved lite data per klasse</li>
          <li>• Lineær grense</li>
        </ul>
      </div>
      <div className="rounded border border-border p-3">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">QDA</div>
        <ul className="text-[10px] space-y-1">
          <li>• K kovarianser Σ_k</li>
          <li>• Lav bias, høyere varians</li>
          <li>• Krever mye data per klasse</li>
          <li>• Kvadratisk grense</li>
        </ul>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Klassisk bias-varians-tradeoff — flere parametre = mer fleksibilitet,
      men trenger mer data for å estimere stabilt.
    </figcaption>
  </figure>
);

// ====================================================================
// REGISTRY
// ====================================================================

export const STAT_MODELL_VISUALS: Record<string, FC> = {
  // Regresjon
  "stat-mod-pearson-r": PearsonR,
  "stat-mod-ols-fit": OlsFit,
  "stat-mod-r-squared": RSquaredDecomp,
  "stat-mod-residual-patterns": ResidualPatterns,
  "stat-mod-corr-vs-causation": CorrVsCausation,
  // Regresjon-diagnostikk
  "stat-mod-ols-assumptions": OlsAssumptions,
  "stat-mod-hetero": Heteroskedasticity,
  "stat-mod-qq": QQPlot,
  "stat-mod-outlier-leverage": OutlierLeverageInfluence,
  "stat-mod-r2-vs-adj": RSquaredVsAdj,
  "stat-mod-multicollinearity": MulticollinearityVenn,
  // ANOVA
  "stat-mod-anova-between-within": AnovaBetweenWithin,
  "stat-mod-anova-ss-decomp": AnovaSsDecomp,
  "stat-mod-f-dist": FDistribution,
  "stat-mod-fwer": FwerCurve,
  // CV
  "stat-mod-kfold": KFoldGrid,
  "stat-mod-loocv": LoocvVsKfold,
  "stat-mod-stratified": StratifiedKFold,
  "stat-mod-group-kfold": GroupKFoldFig,
  "stat-mod-time-series-split": TimeSeriesSplit,
  "stat-mod-cv-bias-var": CvBiasVariance,
  "stat-mod-cv-leakage": CvPipelineLeakage,
  // Logistisk regresjon
  "stat-mod-sigmoid": SigmoidCurve,
  "stat-mod-roc": RocCurve,
  "stat-mod-log-loss": LogLossVsMse,
  "stat-mod-softmax": SoftmaxBars,
  "stat-mod-class-imbalance": ClassImbalance,
  "stat-mod-perfect-separation": PerfectSeparation,
  // LDA / QDA / NB
  "stat-mod-generative-vs-discr": GenerativeVsDiscriminative,
  "stat-mod-lda-boundary": LdaBoundary,
  "stat-mod-qda-boundary": QdaBoundary,
  "stat-mod-nb-independence": NaiveBayesIndependence,
  "stat-mod-bayes-classifier": BayesClassifierFig,
  "stat-mod-lda-vs-qda": LdaVsQdaTradeoff,
};
