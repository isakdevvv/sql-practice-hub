import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

// ---------- helpers ----------
function normCdf(z: number): number {
  // Abramowitz & Stegun 7.1.26-baserte erf
  const sign = z < 0 ? -1 : 1;
  const az = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * az);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-az * az);
  const erf = sign * y;
  return 0.5 * (1 + erf);
}

const Z_CRIT: Record<string, number> = {
  "0.90": 1.6449,
  "0.95": 1.96,
  "0.99": 2.5758,
};

// Wald
function waldCi(x: number, n: number, z: number) {
  if (n === 0) return { lo: 0, hi: 0, mid: 0 };
  const p = x / n;
  const se = Math.sqrt((p * (1 - p)) / n);
  return { lo: Math.max(0, p - z * se), hi: Math.min(1, p + z * se), mid: p };
}

// Wilson (score) CI
function wilsonCi(x: number, n: number, z: number) {
  if (n === 0) return { lo: 0, hi: 0, mid: 0 };
  const p = x / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { lo: Math.max(0, center - half), hi: Math.min(1, center + half), mid: center };
}

// Agresti–Coull CI (add z²/2 successes and z²/2 failures, then Wald)
function acCi(x: number, n: number, z: number) {
  const xTilde = x + (z * z) / 2;
  const nTilde = n + z * z;
  const pTilde = xTilde / nTilde;
  const se = Math.sqrt((pTilde * (1 - pTilde)) / nTilde);
  return {
    lo: Math.max(0, pTilde - z * se),
    hi: Math.min(1, pTilde + z * se),
    mid: pTilde,
  };
}

function CiBar({
  label,
  ci,
  color,
}: {
  label: string;
  ci: { lo: number; hi: number; mid: number };
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs font-mono">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">
          [{ci.lo.toFixed(3)}, {ci.hi.toFixed(3)}] · bredde{" "}
          {(ci.hi - ci.lo).toFixed(3)}
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted">
        <div
          className="absolute h-3 rounded-full"
          style={{
            left: `${ci.lo * 100}%`,
            width: `${(ci.hi - ci.lo) * 100}%`,
            background: color,
          }}
        />
        <div
          className="absolute h-3 w-0.5"
          style={{ left: `${ci.mid * 100}%`, background: "white" }}
        />
      </div>
    </div>
  );
}

export function ProporsjonsCalculator() {
  const [n, setN] = useState(40);
  const [x, setX] = useState(2);
  const [conf, setConf] = useState<"0.90" | "0.95" | "0.99">("0.95");
  const z = Z_CRIT[conf];

  const ci = useMemo(
    () => ({
      wald: waldCi(x, n, z),
      wilson: wilsonCi(x, n, z),
      ac: acCi(x, n, z),
    }),
    [x, n, z],
  );

  const pHat = x / n;
  const meetsClt = n * pHat >= 10 && n * (1 - pHat) >= 10;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          KI for én proporsjon — Wald vs Wilson vs Agresti-Coull
        </div>
        <div className="flex gap-1.5">
          {(["0.90", "0.95", "0.99"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setConf(c)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (conf === c
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {(Number(c) * 100).toFixed(0)} %
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            n = {n} (utvalgsstørrelse)
          </span>
          <input
            type="range"
            min={5}
            max={500}
            step={1}
            value={n}
            onChange={(e) => {
              const v = Number(e.target.value);
              setN(v);
              if (x > v) setX(v);
            }}
            className="w-full"
          />
        </label>
        <label className="text-sm block">
          <span className="block text-xs text-muted-foreground mb-1">
            x = {x} suksesser (<Tex>{`\\hat{p} = ${pHat.toFixed(3)}`}</Tex>)
          </span>
          <input
            type="range"
            min={0}
            max={n}
            step={1}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div
        className={
          "rounded-lg border p-3 text-xs " +
          (meetsClt
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
            : "border-amber-500/30 bg-amber-500/5 text-amber-200")
        }
      >
        <strong>CLT-betingelse:</strong>{" "}
        <Tex>{`n\\hat{p} = ${(n * pHat).toFixed(1)}`}</Tex>,{" "}
        <Tex>{`n(1-\\hat{p}) = ${(n * (1 - pHat)).toFixed(1)}`}</Tex>.{" "}
        {meetsClt
          ? "Begge ≥ 10 — Wald er rimelig, men Wilson/AC fortsatt bedre."
          : "MINST ÉN < 10 — Wald-CI er upålitelig her. Bruk Wilson eller Agresti-Coull."}
      </div>

      <div className="space-y-3">
        <CiBar label="Wald" ci={ci.wald} color="hsl(0 70% 55%)" />
        <CiBar label="Wilson (score)" ci={ci.wilson} color="hsl(140 60% 45%)" />
        <CiBar label="Agresti-Coull" ci={ci.ac} color="hsl(220 70% 55%)" />
      </div>

      <p className="text-xs text-muted-foreground">
        Skru x ned mot 0 eller opp mot n — Wald skrumper og kan synke under 0
        eller stige over 1 (visuelt klippet her). Wilson og Agresti-Coull holder
        seg innenfor [0, 1] og oppfører seg fornuftig selv ved ekstrem{" "}
        <Tex>{"\\hat{p}"}</Tex>.
      </p>
    </div>
  );
}

// ---------- 2-proporsjons-tester ----------
export function TwoProporsjonsCalculator() {
  const [n1, setN1] = useState(120);
  const [x1, setX1] = useState(48);
  const [n2, setN2] = useState(100);
  const [x2, setX2] = useState(30);
  const [conf, setConf] = useState<"0.90" | "0.95" | "0.99">("0.95");
  const z = Z_CRIT[conf];

  const stats = useMemo(() => {
    const p1 = x1 / n1;
    const p2 = x2 / n2;
    const diff = p1 - p2;
    // Unpooled SE for KI
    const seUnpooled = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
    const ciLo = diff - z * seUnpooled;
    const ciHi = diff + z * seUnpooled;
    // Pooled SE for hypotesetest H0: p1 = p2
    const pPooled = (x1 + x2) / (n1 + n2);
    const sePooled = Math.sqrt(pPooled * (1 - pPooled) * (1 / n1 + 1 / n2));
    const zStat = sePooled === 0 ? 0 : diff / sePooled;
    const pTwoSided = 2 * (1 - normCdf(Math.abs(zStat)));
    return { p1, p2, diff, seUnpooled, ciLo, ciHi, pPooled, sePooled, zStat, pTwoSided };
  }, [n1, x1, n2, x2, z]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          To proporsjoner — KI og z-test
        </div>
        <div className="flex gap-1.5">
          {(["0.90", "0.95", "0.99"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setConf(c)}
              className={
                "px-2.5 py-1 rounded border text-xs " +
                (conf === c
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40")
              }
            >
              {(Number(c) * 100).toFixed(0)} %
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2 rounded border border-border p-3">
          <div className="font-semibold text-brand">Gruppe 1</div>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              n₁ = {n1}
            </span>
            <input
              type="range"
              min={10}
              max={500}
              step={1}
              value={n1}
              onChange={(e) => {
                const v = Number(e.target.value);
                setN1(v);
                if (x1 > v) setX1(v);
              }}
              className="w-full"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              x₁ = {x1} (<Tex>{`\\hat{p}_1 = ${stats.p1.toFixed(3)}`}</Tex>)
            </span>
            <input
              type="range"
              min={0}
              max={n1}
              step={1}
              value={x1}
              onChange={(e) => setX1(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="space-y-2 rounded border border-border p-3">
          <div className="font-semibold text-brand">Gruppe 2</div>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              n₂ = {n2}
            </span>
            <input
              type="range"
              min={10}
              max={500}
              step={1}
              value={n2}
              onChange={(e) => {
                const v = Number(e.target.value);
                setN2(v);
                if (x2 > v) setX2(v);
              }}
              className="w-full"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">
              x₂ = {x2} (<Tex>{`\\hat{p}_2 = ${stats.p2.toFixed(3)}`}</Tex>)
            </span>
            <input
              type="range"
              min={0}
              max={n2}
              step={1}
              value={x2}
              onChange={(e) => setX2(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs font-mono space-y-1">
        <div>
          <Tex>{`\\hat{p}_1 - \\hat{p}_2 = ${stats.diff.toFixed(4)}`}</Tex>
        </div>
        <div>
          <strong>KI (unpooled SE):</strong> [{stats.ciLo.toFixed(4)},{" "}
          {stats.ciHi.toFixed(4)}]
        </div>
        <div>
          <strong>z-test (pooled SE, <Tex>{"H_0:\\,p_1=p_2"}</Tex>):</strong> z ={" "}
          {stats.zStat.toFixed(3)}, p ={" "}
          {stats.pTwoSided < 1e-4
            ? "<0.0001"
            : stats.pTwoSided.toFixed(4)}
        </div>
        <div
          className={
            stats.pTwoSided < 0.05
              ? "text-emerald-400 font-semibold"
              : "text-muted-foreground"
          }
        >
          {stats.pTwoSided < 0.05
            ? `p < 0.05 → forkast H_0 ved α = 0.05`
            : `p ≥ 0.05 → behold H_0`}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <strong>KI bruker unpooled SE</strong> (separate{" "}
        <Tex>{"\\hat{p}_i"}</Tex>) fordi vi ikke antar at proporsjonene er like.
        {" "}<strong>z-testen bruker pooled SE</strong> fordi vi tester
        hypotesen om at de ER like — da må samme proporsjon brukes for begge.
      </p>
    </div>
  );
}
