import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";
import {
  Z_CRIT,
  waldCi,
  wilsonCi,
  clopperPearsonCi,
} from "./propUtils";

interface CI {
  lo: number;
  hi: number;
  mid: number;
}

// Bar med klipping markert hvis CI går utenfor [0, 1].
function CiBar({
  label,
  ci,
  color,
  warn,
}: {
  label: string;
  ci: CI;
  color: string;
  warn?: string;
}) {
  const loClip = Math.max(0, ci.lo);
  const hiClip = Math.min(1, ci.hi);
  const overflowLo = ci.lo < 0;
  const overflowHi = ci.hi > 1;
  const width = Math.max(0, hiClip - loClip);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs font-mono gap-3">
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
            left: `${loClip * 100}%`,
            width: `${width * 100}%`,
            background: color,
          }}
        />
        <div
          className="absolute h-3 w-0.5"
          style={{ left: `${Math.max(0, Math.min(1, ci.mid)) * 100}%`, background: "white" }}
        />
        {overflowLo ? (
          <div
            className="absolute -top-0.5 h-4 w-0.5 bg-red-400"
            style={{ left: "0%" }}
            title="Nedre grense < 0"
          />
        ) : null}
        {overflowHi ? (
          <div
            className="absolute -top-0.5 h-4 w-0.5 bg-red-400"
            style={{ left: "100%" }}
            title="Øvre grense > 1"
          />
        ) : null}
      </div>
      {warn ? (
        <div className="text-[11px] text-red-300">{warn}</div>
      ) : null}
    </div>
  );
}

const PRESETS: { label: string; n: number; x: number; note: string }[] = [
  { label: "Liten n, ekstrem p̂", n: 20, x: 1, note: "x=1 av 20 — Wald kollapser nær 0." },
  { label: "Moderat n", n: 100, x: 35, note: "Wald, Wilson og CP er nesten like." },
  { label: "Stort n, balansert", n: 1000, x: 487, note: "Alle tre overlapper nær perfekt." },
  { label: "x = 0 (alt edge)", n: 30, x: 0, note: "Wald gir [0,0] — ubrukelig." },
  { label: "x = n (alt edge)", n: 30, x: 30, note: "Wald gir [1,1] — ubrukelig." },
];

export function ProportionCiVisualizer() {
  const [n, setN] = useState(40);
  const [x, setX] = useState(2);
  const [conf, setConf] = useState<"0.90" | "0.95" | "0.99">("0.95");
  const z = Z_CRIT[conf];
  const alpha = 1 - Number(conf);

  const cis = useMemo(
    () => ({
      wald: waldCi(x, n, z),
      wilson: wilsonCi(x, n, z),
      cp: clopperPearsonCi(x, n, alpha),
    }),
    [x, n, z, alpha],
  );

  const pHat = n > 0 ? x / n : 0;
  const meetsClt = n * pHat >= 10 && n * (1 - pHat) >= 10;

  const waldWarn =
    cis.wald.lo < 0
      ? "Wald-grense < 0 — meningsløs for proporsjon."
      : cis.wald.hi > 1
        ? "Wald-grense > 1 — meningsløs for proporsjon."
        : x === 0 || x === n
          ? "Wald gir et punkt-CI ved x=0 eller x=n — SE blir 0."
          : undefined;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Tre CI-formler sammenlignet
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
            n = {n}
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
            x = {x} (<Tex>{`\\hat{p} = ${pHat.toFixed(3)}`}</Tex>)
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

      <div className="flex flex-wrap gap-1.5 text-xs">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setN(p.n);
              setX(p.x);
            }}
            className="px-2 py-1 rounded border border-border bg-background hover:border-brand/40"
            title={p.note}
          >
            {p.label}
          </button>
        ))}
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
          ? "Begge ≥ 10 — Wald er rimelig, men Wilson/CP fortsatt bedre."
          : "MINST ÉN < 10 — Wald er upålitelig. Wilson er anbefalt; CP er eksakt og konservativ."}
      </div>

      <div className="space-y-3">
        <CiBar
          label="Wald (normal-approx)"
          ci={cis.wald}
          color="hsl(0 70% 55%)"
          warn={waldWarn}
        />
        <CiBar
          label="Wilson (score)"
          ci={cis.wilson}
          color="hsl(140 60% 45%)"
        />
        <CiBar
          label="Clopper-Pearson (eksakt)"
          ci={cis.cp}
          color="hsl(220 70% 55%)"
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1.5">
        <p>
          <strong className="text-foreground">Wald</strong>: symmetrisk om{" "}
          <Tex>{"\\hat{p}"}</Tex>; kollapser ved x=0/n; kan gå utenfor [0,1].
        </p>
        <p>
          <strong className="text-foreground">Wilson</strong>: asymmetrisk når{" "}
          <Tex>{"\\hat{p}"}</Tex> nær 0/1; ligger alltid i [0,1]; default i R og
          statsmodels.
        </p>
        <p>
          <strong className="text-foreground">Clopper-Pearson</strong>: bygd på
          binomial-fordelingen direkte; dekningsgrad ≥ konfidensnivå (garantert);
          bredere enn Wilson.
        </p>
      </div>
    </div>
  );
}
