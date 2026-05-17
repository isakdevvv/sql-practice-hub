import { useEffect, useState } from "react";
import {
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Terminal,
  Server,
  Boxes,
  Cpu,
  ArrowDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// SyscallFlowDiagram — animer write(fd, buf, len) gjennom native / VM / container
// ---------------------------------------------------------------------------
// Pedagogisk poeng:
//   - Native:    app → kernel → device. 1 ring-bytte tur/retur.
//   - VM:        app → gjeste-kernel → VMEXIT → hypervisor → host-kernel
//                → device → tilbake hele veien. Mange flere bytter.
//   - Container: app → host-kernel (med seccomp/namespace-vetting) → device.
//                Tilnærmet samme som native — bare et lite filter.
//
// Brukeren kan zoome (ekspandere) hvert steg for å se hva som faktisk skjer.
// ---------------------------------------------------------------------------

type Track = "native" | "vm" | "container";

type Step = {
  label: string;
  detail: string;
  ringSwitch: boolean;
  emphasis?: "vmexit" | "vmenter" | "seccomp" | "device";
};

const NATIVE: Step[] = [
  {
    label: "app: write(fd=1, buf, 4096)",
    detail:
      "Bibliotekfunksjonen write() i glibc legger argumenter i registre (rax=1, rdi=fd, rsi=buf, rdx=len) og kjører syscall-instruksjonen.",
    ringSwitch: false,
  },
  {
    label: "user → kernel (syscall)",
    detail:
      "CPU bytter til ring 0 via SYSCALL-instruksjonen. Bytter %cs/%ss og hopper til entry_SYSCALL_64. Bevarer registre i pt_regs på kernel-stacken.",
    ringSwitch: true,
  },
  {
    label: "kernel: sys_write → VFS → fs",
    detail:
      "Virtuelt filsystem-laget (VFS) router til riktig filsystem (ext4/xfs/...). Side-tabeller, journal-skriv, page-cache.",
    ringSwitch: false,
  },
  {
    label: "device: skriv til disk",
    detail:
      "Block-laget setter sammen I/O-request, sender til driver (NVMe/AHCI). DMA flytter data direkte fra page-cache til disk.",
    ringSwitch: false,
    emphasis: "device",
  },
  {
    label: "kernel → user (return)",
    detail:
      "Disk-kontrolleren fyrer interrupt → kernel kjører do_softirq → returnerer fra syscall. SYSRET-instruksjon bytter tilbake til ring 3.",
    ringSwitch: true,
  },
];

const VM: Step[] = [
  {
    label: "gjeste-app: write(fd=1, buf, 4096)",
    detail:
      "Akkurat samme SYSCALL-instruksjon som native — gjeste-app vet ikke at den er i en VM.",
    ringSwitch: false,
  },
  {
    label: "gjest user → gjest kernel",
    detail:
      "CPU er allerede i «guest mode» (VT-x). Bytter til ring 0 inni gjesten — så langt ingen hypervisor-involvering.",
    ringSwitch: true,
  },
  {
    label: "gjeste-kernel: sys_write → device-driver",
    detail:
      "Gjeste-kernelens write-implementasjon kjører som om disken var ekte. Den prøver f.eks. å skrive til en port (in/out) eller MMIO-region.",
    ringSwitch: false,
  },
  {
    label: "VMEXIT — hypervisor tar over",
    detail:
      "Den privilegerte instruksjonen (port-IO eller skriv til ikke-tilstedeværende MMIO) trapper. CPU dumper hele gjeste-state til VMCS-strukturen og hopper til hypervisor i «host mode».",
    ringSwitch: true,
    emphasis: "vmexit",
  },
  {
    label: "hypervisor → host-kernel write",
    detail:
      "Hypervisoren oversetter virtuelt disk-blokk-nr til en fil-offset i qcow2/vmdk-imagefilen, og kaller pwrite() på host-OS. (Type-2: nytt syscall. Type-1: direkte blokk-IO.)",
    ringSwitch: false,
  },
  {
    label: "host: device (samme som native)",
    detail:
      "Til slutt havner data fysisk på disk-kontrolleren — samme vei som native-tilfellet.",
    ringSwitch: false,
    emphasis: "device",
  },
  {
    label: "VMENTER — tilbake i gjest",
    detail:
      "Hypervisoren laster gjeste-state fra VMCS, kjører VMENTER. CPU er igjen i guest-mode med gjeste-kernel som «kjørte videre».",
    ringSwitch: true,
    emphasis: "vmenter",
  },
  {
    label: "gjest kernel → gjest user",
    detail:
      "Vanlig SYSRET inni gjesten. write() returnerer til appen, som ikke har anelse om hva som har skjedd.",
    ringSwitch: true,
  },
];

const CONTAINER: Step[] = [
  {
    label: "container-app: write(fd=1, buf, 4096)",
    detail:
      "App-binæren inne i containeren. Ingen ekstra wrapper — samme SYSCALL-instruksjon.",
    ringSwitch: false,
  },
  {
    label: "user → host-kernel (syscall)",
    detail:
      "Ingen «gjeste-kernel» — vi treffer host-kernelen direkte. Samme ene ring-bytte som native.",
    ringSwitch: true,
  },
  {
    label: "seccomp-filter (BPF) vetting",
    detail:
      "Hvis containeren er startet med en seccomp-profil (Docker har default én) sjekker kernelen syscall-nummeret. Default-profilen blokkerer ~44 farlige kall (mount, ptrace, kexec_load, ...).",
    ringSwitch: false,
    emphasis: "seccomp",
  },
  {
    label: "namespace-filter (mnt, pid, net)",
    detail:
      "VFS-laget bruker prosessens mnt_ns til å slå opp filen i containerens isolerte mount-tre. PID-/net-namespace gjelder andre operasjoner. Bare et filter på toppen av samme kjernekall.",
    ringSwitch: false,
  },
  {
    label: "kernel: sys_write → device",
    detail:
      "Helt vanlig sys_write. Page-cache, block-IO, DMA — alt akkurat som native. Cgroup-laget kan kveke skrivehastigheten (io.max).",
    ringSwitch: false,
    emphasis: "device",
  },
  {
    label: "kernel → user (return)",
    detail:
      "SYSRET tilbake til container-prosessen. Total kostnad: ~5 % over native (mest fra seccomp-BPF).",
    ringSwitch: true,
  },
];

function countSwitches(steps: Step[]) {
  return steps.filter((s) => s.ringSwitch).length;
}

const NATIVE_SW = countSwitches(NATIVE);
const VM_SW = countSwitches(VM);
const CONTAINER_SW = countSwitches(CONTAINER);

export function SyscallFlowDiagram() {
  const [step, setStep] = useState({ native: 0, vm: 0, container: 0 });
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const TICK_MS = 600;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setStep((prev) => {
        const next = {
          native: Math.min(prev.native + 1, NATIVE.length),
          vm: Math.min(prev.vm + 1, VM.length),
          container: Math.min(prev.container + 1, CONTAINER.length),
        };
        if (
          next.native === NATIVE.length &&
          next.vm === VM.length &&
          next.container === CONTAINER.length
        ) {
          setRunning(false);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearTimeout(t);
  }, [running, step]);

  function play() {
    setStep({ native: 0, vm: 0, container: 0 });
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setStep({ native: 0, vm: 0, container: 0 });
    setExpanded({});
  }

  function toggle(track: Track, i: number) {
    const key = `${track}-${i}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-brand" />
            Syscall-flyt: <code className="text-xs">write(fd, buf, 4096)</code>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Samme syscall trigget i tre miljøer. Klikk på et steg for å se
            hva som faktisk skjer der. Sammenlign antallet ring-bytter.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={play}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Spill av alle tre
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TrackColumn
          track="native"
          title="Native (ingen virt.)"
          subtitle="Vanlig prosess på vanlig OS"
          Icon={Terminal}
          accent="zinc"
          steps={NATIVE}
          progress={step.native}
          totalSwitches={NATIVE_SW}
          expanded={expanded}
          onToggle={toggle}
        />
        <TrackColumn
          track="vm"
          title="Virtuell maskin"
          subtitle="Gjeste-OS over hypervisor"
          Icon={Server}
          accent="emerald"
          steps={VM}
          progress={step.vm}
          totalSwitches={VM_SW}
          expanded={expanded}
          onToggle={toggle}
        />
        <TrackColumn
          track="container"
          title="Container"
          subtitle="Delt host-kernel + namespace-filter"
          Icon={Boxes}
          accent="sky"
          steps={CONTAINER}
          progress={step.container}
          totalSwitches={CONTAINER_SW}
          expanded={expanded}
          onToggle={toggle}
        />
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-3 text-xs">
        <div className="font-semibold text-foreground mb-1">
          Lesning av kolonnene
        </div>
        <ul className="text-muted-foreground space-y-1 list-disc pl-5">
          <li>
            <strong className="text-foreground">Native:</strong> 2 mode-bytter
            totalt (inn + ut). Dette er gulvet.
          </li>
          <li>
            <strong className="text-foreground">VM:</strong> {VM_SW} bytter —
            hver privilegert operasjon i gjesten må gjennom VMEXIT/VMENTER.
            Moderne CPU-er har EPT/NPT for å redusere dette for minne-aksess,
            men I/O koster fortsatt.
          </li>
          <li>
            <strong className="text-foreground">Container:</strong> {CONTAINER_SW}{" "}
            bytter — samme som native. Seccomp-BPF er ren in-kernel-sjekk, ingen
            ekstra mode-bytter. Throughput-tap er typisk &lt; 5 %.
          </li>
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function TrackColumn({
  track,
  title,
  subtitle,
  Icon,
  accent,
  steps,
  progress,
  totalSwitches,
  expanded,
  onToggle,
}: {
  track: Track;
  title: string;
  subtitle: string;
  Icon: typeof Terminal;
  accent: "zinc" | "emerald" | "sky";
  steps: Step[];
  progress: number;
  totalSwitches: number;
  expanded: Record<string, boolean>;
  onToggle: (t: Track, i: number) => void;
}) {
  const accentText =
    accent === "zinc"
      ? "text-zinc-600 dark:text-zinc-300"
      : accent === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-sky-600 dark:text-sky-400";
  const accentBorder =
    accent === "zinc"
      ? "border-zinc-500/30"
      : accent === "emerald"
        ? "border-emerald-500/40"
        : "border-sky-500/40";
  const accentBg =
    accent === "zinc"
      ? "bg-zinc-500/5"
      : accent === "emerald"
        ? "bg-emerald-500/5"
        : "bg-sky-500/5";

  const passedSwitches = steps
    .slice(0, progress)
    .filter((s) => s.ringSwitch).length;

  return (
    <div className={`rounded-lg border ${accentBorder} ${accentBg} p-3`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2">
          <Icon className={`h-4 w-4 mt-0.5 ${accentText}`} />
          <div>
            <div className={`text-sm font-semibold ${accentText}`}>{title}</div>
            <div className="text-[11px] text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Bytter
          </div>
          <div className="text-base font-mono font-bold tabular-nums">
            {passedSwitches}
            <span className="text-[11px] text-muted-foreground">
              /{totalSwitches}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {steps.map((s, i) => {
          const key = `${track}-${i}`;
          const passed = i < progress;
          const active = i === progress - 1;
          const isExpanded = expanded[key];
          const emphasisColor =
            s.emphasis === "vmexit"
              ? "border-amber-500/60 bg-amber-500/10"
              : s.emphasis === "vmenter"
                ? "border-amber-500/60 bg-amber-500/10"
                : s.emphasis === "seccomp"
                  ? "border-purple-500/50 bg-purple-500/10"
                  : s.emphasis === "device"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "";
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => onToggle(track, i)}
                className={`w-full text-left rounded-md border px-2 py-1.5 text-[11px] transition-all ${
                  active
                    ? "border-amber-400 bg-amber-400/15 ring-1 ring-amber-400"
                    : passed
                      ? emphasisColor ||
                        "border-border bg-background/60 text-foreground"
                      : "border-border bg-background/30 text-muted-foreground/70"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {s.ringSwitch && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                        title="Ring-bytte"
                      />
                    )}
                    <span className="truncate">{s.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </div>
                {isExpanded && (
                  <div className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground border-t border-border/60 pt-1.5">
                    {s.detail}
                  </div>
                )}
              </button>
              {i < steps.length - 1 && (
                <div className="flex justify-center my-0.5 text-muted-foreground/50">
                  <ArrowDown className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
