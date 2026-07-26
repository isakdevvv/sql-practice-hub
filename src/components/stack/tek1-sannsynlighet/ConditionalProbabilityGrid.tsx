import { useMemo, useState } from "react";

/**
 * ConditionalProbabilityGrid — 10×10-grid representerer 100 individer.
 *
 * Hver celle har 2 binære attributter (A og B). Forhåndsdefinerte presets
 * styrer fordelingen (eks: røyking × kreft). Brukeren kan veksle mellom
 * presets eller skru på «random»-knappen for å se betinget sannsynlighet
 * fra rå tellinger.
 *
 * Vi viser P(A), P(B), P(A∩B), P(A|B), P(B|A) live.
 * "Independence-check": når P(A|B) ≈ P(A) → indikerer at A og B er nær uavhengige.
 */

type Cell = { a: boolean; b: boolean };

type Preset = {
  id: string;
  name: string;
  labelA: string;
  labelB: string;
  pA: number;
  pB: number;
  pBgivenA: number; // styrer korrelasjon
  story: string;
};

const PRESETS: Preset[] = [
  {
    id: "smoking-cancer",
    name: "Røyking × kreft",
    labelA: "Røyker",
    labelB: "Kreft",
    pA: 0.2,
    pB: 0.05,
    pBgivenA: 0.18,
    story:
      "Røykere er overrepresentert blant kreft-tilfeller. P(kreft | røyker) er langt høyere enn P(kreft).",
  },
  {
    id: "vaccine-side",
    name: "Vaksine × bivirkning",
    labelA: "Vaksinert",
    labelB: "Bivirkning",
    pA: 0.7,
    pB: 0.1,
    pBgivenA: 0.13,
    story:
      "Bivirkninger er hyppigere hos vaksinerte enn uvaksinerte — men forskjellen er liten (mild korrelasjon).",
  },
  {
    id: "edu-income",
    name: "Høyere utdanning × høy lønn",
    labelA: "Høyere utdanning",
    labelB: "Høy lønn",
    pA: 0.35,
    pB: 0.25,
    pBgivenA: 0.5,
    story:
      "Hverken-eller-folk er flertall, men gruppen med høyere utdanning har sterkt forhøyet sjanse for høy lønn.",
  },
  {
    id: "independent",
    name: "To uavhengige flagg (kontroll)",
    labelA: "Venstrehendt",
    labelB: "Født i partall-måned",
    pA: 0.1,
    pB: 0.5,
    pBgivenA: 0.5,
    story: "Disse to har ingen kjent sammenheng — P(B|A) ≈ P(B) ≈ 0.5. Bra kontrolleksempel.",
  },
];

function generateGrid(preset: Preset, seed: number): Cell[] {
  // Determined RNG (Mulberry32)
  let s = seed >>> 0;
  function rand() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const cells: Cell[] = [];
  const pA = preset.pA;
  const pBgA = preset.pBgivenA;
  // P(B|¬A) er valgt slik at totalen P(B) blir riktig:
  // P(B) = P(B|A)·P(A) + P(B|¬A)·P(¬A)
  // P(B|¬A) = (P(B) - P(B|A)·P(A)) / (1 - P(A))
  const pBgivenNotA = Math.max(0, Math.min(1, (preset.pB - pBgA * pA) / (1 - pA)));
  for (let i = 0; i < 100; i++) {
    const a = rand() < pA;
    const b = a ? rand() < pBgA : rand() < pBgivenNotA;
    cells.push({ a, b });
  }
  return cells;
}

export function ConditionalProbabilityGrid() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [seed, setSeed] = useState(42);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const cells = useMemo(() => generateGrid(preset, seed), [preset, seed]);

  const stats = useMemo(() => {
    const total = cells.length;
    const a = cells.filter((c) => c.a).length;
    const b = cells.filter((c) => c.b).length;
    const ab = cells.filter((c) => c.a && c.b).length;
    const pA = a / total;
    const pB = b / total;
    const pAB = ab / total;
    const pAgivenB = b > 0 ? ab / b : 0;
    const pBgivenA = a > 0 ? ab / a : 0;
    const independent = Math.abs(pAgivenB - pA) < 0.05;
    return { total, a, b, ab, pA, pB, pAB, pAgivenB, pBgivenA, independent };
  }, [cells]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Scenario:</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPresetId(p.id)}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
              presetId === p.id
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="ml-auto px-2.5 py-1 rounded-md text-xs border border-border bg-background hover:bg-muted/50 transition-colors"
        >
          Trekk på nytt
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{preset.story}</p>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <div>
          <div className="grid grid-cols-10 gap-[2px] w-fit">
            {cells.map((c, i) => {
              const color =
                c.a && c.b
                  ? "bg-violet-500"
                  : c.a
                    ? "bg-sky-500"
                    : c.b
                      ? "bg-rose-400"
                      : "bg-muted";
              return (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-sm ${color}`}
                  title={`${c.a ? preset.labelA : `ikke ${preset.labelA}`}, ${c.b ? preset.labelB : `ikke ${preset.labelB}`}`}
                />
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500" /> {preset.labelA}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-400" /> {preset.labelB}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-violet-500" /> Begge
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-muted" /> Ingen
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold">Hendelse</th>
                  <th className="text-right px-3 py-1.5 font-semibold">Telling</th>
                  <th className="text-right px-3 py-1.5 font-semibold">Sannsynlighet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono">A = {preset.labelA}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{stats.a} / 100</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                    P(A) = {stats.pA.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono">B = {preset.labelB}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{stats.b} / 100</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                    P(B) = {stats.pB.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-1.5 font-mono">A ∩ B</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{stats.ab} / 100</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                    P(A∩B) = {stats.pAB.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="px-3 py-1.5 font-mono">A | B</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {stats.ab} / {stats.b || 0}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold tabular-nums">
                    P(A|B) = {stats.pAgivenB.toFixed(3)}
                  </td>
                </tr>
                <tr className="border-t border-border bg-muted/30">
                  <td className="px-3 py-1.5 font-mono">B | A</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {stats.ab} / {stats.a || 0}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold tabular-nums">
                    P(B|A) = {stats.pBgivenA.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            className={`rounded-md border p-3 text-[11px] leading-relaxed ${
              stats.independent
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-amber-500/40 bg-amber-500/5"
            }`}
          >
            <strong>Uavhengighet-sjekk:</strong> P(A|B) = {stats.pAgivenB.toFixed(3)}, P(A) ={" "}
            {stats.pA.toFixed(3)}. Differanse = {Math.abs(stats.pAgivenB - stats.pA).toFixed(3)}.
            {stats.independent
              ? " → A og B ser ut til å være tilnærmet uavhengige i dette utvalget."
              : " → A og B er ASSOSIERTE: kunnskap om B endrer P(A) merkbart."}
          </div>
        </div>
      </div>
    </div>
  );
}
