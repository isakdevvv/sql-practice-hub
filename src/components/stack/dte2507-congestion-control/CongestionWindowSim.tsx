import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  CartesianGrid,
} from "recharts";
import { RotateCcw, Zap, AlertTriangle } from "lucide-react";

type Algo = "tahoe" | "reno" | "cubic";

type Point = {
  rtt: number;
  cwnd: number;
  phase: "slow-start" | "congestion-avoidance" | "fast-recovery";
};

type SimState = {
  points: Point[];
  ssthresh: number;
  losses: number[]; // RTT numbers where loss occurred
};

// Cubic-funksjon: W(t) = C * (t - K)^3 + W_max
// Forenklet til en pen kurve som starter ved cwnd og raskt vokser igjen
function cubicGrow(timeSinceLoss: number, wmax: number): number {
  const C = 0.4;
  const K = Math.cbrt((wmax * 0.3) / C); // tid for å nå wmax igjen
  const t = timeSinceLoss;
  return C * Math.pow(t - K, 3) + wmax;
}

function simulate(algo: Algo, lossRtts: number[], totalRtts: number): SimState {
  const points: Point[] = [];
  let cwnd = 1;
  let ssthresh = 32;
  let phase: Point["phase"] = "slow-start";
  let lastLossWmax = 0;
  let rttSinceLoss = 0;

  for (let rtt = 0; rtt <= totalRtts; rtt++) {
    points.push({ rtt, cwnd: Math.max(1, Math.round(cwnd * 100) / 100), phase });

    const lossNow = lossRtts.includes(rtt);
    if (lossNow) {
      lastLossWmax = cwnd;
      if (algo === "tahoe") {
        ssthresh = Math.max(2, Math.floor(cwnd / 2));
        cwnd = 1;
        phase = "slow-start";
      } else if (algo === "reno") {
        ssthresh = Math.max(2, Math.floor(cwnd / 2));
        cwnd = ssthresh;
        phase = "congestion-avoidance";
      } else {
        // cubic: multiplikativ decrease (beta = 0.7 standard)
        ssthresh = Math.max(2, Math.floor(cwnd * 0.7));
        cwnd = ssthresh;
        phase = "congestion-avoidance";
      }
      rttSinceLoss = 0;
      continue;
    }

    rttSinceLoss++;

    if (algo === "cubic") {
      if (lastLossWmax > 0) {
        // bruk cubic-formel
        cwnd = Math.max(2, cubicGrow(rttSinceLoss * 0.5, lastLossWmax));
        phase = cwnd < lastLossWmax ? "congestion-avoidance" : "congestion-avoidance";
      } else {
        // før første tap: slow start
        cwnd *= 2;
        if (cwnd >= ssthresh) {
          cwnd = ssthresh;
          phase = "congestion-avoidance";
        }
      }
    } else {
      // Tahoe / Reno
      if (phase === "slow-start") {
        cwnd *= 2;
        if (cwnd >= ssthresh) {
          cwnd = ssthresh;
          phase = "congestion-avoidance";
        }
      } else {
        // AIMD: additive increase, 1 MSS per RTT
        cwnd += 1;
      }
    }
  }

  return { points, ssthresh, losses: lossRtts };
}

export function CongestionWindowSim() {
  const [algo, setAlgo] = useState<Algo>("reno");
  const [losses, setLosses] = useState<number[]>([]);
  const [totalRtts] = useState(40);

  const sim = useMemo(() => simulate(algo, losses, totalRtts), [algo, losses, totalRtts]);

  function triggerLoss() {
    // legg til loss på neste tilgjengelige RTT etter siste, eller på halvveis
    const next = losses.length === 0 ? 8 : losses[losses.length - 1] + 12;
    if (next < totalRtts - 2) {
      setLosses([...losses, next]);
    }
  }

  function reset() {
    setLosses([]);
  }

  // Kombiner med alle tre algoritmer for sammenligning
  const allAlgos = useMemo(
    () => ({
      tahoe: simulate("tahoe", losses, totalRtts).points,
      reno: simulate("reno", losses, totalRtts).points,
      cubic: simulate("cubic", losses, totalRtts).points,
    }),
    [losses, totalRtts]
  );

  const compareData = useMemo(() => {
    const out: Array<{ rtt: number; tahoe: number; reno: number; cubic: number }> = [];
    for (let i = 0; i <= totalRtts; i++) {
      out.push({
        rtt: i,
        tahoe: allAlgos.tahoe[i]?.cwnd ?? 0,
        reno: allAlgos.reno[i]?.cwnd ?? 0,
        cubic: allAlgos.cubic[i]?.cwnd ?? 0,
      });
    }
    return out;
  }, [allAlgos, totalRtts]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Congestion window over tid
        </div>
        <div className="flex gap-1.5">
          {(["tahoe", "reno", "cubic"] as Algo[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAlgo(a)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                algo === a
                  ? "bg-brand text-brand-foreground"
                  : "border border-border bg-card hover:border-brand/40 text-foreground"
              }`}
            >
              {a === "tahoe" ? "Tahoe" : a === "reno" ? "Reno" : "Cubic"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="h-[360px] bg-background p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sim.points} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="rtt"
                label={{ value: "RTT (rundetid)", position: "insideBottom", offset: -16, fontSize: 11 }}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                label={{ value: "cwnd (MSS)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{ fontSize: 11 }}
                formatter={(value: number) => [value.toFixed(1), "cwnd"]}
              />
              <ReferenceLine
                y={sim.ssthresh}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: `ssthresh = ${sim.ssthresh}`, fontSize: 10, fill: "#f59e0b" }}
              />
              {sim.losses.map((l, i) => (
                <ReferenceLine
                  key={i}
                  x={l}
                  stroke="#ef4444"
                  strokeDasharray="2 2"
                  label={{ value: "tap", fontSize: 9, fill: "#ef4444" }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="cwnd"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 1.5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Algoritme
            </div>
            <div className="text-base font-semibold capitalize">{algo}</div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {algo === "tahoe" &&
                "Tahoe (1988): ved tap settes cwnd til 1 MSS uansett — slow start fra null. Veldig konservativ."}
              {algo === "reno" &&
                "Reno (1990): fast retransmit + fast recovery. cwnd halveres, hopper rett til congestion avoidance — slipper å starte fra 1."}
              {algo === "cubic" &&
                "Cubic (Linux-default siden 2.6.19): kubikkfunksjon styrer veksten. RTT-fair og bedre på lange/fete pipes (BDP)."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={triggerLoss}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-destructive/90 hover:bg-destructive text-destructive-foreground text-xs font-medium px-3 py-2"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Trigger pakketap
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-3 py-2"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </button>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-2 text-[11px] leading-relaxed">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-brand" /> Faser
            </div>
            <ul className="mt-1 space-y-0.5 text-muted-foreground">
              <li>
                <span className="font-mono text-brand">SS:</span> cwnd dobles hver RTT
              </li>
              <li>
                <span className="font-mono text-brand">CA:</span> cwnd + 1 MSS per RTT (AIMD)
              </li>
              <li>
                <span className="font-mono text-amber-500">Tap:</span> halverer (Reno/Cubic) eller setter til 1 (Tahoe)
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="border-t border-border p-3 bg-muted/20">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Sammenligning av alle tre algoritmer (samme tapsforløp)
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={compareData} margin={{ top: 10, right: 10, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="rtt" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="tahoe"
                stroke="#94a3b8"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="reno"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="cubic"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
