import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import { Power, Target, Activity } from "lucide-react";

// --------------------------------------------------------------------------
// FDistributionExplorer
//
// Tre tett-koblede moduser i samme komponent:
//   1. "shape"  — hvordan endrer F-PDF seg når df1, df2 vokser?
//   2. "tail"   — slide F-obs og se hvor i halen den lander → p-verdi.
//   3. "power"  — gitt ekte effektstørrelse, hva er sannsynligheten for å forkaste H0?
//
// Krever ikke import av AnovaVisualizer (egen kopi av regIncBeta + fPdf for
// å holde komponenten selvstendig).
// --------------------------------------------------------------------------

// ------ Statistikk-helpers (selvstendige kopier) ------
function logGamma(x: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-7;
  const FPMIN = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function regIncBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbt =
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(lbt);
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

function fSurvival(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  const x = df2 / (df2 + df1 * f);
  return regIncBeta(x, df2 / 2, df1 / 2);
}

function fPdf(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0;
  const log =
    (df1 / 2) * Math.log(df1 / df2) +
    (df1 / 2 - 1) * Math.log(f) -
    ((df1 + df2) / 2) * Math.log(1 + (df1 * f) / df2) +
    logGamma((df1 + df2) / 2) -
    logGamma(df1 / 2) -
    logGamma(df2 / 2);
  return Math.exp(log);
}

function fQuantile(p: number, df1: number, df2: number): number {
  let lo = 0;
  let hi = 100;
  for (let it = 0; it < 60; it++) {
    const mid = (lo + hi) / 2;
    const s = fSurvival(mid, df1, df2);
    if (s > p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// Ikke-sentral F: CDF via Patnaik-tilnærmelse (god nok for power-illustrasjon).
// Power = P(F* > F_crit) der F* har ikke-sentral F med ncp λ.
// Patnaik: ikke-sentral F(df1, df2, λ) ≈ c * F(h, df2), der
//   c = (df1 + λ) / df1, h = (df1 + λ)^2 / (df1 + 2λ)
function powerNoncentralF(
  alpha: number,
  df1: number,
  df2: number,
  lambda: number,
): number {
  const fCrit = fQuantile(alpha, df1, df2);
  if (lambda <= 0) return alpha;
  const c = (df1 + lambda) / df1;
  const h = ((df1 + lambda) ** 2) / (df1 + 2 * lambda);
  // P(F* > fCrit) = P(c * F(h, df2) > fCrit) = P(F(h, df2) > fCrit / c)
  return fSurvival(fCrit / c, h, df2);
}

type Mode = "shape" | "tail" | "power";

const MODES: { id: Mode; label: string; icon: typeof Activity; sub: string }[] = [
  { id: "shape", label: "F-formen", icon: Activity, sub: "df1, df2 → fasong" },
  { id: "tail", label: "Hale + p-verdi", icon: Target, sub: "F-obs → p" },
  { id: "power", label: "Power", icon: Power, sub: "ekte effekt → 1-β" },
];

export function FDistributionExplorer() {
  const [mode, setMode] = useState<Mode>("shape");
  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="F-fordeling utforsker"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Dybde-simulator
        </div>
        <div className="text-sm font-semibold mb-2">
          F-fordelingen — form, p-verdi og styrke (power)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  mode === m.id
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:bg-muted"
                }`}
                title={m.sub}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-5">
        {mode === "shape" && <ShapeMode />}
        {mode === "tail" && <TailMode />}
        {mode === "power" && <PowerMode />}
      </div>
    </div>
  );
}

// ============ MODE 1: SHAPE ============

function ShapeMode() {
  const [df1, setDf1] = useState<number>(5);
  const [df2, setDf2] = useState<number>(20);
  const [overlay, setOverlay] = useState<boolean>(true);

  const W = 560;
  const H = 240;
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xMax = 5;

  const xOf = (x: number) => padL + (x / xMax) * plotW;

  const main = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * xMax;
      pts.push({ x, y: fPdf(x, df1, df2) });
    }
    return pts;
  }, [df1, df2]);

  // Reference curves at fixed df-konfigurasjoner
  const refs = useMemo(() => {
    const cfg: Array<{ df1: number; df2: number; color: string; label: string }> = [
      { df1: 1, df2: 10, color: "hsl(0 70% 55%)", label: "F(1,10)" },
      { df1: 5, df2: 30, color: "hsl(140 60% 45%)", label: "F(5,30)" },
      { df1: 10, df2: 100, color: "hsl(280 60% 55%)", label: "F(10,100)" },
    ];
    return cfg.map((c) => {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= 200; i++) {
        const x = (i / 200) * xMax;
        pts.push({ x, y: fPdf(x, c.df1, c.df2) });
      }
      return { ...c, pts };
    });
  }, []);

  const yMax =
    Math.max(
      0.0001,
      ...main.map((p) => p.y),
      ...(overlay ? refs.flatMap((r) => r.pts.map((p) => p.y)) : []),
    ) * 1.1;
  const yOf = (y: number) => padT + (1 - y / yMax) * plotH;

  const pathOf = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.x)} ${yOf(p.y)}`).join(" ");

  const mean = df2 > 2 ? df2 / (df2 - 2) : Number.POSITIVE_INFINITY;
  const variance =
    df2 > 4
      ? (2 * df2 ** 2 * (df1 + df2 - 2)) /
        (df1 * (df2 - 2) ** 2 * (df2 - 4))
      : Number.POSITIVE_INFINITY;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            df<sub>1</sub> (mellom) = {df1}
          </span>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={df1}
            onChange={(e) => setDf1(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            df<sub>2</sub> (innenfor) = {df2}
          </span>
          <input
            type="range"
            min={2}
            max={200}
            step={1}
            value={df2}
            onChange={(e) => setDf2(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs flex items-center gap-2 pt-4">
          <input
            type="checkbox"
            checked={overlay}
            onChange={(e) => setOverlay(e.target.checked)}
          />
          Sammenlign med F(1,10), F(5,30), F(10,100)
        </label>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded bg-background"
      >
        {/* x-akse-ticks */}
        {Array.from({ length: 6 }, (_, i) => (i / 5) * xMax).map((v) => (
          <g key={v}>
            <line
              x1={xOf(v)}
              y1={padT + plotH}
              x2={xOf(v)}
              y2={padT + plotH + 4}
              stroke="hsl(0 0% 60%)"
            />
            <text
              x={xOf(v)}
              y={padT + plotH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="hsl(0 0% 45%)"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="hsl(0 0% 60%)"
        />

        {/* reference curves */}
        {overlay &&
          refs.map((r) => (
            <path
              key={r.label}
              d={pathOf(r.pts)}
              fill="none"
              stroke={r.color}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
          ))}

        {/* hovedkurve */}
        <path
          d={pathOf(main)}
          fill="hsl(220 70% 55% / 0.12)"
          stroke="hsl(220 70% 45%)"
          strokeWidth={2}
        />

        {/* legend */}
        {overlay && (
          <g transform={`translate(${padL + plotW - 130}, ${padT + 6})`}>
            <rect width={126} height={56} fill="white" fillOpacity={0.85} rx={3} />
            {refs.map((r, i) => (
              <g key={r.label} transform={`translate(6, ${10 + i * 14})`}>
                <line x1={0} y1={4} x2={18} y2={4} stroke={r.color} strokeDasharray="3 3" />
                <text x={24} y={7} fontSize={9} fill="hsl(0 0% 30%)">
                  {r.label}
                </text>
              </g>
            ))}
          </g>
        )}

        <text x={padL + plotW} y={H - 4} textAnchor="end" fontSize={9} fill="hsl(0 0% 40%)">
          F-verdi
        </text>
      </svg>

      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <Box label="Forventet F under H₀">
          {Number.isFinite(mean) ? mean.toFixed(3) : "—"}
          <span className="text-muted-foreground"> (df₂/(df₂−2))</span>
        </Box>
        <Box label="Varians">
          {Number.isFinite(variance) ? variance.toFixed(2) : "—"}
        </Box>
        <Box label="Modus">
          {df1 > 2 ? (((df1 - 2) / df1) * (df2 / (df2 + 2))).toFixed(3) : "0"}
        </Box>
      </div>

      <p className="text-xs text-muted-foreground">
        Når df<sub>2</sub> → ∞ trekker tyngdepunktet seg mot 1. Når df<sub>1</sub>{" "}
        er liten er fordelingen veldig skjev og halen er tykk — det krever større
        F-verdier for å forkaste H₀.
      </p>
    </div>
  );
}

// ============ MODE 2: TAIL + p-verdi ============

function TailMode() {
  const [df1, setDf1] = useState<number>(3);
  const [df2, setDf2] = useState<number>(20);
  const [fObs, setFObs] = useState<number>(3.5);

  const W = 560;
  const H = 240;
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const crit05 = fQuantile(0.05, df1, df2);
  const crit01 = fQuantile(0.01, df1, df2);
  const xMax = Math.max(6, crit01 * 1.3, fObs * 1.2);
  const xOf = (x: number) => padL + (x / xMax) * plotW;

  const pdf = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 280; i++) {
      const x = (i / 280) * xMax;
      pts.push({ x, y: fPdf(x, df1, df2) });
    }
    return pts;
  }, [df1, df2, xMax]);

  const yMax = Math.max(0.0001, ...pdf.map((p) => p.y)) * 1.12;
  const yOf = (y: number) => padT + (1 - y / yMax) * plotH;

  const pdfPath = pdf
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.x)} ${yOf(p.y)}`)
    .join(" ");

  const tailPts = pdf.filter((p) => p.x >= fObs);
  const tailPath =
    tailPts.length === 0
      ? ""
      : `M ${xOf(tailPts[0].x)} ${yOf(0)} ` +
        tailPts.map((p) => `L ${xOf(p.x)} ${yOf(p.y)}`).join(" ") +
        ` L ${xOf(tailPts[tailPts.length - 1].x)} ${yOf(0)} Z`;

  const p = fSurvival(fObs, df1, df2);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            df<sub>1</sub> = {df1}
          </span>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={df1}
            onChange={(e) => setDf1(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            df<sub>2</sub> = {df2}
          </span>
          <input
            type="range"
            min={2}
            max={100}
            step={1}
            value={df2}
            onChange={(e) => setDf2(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            F-observert = {fObs.toFixed(2)}
          </span>
          <input
            type="range"
            min={0}
            max={12}
            step={0.05}
            value={fObs}
            onChange={(e) => setFObs(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded bg-background"
      >
        {/* x-akse */}
        {Array.from({ length: 7 }, (_, i) => (i / 6) * xMax).map((v) => (
          <g key={v}>
            <line
              x1={xOf(v)}
              y1={padT + plotH}
              x2={xOf(v)}
              y2={padT + plotH + 4}
              stroke="hsl(0 0% 60%)"
            />
            <text
              x={xOf(v)}
              y={padT + plotH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="hsl(0 0% 45%)"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="hsl(0 0% 60%)"
        />

        {/* hale-skygge (p-verdi) */}
        <path d={tailPath} fill="hsl(0 75% 55%)" fillOpacity={0.32} />

        {/* pdf */}
        <path d={pdfPath} fill="none" stroke="hsl(220 70% 45%)" strokeWidth={1.8} />

        {/* kritiske verdier */}
        <line
          x1={xOf(crit05)}
          y1={padT}
          x2={xOf(crit05)}
          y2={padT + plotH}
          stroke="hsl(30 80% 50%)"
          strokeDasharray="4 3"
          strokeWidth={1.1}
        />
        <text x={xOf(crit05) + 3} y={padT + 12} fontSize={9} fill="hsl(30 80% 40%)">
          F₀.₀₅ = {crit05.toFixed(2)}
        </text>
        <line
          x1={xOf(crit01)}
          y1={padT}
          x2={xOf(crit01)}
          y2={padT + plotH}
          stroke="hsl(0 60% 50%)"
          strokeDasharray="2 3"
          strokeWidth={1.1}
        />
        <text x={xOf(crit01) + 3} y={padT + 24} fontSize={9} fill="hsl(0 60% 40%)">
          F₀.₀₁ = {crit01.toFixed(2)}
        </text>

        {/* F-obs */}
        <line
          x1={xOf(fObs)}
          y1={padT}
          x2={xOf(fObs)}
          y2={padT + plotH}
          stroke="hsl(0 80% 40%)"
          strokeWidth={1.6}
        />
        <text x={xOf(fObs) + 4} y={padT + 38} fontSize={9} fill="hsl(0 80% 40%)" fontWeight={600}>
          F-obs = {fObs.toFixed(2)}
        </text>
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Box label="p-verdi">
          <span className={p < 0.05 ? "text-emerald-500 font-semibold" : ""}>
            {p < 1e-4 ? "<0.0001" : p.toFixed(4)}
          </span>
        </Box>
        <Box label="α = 0.05">
          {fObs > crit05 ? (
            <span className="text-emerald-500">forkast H₀</span>
          ) : (
            <span className="text-muted-foreground">behold</span>
          )}
        </Box>
        <Box label="α = 0.01">
          {fObs > crit01 ? (
            <span className="text-emerald-500">forkast H₀</span>
          ) : (
            <span className="text-muted-foreground">behold</span>
          )}
        </Box>
        <Box label="Hale-areal">
          {(p * 100).toFixed(2)} %
        </Box>
      </div>

      <p className="text-xs text-muted-foreground">
        p-verdien er <em>arealet</em> til høyre for F-obs. Når den røde stiplede
        linja (F<sub>0.05</sub>) ligger til høyre for F-obs har p-verdien blitt
        større enn 0.05 — vi beholder H₀.
      </p>
    </div>
  );
}

// ============ MODE 3: POWER ============

function PowerMode() {
  const [k, setK] = useState<number>(3);
  const [n, setN] = useState<number>(10);
  const [effect, setEffect] = useState<number>(0.4); // Cohen's f
  const [alpha, setAlpha] = useState<number>(0.05);

  const df1 = k - 1;
  const df2 = k * (n - 1);
  const N = k * n;
  // Non-centrality parameter for ANOVA: λ = N * f^2 (Cohen)
  const lambda = N * effect * effect;
  const power = powerNoncentralF(alpha, df1, df2, lambda);
  const fCrit = fQuantile(alpha, df1, df2);

  // Plot: H0-PDF og H1-PDF (sentral og ikke-sentral via Patnaik) på samme akse
  const W = 560;
  const H = 240;
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  // For Patnaik: H1-PDF tilnærmet som c * pdf_h på skalert akse.
  // For å plotte: bruk h og df2, samt c-skalering på x.
  const c = (df1 + lambda) / df1;
  const h = ((df1 + lambda) ** 2) / (df1 + 2 * lambda);
  const xMax = Math.max(6, fCrit * 2.5, c * 4);
  const xOf = (x: number) => padL + (x / xMax) * plotW;

  const h0 = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * xMax;
      pts.push({ x, y: fPdf(x, df1, df2) });
    }
    return pts;
  }, [df1, df2, xMax]);

  const h1 = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    if (lambda <= 0) return pts;
    for (let i = 0; i <= 240; i++) {
      const x = (i / 240) * xMax;
      // PDF for c*F(h,df2): f_X(x) = (1/c) * f_F(h,df2)(x/c)
      pts.push({ x, y: (1 / c) * fPdf(x / c, h, df2) });
    }
    return pts;
  }, [c, h, df2, lambda, xMax]);

  const yMax =
    Math.max(0.0001, ...h0.map((p) => p.y), ...h1.map((p) => p.y)) * 1.1;
  const yOf = (y: number) => padT + (1 - y / yMax) * plotH;

  const pathOf = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.x)} ${yOf(p.y)}`).join(" ");

  // Power-skygge: hale av H1 til høyre for F-crit
  const powerPts = h1.filter((p) => p.x >= fCrit);
  const powerPath =
    powerPts.length === 0
      ? ""
      : `M ${xOf(powerPts[0].x)} ${yOf(0)} ` +
        powerPts.map((p) => `L ${xOf(p.x)} ${yOf(p.y)}`).join(" ") +
        ` L ${xOf(powerPts[powerPts.length - 1].x)} ${yOf(0)} Z`;

  // Effekt-tekst etter Cohen
  const effLabel =
    effect < 0.15
      ? "liten effekt"
      : effect < 0.3
      ? "moderat–liten effekt"
      : effect < 0.5
      ? "moderat effekt"
      : "stor effekt";

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            k (antall grupper) = {k}
          </span>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            n per gruppe = {n} (N = {N})
          </span>
          <input
            type="range"
            min={3}
            max={60}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            Effektstørrelse Cohen's f = {effect.toFixed(2)} <em>({effLabel})</em>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={effect}
            onChange={(e) => setEffect(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="text-xs block">
          <span className="block text-muted-foreground mb-0.5">
            α = {alpha.toFixed(3)}
          </span>
          <input
            type="range"
            min={0.001}
            max={0.2}
            step={0.001}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full border border-border rounded bg-background"
      >
        {Array.from({ length: 7 }, (_, i) => (i / 6) * xMax).map((v) => (
          <g key={v}>
            <line
              x1={xOf(v)}
              y1={padT + plotH}
              x2={xOf(v)}
              y2={padT + plotH + 4}
              stroke="hsl(0 0% 60%)"
            />
            <text
              x={xOf(v)}
              y={padT + plotH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="hsl(0 0% 45%)"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="hsl(0 0% 60%)"
        />

        {/* power-skygge */}
        <path d={powerPath} fill="hsl(140 70% 45%)" fillOpacity={0.32} />

        {/* H0 */}
        <path d={pathOf(h0)} fill="none" stroke="hsl(220 60% 50%)" strokeWidth={1.6} />
        {/* H1 */}
        <path
          d={pathOf(h1)}
          fill="none"
          stroke="hsl(140 70% 35%)"
          strokeWidth={1.6}
          strokeDasharray={lambda <= 0 ? "1 3" : ""}
        />

        {/* kritisk verdi */}
        <line
          x1={xOf(fCrit)}
          y1={padT}
          x2={xOf(fCrit)}
          y2={padT + plotH}
          stroke="hsl(30 80% 50%)"
          strokeDasharray="4 3"
          strokeWidth={1.2}
        />
        <text x={xOf(fCrit) + 3} y={padT + 12} fontSize={9} fill="hsl(30 80% 40%)">
          F_crit = {fCrit.toFixed(2)}
        </text>

        {/* legend */}
        <g transform={`translate(${padL + 6}, ${padT + 6})`}>
          <rect width={170} height={42} fill="white" fillOpacity={0.85} rx={3} />
          <line x1={6} y1={12} x2={26} y2={12} stroke="hsl(220 60% 50%)" strokeWidth={1.6} />
          <text x={32} y={15} fontSize={9} fill="hsl(0 0% 30%)">
            H₀: sentral F(df₁, df₂)
          </text>
          <line x1={6} y1={28} x2={26} y2={28} stroke="hsl(140 70% 35%)" strokeWidth={1.6} />
          <text x={32} y={31} fontSize={9} fill="hsl(0 0% 30%)">
            H₁: ikke-sentral F (λ = {lambda.toFixed(2)})
          </text>
        </g>
      </svg>

      <div className="grid sm:grid-cols-4 gap-2 text-xs">
        <Box label="Power (1 − β)">
          <span className={power > 0.8 ? "text-emerald-500 font-semibold" : ""}>
            {(power * 100).toFixed(1)} %
          </span>
        </Box>
        <Box label="Type II (β)">
          {((1 - power) * 100).toFixed(1)} %
        </Box>
        <Box label="ncp λ = N·f²">
          {lambda.toFixed(2)}
        </Box>
        <Box label="df (df₁, df₂)">
          ({df1}, {df2})
        </Box>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>Power-tommelfingerregel:</strong> sikt mot ≥ 80 %. Med Cohen's
        f = 0.25 (moderat) trenger man typisk ~50 obs per gruppe for 3 grupper for
        å nå 80 %. Liten effekt (f = 0.1) krever flere hundre. Skru opp n eller
        effektstørrelsen og se grønnflekken vokse.
      </p>
    </div>
  );
}

// ============ shared ============

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold">{children}</div>
    </div>
  );
}
