import { useState } from "react";

// Visualiser ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ som nested ringer.
// Studenten dra-klikker tall og ser hvilken (innerste) mengde de tilhører.

type SetId = "N" | "Z" | "Q" | "R" | "none";

const SAMPLE: { val: string; smallest: SetId; reason: string }[] = [
  { val: "7", smallest: "N", reason: "positivt heltall — tilhører ℕ (og dermed alle de større mengdene)." },
  { val: "0", smallest: "N", reason: "Vi inkluderer 0 i ℕ her (konvensjon varierer). 0 ∈ ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ." },
  { val: "-3", reason: "Negativt heltall — tilhører ℤ, men ikke ℕ.", smallest: "Z" },
  { val: "1/2", smallest: "Q", reason: "Brøk av to heltall (1 og 2) — rasjonalt tall, men ikke heltall." },
  { val: "0.75", smallest: "Q", reason: "Endelig desimaltall = 3/4 — rasjonalt." },
  { val: "0.333...", smallest: "Q", reason: "Periodisk desimaltall = 1/3 — rasjonalt." },
  { val: "√2", smallest: "R", reason: "Irrasjonalt — kan ikke skrives som brøk a/b. I ℝ, men ikke ℚ." },
  { val: "π", smallest: "R", reason: "Transcendentalt og irrasjonalt — tilhører ℝ, ikke ℚ." },
  { val: "√-1", smallest: "none", reason: "Imaginært — i ℂ (komplekse tall), utenfor ℝ. Ikke en del av denne kjeden." },
];

const SET_INFO: Record<SetId, { symbol: string; name: string; ring: number; color: string }> = {
  N: { symbol: "ℕ", name: "naturlige tall", ring: 1, color: "fill-emerald-500/20 stroke-emerald-500" },
  Z: { symbol: "ℤ", name: "heltall", ring: 2, color: "fill-cyan-500/15 stroke-cyan-500" },
  Q: { symbol: "ℚ", name: "rasjonale tall", ring: 3, color: "fill-amber-500/12 stroke-amber-500" },
  R: { symbol: "ℝ", name: "reelle tall", ring: 4, color: "fill-rose-500/8 stroke-rose-500" },
  none: { symbol: "ℂ", name: "(utenfor ℝ)", ring: 5, color: "fill-muted/20 stroke-muted-foreground" },
};

export function NumberSets() {
  const [idx, setIdx] = useState(0);
  const current = SAMPLE[idx];
  const currentRing = SET_INFO[current.smallest].ring;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Tallmengder — ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Klikk en eksempelverdi nederst — den dukker opp i sin <strong>minste</strong>{" "}
        mengde, og du ser inneslutnings-kjeden visuelt.
      </p>

      <div className="grid sm:grid-cols-[1fr_220px] gap-4 items-center">
        <svg viewBox="0 0 320 260" className="w-full">
          {/* Reelle — ytterst */}
          <RingLabel cx={160} cy={130} rx={150} ry={120} info={SET_INFO.R} highlight={currentRing >= 4 && currentRing < 5} />
          <text x={20} y={28} className="fill-rose-500 text-[12px] font-mono font-bold">ℝ</text>

          {/* Rasjonale */}
          <RingLabel cx={160} cy={130} rx={120} ry={95} info={SET_INFO.Q} highlight={currentRing === 3} />
          <text x={50} y={50} className="fill-amber-500 text-[12px] font-mono font-bold">ℚ</text>

          {/* Heltall */}
          <RingLabel cx={160} cy={130} rx={90} ry={70} info={SET_INFO.Z} highlight={currentRing === 2} />
          <text x={85} y={75} className="fill-cyan-500 text-[12px] font-mono font-bold">ℤ</text>

          {/* Naturlige */}
          <RingLabel cx={160} cy={130} rx={55} ry={42} info={SET_INFO.N} highlight={currentRing === 1} />
          <text x={130} y={100} className="fill-emerald-500 text-[12px] font-mono font-bold">ℕ</text>

          {/* Plassering av valgt tall */}
          {(() => {
            const ringR =
              currentRing === 1 ? 0
              : currentRing === 2 ? 70
              : currentRing === 3 ? 102
              : currentRing === 4 ? 132
              : 165;
            const x = currentRing === 5 ? 290 : 160;
            const y = currentRing === 1 ? 130 : 130 + (currentRing === 5 ? 0 : 0);
            const targetX = currentRing === 1 ? 160 : 160;
            const targetY = currentRing === 5 ? 230 : 130;
            return (
              <g>
                <circle cx={targetX} cy={targetY} r={20} className="fill-foreground stroke-brand" strokeWidth={2} />
                <text
                  x={targetX}
                  y={targetY + 5}
                  textAnchor="middle"
                  className="fill-background text-[13px] font-mono font-bold"
                >
                  {current.val}
                </text>
              </g>
            );
          })()}
        </svg>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Velg en eksempelverdi:</div>
          <div className="grid grid-cols-3 gap-1">
            {SAMPLE.map((s, i) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setIdx(i)}
                className={`px-2 py-1 rounded text-[11px] font-mono border ${
                  i === idx
                    ? "border-brand bg-brand/15"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {s.val}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-border bg-background p-3 text-xs">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono font-bold text-foreground">{current.val}</span>
          <span className="text-muted-foreground">tilhører</span>
          <span className="font-mono font-bold text-brand">
            {SET_INFO[current.smallest].symbol}
          </span>
          <span className="text-[11px] text-muted-foreground">
            ({SET_INFO[current.smallest].name})
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">{current.reason}</div>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
        <Definition symbol="ℕ" name="naturlige tall">
          0, 1, 2, 3, ... (positive heltall + 0).
        </Definition>
        <Definition symbol="ℤ" name="heltall">
          ..., −3, −2, −1, 0, 1, 2, 3, ... (Z fra «Zahlen» — tysk for tall).
        </Definition>
        <Definition symbol="ℚ" name="rasjonale tall">
          Brøker a/b der a, b ∈ ℤ og b ≠ 0. Inkluderer alle endelige + periodiske
          desimaltall.
        </Definition>
        <Definition symbol="ℝ" name="reelle tall">
          Alle tall på tallinjen, inkludert irrasjonale som √2, π, e.
        </Definition>
      </div>
    </div>
  );
}

function RingLabel({
  cx,
  cy,
  rx,
  ry,
  info,
  highlight,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  info: { color: string };
  highlight: boolean;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      className={`${info.color} ${highlight ? "stroke-[3]" : "stroke-[1.5]"}`}
      strokeOpacity={highlight ? 1 : 0.6}
    />
  );
}

function Definition({
  symbol,
  name,
  children,
}: {
  symbol: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="flex items-baseline gap-1.5 mb-0.5">
        <span className="font-mono font-bold text-brand">{symbol}</span>
        <span className="text-muted-foreground">{name}</span>
      </div>
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}
