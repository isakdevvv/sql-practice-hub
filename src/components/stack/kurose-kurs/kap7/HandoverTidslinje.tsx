import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

// HandoverTidslinje — fullskala interaktiv for 7.5.
// Tre håndover-strategier vises som tidslinjer side om side:
//   - Hard (LTE-typisk, 100 ms gap)
//   - Soft (3G UMTS, overlap)
//   - 5G CHO (kondisjonell, ~15 ms gap)
// For hver tidslinje vises: signal-styrke til gammel/ny BS, klient-status, og
// pakker som lykkes eller tapes. På slutten ser brukeren total downtime og
// antall mistede VoIP-pakker (20 ms intervall).

type Strategy = "hard" | "soft" | "cho";

type Pkt = { t: number; ok: boolean };

const STRATEGIES: Record<
  Strategy,
  {
    label: string;
    desc: string;
    gapStart: number; // ms inn i animasjonen der gap starter
    gapEnd: number;
    overlapStart?: number;
    overlapEnd?: number;
    color: string;
  }
> = {
  hard: {
    label: "Hard (LTE)",
    desc: "Bryter gammel før den kobler ny. 100 ms gap.",
    gapStart: 1500,
    gapEnd: 1600,
    color: "#ef4444",
  },
  soft: {
    label: "Soft (3G UMTS)",
    desc: "Begge basestasjoner aktive samtidig en kort periode.",
    gapStart: 0,
    gapEnd: 0,
    overlapStart: 1400,
    overlapEnd: 1800,
    color: "#10b981",
  },
  cho: {
    label: "5G CHO",
    desc: "Kondisjonell — telefonen har allerede klargjort ny BS når den hopper. ~15 ms gap.",
    gapStart: 1500,
    gapEnd: 1515,
    color: "#3b82f6",
  },
};

const TOTAL_DUR = 3000; // ms — total tidslinje
const PKT_INTERVAL = 60; // ms — for visning (kompresses vs ekte VoIP 20 ms)

function genPackets(strat: Strategy): Pkt[] {
  const s = STRATEGIES[strat];
  const out: Pkt[] = [];
  for (let t = 0; t < TOTAL_DUR; t += PKT_INTERVAL) {
    const inGap = t >= s.gapStart && t < s.gapEnd;
    out.push({ t, ok: !inGap });
  }
  return out;
}

export function HandoverTidslinje() {
  const [progress, setProgress] = useState(0); // 0..1
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / TOTAL_DUR);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const play = () => {
    setProgress(0);
    setPlaying(true);
  };
  const reset = () => {
    setPlaying(false);
    setProgress(0);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">HandoverTidslinje — hard, soft og 5G-CHO side om side</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Spill av og se hva som skjer på 3 sekunder. VoIP-pakker (én strek per pakke) tapes når
            radioen er i gap-vinduet.
          </p>
        </div>
        <div className="inline-flex gap-2">
          <button
            onClick={play}
            disabled={playing}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted disabled:opacity-40"
          >
            <Play className="h-3 w-3" /> Spill av
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(STRATEGIES) as Strategy[]).map((s) => (
          <Lane key={s} strategy={s} progress={progress} />
        ))}
      </div>

      {/* Oppsummering */}
      <div className="rounded-md border border-border p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Oppsummering (etter avspilling)
        </div>
        <div className="grid gap-2 sm:grid-cols-3 text-sm">
          {(Object.keys(STRATEGIES) as Strategy[]).map((s) => {
            const pkts = genPackets(s);
            const lost = pkts.filter((p) => !p.ok).length;
            const total = pkts.length;
            const gap = STRATEGIES[s].gapEnd - STRATEGIES[s].gapStart;
            return (
              <div
                key={s}
                className="rounded border border-border p-2 space-y-0.5"
                style={{ borderColor: STRATEGIES[s].color }}
              >
                <div className="font-semibold" style={{ color: STRATEGIES[s].color }}>
                  {STRATEGIES[s].label}
                </div>
                <div className="text-xs">
                  Downtime: <span className="font-mono">{gap} ms</span>
                </div>
                <div className="text-xs">
                  Tapt: <span className="font-mono">{lost}</span> av{" "}
                  <span className="font-mono">{total}</span> pakker
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Hvorfor er soft handover bedre, og hvorfor brukes det likevel ikke i 4G?
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            Soft handover krever at telefonen kan lytte til to basestasjoner samtidig på samme
            frekvens. Det var greit i 3G UMTS fordi det brukte CDMA — alle stasjoner deler
            spektrumet, og to signaler kan dekodes parallelt. I 4G LTE er OFDMA inndelt slik at
            hver celle bruker sine egne sub-bærere, så telefonen kan ikke kombinere mottak fra to
            celler uten å spare radio-energi.
          </p>
          <p>
            5G løser problemet annerledes: med <strong>kondisjonell handover</strong> får
            telefonen instruksjoner om ny BS lenge før den skal bytte, og kan «hoppe» raskt når
            målene oppfylles. Resultatet er en gap-tid på ned mot 10–15 ms — kort nok til at de
            fleste applikasjoner ikke merker det.
          </p>
        </div>
      </details>
    </div>
  );
}

function Lane({ strategy, progress }: { strategy: Strategy; progress: number }) {
  const s = STRATEGIES[strategy];
  const pkts = genPackets(strategy);
  const W = 720;
  const H = 100;
  const padL = 80;
  const padR = 20;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const tToX = (t: number) => padL + (t / TOTAL_DUR) * plotW;

  // Signal-kurver: gammel BS faller, ny BS stiger. Overlapper for soft.
  const sigPath = (rising: boolean) => {
    const pts: string[] = [];
    for (let t = 0; t <= TOTAL_DUR; t += 50) {
      const norm = t / TOTAL_DUR;
      let v: number;
      if (rising) {
        v = 1 / (1 + Math.exp(-(norm - 0.5) * 12));
      } else {
        v = 1 - 1 / (1 + Math.exp(-(norm - 0.5) * 12));
      }
      const x = tToX(t);
      const y = padT + (1 - v) * plotH;
      pts.push(`${pts.length === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const currentT = progress * TOTAL_DUR;

  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color: s.color }}>
          {s.label}
        </span>
        <span className="text-[10px] text-muted-foreground">{s.desc}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Labels */}
        <text x={padL - 6} y={padT + 6} fontSize={9} fill="currentColor" opacity={0.6} textAnchor="end">
          gml/ny
        </text>
        <text
          x={padL - 6}
          y={padT + plotH + 12}
          fontSize={9}
          fill="currentColor"
          opacity={0.6}
          textAnchor="end"
        >
          tid
        </text>

        {/* Gap-band */}
        {s.gapEnd > s.gapStart && (
          <rect
            x={tToX(s.gapStart)}
            y={padT}
            width={tToX(s.gapEnd) - tToX(s.gapStart)}
            height={plotH}
            fill="#ef4444"
            fillOpacity={0.15}
          />
        )}
        {/* Overlap-band (soft) */}
        {s.overlapStart !== undefined && s.overlapEnd !== undefined && (
          <rect
            x={tToX(s.overlapStart)}
            y={padT}
            width={tToX(s.overlapEnd) - tToX(s.overlapStart)}
            height={plotH}
            fill="#10b981"
            fillOpacity={0.15}
          />
        )}

        {/* Signal-kurver */}
        <path d={sigPath(false)} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
        <path d={sigPath(true)} fill="none" stroke={s.color} strokeWidth={2} />

        {/* Pakker som streker langs bunnen */}
        {pkts.map((p, i) => {
          const x = tToX(p.t);
          const visible = p.t <= currentT;
          if (!visible) return null;
          return (
            <line
              key={i}
              x1={x}
              y1={padT + plotH + 4}
              x2={x}
              y2={padT + plotH + 14}
              stroke={p.ok ? "#10b981" : "#ef4444"}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Tidsmarkør */}
        {progress > 0 && progress < 1 && (
          <line
            x1={tToX(currentT)}
            y1={padT}
            x2={tToX(currentT)}
            y2={padT + plotH + 16}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.5}
          />
        )}

        {/* Tidsaksen */}
        {[0, 1000, 2000, 3000].map((t) => (
          <g key={t}>
            <line
              x1={tToX(t)}
              y1={padT + plotH}
              x2={tToX(t)}
              y2={padT + plotH + 3}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.5}
            />
            <text
              x={tToX(t)}
              y={padT + plotH + 26}
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
              textAnchor="middle"
            >
              {t} ms
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
