import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { StandardfeilBygger } from "./StandardfeilBygger";
import { Tex, TexBlock } from "@/components/Tex";

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

  const empMean = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : 0;
  const empStd = useMemo(() => {
    if (samples.length < 2) return 0;
    const m = empMean;
    return Math.sqrt(samples.reduce((a, b) => a + (b - m) * (b - m), 0) / (samples.length - 1));
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
        <div>
          Utvalg n = {nSample}, antall snitt = {samples.length}
        </div>
        <div>
          empirisk E[X̄] ≈ {empMean.toFixed(3)} (skal nærme seg μ etter hvert som du trekker flere)
        </div>
        <div>empirisk SD(X̄) ≈ {empStd.toFixed(3)} (skal nærme seg σ/√n)</div>
        <div className="pt-1 text-brand">
          Merk: jo større n, jo smalere og mer klokke-formet blir høyre histogram — selv om venstre
          er ekstremt skjev/bimodal.
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
            To tall karakteriserer en fordeling: E[X] (lokasjon) og Var[X] (spredning). Det sentrale
            grenseteoremet (CLT) sier at hvis vi tar gjennomsnitt av mange uavhengige observasjoner,
            blir gjennomsnittet tilnærmet normalfordelt — uansett hvordan den underliggende
            fordelingen ser ut. Dette er hjørnesteinen i resten av faget (Modul 4).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              Lek med CLT-simulatoren under. Velg en skjev fordeling, sett n=1 — histogrammene ser
              like ut. Øk n til 30 — høyre histogram blir klokkeformet.
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Forventning <Tex>{"E[X]"}</Tex>
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">
              Definisjon (<Tex>{"= \\mu"}</Tex>, populasjonsgjennomsnitt):
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Diskret:</div>
              <TexBlock>{"E[X] = \\sum_{x} x \\cdot p(x)"}</TexBlock>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Kontinuerlig:</div>
              <TexBlock>{"E[X] = \\int_{-\\infty}^{\\infty} x \\cdot f(x)\\, dx"}</TexBlock>
            </div>

            <div className="font-semibold pt-2">Linearitet (gjelder ALLTID):</div>
            <TexBlock>{"E[aX + b] = a\\, E[X] + b"}</TexBlock>
            <TexBlock>
              {"E[X + Y] = E[X] + E[Y] \\quad \\text{(også når } X, Y \\text{ er avhengige)}"}
            </TexBlock>
            <TexBlock>{"E\\!\\left[\\sum_i a_i X_i\\right] = \\sum_i a_i\\, E[X_i]"}</TexBlock>

            <div className="font-semibold pt-2">Multiplikasjon (krever uavhengighet):</div>
            <TexBlock>
              {"E[XY] = E[X] \\cdot E[Y] \\quad \\text{(kun hvis } X, Y \\text{ uavhengige)}"}
            </TexBlock>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Varians og kovarians</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div className="font-semibold">Definisjon:</div>
            <TexBlock>{"\\mathrm{Var}(X) = E[(X - \\mu)^2] = E[X^2] - \\mu^2"}</TexBlock>

            <div className="font-semibold pt-2">Egenskaper:</div>
            <TexBlock>{"\\mathrm{Var}(aX + b) = a^2\\, \\mathrm{Var}(X)"}</TexBlock>
            <TexBlock>
              {
                "\\mathrm{Var}(X + Y) = \\mathrm{Var}(X) + \\mathrm{Var}(Y) + 2\\,\\mathrm{Cov}(X, Y)"
              }
            </TexBlock>

            <div className="font-semibold pt-2">Standardavvik:</div>
            <TexBlock>
              {"\\sigma = \\sqrt{\\mathrm{Var}(X)} \\quad \\text{(samme enhet som } X\\text{)}"}
            </TexBlock>

            <div className="font-semibold pt-2">Kovarians (mål på samvariasjon):</div>
            <TexBlock>
              {"\\mathrm{Cov}(X, Y) = E[(X - \\mu_X)(Y - \\mu_Y)] = E[XY] - E[X]\\,E[Y]"}
            </TexBlock>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-5">
              <li>
                <Tex>{"\\mathrm{Cov} > 0"}</Tex>: tendens til å variere sammen
              </li>
              <li>
                <Tex>{"\\mathrm{Cov} < 0"}</Tex>: motsatt tendens
              </li>
              <li>
                <Tex>{"\\mathrm{Cov} = 0"}</Tex>: ukorrelerte
              </li>
              <li>
                Hvis <Tex>{"X, Y"}</Tex> er UAVHENGIGE{" "}
                <Tex>{"\\Rightarrow \\mathrm{Cov}(X, Y) = 0"}</Tex> (men ikke omvendt)
              </li>
            </ul>

            <div className="font-semibold pt-2">Korrelasjonskoeffisient:</div>
            <TexBlock>
              {"\\rho = \\frac{\\mathrm{Cov}(X, Y)}{\\sigma_X \\, \\sigma_Y} \\in [-1, 1]"}
            </TexBlock>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Utvalgsgjennomsnitt <Tex>{"\\bar{X}"}</Tex> og standardfeil
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              Hvis <Tex>{"X_1, X_2, \\ldots, X_n"}</Tex> er iid med <Tex>{"E[X_i] = \\mu"}</Tex> og{" "}
              <Tex>{"\\mathrm{Var}(X_i) = \\sigma^2"}</Tex>, og{" "}
              <Tex>{"\\bar{X} = \\frac{1}{n} \\sum_{i=1}^n X_i"}</Tex>:
            </p>
            <TexBlock>{"E[\\bar{X}] = \\mu"}</TexBlock>
            <TexBlock>{"\\mathrm{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}"}</TexBlock>
            <TexBlock>
              {
                "\\mathrm{SD}(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}} \\quad \\text{(standardfeil, SE)}"
              }
            </TexBlock>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li>
                <Tex>{"\\bar{X}"}</Tex> varierer rundt <Tex>{"\\mu"}</Tex>, men mindre når{" "}
                <Tex>{"n"}</Tex> vokser.
              </li>
              <li>
                Å halvere SE krever 4-doble <Tex>{"n"}</Tex>.
              </li>
              <li>
                SE er ikke det samme som <Tex>{"\\sigma"}</Tex> (utvalgets spredning).
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Det sentrale grenseteoremet (CLT)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hjørnestenen i statistisk inferens. Sier:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4 space-y-3 text-sm">
            <p>
              Hvis <Tex>{"X_1, X_2, \\ldots"}</Tex> er iid med <Tex>{"E[X] = \\mu"}</Tex>,{" "}
              <Tex>{"\\mathrm{Var}(X) = \\sigma^2"}</Tex> (begge endelige):
            </p>
            <TexBlock>
              {
                "\\bar{X}_n \\approx \\mathcal{N}\\!\\left(\\mu,\\, \\frac{\\sigma^2}{n}\\right) \\quad \\text{for stor } n"
              }
            </TexBlock>
            <p className="text-muted-foreground">Ekvivalent formulert:</p>
            <TexBlock>
              {
                "\\frac{\\bar{X}_n - \\mu}{\\sigma / \\sqrt{n}} \\xrightarrow{d} \\mathcal{N}(0, 1) \\quad \\text{når } n \\to \\infty"
              }
            </TexBlock>

            <div className="font-semibold pt-2">
              Tommelfingerregel for <Tex>{"n"}</Tex>:
            </div>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li>
                Underliggende <Tex>{"\\approx"}</Tex> normal: <Tex>{"n \\geq 5"}</Tex>
              </li>
              <li>
                Underliggende symmetrisk: <Tex>{"n \\geq 15"}</Tex>
              </li>
              <li>
                Underliggende meget skjev: <Tex>{"n \\geq 30"}</Tex>
              </li>
              <li>
                TEK-1501 default: <Tex>{"n \\geq 30 \\Rightarrow"}</Tex> bruk normaltilnærming
              </li>
            </ul>

            <div className="font-semibold pt-2">Konsekvenser:</div>
            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
              <li>
                Vi kan konstruere KI og hypotesetester med normaltabellen SELV når den underliggende
                fordelingen ikke er normal.
              </li>
              <li>Mange estimatorer er asymptotisk normale.</li>
            </ul>
          </div>
          <CltDemo />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Eksamen-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>SE vs SD.</strong> Standardfeil er <Tex>{"\\sigma / \\sqrt{n}"}</Tex>{" "}
              (usikkerheten i <Tex>{"\\bar{X}"}</Tex>), ikke <Tex>{"\\sigma"}</Tex> (utvalgets
              spredning). Den første minker med <Tex>{"n"}</Tex>, den andre ikke.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>
                CLT gjelder <Tex>{"\\bar{X}"}</Tex>, ikke <Tex>{"X"}</Tex>.
              </strong>{" "}
              Det er gjennomsnittet som blir normalfordelt, ikke de enkelte observasjonene.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>
                <Tex>{"\\mathrm{Var}(X + Y) \\neq \\mathrm{Var}(X) + \\mathrm{Var}(Y)"}</Tex>{" "}
                generelt.
              </strong>{" "}
              Bare når <Tex>{"X"}</Tex> og <Tex>{"Y"}</Tex> er ukorrelerte (
              <Tex>{"\\mathrm{Cov} = 0"}</Tex>). Med kovarians må du regne med{" "}
              <Tex>{"+ 2\\,\\mathrm{Cov}(X, Y)"}</Tex>.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>
                <Tex>{"E[XY] \\neq E[X]\\,E[Y]"}</Tex> generelt.
              </strong>{" "}
              Bare når <Tex>{"X"}</Tex> og <Tex>{"Y"}</Tex> er uavhengige.
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
        <div className="my-8">
          <StandardfeilBygger />
        </div>
        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "tek-1501" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til TEK-1501-hub
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}
