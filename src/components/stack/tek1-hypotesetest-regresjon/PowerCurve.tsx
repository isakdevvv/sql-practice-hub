import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Tex } from "@/components/Tex";

// Abramowitz & Stegun erf approximation
function normCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const az = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * az);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t) *
      Math.exp(-az * az);
  return 0.5 * (1 + sign * y);
}

// Inverse standard-normal (Beasley–Springer–Moro)
function normInv(p: number): number {
  const a1 = -39.6968302866538,
    a2 = 220.946098424521,
    a3 = -275.928510446969,
    a4 = 138.357751867269,
    a5 = -30.6647980661472,
    a6 = 2.50662827745924;
  const b1 = -54.4760987982241,
    b2 = 161.585836858041,
    b3 = -155.698979859887,
    b4 = 66.8013118877197,
    b5 = -13.2806815528857;
  const c1 = -7.78489400243029e-3,
    c2 = -0.322396458041136,
    c3 = -2.40075827716184,
    c4 = -2.54973253934373,
    c5 = 4.37466414146497,
    c6 = 2.93816398269878;
  const d1 = 7.78469570904146e-3,
    d2 = 0.32246712907004,
    d3 = 2.445134137143,
    d4 = 3.75440866190742;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1)
    );
  }
}

// One-sided z-test power: Power(d, n, α) = 1 − Φ(z_α − d·√n)
function power(d: number, n: number, alpha: number): number {
  const zAlpha = normInv(1 - alpha);
  return 1 - normCdf(zAlpha - d * Math.sqrt(n));
}

// Solve smallest n s.t. power(d, n, α) ≥ targetPower (one-sided z-test)
function nForPower(d: number, alpha: number, targetPower: number): number {
  if (d <= 0) return Infinity;
  const zA = normInv(1 - alpha);
  const zB = normInv(targetPower);
  const n = Math.pow((zA + zB) / d, 2);
  return Math.ceil(n);
}

// Solve d for given n and target power
function dForPower(n: number, alpha: number, targetPower: number): number {
  const zA = normInv(1 - alpha);
  const zB = normInv(targetPower);
  return (zA + zB) / Math.sqrt(n);
}

/**
 * Power-as-function-of-effect-size for n=10, 30, 100.
 * Slider for target power. Shows required d per n and required n for
 * user's chosen d.
 */
export function PowerCurve() {
  const [targetPower, setTargetPower] = useState(0.8);
  const [chosenD, setChosenD] = useState(0.5);
  const alpha = 0.05;

  const data = useMemo(() => {
    const points: { d: number; n10: number; n30: number; n100: number }[] = [];
    for (let i = 0; i <= 80; i++) {
      const d = i * 0.025; // 0 to 2.0
      points.push({
        d,
        n10: power(d, 10, alpha),
        n30: power(d, 30, alpha),
        n100: power(d, 100, alpha),
      });
    }
    return points;
  }, []);

  const dFor10 = dForPower(10, alpha, targetPower);
  const dFor30 = dForPower(30, alpha, targetPower);
  const dFor100 = dForPower(100, alpha, targetPower);

  const nForChosenD = nForPower(chosenD, alpha, targetPower);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Power-kurver — n = 10, 30, 100
      </div>
      <p className="text-xs text-muted-foreground">
        Power (1 − β) som funksjon av effektstørrelse <Tex>{"d"}</Tex> for en
        ensidig z-test med α = 0.05. Vil du oppdage en liten effekt? Du trenger
        stor n.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            Mål-power = {targetPower.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.5}
            max={0.99}
            step={0.01}
            value={targetPower}
            onChange={(e) => setTargetPower(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
        <label>
          <span className="block text-xs text-muted-foreground mb-1">
            Din planlagte effekt d = {chosenD.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.05}
            max={2}
            step={0.05}
            value={chosenD}
            onChange={(e) => setChosenD(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 26, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 60% / 0.25)" />
            <XAxis
              dataKey="d"
              type="number"
              domain={[0, 2]}
              tickFormatter={(v: number) => v.toFixed(1)}
              tick={{ fontSize: 11 }}
              label={{
                value: "Effektstørrelse d = (μ₁ − μ₀)/σ",
                position: "insideBottom",
                offset: -14,
                style: { fontSize: 11 },
              }}
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v: number) => v.toFixed(1)}
              tick={{ fontSize: 11 }}
              label={{
                value: "Power",
                angle: -90,
                position: "insideLeft",
                offset: 12,
                style: { fontSize: 11 },
              }}
            />
            <Tooltip
              formatter={(v: number) => v.toFixed(3)}
              labelFormatter={(d: number) => `d = ${d.toFixed(2)}`}
              contentStyle={{
                background: "hsl(var(--card, 0 0% 100%))",
                border: "1px solid hsl(var(--border, 0 0% 80%))",
                fontSize: 11,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={targetPower}
              stroke="hsl(0 70% 55%)"
              strokeDasharray="4 3"
              label={{
                value: `mål ${targetPower.toFixed(2)}`,
                fontSize: 10,
                fill: "hsl(0 70% 55%)",
                position: "insideTopRight",
              }}
            />
            <ReferenceLine
              x={chosenD}
              stroke="hsl(220 70% 55%)"
              strokeDasharray="4 3"
              label={{
                value: `d=${chosenD.toFixed(2)}`,
                fontSize: 10,
                fill: "hsl(220 70% 55%)",
                position: "top",
              }}
            />
            <Line
              type="monotone"
              dataKey="n10"
              name="n = 10"
              stroke="hsl(280 70% 55%)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="n30"
              name="n = 30"
              stroke="hsl(160 70% 40%)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="n100"
              name="n = 100"
              stroke="hsl(30 90% 50%)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
          <div className="font-semibold">
            For mål-power = {targetPower.toFixed(2)} (α = 0.05) trenger du:
          </div>
          <div className="font-mono">n = 10 → d ≥ {dFor10.toFixed(2)}</div>
          <div className="font-mono">n = 30 → d ≥ {dFor30.toFixed(2)}</div>
          <div className="font-mono">n = 100 → d ≥ {dFor100.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs space-y-1">
          <div className="font-semibold">Sample-size kalkulator</div>
          <div>
            For å oppdage <Tex>{"d"}</Tex> = {chosenD.toFixed(2)} med power{" "}
            {targetPower.toFixed(2)}:
          </div>
          <div className="font-mono text-brand text-sm">
            n ≥ {Number.isFinite(nForChosenD) ? nForChosenD : "—"}
          </div>
          <div className="text-muted-foreground">
            Formel: <Tex>{"n = \\left(\\frac{z_\\alpha + z_\\beta}{d}\\right)^2"}</Tex>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1.5">
        <div className="font-semibold">Lese-tips</div>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong>Power 0.8</strong> er konvensjonell minstegrense før du
            kjører studien.
          </li>
          <li>
            For å halvere effekten du klarer å oppdage må du fire-doble n
            (kvadratisk forhold).
          </li>
          <li>
            «Liten» effekt d=0.2 krever ~200 obs for 80 % power. «Stor» effekt
            d=0.8 trenger bare ~15. Effekt-størrelse spiser eksamens-poeng om
            du glemmer det.
          </li>
        </ul>
      </div>
    </div>
  );
}
