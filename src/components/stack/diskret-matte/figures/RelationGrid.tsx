import { useMemo, useState } from "react";

// Visualiser binær-relasjon R ⊆ A × A som et grid.
// Tre preset-relasjoner:
//   - ekvivalens (reflexive, symmetric, transitive)
//   - partiell orden (reflexive, antisymmetric, transitive)
//   - bare en relasjon (kanskje ingen egenskaper)
// Studenten kan toggle celler og se hvilke av de 3 egenskapene som holder.

type RelId = "equiv" | "order" | "custom";

const PRESETS: Record<
  RelId,
  { label: string; desc: string; pairs: [number, number][] }
> = {
  equiv: {
    label: "Ekvivalens: «samme rest mod 3»",
    desc: "Reflexive ✓, Symmetric ✓, Transitive ✓. Partisjonerer {1..5} i klasser.",
    pairs: [
      [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], // refleksiv
      [1, 4], [4, 1], // 1 ≡ 4 mod 3
      [2, 5], [5, 2], // 2 ≡ 5 mod 3
    ],
  },
  order: {
    label: "Partiell orden: «deler»",
    desc: "Reflexive ✓, Antisymmetric ✓, Transitive ✓. a | b betyr «a deler b».",
    pairs: [
      [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], // refleksiv
      [1, 2], [1, 3], [1, 4], [1, 5], // 1 deler alt
      [2, 4], // 2 deler 4
    ],
  },
  custom: {
    label: "Tom relasjon (start)",
    desc: "Bare refleksivitet er på. Klikk cellene for å lage din egen relasjon.",
    pairs: [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]],
  },
};

const N = 5;
const DOMAIN = [1, 2, 3, 4, 5];

export function RelationGrid() {
  const [preset, setPreset] = useState<RelId>("equiv");
  const [customPairs, setCustomPairs] = useState<Set<string>>(
    () => new Set(PRESETS.custom.pairs.map(([a, b]) => `${a},${b}`)),
  );

  const pairs: Set<string> = useMemo(() => {
    if (preset === "custom") return customPairs;
    return new Set(PRESETS[preset].pairs.map(([a, b]) => `${a},${b}`));
  }, [preset, customPairs]);

  const togglePair = (a: number, b: number) => {
    if (preset !== "custom") return;
    setCustomPairs((prev) => {
      const next = new Set(prev);
      const key = `${a},${b}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const props = useMemo(() => analyze(pairs), [pairs]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Binær relasjon på {`{1, 2, 3, 4, 5}`}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        En relasjon er en mengde av par. Visuelt: en «på» / «av»-bryter for hver mulig
        kobling. Velg preset for å se klassiske eksempler, eller bruk «Tom» og bygg din
        egen.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(Object.keys(PRESETS) as RelId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setPreset(id)}
            className={`px-2.5 py-1 rounded text-[11px] border ${
              preset === id
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {PRESETS[id].label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-[1fr_220px] gap-4 items-start">
        <div className="overflow-auto">
          <table className="text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-1 text-muted-foreground"></th>
                {DOMAIN.map((b) => (
                  <th
                    key={b}
                    className="px-2 py-1 text-center text-muted-foreground border-b border-border min-w-[28px]"
                  >
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMAIN.map((a) => (
                <tr key={a}>
                  <th className="px-2 py-1 text-right text-muted-foreground border-r border-border">
                    {a}
                  </th>
                  {DOMAIN.map((b) => {
                    const on = pairs.has(`${a},${b}`);
                    return (
                      <td key={b} className="p-0.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePair(a, b)}
                          disabled={preset !== "custom"}
                          className={`w-7 h-7 rounded text-[10px] font-bold border transition-colors ${
                            on
                              ? "border-brand bg-brand text-brand-foreground"
                              : "border-border bg-background text-muted-foreground"
                          } ${preset === "custom" ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
                          title={`(${a}, ${b}) ${on ? "∈ R" : "∉ R"}`}
                        >
                          {on ? "●" : ""}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[10px] text-muted-foreground mt-1 text-center">
            «●» betyr (a, b) ∈ R. Rad = a, kolonne = b.
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <PropPill label="Refleksiv" desc="∀a: (a, a) ∈ R" ok={props.reflexive} />
          <PropPill label="Symmetrisk" desc="(a, b) ∈ R ⇒ (b, a) ∈ R" ok={props.symmetric} />
          <PropPill label="Antisymmetrisk" desc="(a, b) ∈ R ∧ (b, a) ∈ R ⇒ a = b" ok={props.antisymmetric} />
          <PropPill label="Transitiv" desc="(a, b), (b, c) ∈ R ⇒ (a, c) ∈ R" ok={props.transitive} />

          <div className="rounded-md border border-border bg-background p-2 text-[10px] mt-2">
            <Verdict
              ok={props.reflexive && props.symmetric && props.transitive}
              label="Ekvivalens-relasjon"
              hint="Trenger: refleksiv + symmetrisk + transitiv"
            />
            <Verdict
              ok={props.reflexive && props.antisymmetric && props.transitive}
              label="Partiell orden"
              hint="Trenger: refleksiv + antisymmetrisk + transitiv"
            />
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground italic">
        {PRESETS[preset].desc}
      </div>
    </div>
  );
}

function PropPill({
  label,
  desc,
  ok,
}: {
  label: string;
  desc: string;
  ok: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-2 ${
        ok
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-background"
      }`}
    >
      <div className="flex items-baseline gap-2">
        <span className={`text-[11px] font-semibold ${ok ? "text-emerald-500" : "text-muted-foreground"}`}>
          {ok ? "✓" : "✗"} {label}
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{desc}</div>
    </div>
  );
}

function Verdict({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <div className={`${ok ? "text-emerald-500" : "text-muted-foreground"} mb-1 last:mb-0`}>
      <span className="font-semibold">{ok ? "✓" : "—"} {label}</span>
      <div className="text-[9px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function analyze(pairs: Set<string>): {
  reflexive: boolean;
  symmetric: boolean;
  antisymmetric: boolean;
  transitive: boolean;
} {
  // Reflexive: (a, a) ∈ R for all a ∈ D
  let reflexive = true;
  for (const a of DOMAIN) {
    if (!pairs.has(`${a},${a}`)) {
      reflexive = false;
      break;
    }
  }

  // Symmetric: (a, b) ∈ R ⇒ (b, a) ∈ R
  let symmetric = true;
  for (const key of pairs) {
    const [a, b] = key.split(",").map(Number);
    if (!pairs.has(`${b},${a}`)) {
      symmetric = false;
      break;
    }
  }

  // Antisymmetric: (a, b) ∈ R ∧ (b, a) ∈ R ⇒ a = b
  let antisymmetric = true;
  for (const key of pairs) {
    const [a, b] = key.split(",").map(Number);
    if (a !== b && pairs.has(`${b},${a}`)) {
      antisymmetric = false;
      break;
    }
  }

  // Transitive: (a, b), (b, c) ∈ R ⇒ (a, c) ∈ R
  let transitive = true;
  outer: for (const k1 of pairs) {
    const [a, b] = k1.split(",").map(Number);
    for (const k2 of pairs) {
      const [b2, c] = k2.split(",").map(Number);
      if (b === b2 && !pairs.has(`${a},${c}`)) {
        transitive = false;
        break outer;
      }
    }
  }

  return { reflexive, symmetric, antisymmetric, transitive };
}

void N; // suppress unused warning in some configs
