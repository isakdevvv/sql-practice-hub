// Side-ved-side-sammenligning: 5 pakker, samme input — fire scheduler-disipliner

type Pkt = { id: number; arrival: number; cls: 1 | 2; priority: 1 | 2 };

// Ankomster: 5 pakker. Klasse 1 har høyere prioritet i Priority-disiplinen.
// arrival-tider og klasser valgt så det er forskjell mellom alle fire utfall.
const PACKETS: Pkt[] = [
  { id: 1, arrival: 0, cls: 1, priority: 1 },
  { id: 2, arrival: 1, cls: 2, priority: 2 },
  { id: 3, arrival: 1, cls: 2, priority: 2 },
  { id: 4, arrival: 2, cls: 1, priority: 1 },
  { id: 5, arrival: 3, cls: 2, priority: 2 },
];

const SLOT_W = 56;
const ROW_H = 44;
const TOTAL_SLOTS = 8;

const CLS_COLOR: Record<1 | 2, { fill: string; stroke: string; text: string }> = {
  1: { fill: "#bfdbfe", stroke: "#3b82f6", text: "#1e3a8a" },
  2: { fill: "#fed7aa", stroke: "#f97316", text: "#7c2d12" },
};

function fifoSchedule(pkts: Pkt[]): (number | null)[] {
  const out: (number | null)[] = Array(TOTAL_SLOTS).fill(null);
  const queue: Pkt[] = [];
  let idx = 0;
  for (let t = 0; t < TOTAL_SLOTS; t++) {
    while (idx < pkts.length && pkts[idx].arrival <= t) {
      queue.push(pkts[idx++]);
    }
    if (queue.length > 0) out[t] = queue.shift()!.id;
  }
  return out;
}

function priorityScheduleNonPreemptive(pkts: Pkt[]): (number | null)[] {
  const out: (number | null)[] = Array(TOTAL_SLOTS).fill(null);
  const queue: Pkt[] = [];
  let idx = 0;
  for (let t = 0; t < TOTAL_SLOTS; t++) {
    while (idx < pkts.length && pkts[idx].arrival <= t) {
      queue.push(pkts[idx++]);
    }
    if (queue.length > 0) {
      // Velg laveste priority-tall (= høyest prioritet); innen samme prioritet, FIFO
      queue.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival || a.id - b.id);
      out[t] = queue.shift()!.id;
    }
  }
  return out;
}

function roundRobin(pkts: Pkt[]): (number | null)[] {
  const out: (number | null)[] = Array(TOTAL_SLOTS).fill(null);
  const q1: Pkt[] = [];
  const q2: Pkt[] = [];
  let idx = 0;
  let next: 1 | 2 = 1; // klasse som skal forsøkes neste
  for (let t = 0; t < TOTAL_SLOTS; t++) {
    while (idx < pkts.length && pkts[idx].arrival <= t) {
      const p = pkts[idx++];
      (p.cls === 1 ? q1 : q2).push(p);
    }
    // Forsøk neste, fall tilbake til andre
    let chosen: Pkt | null = null;
    if (next === 1) {
      if (q1.length) chosen = q1.shift()!;
      else if (q2.length) chosen = q2.shift()!;
    } else {
      if (q2.length) chosen = q2.shift()!;
      else if (q1.length) chosen = q1.shift()!;
    }
    if (chosen) {
      out[t] = chosen.id;
      next = next === 1 ? 2 : 1;
    }
  }
  return out;
}

// WFQ med vekter w1=3, w2=1: for hver fire pakker, 3 fra klasse 1, 1 fra klasse 2
function wfq(pkts: Pkt[]): (number | null)[] {
  const out: (number | null)[] = Array(TOTAL_SLOTS).fill(null);
  const q1: Pkt[] = [];
  const q2: Pkt[] = [];
  let idx = 0;
  // Bookkeeping: kvantum pr. tick — modellert som credits
  let credit1 = 0;
  let credit2 = 0;
  const W1 = 3,
    W2 = 1;
  for (let t = 0; t < TOTAL_SLOTS; t++) {
    while (idx < pkts.length && pkts[idx].arrival <= t) {
      const p = pkts[idx++];
      (p.cls === 1 ? q1 : q2).push(p);
    }
    credit1 += W1;
    credit2 += W2;
    let chosen: Pkt | null = null;
    // Velg klassen med høyest credit som har pakke
    if (q1.length && (credit1 / W1 >= credit2 / W2 || !q2.length)) {
      chosen = q1.shift()!;
      credit1 -= W1 + W2; // konsumer ett "round" verdt av kapasitet
    } else if (q2.length) {
      chosen = q2.shift()!;
      credit2 -= W1 + W2;
    }
    if (chosen) out[t] = chosen.id;
  }
  return out;
}

const DISCIPLINES: { id: string; label: string; sub: string; fn: (p: Pkt[]) => (number | null)[] }[] = [
  { id: "fifo", label: "FIFO", sub: "first in, first out", fn: fifoSchedule },
  { id: "priority", label: "Priority", sub: "klasse 1 prioriteres", fn: priorityScheduleNonPreemptive },
  { id: "rr", label: "Round Robin", sub: "alternerer klasse 1 og 2", fn: roundRobin },
  { id: "wfq", label: "WFQ (w1=3, w2=1)", sub: "klasse 1 får 3× kapasitet", fn: wfq },
];

export function SchedulerComparison() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          5 pakker, fire disipliner — samme input
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: CLS_COLOR[1].fill, border: `1px solid ${CLS_COLOR[1].stroke}` }} />
            Klasse 1 (høy prio)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: CLS_COLOR[2].fill, border: `1px solid ${CLS_COLOR[2].stroke}` }} />
            Klasse 2 (lav prio)
          </span>
        </div>
      </div>

      <div className="p-4 bg-background overflow-x-auto">
        <svg width={120 + (TOTAL_SLOTS + 1) * SLOT_W} height={(DISCIPLINES.length + 2) * ROW_H + 10}>
          {/* Tids-akse */}
          <text x={12} y={20} className="fill-muted-foreground" fontSize={11} fontFamily="monospace">
            tid →
          </text>
          {Array.from({ length: TOTAL_SLOTS + 1 }).map((_, t) => (
            <g key={`tick-${t}`}>
              <line
                x1={120 + t * SLOT_W}
                y1={26}
                x2={120 + t * SLOT_W}
                y2={(DISCIPLINES.length + 2) * ROW_H}
                className="stroke-border"
                strokeWidth={0.5}
                strokeDasharray="2 2"
              />
              <text x={120 + t * SLOT_W + SLOT_W / 2} y={20} textAnchor="middle"
                className="fill-muted-foreground" fontSize={10} fontFamily="monospace">
                {t}
              </text>
            </g>
          ))}

          {/* Arrivals row */}
          <g transform={`translate(0, ${ROW_H})`}>
            <text x={12} y={ROW_H / 2 + 4} className="fill-foreground" fontSize={11} fontWeight={600}>
              Ankomster
            </text>
            {PACKETS.map((p) => {
              const c = CLS_COLOR[p.cls];
              return (
                <g key={`arr-${p.id}`} transform={`translate(${120 + p.arrival * SLOT_W + 6}, 6)`}>
                  <rect width={SLOT_W - 12} height={ROW_H - 14} rx={6}
                    fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
                  <text x={(SLOT_W - 12) / 2} y={(ROW_H - 14) / 2 + 4} textAnchor="middle"
                    fontSize={12} fontWeight={700} fill={c.text} fontFamily="monospace">
                    {p.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* En rad pr. disiplin */}
          {DISCIPLINES.map((d, di) => {
            const result = d.fn(PACKETS);
            return (
              <g key={d.id} transform={`translate(0, ${ROW_H * (di + 2)})`}>
                <text x={12} y={ROW_H / 2} className="fill-foreground" fontSize={11} fontWeight={600}>
                  {d.label}
                </text>
                <text x={12} y={ROW_H / 2 + 12} className="fill-muted-foreground" fontSize={9}>
                  {d.sub}
                </text>
                {result.map((pid, t) => {
                  if (pid === null) {
                    return (
                      <rect key={`d-${t}`}
                        x={120 + t * SLOT_W + 6} y={6}
                        width={SLOT_W - 12} height={ROW_H - 14} rx={6}
                        className="fill-card stroke-border" strokeWidth={0.8} strokeDasharray="2 2" />
                    );
                  }
                  const p = PACKETS.find((pp) => pp.id === pid)!;
                  const c = CLS_COLOR[p.cls];
                  return (
                    <g key={`d-${t}`} transform={`translate(${120 + t * SLOT_W + 6}, 6)`}>
                      <rect width={SLOT_W - 12} height={ROW_H - 14} rx={6}
                        fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
                      <text x={(SLOT_W - 12) / 2} y={(ROW_H - 14) / 2 + 4} textAnchor="middle"
                        fontSize={12} fontWeight={700} fill={c.text} fontFamily="monospace">
                        {pid}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        Hver «slot» er én pakke-tid. Pakke 1 og 4 er klasse 1 (blå); pakke 2, 3 og 5 er klasse 2 (oransje).
        Legg merke til at <strong>FIFO</strong> sender i ankomst-rekkefølge,{" "}
        <strong>Priority</strong> hopper klasse 1 frem foran 2 og 3,
        <strong> Round Robin</strong> alternerer, og{" "}
        <strong>WFQ</strong> tjener klasse 1 oftere men gir klasse 2 sin garanterte andel.
      </div>
    </div>
  );
}
