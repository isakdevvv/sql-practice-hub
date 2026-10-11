import { useMemo, useState } from "react";
import { Shuffle, Target } from "lucide-react";

// --------------------------------------------------------------------------
// KonfidensintervallSim — viser hva "95 % konfidens" faktisk betyr:
// generer mange utvalg fra N(μ, σ²), bygg CI for hvert, fargelegg rødt
// hvis det BOMMER på det sanne μ. Med 95 % nivå skal ~5 % bomme.
// Adressér den klassiske tolkningsfella i seksjon #eksamen.
// --------------------------------------------------------------------------

type Level = 0.9 | 0.95 | 0.99;
const Z: Record<Level, number> = { 0.9: 1.645, 0.95: 1.96, 0.99: 2.576 };

const TRUE_MU = 100;
const SIGMA = 15;
const W = 540;
const H = 320;
const PAD_T = 18;
const PAD_B = 28;
const PAD_L = 50;
const PAD_R = 12;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randNormal(rng: () => number) {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function KonfidensintervallSim() {
  const [n, setN] = useState(25);
  const [level, setLevel] = useState<Level>(0.95);
  const [numCIs, setNumCIs] = useState(50);
  const [seed, setSeed] = useState(3);

  const intervals = useMemo(() => {
    const rng = mulberry32(seed);
    const out: { lo: number; hi: number; mean: number; miss: boolean }[] = [];
    const z = Z[level];
    for (let i = 0; i < numCIs; i++) {
      let sum = 0;
      let sumSq = 0;
      for (let j = 0; j < n; j++) {
        const x = TRUE_MU + SIGMA * randNormal(rng);
        sum += x;
        sumSq += x * x;
      }
      const mean = sum / n;
      const variance = (sumSq - (sum * sum) / n) / (n - 1);
      const s = Math.sqrt(Math.max(0, variance));
      const se = s / Math.sqrt(n);
      const lo = mean - z * se;
      const hi = mean + z * se;
      out.push({ lo, hi, mean, miss: TRUE_MU < lo || TRUE_MU > hi });
    }
    return out;
  }, [seed, n, level, numCIs]);

  const missCount = intervals.filter((iv) => iv.miss).length;
  const missPct = (missCount / intervals.length) * 100;
  const expectedMissPct = (1 - level) * 100;

  // X-akse range: dekker alle CI-er + true μ med padding.
  const allEdges = intervals.flatMap((iv) => [iv.lo, iv.hi]).concat([TRUE_MU]);
  const xMin = Math.min(...allEdges) - 2;
  const xMax = Math.max(...allEdges) + 2;

  const x = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * (W - PAD_L - PAD_R);
  const rowH = (H - PAD_T - PAD_B) / numCIs;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Konfidensnivå</span>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {([0.9, 0.95, 0.99] as Level[]).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={
                  "px-2 py-1 text-xs " +
                  (level === l
                    ? "bg-brand text-white"
                    : "bg-card hover:bg-muted/40")
                }
              >
                {(l * 100).toFixed(0)} %
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">utvalgsstørrelse n</span>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="font-mono w-8 text-right">{n}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">antall CI</span>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={numCIs}
            onChange={(e) => setNumCIs(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="font-mono w-8 text-right">{numCIs}</span>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <Shuffle className="h-3.5 w-3.5" /> Nye utvalg
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* True μ-linje */}
          <line
            x1={x(TRUE_MU)}
            x2={x(TRUE_MU)}
            y1={PAD_T - 4}
            y2={H - PAD_B + 4}
            stroke="rgb(34,197,94)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={x(TRUE_MU) + 4}
            y={PAD_T + 8}
            fontSize={10}
            fill="rgb(34,197,94)"
          >
            sann μ = {TRUE_MU}
          </text>

          {/* X-akse tick-merker */}
          {[xMin, (xMin + xMax) / 2, xMax].map((v, i) => (
            <g key={i}>
              <line
                x1={x(v)}
                x2={x(v)}
                y1={H - PAD_B}
                y2={H - PAD_B + 3}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <text
                x={x(v)}
                y={H - PAD_B + 14}
                textAnchor="middle"
                fontSize={9}
                className="fill-muted-foreground"
              >
                {v.toFixed(1)}
              </text>
            </g>
          ))}

          {/* CI-linjer */}
          {intervals.map((iv, i) => {
            const yPos = PAD_T + (i + 0.5) * rowH;
            const color = iv.miss ? "rgb(239,68,68)" : "rgb(148,163,184)";
            return (
              <g key={i}>
                <line
                  x1={x(iv.lo)}
                  x2={x(iv.hi)}
                  y1={yPos}
                  y2={yPos}
                  stroke={color}
                  strokeWidth={Math.max(1, rowH * 0.55)}
                  strokeOpacity={iv.miss ? 0.95 : 0.55}
                />
                <circle cx={x(iv.mean)} cy={yPos} r={1.6} fill={color} />
              </g>
            );
          })}

          {/* Y-aksetekst */}
          <text
            x={PAD_L - 6}
            y={PAD_T + 6}
            textAnchor="end"
            fontSize={9}
            className="fill-muted-foreground"
          >
            utvalg #1
          </text>
          <text
            x={PAD_L - 6}
            y={H - PAD_B}
            textAnchor="end"
            fontSize={9}
            className="fill-muted-foreground"
          >
            #{numCIs}
          </text>
          <text
            x={(W + PAD_L - PAD_R) / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            className="fill-muted-foreground"
          >
            CI for μ (samme prosedyre, forskjellige utvalg)
          </text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 bg-slate-400/55 rounded-sm" /> dekker μ
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 bg-red-500/90 rounded-sm" /> bommer
        </div>
        <div
          className={
            "flex items-center gap-1.5 " +
            (Math.abs(missPct - expectedMissPct) < expectedMissPct
              ? "text-emerald-500"
              : "text-amber-500")
          }
        >
          <Target className="h-3.5 w-3.5" /> bommer{" "}
          <span className="font-mono">
            {missCount}/{numCIs} = {missPct.toFixed(1)} %
          </span>{" "}
          <span className="text-muted-foreground">
            (forventet ~{expectedMissPct.toFixed(0)} %)
          </span>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-muted-foreground leading-snug">
        <span className="font-semibold text-foreground">Hva å se etter:</span>{" "}
        Hver vannrett linje er ett CI bygd fra ett uavhengig utvalg av samme
        populasjon (μ = 100, σ = 15). Det er prosedyren — ikke et enkelt
        intervall — som har 95 % treffrate. Bytt nivå til 99 %: intervallene
        blir bredere, men færre bommer. Reduser n til 5: intervallene blir
        bredere fordi standardfeilen vokser. Et bestemt intervall enten dekker
        μ eller ikke — det er ingen "95 % sannsynlighet" på det enkelte
        utvalget.
      </p>
    </div>
  );
}
