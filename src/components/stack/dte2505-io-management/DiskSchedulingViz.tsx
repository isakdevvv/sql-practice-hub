import { useMemo, useState } from "react";

/**
 * Disk-scheduling-visualizer: FIFO / SSTF / SCAN (Elevator) / CFQ
 *
 * 5 forespørsler på ulike sylindere. For hver strategi:
 *  - Vis rekkefølgen requests betjenes i (1, 2, 3, 4, 5 numbered on path)
 *  - Tegn head-bevegelsen som en SVG-linje gjennom sylinder-aksen
 *  - Vis total head-bevegelse (seek-distance)
 *
 * CFQ: én kø per prosess (vi gir hver request en prosess-id), runder mellom dem.
 */

type Strategy = "FIFO" | "SSTF" | "SCAN" | "CFQ";

type Req = {
  id: string;
  cylinder: number;
  pid: number; // for CFQ
  kind: "read" | "write";
};

const MIN_CYL = 0;
const MAX_CYL = 199;
const HEAD_START = 53;

const REQS: Req[] = [
  { id: "r1", cylinder: 98, pid: 1, kind: "read" },
  { id: "r2", cylinder: 183, pid: 2, kind: "write" },
  { id: "r3", cylinder: 37, pid: 1, kind: "read" },
  { id: "r4", cylinder: 122, pid: 3, kind: "read" },
  { id: "r5", cylinder: 14, pid: 2, kind: "write" },
];

function scheduleFIFO(reqs: Req[]): Req[] {
  return [...reqs]; // i innkommende rekkefølge
}

function scheduleSSTF(reqs: Req[], head: number): Req[] {
  const remaining = [...reqs];
  const ordered: Req[] = [];
  let cur = head;
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Math.abs(remaining[0].cylinder - cur);
    for (let i = 1; i < remaining.length; i++) {
      const d = Math.abs(remaining[i].cylinder - cur);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    cur = remaining[bestIdx].cylinder;
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return ordered;
}

function scheduleSCAN(reqs: Req[], head: number): Req[] {
  // C-SCAN/elevator: head beveger seg opp først, så fra topp til bunn, tilbake til topp.
  // Vi gjør klassisk SCAN: opp til topp, så snu og ned til bunn.
  const ordered: Req[] = [];
  const above = reqs
    .filter((r) => r.cylinder >= head)
    .sort((a, b) => a.cylinder - b.cylinder);
  const below = reqs
    .filter((r) => r.cylinder < head)
    .sort((a, b) => b.cylinder - a.cylinder);
  ordered.push(...above, ...below);
  return ordered;
}

function scheduleCFQ(reqs: Req[]): Req[] {
  // Én kø per pid, round-robin én request fra hver kø av gangen,
  // i innkommende rekkefølge innenfor køen.
  const queues: Record<number, Req[]> = {};
  for (const r of reqs) {
    if (!queues[r.pid]) queues[r.pid] = [];
    queues[r.pid].push(r);
  }
  const pids = Object.keys(queues)
    .map(Number)
    .sort((a, b) => a - b);
  const ordered: Req[] = [];
  let remaining = reqs.length;
  while (remaining > 0) {
    for (const pid of pids) {
      const q = queues[pid];
      if (q.length > 0) {
        ordered.push(q.shift()!);
        remaining--;
      }
    }
  }
  return ordered;
}

function totalSeek(order: Req[], head: number): number {
  let cur = head;
  let total = 0;
  for (const r of order) {
    total += Math.abs(r.cylinder - cur);
    cur = r.cylinder;
  }
  return total;
}

const STRAT_INFO: Record<
  Strategy,
  { title: string; desc: string; warn?: string }
> = {
  FIFO: {
    title: "FIFO",
    desc: "Kommer-i-rekkefølge. Enkel, rettferdig, men kan ha veldig lang head-bevegelse.",
  },
  SSTF: {
    title: "SSTF (Shortest Seek Time First)",
    desc: "Velg alltid nærmeste forespørsel. Minimerer seek lokalt.",
    warn: "Kan utsulte requests langt unna (starvation).",
  },
  SCAN: {
    title: "SCAN (Elevator)",
    desc: "Head beveger seg en retning, betjener alle på veien, snur ved topp/bunn.",
  },
  CFQ: {
    title: "CFQ (Completely Fair Queueing)",
    desc: "Én kø per prosess. Round-robin én request fra hver kø. Rettferdig på tvers av prosesser.",
  },
};

const PID_COLOR: Record<number, string> = {
  1: "bg-rose-500",
  2: "bg-sky-500",
  3: "bg-emerald-500",
};

function ScheduleViz({
  strategy,
  order,
  head,
}: {
  strategy: Strategy;
  order: Req[];
  head: number;
}) {
  const total = totalSeek(order, head);
  const width = 520;
  const height = 180;
  const padX = 30;
  const innerWidth = width - 2 * padX;

  function x(cyl: number) {
    return padX + (cyl / MAX_CYL) * innerWidth;
  }

  // Path: head -> r1 -> r2 ...
  const ys = (i: number) => 28 + (i * (height - 60)) / (order.length + 1);
  const points = [
    { x: x(head), y: 18, label: `head=${head}` },
    ...order.map((r, i) => ({ x: x(r.cylinder), y: ys(i + 1), req: r })),
  ];

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-baseline justify-between mb-1 gap-2">
        <div>
          <div className="text-sm font-semibold">{STRAT_INFO[strategy].title}</div>
          <div className="text-[10.5px] text-muted-foreground">
            {STRAT_INFO[strategy].desc}
          </div>
        </div>
        <div className="text-xs font-mono px-2 py-0.5 rounded bg-muted">
          seek = {total}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${strategy} schedule visualization`}
      >
        {/* axis */}
        <line
          x1={padX}
          x2={width - padX}
          y1={10}
          y2={10}
          className="stroke-border"
          strokeWidth={1.5}
        />
        {[0, 50, 100, 150, 199].map((c) => (
          <g key={c}>
            <line
              x1={x(c)}
              x2={x(c)}
              y1={6}
              y2={14}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={x(c)}
              y={4}
              className="fill-muted-foreground text-[8px]"
              textAnchor="middle"
            >
              {c}
            </text>
          </g>
        ))}

        {/* path */}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          className="fill-none stroke-brand"
          strokeWidth={2}
        />

        {/* head start */}
        <circle cx={points[0].x} cy={points[0].y} r={5} className="fill-foreground" />
        <text
          x={points[0].x + 8}
          y={points[0].y + 3}
          className="fill-foreground text-[9px] font-mono"
        >
          head start = {head}
        </text>

        {/* request points */}
        {order.map((r, i) => {
          const px = x(r.cylinder);
          const py = ys(i + 1);
          const color =
            r.pid === 1
              ? "fill-rose-500"
              : r.pid === 2
                ? "fill-sky-500"
                : "fill-emerald-500";
          return (
            <g key={r.id}>
              <circle cx={px} cy={py} r={7} className={color} />
              <text
                x={px}
                y={py + 3}
                className="fill-white text-[9px] font-mono"
                textAnchor="middle"
              >
                {i + 1}
              </text>
              <text
                x={px + 12}
                y={py + 3}
                className="fill-foreground text-[9px] font-mono"
              >
                {r.id}={r.cylinder}
              </text>
            </g>
          );
        })}
      </svg>

      {STRAT_INFO[strategy].warn && (
        <div className="mt-1 text-[10.5px] text-amber-700 dark:text-amber-300">
          <strong>OBS:</strong> {STRAT_INFO[strategy].warn}
        </div>
      )}
    </div>
  );
}

export function DiskSchedulingViz() {
  const [activeStrategies, setActiveStrategies] = useState<Strategy[]>([
    "FIFO",
    "SSTF",
    "SCAN",
    "CFQ",
  ]);

  const schedules = useMemo(
    () => ({
      FIFO: scheduleFIFO(REQS),
      SSTF: scheduleSSTF(REQS, HEAD_START),
      SCAN: scheduleSCAN(REQS, HEAD_START),
      CFQ: scheduleCFQ(REQS),
    }),
    [],
  );

  const totals = {
    FIFO: totalSeek(schedules.FIFO, HEAD_START),
    SSTF: totalSeek(schedules.SSTF, HEAD_START),
    SCAN: totalSeek(schedules.SCAN, HEAD_START),
    CFQ: totalSeek(schedules.CFQ, HEAD_START),
  };
  const minTotal = Math.min(...Object.values(totals));

  function toggleStrategy(s: Strategy) {
    setActiveStrategies((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          5 requests · head starter på {HEAD_START} · totalt sylindere{" "}
          {MIN_CYL}–{MAX_CYL}
        </div>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(STRAT_INFO) as Strategy[]).map((s) => {
            const on = activeStrategies.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStrategy(s)}
                className={`text-xs px-2 py-1 rounded border ${
                  on
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Request list with pid colors */}
      <div className="rounded-lg border border-border bg-background p-3 mb-3">
        <div className="text-[11px] text-muted-foreground mb-1.5">
          Innkommende forespørsler (i ankomstrekkefølge)
        </div>
        <div className="flex flex-wrap gap-2">
          {REQS.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 text-[11px] font-mono"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${PID_COLOR[r.pid]}`}
              />
              <span className="font-semibold">{r.id}</span>
              <span className="text-muted-foreground">cyl={r.cylinder}</span>
              <span className="text-muted-foreground">pid={r.pid}</span>
              <span
                className={`text-[10px] px-1 rounded ${
                  r.kind === "read"
                    ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }`}
              >
                {r.kind}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {activeStrategies.map((s) => (
          <ScheduleViz
            key={s}
            strategy={s}
            order={schedules[s]}
            head={HEAD_START}
          />
        ))}
      </div>

      {/* Comparison bars */}
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-[11px] text-muted-foreground mb-2">
          Total head-bevegelse — kortere er bedre
        </div>
        <div className="space-y-1.5">
          {(["FIFO", "SSTF", "SCAN", "CFQ"] as Strategy[]).map((s) => {
            const t = totals[s];
            const pct = (t / Math.max(...Object.values(totals))) * 100;
            const isBest = t === minTotal;
            return (
              <div key={s} className="flex items-center gap-2 text-xs">
                <div className="w-12 font-mono">{s}</div>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div
                    className={`h-full ${
                      isBest ? "bg-emerald-500" : "bg-brand/70"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-12 text-right font-mono">{t}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        <strong>Eksamen-feller:</strong> SSTF har lavest seek lokalt, men ofrer
        rettferdighet — én prosess som bor langt unna kan vente evig.{" "}
        <strong>SCAN/C-SCAN</strong> brukes i mange RAID-controllere fordi
        bevegelsen er forutsigbar. <strong>CFQ</strong> var Linux-default
        2007–2018; nå brukes BFQ (BFQ er CFQ + budsjett-modell) eller none/Kyber
        for SSD/NVMe der seek er gratis.
      </div>
    </div>
  );
}
