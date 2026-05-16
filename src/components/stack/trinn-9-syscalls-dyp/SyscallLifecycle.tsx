import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Shield,
  ShieldAlert,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Syscall-livssyklus — step gjennom hva som skjer fra user space ned i
// kernel og tilbake. Viser:
//   - User-kode og kernel-handler side om side
//   - CPU-registre (rax syscall-nummer + rdi/rsi/rdx args)
//   - Ring 3 ↔ Ring 0 modus-bytte
//   - Fil-deskriptor-tabell for prosessen
// ---------------------------------------------------------------------------

type Mode = "user" | "kernel";

type Registers = {
  rax: string;
  rdi: string;
  rsi: string;
  rdx: string;
};

type FdEntry = {
  fd: number;
  target: string;
  state?: "new" | "closed";
};

type Step = {
  userLine: number;
  kernelLine: number; // -1 hvis ikke i kjernen
  mode: Mode;
  registers: Registers;
  kernelDoing?: string;
  fileTable: FdEntry[];
  output?: string; // tekst som vises på terminalen / fila etter dette steget
  note: string;
  warn?: string;
};

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  userCode: string[];
  kernelCode: string[];
  steps: Step[];
};

const UNDEF = "??";

// --- scenario 1: write(1, "hei", 3) ---------------------------------------

function buildWriteScenario(): Scenario {
  const userCode = [
    '; mål: write(1, "hei", 3) — skriv 3 bytes til stdout',
    "mov rax, 1          ; rax = 1 (sys_write-nummer)",
    "mov rdi, 1          ; rdi = 1 (fd = stdout)",
    "mov rsi, buf        ; rsi = adresse til \"hei\"",
    "mov rdx, 3          ; rdx = 3 (bytes å skrive)",
    "syscall             ; trap → kernel, ring 3 → ring 0",
    "; nå er rax = antall bytes skrevet (3)",
  ];
  const kernelCode = [
    "entry_SYSCALL_64:",
    "  swapgs                       ; bytt til kernel-stack",
    "  call sys_call_table[rax]     ; dispatch på syscall-nummer",
    "",
    "sys_write(fd, buf, count):",
    "  task  = current()",
    "  file  = task->files[fd]",
    "  bytes = file->f_op->write(buf, count)",
    "  return bytes",
    "",
    "sysretq                        ; ring 0 → ring 3",
  ];

  const fdsBase: FdEntry[] = [
    { fd: 0, target: "/dev/tty (stdin)" },
    { fd: 1, target: "/dev/tty (stdout)" },
    { fd: 2, target: "/dev/tty (stderr)" },
  ];

  const r = (overrides: Partial<Registers>): Registers => ({
    rax: UNDEF,
    rdi: UNDEF,
    rsi: UNDEF,
    rdx: UNDEF,
    ...overrides,
  });

  return {
    id: "write",
    title: 'write(1, "hei", 3)',
    blurb:
      "Det enkleste eksempelet: legg syscall-nummer i rax, argumenter i rdi/rsi/rdx, og kjør syscall-instruksjonen. CPU bytter til ring 0, kjernen gjør jobben, og du kommer tilbake med antall bytes skrevet.",
    userCode,
    kernelCode,
    steps: [
      {
        userLine: 1,
        kernelLine: -1,
        mode: "user",
        registers: r({ rax: "1" }),
        fileTable: fdsBase,
        note: "rax = 1 forteller kjernen hvilken syscall vi vil ha. Tabellen sys_call_table på x86-64 Linux: 0 = read, 1 = write, 2 = open, 3 = close, ...",
      },
      {
        userLine: 4,
        kernelLine: -1,
        mode: "user",
        registers: r({ rax: "1", rdi: "1", rsi: "0x404000", rdx: "3" }),
        fileTable: fdsBase,
        note: "Argumentene legges i kalle-konvensjonen for syscall: rdi, rsi, rdx (samme første tre som vanlig System V AMD64, men r10 erstatter rcx for arg 4).",
      },
      {
        userLine: 5,
        kernelLine: 0,
        mode: "kernel",
        registers: r({ rax: "1", rdi: "1", rsi: "0x404000", rdx: "3" }),
        kernelDoing:
          "CPU har akkurat utført syscall-instruksjonen. Den lagrer rip → rcx, rflags → r11, hopper til adressen i MSR_LSTAR (= entry_SYSCALL_64) og bytter til ring 0.",
        fileTable: fdsBase,
        note: "Ring-overgangen er CPU-en sin egen mekanisme — ikke et vanlig kall. Den henter kernel-stack-adresse fra task structen, så user-kode ikke kan trikse med hvor kjernen havner.",
      },
      {
        userLine: 5,
        kernelLine: 2,
        mode: "kernel",
        registers: r({ rax: "1", rdi: "1", rsi: "0x404000", rdx: "3" }),
        kernelDoing:
          "Kjernen leser rax (=1), bruker det som indeks i sys_call_table, og hopper til sys_write.",
        fileTable: fdsBase,
        note: "Dette er kjernens dispatch-mekanisme: én tabell med alle syscall-handlere. Linux har ~350 av dem i dag.",
      },
      {
        userLine: 5,
        kernelLine: 6,
        mode: "kernel",
        registers: r({ rax: "1", rdi: "1", rsi: "0x404000", rdx: "3" }),
        kernelDoing:
          "sys_write slår opp fd=1 i prosessens fil-tabell og finner /dev/tty. Den kaller tty-driverens write-funksjon med buf og count.",
        fileTable: fdsBase.map((f) =>
          f.fd === 1 ? { ...f, state: "new" as const } : f,
        ),
        note: "Hver prosess har sin egen fil-tabell (task->files). fd er bare en indeks dit. Det er grunnen til at fd 1 i én prosess kan være en fil og fd 1 i en annen kan være terminalen.",
      },
      {
        userLine: 5,
        kernelLine: 7,
        mode: "kernel",
        registers: r({ rax: "3", rdi: "1", rsi: "0x404000", rdx: "3" }),
        kernelDoing:
          "tty-driveren har skrevet \"hei\" til terminalen og returnert 3 (antall bytes). Kjernen legger returverdien i rax.",
        fileTable: fdsBase,
        output: "hei",
        note: "Return-konvensjonen: rax holder returverdien. Negative verdier (typisk -1 til -4095) er feilkoder (negert errno).",
      },
      {
        userLine: 6,
        kernelLine: 10,
        mode: "user",
        registers: r({ rax: "3", rdi: "1", rsi: "0x404000", rdx: "3" }),
        fileTable: fdsBase,
        output: "hei",
        note: "sysretq gjør motsatt av syscall: rip ← rcx, rflags ← r11, ring 0 → ring 3. Prosessen er tilbake i user space med rax = 3.",
      },
    ],
  };
}

// --- scenario 2: open + read fra fil --------------------------------------

function buildOpenReadScenario(): Scenario {
  const userCode = [
    '; les opptil 100 bytes fra "data.txt"',
    'fd = open("data.txt", O_RDONLY);    // syscall 2',
    "if (fd < 0) exit(1);",
    "n  = read(fd, buf, 100);            // syscall 0",
    "close(fd);                          // syscall 3",
  ];
  const kernelCode = [
    "sys_open(path, flags):",
    "  inode = vfs_lookup(path)",
    "  if (!inode) return -ENOENT",
    "  file  = alloc_file(inode, flags)",
    "  fd    = find_free_fd(task)",
    "  task->files[fd] = file",
    "  return fd",
    "",
    "sys_read(fd, buf, count):",
    "  file  = task->files[fd]",
    "  bytes = file->f_op->read(buf, count)",
    "  return bytes",
    "",
    "sys_close(fd):",
    "  put_file(task->files[fd])",
    "  task->files[fd] = NULL",
  ];

  const base: FdEntry[] = [
    { fd: 0, target: "/dev/tty (stdin)" },
    { fd: 1, target: "/dev/tty (stdout)" },
    { fd: 2, target: "/dev/tty (stderr)" },
  ];

  const r = (overrides: Partial<Registers>): Registers => ({
    rax: UNDEF,
    rdi: UNDEF,
    rsi: UNDEF,
    rdx: UNDEF,
    ...overrides,
  });

  return {
    id: "open-read",
    title: 'open + read("data.txt")',
    blurb:
      "Tre syscalls, ett mål: les en fil. Hver syscall manipulerer fil-deskriptor-tabellen — open legger en ny FD inn, read bruker den, close fjerner den.",
    userCode,
    kernelCode,
    steps: [
      {
        userLine: 1,
        kernelLine: 0,
        mode: "kernel",
        registers: r({ rax: "2", rdi: "0x4040", rsi: "0" }),
        kernelDoing:
          'sys_open kalles. rdi peker til strengen "data.txt", rsi = O_RDONLY.',
        fileTable: base,
        note: "Kjernen står i sys_open og er i ferd med å slå opp filen i VFS (Virtual File System) — kjernens abstraksjonslag over alle filsystemer.",
      },
      {
        userLine: 1,
        kernelLine: 3,
        mode: "kernel",
        registers: r({ rax: "2", rdi: "0x4040", rsi: "0" }),
        kernelDoing:
          "VFS fant inode for filen. Kjernen allokerer en file-struct og lar fd peke til den. find_free_fd returnerer laveste ledige FD — typisk 3.",
        fileTable: base,
        note: "Hver åpne fil-instans har sin egen file-struct (med posisjon, flags, peker til inode). Det er derfor to åpne av samme fil kan ha hver sin lese-posisjon.",
      },
      {
        userLine: 1,
        kernelLine: 6,
        mode: "user",
        registers: r({ rax: "3", rdi: "0x4040", rsi: "0" }),
        kernelDoing: "open returnerer fd = 3 i rax.",
        fileTable: [...base, { fd: 3, target: "data.txt", state: "new" }],
        note: "Nå har prosessen fire åpne FDs. fd = 3 er fersk og peker til vår fil. Tilbake i user space.",
      },
      {
        userLine: 3,
        kernelLine: 8,
        mode: "kernel",
        registers: r({ rax: "0", rdi: "3", rsi: "0x405000", rdx: "100" }),
        kernelDoing:
          "sys_read kalles. rdi = 3 (vår FD), rsi = bufferen i user space, rdx = 100 (maks bytes).",
        fileTable: [...base, { fd: 3, target: "data.txt" }],
        note: "rax = 0 er sys_read-nummeret. Merk hvor kompakt argumentene er — bare 3 tall i registre, ingen formatering.",
      },
      {
        userLine: 3,
        kernelLine: 10,
        mode: "kernel",
        registers: r({ rax: "42", rdi: "3", rsi: "0x405000", rdx: "100" }),
        kernelDoing:
          "Kjernen kalte filesystem-driverens read. Den leste 42 bytes inn i bufferen og oppdaterte file-posisjonen. rax = 42.",
        fileTable: [...base, { fd: 3, target: "data.txt" }],
        output: "(42 bytes lest inn i buf)",
        note: "read kan returnere mindre enn det du ba om — fila kan være kort, eller du har truffet EOF. 0 betyr EOF. Negative tall er feil.",
      },
      {
        userLine: 4,
        kernelLine: 14,
        mode: "kernel",
        registers: r({ rax: "3" }),
        kernelDoing:
          "sys_close fjerner FD 3 fra tabellen. file-strukten kan frigjøres når refcount når 0.",
        fileTable: [
          ...base,
          { fd: 3, target: "data.txt", state: "closed" },
        ],
        note: "close er essensielt: hver prosess har en hard grense på antall åpne filer (ulimit -n, typisk 1024). Glem close, og du får 'Too many open files' før eller siden.",
        warn:
          "Glemmer du å lukke filer, lekker du FDs. På en server som åpner mange filer per request samler dette seg opp og krasjer prosessen.",
      },
      {
        userLine: 4,
        kernelLine: 15,
        mode: "user",
        registers: r({ rax: "0" }),
        kernelDoing: "close returnerer 0 (suksess). Tilbake i user space.",
        fileTable: base,
        note: "FD 3 er nå ledig igjen — en ny open() kan få den. Kjernen gir alltid laveste ledige FD.",
      },
    ],
  };
}

const SCENARIOS: Scenario[] = [buildWriteScenario(), buildOpenReadScenario()];

// --- main component --------------------------------------------------------

export function SyscallLifecycle() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [stepIdx, setStepIdx] = useState(0);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );
  const step = scenario.steps[Math.min(stepIdx, scenario.steps.length - 1)];

  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));
  const goNext = () =>
    setStepIdx((i) => Math.min(scenario.steps.length - 1, i + 1));
  const reset = () => setStepIdx(0);
  const switchScenario = (id: string) => {
    setScenarioId(id);
    setStepIdx(0);
  };

  const isKernel = step.mode === "kernel";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => switchScenario(s.id)}
              className={`text-xs px-3 py-1.5 rounded-md border transition ${
                s.id === scenarioId
                  ? "border-brand bg-brand/15 text-foreground font-medium"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{scenario.blurb}</p>
      </div>

      {/* Ring-indikator */}
      <div
        className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 transition ${
          isKernel
            ? "border-red-500/50 bg-red-500/10"
            : "border-sky-500/50 bg-sky-500/10"
        }`}
      >
        {isKernel ? (
          <ShieldAlert className="h-4 w-4 text-red-500" />
        ) : (
          <Shield className="h-4 w-4 text-sky-500" />
        )}
        <span className="text-sm font-semibold">
          {isKernel ? "Ring 0 — kernel space" : "Ring 3 — user space"}
        </span>
        <span className="text-xs text-muted-foreground">
          {isKernel
            ? "kjernekode med full tilgang til hardware"
            : "vanlig prosess uten direkte hardware-tilgang"}
        </span>
      </div>

      {/* Kode side om side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CodePanel
          title="USER CODE (ring 3)"
          code={scenario.userCode}
          activeLine={step.userLine}
          dimmed={isKernel}
        />
        <CodePanel
          title="KERNEL HANDLER (ring 0)"
          code={scenario.kernelCode}
          activeLine={step.kernelLine}
          dimmed={!isKernel}
          variant="kernel"
        />
      </div>

      {/* Kontroller */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Forrige
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={stepIdx >= scenario.steps.length - 1}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-brand bg-brand/15 text-foreground font-medium hover:bg-brand/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Neste
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted/40 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          Steg {stepIdx + 1} / {scenario.steps.length}
        </div>
      </div>

      {/* CPU + FD-tabell */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RegistersPanel registers={step.registers} mode={step.mode} />
        <FileTablePanel fileTable={step.fileTable} />
      </div>

      {/* Kernel-status + output */}
      {step.kernelDoing && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <div className="text-[11px] uppercase tracking-wider text-red-500 font-semibold mb-1">
            Kjernen gjør
          </div>
          <p className="text-sm leading-relaxed">{step.kernelDoing}</p>
        </div>
      )}

      {step.output && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 font-mono text-sm">
          <span className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mr-2">
            terminal / fil
          </span>
          {step.output}
        </div>
      )}

      {/* Forklaring */}
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 flex items-start gap-2.5">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{step.note}</p>
      </div>
      {step.warn && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">{step.warn}</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Forenklet. Ekte syscall-entry på Linux x86-64 sjekker også for signaler
        ved entry/exit, kopierer brukerargumenter sikkert med{" "}
        <code>copy_from_user</code>, og kan bli avbrutt (suspendert) hvis I/O
        venter. Syscall-nummer fra{" "}
        <code>/usr/include/asm/unistd_64.h</code>.
      </p>
    </div>
  );
}

// --- subkomponenter --------------------------------------------------------

function CodePanel({
  title,
  code,
  activeLine,
  dimmed,
  variant,
}: {
  title: string;
  code: string[];
  activeLine: number;
  dimmed: boolean;
  variant?: "kernel";
}) {
  const accent =
    variant === "kernel" ? "border-red-500/40" : "border-sky-500/40";
  const activeBg =
    variant === "kernel"
      ? "bg-red-500/15 border-l-2 border-red-500"
      : "bg-sky-500/15 border-l-2 border-sky-500";
  return (
    <div
      className={`rounded-lg border ${accent} bg-background/60 overflow-x-auto ${
        dimmed ? "opacity-50" : ""
      }`}
    >
      <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground border-b border-border bg-muted/30">
        {title}
      </div>
      <pre className="font-mono text-[11px] leading-relaxed m-0 p-0">
        {code.map((line, i) => {
          const active = i === activeLine && !dimmed;
          return (
            <div
              key={i}
              className={`px-3 py-0.5 flex gap-2 ${
                active
                  ? activeBg + " text-foreground"
                  : "border-l-2 border-transparent text-muted-foreground"
              }`}
            >
              <span className="text-muted-foreground/60 select-none w-5 text-right">
                {i + 1}
              </span>
              <span className="whitespace-pre">{line}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

function RegistersPanel({
  registers,
  mode,
}: {
  registers: Registers;
  mode: Mode;
}) {
  const rows: { name: keyof Registers; role: string }[] = [
    { name: "rax", role: "syscall-nummer / returverdi" },
    { name: "rdi", role: "arg 1" },
    { name: "rsi", role: "arg 2" },
    { name: "rdx", role: "arg 3" },
  ];
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">
          CPU-REGISTRE
        </span>
        <span className="text-[10px] text-muted-foreground/70">
          {mode === "kernel" ? "lest av kjernen" : "satt av user-kode"}
        </span>
      </div>
      <div className="space-y-1">
        {rows.map((row) => {
          const val = registers[row.name];
          const set = val !== UNDEF;
          return (
            <div
              key={row.name}
              className={`flex items-baseline gap-2 px-2 py-1 rounded ${
                set
                  ? "bg-background/70 border border-border/60"
                  : "bg-transparent border border-dashed border-muted-foreground/30"
              }`}
            >
              <span className="font-mono text-xs font-semibold w-10">
                {row.name}
              </span>
              <span
                className={`font-mono text-xs tabular-nums ${
                  set ? "text-foreground" : "text-muted-foreground italic"
                }`}
              >
                {val}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {row.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileTablePanel({ fileTable }: { fileTable: FdEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">
          FIL-DESKRIPTOR-TABELL
        </span>
        <span className="text-[10px] text-muted-foreground/70">
          task-&gt;files
        </span>
      </div>
      <div className="space-y-1">
        {fileTable.map((entry) => {
          const newish = entry.state === "new";
          const closing = entry.state === "closed";
          const cls = closing
            ? "border-red-500/40 bg-red-500/10 text-muted-foreground line-through"
            : newish
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-border/60 bg-background/70";
          return (
            <div
              key={entry.fd}
              className={`flex items-baseline gap-2 px-2 py-1 rounded border ${cls}`}
            >
              <span className="font-mono text-xs font-semibold w-12">
                fd {entry.fd}
              </span>
              <span className="text-xs">{entry.target}</span>
              {newish && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  ny
                </span>
              )}
              {closing && (
                <span className="ml-auto text-[10px] uppercase tracking-wider text-red-500">
                  lukket
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
