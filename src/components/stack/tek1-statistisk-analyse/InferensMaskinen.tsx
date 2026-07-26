import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import { normalCdf, normInv, tCdf, tCritTwoSided } from "../tek1-inferens-sampling/statUtils";

/**
 * Inferens-maskinen — den samlende innsikten i hele faget.
 *
 * På eksamen ser prosedyrene ut som en lang liste å pugge: z-test, t-test,
 * andelstest, to-utvalgs-t, parvis t. De er den SAMME maskinen. Bare tre
 * deler byttes ut:
 *
 *    estimat  ·  standardfeil  ·  referansefordeling
 *
 * og så faller både konfidensintervallet og teststatistikken ut av samme
 * to formlene:
 *
 *    KI:   estimat ± kritisk verdi × SE
 *    Test: (estimat − H₀-verdi) / SE
 *
 * Komponenten viser skjelettet fast øverst og lar deg bytte scenario under,
 * slik at det som er felles står stille mens rørverket endrer seg.
 */

type Felt = { key: string; label: string; verdi: number; steg?: number; min?: number };

interface Scenario {
  id: string;
  navn: string;
  sporsmal: string;
  felt: Felt[];
  /** Returnerer alt maskinen trenger for gitt input. */
  regn: (v: Record<string, number>) => {
    estimat: number;
    estimatTex: string;
    /** Standardfeil brukt i konfidensintervallet — estimert fra dataene. */
    se: number;
    seTex: string;
    /** Standardfeil brukt i testen. For andeler regnes den under H₀ (med p₀)
     *  og er derfor en annen enn den i intervallet. Utelatt = samme som `se`. */
    seH0?: number;
    seH0Tex?: string;
    fordeling: "z" | "t";
    df?: number;
    h0Tex: string;
  };
}

const SCENARIOER: Scenario[] = [
  {
    id: "mean-sigma",
    navn: "Ett gjennomsnitt, σ kjent",
    sporsmal: "Er den sanne middelverdien lik μ₀?",
    felt: [
      { key: "xbar", label: "x̄ (utvalgsgjennomsnitt)", verdi: 52 },
      { key: "sigma", label: "σ (kjent populasjons-SD)", verdi: 10, min: 0.1 },
      { key: "n", label: "n", verdi: 25, steg: 1, min: 2 },
      { key: "mu0", label: "μ₀ (nullhypotesens verdi)", verdi: 50 },
    ],
    regn: (v) => ({
      estimat: v.xbar,
      estimatTex: "\\bar{x}",
      se: v.sigma / Math.sqrt(v.n),
      seTex: "\\sigma/\\sqrt{n}",
      fordeling: "z",
      h0Tex: "\\mu_0",
    }),
  },
  {
    id: "mean-s",
    navn: "Ett gjennomsnitt, σ ukjent",
    sporsmal: "Samme spørsmål, men vi må estimere spredningen også.",
    felt: [
      { key: "xbar", label: "x̄ (utvalgsgjennomsnitt)", verdi: 52 },
      { key: "s", label: "s (utvalgs-SD)", verdi: 10, min: 0.1 },
      { key: "n", label: "n", verdi: 25, steg: 1, min: 2 },
      { key: "mu0", label: "μ₀ (nullhypotesens verdi)", verdi: 50 },
    ],
    regn: (v) => ({
      estimat: v.xbar,
      estimatTex: "\\bar{x}",
      se: v.s / Math.sqrt(v.n),
      seTex: "s/\\sqrt{n}",
      fordeling: "t",
      df: v.n - 1,
      h0Tex: "\\mu_0",
    }),
  },
  {
    id: "prop",
    navn: "Én andel",
    sporsmal: "Er den sanne andelen lik p₀?",
    felt: [
      { key: "x", label: "x (antall treff)", verdi: 62, steg: 1, min: 0 },
      { key: "n", label: "n (antall forsøk)", verdi: 100, steg: 1, min: 2 },
      { key: "p0", label: "p₀ (nullhypotesens andel)", verdi: 0.5, steg: 0.01, min: 0 },
    ],
    regn: (v) => {
      const p = v.x / v.n;
      return {
        estimat: p,
        estimatTex: "\\hat{p}",
        // Intervallet bruker p̂ (vi har ingen H₀ å støtte oss på) …
        se: Math.sqrt((p * (1 - p)) / v.n),
        seTex: "\\sqrt{\\hat{p}(1-\\hat{p})/n}",
        // … mens testen regner spredningen under H₀, altså med p₀.
        seH0: Math.sqrt((v.p0 * (1 - v.p0)) / v.n),
        seH0Tex: "\\sqrt{p_0(1-p_0)/n}",
        fordeling: "z",
        h0Tex: "p_0",
      };
    },
  },
  {
    id: "two-mean",
    navn: "To gjennomsnitt (uavhengige)",
    sporsmal: "Er forskjellen mellom to grupper reell?",
    felt: [
      { key: "x1", label: "x̄₁", verdi: 54 },
      { key: "s1", label: "s₁", verdi: 9, min: 0.1 },
      { key: "n1", label: "n₁", verdi: 20, steg: 1, min: 2 },
      { key: "x2", label: "x̄₂", verdi: 49 },
      { key: "s2", label: "s₂", verdi: 11, min: 0.1 },
      { key: "n2", label: "n₂", verdi: 22, steg: 1, min: 2 },
    ],
    regn: (v) => ({
      estimat: v.x1 - v.x2,
      estimatTex: "\\bar{x}_1 - \\bar{x}_2",
      se: Math.sqrt((v.s1 * v.s1) / v.n1 + (v.s2 * v.s2) / v.n2),
      seTex: "\\sqrt{s_1^2/n_1 + s_2^2/n_2}",
      fordeling: "t",
      df: Math.min(v.n1, v.n2) - 1,
      h0Tex: "0",
    }),
  },
  {
    id: "paired",
    navn: "Parvis (før/etter)",
    sporsmal: "Endret det seg innen hver enhet?",
    felt: [
      { key: "dbar", label: "d̄ (gjennomsnittlig differanse)", verdi: 3.2 },
      { key: "sd", label: "s_d (SD av differansene)", verdi: 7, min: 0.1 },
      { key: "n", label: "n (antall par)", verdi: 18, steg: 1, min: 2 },
    ],
    regn: (v) => ({
      estimat: v.dbar,
      estimatTex: "\\bar{d}",
      se: v.sd / Math.sqrt(v.n),
      seTex: "s_d/\\sqrt{n}",
      fordeling: "t",
      df: v.n - 1,
      h0Tex: "0",
    }),
  },
];

const NIVAAER = [0.9, 0.95, 0.99];

export function InferensMaskinen() {
  const [scIdx, setScIdx] = useState(1);
  const [niva, setNiva] = useState(0.95);
  const sc = SCENARIOER[scIdx];

  const [verdier, setVerdier] = useState<Record<string, number>>(() =>
    Object.fromEntries(sc.felt.map((f) => [f.key, f.verdi])),
  );

  function byttScenario(i: number) {
    setScIdx(i);
    setVerdier(Object.fromEntries(SCENARIOER[i].felt.map((f) => [f.key, f.verdi])));
  }

  const r = useMemo(() => sc.regn(verdier), [sc, verdier]);
  const alpha = 1 - niva;

  // Kritisk verdi: samme rolle uansett fordeling — hvor mange standardfeil
  // vi må gå ut for å fange `niva` av massen.
  const krit =
    r.fordeling === "z" ? normInv(1 - alpha / 2) : tCritTwoSided(alpha, Math.max(1, r.df ?? 1));

  const h0verdi =
    sc.id === "mean-sigma" || sc.id === "mean-s" ? verdier.mu0 : sc.id === "prop" ? verdier.p0 : 0;

  const seTest = r.seH0 ?? r.se;
  const teststat = seTest > 0 ? (r.estimat - h0verdi) / seTest : 0;
  const pverdi =
    r.fordeling === "z"
      ? 2 * (1 - normalCdf(Math.abs(teststat)))
      : 2 * (1 - tCdf(Math.abs(teststat), Math.max(1, r.df ?? 1)));

  const lo = r.estimat - krit * r.se;
  const hi = r.estimat + krit * r.se;
  const forkast = pverdi < alpha;
  const desimaler = sc.id === "prop" ? 4 : 3;

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Inferens-maskinen — én maskin, fem ansikter</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Prosedyrene under ser ut som fem ting å pugge. De er den samme maskinen. Bytt scenario og
          se hva som faktisk endrer seg: bare <strong>estimatet</strong>,{" "}
          <strong>standardfeilen</strong> og <strong>referansefordelingen</strong>. Skjelettet står
          stille.
        </p>
      </div>

      {/* Skjelettet — det som ALDRI endrer seg */}
      <div className="rounded-lg border-2 border-brand/40 bg-brand/5 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          Skjelettet — likt for alle fem
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded border border-border bg-background/60 px-3 py-2 text-center text-sm">
            <Tex>{"\\text{KI} = \\text{estimat} \\pm k \\cdot \\text{SE}"}</Tex>
          </div>
          <div className="rounded border border-border bg-background/60 px-3 py-2 text-center text-sm">
            <Tex>{"\\text{teststatistikk} = \\dfrac{\\text{estimat} - H_0}{\\text{SE}}"}</Tex>
          </div>
        </div>
      </div>

      {/* Scenario-velger */}
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOER.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => byttScenario(i)}
            className={`rounded border px-2.5 py-1 text-xs font-medium transition ${
              i === scIdx
                ? "border-brand bg-brand text-white"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {s.navn}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{sc.sporsmal}</p>

      {/* Input */}
      <div className="grid gap-2 sm:grid-cols-3">
        {sc.felt.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-0.5 block text-[11px] text-muted-foreground">{f.label}</span>
            <input
              type="number"
              step={f.steg ?? 0.1}
              min={f.min}
              value={verdier[f.key]}
              onChange={(e) => setVerdier((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
              className="h-8 w-full rounded border border-border bg-background px-2 font-mono text-sm focus:border-brand focus:outline-none"
            />
          </label>
        ))}
      </div>

      {/* Rørverket — de tre delene som byttes */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Slot tittel="Estimat" tex={r.estimatTex} verdi={r.estimat.toFixed(desimaler)} />
        <Slot
          tittel={r.seH0 ? "SE — intervall" : "Standardfeil (SE)"}
          tex={r.seTex}
          verdi={r.se.toFixed(desimaler)}
        />
        <Slot
          tittel="Referansefordeling"
          tex={r.fordeling === "z" ? "z" : `t_{${r.df}}`}
          verdi={`k = ${krit.toFixed(3)}`}
        />
      </div>

      {/* Nivå */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Konfidensnivå:</span>
        {NIVAAER.map((nv) => (
          <button
            key={nv}
            type="button"
            onClick={() => setNiva(nv)}
            className={`rounded border px-2 py-0.5 text-xs transition ${
              nv === niva
                ? "border-brand bg-brand text-white"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {Math.round(nv * 100)} %
          </button>
        ))}
      </div>

      {/* Ut av maskinen */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Konfidensintervall
          </div>
          <div className="mt-1 font-mono text-lg font-bold tabular-nums">
            [{lo.toFixed(desimaler)}, {hi.toFixed(desimaler)}]
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {r.estimat.toFixed(desimaler)} ± {krit.toFixed(3)} × {r.se.toFixed(desimaler)}
          </div>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            forkast ? "border-success/50 bg-success/10" : "border-border bg-muted/30"
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hypotesetest
          </div>
          <div className="mt-1 font-mono text-lg font-bold tabular-nums">
            {r.fordeling === "z" ? "z" : "t"} = {teststat.toFixed(3)}
          </div>
          {r.seH0 != null && (
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              bruker SE under H₀ = {seTest.toFixed(desimaler)}
            </div>
          )}
          <div className="mt-1 text-xs">
            p ={" "}
            <span className="font-mono">{pverdi < 0.0001 ? "< 0.0001" : pverdi.toFixed(4)}</span> —{" "}
            {forkast ? (
              <span className="font-semibold text-success">
                forkast H₀ på {Math.round(niva * 100)} %-nivå
              </span>
            ) : (
              <span className="text-muted-foreground">behold H₀</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Legg merke til sammenhengen:</strong> intervallet og
          testen er to sider av samme sak. Ligger nullhypotesens verdi ({h0verdi}) utenfor
          konfidensintervallet, forkaster testen H₀ — og omvendt. Endre tallene og se at de to
          boksene skifter sammen.
        </p>
        {r.seH0 != null && (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
            <strong>Fella på eksamen:</strong> for andeler bruker de to ikke samme standardfeil.
            Intervallet har ingen H₀ å støtte seg på og må bruke <Tex>{"\\hat{p}"}</Tex> (
            {r.se.toFixed(4)}), mens testen antar at H₀ er sann og regner spredningen med{" "}
            <Tex>{"p_0"}</Tex> ({seTest.toFixed(4)}). Derfor kan test og intervall i sjeldne
            grensetilfeller gi ulik konklusjon — for gjennomsnitt skjer ikke det, siden begge bruker{" "}
            <Tex>{"s/\\sqrt{n}"}</Tex>.
          </p>
        )}
      </div>
    </div>
  );
}

function Slot({ tittel, tex, verdi }: { tittel: string; tex: string; verdi: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {tittel}
      </div>
      <div className="mt-1 text-sm">
        <Tex>{tex}</Tex>
      </div>
      <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-brand">{verdi}</div>
    </div>
  );
}
