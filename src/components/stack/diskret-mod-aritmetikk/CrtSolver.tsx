import { useMemo, useState } from "react";
import { crtSolve, mod } from "./modUtils";

interface Pair {
  a: number;
  n: number;
}

const PRESETS: Array<{ label: string; pairs: Pair[] }> = [
  {
    label: "x ≡ 2 (3), x ≡ 3 (5), x ≡ 2 (7)",
    pairs: [
      { a: 2, n: 3 },
      { a: 3, n: 5 },
      { a: 2, n: 7 },
    ],
  },
  {
    label: "x ≡ 1 (5), x ≡ 4 (7)",
    pairs: [
      { a: 1, n: 5 },
      { a: 4, n: 7 },
    ],
  },
  {
    label: "Ikke-koprim (feiler)",
    pairs: [
      { a: 1, n: 4 },
      { a: 3, n: 6 },
    ],
  },
];

/**
 * Chinese Remainder Theorem-løser.
 *  - Brukeren legger inn vilkårlig antall kongruenser.
 *  - Parvis koprim-sjekk gir tydelig feilmelding når CRT ikke gjelder.
 *  - Konstruksjonen vises eksplisitt: M = Πn_i, M_i = M/n_i, y_i = M_i⁻¹ (mod n_i),
 *    bidrag = a_i · M_i · y_i, x = Σ bidrag (mod M).
 *  - Verifisering: x mod n_i ≟ a_i for hver i.
 */
export function CrtSolver() {
  const [pairs, setPairs] = useState<Pair[]>(PRESETS[0].pairs);

  const result = useMemo(() => crtSolve(pairs), [pairs]);

  const updatePair = (idx: number, key: "a" | "n", val: string) => {
    const parsed = Number.parseInt(val || "0", 10);
    setPairs((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [key]: parsed } : p)),
    );
  };

  const addPair = () =>
    setPairs((prev) => [...prev, { a: 0, n: 2 }]);
  const removePair = (idx: number) =>
    setPairs((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Chinese Remainder Theorem (CRT)
      </div>

      <div className="text-[11px] text-muted-foreground">
        Løs systemet av kongruenser{" "}
        <span className="font-mono text-foreground">x ≡ a_i (mod n_i)</span>{" "}
        når <span className="font-mono">n_i</span> er parvis koprime. Svaret er
        unikt i <span className="font-mono">[0, M)</span>, der{" "}
        <span className="font-mono">M = Π n_i</span>.
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPairs(p.pairs.map((q) => ({ ...q })))}
            className="px-2 py-1 rounded text-[10px] border border-border bg-background hover:bg-muted"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {pairs.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]">
            <span className="text-muted-foreground font-mono w-6 text-right">
              x ≡
            </span>
            <input
              type="number"
              value={p.a}
              onChange={(e) => updatePair(i, "a", e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-1 font-mono text-xs"
              aria-label={`a_${i + 1}`}
            />
            <span className="text-muted-foreground font-mono">(mod</span>
            <input
              type="number"
              value={p.n}
              onChange={(e) => updatePair(i, "n", e.target.value)}
              className="w-20 rounded border border-border bg-background px-2 py-1 font-mono text-xs"
              aria-label={`n_${i + 1}`}
            />
            <span className="text-muted-foreground font-mono">)</span>
            <button
              type="button"
              onClick={() => removePair(i)}
              disabled={pairs.length <= 1}
              className="ml-auto text-[10px] text-rose-500 hover:text-rose-600 disabled:opacity-30"
              title="Fjern denne kongruensen"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addPair}
          className="px-2 py-1 rounded text-[10px] border border-dashed border-border hover:bg-muted"
        >
          + Legg til kongruens
        </button>
      </div>

      {result.ok ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-[11px] font-mono space-y-1.5">
          <div className="text-muted-foreground">
            M = {pairs.map((p) => p.n).join(" · ")} = {result.M}
          </div>
          {pairs.map((p, i) => (
            <div key={i} className="text-muted-foreground">
              M_{i + 1} = {result.M}/{p.n} = {result.Ms[i]}; &nbsp;y_{i + 1} =
              M_{i + 1}⁻¹ mod {p.n} = {result.ys[i]}; &nbsp;a_{i + 1}·M_
              {i + 1}·y_{i + 1} = {p.a}·{result.Ms[i]}·{result.ys[i]} ={" "}
              {result.contributions[i]}
            </div>
          ))}
          <div className="border-t border-emerald-500/30 pt-1.5 text-emerald-600 dark:text-emerald-400">
            Σ bidrag = {result.contributions.join(" + ")} ={" "}
            {result.contributions.reduce((s, c) => s + c, 0)}
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 text-base">
            x ≡ {result.x} (mod {result.M})
          </div>
          <div className="border-t border-emerald-500/30 pt-1.5 text-muted-foreground">
            Verifisering:
          </div>
          {pairs.map((p, i) => {
            const got = mod(result.x, p.n);
            const ok = got === mod(p.a, p.n);
            return (
              <div key={i}>
                {result.x} mod {p.n} = {got}{" "}
                <span className={ok ? "text-emerald-500" : "text-rose-500"}>
                  {ok ? "✓" : `✗ (skulle vært ${mod(p.a, p.n)})`}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3 text-[11px] text-rose-600 dark:text-rose-400">
          {result.reason}
        </div>
      )}

      <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px] leading-relaxed">
        <div className="font-semibold text-foreground mb-1">Hvor brukes CRT?</div>
        Det historiske eksempelet (Sun Tzu, 3. århundre) gjelder en general som teller
        soldater i grupper: "rest 2 i grupper av 3, rest 3 i grupper av 5, rest 2 i
        grupper av 7 → 23 soldater (mod 105)". I dag brukes CRT bl.a. til{" "}
        <span className="font-mono">RSA-CRT</span>-optimalisering: i stedet for én stor{" "}
        <span className="font-mono">mod N</span> regner vi to mindre{" "}
        <span className="font-mono">mod p</span> og <span className="font-mono">mod q</span>{" "}
        og setter sammen, ~4x raskere.
      </div>
    </div>
  );
}
