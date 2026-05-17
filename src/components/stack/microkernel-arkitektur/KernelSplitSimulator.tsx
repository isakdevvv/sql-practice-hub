import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Zap,
  AlertTriangle,
  ShieldCheck,
  ShieldX,
  Activity,
  ArrowRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Microkernel vs monolitt — splittskjerm-simulator
// ---------------------------------------------------------------------------
// Pedagogisk poeng (O'Gorman kap. 1.7):
//   - Monolitt: alle subsystemer (drivers, FS, IPC, scheduler) i kernel space.
//     Få ring-bytter, men én feil = panic for hele systemet.
//   - Microkernel: kernel inneholder kun det aller minste (IPC + scheduling +
//     grunnleggende minne). FS, drivers, nettverk kjører som user-space servere.
//     Mange flere ring-bytter (= overhead), men fault-isolation: én driver kan
//     krasje uten å ta ned kjernen.
// ---------------------------------------------------------------------------

type ModuleId = "fs" | "driver" | "ipc" | "net";

type Placement = "kernel" | "user";

type Architecture = "mono" | "micro";

type ModuleDef = {
  id: ModuleId;
  label: string;
  hint: string;
};

const MODULES: ModuleDef[] = [
  { id: "fs", label: "Filsystem", hint: "ext4 / FAT — leser blokker, cacher inoder." },
  { id: "driver", label: "Disk-driver", hint: "Snakker direkte med SATA/NVMe-hardware." },
  { id: "ipc", label: "IPC", hint: "Message-passing mellom prosesser." },
  { id: "net", label: "Nettverks-stack", hint: "TCP/IP — kobler sockets til NIC." },
];

// Hvilke moduler trenger en read("file.txt")-syscall å invokere?
const READ_PATH: ModuleId[] = ["ipc", "fs", "driver"];

type Step = {
  module: ModuleId;
  ringSwitch: boolean; // bidrar dette steget med en ekstra user↔kernel-transisjon?
  cost: number; // abstrakt tidsenhet
  label: string;
};

// Tidsmodellen er bevisst stilisert:
//   Monolitt: én syscall inn (user→kernel = 1 bytte), gjør alt i kernel,
//             returnerer (kernel→user = 1 bytte). Sum: 2 bytter, lav cost.
//   Microkernel: hver user-space-server kreves nås via IPC. Hver IPC-runde
//             = 2 ring-bytter (kernel router meldinger). FS, driver i user
//             land = 2x ekstra bytter per server-call.
function buildSteps(
  arch: Architecture,
  placements: Record<ModuleId, Placement>
): Step[] {
  const steps: Step[] = [];
  for (const mod of READ_PATH) {
    const where = placements[mod];
    if (arch === "mono") {
      // I monolitt er alt alltid i kernel — placement ignoreres for telling,
      // men vi viser likevel hvor brukeren har "satt" dem.
      steps.push({
        module: mod,
        ringSwitch: false, // ingen ekstra; bare innledende syscall teller
        cost: 1,
        label: `${MODULES.find((m) => m.id === mod)!.label}: in-kernel call (rask funksjonscall)`,
      });
    } else {
      // Microkernel: hvis modulen er i user space, må vi ut og inn igjen
      // via IPC. Hvis brukeren har dratt den inn i kernel space, oppfører
      // den seg som monolitt for det steget.
      if (where === "user") {
        steps.push({
          module: mod,
          ringSwitch: true,
          cost: 4,
          label: `${MODULES.find((m) => m.id === mod)!.label}: IPC → user-server → svar (2 ring-bytter)`,
        });
      } else {
        steps.push({
          module: mod,
          ringSwitch: false,
          cost: 1,
          label: `${MODULES.find((m) => m.id === mod)!.label}: in-kernel call (rask funksjonscall)`,
        });
      }
    }
  }
  return steps;
}

function totals(steps: Step[]) {
  // Hver syscall begynner og slutter med ett ring-bytte (user→kernel→user).
  const base = 2;
  const extra = steps.reduce((s, st) => s + (st.ringSwitch ? 2 : 0), 0);
  const cost = steps.reduce((s, st) => s + st.cost, 0) + 2; // +2 for innledende syscall
  return { ringSwitches: base + extra, cost };
}

// ---------------------------------------------------------------------------

type CrashState = Record<Architecture, "ok" | "panic" | "isolated">;

export function KernelSplitSimulator() {
  // Standard: i microkernel-kolonnen ligger FS/driver/net i user space,
  // IPC alltid i kernel (definisjon). I monolitt-kolonnen er alt i kernel.
  const [microPlacements, setMicroPlacements] = useState<Record<ModuleId, Placement>>({
    fs: "user",
    driver: "user",
    net: "user",
    ipc: "kernel",
  });
  const [monoPlacements] = useState<Record<ModuleId, Placement>>({
    fs: "kernel",
    driver: "kernel",
    net: "kernel",
    ipc: "kernel",
  });

  const [runningMono, setRunningMono] = useState(false);
  const [runningMicro, setRunningMicro] = useState(false);
  const [progressMono, setProgressMono] = useState(0);
  const [progressMicro, setProgressMicro] = useState(0);
  const [elapsedMono, setElapsedMono] = useState(0);
  const [elapsedMicro, setElapsedMicro] = useState(0);
  const [stopwatchMono, setStopwatchMono] = useState(0);
  const [stopwatchMicro, setStopwatchMicro] = useState(0);
  const [crashed, setCrashed] = useState<CrashState>({ mono: "ok", micro: "ok" });

  const stepsMono = useMemo(() => buildSteps("mono", monoPlacements), [monoPlacements]);
  const stepsMicro = useMemo(() => buildSteps("micro", microPlacements), [microPlacements]);
  const totalsMono = useMemo(() => totals(stepsMono), [stepsMono]);
  const totalsMicro = useMemo(() => totals(stepsMicro), [stepsMicro]);

  // --- Animasjon: marsjer gjennom stegene én og én ---
  useEffect(() => {
    if (!runningMono) return;
    if (progressMono >= stepsMono.length) {
      setRunningMono(false);
      return;
    }
    const cost = stepsMono[progressMono].cost;
    const t = setTimeout(() => {
      setProgressMono((p) => p + 1);
      setElapsedMono((e) => e + cost);
      setStopwatchMono((s) => s + cost);
    }, 300 + cost * 80);
    return () => clearTimeout(t);
  }, [runningMono, progressMono, stepsMono]);

  useEffect(() => {
    if (!runningMicro) return;
    if (progressMicro >= stepsMicro.length) {
      setRunningMicro(false);
      return;
    }
    const cost = stepsMicro[progressMicro].cost;
    const t = setTimeout(() => {
      setProgressMicro((p) => p + 1);
      setElapsedMicro((e) => e + cost);
      setStopwatchMicro((s) => s + cost);
    }, 300 + cost * 80);
    return () => clearTimeout(t);
  }, [runningMicro, progressMicro, stepsMicro]);

  function runBoth() {
    if (crashed.mono === "panic") return; // monolitt henger til reset
    setProgressMono(0);
    setProgressMicro(0);
    setElapsedMono(0);
    setElapsedMicro(0);
    setRunningMono(true);
    setRunningMicro(true);
  }

  function reset() {
    setRunningMono(false);
    setRunningMicro(false);
    setProgressMono(0);
    setProgressMicro(0);
    setElapsedMono(0);
    setElapsedMicro(0);
    setStopwatchMono(0);
    setStopwatchMicro(0);
    setCrashed({ mono: "ok", micro: "ok" });
  }

  function crashDriver() {
    // Monolitt: driver i kernel space → panic.
    // Microkernel: driver i user space → isolert. Hvis brukeren har dratt
    // driveren INN i kernel space, så krasjer microkernel også (poenget!).
    setCrashed({
      mono: "panic",
      micro: microPlacements.driver === "user" ? "isolated" : "panic",
    });
    setRunningMono(false);
    setRunningMicro(false);
  }

  function toggleMicroPlacement(id: ModuleId) {
    if (id === "ipc") return; // IPC er alltid i kernel — det er hele poenget
    setMicroPlacements((prev) => ({
      ...prev,
      [id]: prev[id] === "user" ? "kernel" : "user",
    }));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand" />
            Syscall-simulator: <code className="text-xs">read(&quot;file.txt&quot;)</code>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Klikk <em>Kjør syscall</em> for å trigge samme operasjon på begge
            sider. I microkernel-spalten kan du dra moduler inn/ut av kernel
            ved å klikke på dem.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={runBoth}
            disabled={runningMono || runningMicro || crashed.mono === "panic"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør syscall
          </button>
          <button
            type="button"
            onClick={crashDriver}
            disabled={runningMono || runningMicro}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/40 text-red-500 text-sm font-medium hover:bg-red-500/10 disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            Krasj disk-driver
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nullstill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KernelColumn
          title="Monolittisk kernel"
          subtitle="Linux, klassisk UNIX, Windows NT-hybrid"
          arch="mono"
          placements={monoPlacements}
          steps={stepsMono}
          progress={progressMono}
          ringSwitches={totalsMono.ringSwitches}
          stopwatch={stopwatchMono}
          crash={crashed.mono}
        />
        <KernelColumn
          title="Microkernel"
          subtitle="Mach, MINIX 3, L4, QNX, seL4"
          arch="micro"
          placements={microPlacements}
          steps={stepsMicro}
          progress={progressMicro}
          ringSwitches={totalsMicro.ringSwitches}
          stopwatch={stopwatchMicro}
          crash={crashed.micro}
          onTogglePlacement={toggleMicroPlacement}
        />
      </div>

      <ScoreBoard
        mono={totalsMono}
        micro={totalsMicro}
        elapsedMono={elapsedMono}
        elapsedMicro={elapsedMicro}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

function KernelColumn({
  title,
  subtitle,
  arch,
  placements,
  steps,
  progress,
  ringSwitches,
  stopwatch,
  crash,
  onTogglePlacement,
}: {
  title: string;
  subtitle: string;
  arch: Architecture;
  placements: Record<ModuleId, Placement>;
  steps: Step[];
  progress: number;
  ringSwitches: number;
  stopwatch: number;
  crash: "ok" | "panic" | "isolated";
  onTogglePlacement?: (id: ModuleId) => void;
}) {
  const kernelModules = MODULES.filter((m) => placements[m.id] === "kernel");
  const userModules = MODULES.filter((m) => placements[m.id] === "user");
  const activeModule = progress > 0 && progress <= steps.length ? steps[progress - 1].module : null;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        crash === "panic"
          ? "border-red-500/60 bg-red-500/5"
          : "border-border bg-background/40"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Ring-bytter</div>
          <div className="text-xl font-mono font-bold tabular-nums">
            {ringSwitches}
          </div>
        </div>
      </div>

      {/* User space */}
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-2 mb-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          User space (ring 3)
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          <ModuleChip id="syscall" label="read()-prosess" activeId={null} isUser />
          {userModules.map((m) => (
            <ModuleChip
              key={m.id}
              id={m.id}
              label={m.label + " (server)"}
              activeId={activeModule}
              isUser
              clickable={!!onTogglePlacement && m.id !== "ipc"}
              onClick={() => onTogglePlacement?.(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Ring transition piler */}
      <div className="flex justify-center my-1 text-muted-foreground">
        <ArrowRight className="h-3.5 w-3.5 -rotate-90" />
      </div>

      {/* Kernel space */}
      <div
        className={`rounded-md border p-2 ${
          crash === "panic"
            ? "border-red-500/60 bg-red-500/10"
            : "border-brand/40 bg-brand/5"
        }`}
      >
        <div className="text-[10px] uppercase tracking-wider text-brand/80 mb-1 flex items-center justify-between">
          <span>Kernel space (ring 0)</span>
          {crash === "panic" && (
            <span className="text-red-500 font-bold flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              KERNEL PANIC
            </span>
          )}
          {crash === "isolated" && (
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Driver isolert — OS lever
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          <ModuleChip id="scheduler" label="Scheduler" activeId={null} />
          <ModuleChip id="vm" label="Minne" activeId={null} />
          {kernelModules.map((m) => (
            <ModuleChip
              key={m.id}
              id={m.id}
              label={m.label}
              activeId={activeModule}
              clickable={!!onTogglePlacement && m.id !== "ipc"}
              onClick={() => onTogglePlacement?.(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Stopwatch + step-log */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border border-border bg-card/60 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Stoppeklokke
          </div>
          <div className="text-lg font-mono font-bold tabular-nums">
            {stopwatch.toString().padStart(3, "0")} <span className="text-xs text-muted-foreground">µ-tu</span>
          </div>
        </div>
        <div className="rounded-md border border-border bg-card/60 p-2 col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Steg {Math.min(progress, steps.length)} / {steps.length}
          </div>
          <div className="text-xs leading-tight mt-0.5 min-h-[28px]">
            {progress === 0 && <span className="text-muted-foreground">Venter på syscall…</span>}
            {progress > 0 && progress <= steps.length && (
              <span>{steps[progress - 1].label}</span>
            )}
            {progress > steps.length && (
              <span className="text-emerald-500 font-medium">Syscall fullført.</span>
            )}
          </div>
        </div>
      </div>

      {onTogglePlacement && (
        <div className="mt-2 text-[11px] text-muted-foreground italic">
          Klikk på en modul-brikke for å flytte den mellom user/kernel space.
        </div>
      )}

      {arch === "micro" && crash === "panic" && (
        <div className="mt-2 text-[11px] text-red-500">
          Du dro disk-driveren <em>inn</em> i kernel space — så ble den
          microkjernen din monolittisk for det subsystemet. Krasj = panic.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ModuleChip({
  id,
  label,
  activeId,
  isUser,
  clickable,
  onClick,
}: {
  id: string;
  label: string;
  activeId: ModuleId | null;
  isUser?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}) {
  const active = activeId === id;
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border transition-all";
  const colour = isUser
    ? "border-zinc-400/40 bg-zinc-500/10"
    : "border-brand/40 bg-brand/10";
  const activeRing = active ? "ring-2 ring-amber-400 scale-105" : "";
  const clickStyle = clickable ? "cursor-pointer hover:bg-amber-500/20" : "cursor-default";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      title={clickable ? "Klikk for å flytte til andre siden" : undefined}
      className={`${base} ${colour} ${activeRing} ${clickStyle}`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------

function ScoreBoard({
  mono,
  micro,
  elapsedMono,
  elapsedMicro,
}: {
  mono: { ringSwitches: number; cost: number };
  micro: { ringSwitches: number; cost: number };
  elapsedMono: number;
  elapsedMicro: number;
}) {
  const overheadPct = mono.cost > 0 ? Math.round(((micro.cost - mono.cost) / mono.cost) * 100) : 0;
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      <div>
        <div className="font-semibold text-foreground mb-1">Teoretisk kostnad</div>
        <div className="text-muted-foreground">
          Monolitt: <span className="text-foreground font-mono">{mono.cost} µ-tu</span>
        </div>
        <div className="text-muted-foreground">
          Microkernel: <span className="text-foreground font-mono">{micro.cost} µ-tu</span>
        </div>
        <div className="text-muted-foreground mt-1">
          Overhead: <span className={overheadPct > 0 ? "text-amber-500 font-semibold" : "text-emerald-500"}>{overheadPct > 0 ? `+${overheadPct}%` : `${overheadPct}%`}</span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-foreground mb-1">Målt etter siste kjøring</div>
        <div className="text-muted-foreground">
          Monolitt: <span className="text-foreground font-mono">{elapsedMono} µ-tu</span>
        </div>
        <div className="text-muted-foreground">
          Microkernel: <span className="text-foreground font-mono">{elapsedMicro} µ-tu</span>
        </div>
      </div>
      <div>
        <div className="font-semibold text-foreground mb-1 flex items-center gap-1">
          <ShieldX className="h-3.5 w-3.5 text-red-500" /> Fault-isolation
        </div>
        <div className="text-muted-foreground">
          Monolitt: <span className="text-red-500">én feil = panic</span>
        </div>
        <div className="text-muted-foreground">
          Microkernel: <span className="text-emerald-500">krasj begrenset til server-prosess</span>
        </div>
      </div>
    </div>
  );
}
