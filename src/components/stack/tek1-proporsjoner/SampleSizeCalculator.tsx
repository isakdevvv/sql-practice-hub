import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import { Z_CRIT } from "./propUtils";

type Mode = "one" | "two";

const USE_CASES = [
  { label: "Meningsmåling (E = 3%)", E: 0.03, p: 0.5, conf: "0.95" as const, note: "Politisk gallup, konservativ p=0.5." },
  { label: "Medisinsk studie (E = 5%)", E: 0.05, p: 0.3, conf: "0.95" as const, note: "Anslått effekt ~30 %." },
  { label: "QA-inspeksjon (E = 1%)", E: 0.01, p: 0.05, conf: "0.99" as const, note: "Lav feilrate, høy konfidens." },
];

export function SampleSizeCalculator() {
  const [mode, setMode] = useState<Mode>("one");
  const [E, setE] = useState(0.03);
  const [p, setP] = useState(0.5);
  const [pB, setPB] = useState(0.5);
  const [conf, setConf] = useState<"0.90" | "0.95" | "0.99">("0.95");
  const z = Z_CRIT[conf];

  const result = useMemo(() => {
    if (E <= 0) return { n: Infinity, formula: "" };
    if (mode === "one") {
      // n = z² · p(1-p) / E²
      const n = Math.ceil((z * z * p * (1 - p)) / (E * E));
      return {
        n,
        formula: `n = \\frac{${z.toFixed(4)}^2 \\cdot ${p.toFixed(2)} \\cdot ${(1 - p).toFixed(2)}}{${E.toFixed(3)}^2} \\approx ${n}`,
      };
    }
    // For forskjell mellom to proporsjoner, n per gruppe:
    // n = z² · [p_A(1-p_A) + p_B(1-p_B)] / E²
    const n = Math.ceil(
      (z * z * (p * (1 - p) + pB * (1 - pB))) / (E * E),
    );
    return {
      n,
      formula: `n_{per\\,gruppe} = \\frac{${z.toFixed(4)}^2 \\cdot [${p.toFixed(2)}(1-${p.toFixed(2)}) + ${pB.toFixed(2)}(1-${pB.toFixed(2)})]}{${E.toFixed(3)}^2} \\approx ${n}`,
    };
  }, [mode, E, p, pB, z, conf]);

  // Vis n vs E for plottefølelsen.
  const W = 480;
  const H = 200;
  const margin = { top: 16, right: 14, bottom: 32, left: 50 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const ePoints = Array.from({ length: 100 }, (_, i) => 0.005 + (i / 99) * 0.095);
  const nPoints = ePoints.map((e) => {
    if (mode === "one") return (z * z * p * (1 - p)) / (e * e);
    return (z * z * (p * (1 - p) + pB * (1 - pB))) / (e * e);
  });
  const yMax = nPoints[0];
  const xScale = (e: number) => ((e - 0.005) / 0.095) * innerW;
  const yScale = (n: number) => innerH - Math.min(1, n / yMax) * innerH;
  const path = ePoints
    .map(
      (e, i) =>
        `${i === 0 ? "M" : "L"} ${xScale(e).toFixed(1)} ${yScale(nPoints[i]).toFixed(1)}`,
    )
    .join(" ");
  const eTicks = [0.01, 0.025, 0.05, 0.075, 0.1];
  const nTicks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Hvor stort utvalg trenger jeg?
        </div>
        <div className="flex gap-1.5">
          {(
            [
              { v: "one", label: "Én proporsjon" },
              { v: "two", label: "To proporsjoner" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              onClick={() => setMode(o.v)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (mode === o.v
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {USE_CASES.map((u) => (
          <button
            key={u.label}
            onClick={() => {
              setE(u.E);
              setP(u.p);
              setConf(u.conf);
              setMode("one");
            }}
            className="px-2 py-1 rounded border border-border bg-background hover:border-brand/40"
            title={u.note}
          >
            {u.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1">
            Margin of error E = {(E * 100).toFixed(1)} %
          </span>
          <input
            type="range"
            min={0.005}
            max={0.1}
            step={0.001}
            value={E}
            onChange={(e) => setE(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1">
            Forventet <Tex>{"p"}</Tex> = {p.toFixed(2)}{" "}
            {p === 0.5 ? "(maks konservativ)" : ""}
          </span>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.01}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <div className="flex items-end gap-1.5">
          {(["0.90", "0.95", "0.99"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setConf(c)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (conf === c
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {(Number(c) * 100).toFixed(0)} %
            </button>
          ))}
        </div>
      </div>

      {mode === "two" ? (
        <label className="block text-sm">
          <span className="block text-xs text-muted-foreground mb-1">
            Forventet <Tex>{"p_B"}</Tex> = {pB.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.05}
            max={0.95}
            step={0.01}
            value={pB}
            onChange={(e) => setPB(Number(e.target.value))}
            className="w-full"
          />
        </label>
      ) : null}

      <div className="rounded-lg border border-border bg-background p-3 text-sm space-y-2">
        <div className="font-mono text-xs">
          <Tex>{result.formula}</Tex>
        </div>
        <div className="font-semibold text-lg">
          {mode === "one" ? "n" : "n per gruppe"} = {result.n.toLocaleString("no-NO")}
        </div>
        {mode === "two" ? (
          <div className="text-xs text-muted-foreground">
            Totalt utvalg: {(2 * result.n).toLocaleString("no-NO")}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          n som funksjon av E (med valgt p, konfidens):
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full bg-background rounded border border-border"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="hsl(220 15% 45%)" />
            <line x1={0} x2={0} y1={0} y2={innerH} stroke="hsl(220 15% 45%)" />
            {eTicks.map((t) => (
              <g key={t} transform={`translate(${xScale(t)}, ${innerH})`}>
                <line y1={0} y2={4} stroke="hsl(220 15% 45%)" />
                <text y={16} textAnchor="middle" fontSize={10} fill="hsl(220 15% 65%)">
                  {(t * 100).toFixed(1)}%
                </text>
              </g>
            ))}
            {nTicks.map((t, i) => (
              <g key={i} transform={`translate(0, ${yScale(t)})`}>
                <line x1={-3} x2={0} stroke="hsl(220 15% 45%)" />
                <text
                  x={-6}
                  dy="0.3em"
                  textAnchor="end"
                  fontSize={10}
                  fill="hsl(220 15% 65%)"
                >
                  {Math.round(t).toLocaleString("no-NO")}
                </text>
              </g>
            ))}
            <path d={path} stroke="hsl(220 70% 60%)" fill="none" strokeWidth={1.6} />
            {/* Marker valgt E */}
            <circle
              cx={xScale(E)}
              cy={yScale(
                mode === "one"
                  ? (z * z * p * (1 - p)) / (E * E)
                  : (z * z * (p * (1 - p) + pB * (1 - pB))) / (E * E),
              )}
              r={5}
              fill="hsl(0 80% 60%)"
              stroke="white"
              strokeWidth={1.2}
            />
            <text
              x={innerW / 2}
              y={innerH + 28}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(220 15% 65%)"
            >
              Margin of error E
            </text>
          </g>
        </svg>
        <p className="text-xs text-muted-foreground">
          Kurven viser{" "}
          <Tex>{"n \\propto 1/E^2"}</Tex> — halver E, firedoble n. Det er grunnen
          til at meget små marginer (under 1 %) krever titusener av respondenter.
        </p>
      </div>
    </div>
  );
}
