import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";

// M/M/1-inspired queuing delay (approximation used in Kurose Ch 1 / 2).
// Returns delay in seconds. Clamped when ρ ≈ 1 so UI doesn't show Infinity.
function queuingDelay(rho: number, serviceTimeMs: number): number {
  // service time per request (sec) = objektstørrelse / R
  const s = serviceTimeMs / 1000;
  if (rho >= 0.999) return 30; // clamp — "uendelig"
  return (rho * s) / (1 - rho);
}

export function CacheCalculator() {
  // Defaults match bokens eksempel
  const [hitRate, setHitRate] = useState(40); // %
  const [reqRate, setReqRate] = useState(15); // req/s
  const [accessRate, setAccessRate] = useState(15); // Mbps
  const objectSize = 1; // Mbit (fast)
  const lanRate = 100; // Mbps (fast)
  const internetDelay = 2; // sek
  const lanDelay = 0.01; // sek

  const result = useMemo(() => {
    const h = hitRate / 100;
    const aIn = reqRate * objectSize; // Mbps total
    const aMiss = (1 - h) * aIn;

    const rhoLan = aIn / lanRate;
    const rhoAccess = aMiss / accessRate;

    // Service time per request: hvor lang tid å pushe 1 Mbit gjennom lenken
    const serviceMs = (objectSize * 1000) / accessRate; // ms

    const queue = queuingDelay(rhoAccess, serviceMs);
    const dFull = lanDelay + queue + internetDelay;
    const dAvg = h * lanDelay + (1 - h) * dFull;

    return { h, aIn, aMiss, rhoLan, rhoAccess, queue, dFull, dAvg };
  }, [hitRate, reqRate, accessRate]);

  const rhoColor =
    result.rhoAccess >= 0.9
      ? "text-rose-600 dark:text-rose-400"
      : result.rhoAccess >= 0.7
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <SliderRow
          label="Cache hit-rate h"
          value={hitRate}
          min={0}
          max={95}
          step={5}
          unit="%"
          onChange={setHitRate}
        />
        <SliderRow
          label="Forespørselsrate"
          value={reqRate}
          min={1}
          max={40}
          step={1}
          unit="req/s"
          onChange={setReqRate}
        />
        <SliderRow
          label="Access-link rate"
          value={accessRate}
          min={5}
          max={100}
          step={1}
          unit="Mbps"
          onChange={setAccessRate}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <ResultRow
          label="Trafikkintensitet på LAN (ρ_LAN)"
          value={result.rhoLan.toFixed(2)}
          hint="LAN er 100 Mbps — sjelden flaskehals"
        />
        <ResultRow
          label="Trafikkintensitet på access (ρ_access)"
          value={result.rhoAccess.toFixed(2)}
          hint={
            result.rhoAccess >= 0.999
              ? "ρ ≥ 1 — kø vokser ubegrenset"
              : "Hold denne godt under 1"
          }
          valueClass={rhoColor}
        />
        <ResultRow
          label="Access-rate etter cache"
          value={`${result.aMiss.toFixed(1)} Mbps`}
          hint={`(1 - h) × ${result.aIn.toFixed(1)} = ${result.aMiss.toFixed(1)}`}
        />
        <ResultRow
          label="Kø-forsinkelse på access"
          value={
            result.rhoAccess >= 0.999
              ? "→ ∞"
              : `${(result.queue * 1000).toFixed(0)} ms`
          }
          hint="M/M/1-tilnærming"
        />
        <ResultRow
          label="Full miss-tur (LAN + kø + Internett)"
          value={`${result.dFull.toFixed(2)} s`}
          hint="LAN 10 ms + kø + 2 s Internett"
        />
        <ResultRow
          label="Snitt-responstid (vektet over h)"
          value={`${result.dAvg.toFixed(2)} s`}
          hint={`h·d_LAN + (1-h)·d_full`}
          valueClass="text-brand font-bold"
        />
      </div>

      <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed">
        <strong className="text-amber-700 dark:text-amber-400">Prøv:</strong> Sett
        hit-rate til 0 % og se hva som skjer ved 15 req/s og 15 Mbps access (bokens
        scenario). Skru så hit-rate opp til 40 % — snitt-responstid faller fra ~30 s
        clamp til ~1.2 s.
      </div>
    </div>
  );
}

function SliderRow(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const { label, value, min, max, step, unit, onChange } = props;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="font-mono text-sm font-semibold">
          {value} {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? min)}
      />
    </div>
  );
}

function ResultRow(props: {
  label: string;
  value: string;
  hint: string;
  valueClass?: string;
}) {
  const { label, value, hint, valueClass } = props;
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg ${valueClass ?? ""}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground/70 mt-0.5">{hint}</div>
    </div>
  );
}
