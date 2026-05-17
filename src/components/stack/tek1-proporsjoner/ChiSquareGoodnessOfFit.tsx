import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import { chiSquareCdf, chiSquarePdf, chiSquareCrit } from "./propUtils";

interface Scenario {
  label: string;
  categories: string[];
  observed: number[];
  expectedProp: number[]; // skal summere til 1
  note: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: "Rettferdig terning (6 sider)",
    categories: ["1", "2", "3", "4", "5", "6"],
    observed: [18, 22, 15, 19, 25, 21],
    expectedProp: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
    note: "120 kast — er terningen rettferdig?",
  },
  {
    label: "Valg-resultater vs gallup",
    categories: ["Parti A", "Parti B", "Parti C", "Parti D"],
    observed: [310, 220, 180, 90],
    expectedProp: [0.4, 0.25, 0.2, 0.15],
    note: "Stemmer valgresultatet med gallup-fordelingen?",
  },
  {
    label: "Kunde-segmenter (4 kategorier)",
    categories: ["Premium", "Standard", "Basis", "Free"],
    observed: [40, 110, 200, 350],
    expectedProp: [0.05, 0.15, 0.3, 0.5],
    note: "Forventet markedsfordeling vs faktisk.",
  },
  {
    label: "Loaded terning (juks)",
    categories: ["1", "2", "3", "4", "5", "6"],
    observed: [10, 12, 15, 18, 22, 43],
    expectedProp: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
    note: "6er kommer for ofte — typisk loaded terning.",
  },
];

export function ChiSquareGoodnessOfFit() {
  const [sIdx, setSIdx] = useState(0);
  const [observed, setObserved] = useState<number[]>(SCENARIOS[0].observed);
  const [expectedProp, setExpectedProp] = useState<number[]>(
    SCENARIOS[0].expectedProp,
  );
  const categories = SCENARIOS[sIdx].categories;

  function selectScenario(idx: number) {
    setSIdx(idx);
    setObserved([...SCENARIOS[idx].observed]);
    setExpectedProp([...SCENARIOS[idx].expectedProp]);
  }

  function updateObs(i: number, v: number) {
    const a = [...observed];
    a[i] = Math.max(0, Math.round(v));
    setObserved(a);
  }

  const stats = useMemo(() => {
    const total = observed.reduce((s, v) => s + v, 0);
    const expected = expectedProp.map((p) => p * total);
    let chi2 = 0;
    let warn = false;
    for (let i = 0; i < observed.length; i++) {
      if (expected[i] > 0) {
        chi2 += ((observed[i] - expected[i]) ** 2) / expected[i];
      }
      if (expected[i] < 5) warn = true;
    }
    const df = observed.length - 1;
    const pVal = 1 - chiSquareCdf(chi2, df);
    const crit05 = chiSquareCrit(0.05, df);
    return { total, expected, chi2, df, pVal, crit05, warn };
  }, [observed, expectedProp]);

  // Bar-plot: O vs E.
  const W = 480;
  const H = 220;
  const margin = { top: 18, right: 14, bottom: 38, left: 36 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const maxBar = Math.max(...observed, ...stats.expected, 1);
  const yScale = (v: number) => innerH - (v / maxBar) * innerH;
  const groupWidth = innerW / observed.length;
  const barW = groupWidth * 0.38;

  // Chi-square distribution chart
  const W2 = 480;
  const H2 = 180;
  const m2 = { top: 14, right: 14, bottom: 28, left: 30 };
  const iW2 = W2 - m2.left - m2.right;
  const iH2 = H2 - m2.top - m2.bottom;
  const xMax2 = Math.max(stats.crit05 * 2, stats.chi2 * 1.2, stats.df * 3);
  const xs2 = Array.from({ length: 201 }, (_, i) => (xMax2 * i) / 200);
  const ys2 = xs2.map((v) => chiSquarePdf(v, stats.df));
  const yMax2 = Math.max(...ys2);
  const x2Scale = (v: number) => (v / xMax2) * iW2;
  const y2Scale = (v: number) => iH2 - (v / yMax2) * iH2;
  const path2 = xs2
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"} ${x2Scale(v).toFixed(1)} ${y2Scale(ys2[i]).toFixed(1)}`,
    )
    .join(" ");
  // Reject region (chi^2 > crit)
  const rejPath = (() => {
    const pts: string[] = [];
    let started = false;
    for (let i = 0; i < xs2.length; i++) {
      if (xs2[i] >= stats.crit05) {
        if (!started) {
          pts.push(`M ${x2Scale(xs2[i]).toFixed(1)} ${iH2}`);
          started = true;
        }
        pts.push(`L ${x2Scale(xs2[i]).toFixed(1)} ${y2Scale(ys2[i]).toFixed(1)}`);
      }
    }
    if (started)
      pts.push(`L ${x2Scale(xs2[xs2.length - 1]).toFixed(1)} ${iH2} Z`);
    return pts.join(" ");
  })();

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Chi-square goodness-of-fit (<Tex>{"\\chi^2"}</Tex>)
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => selectScenario(i)}
            className={
              "px-2 py-1 rounded border " +
              (sIdx === i
                ? "border-brand bg-brand/10 text-brand"
                : "border-border bg-background hover:border-brand/40")
            }
            title={s.note}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        {categories.map((cat, i) => (
          <div key={cat} className="space-y-1 rounded border border-border p-2">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">{cat}</span>
              <span className="text-muted-foreground font-mono">
                O = {observed[i]}, E = {stats.expected[i].toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(100, ...observed) + 50}
              step={1}
              value={observed[i]}
              onChange={(e) => updateObs(i, Number(e.target.value))}
              className="w-full"
            />
            <div className="text-[11px] text-muted-foreground">
              Forventet andel: {(expectedProp[i] * 100).toFixed(1)} %
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full bg-background rounded border border-border"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <line x1={0} x2={innerW} y1={innerH} y2={innerH} stroke="hsl(220 15% 45%)" />
            {observed.map((o, i) => {
              const cx = i * groupWidth + groupWidth / 2;
              return (
                <g key={i}>
                  <rect
                    x={cx - barW - 2}
                    y={yScale(o)}
                    width={barW}
                    height={innerH - yScale(o)}
                    fill="hsl(200 70% 55%)"
                    opacity={0.85}
                  />
                  <rect
                    x={cx + 2}
                    y={yScale(stats.expected[i])}
                    width={barW}
                    height={innerH - yScale(stats.expected[i])}
                    fill="hsl(30 80% 55%)"
                    opacity={0.65}
                  />
                  <text
                    x={cx}
                    y={innerH + 14}
                    textAnchor="middle"
                    fontSize={10}
                    fill="hsl(220 15% 65%)"
                  >
                    {categories[i]}
                  </text>
                </g>
              );
            })}
            {/* Legend */}
            <g transform={`translate(${innerW - 90}, 0)`}>
              <rect width={10} height={10} fill="hsl(200 70% 55%)" />
              <text x={14} y={9} fontSize={10} fill="hsl(220 15% 65%)">
                Observert
              </text>
              <rect y={14} width={10} height={10} fill="hsl(30 80% 55%)" opacity={0.65} />
              <text x={14} y={23} fontSize={10} fill="hsl(220 15% 65%)">
                Forventet
              </text>
            </g>
          </g>
        </svg>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1">
            <div>
              <Tex>{`\\chi^2 = \\sum (O-E)^2/E = ${stats.chi2.toFixed(3)}`}</Tex>
            </div>
            <div>df = k − 1 = {stats.df}</div>
            <div>
              kritisk <Tex>{"\\chi^2_{0.05}"}</Tex> = {stats.crit05.toFixed(3)}
            </div>
            <div>
              p-verdi ={" "}
              <span
                className={
                  stats.pVal < 0.05 ? "text-emerald-400 font-semibold" : ""
                }
              >
                {stats.pVal < 1e-4 ? "<0.0001" : stats.pVal.toFixed(4)}
              </span>
            </div>
            <div
              className={
                stats.pVal < 0.05
                  ? "text-emerald-400"
                  : "text-muted-foreground"
              }
            >
              {stats.pVal < 0.05
                ? "Forkast H₀ — fordeling avviker fra forventet."
                : "Behold H₀ — dataene er forenlige med forventet fordeling."}
            </div>
          </div>
          {stats.warn ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-200">
              <strong>Advarsel:</strong> Noen forventede frekvenser er &lt; 5.
              Chi-square approks blir upålitelig. Slå sammen kategorier eller
              bruk eksakt multinomial-test.
            </div>
          ) : null}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W2} ${H2}`}
        className="w-full bg-background rounded border border-border"
      >
        <g transform={`translate(${m2.left}, ${m2.top})`}>
          <path d={rejPath} fill="hsl(0 70% 50% / 0.25)" />
          <path d={path2} stroke="hsl(220 70% 60%)" fill="none" strokeWidth={1.5} />
          <line x1={0} x2={iW2} y1={iH2} y2={iH2} stroke="hsl(220 15% 45%)" />
          {/* Kritisk linje */}
          {stats.crit05 <= xMax2 ? (
            <line
              x1={x2Scale(stats.crit05)}
              x2={x2Scale(stats.crit05)}
              y1={0}
              y2={iH2}
              stroke="hsl(0 70% 60%)"
              strokeDasharray="3 3"
            />
          ) : null}
          {/* Observert chi^2 */}
          {stats.chi2 <= xMax2 ? (
            <circle
              cx={x2Scale(stats.chi2)}
              cy={y2Scale(chiSquarePdf(stats.chi2, stats.df))}
              r={5}
              fill="hsl(0 80% 60%)"
              stroke="white"
              strokeWidth={1.2}
            />
          ) : null}
          <text
            x={iW2 / 2}
            y={iH2 + 20}
            textAnchor="middle"
            fontSize={10}
            fill="hsl(220 15% 65%)"
          >
            <Tex>{"\\chi^2"}</Tex>-fordeling, df = {stats.df}
          </text>
        </g>
      </svg>
    </div>
  );
}
