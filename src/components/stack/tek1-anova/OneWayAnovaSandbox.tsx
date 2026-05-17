import { useMemo, useRef, useState } from "react";
import { Tex } from "@/components/Tex";
import { RotateCcw, Shuffle } from "lucide-react";

// --------------------------------------------------------------------------
// OneWayAnovaSandbox
//
// Bruker kan dra observasjons-punkter opp/ned (endre verdi) eller bytte gruppe
// (dra horisontalt forbi gruppe-grensen). Live SST = SSB + SSW dekomponering,
// box-plots og F-test + p-verdi. Også en "Sjekk antagelser"-knapp som viser
// per-gruppe stdev og kvalitativ vurdering av lik-varians og normalitet.
// --------------------------------------------------------------------------

// ----- statistikk -----
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
  const MAXIT = 200, EPS = 3e-7, FPMIN = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function regIncBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const lbt = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(lbt);
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}
function fSurvival(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  const x = df2 / (df2 + df1 * f);
  return regIncBeta(x, df2 / 2, df1 / 2);
}
function gaussian(mu: number, sigma: number): number {
  const u1 = Math.max(1e-9, Math.random());
  const u2 = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

type Point = { id: number; group: number; value: number };

const GROUP_COLORS = [
  "hsl(220 70% 55%)",
  "hsl(140 60% 45%)",
  "hsl(30 90% 55%)",
  "hsl(280 60% 55%)",
];
const GROUP_LABELS = ["A", "B", "C", "D"];

function freshDataset(numGroups: number, perGroup: number): Point[] {
  const pts: Point[] = [];
  let id = 0;
  const muBase = 30;
  for (let g = 0; g < numGroups; g++) {
    const mu = muBase + g * 4;
    for (let i = 0; i < perGroup; i++) {
      pts.push({ id: id++, group: g, value: Math.round(gaussian(mu, 3) * 10) / 10 });
    }
  }
  return pts;
}

export function OneWayAnovaSandbox() {
  const [numGroups, setNumGroups] = useState<number>(3);
  const [points, setPoints] = useState<Point[]>(() => freshDataset(3, 8));
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef<number | null>(null);

  // groups slice
  const visibleGroups = useMemo(() => {
    const arr: Point[][] = Array.from({ length: numGroups }, () => []);
    for (const p of points) if (p.group < numGroups) arr[p.group].push(p);
    return arr;
  }, [points, numGroups]);

  // ANOVA stats
  const stats = useMemo(() => {
    const k = numGroups;
    let N = 0, grandSum = 0;
    for (const grp of visibleGroups) {
      N += grp.length;
      for (const p of grp) grandSum += p.value;
    }
    const grandMean = N === 0 ? 0 : grandSum / N;
    let SSB = 0, SSW = 0;
    const means: number[] = [];
    const stds: number[] = [];
    for (const grp of visibleGroups) {
      if (grp.length === 0) {
        means.push(grandMean);
        stds.push(0);
        continue;
      }
      const m = grp.reduce((a, p) => a + p.value, 0) / grp.length;
      means.push(m);
      SSB += grp.length * (m - grandMean) ** 2;
      let ss = 0;
      for (const p of grp) ss += (p.value - m) ** 2;
      SSW += ss;
      stds.push(grp.length > 1 ? Math.sqrt(ss / (grp.length - 1)) : 0);
    }
    const SST = SSB + SSW;
    const dfB = Math.max(1, k - 1);
    const dfW = Math.max(1, N - k);
    const MSB = SSB / dfB;
    const MSW = SSW / dfW;
    const F = MSW > 0 ? MSB / MSW : 0;
    const p = fSurvival(F, dfB, dfW);
    return { SSB, SSW, SST, dfB, dfW, MSB, MSW, F, p, N, grandMean, means, stds };
  }, [visibleGroups, numGroups]);

  // ----- SVG layout & dragging -----
  const W = 580;
  const H = 320;
  const padL = 46;
  const padR = 14;
  const padT = 16;
  const padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const allVals = points.map((p) => p.value);
  const lo = Math.min(...allVals, 10) - 4;
  const hi = Math.max(...allVals, 50) + 4;
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * plotH;
  const yToVal = (y: number) => lo + (1 - (y - padT) / plotH) * (hi - lo);
  const colW = plotW / numGroups;
  const groupCenterX = (g: number) => padL + (g + 0.5) * colW;
  const xToGroup = (x: number) => {
    const local = x - padL;
    let g = Math.floor(local / colW);
    if (g < 0) g = 0; if (g >= numGroups) g = numGroups - 1;
    return g;
  };

  function eventToSvg(e: React.PointerEvent | PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    return { x, y };
  }

  function onPointerDown(e: React.PointerEvent, id: number) {
    e.preventDefault();
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    draggingRef.current = id;
  }
  function onPointerMove(e: React.PointerEvent) {
    const id = draggingRef.current;
    if (id === null) return;
    const { x, y } = eventToSvg(e);
    const newVal = Math.max(lo, Math.min(hi, yToVal(y)));
    const newGroup = xToGroup(x);
    setPoints((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, value: Math.round(newVal * 10) / 10, group: newGroup }
          : p,
      ),
    );
  }
  function onPointerUp(e: React.PointerEvent) {
    draggingRef.current = null;
    try {
      (e.target as SVGElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  // ----- box-plot helpers -----
  function quantile(sorted: number[], q: number): number {
    if (sorted.length === 0) return 0;
    const idx = q * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  // ----- antagelser -----
  const maxStd = Math.max(...stats.stds, 1e-9);
  const minStd = Math.min(...stats.stds.filter((s) => s > 0), 1e-9);
  const varianceRatio = (maxStd / minStd) ** 2;
  const homoOk = varianceRatio < 4; // tommelfinger: ratio < 4 ⇒ ok

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Dybde-simulator
        </div>
        <div className="text-sm font-semibold">
          En-faktors ANOVA: dra punktene — se SS-dekomponering live
        </div>
        <p className="text-xs text-muted-foreground italic mt-1">
          Dra et punkt vertikalt for å endre verdi. Dra horisontalt forbi
          gruppe-grensen for å flytte det til en annen gruppe. SST = SSB + SSW
          oppdateres umiddelbart.
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Kontroller */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <label className="flex items-center gap-2">
            Antall grupper
            <select
              value={numGroups}
              onChange={(e) => setNumGroups(Number(e.target.value))}
              className="rounded border border-border bg-background px-2 py-1"
            >
              {[3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => setPoints(freshDataset(numGroups, 8))}
            className="inline-flex items-center gap-1 rounded border border-border bg-background px-2.5 py-1 hover:border-brand/40"
          >
            <Shuffle className="h-3 w-3" />
            Trekk nytt
          </button>
          <button
            onClick={() => {
              // Sett alle grupper til samme snitt — H0 sann
              setPoints((prev) =>
                prev.map((p, i) => ({
                  ...p,
                  value: Math.round(gaussian(35, 3) * 10) / 10,
                  group: i % numGroups,
                })),
              );
            }}
            className="rounded border border-border bg-background px-2.5 py-1 hover:border-brand/40"
          >
            Sett H₀ sann (alle ≈ 35)
          </button>
          <button
            onClick={() => {
              // Stor effekt — H0 falsk
              setPoints((prev) =>
                prev.map((p, i) => ({
                  ...p,
                  group: i % numGroups,
                  value: Math.round(gaussian(30 + (i % numGroups) * 8, 2) * 10) / 10,
                })),
              );
            }}
            className="rounded border border-border bg-background px-2.5 py-1 hover:border-brand/40"
          >
            Stor effekt
          </button>
          <button
            onClick={() => setShowAssumptions((v) => !v)}
            className="ml-auto rounded border border-border bg-background px-2.5 py-1 hover:border-brand/40"
          >
            {showAssumptions ? "Skjul" : "Sjekk"} antagelser
          </button>
        </div>

        {/* SVG plot */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full border border-border rounded bg-background touch-none select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* y-akse */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const v = lo + t * (hi - lo);
            return (
              <g key={t}>
                <line
                  x1={padL}
                  y1={yOf(v)}
                  x2={padL + plotW}
                  y2={yOf(v)}
                  stroke="hsl(0 0% 88%)"
                  strokeWidth={0.5}
                />
                <text
                  x={padL - 6}
                  y={yOf(v) + 3}
                  textAnchor="end"
                  fontSize={9}
                  fill="hsl(0 0% 50%)"
                >
                  {v.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* gruppe-skiller */}
          {Array.from({ length: numGroups + 1 }, (_, i) => padL + i * colW).map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={padT}
              x2={x}
              y2={padT + plotH}
              stroke="hsl(0 0% 92%)"
              strokeWidth={1}
            />
          ))}

          {/* grand mean */}
          <line
            x1={padL}
            y1={yOf(stats.grandMean)}
            x2={padL + plotW}
            y2={yOf(stats.grandMean)}
            stroke="hsl(0 0% 35%)"
            strokeDasharray="4 3"
            strokeWidth={1}
          />
          <text
            x={padL + plotW - 4}
            y={yOf(stats.grandMean) - 4}
            textAnchor="end"
            fontSize={9}
            fill="hsl(0 0% 35%)"
          >
            grand mean = {stats.grandMean.toFixed(2)}
          </text>

          {/* per gruppe: box, mean, label */}
          {visibleGroups.map((grp, g) => {
            const cx = groupCenterX(g);
            const color = GROUP_COLORS[g];
            const mean = stats.means[g];
            const sorted = grp.map((p) => p.value).sort((a, b) => a - b);
            const q1 = quantile(sorted, 0.25);
            const med = quantile(sorted, 0.5);
            const q3 = quantile(sorted, 0.75);
            const boxW = Math.min(60, colW * 0.55);
            return (
              <g key={g}>
                {/* box */}
                {grp.length > 1 && (
                  <>
                    <rect
                      x={cx - boxW / 2}
                      y={yOf(q3)}
                      width={boxW}
                      height={Math.max(1, yOf(q1) - yOf(q3))}
                      fill={color}
                      fillOpacity={0.1}
                      stroke={color}
                      strokeWidth={1}
                    />
                    <line
                      x1={cx - boxW / 2}
                      y1={yOf(med)}
                      x2={cx + boxW / 2}
                      y2={yOf(med)}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                  </>
                )}
                {/* gruppe-snitt */}
                <line
                  x1={cx - 20}
                  y1={yOf(mean)}
                  x2={cx + 20}
                  y2={yOf(mean)}
                  stroke={color}
                  strokeWidth={2.5}
                />
                <text
                  x={cx + 24}
                  y={yOf(mean) + 3}
                  fontSize={10}
                  fill={color}
                  fontWeight={600}
                >
                  {mean.toFixed(2)}
                </text>
                {/* label */}
                <text
                  x={cx}
                  y={H - 12}
                  textAnchor="middle"
                  fontSize={11}
                  fill="hsl(0 0% 30%)"
                  fontWeight={600}
                >
                  Gruppe {GROUP_LABELS[g]}
                </text>
                <text
                  x={cx}
                  y={H - 1}
                  textAnchor="middle"
                  fontSize={9}
                  fill="hsl(0 0% 55%)"
                >
                  n = {grp.length}
                </text>
              </g>
            );
          })}

          {/* punkter — dragable */}
          {points
            .filter((p) => p.group < numGroups)
            .map((p) => {
              const cx = groupCenterX(p.group);
              const jitter = ((p.id * 53) % 11) - 5; // deterministisk
              return (
                <circle
                  key={p.id}
                  cx={cx + jitter * 1.4}
                  cy={yOf(p.value)}
                  r={6}
                  fill={GROUP_COLORS[p.group]}
                  fillOpacity={0.85}
                  stroke="white"
                  strokeWidth={1.4}
                  style={{ cursor: "grab" }}
                  onPointerDown={(e) => onPointerDown(e, p.id)}
                />
              );
            })}
        </svg>

        {/* SS-bar */}
        <div className="space-y-2">
          <div className="text-xs font-semibold">
            Sum av kvadrater (SST = SSB + SSW)
          </div>
          <div className="flex h-6 overflow-hidden rounded border border-border">
            <div
              className="bg-brand text-[10px] text-white font-mono flex items-center justify-center"
              style={{ width: `${(stats.SSB / Math.max(stats.SST, 1e-9)) * 100}%` }}
              title="SSB"
            >
              SSB = {stats.SSB.toFixed(1)}
            </div>
            <div
              className="bg-amber-400 text-[10px] text-white font-mono flex items-center justify-center"
              style={{ width: `${(stats.SSW / Math.max(stats.SST, 1e-9)) * 100}%` }}
              title="SSW"
            >
              SSW = {stats.SSW.toFixed(1)}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground text-right font-mono">
            SST = {stats.SST.toFixed(2)} &nbsp; — &nbsp; η² = SSB/SST ={" "}
            {(stats.SSB / Math.max(stats.SST, 1e-9)).toFixed(3)}
          </div>
        </div>

        {/* F-test resultat */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <Box label="df">
            ({stats.dfB}, {stats.dfW})
          </Box>
          <Box label="MSB">{stats.MSB.toFixed(2)}</Box>
          <Box label="MSW">{stats.MSW.toFixed(2)}</Box>
          <Box label="F" highlight>
            {stats.F.toFixed(3)}
          </Box>
          <Box label="p" highlight={stats.p < 0.05} good={stats.p < 0.05}>
            {stats.p < 1e-4 ? "<0.0001" : stats.p.toFixed(4)}
          </Box>
        </div>

        {stats.p < 0.05 ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-xs">
            <span className="font-semibold text-emerald-600">
              p &lt; 0.05 — forkast H₀.
            </span>{" "}
            Minst én gruppe er forskjellig. Kjør post-hoc (Tukey HSD) for å finne
            hvilken — se neste simulator.
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
            p ≥ 0.05 — vi har ikke nok bevis til å forkaste H₀. Det betyr ikke
            at gruppene er like, bare at vi ikke kan vise at de er forskjellige
            med disse dataene.
          </div>
        )}

        {showAssumptions && (
          <div className="space-y-2 rounded-lg border border-border bg-background p-3 text-xs">
            <div className="font-semibold">Sjekk antagelsene</div>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded border border-border p-2">
                <div className="font-semibold mb-1">Lik varians (homoskedastisitet)</div>
                <ul className="space-y-1 font-mono">
                  {stats.stds.map((s, i) => (
                    <li key={i}>
                      <span style={{ color: GROUP_COLORS[i] }}>
                        ●
                      </span>{" "}
                      Gruppe {GROUP_LABELS[i]}: s = {s.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <div className="mt-1.5">
                  Varians-forhold (maks/min)² ={" "}
                  <span className="font-mono">{varianceRatio.toFixed(2)}</span>
                  {homoOk ? (
                    <span className="text-emerald-500"> — OK</span>
                  ) : (
                    <span className="text-red-500">
                      {" "}
                      — brutt (≥ 4). Bruk Welch's ANOVA.
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded border border-border p-2">
                <div className="font-semibold mb-1">Normalitet i hver gruppe</div>
                <p className="text-muted-foreground">
                  Med små <Tex>n</Tex> (her {Math.min(...visibleGroups.map((g) => g.length))})
                  er Q-Q-plot mest praktisk. Se egen «Antagelser»-simulator under
                  for visuell Q-Q og Levene's test.
                </p>
              </div>
            </div>
            <div className="rounded border border-amber-500/30 bg-amber-500/5 p-2">
              <span className="font-semibold">Hvis brutt:</span> Welch's ANOVA
              (ulik varians), Kruskal–Wallis (ikke-normal), eller
              log-transformasjon hvis dataene er høyreskjeve.
            </div>
          </div>
        )}

        <button
          onClick={() => setPoints(freshDataset(numGroups, 8))}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>
    </div>
  );
}

function Box({
  label,
  children,
  highlight,
  good,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  highlight?: boolean;
  good?: boolean;
}) {
  return (
    <div
      className={`rounded border px-3 py-2 ${
        highlight
          ? good
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-brand/40 bg-brand/5"
          : "border-border bg-background"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-sm font-semibold">{children}</div>
    </div>
  );
}
