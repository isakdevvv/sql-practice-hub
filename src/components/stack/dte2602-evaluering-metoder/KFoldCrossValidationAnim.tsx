import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// KFoldCrossValidationAnim — visualiserer k-fold cross-validation som k
// striper med rull-animasjon. Hver fold flytter VAL-blokken én stripe til
// høyre, scorer modellen på den, og samler en søyle-plot av per-fold-score.
//
// Slidere for k (3..10) og en "model-stabilitet"-knapp som styrer hvor
// stort spredet i fold-scoren er. Studenten ser: jo mer ustabil modell,
// jo større ± std. Sammenlign det med å bare se én tilfeldig train/test.
// --------------------------------------------------------------------------

type Stability = "stabil" | "middels" | "ustabil";

const STAB_STD: Record<Stability, number> = {
  stabil: 0.012,
  middels: 0.035,
  ustabil: 0.08,
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: () => number) {
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const STRIPE_H = 26;
const STRIPE_GAP = 6;
const ROW_W = 560;
const LABEL_W = 56;

export function KFoldCrossValidationAnim() {
  const [k, setK] = useState(5);
  const [stab, setStab] = useState<Stability>("middels");
  const [meanScore, setMeanScore] = useState(0.85);
  const [activeFold, setActiveFold] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Deterministisk score-array — én verdi per fold.
  const foldScores = useMemo(() => {
    const rng = mulberry32(Math.round(k * 100 + meanScore * 1000) ^ stab.length);
    const std = STAB_STD[stab];
    const arr: number[] = [];
    for (let i = 0; i < k; i++) {
      arr.push(Math.max(0.05, Math.min(0.99, meanScore + gauss(rng) * std)));
    }
    return arr;
  }, [k, meanScore, stab]);

  // Auto-play: roterer aktiv fold.
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setActiveFold((f) => (f + 1) % k);
    }, 700);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, k]);

  // Visning: én rad per fold (alle radene tegnes statisk for å vise mønsteret).
  const stripeW = (ROW_W - LABEL_W) / k;
  const totalH = k * (STRIPE_H + STRIPE_GAP) + 60; // ekstra plass til bunn-plot

  // Per-fold-score summert.
  const mean = foldScores.reduce((s, v) => s + v, 0) / foldScores.length;
  const variance = foldScores.reduce((s, v) => s + (v - mean) * (v - mean), 0) / foldScores.length;
  const sd = Math.sqrt(variance);

  // Søyle-plot bredde.
  const barPlotW = ROW_W;
  const barPlotH = 80;
  const barW = (barPlotW - LABEL_W) / k;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <span className="text-muted-foreground">k =</span>
        <input
          type="range"
          min={3}
          max={10}
          step={1}
          value={k}
          onChange={(e) => {
            const nk = parseInt(e.target.value, 10);
            setK(nk);
            setActiveFold((f) => Math.min(f, nk - 1));
          }}
          className="w-28"
        />
        <span className="font-mono text-muted-foreground w-6 text-center">{k}</span>
        <span className="text-muted-foreground ml-3">Modell-stabilitet:</span>
        {(["stabil", "middels", "ustabil"] as Stability[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStab(s)}
            className={`px-2 py-1 rounded border ${
              stab === s
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-muted-foreground ml-3">Mean-score:</span>
        <input
          type="range"
          min={0.5}
          max={0.99}
          step={0.01}
          value={meanScore}
          onChange={(e) => setMeanScore(parseFloat(e.target.value))}
          className="w-24"
        />
        <span className="font-mono text-muted-foreground w-10">{meanScore.toFixed(2)}</span>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-accent"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveFold(0);
            setPlaying(false);
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-accent"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Striper: én rad per fold */}
      <div className="text-xs text-muted-foreground mb-1">k-fold splittene — aktiv fold er fremhevet</div>
      <svg viewBox={`0 0 ${ROW_W} ${totalH}`} className="w-full">
        {foldScores.map((sc, fold) => {
          const y = fold * (STRIPE_H + STRIPE_GAP);
          const isActive = fold === activeFold;
          return (
            <g key={fold} opacity={isActive ? 1 : 0.55}>
              <text x={0} y={y + STRIPE_H / 2 + 4} fontSize="11" fill="currentColor">
                Fold {fold + 1}
              </text>
              {Array.from({ length: k }, (_, i) => {
                const isVal = i === fold;
                return (
                  <g key={i}>
                    <rect
                      x={LABEL_W + i * stripeW + 1}
                      y={y}
                      width={stripeW - 2}
                      height={STRIPE_H}
                      fill={isVal ? "rgb(234 179 8)" : "rgb(99 102 241)"}
                      fillOpacity={isVal ? 0.85 : 0.5}
                      stroke={isActive && isVal ? "rgb(234 179 8)" : "none"}
                      strokeWidth={isActive && isVal ? 2 : 0}
                    />
                    <text
                      x={LABEL_W + i * stripeW + stripeW / 2}
                      y={y + STRIPE_H / 2 + 4}
                      fontSize="10"
                      textAnchor="middle"
                      fill="white"
                      fontWeight={isVal ? 600 : 400}
                    >
                      {isVal ? "VAL" : "TRAIN"}
                    </text>
                  </g>
                );
              })}
              {/* score til høyre */}
              {isActive && (
                <text
                  x={ROW_W - 2}
                  y={y + STRIPE_H / 2 + 4}
                  fontSize="11"
                  textAnchor="end"
                  fill="rgb(234 179 8)"
                  fontWeight={600}
                >
                  score = {sc.toFixed(3)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Per-fold søyle-plot */}
      <div className="mt-2 text-xs text-muted-foreground mb-1">
        Per-fold score · mean = {mean.toFixed(3)} ± {sd.toFixed(3)}
      </div>
      <svg viewBox={`0 0 ${barPlotW} ${barPlotH}`} className="w-full">
        {/* mean-linje */}
        <line
          x1={LABEL_W}
          x2={barPlotW}
          y1={barPlotH - 18 - mean * (barPlotH - 28)}
          y2={barPlotH - 18 - mean * (barPlotH - 28)}
          stroke="rgb(244 63 94)"
          strokeDasharray="3 3"
          strokeOpacity={0.6}
        />
        <text
          x={LABEL_W - 4}
          y={barPlotH - 18 - mean * (barPlotH - 28) + 3}
          fontSize="9"
          textAnchor="end"
          fill="rgb(244 63 94)"
        >
          mean
        </text>
        {foldScores.map((sc, i) => {
          const isActive = i === activeFold;
          const h = sc * (barPlotH - 28);
          return (
            <g key={i}>
              <rect
                x={LABEL_W + i * barW + 4}
                y={barPlotH - 18 - h}
                width={barW - 8}
                height={h}
                fill={isActive ? "rgb(234 179 8)" : "rgb(99 102 241)"}
                fillOpacity={isActive ? 0.9 : 0.55}
              />
              <text
                x={LABEL_W + i * barW + barW / 2}
                y={barPlotH - 4}
                fontSize="9"
                textAnchor="middle"
                fill="currentColor"
                opacity={0.7}
              >
                f{i + 1}
              </text>
              <text
                x={LABEL_W + i * barW + barW / 2}
                y={barPlotH - 18 - h - 3}
                fontSize="9"
                textAnchor="middle"
                fill="currentColor"
                opacity={0.7}
              >
                {sc.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong className="text-brand">Hva å se etter:</strong>{" "}
        Velg <em>ustabil</em> — søylene spriker fra ~0.75 til ~0.95, og en ENKEL
        train/test-split (det er fold 1 alene) ville løyet. Det er nettopp dette
        cv = 5 redder deg fra: du rapporterer <code>mean ± std</code>, ikke ett
        tilfeldig tall. Skru opp k til 10: spredet faller fordi hver fold blir
        mer representativ — på kostnad av at du trener modellen 10 ganger
        i stedet for 5.
      </div>
    </div>
  );
}
