import { useMemo, useState } from "react";

// =======================================================================
// FairnessMetricsCalc.tsx
// -----------------------------------------------------------------------
// Klassifikatoren scorer 200 søkere — 100 fra gruppe A, 100 fra gruppe B.
// Hver gruppe har en base-rate (andel som FAKTISK er kvalifisert) og en
// score-fordeling pr. (kvalifisert, ikke-kvalifisert). En global terskel
// gir konfusjonsmatrise pr. gruppe, og vi regner fairness-metrikkene live.
//
// Implissibility-demoen: hvis base-rate er ulik mellom gruppene, kan vi
// IKKE oppnå både kalibrering OG equalized odds samtidig (Kleinberg,
// Mullainathan & Raghavan 2017 / Chouldechova 2017).
// =======================================================================

type Scenario = "compas" | "lik-base" | "stor-skjevhet";

type GroupStats = {
  // konfusjonsmatrise per gruppe
  tp: number;
  fp: number;
  fn: number;
  tn: number;
};

const SCENARIOS: Record<
  Scenario,
  {
    label: string;
    desc: string;
    // base-rate (andel POSITIVE / kvalifiserte) per gruppe
    baseA: number;
    baseB: number;
    // score-snitt for (pos, neg) per gruppe — 0..1
    muPosA: number;
    muNegA: number;
    muPosB: number;
    muNegB: number;
    sigma: number;
  }
> = {
  compas: {
    label: "COMPAS-lignende",
    desc:
      "Ulik base-rate mellom grupper (A: 30%, B: 50%). Score-fordelingen er kalibrert separat. Klassisk impossibility-trigger.",
    baseA: 0.3,
    baseB: 0.5,
    muPosA: 0.68,
    muNegA: 0.35,
    muPosB: 0.68,
    muNegB: 0.35,
    sigma: 0.16,
  },
  "lik-base": {
    label: "Lik base-rate",
    desc:
      "Begge grupper har samme base-rate (40%). Da kan kalibrering og equalized odds eksistere samtidig.",
    baseA: 0.4,
    baseB: 0.4,
    muPosA: 0.7,
    muNegA: 0.35,
    muPosB: 0.65,
    muNegB: 0.4,
    sigma: 0.16,
  },
  "stor-skjevhet": {
    label: "Skjev klassifikator",
    desc:
      "Klassifikatoren er dårligere på gruppe B (mer overlapp). Selv ved samme base-rate gir den ulik TPR/FPR.",
    baseA: 0.4,
    baseB: 0.4,
    muPosA: 0.72,
    muNegA: 0.3,
    muPosB: 0.6,
    muNegB: 0.42,
    sigma: 0.2,
  },
};

// Deterministisk syntetisk populasjon: faste pseudo-random samples per gruppe.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function boxMuller(r: () => number): number {
  const u1 = Math.max(r(), 1e-9);
  const u2 = r();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function buildPopulation(scen: Scenario, N = 200): {
  groupA: { score: number; truth: 0 | 1 }[];
  groupB: { score: number; truth: 0 | 1 }[];
} {
  const s = SCENARIOS[scen];
  const half = N / 2;
  const rA = rng(7);
  const rB = rng(13);
  const groupA: { score: number; truth: 0 | 1 }[] = [];
  const groupB: { score: number; truth: 0 | 1 }[] = [];
  for (let i = 0; i < half; i++) {
    const isPos = i < Math.round(s.baseA * half) ? 1 : 0;
    const mu = isPos ? s.muPosA : s.muNegA;
    const score = Math.min(1, Math.max(0, mu + s.sigma * boxMuller(rA)));
    groupA.push({ score, truth: isPos as 0 | 1 });
  }
  for (let i = 0; i < half; i++) {
    const isPos = i < Math.round(s.baseB * half) ? 1 : 0;
    const mu = isPos ? s.muPosB : s.muNegB;
    const score = Math.min(1, Math.max(0, mu + s.sigma * boxMuller(rB)));
    groupB.push({ score, truth: isPos as 0 | 1 });
  }
  return { groupA, groupB };
}

function confusion(
  pop: { score: number; truth: 0 | 1 }[],
  th: number,
): GroupStats {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const p of pop) {
    const pred = p.score >= th ? 1 : 0;
    if (pred === 1 && p.truth === 1) tp++;
    else if (pred === 1 && p.truth === 0) fp++;
    else if (pred === 0 && p.truth === 1) fn++;
    else tn++;
  }
  return { tp, fp, fn, tn };
}

function safeDiv(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

export function FairnessMetricsCalc() {
  const [scen, setScen] = useState<Scenario>("compas");
  const [thA, setThA] = useState(0.5);
  const [thB, setThB] = useState(0.5);
  const [linked, setLinked] = useState(true);

  const pop = useMemo(() => buildPopulation(scen), [scen]);
  const cA = useMemo(() => confusion(pop.groupA, thA), [pop, thA]);
  const cB = useMemo(
    () => confusion(pop.groupB, linked ? thA : thB),
    [pop, thA, thB, linked],
  );

  function setBoth(v: number) {
    setThA(v);
    if (linked) setThB(v);
  }

  // Metrikker
  const tprA = safeDiv(cA.tp, cA.tp + cA.fn);
  const fprA = safeDiv(cA.fp, cA.fp + cA.tn);
  const ppvA = safeDiv(cA.tp, cA.tp + cA.fp);
  const selA = safeDiv(cA.tp + cA.fp, cA.tp + cA.fp + cA.fn + cA.tn);
  const baseA = safeDiv(cA.tp + cA.fn, cA.tp + cA.fp + cA.fn + cA.tn);

  const tprB = safeDiv(cB.tp, cB.tp + cB.fn);
  const fprB = safeDiv(cB.fp, cB.fp + cB.tn);
  const ppvB = safeDiv(cB.tp, cB.tp + cB.fp);
  const selB = safeDiv(cB.tp + cB.fp, cB.tp + cB.fp + cB.fn + cB.tn);
  const baseB = safeDiv(cB.tp + cB.fn, cB.tp + cB.fp + cB.fn + cB.tn);

  // Fairness-definisjoner
  const dp = Math.abs(selA - selB); // demographic parity gap
  const eo = Math.abs(tprA - tprB); // equal opportunity gap
  const eqOddsGap = Math.max(Math.abs(tprA - tprB), Math.abs(fprA - fprB));
  const calibGap = Math.abs(ppvA - ppvB);

  function flag(v: number) {
    if (v < 0.02) return "text-success";
    if (v < 0.08) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
  }
  function badge(v: number) {
    if (v < 0.02) return "OK";
    if (v < 0.08) return "moderat";
    return "brudd";
  }

  // ScoreVis: liten score-histogram
  function ScoreBar({
    pop: pp,
    th,
    color,
  }: {
    pop: { score: number; truth: 0 | 1 }[];
    th: number;
    color: string;
  }) {
    const W = 320;
    const H = 56;
    const bins = 20;
    const pos = Array.from({ length: bins }, () => 0);
    const neg = Array.from({ length: bins }, () => 0);
    for (const p of pp) {
      const b = Math.min(bins - 1, Math.floor(p.score * bins));
      if (p.truth === 1) pos[b]++;
      else neg[b]++;
    }
    const maxV = Math.max(...pos, ...neg, 1);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
        {Array.from({ length: bins }, (_, i) => {
          const x = (i / bins) * W;
          const w = W / bins - 1;
          const hN = (neg[i] / maxV) * (H - 8);
          const hP = (pos[i] / maxV) * (H - 8);
          return (
            <g key={i}>
              <rect
                x={x}
                y={H - hN - 4}
                width={w / 2}
                height={hN}
                fill="#94a3b8"
              />
              <rect
                x={x + w / 2}
                y={H - hP - 4}
                width={w / 2}
                height={hP}
                fill={color}
              />
            </g>
          );
        })}
        <line
          x1={th * W}
          y1={0}
          x2={th * W}
          y2={H}
          stroke="#dc2626"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      </svg>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {(Object.keys(SCENARIOS) as Scenario[]).map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => setScen(k)}
            className={`text-xs rounded-md px-3 py-1.5 border ${
              scen === k
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {SCENARIOS[k].label}
          </button>
        ))}
        <label className="ml-auto text-xs inline-flex items-center gap-1.5 text-muted-foreground">
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
          />
          Felles terskel for A og B
        </label>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{SCENARIOS[scen].desc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-semibold text-[#3b82f6]">Gruppe A</div>
            <div className="text-[10px] text-muted-foreground">
              base-rate {(baseA * 100).toFixed(0)}%
            </div>
          </div>
          <ScoreBar pop={pop.groupA} th={thA} color="#3b82f6" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={thA}
            onChange={(e) => setBoth(Number(e.target.value))}
            className="w-full mt-2 accent-[#3b82f6]"
          />
          <div className="text-[11px] text-muted-foreground">
            terskel: <span className="font-mono">{thA.toFixed(2)}</span>
          </div>
          <Conf c={cA} />
        </div>

        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-semibold text-[#f59e0b]">Gruppe B</div>
            <div className="text-[10px] text-muted-foreground">
              base-rate {(baseB * 100).toFixed(0)}%
            </div>
          </div>
          <ScoreBar pop={pop.groupB} th={linked ? thA : thB} color="#f59e0b" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={linked ? thA : thB}
            disabled={linked}
            onChange={(e) => setThB(Number(e.target.value))}
            className="w-full mt-2 accent-[#f59e0b] disabled:opacity-50"
          />
          <div className="text-[11px] text-muted-foreground">
            terskel:{" "}
            <span className="font-mono">{(linked ? thA : thB).toFixed(2)}</span>
          </div>
          <Conf c={cB} />
        </div>
      </div>

      {/* metrikk-grid */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        <Metric
          name="Demographic parity"
          formel="P(Ŷ=1|A) = P(Ŷ=1|B)"
          a={selA}
          b={selB}
          gap={dp}
          flag={flag(dp)}
          badge={badge(dp)}
        />
        <Metric
          name="Equal opportunity"
          formel="TPR_A = TPR_B"
          a={tprA}
          b={tprB}
          gap={eo}
          flag={flag(eo)}
          badge={badge(eo)}
        />
        <Metric
          name="Equalized odds"
          formel="TPR & FPR likt"
          a={fprA}
          b={fprB}
          gap={eqOddsGap}
          flag={flag(eqOddsGap)}
          badge={badge(eqOddsGap)}
          subA={`TPR ${tprA.toFixed(2)} / FPR ${fprA.toFixed(2)}`}
          subB={`TPR ${tprB.toFixed(2)} / FPR ${fprB.toFixed(2)}`}
        />
        <Metric
          name="Kalibrering (PPV)"
          formel="P(Y=1|Ŷ=1,A) = P(Y=1|Ŷ=1,B)"
          a={ppvA}
          b={ppvB}
          gap={calibGap}
          flag={flag(calibGap)}
          badge={badge(calibGap)}
        />
      </div>

      {/* Impossibility-boks */}
      <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs">
        <div className="text-destructive font-semibold mb-1">
          Impossibility theorem (Kleinberg / Chouldechova 2017)
        </div>
        <p className="text-foreground/90 leading-snug">
          Når base-rate er ULIK mellom grupper, kan en klassifikator{" "}
          <strong>ikke samtidig</strong> oppnå kalibrering OG equalized odds.
          Bytt til scenario «COMPAS-lignende» og prøv: uansett hvor du flytter
          terskelen, blir minst én av disse to brutt. Bytt så til «Lik
          base-rate» — der kan begge holdes.
        </p>
        <p className="mt-2 text-muted-foreground">
          Praktisk konsekvens: «hvilken fairness-definisjon vil vi ha?» er
          et <em>verdivalg</em>, ikke et teknisk valg. ProPublica og Northpointe
          var begge "riktige" om COMPAS — de målte ulike ting.
        </p>
      </div>
    </div>
  );
}

function Conf({ c }: { c: GroupStats }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-mono">
      <div className="rounded bg-success/10 text-success px-2 py-1">
        TP {c.tp}
      </div>
      <div className="rounded bg-destructive/10 text-destructive px-2 py-1">
        FP {c.fp}
      </div>
      <div className="rounded bg-destructive/10 text-destructive px-2 py-1">
        FN {c.fn}
      </div>
      <div className="rounded bg-muted text-muted-foreground px-2 py-1">
        TN {c.tn}
      </div>
    </div>
  );
}

function Metric({
  name,
  formel,
  a,
  b,
  gap,
  flag,
  badge,
  subA,
  subB,
}: {
  name: string;
  formel: string;
  a: number;
  b: number;
  gap: number;
  flag: string;
  badge: string;
  subA?: string;
  subB?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-foreground">{name}</div>
        <span
          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
            badge === "OK"
              ? "bg-success/15 text-success border border-success/30"
              : badge === "moderat"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                : "bg-destructive/15 text-destructive border border-destructive/40"
          }`}
        >
          {badge}
        </span>
      </div>
      <div className="font-mono text-[10px] text-muted-foreground mb-1">
        {formel}
      </div>
      <div className="font-mono text-foreground">
        A: {a.toFixed(2)} {subA && <span className="text-[9px] text-muted-foreground">({subA})</span>}
      </div>
      <div className="font-mono text-foreground">
        B: {b.toFixed(2)} {subB && <span className="text-[9px] text-muted-foreground">({subB})</span>}
      </div>
      <div className={`mt-1 font-mono ${flag}`}>gap {gap.toFixed(3)}</div>
    </div>
  );
}
