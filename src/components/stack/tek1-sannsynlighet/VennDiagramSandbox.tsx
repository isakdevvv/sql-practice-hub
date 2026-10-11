import { useMemo, useState } from "react";

// --------------------------------------------------------------------------
// VennDiagramSandbox — Venn-diagram for sannsynlighet (ikke kardinalitet).
// Studenten setter P(A), P(B) og P(A∩B) med slidere. Diagrammet
// viser arealene skalert etter sannsynlighet, og alle de avledede
// størrelsene — P(A∪B), P(Aᶜ), P(A|B), P(B|A), uavhengighet — regnes
// ut live så det er enkelt å se hvordan formlene henger sammen.
// --------------------------------------------------------------------------

type Region = "onlyA" | "onlyB" | "both" | "outside";

const REGIONS: { label: string; expr: (r: Region) => boolean; formula: string }[] = [
  { label: "A ∪ B", expr: (r) => r !== "outside", formula: "P(A) + P(B) − P(A∩B)" },
  { label: "A ∩ B", expr: (r) => r === "both", formula: "P(A∩B) direkte" },
  { label: "Aᶜ", expr: (r) => r === "onlyB" || r === "outside", formula: "1 − P(A)" },
  { label: "A \\ B", expr: (r) => r === "onlyA", formula: "P(A) − P(A∩B)" },
  { label: "A ⊕ B", expr: (r) => r === "onlyA" || r === "onlyB", formula: "P(A) + P(B) − 2·P(A∩B)" },
  { label: "(A ∪ B)ᶜ", expr: (r) => r === "outside", formula: "1 − P(A∪B)" },
];

const PRESETS: { label: string; pa: number; pb: number; pab: number; note: string }[] = [
  { label: "Disjunkte", pa: 0.4, pb: 0.3, pab: 0.0, note: "P(A∩B)=0 — kan ikke skje samtidig" },
  { label: "Uavhengige", pa: 0.5, pb: 0.4, pab: 0.2, note: "P(A∩B) = P(A)·P(B) = 0.2" },
  { label: "Sterk overlapp", pa: 0.6, pb: 0.5, pab: 0.4, note: "Stort snitt — sterkt assosierte" },
  { label: "A ⊂ B (nesten)", pa: 0.3, pb: 0.7, pab: 0.28, note: "A er nesten en delmengde av B" },
];

export function VennDiagramSandbox() {
  const [pa, setPa] = useState(0.5);
  const [pb, setPb] = useState(0.4);
  const [pab, setPab] = useState(0.2);
  const [regionIdx, setRegionIdx] = useState(1); // A ∩ B
  const [showCond, setShowCond] = useState(false);

  // Hold pab innenfor lovlig område: max(0, P(A)+P(B)−1) ≤ P(A∩B) ≤ min(P(A), P(B))
  const pabClamped = Math.max(Math.max(0, pa + pb - 1), Math.min(pab, Math.min(pa, pb)));
  const pabIllegal = Math.abs(pabClamped - pab) > 1e-6;

  const region = REGIONS[regionIdx];
  const regions = useMemo(
    () => ({
      onlyA: region.expr("onlyA"),
      onlyB: region.expr("onlyB"),
      both: region.expr("both"),
      outside: region.expr("outside"),
    }),
    [region],
  );

  const pUnion = pa + pb - pabClamped;
  const pOnlyA = pa - pabClamped;
  const pOnlyB = pb - pabClamped;
  const pOutside = 1 - pUnion;
  const pNotA = 1 - pa;
  const pSym = pOnlyA + pOnlyB;
  const pAgivenB = pb > 1e-9 ? pabClamped / pb : 0;
  const pBgivenA = pa > 1e-9 ? pabClamped / pa : 0;

  const indep = Math.abs(pabClamped - pa * pb) < 0.005;
  const disjoint = pabClamped < 0.005;

  // Velg hvilken P(...) som tilsvarer aktivert region (for å høylyse svaret)
  const pSelected = (() => {
    switch (region.label) {
      case "A ∪ B": return pUnion;
      case "A ∩ B": return pabClamped;
      case "Aᶜ": return pNotA;
      case "A \\ B": return pOnlyA;
      case "A ⊕ B": return pSym;
      case "(A ∪ B)ᶜ": return pOutside;
      default: return 0;
    }
  })();

  // Sirkelradius skalert til areal ∝ P. Velg maks-radius slik at union
  // alltid får plass innenfor 220×140-rektangelet.
  const W = 260;
  const H = 160;
  const cy = 86;
  // Konstant max-areal pi*Rmax^2 svarer til P=1.
  const Rmax = 56;
  const rA = Math.sqrt(pa) * Rmax;
  const rB = Math.sqrt(pb) * Rmax;

  // Bestem avstand mellom sirklene slik at det lens-formede snittet har
  // areal ≈ P(A∩B) · pi · Rmax^2. Vi løser numerisk (binary search).
  const d = useMemo(() => lensDistance(rA, rB, pabClamped * Math.PI * Rmax * Rmax), [rA, rB, pabClamped]);

  const cxA = W / 2 - d / 2;
  const cxB = W / 2 + d / 2;

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setPa(p.pa);
    setPb(p.pb);
    setPab(p.pab);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Venn-sandbox — P(A), P(B), P(A∩B) skalert til areal
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[11px] text-muted-foreground self-center mr-1">Preset:</span>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(i)}
            className="px-2 py-0.5 rounded text-[11px] border border-border bg-background hover:bg-muted/40"
            title={p.note}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Region-knapper */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[11px] text-muted-foreground self-center mr-1">Velg region:</span>
        {REGIONS.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setRegionIdx(i)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
              i === regionIdx
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-background hover:bg-muted/40"
            }`}
          >
            {r.label}
          </button>
        ))}
        <label className="flex items-center gap-1.5 ml-2 text-[11px] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCond}
            onChange={(e) => setShowCond(e.target.checked)}
          />
          <span>vis P(A|B)-vinkling</span>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* SVG */}
        <div>
          <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
              {/* Univers Ω */}
              <rect
                x={2}
                y={2}
                width={W - 4}
                height={H - 4}
                className={
                  regions.outside
                    ? "fill-brand/15 stroke-border"
                    : "fill-muted/20 stroke-border"
                }
                strokeDasharray="4 3"
                strokeWidth={1}
              />
              <text x={W - 8} y={14} textAnchor="end" fontSize={9} className="fill-muted-foreground">
                Ω
              </text>

              {/* I "vis P(A|B)"-modus: B vises som ny univers (krymp B til full opacity, gjør resten gjennomsiktig) */}
              {showCond && (
                <circle
                  cx={cxB}
                  cy={cy}
                  r={rB}
                  className="fill-amber-500/15 stroke-amber-500"
                  strokeWidth={1.2}
                  strokeDasharray="3 2"
                />
              )}

              {/* Sirkel A */}
              <circle
                cx={cxA}
                cy={cy}
                r={rA}
                className={
                  regions.onlyA
                    ? "fill-brand/40 stroke-brand"
                    : "fill-transparent stroke-border"
                }
                strokeWidth={1.5}
                fillOpacity={showCond ? 0.25 : 0.6}
              />
              {/* Sirkel B */}
              <circle
                cx={cxB}
                cy={cy}
                r={rB}
                className={
                  regions.onlyB
                    ? "fill-brand/40 stroke-brand"
                    : "fill-transparent stroke-border"
                }
                strokeWidth={1.5}
                fillOpacity={showCond ? 0.25 : 0.6}
              />
              {/* Snitt */}
              {regions.both && pabClamped > 0 && (
                <path
                  d={intersectionPath(cxA, cxB, cy, rA, rB)}
                  className="fill-brand/55 stroke-brand"
                  strokeWidth={1.5}
                />
              )}
              {/* I "P(A|B)"-modus: høylyser A∩B kraftig som andel av B */}
              {showCond && pabClamped > 0 && (
                <path
                  d={intersectionPath(cxA, cxB, cy, rA, rB)}
                  className="fill-amber-500/55 stroke-amber-500"
                  strokeWidth={1.5}
                />
              )}

              {/* Etiketter */}
              <text x={cxA - rA + 4} y={cy - rA - 2} fontSize={11} className="fill-foreground font-semibold">
                A
              </text>
              <text x={cxB + rB - 12} y={cy - rB - 2} fontSize={11} className="fill-foreground font-semibold">
                B
              </text>

              {/* Sentrale labels med sannsynlighetstall — kun hvis det er plass */}
              {rA > 14 && (
                <text x={cxA} y={cy + 3} textAnchor="middle" fontSize={9} className="fill-foreground/80">
                  {pOnlyA.toFixed(2)}
                </text>
              )}
              {rB > 14 && (
                <text x={cxB} y={cy + 3} textAnchor="middle" fontSize={9} className="fill-foreground/80">
                  {pOnlyB.toFixed(2)}
                </text>
              )}
              {pabClamped > 0.02 && d < rA + rB && (
                <text
                  x={(cxA + cxB) / 2}
                  y={cy + 3}
                  textAnchor="middle"
                  fontSize={9}
                  className="fill-foreground font-semibold"
                >
                  {pabClamped.toFixed(2)}
                </text>
              )}
              {/* Utenfor */}
              <text x={10} y={H - 6} fontSize={9} className="fill-muted-foreground">
                utenfor: {pOutside.toFixed(2)}
              </text>
            </svg>
          </div>
          <div className="mt-1.5 text-[11px] text-center text-muted-foreground">
            {showCond ? (
              <>P(A|B) = orange-areal / B-areal = <span className="font-mono">{pAgivenB.toFixed(3)}</span></>
            ) : (
              <>P({region.label}) = <span className="font-mono">{region.formula}</span> = <span className="font-mono text-brand">{pSelected.toFixed(3)}</span></>
            )}
          </div>
        </div>

        {/* Slidere + tall */}
        <div className="space-y-3 text-xs">
          <SliderRow label="P(A)" value={pa} onChange={setPa} />
          <SliderRow label="P(B)" value={pb} onChange={setPb} />
          <SliderRow
            label="P(A∩B)"
            value={pab}
            onChange={setPab}
            max={1}
            warn={pabIllegal}
            warnText={`klippes til ${pabClamped.toFixed(2)} (må være ≤ min(P(A),P(B)) og ≥ P(A)+P(B)−1)`}
          />

          <div className="rounded-md border border-border bg-background/40 p-3 font-mono text-[11px] space-y-1">
            <div>P(A ∪ B) = P(A) + P(B) − P(A∩B)</div>
            <div className="text-brand">
              = {pa.toFixed(2)} + {pb.toFixed(2)} − {pabClamped.toFixed(2)} = {pUnion.toFixed(3)}
            </div>
            <div className="border-t border-border pt-1 mt-1">
              P(A | B) = P(A∩B) / P(B) = {pAgivenB.toFixed(3)}
            </div>
            <div>P(B | A) = P(A∩B) / P(A) = {pBgivenA.toFixed(3)}</div>
            <div className="border-t border-border pt-1 mt-1">
              {disjoint ? (
                <span className="text-amber-500">A og B er DISJUNKTE (snitt = 0)</span>
              ) : indep ? (
                <span className="text-emerald-500">
                  A og B er UAVHENGIGE (P(A∩B) ≈ P(A)·P(B) = {(pa * pb).toFixed(3)})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Avhengige: P(A∩B) = {pabClamped.toFixed(3)} vs P(A)·P(B) = {(pa * pb).toFixed(3)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-border bg-background/40 p-2.5 text-[11px] text-muted-foreground leading-snug">
        <span className="font-semibold text-foreground">Hva å se etter:</span>{" "}
        Arealet av en sirkel er proporsjonalt med sannsynligheten — bevisst,
        for å hindre intuisjon-feller. Sett P(A∩B) = P(A)·P(B) (uavhengighet)
        og merk at sirklene treffer i nøyaktig riktig overlapp. Toggle «vis
        P(A|B)-vinkling» for å se hvorfor betinging er det samme som å bytte
        univers: nå er B det nye Ω, og A∩B er den delen vi spør om.
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  warn = false,
  warnText,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  warn?: boolean;
  warnText?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-muted-foreground">
        {label} = <span className="font-mono text-foreground">{value.toFixed(2)}</span>
        {warn && warnText && (
          <span className="ml-2 text-[10px] text-amber-500">{warnText}</span>
        )}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        className="w-full accent-brand"
      />
    </label>
  );
}

// --------------------------------------------------------------------------
// Geometri-helpers
// Finn avstand d mellom to sirkler slik at snittet (lens) har gitt areal.
// Bruker binærsøk; analytisk formel finnes men er stygg.
// --------------------------------------------------------------------------
function lensArea(rA: number, rB: number, d: number): number {
  if (d >= rA + rB) return 0;
  if (d <= Math.abs(rA - rB)) {
    const rMin = Math.min(rA, rB);
    return Math.PI * rMin * rMin;
  }
  const part = (r: number, other: number) => {
    const x = (d * d + r * r - other * other) / (2 * d);
    const clamped = Math.max(-1, Math.min(1, x / r));
    return r * r * Math.acos(clamped) - x * Math.sqrt(Math.max(0, r * r - x * x));
  };
  return part(rA, rB) + part(rB, rA);
}

function lensDistance(rA: number, rB: number, targetArea: number): number {
  if (rA <= 0 || rB <= 0) return rA + rB + 6;
  const rMin = Math.min(rA, rB);
  const maxArea = Math.PI * rMin * rMin;
  if (targetArea <= 0) return rA + rB + 4;
  if (targetArea >= maxArea) return Math.abs(rA - rB);
  let lo = Math.abs(rA - rB);
  let hi = rA + rB;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const a = lensArea(rA, rB, mid);
    if (a > targetArea) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function intersectionPath(cxA: number, cxB: number, cy: number, rA: number, rB: number): string {
  const d = Math.abs(cxB - cxA);
  if (d >= rA + rB) return "";
  if (d <= Math.abs(rA - rB)) {
    const rMin = Math.min(rA, rB);
    const cx = rA < rB ? cxA : cxB;
    return `M ${cx + rMin} ${cy} A ${rMin} ${rMin} 0 1 0 ${cx - rMin} ${cy} A ${rMin} ${rMin} 0 1 0 ${cx + rMin} ${cy} Z`;
  }
  // Snittpunkter
  const a = (d * d + rA * rA - rB * rB) / (2 * d);
  const h = Math.sqrt(Math.max(0, rA * rA - a * a));
  const xMid = cxA + a;
  const top = `${xMid},${cy - h}`;
  const bottom = `${xMid},${cy + h}`;
  // Buer fra topp → bunn rundt B, så bunn → topp rundt A.
  return `M ${top} A ${rB} ${rB} 0 0 1 ${bottom} A ${rA} ${rA} 0 0 1 ${top} Z`;
}
