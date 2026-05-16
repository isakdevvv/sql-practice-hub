import { useMemo, useState } from "react";

type FType = "injOnly" | "surOnly" | "bij" | "neither";

const PRESETS: Record<FType, { label: string; desc: string; pairs: [string, string][] }> = {
  injOnly: {
    label: "Injektiv, ikke surjektiv",
    desc: "Hver A-verdi går til unik B — men ikke alle B-verdier blir truffet.",
    pairs: [
      ["a", "1"],
      ["b", "2"],
      ["c", "3"],
    ],
  },
  surOnly: {
    label: "Surjektiv, ikke injektiv",
    desc: "Alle B-verdier blir truffet — men flere A-er kan dele en B.",
    pairs: [
      ["a", "1"],
      ["b", "1"],
      ["c", "2"],
      ["d", "3"],
    ],
  },
  bij: {
    label: "Bijektiv",
    desc: "Én-til-én og dekker hele B. Har invers.",
    pairs: [
      ["a", "1"],
      ["b", "2"],
      ["c", "3"],
      ["d", "4"],
    ],
  },
  neither: {
    label: "Verken",
    desc: "Kollisjon (to A-er til samme B) OG en B treffes ikke.",
    pairs: [
      ["a", "1"],
      ["b", "1"],
      ["c", "2"],
    ],
  },
};

export function FunctionTypeVis() {
  const [type, setType] = useState<FType>("bij");
  const preset = PRESETS[type];

  const { domain, codomain, isInjective, isSurjective } = useMemo(() => {
    const domain = Array.from(new Set(preset.pairs.map(([a]) => a)));
    const codomainBase = type === "bij" ? ["1", "2", "3", "4"] : ["1", "2", "3", "4"];
    const codomain = Array.from(new Set([...preset.pairs.map(([, b]) => b), ...codomainBase])).sort();
    const targets = preset.pairs.map(([, b]) => b);
    const isInjective = new Set(targets).size === targets.length;
    const isSurjective = codomain.every((b) => targets.includes(b));
    return { domain, codomain, isInjective, isSurjective };
  }, [preset, type]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Funksjonstype-visualisering
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(Object.keys(PRESETS) as FType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
              t === type
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {PRESETS[t].label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <svg viewBox="0 0 220 240" className="w-full">
          <text x={45} y={20} className="fill-muted-foreground text-[11px]" textAnchor="middle">
            A (definisjons-mengde)
          </text>
          <text x={175} y={20} className="fill-muted-foreground text-[11px]" textAnchor="middle">
            B (kodomene)
          </text>

          {domain.map((d, i) => {
            const y = 50 + i * 40;
            return (
              <g key={d}>
                <circle cx={45} cy={y} r={14} className="fill-brand/30 stroke-brand" strokeWidth={1.5} />
                <text x={45} y={y + 4} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
                  {d}
                </text>
              </g>
            );
          })}
          {codomain.map((b, i) => {
            const y = 50 + i * 40;
            const hit = preset.pairs.some(([, target]) => target === b);
            return (
              <g key={b}>
                <circle
                  cx={175}
                  cy={y}
                  r={14}
                  className={`${hit ? "fill-emerald-500/30 stroke-emerald-500" : "fill-muted/50 stroke-border"}`}
                  strokeWidth={1.5}
                />
                <text x={175} y={y + 4} textAnchor="middle" className="fill-foreground text-[11px] font-mono">
                  {b}
                </text>
              </g>
            );
          })}
          {preset.pairs.map(([a, b], i) => {
            const ai = domain.indexOf(a);
            const bi = codomain.indexOf(b);
            return (
              <line
                key={i}
                x1={59}
                y1={50 + ai * 40}
                x2={161}
                y2={50 + bi * 40}
                className="stroke-foreground/60"
                strokeWidth={1.4}
              />
            );
          })}
        </svg>

        <div className="space-y-3 text-xs">
          <div className="rounded-md border border-border bg-background p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Pill ok={isInjective} label="Injektiv" />
              <span className="text-muted-foreground text-[11px]">ingen kollisjoner</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill ok={isSurjective} label="Surjektiv" />
              <span className="text-muted-foreground text-[11px]">hele B treffes</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill ok={isInjective && isSurjective} label="Bijektiv" />
              <span className="text-muted-foreground text-[11px]">har invers</span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3 font-mono text-[11px]">
            <div className="text-muted-foreground mb-1">f: A → B definert som:</div>
            {preset.pairs.map(([a, b], i) => (
              <div key={i}>
                f({a}) = {b}
              </div>
            ))}
          </div>

          <div className="text-[11px] text-muted-foreground italic">{preset.desc}</div>
        </div>
      </div>
    </div>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
        ok
          ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
          : "border-rose-500 bg-rose-500/15 text-rose-500"
      }`}
    >
      {ok ? "✓" : "✗"} {label}
    </span>
  );
}
