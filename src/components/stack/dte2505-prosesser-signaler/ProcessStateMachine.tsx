import { useEffect, useMemo, useRef, useState } from "react";

// Six-state process lifecycle: NEW, READY, RUNNING, BLOCKED, TERMINATED, ZOMBIE.
// User clicks event-buttons to drive transitions; we animate the active node
// pulsing and the chosen edge highlighting.

type StateId = "NEW" | "READY" | "RUNNING" | "BLOCKED" | "TERMINATED" | "ZOMBIE";

type Event = {
  id: string;
  label: string;
  from: StateId;
  to: StateId;
  description: string;
};

const EVENTS: Event[] = [
  { id: "admit", label: "admit", from: "NEW", to: "READY", description: "OS-scheduler aksepterer prosessen. fork() ferdig — PCB allokert." },
  { id: "dispatch", label: "dispatch (CPU)", from: "READY", to: "RUNNING", description: "Scheduler velger denne prosessen og setter CPU-tilstanden fra PCB." },
  { id: "timer", label: "timer interrupt", from: "RUNNING", to: "READY", description: "Time-slice utløpt. Scheduler tar CPU og legger prosessen tilbake i ready-køen." },
  { id: "yield", label: "yield()", from: "RUNNING", to: "READY", description: "Prosessen gir frivillig fra seg CPU. PCB lagres, scheduler kalles." },
  { id: "iowait", label: "I/O syscall", from: "RUNNING", to: "BLOCKED", description: "read() / wait4() / sleep() — prosessen kan ikke fortsette før kernel-hendelsen er klar." },
  { id: "iodone", label: "I/O complete", from: "BLOCKED", to: "READY", description: "Disken/nettet er klar, eller signal kom. Kernel flytter prosessen til ready-køen." },
  { id: "exit", label: "exit()", from: "RUNNING", to: "ZOMBIE", description: "Prosessen kalte exit(). PCB beholdes til parent leser exit-koden." },
  { id: "reaped", label: "wait() reaper", from: "ZOMBIE", to: "TERMINATED", description: "Parent kalte wait()/waitpid(). PID frigjøres, PCB fjernes." },
  { id: "kill", label: "SIGKILL", from: "RUNNING", to: "ZOMBIE", description: "Kernel dreper prosessen umiddelbart. Ingen rydding — går rett til zombie." },
];

const STATE_POS: Record<StateId, { x: number; y: number }> = {
  NEW: { x: 80, y: 70 },
  READY: { x: 250, y: 70 },
  RUNNING: { x: 420, y: 70 },
  BLOCKED: { x: 250, y: 220 },
  ZOMBIE: { x: 420, y: 220 },
  TERMINATED: { x: 590, y: 220 },
};

const STATE_DESC: Record<StateId, { name: string; color: string; ring: string }> = {
  NEW: { name: "Nyopprettet", color: "#94a3b8", ring: "#64748b" },
  READY: { name: "Klar — venter på CPU", color: "#3b82f6", ring: "#1d4ed8" },
  RUNNING: { name: "Kjører nå på CPU", color: "#10b981", ring: "#047857" },
  BLOCKED: { name: "Venter på I/O / event", color: "#f59e0b", ring: "#b45309" },
  ZOMBIE: { name: "Død, men ikke ryddet", color: "#a855f7", ring: "#7e22ce" },
  TERMINATED: { name: "Borte — PID frigjort", color: "#6b7280", ring: "#374151" },
};

type Proc = {
  pid: number;
  state: StateId;
  pc: number; // pretend program counter
};

const INITIAL_PROC: Proc = { pid: 4711, state: "NEW", pc: 0x401000 };

export function ProcessStateMachine() {
  const [proc, setProc] = useState<Proc>(INITIAL_PROC);
  const [history, setHistory] = useState<{ event: string; from: StateId; to: StateId }[]>([]);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
  const [pulse, setPulse] = useState<StateId | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const validEvents = useMemo(
    () => EVENTS.filter((e) => e.from === proc.state),
    [proc.state],
  );

  function fireEvent(e: Event) {
    setActiveEdge(e.id);
    setPulse(e.to);
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setActiveEdge(null);
      timeoutRef.current = null;
    }, 1100);
    setProc((p) => ({
      ...p,
      state: e.to,
      pc: e.to === "RUNNING" ? p.pc + 0x14 : p.pc,
    }));
    setHistory((h) => [...h, { event: e.label, from: e.from, to: e.to }].slice(-8));
  }

  function reset() {
    setProc(INITIAL_PROC);
    setHistory([]);
    setActiveEdge(null);
    setPulse(null);
  }

  // Helper for SVG arrow path between two state nodes — slight bend so opposite
  // direction edges don't overlap.
  function arrowPath(from: StateId, to: StateId, bend: number = 0): string {
    const a = STATE_POS[from];
    const b = STATE_POS[to];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const mx = (a.x + b.x) / 2 + (-dy / 8) * bend;
    const my = (a.y + b.y) / 2 + (dx / 8) * bend;
    // Trim ends so the arrow doesn't go inside the node.
    const r = 38;
    const lenStart = Math.hypot(mx - a.x, my - a.y);
    const lenEnd = Math.hypot(b.x - mx, b.y - my);
    const sx = a.x + ((mx - a.x) * r) / Math.max(lenStart, 1);
    const sy = a.y + ((my - a.y) * r) / Math.max(lenStart, 1);
    const ex = b.x - ((b.x - mx) * r) / Math.max(lenEnd, 1);
    const ey = b.y - ((b.y - my) * r) / Math.max(lenEnd, 1);
    return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
  }

  // Bend per edge so reverse pairs don't overlap.
  const edgeBends: Record<string, number> = {
    admit: 0,
    dispatch: -0.6,
    timer: 0.6,
    yield: 1.2,
    iowait: -0.6,
    iodone: 0.6,
    exit: -0.4,
    reaped: 0,
    kill: 0.8,
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Prosess-livssyklus — klikk en hendelse
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 text-muted-foreground hover:border-brand/40"
        >
          Reset
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_260px]">
        <div className="p-3 bg-background">
          <svg
            viewBox="0 0 680 300"
            className="w-full h-auto"
            role="img"
            aria-label="Tilstandsdiagram for prosess-livssyklus"
          >
            <defs>
              <marker
                id="psm-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" opacity={0.55} />
              </marker>
              <marker
                id="psm-arrow-active"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Edges */}
            {EVENTS.map((e) => {
              const isActive = activeEdge === e.id;
              const d = arrowPath(e.from, e.to, edgeBends[e.id] ?? 0);
              return (
                <g key={e.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={isActive ? "#10b981" : "currentColor"}
                    strokeOpacity={isActive ? 1 : 0.3}
                    strokeWidth={isActive ? 2.5 : 1}
                    markerEnd={`url(#${isActive ? "psm-arrow-active" : "psm-arrow"})`}
                    style={{ transition: "stroke 0.2s, stroke-opacity 0.2s, stroke-width 0.2s" }}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {(Object.keys(STATE_POS) as StateId[]).map((s) => {
              const p = STATE_POS[s];
              const info = STATE_DESC[s];
              const isCurrent = proc.state === s;
              const isPulsing = pulse === s && isCurrent;
              return (
                <g key={s}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={36}
                    fill={isCurrent ? info.color : "transparent"}
                    fillOpacity={isCurrent ? 0.18 : 0}
                    stroke={isCurrent ? info.ring : info.color}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    strokeOpacity={isCurrent ? 1 : 0.45}
                  >
                    {isPulsing ? (
                      <animate
                        attributeName="r"
                        values="36;42;36"
                        dur="0.8s"
                        repeatCount="2"
                      />
                    ) : null}
                  </circle>
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    className="text-[11px] font-mono font-semibold"
                    style={{ fill: isCurrent ? info.ring : "currentColor", opacity: isCurrent ? 1 : 0.75 }}
                  >
                    {s}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Tilgjengelige hendelser fra {proc.state}
            </div>
            {validEvents.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                Ingen flere overganger. Prosessen er ferdig — trykk Reset.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {validEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => fireEvent(e)}
                    className="text-xs rounded-md border border-brand/40 bg-brand/5 px-2.5 py-1.5 text-brand hover:bg-brand/15"
                    title={e.description}
                  >
                    {e.label}{" "}
                    <span className="text-muted-foreground font-mono">→ {e.to}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-xs space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              PCB (Process Control Block)
            </div>
            <table className="w-full text-xs font-mono">
              <tbody>
                <tr>
                  <td className="py-0.5 text-muted-foreground">PID</td>
                  <td className="py-0.5 text-right">{proc.pid}</td>
                </tr>
                <tr>
                  <td className="py-0.5 text-muted-foreground">State</td>
                  <td className="py-0.5 text-right" style={{ color: STATE_DESC[proc.state].ring }}>
                    {proc.state}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 text-muted-foreground">PC</td>
                  <td className="py-0.5 text-right">0x{proc.pc.toString(16)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 rounded-md border border-border bg-muted/20 p-2 text-[11px] leading-relaxed text-foreground">
              {STATE_DESC[proc.state].name}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Historikk
            </div>
            {history.length === 0 ? (
              <div className="text-muted-foreground">(ingen overganger ennå)</div>
            ) : (
              <ul className="space-y-0.5 font-mono text-[11px]">
                {history.map((h, i) => (
                  <li key={i}>
                    {h.from} <span className="text-brand">→</span> {h.to}{" "}
                    <span className="text-muted-foreground">({h.event})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-[11px] leading-relaxed">
            <span className="font-semibold">Tips:</span> Klassisk «context switch»
            er en RUNNING <span className="font-mono">→</span> READY{" "}
            <span className="font-mono">→</span> RUNNING-tur, der kernelen sparer
            PCB og laster en annens før den dispatcher.
          </div>
        </aside>
      </div>
    </div>
  );
}
