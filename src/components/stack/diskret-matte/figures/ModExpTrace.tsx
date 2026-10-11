import { useMemo, useState } from "react";

type Step = {
  k: number;
  bit: number;
  a: number;
  result: number;
  combined: boolean;
};

function trace(aIn: number, kIn: number, n: number): Step[] {
  const steps: Step[] = [];
  let a = ((aIn % n) + n) % n;
  let k = kIn;
  let result = 1 % n;
  while (k > 0) {
    const bit = k % 2;
    const combined = bit === 1;
    if (combined) result = (result * a) % n;
    steps.push({ k, bit, a, result, combined });
    a = (a * a) % n;
    k = Math.floor(k / 2);
  }
  return steps;
}

const PRESETS: { label: string; a: number; k: number; n: number }[] = [
  { label: "3¹³ mod 7", a: 3, k: 13, n: 7 },
  { label: "2¹⁰ mod 1000", a: 2, k: 10, n: 1000 },
  { label: "5²⁰ mod 13", a: 5, k: 20, n: 13 },
  { label: "7¹⁰⁰ mod 11", a: 7, k: 100, n: 11 },
];

export function ModExpTrace() {
  const [a, setA] = useState(3);
  const [k, setK] = useState(13);
  const [n, setN] = useState(7);
  const [step, setStep] = useState(0);

  const steps = useMemo(() => trace(a, k, n), [a, k, n]);
  const final = steps.length > 0 ? steps[steps.length - 1] : null;
  const finalResult = final
    ? final.bit === 1
      ? final.result
      : final.result
    : 1 % n;
  const naive = useMemo(() => {
    if (k <= 30) return Math.pow(a, k) % n;
    return null;
  }, [a, k, n]);

  const binary = k.toString(2);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setA(p.a);
    setK(p.k);
    setN(p.n);
    setStep(0);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          pow_mod(a, k, n) — trace
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-[10px] px-2 py-1 rounded border border-border hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 mb-3">
        <label className="text-xs flex items-center gap-2">
          <span className="text-muted-foreground w-6">a</span>
          <input
            type="number"
            value={a}
            onChange={(e) => {
              setA(Math.max(0, Math.min(999, parseInt(e.target.value, 10) || 0)));
              setStep(0);
            }}
            className="flex-1 bg-background border border-border rounded px-2 py-1 font-mono"
          />
        </label>
        <label className="text-xs flex items-center gap-2">
          <span className="text-muted-foreground w-6">k</span>
          <input
            type="number"
            value={k}
            onChange={(e) => {
              setK(Math.max(0, Math.min(9999, parseInt(e.target.value, 10) || 0)));
              setStep(0);
            }}
            className="flex-1 bg-background border border-border rounded px-2 py-1 font-mono"
          />
        </label>
        <label className="text-xs flex items-center gap-2">
          <span className="text-muted-foreground w-6">n</span>
          <input
            type="number"
            value={n}
            onChange={(e) => {
              setN(Math.max(1, Math.min(9999, parseInt(e.target.value, 10) || 1)));
              setStep(0);
            }}
            className="flex-1 bg-background border border-border rounded px-2 py-1 font-mono"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Binary expansion view */}
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-2">
            Binær oppdeling av k = {k}
          </div>
          <div className="font-mono text-xs space-y-1">
            <div>
              k₂ ={" "}
              <span className="text-brand font-bold">
                {binary
                  .split("")
                  .map((b, i) => (
                    <span
                      key={i}
                      className={b === "1" ? "text-emerald-600 dark:text-emerald-400" : ""}
                    >
                      {b}
                    </span>
                  ))}
              </span>
            </div>
            <div className="text-muted-foreground">
              {binary.length} bit, leses fra høyre til venstre i loopen.
            </div>
            <div className="mt-2">
              {binary
                .split("")
                .reverse()
                .map((b, i) => (
                  <div
                    key={i}
                    className={`text-[11px] ${
                      i <= step
                        ? b === "1"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                        : "opacity-30"
                    }`}
                  >
                    bit {i}: <span className="font-bold">{b}</span> ×{" "}
                    {b === "1" ? `a^${1 << i} = inkluder` : "skip"}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Step trace */}
        <div className="rounded-xl border border-border bg-background p-3 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
              Iterasjons-tabell
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() =>
                  setStep((s) => Math.min(steps.length - 1, s + 1))
                }
                className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted"
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => setStep(steps.length - 1)}
                className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted"
              >
                Slutt
              </button>
            </div>
          </div>
          <table className="text-xs font-mono w-full">
            <thead>
              <tr className="text-muted-foreground">
                <th className="px-1 py-0.5 text-left">i</th>
                <th className="px-1 py-0.5 text-left">k</th>
                <th className="px-1 py-0.5 text-left">k%2</th>
                <th className="px-1 py-0.5 text-left">a</th>
                <th className="px-1 py-0.5 text-left">result</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => (
                <tr
                  key={i}
                  className={`${i === step ? "bg-brand/15" : ""} ${
                    i > step ? "opacity-40" : ""
                  } border-t border-border/50`}
                >
                  <td className="px-1 py-0.5">{i}</td>
                  <td className="px-1 py-0.5">{s.k}</td>
                  <td
                    className={`px-1 py-0.5 ${
                      s.bit === 1 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""
                    }`}
                  >
                    {s.bit}
                  </td>
                  <td className="px-1 py-0.5">{s.a}</td>
                  <td className="px-1 py-0.5">{s.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-background p-3 text-xs">
        <div className="font-mono">
          <span className="text-muted-foreground">{a}</span>
          <sup>{k}</sup> mod <span className="text-muted-foreground">{n}</span> ={" "}
          <span className="text-brand font-bold text-base">{finalResult}</span>
          {naive !== null && (
            <span className="text-muted-foreground ml-3">
              (naivt: {a}^{k} mod {n} = {naive} {naive === finalResult ? "✓" : "✗"})
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          Antall iterasjoner: <strong>{steps.length}</strong> (≈ log₂ k). En naiv
          beregning ville krevd {k} multiplikasjoner og produsert et tall med opp til{" "}
          {Math.floor(k * Math.log10(Math.max(2, a))) + 1} sifre før mod.
        </div>
      </div>
    </div>
  );
}
