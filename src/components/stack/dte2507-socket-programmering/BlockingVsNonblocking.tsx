import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// BlockingVsNonblocking — to tråder side-ved-side gjør samme jobb:
//   - Tråd A: recv() i blocking mode  → tråden blokkerer til data ankommer
//   - Tråd B: recv() i non-blocking   → returnerer EAGAIN/EWOULDBLOCK,
//                                       tråden kan gjøre annet arbeid
// Vi viser tråd-tilstand (kjører/blokkert/working) og en data-strøm som
// drypper inn med uregelmessige mellomrom.

type ThreadState = "running" | "blocked" | "received" | "working" | "polling";

interface ThreadEvent {
  tick: number;
  state: ThreadState;
  note: string;
}

const W = 540;
const H = 360;
const TIMELINE_LEFT = 110;
const TIMELINE_RIGHT = W - 20;
const N_TICKS = 60;

// Data ankommer ved tick 12, 30, 48
const DATA_ARRIVALS = [12, 30, 48];

export function BlockingVsNonblocking() {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (tRef.current !== null) window.clearInterval(tRef.current);
      tRef.current = null;
      return;
    }
    tRef.current = window.setInterval(() => {
      setTick((t) => {
        if (t >= N_TICKS) {
          setRunning(false);
          return t;
        }
        return t + 1;
      });
    }, 130);
    return () => {
      if (tRef.current !== null) window.clearInterval(tRef.current);
    };
  }, [running]);

  // Bygg event-tidslinjene
  const blockingEvents: ThreadEvent[] = [];
  const nonblockingEvents: ThreadEvent[] = [];
  let blockedSince = 0;
  let dataIdx = 0;

  for (let t = 0; t <= tick; t++) {
    const dataReady = DATA_ARRIVALS.indexOf(t) !== -1;

    // BLOCKING THREAD
    if (t === 0) {
      blockingEvents.push({ tick: t, state: "running", note: "kall recv()" });
    } else if (DATA_ARRIVALS.includes(t)) {
      blockingEvents.push({ tick: t, state: "received", note: `got bytes (${t - blockedSince}t blokkert)` });
      blockedSince = t + 1;
    } else {
      blockingEvents.push({ tick: t, state: "blocked", note: "sleeping in kernel" });
    }

    // NON-BLOCKING THREAD: polls every tick, does background work between
    if (dataReady) {
      nonblockingEvents.push({ tick: t, state: "received", note: "recv() → bytes" });
    } else if (t % 4 === 0) {
      nonblockingEvents.push({ tick: t, state: "polling", note: "recv() → EAGAIN" });
    } else {
      nonblockingEvents.push({ tick: t, state: "working", note: "annet arbeid (UI, animasjon)" });
    }

    if (dataReady) dataIdx++;
  }

  function reset() {
    setRunning(false);
    setTick(0);
  }

  const blockingWasted = blockingEvents.filter((e) => e.state === "blocked").length;
  const nonblockingProductive = nonblockingEvents.filter((e) => e.state === "working").length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => {
            if (tick >= N_TICKS) setTick(0);
            setRunning((r) => !r);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Pause" : "Kjør"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <div className="ml-auto text-muted-foreground font-mono">
          tick {tick}/{N_TICKS}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {/* X-axis ticks (data arrivals) */}
          {DATA_ARRIVALS.map((d) => (
            <g key={d}>
              <line
                x1={tickToX(d)}
                x2={tickToX(d)}
                y1={40}
                y2={H - 80}
                stroke="rgb(56,189,248)"
                strokeOpacity={0.25}
                strokeDasharray="2 3"
              />
              <text x={tickToX(d)} y={35} textAnchor="middle" fontSize={9} fill="rgb(56,189,248)">
                data t={d}
              </text>
            </g>
          ))}

          {/* Current tick cursor */}
          {tick > 0 && tick <= N_TICKS && (
            <line x1={tickToX(tick)} x2={tickToX(tick)} y1={40} y2={H - 80} stroke="currentColor" strokeOpacity={0.4} />
          )}

          {/* Blocking thread row */}
          <ThreadRow
            y={90}
            label="recv() blocking"
            sublabel="(default)"
            events={blockingEvents}
          />

          {/* Non-blocking thread row */}
          <ThreadRow
            y={170}
            label="recv() non-blocking"
            sublabel="sock.setblocking(False)"
            events={nonblockingEvents}
          />

          {/* Latest note for blocking */}
          <text x={TIMELINE_LEFT} y={140} fontSize={10} className="fill-muted-foreground">
            {blockingEvents[blockingEvents.length - 1]?.note ?? ""}
          </text>
          <text x={TIMELINE_LEFT} y={220} fontSize={10} className="fill-muted-foreground">
            {nonblockingEvents[nonblockingEvents.length - 1]?.note ?? ""}
          </text>

          {/* Tally box */}
          <rect x={20} y={H - 70} width={W - 40} height={60} rx={6} fill="currentColor" fillOpacity={0.04} />
          <text x={30} y={H - 52} fontSize={11} fontWeight={600} className="fill-foreground">
            Hva tråden gjør mens den venter
          </text>
          <text x={30} y={H - 36} fontSize={10} className="fill-amber-500">
            Blocking: {blockingWasted} av {tick} ticks bortkastet (tråden er parkert)
          </text>
          <text x={30} y={H - 22} fontSize={10} className="fill-green-500">
            Non-blocking: {nonblockingProductive} ticks brukt til annet arbeid mellom poll-ene
          </text>
        </svg>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2">
          <div className="font-semibold mb-1">Blocking — det enkle</div>
          <p className="text-muted-foreground leading-snug">
            <code>sock.recv(4096)</code> kaller en syscall som ikke returnerer før kernel har
            data å gi. Tråden står i kø — bra hvis du har én tråd per tilkobling.
          </p>
        </div>
        <div className="rounded-md border border-green-500/30 bg-green-500/5 p-2">
          <div className="font-semibold mb-1">Non-blocking — eventloop-mat</div>
          <p className="text-muted-foreground leading-snug">
            Etter <code>setblocking(False)</code> kaster <code>recv()</code>{" "}
            <code>BlockingIOError</code> (errno EAGAIN) når intet venter. Du polle eller —
            bedre — bruker <code>select()</code> / <code>epoll</code> / asyncio.
          </p>
        </div>
      </div>
    </div>
  );
}

function tickToX(t: number) {
  return TIMELINE_LEFT + (t / N_TICKS) * (TIMELINE_RIGHT - TIMELINE_LEFT);
}

function ThreadRow({
  y,
  label,
  sublabel,
  events,
}: {
  y: number;
  label: string;
  sublabel: string;
  events: ThreadEvent[];
}) {
  return (
    <g>
      <text x={20} y={y + 4} fontSize={11} fontWeight={600} className="fill-foreground">
        {label}
      </text>
      <text x={20} y={y + 16} fontSize={8} className="fill-muted-foreground">
        {sublabel}
      </text>
      {/* Background lane */}
      <rect
        x={TIMELINE_LEFT}
        y={y - 10}
        width={TIMELINE_RIGHT - TIMELINE_LEFT}
        height={20}
        rx={3}
        fill="currentColor"
        fillOpacity={0.05}
      />
      {events.map((e, i) => {
        const next = events[i + 1];
        const x1 = tickToX(e.tick);
        const x2 = next ? tickToX(next.tick) : x1 + 8;
        const color = stateColor(e.state);
        return (
          <g key={i}>
            <rect x={x1} y={y - 8} width={Math.max(2, x2 - x1)} height={16} fill={color} fillOpacity={0.65} />
            {e.state === "received" && (
              <circle cx={x1 + 3} cy={y} r={3} fill="rgb(34,197,94)" />
            )}
          </g>
        );
      })}
    </g>
  );
}

function stateColor(s: ThreadState): string {
  switch (s) {
    case "running":
      return "rgb(56,189,248)";
    case "blocked":
      return "rgb(234,179,8)";
    case "received":
      return "rgb(34,197,94)";
    case "working":
      return "rgb(34,197,94)";
    case "polling":
      return "rgb(244,114,182)";
  }
}
