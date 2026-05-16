import { useMemo, useState } from "react";

type Region = "onlyA" | "onlyB" | "both" | "outside";

const REGION_PRESETS: { label: string; expr: (r: Region) => boolean; desc: string }[] = [
  { label: "A ∪ B", expr: (r) => r !== "outside", desc: "Union — alt i A eller B" },
  { label: "A ∩ B", expr: (r) => r === "both", desc: "Snitt — i begge" },
  { label: "A \\ B", expr: (r) => r === "onlyA", desc: "A minus B" },
  { label: "B \\ A", expr: (r) => r === "onlyB", desc: "B minus A" },
  { label: "Aᶜ", expr: (r) => r === "onlyB" || r === "outside", desc: "Komplement av A" },
  { label: "(A ∪ B)ᶜ", expr: (r) => r === "outside", desc: "Ingen av dem" },
  {
    label: "A ⊕ B",
    expr: (r) => r === "onlyA" || r === "onlyB",
    desc: "Symmetrisk differanse — i A eller B, men ikke begge",
  },
];

const FILL = {
  active: "fill-brand/40 stroke-brand",
  inactive: "fill-transparent stroke-border",
};

export function VennSandbox() {
  const [presetIdx, setPresetIdx] = useState(1); // A ∩ B
  const [a, setA] = useState(8);
  const [b, setB] = useState(7);
  const [both, setBoth] = useState(3);

  const preset = REGION_PRESETS[presetIdx];

  const regions = useMemo(() => {
    return {
      onlyA: preset.expr("onlyA"),
      onlyB: preset.expr("onlyB"),
      both: preset.expr("both"),
      outside: preset.expr("outside"),
    };
  }, [preset]);

  const validBoth = Math.min(both, Math.min(a, b));
  const onlyA = a - validBoth;
  const onlyB = b - validBoth;
  const union = a + b - validBoth;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Venn-diagram — klikk operasjon, dra slidere
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {REGION_PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPresetIdx(i)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
              i === presetIdx
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <svg viewBox="0 0 240 160" className="w-full">
            <rect
              x={2}
              y={2}
              width={236}
              height={156}
              className={regions.outside ? "fill-brand/15 stroke-border" : "fill-transparent stroke-border"}
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <text x={228} y={18} className="fill-muted-foreground text-[9px]" textAnchor="end">
              U
            </text>

            <circle cx={90} cy={80} r={55} className={`${regions.onlyA ? FILL.active : FILL.inactive}`} strokeWidth={1.5} fillOpacity={0.6} />
            <circle cx={150} cy={80} r={55} className={`${regions.onlyB ? FILL.active : FILL.inactive}`} strokeWidth={1.5} fillOpacity={0.6} />
            {regions.both && (
              <path
                d={intersectionPath(90, 150, 80, 55)}
                className="fill-brand/55 stroke-brand"
                strokeWidth={1.5}
              />
            )}
            <text x={62} y={84} className="fill-foreground text-[11px] font-semibold">
              A
            </text>
            <text x={172} y={84} className="fill-foreground text-[11px] font-semibold">
              B
            </text>

            <text x={62} y={100} className="fill-muted-foreground text-[10px]">
              {onlyA}
            </text>
            <text x={172} y={100} className="fill-muted-foreground text-[10px]">
              {onlyB}
            </text>
            <text x={117} y={84} className="fill-foreground text-[10px] font-semibold" textAnchor="middle">
              {validBoth}
            </text>
          </svg>
          <div className="mt-1 text-[11px] text-muted-foreground italic text-center">
            {preset.desc}
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <SliderRow label={`|A| = ${a}`} value={a} min={1} max={20} onChange={setA} />
          <SliderRow label={`|B| = ${b}`} value={b} min={1} max={20} onChange={setB} />
          <SliderRow
            label={`|A ∩ B| = ${validBoth}${both !== validBoth ? ` (klippet fra ${both})` : ""}`}
            value={both}
            min={0}
            max={20}
            onChange={setBoth}
          />

          <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px] space-y-1">
            <div>|A| = {a}, |B| = {b}, |A ∩ B| = {validBoth}</div>
            <div>|A ∪ B| = |A| + |B| − |A ∩ B|</div>
            <div className="text-brand">
              = {a} + {b} − {validBoth} = {union}
            </div>
            <div className="border-t border-border pt-1 mt-1">
              |A \ B| = |A| − |A ∩ B| = {onlyA}
            </div>
            <div>|B \ A| = |B| − |A ∩ B| = {onlyB}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className="w-full accent-brand"
      />
    </label>
  );
}

// Lens-formet snitt mellom to sirkler.
function intersectionPath(cx1: number, cx2: number, cy: number, r: number): string {
  const d = Math.abs(cx2 - cx1);
  if (d >= 2 * r) return "";
  const a = d / 2;
  const h = Math.sqrt(r * r - a * a);
  const xMid = (cx1 + cx2) / 2;
  const top = `${xMid},${cy - h}`;
  const bottom = `${xMid},${cy + h}`;
  return `M ${top} A ${r} ${r} 0 0 1 ${bottom} A ${r} ${r} 0 0 1 ${top} Z`;
}
