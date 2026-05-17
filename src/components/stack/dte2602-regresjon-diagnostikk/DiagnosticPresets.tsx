import { useMemo, useState } from "react";
import { DraggableScatterFit } from "./DraggableScatterFit";
import { type Pt, pearson, vifTwo } from "./regUtils";

/**
 * DiagnosticPresets — 5 forhåndsdefinerte "uhellsbilder".
 *
 * Hver preset genererer datapunkter med et spesifikt brudd på OLS-antakelsene
 * og forklarer hva diagnose-plottene vil avsløre. Brukeren klikker presetet,
 * ser scatteret + 3 plot oppdateres, og leser forklaringen.
 *
 * Multikollinaritets-presetet er spesielt: den viser TO prediktorer
 * (x1, x2) som korrelerer, regner ut VIF, og lar brukeren skyve "korr-slideren"
 * for å se VIF blåse opp.
 */

type PresetId =
  | "pent"
  | "hetero"
  | "ikkeLinear"
  | "outlier"
  | "influential"
  | "multikollin";

type Preset = {
  id: PresetId;
  label: string;
  short: string;
  forklaring: string;
  what: string;
  fix: string;
  generate: () => Pt[];
};

// Deterministisk pseudo-RNG slik at plottet ikke jittrer på re-render
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function randn(r: () => number): number {
  const u1 = Math.max(r(), 1e-9);
  const u2 = r();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const N = 14;

const PRESETS: Preset[] = [
  {
    id: "pent",
    label: "Pent (alt OK)",
    short: "Antakelsene holder",
    forklaring:
      "Tilfeldig sky rundt en rett linje. Residual-plottet er et tilfeldig mønster rundt 0; Q-Q-plottet ligger på diagonalen.",
    what: "Ingenting — modellen er passende.",
    fix: "Rapporter R², β̂, og standardfeil.",
    generate: () => {
      const r = lcg(7);
      const out: Pt[] = [];
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * 10 + 1;
        const y = 1 + 0.9 * x + 0.7 * randn(r);
        out.push({ x, y });
      }
      return out;
    },
  },
  {
    id: "hetero",
    label: "Heteroskedastisitet",
    short: "Vifte-form i residualene",
    forklaring:
      "Variansen til y vokser med x. Residual-plottet får tydelig trakt-form (smal til venstre, vid til høyre). Q-Q kan se OK ut.",
    what:
      "β̂ er fortsatt forventningsrett, men standardfeil og p-verdier er undervurdert ⇒ falsk signifikans.",
    fix:
      "Vektet least-squares (WLS), eller transformer y (log/sqrt). Alternativt robust standardfeil (HC).",
    generate: () => {
      const r = lcg(23);
      const out: Pt[] = [];
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * 10 + 1;
        const y = 1 + 0.8 * x + (0.3 + x * 0.2) * randn(r);
        out.push({ x, y });
      }
      return out;
    },
  },
  {
    id: "ikkeLinear",
    label: "Ikke-linearitet",
    short: "U/∩-mønster i residualene",
    forklaring:
      "Den sanne sammenhengen er kvadratisk. OLS-linja undertegner i endene og overskyter i midten — residual-plottet får et klart U/∩-mønster.",
    what:
      "Modellen er mis-spesifisert. Predikasjoner på ekstreme x blir systematisk feil.",
    fix:
      "Legg til x² (polynom), splines, eller bytt modell. Sjekk residual-plottet igjen etter utvidelsen.",
    generate: () => {
      const r = lcg(13);
      const out: Pt[] = [];
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * 10 + 1;
        const y = 1 + 0.3 * x + 0.22 * (x - 5.5) ** 2 + 0.5 * randn(r);
        out.push({ x, y });
      }
      return out;
    },
  },
  {
    id: "outlier",
    label: "Outlier",
    short: "Ett punkt langt ute",
    forklaring:
      "Ren lineær sammenheng pluss ett vertikalt avvik. Punktet ligger NÆR x̄ — det har lav leverage, men stor residual.",
    what:
      "Slope (β₁) endres bare litt fordi outlieren er midt i x-rommet. R² synker; MSE øker.",
    fix:
      "Undersøk om punktet er datafeil. Hvis ekte: rapporter robust regresjon (Huber) i tillegg til OLS.",
    generate: () => {
      const r = lcg(31);
      const out: Pt[] = [];
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * 10 + 1;
        let y = 1 + 0.9 * x + 0.5 * randn(r);
        if (i === Math.floor(N / 2)) y += 8;
        out.push({ x, y });
      }
      return out;
    },
  },
  {
    id: "influential",
    label: "Influential point",
    short: "Høy leverage + høy residual",
    forklaring:
      "Ett punkt sitter langt ute i x-retning OG langt vekk fra linja. Cook's D detonerer.",
    what:
      "Hele regresjonen dreies av dette ene punktet. Slope endres dramatisk; R² blir villedende.",
    fix:
      "Cook's D > 4/n flagger punktet. Vurder fjerning eller robust regresjon. Alltid: undersøk hvorfor punktet er der.",
    generate: () => {
      const r = lcg(41);
      const out: Pt[] = [];
      for (let i = 0; i < N - 1; i++) {
        const x = (i / (N - 2)) * 6 + 1;
        const y = 1 + 0.7 * x + 0.4 * randn(r);
        out.push({ x, y });
      }
      // Influential point langt ute i x og langt fra linja
      out.push({ x: 11.5, y: 1.0 });
      return out;
    },
  },
  {
    id: "multikollin",
    label: "Multikollinaritet",
    short: "x1 ≈ x2 ⇒ VIF eksploderer",
    forklaring:
      "Med to prediktorer x1 og x2 som nesten korrelerer perfekt, kan ikke OLS skille bidragene deres. Skyv slider opp for å øke r(x1, x2).",
    what:
      "Estimat-variansen blir gigantisk. Standardfeil blåser opp; signifikans-tester gir ikke mening.",
    fix:
      "Fjern en av prediktorene, slå dem sammen, eller bruk ridge/PCA. Sjekk VIF — over 5 (eller 10) er rødt.",
    generate: () => [], // håndteres spesielt nedenfor
  },
];

export function DiagnosticPresets() {
  const [active, setActive] = useState<PresetId>("pent");
  const preset = PRESETS.find((p) => p.id === active)!;

  // Multikollinaritet: 2 prediktorer + slider
  const [corr, setCorr] = useState(0.6);
  const multikollinData = useMemo(() => {
    const r = lcg(101);
    const x1: number[] = [];
    const x2: number[] = [];
    for (let i = 0; i < 18; i++) {
      const z = (i / 17) * 10;
      x1.push(z + 0.5 * randn(r));
      // x2 = corr * x1 + sqrt(1-corr²) * noise
      const noise = randn(r);
      x2.push(corr * x1[i] + Math.sqrt(Math.max(1 - corr * corr, 0)) * 2 * noise + 0.05 * z);
    }
    return { x1, x2, r: pearson(x1, x2), vif: vifTwo(x1, x2) };
  }, [corr]);

  const points = useMemo(
    () => (active === "multikollin" ? [] : preset.generate()),
    [active, preset],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p.id)}
            className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              active === p.id
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
        <div className="font-semibold">{preset.label} — {preset.short}</div>
        <div className="text-muted-foreground">{preset.forklaring}</div>
        <div>
          <span className="font-semibold text-foreground">Hva blir feil:</span>{" "}
          <span className="text-muted-foreground">{preset.what}</span>
        </div>
        <div>
          <span className="font-semibold text-foreground">Fiks:</span>{" "}
          <span className="text-muted-foreground">{preset.fix}</span>
        </div>
      </div>

      {active === "multikollin" ? (
        <MultikollinearitetPanel
          corr={corr}
          setCorr={setCorr}
          data={multikollinData}
        />
      ) : (
        <DraggableScatterFit
          initialPoints={points}
          resetKey={preset.id}
          xRange={[0, 13]}
          yRange={[-1, 16]}
          caption={`Preset: ${preset.label}`}
        />
      )}
    </div>
  );
}

function MultikollinearitetPanel({
  corr,
  setCorr,
  data,
}: {
  corr: number;
  setCorr: (v: number) => void;
  data: { x1: number[]; x2: number[]; r: number; vif: number };
}) {
  const W = 360;
  const H = 240;
  const PAD = 32;
  const all = [...data.x1, ...data.x2];
  const min = Math.min(...all) - 0.5;
  const max = Math.max(...all) + 0.5;
  const span = max - min;
  const sx = (v: number) => PAD + ((v - min) / span) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - min) / span) * (H - 2 * PAD);

  const vifBadge =
    data.vif > 10
      ? "bg-red-500/20 text-red-500"
      : data.vif > 5
        ? "bg-amber-500/20 text-amber-500"
        : "bg-emerald-500/20 text-emerald-500";

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="text-sm font-semibold">Scatter av x₁ mot x₂</div>
      <div className="grid md:grid-cols-[1fr_220px] gap-4 items-start">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-background rounded">
          {/* y=x referanse */}
          <line
            x1={sx(min)}
            y1={sy(min)}
            x2={sx(max)}
            y2={sy(max)}
            stroke="#f59e0b"
            strokeDasharray="3 3"
          />
          {data.x1.map((v, i) => (
            <circle key={i} cx={sx(v)} cy={sy(data.x2[i])} r={4} fill="#3b82f6" />
          ))}
          <text
            x={W / 2}
            y={H - 4}
            fontSize={10}
            className="fill-muted-foreground"
            textAnchor="middle"
          >
            x₁
          </text>
          <text x={6} y={14} fontSize={10} className="fill-muted-foreground">
            x₂
          </text>
        </svg>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Mål-korrelasjon r(x₁, x₂): <span className="font-mono">{corr.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={0.99}
              step={0.01}
              value={corr}
              onChange={(e) => setCorr(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="rounded-lg border border-border bg-background p-2 text-xs">
            <div className="text-muted-foreground">Faktisk r</div>
            <div className="font-mono text-sm">{data.r.toFixed(3)}</div>
          </div>
          <div className={`rounded-lg p-2 text-xs ${vifBadge}`}>
            <div>VIF = 1 / (1 − r²)</div>
            <div className="font-mono text-base mt-1">
              {data.vif > 1000 ? "∞" : data.vif.toFixed(2)}
            </div>
            <div className="text-[10px] opacity-80 mt-1">
              {data.vif > 10
                ? "Alvorlig multikollinaritet"
                : data.vif > 5
                  ? "Moderat — vurder grep"
                  : "OK"}
            </div>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground">
        Jo mer x₁ og x₂ overlapper, jo mindre unik informasjon hver bidrar med, og jo
        mer ustabilt blir β̂. VIF over 5–10 er et standard varselsignal.
      </div>
    </div>
  );
}
