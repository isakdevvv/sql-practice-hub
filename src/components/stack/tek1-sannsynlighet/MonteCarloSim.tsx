import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

// --------------------------------------------------------------------------
// MonteCarloSim — empirisk konvergens mot teoretisk sannsynlighet.
// Tre moduser:
//   - Myntkast: P(krone) = 0.5
//   - Terningkast: P(seks) = 1/6
//   - Bursdag-paradoks: P(minst to like) i en gruppe på k personer
// Studenten ser den relative frekvensen tegnes opp som funksjon av N,
// og at den "wobbler" rundt teoretisk verdi med 1/√N-bånd. Et histogram
// av siste 20 forsøk gjør at det er lett å se at korte serier kan
// avvike kraftig.
// --------------------------------------------------------------------------

type Mode = "coin" | "die" | "birthday";

const MAX_N = 5000;
const W = 540;
const H = 200;
const PAD_L = 38;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 22;

interface ModeConfig {
  label: string;
  theoretical: number;
  formulaText: string;
  trial: (rng: () => number, k: number) => boolean;
  param?: { label: string; min: number; max: number; default: number };
}

function birthdayCollision(rng: () => number, k: number): boolean {
  const seen = new Set<number>();
  for (let i = 0; i < k; i++) {
    const day = Math.floor(rng() * 365);
    if (seen.has(day)) return true;
    seen.add(day);
  }
  return false;
}

function birthdayTheory(k: number): number {
  // P(minst to like) = 1 - ∏ (365-i)/365 for i=0..k-1
  let p = 1;
  for (let i = 0; i < k; i++) {
    p *= (365 - i) / 365;
  }
  return 1 - p;
}

const MODES: Record<Mode, ModeConfig> = {
  coin: {
    label: "Myntkast — P(krone)",
    theoretical: 0.5,
    formulaText: "P(krone) = 1/2 = 0.500",
    trial: (rng) => rng() < 0.5,
  },
  die: {
    label: "Terningkast — P(seks)",
    theoretical: 1 / 6,
    formulaText: "P(seks) = 1/6 ≈ 0.167",
    trial: (rng) => Math.floor(rng() * 6) === 5,
  },
  birthday: {
    label: "Bursdag-paradoks — P(minst to like)",
    theoretical: 0, // settes dynamisk fra k
    formulaText: "",
    trial: (rng, k) => birthdayCollision(rng, k),
    param: { label: "gruppestørrelse k", min: 2, max: 60, default: 23 },
  },
};

export function MonteCarloSim() {
  const [mode, setMode] = useState<Mode>("coin");
  const [param, setParam] = useState(23);
  const [n, setN] = useState(0);
  const [hits, setHits] = useState(0);
  const [series, setSeries] = useState<number[]>([]); // relativ frekvens pr. N
  const [recent, setRecent] = useState<boolean[]>([]); // siste ~40 forsøk
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1 = 1 forsøk/tick, 5 = 50/tick (fast)
  const intervalRef = useRef<number | null>(null);

  const cfg = MODES[mode];
  const theoretical = mode === "birthday" ? birthdayTheory(param) : cfg.theoretical;
  const formula = mode === "birthday"
    ? `P(minst to like, k=${param}) ≈ ${theoretical.toFixed(3)}`
    : cfg.formulaText;

  // Reset når mode/param endres
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, param]);

  const reset = () => {
    setPlaying(false);
    setN(0);
    setHits(0);
    setSeries([]);
    setRecent([]);
  };

  const step = (count: number) => {
    let nNow = n;
    let hNow = hits;
    const newPoints: number[] = [];
    const newRecent: boolean[] = [...recent];
    for (let i = 0; i < count; i++) {
      if (nNow >= MAX_N) break;
      const hit = cfg.trial(Math.random, param);
      nNow++;
      if (hit) hNow++;
      newPoints.push(hNow / nNow);
      newRecent.push(hit);
      if (newRecent.length > 40) newRecent.shift();
    }
    setN(nNow);
    setHits(hNow);
    setSeries((prev) => [...prev, ...newPoints]);
    setRecent(newRecent);
    if (nNow >= MAX_N) setPlaying(false);
  };

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const perTick = speed === 1 ? 1 : speed === 2 ? 8 : 40;
    intervalRef.current = window.setInterval(() => {
      step(perTick);
    }, 40);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speed, n, hits, recent]);

  // SVG plot
  const yMin = mode === "die" ? 0 : mode === "coin" ? 0.2 : 0;
  const yMax = mode === "die" ? 0.45 : mode === "coin" ? 0.8 : 1;
  const xN = (k: number) => PAD_L + (k / MAX_N) * (W - PAD_L - PAD_R);
  const yP = (p: number) =>
    PAD_T + ((yMax - p) / (yMax - yMin)) * (H - PAD_T - PAD_B);

  const linePath = useMemo(() => {
    if (series.length < 2) return "";
    // Downsample hvis mange punkter (max 800 punkter på lerretet)
    const stride = Math.max(1, Math.floor(series.length / 800));
    let d = `M ${xN(0)} ${yP(series[0])}`;
    for (let i = stride; i < series.length; i += stride) {
      d += ` L ${xN(i)} ${yP(series[i])}`;
    }
    // Sørg for å ende på siste punkt
    d += ` L ${xN(series.length - 1)} ${yP(series[series.length - 1])}`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series]);

  // 95 %-konfidensbånd: p ± 1.96·√(p(1-p)/N) — vises som omhyllende area
  const bandPath = useMemo(() => {
    if (series.length < 2) return "";
    const p = theoretical;
    const upper: string[] = [];
    const lower: string[] = [];
    for (let k = 1; k <= MAX_N; k += 20) {
      const se = Math.sqrt((p * (1 - p)) / k);
      upper.push(`${xN(k)},${yP(Math.min(yMax, p + 1.96 * se))}`);
      lower.push(`${xN(k)},${yP(Math.max(yMin, p - 1.96 * se))}`);
    }
    return `M ${upper.join(" L ")} L ${lower.reverse().join(" L ")} Z`;
  }, [theoretical, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const empirical = n > 0 ? hits / n : 0;
  const errorPct = n > 0 ? ((empirical - theoretical) * 100).toFixed(1) : "—";
  const recentHits = recent.filter((b) => b).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Monte Carlo — empirisk frekvens konvergerer mot teoretisk p
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        {/* Mode-switch */}
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 transition-colors ${
                mode === m ? "bg-brand/20 text-foreground" : "bg-background hover:bg-muted/40"
              }`}
            >
              {m === "coin" ? "Mynt" : m === "die" ? "Terning" : "Bursdag"}
            </button>
          ))}
        </div>

        {/* Param-slider (kun bursdag) */}
        {cfg.param && (
          <label className="flex items-center gap-1.5">
            <span className="text-muted-foreground">{cfg.param.label}</span>
            <input
              type="range"
              min={cfg.param.min}
              max={cfg.param.max}
              value={param}
              onChange={(e) => setParam(parseInt(e.target.value, 10))}
              className="w-28 accent-brand"
            />
            <span className="font-mono w-7 text-right">{param}</span>
          </label>
        )}

        {/* Hastighets-switch */}
        <div className="inline-flex rounded-md border border-border overflow-hidden ml-auto">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 transition-colors ${
                speed === s ? "bg-brand/20 text-foreground" : "bg-background hover:bg-muted/40"
              }`}
              title={s === 1 ? "1×" : s === 2 ? "8×" : "40×"}
            >
              {s === 1 ? "1×" : s === 2 ? "8×" : <FastForward className="h-3 w-3" />}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (n >= MAX_N) reset();
            setPlaying((p) => !p);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : n === 0 ? "Start" : "Fortsett"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yV = yMin + (yMax - yMin) * t;
            return (
              <g key={t}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={yP(yV)}
                  y2={yP(yV)}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <text
                  x={PAD_L - 4}
                  y={yP(yV) + 3}
                  textAnchor="end"
                  fontSize={9}
                  className="fill-muted-foreground"
                >
                  {yV.toFixed(2)}
                </text>
              </g>
            );
          })}
          <text
            x={(W + PAD_L - PAD_R) / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize={10}
            className="fill-muted-foreground"
          >
            antall forsøk N
          </text>

          {/* 95% bånd */}
          <path d={bandPath} fill="rgb(56,189,248)" fillOpacity={0.08} />

          {/* Teoretisk linje */}
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yP(theoretical)}
            y2={yP(theoretical)}
            stroke="rgb(34,197,94)"
            strokeOpacity={0.7}
            strokeDasharray="4 3"
            strokeWidth={1.5}
          />
          <text
            x={W - PAD_R - 2}
            y={yP(theoretical) - 4}
            textAnchor="end"
            fontSize={9}
            fill="rgb(34,197,94)"
          >
            teoretisk {theoretical.toFixed(3)}
          </text>

          {/* Empirisk kurve */}
          <path d={linePath} stroke="rgb(244,114,182)" fill="none" strokeWidth={1.6} />

          {/* Current point */}
          {n > 0 && (
            <circle
              cx={xN(series.length - 1)}
              cy={yP(empirical)}
              r={3}
              fill="rgb(244,114,182)"
            />
          )}

          {/* N-tekst */}
          {n > 0 && (
            <text
              x={xN(series.length - 1) - 4}
              y={yP(empirical) - 6}
              fontSize={9}
              textAnchor="end"
              className="fill-foreground"
            >
              N={n}
            </text>
          )}
        </svg>
      </div>

      {/* Talloversikt + siste 40 */}
      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-2.5 font-mono text-[11px] space-y-0.5">
          <div className="text-muted-foreground">{formula}</div>
          <div>N = <span className="text-foreground">{n}</span></div>
          <div>treff = <span className="text-foreground">{hits}</span></div>
          <div>
            empirisk =
            <span className={"ml-1 " + (Math.abs(empirical - theoretical) < 0.02 ? "text-emerald-400" : "text-pink-400")}>
              {n > 0 ? empirical.toFixed(3) : "—"}
            </span>
            <span className="text-muted-foreground ml-2">({errorPct}{n > 0 ? " %" : ""})</span>
          </div>
        </div>

        <div className="rounded-md border border-border bg-background/40 p-2.5">
          <div className="text-[10px] text-muted-foreground mb-1.5">
            Siste {recent.length} forsøk ({recentHits} treff)
          </div>
          <div className="flex flex-wrap gap-0.5">
            {recent.length === 0 && (
              <span className="text-[10px] text-muted-foreground italic">— ingen forsøk ennå —</span>
            )}
            {recent.map((hit, i) => (
              <span
                key={i}
                className={`inline-block w-2.5 h-2.5 rounded-sm ${
                  hit ? "bg-emerald-500/80" : "bg-muted/60"
                }`}
                title={hit ? "treff" : "miss"}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-border bg-background/40 p-2.5 text-[11px] text-muted-foreground leading-snug">
        <span className="font-semibold text-foreground">Hva å se etter:</span>{" "}
        Kjør på 1× først — se hvor «pigget» kurven er ved små N. Et avvik på
        10 % er helt vanlig før N=100. Lov om store tall: 95 %-båndet (lyst)
        krymper som 1/√N, så for å halvere usikkerheten må du firdoble N.
        Bursdag-paradokset er kontraintuitivt: ved k=23 personer har vi
        allerede ~50 % sjanse for to like. Skyv slideren til 60 og se hvordan
        empirisk frekvens nesten alltid hopper opp i 99 %.
      </div>
    </div>
  );
}
