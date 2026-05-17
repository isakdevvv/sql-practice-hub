import { useState } from "react";
import {
  Play,
  RotateCcw,
  Bug,
  ShieldAlert,
  ShieldCheck,
  Boxes,
  Cpu,
  HardDrive,
  AlertTriangle,
  Skull,
} from "lucide-react";

// ---------------------------------------------------------------------------
// VmVsContainer — isolasjons-modell, ressursbruk, kernel-bug og escape-overflate
// ---------------------------------------------------------------------------
// Tre kjøremoduser:
//   1. "spawn"   — start N instanser av samme app i hver modell. Vis RAM-bruk
//                  og oppstartstid.
//   2. "krasj"   — trigge en kernel-bug. VM: bare den ene VM-en krasjer.
//                  Container: alle containere kollapser fordi de deler kernel.
//   3. "escape"  — vis hvor mye angrepsflate en angriper må finne hull i.
//                  VM = hypervisor (lite, herdet); Container = hele Linux
//                  syscall-API (300+ kall + ioctls).
// ---------------------------------------------------------------------------

type Mode = "spawn" | "krasj" | "escape";

const APP_RAM_MB = 30; // bare appens egen RAM
const VM_OVERHEAD_MB = 280; // gjeste-kernel + initramfs + systemd
const CONTAINER_OVERHEAD_MB = 6; // namespace-bookkeeping

const VM_BOOT_S = 18;
const CONTAINER_BOOT_S = 0.15;

type State = "off" | "running" | "crashed";

const NAMESPACES: { code: string; what: string }[] = [
  { code: "pid", what: "egen PID-tre (PID 1 i container)" },
  { code: "net", what: "eget eth0, ruting, brannmur" },
  { code: "mnt", what: "eget rotfilsystem" },
  { code: "uts", what: "eget hostname" },
  { code: "ipc", what: "egen shared mem / msg queue" },
  { code: "user", what: "eget uid/gid-tre" },
  { code: "cgroup", what: "egen cgroup-rot" },
];

const CGROUPS: { code: string; what: string }[] = [
  { code: "cpu.max", what: "maks CPU-tid (f.eks. 50000/100000 = 50 %)" },
  { code: "memory.max", what: "maks RAM før OOM-kill (f.eks. 200M)" },
  { code: "io.max", what: "maks IOPS / MB-per-sec til disk" },
  { code: "pids.max", what: "maks antall PID-er (mot fork-bomb)" },
];

export function VmVsContainer() {
  const [count, setCount] = useState(4);
  const [mode, setMode] = useState<Mode>("spawn");
  const [vmStates, setVmStates] = useState<State[]>(["off", "off", "off", "off"]);
  const [ctStates, setCtStates] = useState<State[]>(["off", "off", "off", "off"]);
  const [spawned, setSpawned] = useState(false);

  function syncStateArrays(n: number, val: State) {
    return Array.from({ length: n }, () => val);
  }

  function spawn() {
    setMode("spawn");
    setVmStates(syncStateArrays(count, "running"));
    setCtStates(syncStateArrays(count, "running"));
    setSpawned(true);
  }

  function triggerKernelBug() {
    if (!spawned) spawn();
    setMode("krasj");
    // VM: bare første VM krasjer (kernel-bug i ÉN gjeste-kernel).
    // Container: alle krasjer (felles host-kernel).
    setVmStates((prev) =>
      prev.map((s, i) => (i === 0 ? "crashed" : s === "off" ? "running" : s)),
    );
    setCtStates((prev) => prev.map(() => "crashed"));
  }

  function triggerEscape() {
    if (!spawned) spawn();
    setMode("escape");
  }

  function reset() {
    setMode("spawn");
    setVmStates(syncStateArrays(count, "off"));
    setCtStates(syncStateArrays(count, "off"));
    setSpawned(false);
  }

  function setCountClamped(n: number) {
    const clamped = Math.max(1, Math.min(8, n));
    setCount(clamped);
    setVmStates(syncStateArrays(clamped, "off"));
    setCtStates(syncStateArrays(clamped, "off"));
    setSpawned(false);
    setMode("spawn");
  }

  const vmRam = (VM_OVERHEAD_MB + APP_RAM_MB) * count;
  const ctRam = CONTAINER_OVERHEAD_MB * count + APP_RAM_MB * count;
  const vmBoot = VM_BOOT_S; // parallell oppstart
  const ctBoot = CONTAINER_BOOT_S;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Boxes className="h-4 w-4 text-brand" />
            VM vs container — isolasjon, ressurser, angrepsflate
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Start samme app i begge modeller. Trigg en kernel-bug eller et
            escape-forsøk og se hvilken side overlever.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs">
            <span className="text-muted-foreground">Antall instanser:</span>
            <button
              type="button"
              onClick={() => setCountClamped(count - 1)}
              className="px-1.5 rounded hover:bg-muted"
            >
              −
            </button>
            <span className="font-mono font-semibold w-4 text-center">{count}</span>
            <button
              type="button"
              onClick={() => setCountClamped(count + 1)}
              className="px-1.5 rounded hover:bg-muted"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={spawn}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5" />
            Start {count} instanser
          </button>
          <button
            type="button"
            onClick={triggerKernelBug}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/40 text-red-500 text-sm hover:bg-red-500/10"
          >
            <Bug className="h-3.5 w-3.5" />
            Kernel-bug
          </button>
          <button
            type="button"
            onClick={triggerEscape}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-500/40 text-amber-500 text-sm hover:bg-amber-500/10"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Escape-forsøk
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
        <ModelColumn
          title="Virtuelle maskiner"
          subtitle="Egen kernel per VM — sterk isolasjon"
          accent="emerald"
          states={vmStates}
          ram={vmRam}
          bootTime={vmBoot}
          mode={mode}
          stack={[
            "Gjeste-app (× N)",
            "Gjeste-kernel (× N — eget per VM)",
            "Virtuell HW (emulert av hypervisor)",
            "Hypervisor (ESXi/KVM/VirtualBox)",
            "Hardware",
          ]}
        />
        <ModelColumn
          title="Containere"
          subtitle="Delt host-kernel — namespace + cgroup-grenser"
          accent="sky"
          states={ctStates}
          ram={ctRam}
          bootTime={ctBoot}
          mode={mode}
          stack={[
            "Container-app (× N)",
            "Namespaces + cgroups (× N — bare en filter på prosessen)",
            "Host-kernel (DELT — én eneste)",
            "Hardware",
          ]}
        />
      </div>

      {mode === "krasj" && (
        <KernelBugExplainer />
      )}

      {mode === "escape" && (
        <EscapeExplainer />
      )}

      {mode === "spawn" && (
        <NamespaceCgroupExplainer />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ModelColumn({
  title,
  subtitle,
  accent,
  states,
  ram,
  bootTime,
  mode,
  stack,
}: {
  title: string;
  subtitle: string;
  accent: "emerald" | "sky";
  states: State[];
  ram: number;
  bootTime: number;
  mode: Mode;
  stack: string[];
}) {
  const accentText =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-sky-600 dark:text-sky-400";
  const accentBorder =
    accent === "emerald" ? "border-emerald-500/40" : "border-sky-500/40";
  const accentBg =
    accent === "emerald" ? "bg-emerald-500/5" : "bg-sky-500/5";

  const aliveCount = states.filter((s) => s === "running").length;
  const total = states.length;

  return (
    <div className={`rounded-lg border ${accentBorder} ${accentBg} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-sm font-semibold ${accentText}`}>{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Levende / total
          </div>
          <div className="text-xl font-mono font-bold tabular-nums">
            {aliveCount}
            <span className="text-xs text-muted-foreground">/{total}</span>
          </div>
        </div>
      </div>

      {/* Stack-visualisering */}
      <div className="space-y-1 mb-3">
        {stack.map((s, i) => {
          const isKernelLayer = s.toLowerCase().includes("kernel");
          const isHostKernel = s.includes("Host-kernel") && s.includes("DELT");
          return (
            <div
              key={i}
              className={`rounded-md border px-2.5 py-1 text-[11px] ${
                isHostKernel && mode === "krasj"
                  ? "border-red-500/60 bg-red-500/15 text-red-600 dark:text-red-400 font-semibold"
                  : isKernelLayer
                    ? "border-brand/40 bg-brand/10"
                    : "border-border bg-background/40"
              }`}
            >
              {s}
              {isHostKernel && mode === "krasj" && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px]">
                  <AlertTriangle className="h-3 w-3" /> KERNEL PANIC
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Instans-rad */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {states.map((s, i) => (
          <Instance key={i} state={s} index={i} accent={accent} />
        ))}
      </div>

      {/* Mini-stats */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-border bg-card/60 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Cpu className="h-3 w-3" /> RAM-bruk (N instanser)
          </div>
          <div className="font-mono font-semibold tabular-nums">
            {ram.toLocaleString("nb-NO")} MB
          </div>
        </div>
        <div className="rounded-md border border-border bg-card/60 p-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <HardDrive className="h-3 w-3" /> Oppstartstid
          </div>
          <div className="font-mono font-semibold tabular-nums">
            {bootTime < 1 ? `${(bootTime * 1000).toFixed(0)} ms` : `${bootTime} s`}
          </div>
        </div>
      </div>
    </div>
  );
}

function Instance({
  state,
  index,
  accent,
}: {
  state: State;
  index: number;
  accent: "emerald" | "sky";
}) {
  const baseColor =
    accent === "emerald" ? "border-emerald-500/40" : "border-sky-500/40";
  const liveBg = accent === "emerald" ? "bg-emerald-500/15" : "bg-sky-500/15";

  return (
    <div
      className={`relative w-12 h-10 rounded-md border flex items-center justify-center text-[11px] font-mono font-semibold transition-all ${
        state === "crashed"
          ? "border-red-500/60 bg-red-500/10 text-red-500"
          : state === "running"
            ? `${baseColor} ${liveBg}`
            : "border-dashed border-border bg-background/30 text-muted-foreground/50"
      }`}
      title={`Instans #${index + 1} — ${state}`}
    >
      {state === "crashed" ? <Skull className="h-4 w-4" /> : `#${index + 1}`}
    </div>
  );
}

// ---------------------------------------------------------------------------

function KernelBugExplainer() {
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs">
      <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <Bug className="h-3.5 w-3.5 text-red-500" />
        Kernel-bug-scenario
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
        <div>
          <div className="font-medium text-foreground mb-0.5">VM-siden</div>
          Bare første gjeste-kernel panicker. De andre VM-ene har sin egen
          kopi av kernelen og merker ingenting. Hypervisoren rydder, restarter
          eventuelt den ene VM-en. Andre tenants på maskinen er upåvirket.
        </div>
        <div>
          <div className="font-medium text-foreground mb-0.5">Container-siden</div>
          Alle containere ligger på samme host-kernel. Når kernelen panicker
          dør alle samtidig — pluss vert-maskinen selv. Dette er hovedgrunnen
          til at multi-tenant cloud-providers ikke gir kunder ren container-isolasjon
          uten en VM under.
        </div>
      </div>
    </div>
  );
}

function EscapeExplainer() {
  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
      <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
        Escape-forsøk — hva må angriperen knekke?
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" /> VM: hypervisor
          </div>
          <ul className="text-muted-foreground space-y-1 list-disc pl-4">
            <li>Angrepsflate: hypervisorens emulering av virtuell HW
              (cirka 50–200k linjer C — qemu/vmware-vmm).</li>
            <li>Krever en bug i selve hypervisor-bin (CVE-2024-... type).</li>
            <li>Mye færre release hver måned, sterkt herdet.</li>
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400 mb-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Container: hele kernel-API
          </div>
          <ul className="text-muted-foreground space-y-1 list-disc pl-4">
            <li>Angrepsflate: hele Linux syscall-API (~350 syscalls
              + ioctls + netlink + eBPF + procfs/sysfs).</li>
            <li>Bug i en hvilken som helst syscall som gjør at
              namespace-/cgroup-filteret kan omgås = utbrudd.</li>
            <li>Seccomp-filter (Docker har standard-profil) reduserer
              flaten — men angriperen trenger fortsatt bare ett kernel-hull.</li>
          </ul>
        </div>
      </div>
      <p className="mt-2 italic text-muted-foreground">
        Konklusjon: container-isolasjon er <strong>OK for samme tillitsdomene</strong>
        (mikroservicer som tilhører samme team), men <strong>ikke for
        utrustig kode</strong> (multi-tenant cloud, plugin-systemer) — der må
        det være en VM rundt.
      </p>
    </div>
  );
}

function NamespaceCgroupExplainer() {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-3 text-xs">
      <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
        <Boxes className="h-3.5 w-3.5 text-brand" />
        Hvordan containerens «illusjon» konkret bygges
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="font-medium text-foreground mb-1">Namespaces — «hva ser jeg?»</div>
          <ul className="text-muted-foreground space-y-0.5 text-[11px]">
            {NAMESPACES.map((n) => (
              <li key={n.code}>
                <code className="font-mono text-foreground">{n.code}</code>{" "}
                — {n.what}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium text-foreground mb-1">cgroups — «hvor mye får jeg?»</div>
          <ul className="text-muted-foreground space-y-0.5 text-[11px]">
            {CGROUPS.map((c) => (
              <li key={c.code}>
                <code className="font-mono text-foreground">{c.code}</code>{" "}
                — {c.what}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-2 text-muted-foreground italic">
        Containeren er <em>ikke</em> en mini-VM — det er en helt vanlig prosess
        der kernelen har bunte sammen syv namespace-filter og noen
        ressurskvoter rundt den. Når du <code className="font-mono">docker run</code>{" "}
        er det <code className="font-mono">clone()</code>{" "}
        med <code className="font-mono">CLONE_NEWNS|CLONE_NEWPID|...</code> + skriv
        til cgroup-filer.
      </p>
    </div>
  );
}
