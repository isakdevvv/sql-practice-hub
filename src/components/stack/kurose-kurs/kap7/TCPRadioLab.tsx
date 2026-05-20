import { useEffect, useMemo, useState } from "react";

// TCPRadioLab — fullskala interaktiv for 7.6.
// Simulerer en TCP-forbindelse over en trådløs link med valgbar tap-rate.
// Bruker velger tap-rate (0..10 %) og congestion-control-strategi:
//   - Reno (klassisk; halverer cwnd ved tap)
//   - BBR-aktig (estimerer bandwidth/RTT; reagerer lite på enkelt-tap)
//   - Split-TCP (lokal retransmit nær wireless-link; tap skjules for endepunktet)
// Plotter cwnd over RTT-er, og total throughput.
//
// Pedagogisk hovedpoeng: TCP Reno er fooled av wireless-tap; BBR og split-TCP
// gjenoppretter bedre.

type Algo = "reno" | "bbr" | "split";

const ALGO_LABEL: Record<Algo, string> = {
  reno: "TCP Reno",
  bbr: "BBR-aktig",
  split: "Split-TCP",
};

const ALGO_COLOR: Record<Algo, string> = {
  reno: "#ef4444",
  bbr: "#3b82f6",
  split: "#10b981",
};

const RTTS = 80;
const MSS = 1; // segment-størrelse i abstrakte enheter
const SSTHRESH_INIT = 32;
const CWND_CAP = 64; // max cwnd vi simulerer

type Sample = { rtt: number; cwnd: number; lost: boolean };

function simulate(algo: Algo, lossRate: number, seed: number): Sample[] {
  const out: Sample[] = [];
  let cwnd = 1;
  let ssthresh = SSTHRESH_INIT;
  // Deterministic PRNG basert på seed
  let rng = seed;
  const next = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return (rng % 10000) / 10000;
  };

  // For BBR-modus
  let bdp = 30; // bandwidth-delay-product estimate

  for (let rtt = 0; rtt < RTTS; rtt++) {
    // Hver RTT: sjekk om noen pakke mistes (tap-rate per pakke, ganget med cwnd pakker per RTT)
    let lost = false;
    for (let i = 0; i < cwnd; i++) {
      if (next() < lossRate) {
        lost = true;
        break;
      }
    }

    // Split-TCP: lokal retransmit fanger opp før det propagerer
    if (algo === "split" && lost && next() < 0.85) {
      lost = false;
    }

    out.push({ rtt, cwnd, lost });

    if (lost) {
      if (algo === "reno") {
        // klassisk Reno
        ssthresh = Math.max(2, Math.floor(cwnd / 2));
        cwnd = ssthresh;
      } else if (algo === "bbr") {
        // BBR reagerer ikke på enkelt-tap; juster bare hvis langvarig
        cwnd = Math.max(2, Math.floor(cwnd * 0.85));
      } else {
        // split-TCP: tap er allerede skjult; ingen reaksjon
        cwnd = Math.min(CWND_CAP, cwnd + 1);
      }
    } else {
      if (algo === "reno") {
        if (cwnd < ssthresh) {
          cwnd = Math.min(CWND_CAP, cwnd * 2); // slow start
        } else {
          cwnd = Math.min(CWND_CAP, cwnd + 1); // congestion avoidance
        }
      } else if (algo === "bbr") {
        cwnd = Math.min(CWND_CAP, Math.max(bdp, cwnd + 2));
      } else {
        cwnd = Math.min(CWND_CAP, cwnd + 1);
      }
    }
  }
  return out;
}

export function TCPRadioLab() {
  const [lossRate, setLossRate] = useState(0.02); // 2%
  const [algo, setAlgo] = useState<Algo>("reno");
  const [seed, setSeed] = useState(42);
  const [showAll, setShowAll] = useState(false);

  const series = useMemo(() => {
    return {
      reno: simulate("reno", lossRate, seed),
      bbr: simulate("bbr", lossRate, seed),
      split: simulate("split", lossRate, seed),
    };
  }, [lossRate, seed]);

  const throughput = (s: Sample[]) =>
    s.reduce((acc, x) => acc + x.cwnd * MSS, 0); // sum cwnd som proxy

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold">TCPRadioLab — cwnd under wireless-tap</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Skru opp tap-raten. Se hvordan Reno krasjer mens BBR og split-TCP holder linja.
          </p>
        </div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="text-xs px-2 py-1.5 rounded border border-border hover:bg-muted"
        >
          🎲 Nytt scenario
        </button>
      </div>

      {/* Kontroller */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium">
              Tap-rate per pakke
            </label>
            <span className="text-xs font-mono">{(lossRate * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.1}
            step={0.005}
            value={lossRate}
            onChange={(e) => setLossRate(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
            Trådløse lenker har ofte 1–5 % tap fra radio-feil — selv når det ikke er overbelastning.
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Algoritme
          </span>
          <div className="mt-1 inline-flex rounded-md border border-border text-xs w-full">
            {(["reno", "bbr", "split"] as Algo[]).map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                className={`flex-1 px-2 py-1.5 ${
                  algo === a ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                } ${a !== "reno" ? "border-l border-border" : ""}`}
              >
                {ALGO_LABEL[a]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
            Vis alle tre samtidig
          </label>
        </div>
      </div>

      {/* Plot */}
      <CwndPlot
        series={series}
        active={algo}
        showAll={showAll}
      />

      {/* Throughput-sammenligning */}
      <div className="grid gap-2 sm:grid-cols-3 text-sm">
        {(["reno", "bbr", "split"] as Algo[]).map((a) => {
          const t = throughput(series[a]);
          const tNorm = (t / (CWND_CAP * RTTS)) * 100; // % av teoretisk max
          return (
            <div
              key={a}
              className="rounded border p-2 space-y-0.5"
              style={{ borderColor: ALGO_COLOR[a] }}
            >
              <div className="font-semibold" style={{ color: ALGO_COLOR[a] }}>
                {ALGO_LABEL[a]}
              </div>
              <div className="text-xs">
                Throughput:{" "}
                <span className="font-mono font-semibold">{tNorm.toFixed(0)}%</span>{" "}
                <span className="opacity-60">av maks</span>
              </div>
              <div className="text-xs">
                Tap-events: <span className="font-mono">{series[a].filter((s) => s.lost).length}</span>
              </div>
            </div>
          );
        })}
      </div>

      <details className="rounded-md border border-dashed border-border p-3">
        <summary className="text-sm font-medium cursor-pointer">
          Hvorfor straffer Reno-tap fra wireless?
        </summary>
        <div className="mt-2 text-sm space-y-2 text-muted-foreground">
          <p>
            TCP Reno ble designet på 1980-tallet for kabel-nett der pakketap ≈ kø-overløp. Da er
            riktig respons å halvere senderaten for å la køen tømmes. Men trådløse lenker mister
            pakker fra bit-feil i radio-signalet, helt uavhengig av hvor mye trafikk det er.
            Resultatet: hver gang radioen taper én pakke, halverer Reno cwnd, og throughput synker.
            På lange links (cellular RTT 50 ms) tar det mange runder å klatre opp igjen.
          </p>
          <p>
            BBR (Google, 2016) løste det ved å estimere faktisk båndbredde og RTT direkte, og
            ignorere enkeltvise tap. Split-TCP er en eldre løsning: en proxy ved basestasjonen
            terminerer TCP lokalt og retransmitter raskt mot mobilen — endepunktet ser aldri tapene.
          </p>
        </div>
      </details>
    </div>
  );
}

function CwndPlot({
  series,
  active,
  showAll,
}: {
  series: Record<Algo, Sample[]>;
  active: Algo;
  showAll: boolean;
}) {
  const W = 720;
  const H = 220;
  const padL = 40;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xToScreen = (i: number) => padL + (i / (RTTS - 1)) * plotW;
  const yToScreen = (c: number) => padT + (1 - c / CWND_CAP) * plotH;

  const visible: Algo[] = showAll ? ["reno", "bbr", "split"] : [active];

  return (
    <div className="rounded-md border border-border bg-background p-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[640px]">
        {/* Y-grid */}
        {[0, 16, 32, 48, 64].map((c) => (
          <g key={c}>
            <line
              x1={padL}
              y1={yToScreen(c)}
              x2={padL + plotW}
              y2={yToScreen(c)}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.15}
            />
            <text
              x={padL - 4}
              y={yToScreen(c) + 3}
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
              textAnchor="end"
            >
              {c}
            </text>
          </g>
        ))}
        <text
          x={padL - 30}
          y={padT + 6}
          fontSize={9}
          fill="currentColor"
          opacity={0.6}
        >
          cwnd
        </text>

        {/* X-akse */}
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.4}
        />
        {[0, 20, 40, 60, 80].map((t) => (
          <text
            key={t}
            x={xToScreen(t)}
            y={padT + plotH + 16}
            fontSize={9}
            fill="currentColor"
            opacity={0.6}
            textAnchor="middle"
          >
            {t}
          </text>
        ))}
        <text
          x={padL + plotW}
          y={H - 4}
          fontSize={9}
          fill="currentColor"
          opacity={0.6}
          textAnchor="end"
        >
          RTT-runder
        </text>

        {/* Linjer */}
        {visible.map((algo) => {
          const data = series[algo];
          const d = data
            .map((s, i) => `${i === 0 ? "M" : "L"} ${xToScreen(i).toFixed(1)} ${yToScreen(s.cwnd).toFixed(1)}`)
            .join(" ");
          const lossMarkers = data
            .map((s, i) => (s.lost ? { i, c: s.cwnd } : null))
            .filter((x): x is { i: number; c: number } => x !== null);
          return (
            <g key={algo}>
              <path d={d} fill="none" stroke={ALGO_COLOR[algo]} strokeWidth={2} opacity={showAll && algo !== active ? 0.45 : 1} />
              {algo === active &&
                lossMarkers.map((m) => (
                  <circle
                    key={m.i}
                    cx={xToScreen(m.i)}
                    cy={yToScreen(m.c)}
                    r={2.5}
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth={1}
                  />
                ))}
            </g>
          );
        })}

        {/* Legende */}
        {showAll && (
          <g transform={`translate(${padL + 8}, ${padT + 6})`}>
            {(["reno", "bbr", "split"] as Algo[]).map((a, i) => (
              <g key={a} transform={`translate(${i * 92}, 0)`}>
                <line x1={0} y1={4} x2={14} y2={4} stroke={ALGO_COLOR[a]} strokeWidth={2.5} />
                <text x={18} y={7} fontSize={9} fill="currentColor">
                  {ALGO_LABEL[a]}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
