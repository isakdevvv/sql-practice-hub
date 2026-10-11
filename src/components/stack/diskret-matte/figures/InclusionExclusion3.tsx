import { useMemo, useState } from "react";

type Region = "A" | "B" | "C" | "AB" | "AC" | "BC" | "ABC";

const REGIONS: Region[] = ["A", "B", "C", "AB", "AC", "BC", "ABC"];

const LABEL: Record<Region, string> = {
  A: "A̅BC̅",
  B: "ĀBC̅",
  C: "ĀB̅C",
  AB: "AB",
  AC: "AC",
  BC: "BC",
  ABC: "ABC",
};

const POSITION: Record<Region, { x: number; y: number }> = {
  A: { x: 70, y: 80 },
  B: { x: 190, y: 80 },
  C: { x: 130, y: 165 },
  AB: { x: 130, y: 75 },
  AC: { x: 95, y: 135 },
  BC: { x: 165, y: 135 },
  ABC: { x: 130, y: 115 },
};

const PRESETS: { label: string; counts: Record<Region, number> }[] = [
  {
    label: "Disjunkte (ingen overlapp)",
    counts: { A: 10, B: 8, C: 6, AB: 0, AC: 0, BC: 0, ABC: 0 },
  },
  {
    label: "Klassisk eksempel",
    counts: { A: 5, B: 4, C: 3, AB: 3, AC: 2, BC: 2, ABC: 1 },
  },
  {
    label: "Stort senter",
    counts: { A: 2, B: 2, C: 2, AB: 1, AC: 1, BC: 1, ABC: 6 },
  },
];

export function InclusionExclusion3() {
  const [counts, setCounts] = useState<Record<Region, number>>(PRESETS[1].counts);

  const totals = useMemo(() => {
    const sizeA = counts.A + counts.AB + counts.AC + counts.ABC;
    const sizeB = counts.B + counts.AB + counts.BC + counts.ABC;
    const sizeC = counts.C + counts.AC + counts.BC + counts.ABC;
    const ab = counts.AB + counts.ABC;
    const ac = counts.AC + counts.ABC;
    const bc = counts.BC + counts.ABC;
    const abc = counts.ABC;
    const union =
      counts.A +
      counts.B +
      counts.C +
      counts.AB +
      counts.AC +
      counts.BC +
      counts.ABC;
    const inclExcl = sizeA + sizeB + sizeC - ab - ac - bc + abc;
    return { sizeA, sizeB, sizeC, ab, ac, bc, abc, union, inclExcl };
  }, [counts]);

  const update = (r: Region, v: number) =>
    setCounts((c) => ({ ...c, [r]: Math.max(0, Math.min(9, v)) }));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Inkludering–eksklusjon (3 mengder)
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setCounts({ ...p.counts })}
              className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* SVG Venn 3 */}
        <div className="rounded-xl border border-border bg-background p-2">
          <svg viewBox="0 0 260 220" className="w-full h-56">
            {/* Three circles */}
            <circle
              cx="100"
              cy="100"
              r="60"
              fill="rgb(99 102 241 / 0.18)"
              stroke="rgb(99 102 241)"
              strokeWidth="1.5"
            />
            <circle
              cx="160"
              cy="100"
              r="60"
              fill="rgb(244 114 182 / 0.18)"
              stroke="rgb(244 114 182)"
              strokeWidth="1.5"
            />
            <circle
              cx="130"
              cy="150"
              r="60"
              fill="rgb(34 197 94 / 0.18)"
              stroke="rgb(34 197 94)"
              strokeWidth="1.5"
            />
            <text x="60" y="60" fontSize="13" fill="rgb(99 102 241)" className="font-semibold">
              A
            </text>
            <text x="195" y="60" fontSize="13" fill="rgb(244 114 182)" className="font-semibold">
              B
            </text>
            <text x="125" y="215" fontSize="13" fill="rgb(34 197 94)" className="font-semibold">
              C
            </text>
            {/* Region numbers */}
            {REGIONS.map((r) => (
              <text
                key={r}
                x={POSITION[r].x}
                y={POSITION[r].y}
                fontSize="13"
                textAnchor="middle"
                fill="currentColor"
                className="font-mono font-bold"
              >
                {counts[r]}
              </text>
            ))}
          </svg>
        </div>

        {/* Sliders for 7 regions */}
        <div className="rounded-xl border border-border bg-background p-3 space-y-1.5">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
            Dra slidere — én per region (0–9)
          </div>
          {REGIONS.map((r) => (
            <div key={r} className="flex items-center gap-2 text-xs">
              <code className="w-16 text-right text-muted-foreground">{LABEL[r]}</code>
              <input
                type="range"
                min={0}
                max={9}
                value={counts[r]}
                onChange={(e) => update(r, parseInt(e.target.value, 10))}
                className="flex-1 accent-brand"
              />
              <span className="w-6 font-mono text-right">{counts[r]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-background p-3 font-mono text-xs overflow-x-auto">
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1 font-sans">
          Live formel — sammenlign sum og inkl-eksklusjon
        </div>
        <div className="space-y-0.5">
          <div>
            |A| = {totals.sizeA}, |B| = {totals.sizeB}, |C| = {totals.sizeC}
          </div>
          <div>
            |A∩B| = {totals.ab}, |A∩C| = {totals.ac}, |B∩C| = {totals.bc}, |A∩B∩C| ={" "}
            {totals.abc}
          </div>
          <div className="mt-1">
            |A∪B∪C| = {totals.sizeA} + {totals.sizeB} + {totals.sizeC} − {totals.ab} −{" "}
            {totals.ac} − {totals.bc} + {totals.abc}
          </div>
          <div className="font-semibold">
            = <span className="text-brand">{totals.inclExcl}</span>
          </div>
          <div className="text-muted-foreground mt-1">
            Direkte sum (disjunkte regioner): {totals.union}{" "}
            {totals.union === totals.inclExcl ? "✓" : "✗ mismatch"}
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Intuisjon:</strong> tell hver mengde alene
        (kan overlapp telles flere ganger), trekk fra parvise snitt (dobbelttalte
        regioner), legg tilbake trippel-snittet (nå har det blitt trukket fra én gang
        for mye).
      </div>
    </div>
  );
}
