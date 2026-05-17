import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import { normalCdf, normalPdf } from "./propUtils";

type Alt = "two" | "less" | "greater";

const PRESETS: { label: string; n: number; x: number; p0: number; alt: Alt; note: string }[] = [
  { label: "Gallup: andel for et parti", n: 1000, x: 240, p0: 0.25, alt: "two", note: "Stort utvalg, ikke signifikant." },
  { label: "Fabrikkfeil: andel defekte", n: 200, x: 14, p0: 0.05, alt: "greater", note: "Tester om feilrate er økt." },
  { label: "A/B: konvertering oppgang", n: 500, x: 280, p0: 0.5, alt: "greater", note: "Klart > 50 %." },
  { label: "Vaksine: bivirkning under 2 %", n: 300, x: 3, p0: 0.02, alt: "less", note: "Lav rate." },
];

export function OneProportionZtest() {
  const [n, setN] = useState(200);
  const [x, setX] = useState(90);
  const [p0, setP0] = useState(0.5);
  const [alt, setAlt] = useState<Alt>("two");

  const stats = useMemo(() => {
    const pHat = n > 0 ? x / n : 0;
    const se = Math.sqrt((p0 * (1 - p0)) / n);
    const z = se > 0 ? (pHat - p0) / se : 0;
    let p: number;
    if (alt === "two") p = 2 * (1 - normalCdf(Math.abs(z)));
    else if (alt === "less") p = normalCdf(z);
    else p = 1 - normalCdf(z);
    const meetsClt = n * p0 >= 10 && n * (1 - p0) >= 10;
    // Power-estimat under H_a: p = pHat
    // Avvisningsregel for tosidig α=0.05: |Z| > 1.96 under H_0.
    // Under H_a er Z' = (pHat_real - p_0)/SE_0; vi approks power v å plassere
    // distribusjonen om pHat istedenfor p_0. Skipper formell formel, viser bare p-verdi her.
    return { pHat, se, z, p, meetsClt };
  }, [n, x, p0, alt]);

  // SVG av null-fordelingen.
  const W = 520;
  const H = 220;
  const margin = { top: 20, right: 14, bottom: 32, left: 36 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const xMin = p0 - 4 * stats.se;
  const xMax = p0 + 4 * stats.se;
  const xScale = (v: number) => ((v - xMin) / (xMax - xMin)) * innerW;
  const N_POINTS = 200;
  const xs = Array.from(
    { length: N_POINTS + 1 },
    (_, i) => xMin + ((xMax - xMin) * i) / N_POINTS,
  );
  const pdfVals = xs.map((v) => normalPdf(v, p0, stats.se));
  const pdfMax = Math.max(...pdfVals);
  const yScale = (y: number) => innerH - (y / pdfMax) * innerH;

  // Avvisningsområde for α = 0.05.
  const Z_CRIT_05 = 1.96;
  const Z_CRIT_05_ONE = 1.6449;

  const path = xs
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(v).toFixed(2)} ${yScale(pdfVals[i]).toFixed(2)}`)
    .join(" ");

  // Shading av avvisningsområder.
  function shadeArea(predicate: (v: number) => boolean): string {
    const pts: string[] = [];
    let started = false;
    for (let i = 0; i <= N_POINTS; i++) {
      const v = xs[i];
      if (predicate(v)) {
        if (!started) {
          pts.push(`M ${xScale(v).toFixed(2)} ${innerH}`);
          started = true;
        }
        pts.push(`L ${xScale(v).toFixed(2)} ${yScale(pdfVals[i]).toFixed(2)}`);
      } else if (started) {
        pts.push(`L ${xScale(xs[i - 1]).toFixed(2)} ${innerH} Z`);
        started = false;
      }
    }
    if (started) {
      pts.push(`L ${xScale(xs[N_POINTS]).toFixed(2)} ${innerH} Z`);
    }
    return pts.join(" ");
  }

  const seLow = stats.se;
  const lowCut = p0 - Z_CRIT_05 * seLow;
  const highCut = p0 + Z_CRIT_05 * seLow;
  const lowCutOne = p0 - Z_CRIT_05_ONE * seLow;
  const highCutOne = p0 + Z_CRIT_05_ONE * seLow;
  let rejectShade = "";
  if (alt === "two") {
    rejectShade =
      shadeArea((v) => v <= lowCut) + " " + shadeArea((v) => v >= highCut);
  } else if (alt === "less") {
    rejectShade = shadeArea((v) => v <= lowCutOne);
  } else {
    rejectShade = shadeArea((v) => v >= highCutOne);
  }

  // x-akse ticks ved p_0 og ±1, ±2 SE.
  const ticks = [-3, -2, -1, 0, 1, 2, 3].map((k) => p0 + k * seLow);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Z-test for én proporsjon mot <Tex>{"p_0"}</Tex>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setN(p.n);
              setX(p.x);
              setP0(p.p0);
              setAlt(p.alt);
            }}
            className="px-2 py-1 rounded border border-border bg-background hover:border-brand/40"
            title={p.note}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1">
            n = {n}
          </span>
          <input
            type="range"
            min={10}
            max={2000}
            step={1}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              setN(v);
              if (x > v) setX(v);
            }}
            className="w-full"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1">
            x = {x} (<Tex>{`\\hat{p} = ${stats.pHat.toFixed(3)}`}</Tex>)
          </span>
          <input
            type="range"
            min={0}
            max={n}
            step={1}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1">
            <Tex>{`p_0 = ${p0.toFixed(2)}`}</Tex>
          </span>
          <input
            type="range"
            min={0.01}
            max={0.99}
            step={0.01}
            value={p0}
            onChange={(e) => setP0(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            { v: "two", label: "Tosidig (≠)" },
            { v: "less", label: "Venstre (<)" },
            { v: "greater", label: "Høyre (>)" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            onClick={() => setAlt(o.v)}
            className={
              "px-2.5 py-1 rounded border text-xs " +
              (alt === o.v
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-background hover:border-brand/40")
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      <div
        className={
          "rounded-lg border p-3 text-xs " +
          (stats.meetsClt
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
            : "border-amber-500/30 bg-amber-500/5 text-amber-200")
        }
      >
        <strong>CLT-sjekk (med p_0):</strong>{" "}
        <Tex>{`n p_0 = ${(n * p0).toFixed(1)}`}</Tex>,{" "}
        <Tex>{`n(1-p_0) = ${(n * (1 - p0)).toFixed(1)}`}</Tex>.{" "}
        {stats.meetsClt
          ? "Begge ≥ 10 — z-tilnærming er rimelig."
          : "MINST ÉN < 10 — bruk exakt binomial test heller."}
      </div>

      <div className="rounded-lg border border-border bg-background p-3 font-mono text-xs space-y-1">
        <div>
          SE under H₀ ={" "}
          <Tex>{`\\sqrt{p_0(1-p_0)/n} = ${stats.se.toFixed(5)}`}</Tex>
        </div>
        <div>
          z = (<Tex>{"\\hat{p}-p_0"}</Tex>) / SE ={" "}
          <span className="font-semibold">{stats.z.toFixed(3)}</span>
        </div>
        <div>
          p-verdi ({alt === "two" ? "tosidig" : alt === "less" ? "venstre" : "høyre"}) ={" "}
          <span
            className={
              stats.p < 0.05 ? "text-emerald-400 font-semibold" : ""
            }
          >
            {stats.p < 1e-4 ? "<0.0001" : stats.p.toFixed(4)}
          </span>
        </div>
        <div
          className={
            stats.p < 0.05
              ? "text-emerald-400"
              : "text-muted-foreground"
          }
        >
          {stats.p < 0.05
            ? "Forkast H₀ ved α = 0.05."
            : "Behold H₀ ved α = 0.05."}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full bg-background rounded border border-border"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Null-fordelingen */}
          <path d={rejectShade} fill="hsl(0 70% 50% / 0.25)" stroke="none" />
          <path d={path} stroke="hsl(220 70% 60%)" fill="none" strokeWidth={1.5} />

          {/* Observed pHat (rød prikk) */}
          {stats.pHat >= xMin && stats.pHat <= xMax ? (
            <circle
              cx={xScale(stats.pHat)}
              cy={yScale(normalPdf(stats.pHat, p0, stats.se))}
              r={5}
              fill="hsl(0 80% 60%)"
              stroke="white"
              strokeWidth={1.2}
            />
          ) : null}
          {/* p_0 referanselinje */}
          <line
            x1={xScale(p0)}
            x2={xScale(p0)}
            y1={0}
            y2={innerH}
            stroke="hsl(220 30% 70%)"
            strokeDasharray="3 3"
            strokeWidth={1}
          />

          {/* X-akse */}
          <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="hsl(220 15% 45%)" />
          {ticks
            .filter((t) => t >= xMin && t <= xMax)
            .map((t, i) => (
              <g key={i} transform={`translate(${xScale(t)}, ${innerH})`}>
                <line y1={0} y2={4} stroke="hsl(220 15% 45%)" />
                <text
                  y={16}
                  textAnchor="middle"
                  fill="hsl(220 15% 65%)"
                  fontSize={10}
                >
                  {t.toFixed(2)}
                </text>
              </g>
            ))}
          <text
            x={xScale(p0)}
            y={-6}
            textAnchor="middle"
            fontSize={10}
            fill="hsl(220 30% 70%)"
          >
            p₀ = {p0.toFixed(2)}
          </text>
        </g>
      </svg>

      <p className="text-xs text-muted-foreground">
        Rød skygge = avvisningsområde ved α = 0.05 for valgt alternativ. Rød
        prikk = observert <Tex>{"\\hat{p}"}</Tex>. Skru n opp → SE krymper →
        kurven blir spissere → samme avvik blir signifikant ved mindre forskjell
        (høyere power).
      </p>
    </div>
  );
}
