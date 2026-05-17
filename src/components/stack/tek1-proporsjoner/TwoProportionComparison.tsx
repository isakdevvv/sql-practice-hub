import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import { Z_CRIT, normalCdf } from "./propUtils";

interface Preset {
  label: string;
  nA: number;
  xA: number;
  nB: number;
  xB: number;
  labA: string;
  labB: string;
  note: string;
}
const PRESETS: Preset[] = [
  {
    label: "Vaksine-effekt",
    nA: 15000,
    xA: 8,
    nB: 15000,
    xB: 162,
    labA: "Vaksinert (smittet)",
    labB: "Placebo (smittet)",
    note: "Stort gap, signifikant — vaksinen virker.",
  },
  {
    label: "A/B-test (konvertering)",
    nA: 5000,
    xA: 240,
    nB: 5000,
    xB: 280,
    labA: "Variant A",
    labB: "Variant B",
    note: "Liten forskjell — stort utvalg trengs for signifikans.",
  },
  {
    label: "Kjønnsfordeling (klikk)",
    nA: 800,
    xA: 320,
    nB: 1200,
    xB: 540,
    labA: "Menn (klikket)",
    labB: "Kvinner (klikket)",
    note: "Ulike n — KI for forskjell.",
  },
  {
    label: "Liten studie — ikke signifikant",
    nA: 50,
    xA: 12,
    nB: 50,
    xB: 16,
    labA: "Gruppe A",
    labB: "Gruppe B",
    note: "For lite for å se forskjellen.",
  },
];

export function TwoProportionComparison() {
  const [nA, setNA] = useState(120);
  const [xA, setXA] = useState(48);
  const [nB, setNB] = useState(100);
  const [xB, setXB] = useState(30);
  const [labA, setLabA] = useState("Gruppe A");
  const [labB, setLabB] = useState("Gruppe B");
  const [conf, setConf] = useState<"0.90" | "0.95" | "0.99">("0.95");
  const z = Z_CRIT[conf];

  const s = useMemo(() => {
    const pA = nA > 0 ? xA / nA : 0;
    const pB = nB > 0 ? xB / nB : 0;
    const diff = pA - pB;
    const seUn = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
    const ciLo = diff - z * seUn;
    const ciHi = diff + z * seUn;
    const pPool = (xA + xB) / (nA + nB);
    const sePool = Math.sqrt(
      pPool * (1 - pPool) * (1 / nA + 1 / nB),
    );
    const zStat = sePool === 0 ? 0 : diff / sePool;
    const pTwoSided = 2 * (1 - normalCdf(Math.abs(zStat)));
    // SE per group for visuell error bar (1.96·SE_i).
    const seA = Math.sqrt((pA * (1 - pA)) / nA);
    const seB = Math.sqrt((pB * (1 - pB)) / nB);
    return {
      pA,
      pB,
      diff,
      seUn,
      ciLo,
      ciHi,
      pPool,
      sePool,
      zStat,
      pTwoSided,
      seA,
      seB,
    };
  }, [nA, xA, nB, xB, z]);

  // SVG: to vertikale barer for success rate + error bar.
  const W = 400;
  const H = 240;
  const margin = { top: 18, right: 14, bottom: 36, left: 36 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const yScale = (v: number) => innerH - v * innerH;

  const barWidth = 60;
  const xA_pos = innerW * 0.28 - barWidth / 2;
  const xB_pos = innerW * 0.72 - barWidth / 2;

  // Y-akse ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          To proporsjoner — sammenligning og test
        </div>
        <div className="flex gap-1.5">
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

      <div className="flex flex-wrap gap-1.5 text-xs">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setNA(p.nA);
              setXA(p.xA);
              setNB(p.nB);
              setXB(p.xB);
              setLabA(p.labA);
              setLabB(p.labB);
            }}
            className="px-2 py-1 rounded border border-border bg-background hover:border-brand/40"
            title={p.note}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2 rounded border border-border p-3">
          <div className="font-semibold text-brand">{labA}</div>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              nₐ = {nA}
            </span>
            <input
              type="range"
              min={10}
              max={20000}
              step={1}
              value={nA}
              onChange={(e) => {
                const v = Number(e.target.value);
                setNA(v);
                if (xA > v) setXA(v);
              }}
              className="w-full"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              xₐ = {xA} (<Tex>{`\\hat{p}_A = ${s.pA.toFixed(4)}`}</Tex>)
            </span>
            <input
              type="range"
              min={0}
              max={nA}
              step={1}
              value={xA}
              onChange={(e) => setXA(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="space-y-2 rounded border border-border p-3">
          <div className="font-semibold text-brand">{labB}</div>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              n_b = {nB}
            </span>
            <input
              type="range"
              min={10}
              max={20000}
              step={1}
              value={nB}
              onChange={(e) => {
                const v = Number(e.target.value);
                setNB(v);
                if (xB > v) setXB(v);
              }}
              className="w-full"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              x_b = {xB} (<Tex>{`\\hat{p}_B = ${s.pB.toFixed(4)}`}</Tex>)
            </span>
            <input
              type="range"
              min={0}
              max={nB}
              step={1}
              value={xB}
              onChange={(e) => setXB(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full bg-background rounded border border-border"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Y-akse */}
            <line x1={0} x2={0} y1={0} y2={innerH} stroke="hsl(220 15% 45%)" />
            {yTicks.map((t) => (
              <g key={t} transform={`translate(0, ${yScale(t)})`}>
                <line x1={-3} x2={0} stroke="hsl(220 15% 45%)" />
                <text
                  x={-6}
                  dy="0.3em"
                  textAnchor="end"
                  fontSize={10}
                  fill="hsl(220 15% 65%)"
                >
                  {(t * 100).toFixed(0)}%
                </text>
                <line
                  x1={0}
                  x2={innerW}
                  stroke="hsl(220 15% 30%)"
                  strokeDasharray="2 3"
                  opacity={0.4}
                />
              </g>
            ))}
            {/* Bar A */}
            <rect
              x={xA_pos}
              y={yScale(s.pA)}
              width={barWidth}
              height={innerH - yScale(s.pA)}
              fill="hsl(200 70% 55%)"
              opacity={0.85}
            />
            {/* Error bar A: ±1.96·SE_A */}
            <line
              x1={xA_pos + barWidth / 2}
              x2={xA_pos + barWidth / 2}
              y1={yScale(Math.min(1, s.pA + z * s.seA))}
              y2={yScale(Math.max(0, s.pA - z * s.seA))}
              stroke="white"
              strokeWidth={1.5}
            />
            <line
              x1={xA_pos + barWidth / 2 - 8}
              x2={xA_pos + barWidth / 2 + 8}
              y1={yScale(Math.min(1, s.pA + z * s.seA))}
              y2={yScale(Math.min(1, s.pA + z * s.seA))}
              stroke="white"
              strokeWidth={1.5}
            />
            <line
              x1={xA_pos + barWidth / 2 - 8}
              x2={xA_pos + barWidth / 2 + 8}
              y1={yScale(Math.max(0, s.pA - z * s.seA))}
              y2={yScale(Math.max(0, s.pA - z * s.seA))}
              stroke="white"
              strokeWidth={1.5}
            />
            <text
              x={xA_pos + barWidth / 2}
              y={innerH + 14}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(220 15% 65%)"
            >
              {labA}
            </text>
            <text
              x={xA_pos + barWidth / 2}
              y={yScale(s.pA) - 4}
              textAnchor="middle"
              fontSize={11}
              fill="hsl(200 80% 80%)"
              fontWeight="600"
            >
              {(s.pA * 100).toFixed(1)}%
            </text>
            {/* Bar B */}
            <rect
              x={xB_pos}
              y={yScale(s.pB)}
              width={barWidth}
              height={innerH - yScale(s.pB)}
              fill="hsl(30 80% 55%)"
              opacity={0.85}
            />
            <line
              x1={xB_pos + barWidth / 2}
              x2={xB_pos + barWidth / 2}
              y1={yScale(Math.min(1, s.pB + z * s.seB))}
              y2={yScale(Math.max(0, s.pB - z * s.seB))}
              stroke="white"
              strokeWidth={1.5}
            />
            <line
              x1={xB_pos + barWidth / 2 - 8}
              x2={xB_pos + barWidth / 2 + 8}
              y1={yScale(Math.min(1, s.pB + z * s.seB))}
              y2={yScale(Math.min(1, s.pB + z * s.seB))}
              stroke="white"
              strokeWidth={1.5}
            />
            <line
              x1={xB_pos + barWidth / 2 - 8}
              x2={xB_pos + barWidth / 2 + 8}
              y1={yScale(Math.max(0, s.pB - z * s.seB))}
              y2={yScale(Math.max(0, s.pB - z * s.seB))}
              stroke="white"
              strokeWidth={1.5}
            />
            <text
              x={xB_pos + barWidth / 2}
              y={innerH + 14}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(220 15% 65%)"
            >
              {labB}
            </text>
            <text
              x={xB_pos + barWidth / 2}
              y={yScale(s.pB) - 4}
              textAnchor="middle"
              fontSize={11}
              fill="hsl(30 90% 80%)"
              fontWeight="600"
            >
              {(s.pB * 100).toFixed(1)}%
            </text>
          </g>
        </svg>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1">
            <div className="font-semibold mb-1">KI for forskjell (unpooled SE)</div>
            <div>
              <Tex>{`\\hat{p}_A - \\hat{p}_B = ${s.diff.toFixed(4)}`}</Tex>
            </div>
            <div>
              {(Number(conf) * 100).toFixed(0)} % KI = [{s.ciLo.toFixed(4)},{" "}
              {s.ciHi.toFixed(4)}]
            </div>
            <div
              className={
                s.ciLo > 0 || s.ciHi < 0
                  ? "text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {s.ciLo > 0 || s.ciHi < 0
                ? "KI inneholder ikke 0 → signifikant forskjell."
                : "KI inneholder 0 → ikke signifikant."}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1">
            <div className="font-semibold mb-1">
              z-test for <Tex>{"H_0:\\,p_A=p_B"}</Tex> (pooled SE)
            </div>
            <div>
              <Tex>{`\\hat{p}_{pool} = ${s.pPool.toFixed(4)}`}</Tex>
            </div>
            <div>z = {s.zStat.toFixed(3)}</div>
            <div>
              p (tosidig) ={" "}
              <span
                className={
                  s.pTwoSided < 0.05 ? "text-emerald-400 font-semibold" : ""
                }
              >
                {s.pTwoSided < 1e-4 ? "<0.0001" : s.pTwoSided.toFixed(4)}
              </span>
            </div>
            <div
              className={
                s.pTwoSided < 0.05
                  ? "text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {s.pTwoSided < 0.05
                ? "Forkast H₀."
                : "Behold H₀."}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Hvit linje på bar = {(Number(conf) * 100).toFixed(0)} % KI for hver
        proporsjon. Overlapp i grupp-KI-er innebærer ikke automatisk «ikke
        signifikant forskjell» — bruk KI for <em>forskjellen</em> eller selve
        z-testen.
      </p>
    </div>
  );
}
