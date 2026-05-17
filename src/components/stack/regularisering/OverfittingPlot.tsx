import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Bookmark } from "lucide-react";

// --------------------------------------------------------------------------
// OverfittingPlot — live trening-simulator som kombinerer flere
// regulariserings-teknikker i én visuell loop:
//   - Slider for "model-kapasitet" (~ overparameterisering)
//   - Slider for "weight decay" λ
//   - Toggle for "early stopping" m/ patience
// Studenten ser train-loss og val-loss-kurver tegnet opp epok for epok
// og kan se hvor early-stop ville inntreffe.
//
// Vi simulerer kurver med en deterministisk modell — det er ingen ekte
// trening her — men den er kalibrert til å oppføre seg pedagogisk
// korrekt: mer kapasitet → større gap, mer wd → mindre gap, mer wd
// (for stor) → underfit.
// --------------------------------------------------------------------------

const W = 520;
const H = 220;
const PAD_L = 38;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 24;
const MAX_EPOCHS = 80;

function trainCurve(epoch: number, capacity: number, wd: number) {
  // Train-loss synker monotont; mer kapasitet → lavere asymptote;
  // weight decay holder den fra å gå helt mot 0.
  const minLoss = Math.max(0.02, 0.5 / (capacity + 0.3) + wd * 0.6);
  const tau = 6 + 10 / capacity;
  return minLoss + (1.0 - minLoss) * Math.exp(-epoch / tau);
}

function valCurve(epoch: number, capacity: number, wd: number) {
  // Val-loss: synker, treffer minimum, så stiger igjen (overfit).
  // - mer kapasitet → tidligere og brattere stigning
  // - mer wd → svakere stigning, men også høyere bunn hvis wd er stor.
  const tau = 6 + 10 / capacity;
  const base = 0.15 + 0.4 / (capacity + 0.3) + wd * 0.5;
  const decay = (1.0 - base) * Math.exp(-epoch / tau);
  const overfit = Math.max(0, (epoch - 12) / 10) * Math.max(0, capacity - 1.0) * Math.max(0, 0.25 - wd);
  return base + decay + overfit;
}

export function OverfittingPlot() {
  const [capacity, setCapacity] = useState(2.0); // 0.6 .. 3.0
  const [wd, setWd] = useState(0.0); // 0 .. 0.3
  const [earlyStop, setEarlyStop] = useState(true);
  const [patience, setPatience] = useState(5);
  const [epoch, setEpoch] = useState(MAX_EPOCHS);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Pre-beregn alle epoker for kurvene (deterministisk).
  const points = useMemo(() => {
    const train: number[] = [];
    const val: number[] = [];
    for (let e = 0; e < MAX_EPOCHS; e++) {
      train.push(trainCurve(e, capacity, wd));
      val.push(valCurve(e, capacity, wd));
    }
    return { train, val };
  }, [capacity, wd]);

  // Hvor ville early stopping ha utløst seg?
  const earlyStopAt = useMemo(() => {
    let best = Infinity;
    let bestE = 0;
    let wait = 0;
    for (let e = 0; e < MAX_EPOCHS; e++) {
      if (points.val[e] < best - 1e-6) {
        best = points.val[e];
        bestE = e;
        wait = 0;
      } else {
        wait++;
        if (wait >= patience) {
          return { stopEpoch: e, bestEpoch: bestE, bestVal: best };
        }
      }
    }
    return { stopEpoch: MAX_EPOCHS - 1, bestEpoch: bestE, bestVal: best };
  }, [points, patience]);

  // Auto-play
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    if (epoch >= MAX_EPOCHS) setEpoch(1);
    intervalRef.current = window.setInterval(() => {
      setEpoch((e) => {
        const stopAt = earlyStop ? earlyStopAt.stopEpoch + 1 : MAX_EPOCHS;
        if (e >= stopAt) {
          setPlaying(false);
          return stopAt;
        }
        return e + 1;
      });
    }, 70);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, earlyStop, earlyStopAt.stopEpoch, epoch]);

  // Plot-konvertering
  const yMax = 1.4;
  const x = (e: number) => PAD_L + (e / (MAX_EPOCHS - 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + (1 - Math.min(1, v / yMax)) * (H - PAD_T - PAD_B);

  const path = (arr: number[], upto: number) => {
    const n = Math.min(upto, arr.length);
    if (n < 2) return "";
    let d = `M ${x(0)} ${y(arr[0])}`;
    for (let i = 1; i < n; i++) d += ` L ${x(i)} ${y(arr[i])}`;
    return d;
  };

  // Statisk "ghost"-kurve som viser hele 80 epoker (faded).
  const ghostTrain = path(points.train, MAX_EPOCHS);
  const ghostVal = path(points.val, MAX_EPOCHS);
  const liveTrain = path(points.train, epoch);
  const liveVal = path(points.val, epoch);

  const finalTrain = points.train[Math.min(epoch - 1, MAX_EPOCHS - 1)] ?? 0;
  const finalVal = points.val[Math.min(epoch - 1, MAX_EPOCHS - 1)] ?? 0;
  const gap = finalVal - finalTrain;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Modell-kapasitet</span>
          <input
            type="range"
            min={0.6}
            max={3.0}
            step={0.1}
            value={capacity}
            onChange={(e) => setCapacity(parseFloat(e.target.value))}
            className="w-28"
          />
          <span className="font-mono w-10 text-right">{capacity.toFixed(1)}×</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Weight decay λ</span>
          <input
            type="range"
            min={0}
            max={0.3}
            step={0.01}
            value={wd}
            onChange={(e) => setWd(parseFloat(e.target.value))}
            className="w-28"
          />
          <span className="font-mono w-12 text-right">{wd.toFixed(2)}</span>
        </div>

        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={earlyStop}
            onChange={(e) => setEarlyStop(e.target.checked)}
          />
          <span>Early stopping</span>
        </label>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">patience</span>
          <input
            type="number"
            min={1}
            max={20}
            value={patience}
            onChange={(e) => setPatience(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            disabled={!earlyStop}
            className="w-12 rounded border border-border bg-background px-1 py-0.5 text-xs disabled:opacity-40"
          />
        </div>

        <button
          onClick={() => {
            if (epoch >= MAX_EPOCHS) setEpoch(1);
            setPlaying((p) => !p);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : "Tren"}
        </button>

        <button
          onClick={() => {
            setPlaying(false);
            setEpoch(MAX_EPOCHS);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Hopp til slutt
        </button>
      </div>

      {/* SVG plot */}
      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={PAD_T + t * (H - PAD_T - PAD_B)}
              y2={PAD_T + t * (H - PAD_T - PAD_B)}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
          ))}
          {/* Y-akse-tekster */}
          {[0, 0.4, 0.8, 1.2].map((v) => (
            <text
              key={v}
              x={PAD_L - 4}
              y={y(v) + 3}
              textAnchor="end"
              fontSize={9}
              className="fill-muted-foreground"
            >
              {v.toFixed(1)}
            </text>
          ))}
          {/* X-akse-etikett */}
          <text
            x={(W + PAD_L - PAD_R) / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize={10}
            className="fill-muted-foreground"
          >
            epoch
          </text>
          <text
            x={PAD_L - 30}
            y={PAD_T + 8}
            fontSize={9}
            className="fill-muted-foreground"
          >
            loss
          </text>

          {/* Ghost-kurver (svake, viser hele fremtiden) */}
          <path d={ghostTrain} stroke="rgb(56,189,248)" strokeOpacity={0.18} fill="none" strokeWidth={1.2} />
          <path d={ghostVal} stroke="rgb(244,114,182)" strokeOpacity={0.18} fill="none" strokeWidth={1.2} />

          {/* Live kurver */}
          <path d={liveTrain} stroke="rgb(56,189,248)" fill="none" strokeWidth={2} />
          <path d={liveVal} stroke="rgb(244,114,182)" fill="none" strokeWidth={2} />

          {/* Early-stop markør */}
          {earlyStop && (
            <>
              <line
                x1={x(earlyStopAt.bestEpoch)}
                x2={x(earlyStopAt.bestEpoch)}
                y1={PAD_T}
                y2={H - PAD_B}
                stroke="rgb(34,197,94)"
                strokeOpacity={0.7}
                strokeDasharray="3 3"
              />
              <line
                x1={x(earlyStopAt.stopEpoch)}
                x2={x(earlyStopAt.stopEpoch)}
                y1={PAD_T}
                y2={H - PAD_B}
                stroke="rgb(239,68,68)"
                strokeOpacity={0.6}
                strokeDasharray="2 4"
              />
              <text
                x={x(earlyStopAt.bestEpoch) + 3}
                y={PAD_T + 10}
                fontSize={9}
                fill="rgb(34,197,94)"
              >
                best
              </text>
              <text
                x={x(earlyStopAt.stopEpoch) + 3}
                y={PAD_T + 22}
                fontSize={9}
                fill="rgb(239,68,68)"
              >
                stopp
              </text>
            </>
          )}

          {/* Current epoch markør */}
          <line
            x1={x(epoch - 1)}
            x2={x(epoch - 1)}
            y1={PAD_T}
            y2={H - PAD_B}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
        </svg>
      </div>

      {/* Legende + tall */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-sky-400" /> train-loss
          <span className="font-mono ml-1">{finalTrain.toFixed(3)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-pink-400" /> val-loss
          <span className="font-mono ml-1">{finalVal.toFixed(3)}</span>
        </div>
        <div className={"flex items-center gap-1.5 " + (gap > 0.15 ? "text-amber-500" : "text-muted-foreground")}>
          <Bookmark className="h-3.5 w-3.5" /> gap
          <span className="font-mono">{gap.toFixed(3)}</span>
        </div>
        <div className="text-muted-foreground">
          epoke <span className="font-mono">{Math.min(epoch, MAX_EPOCHS)}/{MAX_EPOCHS}</span>
        </div>
      </div>

      {/* Tolkning */}
      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">Kapasitet ↑</div>
          <p className="text-muted-foreground leading-snug">
            Større nett → lavere train-loss, men val-loss bunner tidligere og stiger
            raskere. Det er overfitting i sin reneste form.
          </p>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">Weight decay λ ↑</div>
          <p className="text-muted-foreground leading-snug">
            Flater begge kurvene og lukker gap-en. For mye → modellen klarer ikke å
            lære nok (underfit) og train-loss kryper opp igjen.
          </p>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">Early stopping</div>
          <p className="text-muted-foreground leading-snug">
            Grønn linje = beste val-epoke (vektene som lagres). Rød = når{" "}
            <span className="font-mono">patience={patience}</span> har gått ut og
            treningen stopper.
          </p>
        </div>
      </div>
    </div>
  );
}
