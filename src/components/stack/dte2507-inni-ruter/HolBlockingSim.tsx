import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

type PortId = 0 | 1 | 2;
type Packet = { id: number; dest: PortId };

const COLORS = [
  { stroke: "#ef4444", fill: "#fecaca", text: "#7f1d1d" }, // red
  { stroke: "#10b981", fill: "#a7f3d0", text: "#064e3b" }, // green
  { stroke: "#3b82f6", fill: "#bfdbfe", text: "#1e3a8a" }, // blue
];

const NUM_PORTS = 3;
const MAX_QUEUE = 6;

let nextPktId = 1;
function newPkt(): Packet {
  return { id: nextPktId++, dest: Math.floor(Math.random() * NUM_PORTS) as PortId };
}

export function HolBlockingSim() {
  const [holEnabled, setHolEnabled] = useState(true);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  // queues[input][position]: if HOL, simple FIFO. If VOQ, we model as a single FIFO too,
  // but the scheduler will look inside the queue and pick a non-blocked packet.
  const [queues, setQueues] = useState<Packet[][]>(() =>
    Array.from({ length: NUM_PORTS }, () => [newPkt(), newPkt()] as Packet[])
  );
  // Pakker sendt totalt og antall ledige ticks
  const [stats, setStats] = useState({ sent: 0, ticks: 0, blocked: 0 });
  const [lastDispatched, setLastDispatched] = useState<(Packet | null)[]>([null, null, null]);

  const runRef = useRef(running);
  runRef.current = running;

  const arrivalRate = 0.85; // sannsynlighet for at det kommer en ny pakke pr. port pr. tick

  function step() {
    setQueues((curr) => {
      // 1) Compute dispatch: hvilke input-porter får sende, til hvilke output-porter?
      // Greedy match: for hver output-port, velg input som har en pakke til den.
      const outputBusy: boolean[] = [false, false, false];
      const dispatchIdx: (number | null)[] = [null, null, null]; // pos in queue
      const dispatched: (Packet | null)[] = [null, null, null];

      const order = shuffleIdx(NUM_PORTS);
      for (const i of order) {
        const q = curr[i];
        if (q.length === 0) continue;

        if (holEnabled) {
          // Bare hodet kan sendes
          const head = q[0];
          if (!outputBusy[head.dest]) {
            outputBusy[head.dest] = true;
            dispatchIdx[i] = 0;
            dispatched[i] = head;
          }
        } else {
          // VOQ: kan plukke første pakke i køen hvis dens output er ledig
          for (let p = 0; p < q.length; p++) {
            if (!outputBusy[q[p].dest]) {
              outputBusy[q[p].dest] = true;
              dispatchIdx[i] = p;
              dispatched[i] = q[p];
              break;
            }
          }
        }
      }

      // 2) Statistikk
      const sentNow = dispatched.filter(Boolean).length;
      const blockedNow = curr.filter((q, i) => q.length > 0 && dispatched[i] === null).length;
      setStats((s) => ({
        sent: s.sent + sentNow,
        ticks: s.ticks + 1,
        blocked: s.blocked + blockedNow,
      }));
      setLastDispatched(dispatched);

      // 3) Bygg nye køer
      const next: Packet[][] = curr.map((q, i) => {
        const idx = dispatchIdx[i];
        const after = idx === null ? q.slice() : [...q.slice(0, idx), ...q.slice(idx + 1)];
        // arrival
        if (Math.random() < arrivalRate && after.length < MAX_QUEUE) {
          after.push(newPkt());
        }
        return after;
      });
      return next;
    });
    setTick((t) => t + 1);
  }

  useEffect(() => {
    if (!running) return;
    const handle = setInterval(() => {
      if (!runRef.current) return;
      step();
    }, 600);
    return () => clearInterval(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, holEnabled]);

  function reset() {
    setRunning(false);
    setTick(0);
    setStats({ sent: 0, ticks: 0, blocked: 0 });
    setLastDispatched([null, null, null]);
    setQueues(Array.from({ length: NUM_PORTS }, () => [newPkt(), newPkt()] as Packet[]));
  }

  const throughputPct = useMemo(() => {
    if (stats.ticks === 0) return 0;
    return (stats.sent / (stats.ticks * NUM_PORTS)) * 100;
  }, [stats]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          3×3 crossbar · input queueing
        </div>
        <div className="flex gap-1.5 items-center">
          <label className="text-xs flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={holEnabled}
              onChange={(e) => setHolEnabled(e.target.checked)}
              className="accent-brand"
            />
            HOL-blocking <span className="text-muted-foreground">({holEnabled ? "FIFO" : "VOQ"})</span>
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_260px]">
        <div className="bg-background p-4">
          <svg viewBox="0 0 520 320" className="w-full h-auto" role="img" aria-label="HOL-blocking simulator">
            {/* Queues */}
            {queues.map((q, i) => (
              <g key={`q-${i}`}>
                <text x={10} y={64 + i * 90} className="fill-muted-foreground" fontSize={11} fontFamily="monospace">
                  in{i + 1}
                </text>
                {/* draw up to MAX_QUEUE slots */}
                {Array.from({ length: MAX_QUEUE }).map((_, slot) => {
                  const pkt = q[slot];
                  const x = 40 + slot * 30;
                  const y = 50 + i * 90;
                  if (!pkt) {
                    return (
                      <rect key={slot} x={x} y={y} width={26} height={26} rx={4}
                        className="fill-card stroke-border" strokeWidth={0.8} strokeDasharray="2 2" />
                    );
                  }
                  const c = COLORS[pkt.dest];
                  return (
                    <g key={slot}>
                      <rect x={x} y={y} width={26} height={26} rx={4}
                        fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
                      <text x={x + 13} y={y + 17} textAnchor="middle" fontSize={10}
                        fill={c.text} fontFamily="monospace">
                        {pkt.dest + 1}
                      </text>
                    </g>
                  );
                })}
                {/* Highlight HOL block: hvis det er pakker bak en blokkert head */}
                {holEnabled && q.length > 1 && lastDispatched[i] === null && (
                  <g>
                    <rect x={40} y={50 + i * 90} width={26} height={26}
                      className="fill-none stroke-amber-500" strokeWidth={2} strokeDasharray="3 2" />
                    <text x={40} y={50 + i * 90 - 4} className="fill-amber-600 dark:fill-amber-400" fontSize={9}>
                      blokkert
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Crossbar */}
            <g>
              <rect x={250} y={30} width={140} height={250} rx={8}
                className="fill-brand/5 stroke-brand/30" strokeWidth={1} />
              <text x={320} y={20} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>
                crossbar (3×3)
              </text>
              {[0, 1, 2].map((i) =>
                [0, 1, 2].map((j) => {
                  const dispatched = lastDispatched[i];
                  const active = dispatched !== null && dispatched.dest === j;
                  const cx = 280 + j * 40;
                  const cy = 64 + i * 90;
                  return (
                    <circle key={`cb-${i}-${j}`} cx={cx} cy={cy} r={6}
                      className={active ? "fill-brand stroke-brand" : "fill-card stroke-border"}
                      strokeWidth={1.2} />
                  );
                })
              )}
            </g>

            {/* Output ports */}
            {[0, 1, 2].map((j) => {
              const c = COLORS[j];
              const used = lastDispatched.some((d) => d?.dest === j);
              return (
                <g key={`out-${j}`}>
                  <rect x={420} y={40 + j * 90} width={84} height={48} rx={6}
                    fill={used ? c.fill : "transparent"}
                    stroke={c.stroke} strokeWidth={1.2} />
                  <text x={462} y={64 + j * 90} textAnchor="middle" fontSize={11}
                    fill={c.text} fontFamily="monospace" fontWeight={600}>
                    out{j + 1}
                  </text>
                  <text x={462} y={78 + j * 90} textAnchor="middle" fontSize={9}
                    className="fill-muted-foreground">
                    {used ? "→ sender" : "ledig"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Tick
            </div>
            <div className="text-2xl font-bold tabular-nums">{tick}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Throughput
            </div>
            <div className={`text-xl font-semibold tabular-nums ${
              throughputPct < 70 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {throughputPct.toFixed(1)}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Sendt {stats.sent} / {stats.ticks * NUM_PORTS} mulige slots.
              {stats.ticks > 20 && holEnabled && (
                <span> Karol: maks ~58,6%.</span>
              )}
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Blokkerte porter
            </div>
            <div className="text-sm">{stats.blocked} totalt</div>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand hover:bg-brand/90 text-brand-foreground text-xs font-medium px-3 py-2"
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? "Pause" : "Kjør"}
            </button>
            <button
              type="button"
              onClick={step}
              disabled={running}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card hover:border-brand/40 disabled:opacity-40 text-xs font-medium px-3 py-2"
            >
              1 tick
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
            <div className="font-semibold text-foreground">Tallene i pakkene</div>
            <p className="text-muted-foreground mt-0.5">
              viser ønsket ut-port (1, 2 eller 3). Konflikt = to input-køer vil til
              samme ut-port.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function shuffleIdx(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
