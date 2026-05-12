import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StackPageShell } from "@/components/stack/StackPageShell";

type DistName = "uniform" | "exp" | "skewed" | "bimodal";

function sampleOne(dist: DistName): number {
  if (dist === "uniform") return Math.random() * 10;
  if (dist === "exp") return -Math.log(1 - Math.random()) * 5;
  if (dist === "skewed") {
    // gamma-like (sum of 2 exp)
    return (-Math.log(1 - Math.random()) - Math.log(1 - Math.random())) * 2;
  }
  // bimodal: 50% N(2, 0.5), 50% N(8, 0.5)
  const u = Math.random();
  const mean = u < 0.5 ? 2 : 8;
  // Box-Muller
  const v1 = Math.random();
  const v2 = Math.random();
  return mean + 0.5 * Math.sqrt(-2 * Math.log(v1)) * Math.cos(2 * Math.PI * v2);
}

function CltDemo() {
  const [dist, setDist] = useState<DistName>("skewed");
  const [nSample, setNSample] = useState(30);
  const [samples, setSamples] = useState<number[]>([]);

  function generate(count: number) {
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      let s = 0;
      for (let j = 0; j < nSample; j++) s += sampleOne(dist);
      out.push(s / nSample);
    }
    setSamples((p) => [...p, ...out].slice(-2000));
  }

  function reset() {
    setSamples([]);
  }

  const histogramSnitt = useMemo(() => {
    if (samples.length === 0) return [];
    const lo = Math.min(...samples);
    const hi = Math.max(...samples);
    const bins = 25;
    const step = (hi - lo) / bins || 1;
    const buckets = Array.from({ length: bins }).map((_, i) => ({
      mid: lo + (i + 0.5) * step,
      count: 0,
    }));
    for (const s of samples) {
      const idx = Math.min(Math.floor((s - lo) / step), bins - 1);
      if (idx >= 0 && idx < bins) buckets[idx].count++;
    }
    return buckets;
  }, [samples]);

  const histogramSingle = useMemo(() => {
    // generate 2000 single observations of the distribution for reference
    const obs = [];
    for (let i = 0; i < 2000; i++) obs.push(sampleOne(dist));
    const lo = Math.min(...obs);
    const hi = Math.max(...obs);
    const bins = 25;
    const step = (hi - lo) / bins || 1;
    const buckets = Array.from({ length: bins }).map((_, i) => ({
      mid: lo + (i + 0.5) * step,
      count: 0,
    }));
    for (const v of obs) {
      const idx = Math.min(Math.floor((v - lo) / step), bins - 1);
      if (idx >= 0 && idx < bins) buckets[idx].count++;
    }
    return buckets;
  }, [dist]);

  const empMean =
    samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const empStd = useMemo(() => {
    if (samples.length < 2) return 0;
    const m = empMean;
    return Math.sqrt(
      samples.reduce((a, b) => a + (b - m) * (b - m), 0) /
        (samples.length - 1),
    );
  }, [samples, empMean]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          CLT-simulator
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["uniform", "exp", "skewed", "bimodal"] as DistName[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDist(d);
                setSamples([]);
              }}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (dist === d
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {d === "uniform"
                ? "Uniform"
                : d === "exp"
                  ? "Eksponential"
                  : d === "skewed"
                    ? "Skjev"
                    : "Bimodal"}
            </button>
          ))}
        </div>
      </div>

      <label className="text-sm block">
        <span className="block text-xs text-muted-foreground mb-1">
          n = {nSample} (utvalgsstørrelse per snitt)
        </span>
        <input
          type="range"
          min={1}
          max={100}
          value={nSample}
          onChange={(e) => {
            setNSample(Number(e.target.value));
            setSamples([]);
          }}
          className="w-full"
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => generate(50)}
          className="rounded-lg bg-brand text-brand-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90"
        >
          + 50 snitt
        </button>
        <button
          onClick={() => generate(500)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
        >
          + 500 snitt
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:border-brand/40"
        >
          Nullstill ({samples.length})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Underliggende fordeling (én observasjon)
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={histogramSingle}>
                <XAxis dataKey="mid" tickFormatter={(v: number) => v.toFixed(1)} hide />
                <YAxis hide />
                <Bar dataKey="count" fill="hsl(220 30% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Histogram av X̄ (utvalgsgjennomsnitt)
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={histogramSnitt}>
                <XAxis dataKey="mid" tickFormatter={(v: number) => v.toFixed(2)} hide />
                <YAxis hide />
                <Bar dataKey="count" fill="var(--brand, #4f46e5)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-mono space-y-0.5">
        <div>Utvalg n = {nSample}, antall snitt = {samples.length}</div>
        <div>
          empirisk E[X̄] ≈ {empMean.toFixed(3)} (skal nærme seg μ etter hvert som
          du trekker flere)
        </div>
        <div>
          empirisk SD(X̄) ≈ {empStd.toFixed(3)} (skal nærme seg σ/√n)
        </div>
        <div className="pt-1 text-brand">
          Merk: jo større n, jo smalere og mer klokke-formet blir høyre
          histogram — selv om venstre er ekstremt skjev/bimodal.
        </div>
      </div>
    </div>
  );
}

export function Tek1ForventningCltPage() {
  return (
    <StackPageShell title="Modul 3c — Forventning, varians og CLT" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            TEK-1501 · Modul 3c
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Forventning, varians og det sentrale grenseteoremet
          </h1>
          <p className="mt-3 text-muted-foreground">
            To tall karakteriserer en fordeling: E[X] (lokasjon) og Var[X]
            (spredning). Det sentrale grenseteoremet (CLT) sier at hvis vi tar
            gjennomsnitt av mange uavhengige observasjoner, blir
            gjennomsnittet tilnærmet normalfordelt — uansett hvordan den
            underliggende fordelingen ser ut. Dette er hjørnesteinen i resten
            av faget (Modul 4).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              Lek med CLT-simulatoren under. Velg en skjev fordeling, sett n=1
              — histogrammene ser like ut. Øk n til 30 — høyre histogram blir
              klokkeformet.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Forventning E[X]</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon (=μ, populasjonsgjennomsnitt):

  Diskret:        E[X] = Σ x · p(x)
  Kontinuerlig:   E[X] = ∫ x · f(x) dx

Linearitet (gjelder ALLTID):
  E[aX + b]   = aE[X] + b
  E[X + Y]    = E[X] + E[Y]              ← også når X,Y er avhengige!
  E[Σ aᵢ Xᵢ]  = Σ aᵢ E[Xᵢ]

Multiplikasjon (krever uavhengighet):
  E[XY] = E[X] · E[Y]                    ← kun hvis X,Y uavhengige`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Varians og kovarians</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Definisjon:
  Var(X) = E[(X - μ)²] = E[X²] - μ²       ← praktisk formel

Egenskaper:
  Var(aX + b)  = a² · Var(X)              (translasjon endrer ikke spredning)
  Var(X + Y)   = Var(X) + Var(Y) + 2Cov(X,Y)

Standardavvik:
  σ = √Var(X)                              (samme enhet som X)

Kovarians (mål på samvariasjon):
  Cov(X,Y) = E[(X - μx)(Y - μy)] = E[XY] - E[X]E[Y]

  Cov > 0: X og Y har tendens til å variere sammen
  Cov < 0: motsatt tendens
  Cov = 0: ukorrelerte

  Hvis X,Y er UAVHENGIGE → Cov(X,Y) = 0
  (men Cov = 0 medfører IKKE uavhengighet generelt)

Korrelasjonskoeffisient:
  ρ = Cov(X,Y) / (σx · σy)        ∈ [-1, 1]      (dimensjonsløs)`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Utvalgsgjennomsnitt X̄ og standardfeil
          </h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hvis X₁, X₂, ..., Xₙ er iid med E[Xᵢ] = μ og Var(Xᵢ) = σ²,
og X̄ = (1/n) Σ Xᵢ:

  E[X̄]    = μ                              ← X̄ er forventningsrett for μ
  Var(X̄) = σ² / n                          ← spredningen MINKER med √n
  SD(X̄)  = σ / √n  ← STANDARDFEIL (SE)

Tolkning:
  • X̄ varierer rundt μ, men mindre og mindre når n vokser.
  • Halvere SE krever 4-doble n.
  • SE er ikke det samme som σ (utvalgets spredning).`}</pre>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4. Det sentrale grenseteoremet (CLT)
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hjørnestenen i statistisk inferens. Sier:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Hvis X₁, X₂, ... er iid med E[X] = μ, Var(X) = σ² (begge endelige):

  X̄ₙ ≈ N(μ, σ²/n)            for stor n

Ekvivalent formulert:
  (X̄ₙ - μ) / (σ/√n)  →  N(0, 1)   når n → ∞

Tommelfingerregel for n:
  • Underliggende ≈ normal: n ≥ 5
  • Underliggende symmetrisk: n ≥ 15
  • Underliggende meget skjev: n ≥ 30
  • TEK-1501 default antagelse: n ≥ 30 → bruk normaltilnærming

Konsekvenser:
  • Vi kan konstruere KI og hypotesetester med normaltabellen
    SELV når den underliggende fordelingen ikke er normal.
  • Mange estimatorer er asymptotisk normale.`}</pre>
          </div>
          <CltDemo />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>SE vs SD.</strong> Standardfeil er
              <code className="text-xs">σ/√n</code> (usikkerheten i X̄), ikke
              <code className="text-xs">σ</code> (utvalgets spredning). Den
              første minker med n, den andre ikke.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>CLT gjelder X̄, ikke X.</strong> Det er gjennomsnittet
              som blir normalfordelt, ikke de enkelte observasjonene.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Var(X + Y) ≠ Var(X) + Var(Y) generelt.</strong> Bare når
              X og Y er ukorrelerte (Cov = 0). Med kovarians må du regne med
              + 2Cov(X,Y).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>E[XY] ≠ E[X]E[Y] generelt.</strong> Bare når X og Y er
              uavhengige.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tek1-estimering-ki" }}
                className="text-brand hover:underline"
              >
                Modul 4a — Estimering og KI
              </Link>
              : bruk CLT til å konstruere konfidensintervaller.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
