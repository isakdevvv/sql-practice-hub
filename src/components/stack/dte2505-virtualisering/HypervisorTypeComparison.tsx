import { useEffect, useMemo, useState } from "react";
import {
  Play,
  RotateCcw,
  Zap,
  Server,
  Monitor,
  Layers,
  Gauge,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// HypervisorTypeComparison — splittskjerm Type-1 (bare-metal) vs Type-2 (hosted)
// ---------------------------------------------------------------------------
// Pedagogisk poeng:
//   - Type 1 (ESXi/Xen/KVM): gjeste-OS → hypervisor → hardware. Færre lag,
//     færre ring-bytter, lavere overhead. Brukes i datasentre/sky.
//   - Type 2 (VirtualBox/Parallels/VMware Workstation): gjeste-OS → hypervisor
//     → host-OS → hardware. Ett ekstra lag = flere ring-bytter per syscall.
//
// Når brukeren trigger en disk-read i gjesten, animerer vi pakkens reise
// gjennom lagene og teller ring-bytter / context-switches.
// ---------------------------------------------------------------------------

type HypType = "type1" | "type2";

type Layer = {
  id: string;
  label: string;
  ring: 0 | 3 | "hw"; // ring 0 = privilegert, ring 3 = user, hw = under OS
  blurb: string;
};

// Lag-stack for hver type, fra bunn (hardware) til topp (gjeste-app).
const TYPE1_LAYERS: Layer[] = [
  { id: "hw", label: "Hardware (CPU/RAM/disk)", ring: "hw", blurb: "Fysisk maskin. VT-x/AMD-V gir hypervisor egen ekstra ring (root-mode)." },
  { id: "hyp", label: "Hypervisor (ESXi / KVM / Xen)", ring: 0, blurb: "Kjører bare-metal som «kernel». Eier alle device-drivere." },
  { id: "guest-kernel", label: "Gjeste-kernel (Linux/Windows)", ring: 0, blurb: "Tror selv at den er på bare-metal. Hypervisor fanger opp privilegerte instruksjoner (VMEXIT)." },
  { id: "guest-app", label: "Gjeste-app (read syscall)", ring: 3, blurb: "Vanlig user-space-prosess inni VM-en." },
];

const TYPE2_LAYERS: Layer[] = [
  { id: "hw", label: "Hardware (CPU/RAM/disk)", ring: "hw", blurb: "Fysisk maskin." },
  { id: "host-kernel", label: "Host-OS-kernel (macOS/Windows/Linux)", ring: 0, blurb: "Vanlig kernel. Hypervisoren er bare en av mange prosesser." },
  { id: "hyp", label: "Hypervisor-app (VirtualBox/VMware Workst.)", ring: 3, blurb: "User-mode-prosess (med kernel-extension/driver for VT-x). Hvert syscall fra gjest må først stoppe i host-kernel." },
  { id: "guest-kernel", label: "Gjeste-kernel (Linux/Windows)", ring: 0, blurb: "Kjører på «virtuell hardware» som hypervisoren emulerer." },
  { id: "guest-app", label: "Gjeste-app (read syscall)", ring: 3, blurb: "Vanlig user-space-prosess inni VM-en." },
];

// Pakke-rute for et disk-read syscall, ovenfra (app) og ned, så tilbake.
// Vi setter en `ringSwitch`-flagg på steg som krysser user↔kernel eller
// inn/ut av hypervisor-grensen.
type Step = {
  from: string;
  to: string;
  label: string;
  ringSwitch: boolean;
  cost: number; // abstrakt mikro-tu
};

const TYPE1_PATH: Step[] = [
  { from: "guest-app", to: "guest-kernel", label: "read() — user→kernel i gjest", ringSwitch: true, cost: 1 },
  { from: "guest-kernel", to: "hyp", label: "VMEXIT — gjest privilegerte instruksjon fanges", ringSwitch: true, cost: 2 },
  { from: "hyp", to: "hw", label: "Hypervisor sender til ekte disk", ringSwitch: false, cost: 1 },
  { from: "hw", to: "hyp", label: "Disk svarer", ringSwitch: false, cost: 1 },
  { from: "hyp", to: "guest-kernel", label: "VMENTER — tilbake i gjeste-kernel", ringSwitch: true, cost: 2 },
  { from: "guest-kernel", to: "guest-app", label: "kernel→user i gjest", ringSwitch: true, cost: 1 },
];

const TYPE2_PATH: Step[] = [
  { from: "guest-app", to: "guest-kernel", label: "read() — user→kernel i gjest", ringSwitch: true, cost: 1 },
  { from: "guest-kernel", to: "hyp", label: "Fanges av hypervisor-prosessen", ringSwitch: true, cost: 2 },
  { from: "hyp", to: "host-kernel", label: "Hypervisor må selv gjøre syscall til host-OS", ringSwitch: true, cost: 2 },
  { from: "host-kernel", to: "hw", label: "Host-kernel sender til ekte disk", ringSwitch: false, cost: 1 },
  { from: "hw", to: "host-kernel", label: "Disk svarer", ringSwitch: false, cost: 1 },
  { from: "host-kernel", to: "hyp", label: "Host returnerer til hypervisor (user-mode)", ringSwitch: true, cost: 2 },
  { from: "hyp", to: "guest-kernel", label: "Hypervisor injiserer svar i gjeste-kernel", ringSwitch: true, cost: 2 },
  { from: "guest-kernel", to: "guest-app", label: "kernel→user i gjest", ringSwitch: true, cost: 1 },
];

function totals(steps: Step[]) {
  const switches = steps.filter((s) => s.ringSwitch).length;
  const cost = steps.reduce((s, x) => s + x.cost, 0);
  return { switches, cost };
}

const T1_TOTALS = totals(TYPE1_PATH);
const T2_TOTALS = totals(TYPE2_PATH);

// Stiliserte boot-tider og ytelse (relativ til bare-metal = 100).
const PERF = {
  type1: { boot: 22, throughput: 96 },
  type2: { boot: 38, throughput: 78 },
};

export function HypervisorTypeComparison() {
  const [runT1, setRunT1] = useState(false);
  const [runT2, setRunT2] = useState(false);
  const [stepT1, setStepT1] = useState(0);
  const [stepT2, setStepT2] = useState(0);
  const [counterT1, setCounterT1] = useState(0);
  const [counterT2, setCounterT2] = useState(0);
  const [costT1, setCostT1] = useState(0);
  const [costT2, setCostT2] = useState(0);

  useEffect(() => {
    if (!runT1) return;
    if (stepT1 >= TYPE1_PATH.length) {
      setRunT1(false);
      return;
    }
    const s = TYPE1_PATH[stepT1];
    const t = setTimeout(() => {
      setStepT1((p) => p + 1);
      if (s.ringSwitch) setCounterT1((c) => c + 1);
      setCostT1((c) => c + s.cost);
    }, 380 + s.cost * 90);
    return () => clearTimeout(t);
  }, [runT1, stepT1]);

  useEffect(() => {
    if (!runT2) return;
    if (stepT2 >= TYPE2_PATH.length) {
      setRunT2(false);
      return;
    }
    const s = TYPE2_PATH[stepT2];
    const t = setTimeout(() => {
      setStepT2((p) => p + 1);
      if (s.ringSwitch) setCounterT2((c) => c + 1);
      setCostT2((c) => c + s.cost);
    }, 380 + s.cost * 90);
    return () => clearTimeout(t);
  }, [runT2, stepT2]);

  function runBoth() {
    setStepT1(0);
    setStepT2(0);
    setCounterT1(0);
    setCounterT2(0);
    setCostT1(0);
    setCostT2(0);
    setRunT1(true);
    setRunT2(true);
  }

  function reset() {
    setRunT1(false);
    setRunT2(false);
    setStepT1(0);
    setStepT2(0);
    setCounterT1(0);
    setCounterT2(0);
    setCostT1(0);
    setCostT2(0);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand" />
            Disk-read syscall i gjest — Type-1 vs Type-2
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Samme operasjon (<code className="font-mono">read(fd, buf, 4096)</code>)
            sendt fra gjeste-app. Tell hvor mange ring-/mode-bytter pakka må gjennom
            før den er tilbake.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={runBoth}
            disabled={runT1 || runT2}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør disk-read i begge
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
        <HypervisorColumn
          title="Type 1 — bare-metal"
          subtitle="ESXi, Xen, KVM, Hyper-V"
          Icon={Server}
          accent="emerald"
          layers={TYPE1_LAYERS}
          path={TYPE1_PATH}
          step={stepT1}
          counter={counterT1}
          cost={costT1}
          theoretical={T1_TOTALS}
          perf={PERF.type1}
        />
        <HypervisorColumn
          title="Type 2 — hosted"
          subtitle="VirtualBox, Parallels, VMware Workstation"
          Icon={Monitor}
          accent="sky"
          layers={TYPE2_LAYERS}
          path={TYPE2_PATH}
          step={stepT2}
          counter={counterT2}
          cost={costT2}
          theoretical={T2_TOTALS}
          perf={PERF.type2}
        />
      </div>

      <ComparisonBars />
    </div>
  );
}

// ---------------------------------------------------------------------------

function HypervisorColumn({
  title,
  subtitle,
  Icon,
  accent,
  layers,
  path,
  step,
  counter,
  cost,
  theoretical,
  perf,
}: {
  title: string;
  subtitle: string;
  Icon: typeof Server;
  accent: "emerald" | "sky";
  layers: Layer[];
  path: Step[];
  step: number;
  counter: number;
  cost: number;
  theoretical: { switches: number; cost: number };
  perf: { boot: number; throughput: number };
}) {
  // Hvilken layer er "aktiv" akkurat nå?
  // Et steg går fra→til; vi highlighter target-laget under animering.
  const activeLayer = step > 0 && step <= path.length ? path[step - 1].to : null;
  const lastLabel =
    step === 0
      ? "Venter på syscall…"
      : step > path.length
        ? "Syscall fullført."
        : path[step - 1].label;

  const accentBorder =
    accent === "emerald" ? "border-emerald-500/40" : "border-sky-500/40";
  const accentBg = accent === "emerald" ? "bg-emerald-500/5" : "bg-sky-500/5";
  const accentText =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-sky-600 dark:text-sky-400";

  return (
    <div className={`rounded-lg border p-4 ${accentBorder} ${accentBg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <Icon className={`h-4 w-4 mt-0.5 ${accentText}`} />
          <div>
            <div className={`text-sm font-semibold ${accentText}`}>{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Ring-bytter
          </div>
          <div className="text-2xl font-mono font-bold tabular-nums">
            {counter}
            <span className="text-xs text-muted-foreground ml-1">
              / {theoretical.switches}
            </span>
          </div>
        </div>
      </div>

      {/* Lag-stack — øverst er gjeste-app, nederst er hardware */}
      <div className="space-y-1">
        {[...layers].reverse().map((l) => {
          const active = activeLayer === l.id;
          const ringLabel =
            l.ring === "hw"
              ? "HW"
              : l.ring === 0
                ? "ring 0"
                : "ring 3";
          return (
            <div
              key={l.id}
              className={`rounded-md border px-2.5 py-1.5 text-xs flex items-center justify-between gap-2 transition-all ${
                active
                  ? "border-amber-400 bg-amber-400/15 ring-1 ring-amber-400 scale-[1.01]"
                  : l.ring === 0
                    ? "border-brand/30 bg-brand/5"
                    : l.ring === "hw"
                      ? "border-zinc-500/30 bg-zinc-500/10"
                      : "border-border bg-background/60"
              }`}
              title={l.blurb}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {ringLabel}
                </span>
                <span className="truncate">{l.label}</span>
              </div>
              {active && (
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 shrink-0">
                  ← aktiv
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progresjons-log */}
      <div className="mt-3 rounded-md border border-border bg-card/60 p-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Steg {Math.min(step, path.length)} / {path.length}
        </div>
        <div className="text-xs leading-tight mt-0.5 min-h-[28px]">{lastLabel}</div>
      </div>

      {/* Mini-statistikk for denne kolonnen */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <Stat label="Sykluskost" value={`${cost} µ-tu`} Icon={Clock} />
        <Stat label="Boot-tid" value={`${perf.boot} s`} Icon={Clock} />
        <Stat label="I/O-throughput" value={`${perf.throughput} %`} Icon={Gauge} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Clock;
}) {
  return (
    <div className="rounded-md border border-border bg-card/60 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-mono font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ComparisonBars() {
  const bars = useMemo(
    () => [
      {
        label: "Ring-bytter per syscall",
        t1: T1_TOTALS.switches,
        t2: T2_TOTALS.switches,
        unit: "",
      },
      {
        label: "Boot-tid",
        t1: PERF.type1.boot,
        t2: PERF.type2.boot,
        unit: "s",
      },
      {
        label: "I/O-throughput (% av native)",
        t1: PERF.type1.throughput,
        t2: PERF.type2.throughput,
        unit: "%",
        higherIsBetter: true,
      },
    ],
    [],
  );

  return (
    <div className="rounded-md border border-border bg-muted/20 p-3">
      <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-brand" />
        Hvorfor type-1 vinner i datasenteret
      </div>
      <div className="space-y-2">
        {bars.map((b) => {
          const max = Math.max(b.t1, b.t2, 1);
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="text-muted-foreground">
                  T1: <span className="font-mono text-foreground">{b.t1}{b.unit}</span> · T2:{" "}
                  <span className="font-mono text-foreground">{b.t2}{b.unit}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-2 rounded bg-emerald-500/15 overflow-hidden">
                  <div
                    className={`h-full ${b.higherIsBetter ? "bg-emerald-500" : "bg-emerald-500"}`}
                    style={{ width: `${(b.t1 / max) * 100}%` }}
                  />
                </div>
                <div className="h-2 rounded bg-sky-500/15 overflow-hidden">
                  <div
                    className={`h-full ${b.higherIsBetter ? "bg-sky-500" : "bg-sky-500"}`}
                    style={{ width: `${(b.t2 / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Type-1 har ett mindre lag mellom gjest og hardware. Hver IO sparer
        2 mode-bytter (inn/ut av host-kernel). Akkumulert over millioner av
        syscalls per sekund blir det betydelig.
      </p>
    </div>
  );
}
