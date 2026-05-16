import { useEffect, useMemo, useRef, useState } from "react";
import {
  RotateCcw,
  Cake,
  GitFork,
  Mail,
  Pipette,
  Skull,
} from "lucide-react";

// ---------------------------------------------------------------------------
// ProcessVisualizer — fem moduser som lærer UNIX-prosessmodellen.
//   1. state    → seks-tilstands-livssyklus (NEW/READY/RUNNING/BLOCKED/ZOMBIE/TERMINATED)
//   2. fork     → fork() / exec() / wait() — parent vs child, exec bytter "oppskrift"
//   3. signals  → tre kjørende prosesser; bruker sender SIGTERM/KILL/STOP/CONT/INT
//   4. pipe     → parent | child — bytes går via pipe, dup2 binder fd 1 → fd 0
//   5. zombie   → zombie (parent glemmer wait) og orphan (parent dør, init adopterer)
//
// Gjennomgående metafor: en prosess er en oppskrift som blir til en kake.
//   fork() = kopier oppskriften så det blir to identiske kaker i ovnen.
//   exec() = bytter oppskriften midt i — kaka blir noe helt annet.
//   wait() = baker venter på at kaka skal bli ferdig før hen rydder kjøkkenet.
// Den dukker opp i UI-tekst, ikoner og fortelling — ikke som dekorasjon.
// ---------------------------------------------------------------------------

type Mode = "state" | "fork" | "signals" | "pipe" | "zombie";

const MODES: { id: Mode; label: string; sub: string; Icon: typeof Cake }[] = [
  { id: "state", label: "Tilstandsmaskin", sub: "NEW → READY → RUNNING → ...", Icon: Cake },
  { id: "fork", label: "fork / exec / wait", sub: "kopier og bytt oppskrift", Icon: GitFork },
  { id: "signals", label: "Signaler", sub: "SIGTERM, SIGKILL, SIGSTOP ...", Icon: Mail },
  { id: "pipe", label: "Pipe", sub: "parent | child via fd", Icon: Pipette },
  { id: "zombie", label: "Zombie / orphan", sub: "wait() eller init rydder", Icon: Skull },
];

// =============================================================================
//                         FELLES TILSTANDS-FARGER
// =============================================================================

type StateId = "NEW" | "READY" | "RUNNING" | "BLOCKED" | "ZOMBIE" | "TERMINATED" | "STOPPED";

const STATE_STYLE: Record<StateId, { name: string; fill: string; ring: string; text: string }> = {
  NEW: { name: "NEW", fill: "#cbd5e1", ring: "#64748b", text: "Nyopprettet" },
  READY: { name: "READY", fill: "#bfdbfe", ring: "#1d4ed8", text: "Venter på CPU" },
  RUNNING: { name: "RUNNING", fill: "#bbf7d0", ring: "#047857", text: "Kjører på CPU" },
  BLOCKED: { name: "BLOCKED", fill: "#fed7aa", ring: "#b45309", text: "Venter på I/O" },
  STOPPED: { name: "STOPPED", fill: "#fde68a", ring: "#a16207", text: "Pauset (SIGSTOP)" },
  ZOMBIE: { name: "ZOMBIE", fill: "#e9d5ff", ring: "#7e22ce", text: "Død, ikke ryddet" },
  TERMINATED: { name: "TERMINATED", fill: "#e5e7eb", ring: "#374151", text: "PID frigitt" },
};

type LogEntry = { time: number; msg: string };

function nowLog(setLog: React.Dispatch<React.SetStateAction<LogEntry[]>>) {
  return (msg: string) =>
    setLog((l) => [{ time: Date.now(), msg }, ...l].slice(0, 8));
}

// =============================================================================
//                            MAIN COMPONENT
// =============================================================================

export function ProcessVisualizer() {
  const [mode, setMode] = useState<Mode>("state");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Prosesser og signaler">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Prosess-livssyklus — fork, exec, wait, signaler
            </div>
          </div>
          <div className="text-xs text-muted-foreground italic">
            Tenk på prosessen som en oppskrift som blir til en kake.
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.Icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  mode === m.id
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:bg-muted"
                }`}
                title={m.sub}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-background">
        {mode === "state" && <StateView />}
        {mode === "fork" && <ForkView />}
        {mode === "signals" && <SignalsView />}
        {mode === "pipe" && <PipeView />}
        {mode === "zombie" && <ZombieView />}
      </div>
    </div>
  );
}

// =============================================================================
//                          MODE 1: STATE MACHINE
// =============================================================================

type StateEvent = {
  id: string;
  label: string;
  from: StateId;
  to: StateId;
  hint: string;
};

const STATE_EVENTS: StateEvent[] = [
  { id: "admit", label: "fork() — admit", from: "NEW", to: "READY", hint: "fork() klonet oppskriften, scheduler aksepterer kaka." },
  { id: "dispatch", label: "dispatch", from: "READY", to: "RUNNING", hint: "Scheduler valgte denne prosessen. CPU laster PCB-en." },
  { id: "timer", label: "timer-interrupt", from: "RUNNING", to: "READY", hint: "Time-slice utløp. Scheduler tar kaka ut av ovnen et øyeblikk." },
  { id: "iowait", label: "I/O wait (read)", from: "RUNNING", to: "BLOCKED", hint: "read() / wait() / sleep() — kaka må vente på ingrediens." },
  { id: "iodone", label: "I/O ferdig", from: "BLOCKED", to: "READY", hint: "Ingrediensen er klar. Kaka går tilbake i ready-køen." },
  { id: "exit", label: "exit()", from: "RUNNING", to: "ZOMBIE", hint: "Kaka er ferdig stekt. Vi venter på at bakeren skal hente den." },
  { id: "kill", label: "SIGKILL", from: "RUNNING", to: "ZOMBIE", hint: "Kernel kastet kaka rett i søpla — ingen rydding." },
  { id: "reap", label: "parent wait()", from: "ZOMBIE", to: "TERMINATED", hint: "Bakeren hentet kaka. PID-en frigis." },
];

const STATE_POS: Record<StateId, { x: number; y: number } | undefined> = {
  NEW: { x: 70, y: 70 },
  READY: { x: 240, y: 70 },
  RUNNING: { x: 410, y: 70 },
  BLOCKED: { x: 240, y: 200 },
  STOPPED: undefined,
  ZOMBIE: { x: 410, y: 200 },
  TERMINATED: { x: 570, y: 200 },
};

function StateView() {
  const [state, setState] = useState<StateId>("NEW");
  const [pc, setPc] = useState(0x401000);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
  const [pulse, setPulse] = useState<StateId | null>(null);
  const timer = useRef<number | null>(null);
  const pushLog = nowLog(setLog);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const validEvents = useMemo(
    () => STATE_EVENTS.filter((e) => e.from === state),
    [state],
  );

  function fire(e: StateEvent) {
    setActiveEdge(e.id);
    setPulse(e.to);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setState(e.to);
      setPc((p) => p + 4);
      pushLog(`PID 4711: ${e.label} → ${e.to}`);
      setActiveEdge(null);
      setTimeout(() => setPulse(null), 350);
    }, 250);
  }

  function reset() {
    setState("NEW");
    setPc(0x401000);
    setLog([]);
    setActiveEdge(null);
    setPulse(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl border border-border bg-background p-3">
        <svg viewBox="0 0 660 270" className="w-full h-auto">
          {/* edges */}
          {STATE_EVENTS.map((e) => {
            const from = STATE_POS[e.from];
            const to = STATE_POS[e.to];
            if (!from || !to) return null;
            const active = activeEdge === e.id;
            return (
              <EdgeArrow
                key={e.id}
                fromX={from.x}
                fromY={from.y}
                toX={to.x}
                toY={to.y}
                label={e.label}
                active={active}
              />
            );
          })}
          {/* nodes */}
          {(Object.keys(STATE_POS) as StateId[]).map((sid) => {
            const pos = STATE_POS[sid];
            if (!pos) return null;
            const isCur = sid === state;
            const isPulse = pulse === sid;
            const st = STATE_STYLE[sid];
            return (
              <g key={sid} transform={`translate(${pos.x},${pos.y})`}>
                <rect
                  x={-58}
                  y={-22}
                  width={116}
                  height={44}
                  rx={10}
                  fill={st.fill}
                  stroke={isCur ? st.ring : "#94a3b8"}
                  strokeWidth={isCur ? 3 : 1.5}
                  className={isPulse ? "process-pulse" : ""}
                />
                <text
                  textAnchor="middle"
                  y={-4}
                  className="text-[12px] font-mono font-semibold"
                  fill="#0f172a"
                >
                  {st.name}
                </text>
                <text
                  textAnchor="middle"
                  y={12}
                  className="text-[9px]"
                  fill="#475569"
                >
                  {st.text}
                </text>
              </g>
            );
          })}
        </svg>
        <style>{`
          .process-pulse { animation: procpulse 0.5s ease-out; }
          @keyframes procpulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            PCB (Process Control Block)
          </div>
          <div className="font-mono text-xs space-y-0.5">
            <div>PID = <span className="text-brand">4711</span></div>
            <div>state = <span className="font-semibold" style={{ color: STATE_STYLE[state].ring }}>{state}</span></div>
            <div>PC = 0x{pc.toString(16)}</div>
            <div className="text-muted-foreground">// kaka i ovnen: {STATE_STYLE[state].text}</div>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Hendelser fra {state}
          </div>
          <div className="flex flex-col gap-1.5">
            {validEvents.length === 0 ? (
              <div className="text-xs text-muted-foreground italic px-2">
                Ingen overganger fra denne tilstanden. Reset for å starte på nytt.
              </div>
            ) : (
              validEvents.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => fire(e)}
                  className="text-left px-2.5 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs"
                  title={e.hint}
                >
                  <div className="font-mono font-semibold">{e.label}</div>
                  <div className="text-[10px] text-muted-foreground">{e.hint}</div>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        <LogBox log={log} />
      </div>
    </div>
  );
}

// Pile-tegning brukt av flere views
function EdgeArrow({
  fromX, fromY, toX, toY, label, active, dashed,
}: { fromX: number; fromY: number; toX: number; toY: number; label?: string; active?: boolean; dashed?: boolean }) {
  // Trim endpoints inn mot kanten av nodene
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const pad = 60; // halv bredde av rect (116/2)
  const padY = 25;
  const sx = fromX + ux * pad;
  const sy = fromY + uy * padY;
  const ex = toX - ux * pad;
  const ey = toY - uy * padY;

  const color = active ? "#1d4ed8" : "#94a3b8";
  const width = active ? 2.4 : 1.4;

  // midpunkt for label
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2 - 5;

  const markerId = `arrow-${active ? "a" : "i"}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line
        x1={sx}
        y1={sy}
        x2={ex}
        y2={ey}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dashed ? "4 3" : undefined}
        markerEnd={`url(#${markerId})`}
      />
      {label && (
        <text
          x={mx}
          y={my}
          textAnchor="middle"
          className="text-[9px] font-mono"
          fill={active ? "#1d4ed8" : "#64748b"}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function LogBox({ log }: { log: LogEntry[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        Hendelseslogg
      </div>
      {log.length === 0 ? (
        <div className="text-xs text-muted-foreground italic">Ingen hendelser ennå.</div>
      ) : (
        <ul className="space-y-0.5 font-mono text-[11px] max-h-32 overflow-auto">
          {log.map((l, i) => (
            <li key={`${l.time}-${i}`} className="text-foreground/80">
              {l.msg}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =============================================================================
//                       MODE 2: fork / exec / wait
// =============================================================================

type ForkProc = {
  pid: number;
  parent: number | null;
  program: string;
  state: StateId;
  isParent: boolean;
};

const FORK_INITIAL: ForkProc[] = [
  { pid: 1000, parent: null, program: "shell.c", state: "RUNNING", isParent: true },
];

function ForkView() {
  const [procs, setProcs] = useState<ForkProc[]>(FORK_INITIAL);
  const [stepIdx, setStepIdx] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const pidRef = useRef(1001);
  const pushLog = nowLog(setLog);

  const STEPS: { label: string; code: string; explain: string; action: () => void }[] = [
    {
      label: "1. fork()",
      code: "pid_t pid = fork();",
      explain: "Bakeren tar oppskriften og lager en identisk kopi. Begge prosesser har samme kode, men returverdien skiller dem: parent får child-PID, child får 0.",
      action: () => {
        const child = pidRef.current++;
        setProcs((p) => [
          ...p.map((x) => x.pid === 1000 ? { ...x, state: "RUNNING" as StateId } : x),
          { pid: child, parent: 1000, program: "shell.c", state: "READY", isParent: false },
        ]);
        pushLog(`fork() → PID ${child}. To identiske prosesser med samme kode-segment.`);
      },
    },
    {
      label: "2. child exec()",
      code: 'execvp("/bin/ls", argv);',
      explain: "Child bytter oppskrift — kode, data og heap erstattes av ls. PID-en beholdes, men prosessen er nå et helt annet program.",
      action: () => {
        setProcs((p) => p.map((x) => x.pid === 1001 ? { ...x, program: "ls", state: "RUNNING" } : x));
        pushLog(`exec(): PID 1001 byttet kode-segment fra shell.c → /bin/ls. Samme PCB, ny oppskrift.`);
      },
    },
    {
      label: "3. parent wait()",
      code: "int status; waitpid(pid, &status, 0);",
      explain: "Parent kaller wait() og blokkerer til child er ferdig. Som bakeren som setter seg ned ved ovnen.",
      action: () => {
        setProcs((p) => p.map((x) => x.pid === 1000 ? { ...x, state: "BLOCKED" } : x));
        pushLog(`PID 1000 kalte waitpid(1001) → BLOCKED til child exit-er.`);
      },
    },
    {
      label: "4. child exit()",
      code: "exit(0);",
      explain: "Child blir ferdig og kaller exit. Ressurser frigis, men PCB med exit-koden henger igjen — child er nå ZOMBIE.",
      action: () => {
        setProcs((p) => p.map((x) => x.pid === 1001 ? { ...x, state: "ZOMBIE" } : x));
        pushLog(`PID 1001 exit(0) → ZOMBIE. Bare PCB med exit-status er igjen.`);
      },
    },
    {
      label: "5. parent reap",
      code: "// waitpid returnerer, kernel rydder",
      explain: "Kernel sender SIGCHLD til parent. waitpid returnerer exit-status, child fjernes helt, PID frigis.",
      action: () => {
        setProcs((p) =>
          p.map((x) => (x.pid === 1000 ? { ...x, state: "RUNNING" as StateId } : x)).filter((x) => x.pid !== 1001),
        );
        pushLog(`SIGCHLD til 1000. waitpid returnerer. PID 1001 frigitt.`);
      },
    },
  ];

  function next() {
    if (stepIdx >= STEPS.length) return;
    STEPS[stepIdx].action();
    setStepIdx(stepIdx + 1);
  }

  function reset() {
    setProcs(FORK_INITIAL);
    setStepIdx(0);
    setLog([]);
    pidRef.current = 1001;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-xl border border-border bg-background p-4">
        <svg viewBox="0 0 460 260" className="w-full h-auto">
          {/* parent-child edge */}
          {procs.length === 2 && (
            <line x1={230} y1={70} x2={230} y2={150} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" />
          )}
          {/* parent */}
          {procs.find((p) => p.pid === 1000) && (
            <ProcessBox
              x={230}
              y={50}
              proc={procs.find((p) => p.pid === 1000)!}
              label={(p) => `${p.pid} ${p.isParent ? "(parent)" : ""}`}
            />
          )}
          {/* child */}
          {procs.find((p) => p.pid === 1001) && (
            <ProcessBox
              x={230}
              y={170}
              proc={procs.find((p) => p.pid === 1001)!}
              label={(p) => `${p.pid} (child)`}
            />
          )}
        </svg>
        <div className="mt-3 text-[11px] text-muted-foreground italic">
          Metafor: fork = kopier oppskriften. exec = bytt oppskrift, samme PID. wait = bakeren venter ved ovnen.
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Steg {Math.min(stepIdx + 1, STEPS.length)} / {STEPS.length}
          </div>
          {stepIdx < STEPS.length ? (
            <>
              <div className="text-sm font-semibold mb-1">{STEPS[stepIdx].label}</div>
              <pre className="font-mono text-[11px] bg-muted/40 rounded px-2 py-1 mb-2 overflow-x-auto">{STEPS[stepIdx].code}</pre>
              <p className="text-xs text-muted-foreground">{STEPS[stepIdx].explain}</p>
            </>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              Ferdig. Trykk Reset for å kjøre gjennom igjen.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={next}
            disabled={stepIdx >= STEPS.length}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground disabled:opacity-50"
          >
            Neste steg
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
        <LogBox log={log} />
      </div>
    </div>
  );
}

function ProcessBox({
  x, y, proc, label,
}: { x: number; y: number; proc: ForkProc; label: (p: ForkProc) => string }) {
  const st = STATE_STYLE[proc.state];
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={-80}
        y={-22}
        width={160}
        height={56}
        rx={10}
        fill={st.fill}
        stroke={st.ring}
        strokeWidth={2}
      />
      <text textAnchor="middle" y={-6} className="text-[11px] font-mono font-semibold" fill="#0f172a">
        PID {label(proc)}
      </text>
      <text textAnchor="middle" y={8} className="text-[10px] font-mono" fill="#0f172a">
        {proc.program}
      </text>
      <text textAnchor="middle" y={24} className="text-[9px] font-mono" fill={st.ring}>
        {st.name}
      </text>
    </g>
  );
}

// =============================================================================
//                       MODE 3: SIGNALS
// =============================================================================

type SigProc = {
  pid: number;
  name: string;
  state: StateId;
  handlers: Record<string, "default" | "ignore" | "custom">;
};

const SIG_INITIAL: SigProc[] = [
  {
    pid: 1042,
    name: "python sim.py",
    state: "RUNNING",
    handlers: { SIGTERM: "custom", SIGINT: "custom", SIGKILL: "default", SIGSTOP: "default", SIGCONT: "default" },
  },
  {
    pid: 1133,
    name: "nginx",
    state: "RUNNING",
    handlers: { SIGTERM: "custom", SIGINT: "default", SIGKILL: "default", SIGSTOP: "default", SIGCONT: "default", SIGHUP: "custom" },
  },
  {
    pid: 1201,
    name: "sleep 9999",
    state: "BLOCKED",
    handlers: { SIGTERM: "default", SIGINT: "default", SIGKILL: "default", SIGSTOP: "default", SIGCONT: "default" },
  },
];

const SIGNALS: { id: string; label: string; nr: number; tone: "warn" | "danger" | "info" }[] = [
  { id: "SIGTERM", label: "SIGTERM (15)", nr: 15, tone: "warn" },
  { id: "SIGKILL", label: "SIGKILL (9)", nr: 9, tone: "danger" },
  { id: "SIGSTOP", label: "SIGSTOP (19)", nr: 19, tone: "warn" },
  { id: "SIGCONT", label: "SIGCONT (18)", nr: 18, tone: "info" },
  { id: "SIGINT", label: "SIGINT (2)", nr: 2, tone: "warn" },
];

function SignalsView() {
  const [procs, setProcs] = useState<SigProc[]>(SIG_INITIAL);
  const [selectedPid, setSelectedPid] = useState<number>(1042);
  const [flying, setFlying] = useState<{ signal: string; targetPid: number; key: number } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const pushLog = nowLog(setLog);
  const flyKey = useRef(0);

  function send(signal: string) {
    flyKey.current += 1;
    setFlying({ signal, targetPid: selectedPid, key: flyKey.current });
    setTimeout(() => {
      applySignal(signal, selectedPid);
      setFlying(null);
    }, 700);
  }

  function applySignal(signal: string, pid: number) {
    setProcs((cur) =>
      cur.map((p) => {
        if (p.pid !== pid) return p;
        const handler = p.handlers[signal] ?? "default";

        // SIGKILL og SIGSTOP kan IKKE fanges/ignoreres
        const effective = signal === "SIGKILL" || signal === "SIGSTOP" ? "default" : handler;

        if (signal === "SIGKILL") {
          pushLog(`PID ${pid}: SIGKILL — kernel river ned umiddelbart → ZOMBIE.`);
          return { ...p, state: "ZOMBIE" };
        }
        if (signal === "SIGSTOP") {
          pushLog(`PID ${pid}: SIGSTOP — pauset, kan IKKE ignoreres → STOPPED.`);
          return { ...p, state: "STOPPED" };
        }
        if (signal === "SIGCONT") {
          if (p.state === "STOPPED") {
            pushLog(`PID ${pid}: SIGCONT — fortsetter → RUNNING.`);
            return { ...p, state: "RUNNING" };
          }
          pushLog(`PID ${pid}: SIGCONT, men prosessen var ikke STOPPED — ingen effekt.`);
          return p;
        }
        // SIGTERM / SIGINT
        if (effective === "ignore") {
          pushLog(`PID ${pid}: ${signal} ignorert (SIG_IGN).`);
          return p;
        }
        if (effective === "custom") {
          pushLog(`PID ${pid}: ${signal} → custom handler. Lagrer state, lukker filer, exit() pent → ZOMBIE.`);
          return { ...p, state: "ZOMBIE" };
        }
        // default = terminate
        pushLog(`PID ${pid}: ${signal} default = terminate → ZOMBIE.`);
        return { ...p, state: "ZOMBIE" };
      }),
    );
  }

  function reap(pid: number) {
    setProcs((cur) => cur.filter((p) => p.pid !== pid));
    pushLog(`PID ${pid}: parent wait()-et — PCB borte, PID frigjort.`);
  }

  function reset() {
    setProcs(SIG_INITIAL);
    setSelectedPid(1042);
    setFlying(null);
    setLog([]);
  }

  // SVG-koordinater for hver prosess (basert på posisjon i listen)
  const procPos = (idx: number) => ({ x: 130 + idx * 170, y: 170 });
  const userPos = { x: 50, y: 50 };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-background p-3">
        <svg viewBox="0 0 560 260" className="w-full h-auto">
          {/* user node */}
          <g transform={`translate(${userPos.x},${userPos.y})`}>
            <rect x={-40} y={-18} width={80} height={36} rx={8} fill="#fef3c7" stroke="#a16207" strokeWidth={1.5} />
            <text textAnchor="middle" y={4} className="text-[11px] font-mono font-semibold" fill="#0f172a">$ kill</text>
          </g>

          {/* prosessene */}
          {procs.map((p, idx) => {
            const pos = procPos(idx);
            const st = STATE_STYLE[p.state];
            const selected = p.pid === selectedPid;
            return (
              <g key={p.pid} transform={`translate(${pos.x},${pos.y})`} onClick={() => setSelectedPid(p.pid)} style={{ cursor: "pointer" }}>
                <rect
                  x={-72}
                  y={-32}
                  width={144}
                  height={64}
                  rx={10}
                  fill={st.fill}
                  stroke={selected ? "#1d4ed8" : st.ring}
                  strokeWidth={selected ? 3 : 1.5}
                />
                <text textAnchor="middle" y={-14} className="text-[11px] font-mono font-semibold" fill="#0f172a">
                  PID {p.pid}
                </text>
                <text textAnchor="middle" y={2} className="text-[10px] font-mono" fill="#0f172a">
                  {p.name}
                </text>
                <text textAnchor="middle" y={20} className="text-[9px] font-mono" fill={st.ring}>
                  {st.name}
                </text>
              </g>
            );
          })}

          {/* flying signal */}
          {flying && (() => {
            const idx = procs.findIndex((p) => p.pid === flying.targetPid);
            if (idx < 0) return null;
            const tp = procPos(idx);
            return (
              <FlyingSignal
                key={flying.key}
                fromX={userPos.x + 20}
                fromY={userPos.y + 10}
                toX={tp.x}
                toY={tp.y - 32}
                label={flying.signal}
              />
            );
          })()}
        </svg>
        <style>{`
          @keyframes sigfly {
            0% { transform: translate(var(--fx), var(--fy)); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)); opacity: 0; }
          }
        `}</style>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Send signal til PID {selectedPid}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SIGNALS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => send(s.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono border ${
                  s.tone === "danger"
                    ? "bg-destructive/10 text-destructive border-destructive/40 hover:bg-destructive/20"
                    : s.tone === "warn"
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 italic">
            SIGKILL og SIGSTOP kan IKKE fanges eller ignoreres — kernel håndhever dem.
          </p>
          <div className="mt-3 flex gap-2">
            {procs.filter((p) => p.state === "ZOMBIE").map((p) => (
              <button
                key={p.pid}
                type="button"
                onClick={() => reap(p.pid)}
                className="px-2 py-1 rounded text-[11px] border border-border hover:bg-muted"
              >
                wait() PID {p.pid}
              </button>
            ))}
            <button
              type="button"
              onClick={reset}
              className="ml-auto px-2 py-1 rounded text-[11px] border border-border hover:bg-muted inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Handlers for valgt prosess
          </div>
          {(() => {
            const p = procs.find((x) => x.pid === selectedPid);
            if (!p) return <div className="text-xs text-muted-foreground italic">Prosess borte. Reset for å starte på nytt.</div>;
            return (
              <table className="w-full text-[11px] font-mono">
                <tbody>
                  {Object.entries(p.handlers).map(([sig, h]) => (
                    <tr key={sig} className="border-t border-border first:border-t-0">
                      <td className="py-1 pr-2">{sig}</td>
                      <td className="py-1 text-muted-foreground">
                        {h === "custom" ? "→ egen handler" : h === "ignore" ? "→ ignorert" : "→ default (terminate)"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>

      <LogBox log={log} />
    </div>
  );
}

function FlyingSignal({
  fromX, fromY, toX, toY, label,
}: { fromX: number; fromY: number; toX: number; toY: number; label: string }) {
  // Anim: pakke flyr fra avsender til mottager.
  const dx = toX - fromX;
  const dy = toY - fromY;
  return (
    <g
      style={
        {
          ["--fx" as string]: "0px",
          ["--fy" as string]: "0px",
          ["--tx" as string]: `${dx}px`,
          ["--ty" as string]: `${dy}px`,
          animation: "sigfly 0.7s ease-in-out forwards",
          transformBox: "fill-box",
        } as React.CSSProperties
      }
      transform={`translate(${fromX},${fromY})`}
    >
      <rect x={-24} y={-9} width={48} height={18} rx={4} fill="#1d4ed8" />
      <text textAnchor="middle" y={3} className="text-[9px] font-mono font-bold" fill="white">
        {label}
      </text>
    </g>
  );
}

// =============================================================================
//                          MODE 4: PIPE
// =============================================================================

function PipeView() {
  const [stepIdx, setStepIdx] = useState(0);
  const [bytesInPipe, setBytesInPipe] = useState<string[]>([]);
  const [parentFd1, setParentFd1] = useState<"stdout" | "pipe_w">("stdout");
  const [childFd0, setChildFd0] = useState<"stdin" | "pipe_r">("stdin");
  const [log, setLog] = useState<LogEntry[]>([]);
  const pushLog = nowLog(setLog);

  const STEPS: { label: string; code: string; explain: string; action: () => void }[] = [
    {
      label: "1. pipe()",
      code: "int fd[2]; pipe(fd);",
      explain: "Kernel lager en pipe-buffer og to fd-er: fd[0] for lesing, fd[1] for skriving. Bare delt minne — bytes ut ene enden, inn den andre.",
      action: () => pushLog("pipe() — fd[0]=lese, fd[1]=skrive. Buffer i kernel-space."),
    },
    {
      label: "2. fork()",
      code: "if (fork() == 0) { /* child */ }",
      explain: "Etter fork har både parent og child kopier av fd[0] og fd[1]. Pipen er delt mellom dem.",
      action: () => pushLog("fork() — child og parent har begge fd[0] og fd[1]."),
    },
    {
      label: "3. parent: dup2(fd[1], 1)",
      code: "dup2(fd[1], STDOUT_FILENO); close(fd[0]);",
      explain: "Parent omdirigerer stdout: nå går alt parent skriver via printf inn i pipens skrive-ende.",
      action: () => {
        setParentFd1("pipe_w");
        pushLog("parent: fd 1 (stdout) → pipens skrive-ende. printf havner i pipen.");
      },
    },
    {
      label: "4. child: dup2(fd[0], 0)",
      code: "dup2(fd[0], STDIN_FILENO); close(fd[1]);",
      explain: "Child omdirigerer stdin: read(0,...) leser nå fra pipens lese-ende.",
      action: () => {
        setChildFd0("pipe_r");
        pushLog("child: fd 0 (stdin) → pipens lese-ende. read() henter fra pipen.");
      },
    },
    {
      label: "5. parent skriver",
      code: 'write(1, "hei\\n", 4);',
      explain: "Bytes 'h','e','i','\\n' havner i pipens buffer. Kernel håndterer låser og blokkering.",
      action: () => {
        setBytesInPipe(["h", "e", "i", "\\n"]);
        pushLog('parent: write("hei\\n") → 4 bytes lagt i pipe-buffer.');
      },
    },
    {
      label: "6. child leser",
      code: "char buf[16]; read(0, buf, 16);",
      explain: "read() tømmer pipen og fyller buf. Hvis pipen var tom ville read() blokkert til parent skrev noe.",
      action: () => {
        setBytesInPipe([]);
        pushLog('child: read() konsumerte 4 bytes. Pipen tom igjen.');
      },
    },
  ];

  function next() {
    if (stepIdx >= STEPS.length) return;
    STEPS[stepIdx].action();
    setStepIdx(stepIdx + 1);
  }

  function reset() {
    setStepIdx(0);
    setBytesInPipe([]);
    setParentFd1("stdout");
    setChildFd0("stdin");
    setLog([]);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-xl border border-border bg-background p-3">
        <svg viewBox="0 0 560 260" className="w-full h-auto">
          {/* parent */}
          <g transform="translate(90,80)">
            <rect x={-70} y={-50} width={140} height={100} rx={10} fill="#bbf7d0" stroke="#047857" strokeWidth={2} />
            <text textAnchor="middle" y={-32} className="text-[11px] font-mono font-semibold" fill="#064e3b">parent PID 1000</text>
            <text textAnchor="middle" y={-14} className="text-[9px] font-mono" fill="#064e3b">fd 0 = stdin</text>
            <text textAnchor="middle" y={2} className="text-[9px] font-mono" fill={parentFd1 === "pipe_w" ? "#dc2626" : "#064e3b"}>
              fd 1 = {parentFd1 === "pipe_w" ? "pipe[w]" : "stdout"}
            </text>
            <text textAnchor="middle" y={18} className="text-[9px] font-mono" fill="#064e3b">fd 2 = stderr</text>
            <text textAnchor="middle" y={36} className="text-[9px]" fill="#047857">→ skriver</text>
          </g>

          {/* pipe buffer */}
          <g transform="translate(280,80)">
            <rect x={-60} y={-20} width={120} height={40} rx={6} fill="#fef3c7" stroke="#a16207" strokeWidth={1.5} strokeDasharray="3 3" />
            <text textAnchor="middle" y={-26} className="text-[10px] font-mono font-semibold" fill="#92400e">pipe buffer (kernel)</text>
            {bytesInPipe.length === 0 ? (
              <text textAnchor="middle" y={5} className="text-[9px] italic" fill="#92400e">(tom)</text>
            ) : (
              bytesInPipe.map((b, i) => (
                <g key={i} transform={`translate(${-45 + i * 22},0)`}>
                  <rect x={-9} y={-9} width={18} height={18} rx={3} fill="#fb923c" stroke="#9a3412" />
                  <text textAnchor="middle" y={4} className="text-[10px] font-mono font-bold" fill="white">{b}</text>
                </g>
              ))
            )}
          </g>

          {/* child */}
          <g transform="translate(470,80)">
            <rect x={-70} y={-50} width={140} height={100} rx={10} fill="#bfdbfe" stroke="#1d4ed8" strokeWidth={2} />
            <text textAnchor="middle" y={-32} className="text-[11px] font-mono font-semibold" fill="#1e3a8a">child PID 1001</text>
            <text textAnchor="middle" y={-14} className="text-[9px] font-mono" fill={childFd0 === "pipe_r" ? "#dc2626" : "#1e3a8a"}>
              fd 0 = {childFd0 === "pipe_r" ? "pipe[r]" : "stdin"}
            </text>
            <text textAnchor="middle" y={2} className="text-[9px] font-mono" fill="#1e3a8a">fd 1 = stdout</text>
            <text textAnchor="middle" y={18} className="text-[9px] font-mono" fill="#1e3a8a">fd 2 = stderr</text>
            <text textAnchor="middle" y={36} className="text-[9px]" fill="#1d4ed8">leser ←</text>
          </g>

          {/* arrows */}
          <line x1={160} y1={80} x2={220} y2={80} stroke={parentFd1 === "pipe_w" ? "#dc2626" : "#cbd5e1"} strokeWidth={2} markerEnd={parentFd1 === "pipe_w" ? "url(#pipe-arrow-red)" : "url(#pipe-arrow-grey)"} />
          <line x1={340} y1={80} x2={400} y2={80} stroke={childFd0 === "pipe_r" ? "#dc2626" : "#cbd5e1"} strokeWidth={2} markerEnd={childFd0 === "pipe_r" ? "url(#pipe-arrow-red)" : "url(#pipe-arrow-grey)"} />

          <defs>
            <marker id="pipe-arrow-red" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
            </marker>
            <marker id="pipe-arrow-grey" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
            </marker>
          </defs>

          {/* parent-child relasjon */}
          <line x1={90} y1={140} x2={470} y2={140} stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 4" />
          <text x={280} y={158} textAnchor="middle" className="text-[9px]" fill="#64748b">parent/child (delte fd-er etter fork)</text>
        </svg>
        <div className="mt-3 text-[11px] text-muted-foreground italic">
          Tenk på pipen som et rør mellom to bakere — den ene skyver inn bytes, den andre suger dem ut.
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Steg {Math.min(stepIdx + 1, STEPS.length)} / {STEPS.length}
          </div>
          {stepIdx < STEPS.length ? (
            <>
              <div className="text-sm font-semibold mb-1">{STEPS[stepIdx].label}</div>
              <pre className="font-mono text-[11px] bg-muted/40 rounded px-2 py-1 mb-2 overflow-x-auto">{STEPS[stepIdx].code}</pre>
              <p className="text-xs text-muted-foreground">{STEPS[stepIdx].explain}</p>
            </>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              Ferdig. shell-en din gjør dette hver gang du skriver <code className="font-mono">cmd1 | cmd2</code>.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={next}
            disabled={stepIdx >= STEPS.length}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground disabled:opacity-50"
          >
            Neste steg
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
        <LogBox log={log} />
      </div>
    </div>
  );
}

// =============================================================================
//                       MODE 5: ZOMBIE / ORPHAN
// =============================================================================

type ZombieScenario = "zombie" | "orphan";

type ZProc = {
  pid: number;
  parent: number;
  name: string;
  state: StateId;
};

const Z_INIT = (sc: ZombieScenario): ZProc[] =>
  sc === "zombie"
    ? [
        { pid: 1, parent: 0, name: "init / systemd", state: "RUNNING" },
        { pid: 2000, parent: 1, name: "parent.c (glemmer wait)", state: "RUNNING" },
        { pid: 2001, parent: 2000, name: "child", state: "RUNNING" },
      ]
    : [
        { pid: 1, parent: 0, name: "init / systemd", state: "RUNNING" },
        { pid: 3000, parent: 1, name: "parent.c (dør først)", state: "RUNNING" },
        { pid: 3001, parent: 3000, name: "child (langlivet)", state: "RUNNING" },
      ];

function ZombieView() {
  const [scenario, setScenario] = useState<ZombieScenario>("zombie");
  const [procs, setProcs] = useState<ZProc[]>(() => Z_INIT("zombie"));
  const [stepIdx, setStepIdx] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const pushLog = nowLog(setLog);

  const ZOMBIE_STEPS = [
    {
      label: "1. child exit()",
      explain: "Child er ferdig. exit-koden lagres i PCB, men resten av ressursene frigis. Tilstand → ZOMBIE.",
      action: () => {
        setProcs((p) => p.map((x) => x.pid === 2001 ? { ...x, state: "ZOMBIE" as StateId } : x));
        pushLog("PID 2001 exit(). PCB med exit-status venter på wait().");
      },
    },
    {
      label: "2. parent gjør ingenting",
      explain: "Parent.c har glemt waitpid(). PCB blir hengende. ps viser <defunct>. Bruker null minne, men PID-en er låst.",
      action: () => {
        pushLog("PID 2000 kaller ikke wait() → 2001 blir hengende som zombie.");
      },
    },
    {
      label: "3. fix: drep parent",
      explain: "Når parent (2000) dør, blir 2001 reparentert til PID 1 (init). Init kaller wait() konstant → zombien forsvinner.",
      action: () => {
        setProcs((p) =>
          p
            .map((x) => (x.pid === 2000 ? { ...x, state: "TERMINATED" as StateId } : x))
            .filter((x) => x.pid !== 2000 && x.pid !== 2001),
        );
        pushLog("PID 2000 drept → 2001 adoptert av init → init wait()-er → PID 2001 frigjort.");
      },
    },
  ];

  const ORPHAN_STEPS = [
    {
      label: "1. parent exit()",
      explain: "Parent dør først — uvanlig rekkefølge. Child kjører videre, men har mistet parent.",
      action: () => {
        setProcs((p) =>
          p
            .map((x) => (x.pid === 3000 ? { ...x, state: "ZOMBIE" as StateId } : x))
            .filter((x) => x.pid !== 3000), // anta init wait()-er på 3000 umiddelbart
        );
        pushLog("PID 3000 exit(). init wait()-er den umiddelbart. 3001 mister parent.");
      },
    },
    {
      label: "2. reparenting",
      explain: "Kernel oppdager at 3001 ble foreldreløs og setter parent = 1 (init). Child er nå en orphan, men ikke en zombie.",
      action: () => {
        setProcs((p) => p.map((x) => x.pid === 3001 ? { ...x, parent: 1 } : x));
        pushLog("PID 3001 reparentert til init. parent = 1.");
      },
    },
    {
      label: "3. child exit() — init rydder",
      explain: "Når child dør, sender kernel SIGCHLD til init. Init kaller wait() i sin event-loop → ingen langtids-zombie. Slik blir daemoner laget med vilje: fork + parent exit + setsid.",
      action: () => {
        setProcs((p) => p.filter((x) => x.pid !== 3001));
        pushLog("PID 3001 exit() → init wait()-er → PID frigjort. Ingen zombie igjen.");
      },
    },
  ];

  const STEPS = scenario === "zombie" ? ZOMBIE_STEPS : ORPHAN_STEPS;

  function next() {
    if (stepIdx >= STEPS.length) return;
    STEPS[stepIdx].action();
    setStepIdx(stepIdx + 1);
  }

  function setSc(sc: ZombieScenario) {
    setScenario(sc);
    setProcs(Z_INIT(sc));
    setStepIdx(0);
    setLog([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setSc("zombie")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
            scenario === "zombie" ? "bg-brand text-brand-foreground border-brand" : "border-border hover:bg-muted"
          }`}
        >
          Zombie (parent glemmer wait)
        </button>
        <button
          type="button"
          onClick={() => setSc("orphan")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
            scenario === "orphan" ? "bg-brand text-brand-foreground border-brand" : "border-border hover:bg-muted"
          }`}
        >
          Orphan (parent dør først)
        </button>
        <button
          type="button"
          onClick={() => setSc(scenario)}
          className="ml-auto px-2 py-1.5 rounded-md text-xs border border-border hover:bg-muted inline-flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl border border-border bg-background p-3">
          <svg viewBox="0 0 560 280" className="w-full h-auto">
            {/* parent-child edges */}
            {procs.map((p) => {
              if (p.parent === 0) return null;
              const par = procs.find((x) => x.pid === p.parent);
              if (!par) return null;
              const pos = layoutZ(p, procs);
              const ppos = layoutZ(par, procs);
              return (
                <line
                  key={`edge-${p.pid}`}
                  x1={ppos.x}
                  y1={ppos.y + 24}
                  x2={pos.x}
                  y2={pos.y - 24}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray={par.pid === 1 ? "3 3" : undefined}
                  markerEnd="url(#zomb-arrow)"
                />
              );
            })}
            <defs>
              <marker id="zomb-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
            </defs>

            {procs.map((p) => {
              const pos = layoutZ(p, procs);
              const st = STATE_STYLE[p.state];
              return (
                <g key={p.pid} transform={`translate(${pos.x},${pos.y})`}>
                  <rect
                    x={-90}
                    y={-22}
                    width={180}
                    height={46}
                    rx={10}
                    fill={st.fill}
                    stroke={st.ring}
                    strokeWidth={2}
                  />
                  <text textAnchor="middle" y={-6} className="text-[11px] font-mono font-semibold" fill="#0f172a">
                    PID {p.pid} (parent={p.parent})
                  </text>
                  <text textAnchor="middle" y={8} className="text-[9px] font-mono" fill="#0f172a">
                    {p.name}
                  </text>
                  <text textAnchor="middle" y={20} className="text-[9px] font-mono" fill={st.ring}>
                    {st.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Steg {Math.min(stepIdx + 1, STEPS.length)} / {STEPS.length}
            </div>
            {stepIdx < STEPS.length ? (
              <>
                <div className="text-sm font-semibold mb-1">{STEPS[stepIdx].label}</div>
                <p className="text-xs text-muted-foreground">{STEPS[stepIdx].explain}</p>
              </>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                {scenario === "zombie"
                  ? "Ingen zombier igjen — init rydder alltid."
                  : "Orphan-mønsteret er hvordan daemoner blir til."}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={next}
            disabled={stepIdx >= STEPS.length}
            className="w-full px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground disabled:opacity-50"
          >
            Neste steg
          </button>
          <LogBox log={log} />
        </div>
      </div>
    </div>
  );
}

function layoutZ(p: ZProc, all: ZProc[]): { x: number; y: number } {
  // Init alltid på toppen, parent på rad 2, child på rad 3
  if (p.pid === 1) return { x: 280, y: 40 };
  // parent: er den noens parent (ikke init)?
  const isParentOfNonInit = all.some((x) => x.parent === p.pid && p.pid !== 1);
  if (isParentOfNonInit) return { x: 180, y: 140 };
  // child
  return { x: 380, y: 240 };
}
