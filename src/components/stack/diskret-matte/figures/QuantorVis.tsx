import { useMemo, useState } from "react";

// Visualiser ∀ og ∃ med konkrete predikater på en endelig mengde.
// Studenten kan velge predikat fra dropdown og se hvilke elementer
// som tilfredsstiller det — markert visuelt — og kvantoruttrykket vurderes.

type Predicate = {
  id: string;
  label: string;
  /** Predicate over the domain — true if element satisfies P. */
  test: (n: number) => boolean;
};

const DOMAIN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const PREDICATES: Predicate[] = [
  { id: "even", label: "P(x) := x er partall", test: (n) => n % 2 === 0 },
  { id: "prime", label: "P(x) := x er primtall", test: (n) => [2, 3, 5, 7].includes(n) },
  { id: "gt5", label: "P(x) := x > 5", test: (n) => n > 5 },
  { id: "lt100", label: "P(x) := x < 100", test: () => true },
  { id: "neg", label: "P(x) := x < 0", test: () => false },
  { id: "sq", label: "P(x) := x er kvadrattall", test: (n) => Number.isInteger(Math.sqrt(n)) },
];

export function QuantorVis() {
  const [predId, setPredId] = useState("even");
  const pred = PREDICATES.find((p) => p.id === predId)!;

  const satisfying = useMemo(() => DOMAIN.filter(pred.test), [pred]);
  const forallTrue = satisfying.length === DOMAIN.length;
  const existsTrue = satisfying.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Kvantorer — ∀ og ∃ visualisert
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Domene: <code>D = {`{1, 2, ..., 10}`}</code>. Velg et predikat P(x), så ser du
        hvilke elementer som oppfyller det og om kvantoruttrykkene er sanne.
      </p>

      <label className="block text-xs space-y-1 mb-3">
        <span className="text-muted-foreground">Velg predikat:</span>
        <select
          value={predId}
          onChange={(e) => setPredId(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm font-mono"
        >
          {PREDICATES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {DOMAIN.map((n) => {
          const hit = pred.test(n);
          return (
            <span
              key={n}
              className={`inline-flex items-center justify-center w-8 h-8 rounded text-xs font-mono font-semibold border transition-colors ${
                hit
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-background text-muted-foreground"
              }`}
              title={hit ? "P(x) er sann" : "P(x) er usann"}
            >
              {n}
            </span>
          );
        })}
      </div>

      <div className="space-y-2 text-xs">
        <Verdict
          symbol="∀"
          claim={`∀x ∈ D : P(x)`}
          reads={`"FOR ALLE x i D er P(x) sann"`}
          isTrue={forallTrue}
          rationale={
            forallTrue
              ? "Hvert eneste element oppfyller P. Påstanden holder."
              : `Motbevis: x = ${DOMAIN.find((n) => !pred.test(n))} bryter P. Det holder med ETT motbevis for å gjøre ∀ usann.`
          }
        />
        <Verdict
          symbol="∃"
          claim={`∃x ∈ D : P(x)`}
          reads={`"DET FINNES x i D slik at P(x) er sann"`}
          isTrue={existsTrue}
          rationale={
            existsTrue
              ? `Vitne: x = ${satisfying[0]} oppfyller P. Det holder med ETT eksempel for å gjøre ∃ sann.`
              : "Ingen element oppfyller P — ∃ er usann."
          }
        />
      </div>

      <div className="mt-3 rounded-md border border-border bg-background p-3 text-[11px] space-y-1">
        <div className="text-muted-foreground uppercase tracking-wider text-[9px] mb-1">
          Negerings-regler
        </div>
        <div className="font-mono">¬(∀x P(x)) ≡ ∃x ¬P(x)</div>
        <div className="font-mono">¬(∃x P(x)) ≡ ∀x ¬P(x)</div>
        <div className="text-muted-foreground mt-1">
          Push negasjonen inn, bytt kvantor underveis.
        </div>
      </div>
    </div>
  );
}

function Verdict({
  symbol,
  claim,
  reads,
  isTrue,
  rationale,
}: {
  symbol: string;
  claim: string;
  reads: string;
  isTrue: boolean;
  rationale: string;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        isTrue
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-rose-500/40 bg-rose-500/5"
      }`}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-lg font-bold text-brand">{symbol}</span>
        <span className="font-mono text-sm">{claim}</span>
        <span
          className={`ml-auto px-2 py-0.5 rounded text-[10px] font-semibold ${
            isTrue ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-500"
          }`}
        >
          {isTrue ? "SANN" : "USANN"}
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground italic mb-1">{reads}</div>
      <div className="text-[11px] text-foreground/80">{rationale}</div>
    </div>
  );
}
