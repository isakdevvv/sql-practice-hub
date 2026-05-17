import { useMemo, useState } from "react";
import { euclidSteps, extendedEuclid } from "./modUtils";

/**
 * Euklids algoritme — steg-for-steg + visuell rektangel-nedbryting.
 *
 * Pedagogisk vinkel:
 *  - Tabell: hver iterasjon viser a = q·b + r, så bytter vi (a, b) ← (b, r).
 *  - Rektangel: vi tegner a×1 (eller a×b-bredt? — vi bruker 1D-strimler), trekker fra
 *    så mange b-stykker som mulig, og det som blir igjen er r. Når r blir 0, har
 *    forrige b "delt" strimmelen perfekt — det er gcd.
 *  - Extended Euclidean: viser hvordan vi rekonstruerer x, y i Bezouts identitet
 *    a·x + b·y = gcd(a, b).
 */
export function EuclideanAlgorithmViz() {
  const [a, setA] = useState(252);
  const [b, setB] = useState(105);
  const [showExtended, setShowExtended] = useState(false);

  const steps = useMemo(() => euclidSteps(a, b), [a, b]);
  const ext = useMemo(() => extendedEuclid(a, b), [a, b]);
  const gcdValue = steps[steps.length - 1]?.a ?? 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose space-y-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold">
        Euklids algoritme — gcd(a, b)
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <label className="block space-y-1">
          <span className="text-muted-foreground">a</span>
          <input
            type="number"
            value={a}
            onChange={(e) =>
              setA(Math.max(1, Number.parseInt(e.target.value || "1", 10)))
            }
            className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-muted-foreground">b</span>
          <input
            type="number"
            value={b}
            onChange={(e) =>
              setB(Math.max(1, Number.parseInt(e.target.value || "1", 10)))
            }
            className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
      </div>

      <div className="rounded-md border border-border bg-background p-3 text-[11px] font-mono">
        <div className="text-muted-foreground mb-2">
          Hver rad: a = q·b + r &nbsp; → &nbsp; (a, b) ← (b, r). Stopp når b = 0.
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1 pr-3">a</th>
              <th className="py-1 pr-3">b</th>
              <th className="py-1 pr-3">q</th>
              <th className="py-1">r</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const isLast = i === steps.length - 1;
              return (
                <tr
                  key={i}
                  className={
                    isLast
                      ? "text-emerald-500 border-t border-border"
                      : "border-t border-border/40"
                  }
                >
                  <td className="py-1 pr-3">{s.a}</td>
                  <td className="py-1 pr-3">{s.b}</td>
                  <td className="py-1 pr-3">{isLast ? "—" : s.q}</td>
                  <td className="py-1">{isLast ? `gcd = ${s.a}` : s.r}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <div className="text-[11px] text-muted-foreground mb-2">
          Visuell nedbryting — hver iterasjon: tegn strimmel av lengde a, fjern
          så mange b-segmenter som mulig (q stk), det som er igjen er r.
        </div>
        <div className="space-y-1.5">
          {steps.slice(0, -1).map((s, i) => (
            <RectStrip key={i} step={s} index={i} />
          ))}
          <div className="text-[11px] text-emerald-500 font-mono pt-1">
            gcd({a}, {b}) = {gcdValue}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowExtended((v) => !v)}
          className="text-[11px] text-brand hover:underline"
        >
          {showExtended ? "Skjul" : "Vis"} Extended Euclidean (Bezouts identitet)
        </button>

        {showExtended && (
          <div className="mt-2 space-y-2 text-[11px]">
            <div className="text-muted-foreground">
              Vi kan rekonstruere x, y slik at <span className="font-mono text-foreground">a·x + b·y = gcd(a, b)</span>{" "}
              ved å bak-substituere kvotientene fra over.
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 font-mono text-emerald-700 dark:text-emerald-400">
              {a} · ({ext.x}) + {b} · ({ext.y}) ={" "}
              {a * ext.x + b * ext.y} = gcd
            </div>
            <details className="text-[11px]">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Vis steg-for-steg (kolonner s, t)
              </summary>
              <table className="w-full text-left mt-2 font-mono">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="py-1 pr-2">a</th>
                    <th className="py-1 pr-2">b</th>
                    <th className="py-1 pr-2">q</th>
                    <th className="py-1 pr-2">r</th>
                    <th className="py-1 pr-2">s</th>
                    <th className="py-1">t</th>
                  </tr>
                </thead>
                <tbody>
                  {ext.steps.map((s, i) => (
                    <tr key={i} className="border-t border-border/40">
                      <td className="py-1 pr-2">{s.a}</td>
                      <td className="py-1 pr-2">{s.b}</td>
                      <td className="py-1 pr-2">{s.q}</td>
                      <td className="py-1 pr-2">{s.r}</td>
                      <td className="py-1 pr-2">{s.s}</td>
                      <td className="py-1">{s.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-[10px] text-muted-foreground mt-1">
                Hver (s, t)-rad gjelder for r-en på samme rad: s·a₀ + t·b₀ = r.
                Stopp-raden er den hvor neste r ville blitt 0 — da har vi
                (x, y) for selve gcd.
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function RectStrip({
  step,
  index,
}: {
  step: { a: number; b: number; q: number; r: number };
  index: number;
}) {
  const width = 100;
  const aLen = step.a;
  const bLen = step.b;
  const unit = width / aLen;
  const bPx = bLen * unit;
  const rPx = step.r * unit;
  // Bygg q blokker à b, deretter remainder.
  const bBlocks = Array.from({ length: step.q }, (_, i) => i);
  return (
    <div className="flex items-center gap-2 text-[10px] font-mono">
      <span className="text-muted-foreground w-12 text-right">#{index + 1}</span>
      <div
        className="relative h-5 flex-1 rounded border border-border bg-muted/40 overflow-hidden"
        title={`${step.a} = ${step.q}·${step.b} + ${step.r}`}
      >
        {bBlocks.map((i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 bg-brand/30 border-r border-brand/60"
            style={{
              left: `${(i * bPx) / width * 100}%`,
              width: `${(bPx / width) * 100}%`,
            }}
          />
        ))}
        {step.r > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-amber-400/50 border-r border-amber-500/70"
            style={{
              left: `${((bBlocks.length * bPx) / width) * 100}%`,
              width: `${(rPx / width) * 100}%`,
            }}
          />
        )}
      </div>
      <span className="text-muted-foreground w-44 shrink-0">
        {step.a} = {step.q}·{step.b} +{" "}
        <span className={step.r === 0 ? "text-emerald-500" : "text-amber-500"}>
          {step.r}
        </span>
      </span>
    </div>
  );
}
