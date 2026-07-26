import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import {
  drawFrom,
  mean,
  mulberry32,
  normalPdf,
  popMean,
  popStd,
  type PopKind,
  type PopParams,
} from "../tek1-inferens-sampling/statUtils";

/**
 * Standardfeil-byggeren — broen fra σ til σ/√n.
 *
 * Dette er skillet nesten alle roter med, og alt av inferens hviler på det:
 *   σ      = hvor mye ETT måleresultat spriker
 *   σ/√n   = hvor mye GJENNOMSNITTET av n måleresultater spriker
 *
 * De to tegnes her i samme skala, side om side, slik at innsnevringen er
 * synlig framfor påstått. Skyveknappen for n gjør kvadratrot-loven fysisk:
 * fire ganger så mange målinger halverer bredden — ikke dobbelt så mange.
 */

const POPS: { kind: PopKind; label: string; par: PopParams }[] = [
  { kind: "normal", label: "Normal", par: { mu: 50, sigma: 10 } },
  { kind: "uniform", label: "Uniform", par: { a: 30, b: 70 } },
  { kind: "exponential", label: "Skjev (eksponentiell)", par: { lambda: 1 / 20 } },
  { kind: "bimodal", label: "Bimodal", par: { mu1: 39, sd1: 6, mu2: 61, sd2: 6, p: 0.5 } },
];

const N_STEPS = [1, 2, 4, 9, 16, 25, 49, 100, 400];

export function StandardfeilBygger() {
  const [popIdx, setPopIdx] = useState(0);
  const [nIdx, setNIdx] = useState(3); // n = 9
  const [seed, setSeed] = useState(1);

  const pop = POPS[popIdx];
  const n = N_STEPS[nIdx];
  const mu = popMean(pop.kind, pop.par);
  const sigma = popStd(pop.kind, pop.par);
  const se = sigma / Math.sqrt(n);

  // Trekk 400 utvalg à n observasjoner og ta gjennomsnittet av hvert.
  const means = useMemo(() => {
    const rng = mulberry32(seed * 7919);
    const out: number[] = [];
    for (let i = 0; i < 400; i++) {
      const sample: number[] = [];
      for (let j = 0; j < n; j++) sample.push(drawFrom(rng, pop.kind, pop.par));
      out.push(mean(sample));
    }
    return out;
  }, [pop, n, seed]);

  // Felles akse for begge kurvene — hele poenget er at de deler skala.
  const lo = mu - 3.2 * sigma;
  const hi = mu + 3.2 * sigma;
  const W = 560;
  const H = 190;
  const x = (v: number) => ((v - lo) / (hi - lo)) * W;

  // Tetthetskurver, begge normalisert mot den bratteste (σ/√n-kurven)
  const peak = normalPdf(mu, mu, se);
  const curve = (s: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 220; i++) {
      const v = lo + ((hi - lo) * i) / 220;
      const y = H - (normalPdf(v, mu, s) / peak) * (H - 14);
      pts.push(`${x(v).toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const spread = Math.max(...means) - Math.min(...means);

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Fra σ til σ/√n — hvorfor gjennomsnitt er tryggere</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          <Tex>{"\\sigma"}</Tex> (sigma) sier hvor mye <em>én</em> måling spriker.{" "}
          <Tex>{"\\sigma/\\sqrt{n}"}</Tex> — standardfeilen (eng: <em>standard error</em>, SE) —
          sier hvor mye <em>gjennomsnittet</em> av <Tex>{"n"}</Tex> målinger spriker. Alt du senere
          gjør med konfidensintervall og hypotesetester bruker den andre, ikke den første.
        </p>
      </div>

      {/* Kontroller */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Populasjon
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPS.map((p, i) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPopIdx(i)}
                className={`rounded border px-2.5 py-1 text-xs font-medium transition ${
                  i === popIdx
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="rounded border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted"
        >
          Trekk på nytt
        </button>
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Utvalgsstørrelse n
          </span>
          <span className="font-mono text-sm font-bold tabular-nums">n = {n}</span>
        </div>
        <input
          type="range"
          min={0}
          max={N_STEPS.length - 1}
          step={1}
          value={nIdx}
          onChange={(e) => setNIdx(Number(e.target.value))}
          className="w-full accent-brand"
          aria-label="Utvalgsstørrelse"
        />
      </div>

      {/* Selve poenget: to spredninger i samme skala */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 34}`} className="w-full min-w-[460px]">
          {/* prikker: de 400 gjennomsnittene, som viser hvor de faktisk landet */}
          {means.map((m, i) => (
            <circle
              key={i}
              // Avrundes til streng: rå flyttall serialiseres ulikt på server
              // og klient og gir hydration-mismatch.
              cx={x(m).toFixed(2)}
              cy={H + 10 + ((i * 7919) % 13) - 6}
              r={1.4}
              className="fill-brand"
              opacity={0.35}
            />
          ))}

          {/* σ — spredningen til én måling */}
          <polyline
            points={curve(sigma)}
            fill="none"
            strokeWidth={2}
            className="stroke-muted-foreground"
            strokeDasharray="5 4"
            opacity={0.85}
          />
          {/* σ/√n — spredningen til gjennomsnittet */}
          <polyline points={curve(se)} fill="none" strokeWidth={2.5} className="stroke-brand" />

          {/* midtlinje ved μ */}
          <line
            x1={x(mu)}
            y1={6}
            x2={x(mu)}
            y2={H}
            className="stroke-foreground"
            strokeWidth={1}
            opacity={0.35}
          />
          <text x={x(mu) + 4} y={14} className="fill-foreground text-[10px]" opacity={0.7}>
            μ = {mu.toFixed(1)}
          </text>

          {/* akse */}
          <line x1={0} y1={H} x2={W} y2={H} className="stroke-border" strokeWidth={1} />
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-muted-foreground" />
          Én måling: <Tex>{"\\sigma"}</Tex> ={" "}
          <span className="font-mono font-semibold">{sigma.toFixed(2)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-brand" />
          Gjennomsnittet: <Tex>{"\\sigma/\\sqrt{n}"}</Tex> ={" "}
          <span className="font-mono font-semibold text-brand">{se.toFixed(2)}</span>
        </span>
        <span className="text-muted-foreground">
          De 400 prikkene spenner {spread.toFixed(1)} enheter
        </span>
      </div>

      {/* Kvadratrot-loven — den praktiske konsekvensen */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Kvadratrot-loven
        </div>
        <p className="mt-1 text-sm">
          Standardfeilen krymper med <Tex>{"\\sqrt{n}"}</Tex>, ikke med <Tex>{"n"}</Tex>. For å
          halvere usikkerheten trenger du <strong>fire ganger</strong> så mange målinger — ikke
          dobbelt så mange.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[1, 4, 16, 64, 256].map((k) => (
            <span
              key={k}
              className="rounded border border-border bg-card px-2 py-1 font-mono text-[11px]"
            >
              n={k} → SE = σ/{Math.sqrt(k)}
            </span>
          ))}
        </div>
        {n > 1 && pop.kind !== "normal" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Legg merke til at gjennomsnittet blir tilnærmet normalfordelt selv om populasjonen er{" "}
            {pop.label.toLowerCase()} — det er sentralgrenseteoremet (CLT) i arbeid. Ved{" "}
            <Tex>{"n \\geq 30"}</Tex> holder tilnærmingen for de fleste praktiske formål.
          </p>
        )}
      </div>
    </div>
  );
}
