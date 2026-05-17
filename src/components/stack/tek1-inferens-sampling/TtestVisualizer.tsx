import { useMemo, useState } from "react";
import {
  histogram,
  mulberry32,
  randn,
  tCdf,
  tCritOneSided,
  tCritTwoSided,
  tPdf,
} from "./statUtils";

/**
 * Two-sample t-test (Welch) visualisert. To grupper trekkes fra normalfordelinger
 * med justerbare µ og σ. Vis begge histogrammer, regn t-stat og p-verdi
 * (one-sided eller two-sided), og marker kritisk region på t-fordelingen.
 *
 *  - Slider "effektstørrelse" = µ_A − µ_B (B holdes på 0)
 *  - Slider for σ (samme for begge)
 *  - Slider for n (per gruppe)
 *  - Toggle ensidig / tosidig
 */

function tStatWelch(muA: number, sA: number, nA: number, muB: number, sB: number, nB: number) {
  const seDiff = Math.sqrt((sA * sA) / nA + (sB * sB) / nB);
  const t = (muA - muB) / seDiff;
  // Welch–Satterthwaite df
  const num = ((sA * sA) / nA + (sB * sB) / nB) ** 2;
  const den =
    ((sA * sA) / nA) ** 2 / (nA - 1) + ((sB * sB) / nB) ** 2 / (nB - 1);
  const df = num / den;
  return { t, df, seDiff };
}

export function TtestVisualizer() {
  const [effect, setEffect] = useState(0.4); // µ_A − µ_B = effect
  const [sigma, setSigma] = useState(1.0);
  const [n, setN] = useState(30);
  const [twoSided, setTwoSided] = useState(true);
  const [seed, setSeed] = useState(20260201);

  const { dataA, dataB } = useMemo(() => {
    const rng = mulberry32(seed);
    const A: number[] = [];
    const B: number[] = [];
    for (let i = 0; i < n; i++) A.push(effect + sigma * randn(rng));
    for (let i = 0; i < n; i++) B.push(0 + sigma * randn(rng));
    return { dataA: A, dataB: B };
  }, [effect, sigma, n, seed]);

  const stats = useMemo(() => {
    const muA = dataA.reduce((s, v) => s + v, 0) / dataA.length;
    const muB = dataB.reduce((s, v) => s + v, 0) / dataB.length;
    const varA =
      dataA.reduce((s, v) => s + (v - muA) ** 2, 0) / (dataA.length - 1);
    const varB =
      dataB.reduce((s, v) => s + (v - muB) ** 2, 0) / (dataB.length - 1);
    const sA = Math.sqrt(varA);
    const sB = Math.sqrt(varB);
    const { t, df, seDiff } = tStatWelch(muA, sA, dataA.length, muB, sB, dataB.length);
    let p: number;
    if (twoSided) {
      p = 2 * (1 - tCdf(Math.abs(t), df));
    } else {
      // H1: muA > muB
      p = 1 - tCdf(t, df);
    }
    return { muA, muB, sA, sB, t, df, p, seDiff };
  }, [dataA, dataB, twoSided]);

  // Histogrammer av A og B
  const domain = useMemo<[number, number]>(() => {
    const lo = -3 * sigma;
    const hi = effect + 3 * sigma;
    return [Math.min(lo, hi - 0.5), Math.max(hi, lo + 0.5)];
  }, [effect, sigma]);

  const binsA = histogram(dataA, 22, domain);
  const binsB = histogram(dataB, 22, domain);

  // t-distribution plot
  const tW = 480;
  const tH = 180;
  const tPadL = 28;
  const tPadR = 8;
  const tPadT = 10;
  const tPadB = 22;
  const tPlotW = tW - tPadL - tPadR;
  const tPlotH = tH - tPadT - tPadB;
  const tRange = Math.max(5, Math.abs(stats.t) * 1.2 + 1);
  const tMin = -tRange;
  const tMax = tRange;
  const yMaxT = tPdf(0, stats.df) * 1.1;
  const tXPx = (x: number) => tPadL + ((x - tMin) / (tMax - tMin)) * tPlotW;
  const tYPx = (y: number) => tPadT + tPlotH - (y / yMaxT) * tPlotH;

  // curve path
  let curvePath = "";
  for (let i = 0; i <= 200; i++) {
    const x = tMin + ((tMax - tMin) * i) / 200;
    const y = tPdf(x, stats.df);
    curvePath +=
      (i === 0 ? "M " : " L ") + tXPx(x).toFixed(2) + " " + tYPx(y).toFixed(2);
  }

  const alpha = 0.05;
  const tcritTwo = tCritTwoSided(alpha, stats.df);
  const tcritOne = tCritOneSided(alpha, stats.df);

  // shaded rejection region
  const rejectPaths: string[] = [];
  if (twoSided) {
    const pts1: string[] = [`M ${tXPx(tcritTwo).toFixed(2)} ${tYPx(0).toFixed(2)}`];
    for (let i = 0; i <= 50; i++) {
      const x = tcritTwo + ((tMax - tcritTwo) * i) / 50;
      pts1.push(`L ${tXPx(x).toFixed(2)} ${tYPx(tPdf(x, stats.df)).toFixed(2)}`);
    }
    pts1.push(`L ${tXPx(tMax).toFixed(2)} ${tYPx(0).toFixed(2)} Z`);
    rejectPaths.push(pts1.join(" "));
    const pts2: string[] = [`M ${tXPx(-tcritTwo).toFixed(2)} ${tYPx(0).toFixed(2)}`];
    for (let i = 0; i <= 50; i++) {
      const x = tMin + ((-tcritTwo - tMin) * i) / 50;
      pts2.push(`L ${tXPx(x).toFixed(2)} ${tYPx(tPdf(x, stats.df)).toFixed(2)}`);
    }
    pts2.push(`L ${tXPx(-tcritTwo).toFixed(2)} ${tYPx(0).toFixed(2)} Z`);
    rejectPaths.push(pts2.join(" "));
  } else {
    const pts: string[] = [`M ${tXPx(tcritOne).toFixed(2)} ${tYPx(0).toFixed(2)}`];
    for (let i = 0; i <= 50; i++) {
      const x = tcritOne + ((tMax - tcritOne) * i) / 50;
      pts.push(`L ${tXPx(x).toFixed(2)} ${tYPx(tPdf(x, stats.df)).toFixed(2)}`);
    }
    pts.push(`L ${tXPx(tMax).toFixed(2)} ${tYPx(0).toFixed(2)} Z`);
    rejectPaths.push(pts.join(" "));
  }

  // Group histogram plot
  const gW = 480;
  const gH = 180;
  const gPadL = 28;
  const gPadR = 8;
  const gPadT = 10;
  const gPadB = 22;
  const gPlotW = gW - gPadL - gPadR;
  const gPlotH = gH - gPadT - gPadB;
  const gMaxC = Math.max(
    1,
    ...binsA.map((b) => b.c),
    ...binsB.map((b) => b.c),
  );
  const gXPx = (x: number) =>
    gPadL + ((x - domain[0]) / (domain[1] - domain[0])) * gPlotW;
  const gYPx = (c: number) => gPadT + gPlotH - (c / gMaxC) * gPlotH;

  const reject = stats.p < alpha;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Welch t-test — to grupper, p-verdi i sanntid
      </div>
      <p className="text-xs text-muted-foreground">
        To grupper trekkes fra normalfordelinger med samme σ. Skyv på{" "}
        <em>effekt</em> for å øke avstanden µ_A − µ_B, og se hvordan{" "}
        t-statistikken vandrer ut av sentrum og p-verdien synker. Større n
        gjør at samme effekt blir lettere å detektere — det er statistisk{" "}
        <em>power</em>.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="rounded-lg border border-border bg-background p-2.5 text-[11px] space-y-1">
          <div className="text-muted-foreground">effekt (µ_A − µ_B)</div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.05}
            value={effect}
            onChange={(e) => setEffect(+e.target.value)}
            className="w-full"
          />
          <div className="tabular-nums font-mono">{effect.toFixed(2)}</div>
        </label>
        <label className="rounded-lg border border-border bg-background p-2.5 text-[11px] space-y-1">
          <div className="text-muted-foreground">σ (spredning)</div>
          <input
            type="range"
            min={0.3}
            max={3}
            step={0.05}
            value={sigma}
            onChange={(e) => setSigma(+e.target.value)}
            className="w-full"
          />
          <div className="tabular-nums font-mono">{sigma.toFixed(2)}</div>
        </label>
        <label className="rounded-lg border border-border bg-background p-2.5 text-[11px] space-y-1">
          <div className="text-muted-foreground">n per gruppe</div>
          <input
            type="range"
            min={5}
            max={200}
            step={1}
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="w-full"
          />
          <div className="tabular-nums font-mono">{n}</div>
        </label>
        <div className="rounded-lg border border-border bg-background p-2.5 text-[11px] space-y-1">
          <div className="text-muted-foreground">test-type</div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTwoSided(true)}
              className={`flex-1 px-2 py-1 rounded text-xs border ${
                twoSided
                  ? "bg-brand text-white border-brand"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              tosidig
            </button>
            <button
              type="button"
              onClick={() => setTwoSided(false)}
              className={`flex-1 px-2 py-1 rounded text-xs border ${
                !twoSided
                  ? "bg-brand text-white border-brand"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              ensidig ({">"})
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="w-full px-2 py-1 rounded text-xs border border-border hover:bg-muted"
          >
            Nye trekk
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] font-semibold mb-1 text-muted-foreground">
            Gruppe A (blå) vs gruppe B (oransje)
          </div>
          <svg
            viewBox={`0 0 ${gW} ${gH}`}
            className="w-full h-auto bg-background rounded border border-border"
          >
            <line
              x1={gPadL}
              y1={gPadT + gPlotH}
              x2={gW - gPadR}
              y2={gPadT + gPlotH}
              stroke="hsl(0 0% 55%)"
              strokeWidth={0.7}
            />
            {binsB.map((bn, i) => {
              const x0 = gXPx(bn.x0);
              const x1 = gXPx(bn.x1);
              const yt = gYPx(bn.c);
              return (
                <rect
                  key={"b" + i}
                  x={x0}
                  y={yt}
                  width={Math.max(0.5, x1 - x0 - 0.4)}
                  height={Math.max(0, gPadT + gPlotH - yt)}
                  fill="hsl(30 90% 55%)"
                  opacity={0.6}
                />
              );
            })}
            {binsA.map((bn, i) => {
              const x0 = gXPx(bn.x0);
              const x1 = gXPx(bn.x1);
              const yt = gYPx(bn.c);
              return (
                <rect
                  key={"a" + i}
                  x={x0}
                  y={yt}
                  width={Math.max(0.5, x1 - x0 - 0.4)}
                  height={Math.max(0, gPadT + gPlotH - yt)}
                  fill="hsl(220 75% 55%)"
                  opacity={0.6}
                />
              );
            })}
            {/* x̄_B */}
            <line
              x1={gXPx(stats.muB)}
              y1={gPadT}
              x2={gXPx(stats.muB)}
              y2={gPadT + gPlotH}
              stroke="hsl(30 90% 45%)"
              strokeWidth={1.4}
              strokeDasharray="3 2"
            />
            {/* x̄_A */}
            <line
              x1={gXPx(stats.muA)}
              y1={gPadT}
              x2={gXPx(stats.muA)}
              y2={gPadT + gPlotH}
              stroke="hsl(220 75% 45%)"
              strokeWidth={1.4}
              strokeDasharray="3 2"
            />
            {Array.from({ length: 5 }).map((_, i) => {
              const x = domain[0] + ((domain[1] - domain[0]) * i) / 4;
              return (
                <text
                  key={i}
                  x={gXPx(x)}
                  y={gPadT + gPlotH + 14}
                  fontSize={9}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {x.toFixed(1)}
                </text>
              );
            })}
          </svg>
          <div className="text-[11px] mt-1 grid grid-cols-2 gap-2 font-mono">
            <div className="text-blue-600 dark:text-blue-400">
              x̄_A = {stats.muA.toFixed(3)}, s_A = {stats.sA.toFixed(3)}
            </div>
            <div className="text-amber-600 dark:text-amber-400">
              x̄_B = {stats.muB.toFixed(3)}, s_B = {stats.sB.toFixed(3)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold mb-1 text-muted-foreground">
            t-fordeling (df = {stats.df.toFixed(1)}) — kritisk region α = 0.05
          </div>
          <svg
            viewBox={`0 0 ${tW} ${tH}`}
            className="w-full h-auto bg-background rounded border border-border"
          >
            <line
              x1={tPadL}
              y1={tPadT + tPlotH}
              x2={tW - tPadR}
              y2={tPadT + tPlotH}
              stroke="hsl(0 0% 55%)"
              strokeWidth={0.7}
            />
            {rejectPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="hsl(0 80% 55% / 0.3)"
                stroke="none"
              />
            ))}
            <path
              d={curvePath}
              fill="none"
              stroke="hsl(220 75% 55%)"
              strokeWidth={1.6}
            />
            {/* t_obs */}
            <line
              x1={tXPx(stats.t)}
              y1={tPadT}
              x2={tXPx(stats.t)}
              y2={tPadT + tPlotH}
              stroke={reject ? "hsl(0 80% 55%)" : "hsl(160 70% 40%)"}
              strokeWidth={1.8}
            />
            <text
              x={tXPx(stats.t)}
              y={tPadT + 10}
              fontSize={10}
              textAnchor="middle"
              className="fill-foreground"
            >
              t = {stats.t.toFixed(2)}
            </text>
            {Array.from({ length: 5 }).map((_, i) => {
              const x = tMin + ((tMax - tMin) * i) / 4;
              return (
                <text
                  key={i}
                  x={tXPx(x)}
                  y={tPadT + tPlotH + 14}
                  fontSize={9}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {x.toFixed(1)}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">t-statistikk</div>
          <div className="font-mono text-base mt-1">{stats.t.toFixed(3)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            df ≈ {stats.df.toFixed(1)} · SE_diff = {stats.seDiff.toFixed(3)}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">p-verdi</div>
          <div
            className={`font-mono text-base mt-1 ${
              reject ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {stats.p < 0.0001 ? "< 0.0001" : stats.p.toFixed(4)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {twoSided ? "tosidig (|t|)" : "ensidig (>)"}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-muted-foreground">Konklusjon ved α = 0.05</div>
          <div
            className={`text-sm font-semibold mt-1 ${
              reject ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {reject ? "Forkast H₀" : "Behold H₀"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            kritisk t = ±{twoSided ? tcritTwo.toFixed(3) : tcritOne.toFixed(3)}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-muted-foreground">
        <strong>Eksperiment:</strong> sett effekt = 0.2 og n = 10 → sannsynligvis
        p &gt; 0.05 (vi misser effekten — Type II-feil). Skyv n opp mot 200 og
        samme effekt blir nesten alltid signifikant. Det er power i praksis:
        liten effekt + nok data ⇒ vi oppdager den.
      </div>
    </div>
  );
}
