import { useMemo, useState } from "react";
import { Zap, AlertTriangle } from "lucide-react";

// Interaktiv visualisering av seksjon 3.6 — Congestion control.
// Live-plot av cwnd over RTT-er for tre algoritmer:
//   - Reno (klassisk AIMD-sagtann: linear vekst, halver ved tap)
//   - Cubic (Linux-default, kubisk vekst etter tap, husker «hvor det smelte sist»)
//   - BBR (Google 2016: estimer båndbredde-delay-product direkte, ignorer tap)
//
// Brukeren kan injisere congestion-events (timeout, 3 dup-ACK) for å se hvordan
// hver algoritme reagerer.

type Algo = "reno" | "cubic" | "bbr";

const ALGO_LABEL: Record<Algo, string> = {
  reno: "TCP Reno",
  cubic: "TCP Cubic",
  bbr: "BBR",
};
const ALGO_COLOR: Record<Algo, string> = {
  reno: "#ef4444",
  cubic: "#8b5cf6",
  bbr: "#10b981",
};
const ALGO_TAGLINE: Record<Algo, string> = {
  reno: "Klassisk sagtann: +1 MSS/RTT, halver ved tap",
  cubic: "Kubisk vekst: husker forrige tap-cwnd og glir mot W_max",
  bbr: "Mål BW × RTT direkte; reager ikke på enkelt-tap",
};

type EventKind = "timeout" | "dupack";
type Event = { rtt: number; kind: EventKind };

const RTTS = 100;
const CWND_CAP = 80;
const SSTHRESH_INIT = 32;

type Sample = {
  rtt: number;
  cwnd: Record<Algo, number>;
};

function simulate(events: Event[], lossRateBg: number, seed: number): Sample[] {
  let renoCwnd = 1;
  let renoSsthresh = SSTHRESH_INIT;
  let cubicCwnd = 1;
  let cubicSsthresh = SSTHRESH_INIT;
  let cubicWMax = SSTHRESH_INIT; // cwnd ved siste tap (Cubic-anker)
  let cubicLastLossRtt = -50; // når var siste tap (negativ = lenge siden)
  let bbrCwnd = 1;
  let bbrBdp = 30; // bandwidth-delay-product estimate

  const samples: Sample[] = [];
  const eventByRtt = new Map<number, EventKind[]>();
  for (const e of events) {
    const arr = eventByRtt.get(e.rtt) || [];
    arr.push(e.kind);
    eventByRtt.set(e.rtt, arr);
  }

  // Deterministic PRNG
  let rng = seed;
  const next = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return (rng % 10000) / 10000;
  };

  for (let rtt = 0; rtt < RTTS; rtt++) {
    // Sample bakgrunns-tap (uavhengig av valgte events)
    let bgLost = false;
    for (let i = 0; i < Math.max(renoCwnd, cubicCwnd, bbrCwnd); i++) {
      if (next() < lossRateBg) {
        bgLost = true;
        break;
      }
    }

    // Bestem hva som skjer denne RTTen for hver algoritme
    const explicitEvents = eventByRtt.get(rtt) || [];

    // For å holde det enkelt: bakgrunns-tap teller som "dupack" hvis det er moderat tap-rate
    if (bgLost) explicitEvents.push("dupack");

    const isTimeout = explicitEvents.includes("timeout");
    const isDup = explicitEvents.includes("dupack");

    // ---- RENO ----
    if (isTimeout) {
      renoSsthresh = Math.max(2, Math.floor(renoCwnd / 2));
      renoCwnd = 1;
    } else if (isDup) {
      // fast recovery: ssthresh = cwnd/2, cwnd = ssthresh
      renoSsthresh = Math.max(2, Math.floor(renoCwnd / 2));
      renoCwnd = renoSsthresh;
    } else {
      if (renoCwnd < renoSsthresh) {
        renoCwnd = Math.min(CWND_CAP, renoCwnd * 2); // slow start
      } else {
        renoCwnd = Math.min(CWND_CAP, renoCwnd + 1); // AIMD
      }
    }

    // ---- CUBIC ----
    if (isTimeout) {
      cubicSsthresh = Math.max(2, Math.floor(cubicCwnd / 2));
      cubicWMax = cubicCwnd;
      cubicCwnd = 1;
      cubicLastLossRtt = rtt;
    } else if (isDup) {
      cubicWMax = cubicCwnd;
      cubicSsthresh = Math.max(2, Math.floor(cubicCwnd * 0.7)); // beta = 0.7 (CUBIC)
      cubicCwnd = cubicSsthresh;
      cubicLastLossRtt = rtt;
    } else {
      if (cubicCwnd < cubicSsthresh) {
        cubicCwnd = Math.min(CWND_CAP, cubicCwnd * 2);
      } else {
        // Kubisk vekst: W(t) = C·(t - K)^3 + W_max
        // K = ((W_max·(1-beta))/C)^(1/3)
        const t = rtt - cubicLastLossRtt;
        const C = 0.4;
        const beta = 0.3;
        const K = Math.cbrt((cubicWMax * beta) / C);
        const Wcubic = C * Math.pow(t - K, 3) + cubicWMax;
        cubicCwnd = Math.min(CWND_CAP, Math.max(1, Wcubic));
      }
    }

    // ---- BBR ----
    if (isTimeout) {
      // BBR reagerer kun på vedvarende tap; men timeout = klart problem
      bbrCwnd = Math.max(2, Math.floor(bbrCwnd * 0.5));
    } else if (isDup) {
      // BBR ignorerer typisk dup-ACK; kun små justeringer
      bbrCwnd = Math.max(2, Math.floor(bbrCwnd * 0.95));
    } else {
      // Probing: prøver å nå BDP, og litt over for å estimere
      const target = bbrBdp + (rtt % 8 < 1 ? 8 : 0); // pacing gain pulses
      if (bbrCwnd < target) {
        bbrCwnd = Math.min(CWND_CAP, bbrCwnd + 2);
      } else {
        bbrCwnd = Math.min(CWND_CAP, bbrCwnd + 0.5);
      }
      // BDP-estimering vokser sakte mot CWND_CAP
      bbrBdp = Math.min(CWND_CAP - 5, bbrBdp + 0.3);
    }

    samples.push({
      rtt,
      cwnd: {
        reno: renoCwnd,
        cubic: cubicCwnd,
        bbr: bbrCwnd,
      },
    });
  }

  return samples;
}

export function Section35Live() {
  const [events, setEvents] = useState<Event[]>([
    { rtt: 25, kind: "dupack" },
    { rtt: 60, kind: "timeout" },
  ]);
  const [lossRateBg, setLossRateBg] = useState(0.0);
  const [seed, setSeed] = useState(11);
  const [showAlgos, setShowAlgos] = useState<Record<Algo, boolean>>({
    reno: true,
    cubic: true,
    bbr: true,
  });

  const samples = useMemo(() => simulate(events, lossRateBg, seed), [events, lossRateBg, seed]);

  // Throughput-proxy = sum cwnd over alle RTT-er
  const throughput = (algo: Algo) => {
    return samples.reduce((acc, s) => acc + s.cwnd[algo], 0);
  };
  const maxThroughput = CWND_CAP * RTTS;

  function addEvent(kind: EventKind) {
    // Plasser eventet midt i tomt rom
    const used = new Set(events.map((e) => e.rtt));
    let r = 50;
    while (used.has(r) && r < RTTS - 5) r++;
    setEvents([...events, { rtt: r, kind }].sort((a, b) => a.rtt - b.rtt));
  }
  function removeEvent(idx: number) {
    setEvents(events.filter((_, i) => i !== idx));
  }
  function setEventRtt(idx: number, rtt: number) {
    const newEvents = events.map((e, i) => (i === idx ? { ...e, kind: e.kind, rtt } : e));
    setEvents(newEvents.sort((a, b) => a.rtt - b.rtt));
  }
  function clearEvents() {
    setEvents([]);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3 flex-wrap">
        <span className="font-medium text-foreground">
          cwnd-respons på congestion-events: tre algoritmer side om side
        </span>
        <span className="ml-auto font-mono">{RTTS} RTT-er simulert</span>
      </div>

      {/* Algoritme-toggles */}
      <div className="px-4 py-3 border-b border-border grid gap-2 md:grid-cols-3 text-xs">
        {(["reno", "cubic", "bbr"] as Algo[]).map((a) => (
          <label
            key={a}
            className="flex items-center gap-2 rounded border p-2 cursor-pointer hover:bg-muted/30"
            style={{ borderColor: ALGO_COLOR[a] }}
          >
            <input
              type="checkbox"
              checked={showAlgos[a]}
              onChange={(e) => setShowAlgos({ ...showAlgos, [a]: e.target.checked })}
              className="accent-current"
              style={{ color: ALGO_COLOR[a] }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold" style={{ color: ALGO_COLOR[a] }}>
                {ALGO_LABEL[a]}
              </div>
              <div className="text-muted-foreground text-[10px] truncate">
                {ALGO_TAGLINE[a]}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Plot */}
      <div className="p-4">
        <CwndPlot samples={samples} events={events} showAlgos={showAlgos} />
      </div>

      {/* Event-kontroller */}
      <div className="px-4 py-3 border-t border-border space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground">Congestion-events:</span>
          <button
            onClick={() => addEvent("dupack")}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
          >
            <Zap className="h-3 w-3" /> + 3 dup-ACK
          </button>
          <button
            onClick={() => addEvent("timeout")}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-destructive/40 bg-destructive/10 hover:bg-destructive/20"
          >
            <AlertTriangle className="h-3 w-3" /> + RTO timeout
          </button>
          <button
            onClick={clearEvents}
            className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted ml-auto"
          >
            Fjern alle
          </button>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted"
          >
            🎲 Nytt scenario
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-[11px] text-muted-foreground italic">
            Ingen events. Plott viser ren slow-start + steady state. Legg til en dup-ACK eller timeout for å se reaksjonen.
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    e.kind === "timeout"
                      ? "bg-destructive/15 text-destructive border border-destructive/40"
                      : "bg-amber-500/15 text-amber-600 border border-amber-500/40"
                  }`}
                >
                  {e.kind === "timeout" ? "RTO" : "3 dup-ACK"}
                </span>
                <span className="text-muted-foreground">ved RTT</span>
                <input
                  type="range"
                  min={0}
                  max={RTTS - 1}
                  step={1}
                  value={e.rtt}
                  onChange={(ev) => setEventRtt(i, Number(ev.target.value))}
                  className="flex-1 accent-brand max-w-md"
                />
                <span className="font-mono text-foreground w-10">{e.rtt}</span>
                <button
                  onClick={() => removeEvent(i)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-muted text-muted-foreground"
                >
                  Fjern
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bakgrunns-tap-slider */}
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium text-foreground">
              Bakgrunns-tap (random, fra t.eks. wireless-feil)
            </label>
            <span className="text-xs font-mono">{(lossRateBg * 100).toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.02}
            step={0.001}
            value={lossRateBg}
            onChange={(e) => setLossRateBg(Number(e.target.value))}
            className="w-full accent-brand"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            BBR ignorerer enkelt-tap; Reno og Cubic straffer cwnd. Skru opp for å se forskjellen.
          </p>
        </div>
      </div>

      {/* Throughput-sammenligning */}
      <div className="px-4 py-3 border-t border-border bg-muted/10 grid gap-2 sm:grid-cols-3 text-xs">
        {(["reno", "cubic", "bbr"] as Algo[]).map((a) => {
          const t = throughput(a);
          const pct = (t / maxThroughput) * 100;
          return (
            <div
              key={a}
              className="rounded border p-2 space-y-0.5"
              style={{ borderColor: ALGO_COLOR[a], opacity: showAlgos[a] ? 1 : 0.4 }}
            >
              <div className="font-semibold" style={{ color: ALGO_COLOR[a] }}>
                {ALGO_LABEL[a]}
              </div>
              <div>
                Throughput-proxy:{" "}
                <span className="font-mono font-semibold">{pct.toFixed(1)}%</span>{" "}
                <span className="text-muted-foreground">av teoretisk max</span>
              </div>
              <div>
                Snitt cwnd:{" "}
                <span className="font-mono">{(t / RTTS).toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <details className="px-4 py-3 border-t border-border text-sm">
        <summary className="cursor-pointer font-medium">
          Når er hvilken algoritme best?
        </summary>
        <div className="mt-2 space-y-2 text-muted-foreground leading-relaxed">
          <p>
            <span className="text-red-500 font-semibold">Reno</span>: konservativ, rettferdig,
            forutsigbar. Sagtannen er klassisk og gir god deling av flaskehalsen, men er treg til å
            ta tilbake throughput etter tap. Standard-valg på BSD/Mac før Cubic.
          </p>
          <p>
            <span className="text-violet-500 font-semibold">Cubic</span> (Linux-default fra ~2008):
            husker hvor det smelte sist (W_max) og bruker en kubisk kurve som vokser sakte i nærheten
            av W_max, deretter aggressivt utover. Bedre throughput på high-BDP-lenker enn Reno.
          </p>
          <p>
            <span className="text-emerald-500 font-semibold">BBR</span> (Google 2016, default på
            youtube.com): estimerer båndbredde og minste-RTT direkte, og ignorerer enkelt-tap. Brutalt
            mye bedre på wireless og high-BDP, men kan være urettferdig mot Reno/Cubic i blandet
            trafikk (BBR-versjonene 2 og 3 mildner dette).
          </p>
          <p>
            Tommelfingerregler: høy tap-rate ikke fra overbelastning (wireless) → BBR. Mest TCP-
            kompatible netter → Cubic. Beskytte hverandre fra urettferdighet → Reno.
          </p>
        </div>
      </details>
    </div>
  );
}

function CwndPlot({
  samples,
  events,
  showAlgos,
}: {
  samples: Sample[];
  events: Event[];
  showAlgos: Record<Algo, boolean>;
}) {
  const W = 740;
  const H = 240;
  const padL = 40;
  const padR = 20;
  const padT = 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xToScreen = (i: number) => padL + (i / (RTTS - 1)) * plotW;
  const yToScreen = (c: number) => padT + (1 - c / CWND_CAP) * plotH;

  return (
    <div className="rounded-md border border-border bg-background p-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[640px]">
        {/* Y-grid */}
        {[0, 20, 40, 60, 80].map((c) => (
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
        <text x={padL - 30} y={padT + 6} fontSize={9} fill="currentColor" opacity={0.6}>
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
        {[0, 25, 50, 75, 100].map((t) => (
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
          RTT-runder →
        </text>

        {/* Event-markeringer (vertikale linjer på event-RTT) */}
        {events.map((ev, i) => {
          const x = xToScreen(ev.rtt);
          const color = ev.kind === "timeout" ? "#ef4444" : "#f59e0b";
          return (
            <g key={i}>
              <line
                x1={x}
                y1={padT}
                x2={x}
                y2={padT + plotH}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.55}
              />
              <text
                x={x + 3}
                y={padT + 10}
                fontSize={8}
                fill={color}
                opacity={0.9}
                fontWeight="600"
              >
                {ev.kind === "timeout" ? "RTO" : "3·dup"}
              </text>
            </g>
          );
        })}

        {/* Linjer per algoritme */}
        {(["reno", "cubic", "bbr"] as Algo[]).map((algo) => {
          if (!showAlgos[algo]) return null;
          const d = samples
            .map(
              (s, i) =>
                `${i === 0 ? "M" : "L"} ${xToScreen(i).toFixed(1)} ${yToScreen(s.cwnd[algo]).toFixed(1)}`,
            )
            .join(" ");
          return (
            <path
              key={algo}
              d={d}
              fill="none"
              stroke={ALGO_COLOR[algo]}
              strokeWidth={1.8}
              opacity={0.9}
            />
          );
        })}

        {/* Legende */}
        <g transform={`translate(${padL + 8}, ${padT + 2})`}>
          {(["reno", "cubic", "bbr"] as Algo[])
            .filter((a) => showAlgos[a])
            .map((a, i) => (
              <g key={a} transform={`translate(${i * 86}, 0)`}>
                <line x1={0} y1={4} x2={14} y2={4} stroke={ALGO_COLOR[a]} strokeWidth={2.5} />
                <text x={18} y={7} fontSize={9} fill="currentColor">
                  {ALGO_LABEL[a]}
                </text>
              </g>
            ))}
        </g>
      </svg>
    </div>
  );
}
