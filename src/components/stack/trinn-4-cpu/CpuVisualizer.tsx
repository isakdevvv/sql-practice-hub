import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv CPU-visualisering — fetch-decode-execute én fase om gangen.
// Vi simulerer en bitteliten 8-bit CPU med:
//   - PC (program counter), IR (instruction register)
//   - Register-fil R0..R3
//   - ALU (utfører +, -, sammenligning)
//   - RAM med 8 celler (instruksjoner ligger nede i samme minne her —
//     forenklet von Neumann-modell)
//   - Kontroll-enhet som lyser opp signaler i decode-fasen
// Buser tegnes som SVG-linjer som "fyres opp" i riktig fase, med en label
// som viser hvilken verdi som flyttes på bussen.
// Hele kjøringen pre-computes opp-front til Frame[]. Step / play / scrub
// indekserer bare inn i lista.
// --------------------------------------------------------------------------

type Mode = "mov" | "add" | "load" | "store" | "jmp" | "sum";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "mov", label: "MOV R0, 5", sub: "load immediate" },
  { id: "add", label: "ADD R0, R1", sub: "register + register" },
  { id: "load", label: "LOAD R0, [0x10]", sub: "minne → register" },
  { id: "store", label: "STORE R1, [0x10]", sub: "register → minne" },
  { id: "jmp", label: "JMP 0x04", sub: "ubetinget hopp" },
  { id: "sum", label: "Sum 1..3", sub: "fullt program med løkke" },
];

const MODE_NOTE: Record<Mode, string> = {
  mov: "MOV R0, 5 — last et tall direkte inn i et register. Verdien er en del av instruksjonen (immediate), ingen ekstra minne-lesing trengs i execute.",
  add: "ADD R0, R1 — leser to registre, ALU-en plusser dem, resultatet skrives tilbake til R0. Ingen RAM-aksess.",
  load: "LOAD R0, [0x10] — adressen står i instruksjonen, ALU-en kunne strengt tatt regne den ut. Vi leser RAM-cellen og skriver til R0.",
  store: "STORE R1, [0x10] — speilbildet av LOAD. R1 sin verdi sendes ned på data-bussen til RAM. Ingen register-skriv.",
  jmp: "JMP 0x04 — i stedet for PC ← PC + 1 setter kontroll-enheten PC til hopp-målet. Neste fetch starter der.",
  sum: "Lite program som summerer 1+2+3 i R0 ved hjelp av en løkke. Du ser PC inkrementere, ADD oppdatere R0, og JMP hoppe tilbake til toppen.",
};

// --------------------------------------------------------------------------
// ISA — bitteliten instruksjons-modell. Hver instruksjon er ett "ord" i RAM.
// (Vi bryr oss ikke om byte-encoding, bare semantikken og hva fasene gjør.)
// --------------------------------------------------------------------------

type Reg = "R0" | "R1" | "R2" | "R3";
const REGS: Reg[] = ["R0", "R1", "R2", "R3"];

type Instr =
  | { op: "MOV"; rd: Reg; imm: number }
  | { op: "ADD"; rd: Reg; rs: Reg }
  | { op: "SUB"; rd: Reg; rs: Reg }
  | { op: "LOAD"; rd: Reg; addr: number }
  | { op: "STORE"; rs: Reg; addr: number }
  | { op: "JMP"; addr: number }
  | { op: "JNZ"; rs: Reg; addr: number }
  | { op: "HALT" };

function instrText(ins: Instr): string {
  switch (ins.op) {
    case "MOV":
      return `MOV  ${ins.rd}, ${ins.imm}`;
    case "ADD":
      return `ADD  ${ins.rd}, ${ins.rs}`;
    case "SUB":
      return `SUB  ${ins.rd}, ${ins.rs}`;
    case "LOAD":
      return `LOAD ${ins.rd}, [0x${ins.addr.toString(16).padStart(2, "0")}]`;
    case "STORE":
      return `STORE ${ins.rs}, [0x${ins.addr.toString(16).padStart(2, "0")}]`;
    case "JMP":
      return `JMP  0x${ins.addr.toString(16).padStart(2, "0")}`;
    case "JNZ":
      return `JNZ  ${ins.rs}, 0x${ins.addr.toString(16).padStart(2, "0")}`;
    case "HALT":
      return "HALT";
  }
}

// --------------------------------------------------------------------------
// Fase-typer + kontrollsignaler
// --------------------------------------------------------------------------

type Phase = "fetch" | "decode" | "execute" | "writeback";

const PHASE_LABEL: Record<Phase, string> = {
  fetch: "Fetch",
  decode: "Decode",
  execute: "Execute",
  writeback: "PC-update / Writeback",
};

const PHASE_SUB: Record<Phase, string> = {
  fetch: "Hent instruksjon fra RAM[PC] via adresse-buss + data-buss → IR",
  decode: "Kontroll-enheten leser IR og asserter signalene for denne instruksjonen",
  execute: "ALU regner, registre leses, RAM aksesseres (etter behov)",
  writeback: "Resultat skrives til register/RAM, og PC oppdateres (PC+1 eller hopp-mål)",
};

interface Signals {
  RegRead: boolean;
  RegWrite: boolean;
  MemRead: boolean;
  MemWrite: boolean;
  ALUop: "ADD" | "SUB" | "PASS" | "—";
  Branch: boolean;
  ImmSrc: boolean; // true når operand er immediate fra instruksjonen
}

const EMPTY_SIGNALS: Signals = {
  RegRead: false,
  RegWrite: false,
  MemRead: false,
  MemWrite: false,
  ALUop: "—",
  Branch: false,
  ImmSrc: false,
};

// --------------------------------------------------------------------------
// Frame = ett snapshot. Tegnes 1:1 i SVG.
// --------------------------------------------------------------------------

interface BusActivity {
  addrBus?: { value: number; label: string };
  dataBus?: { value: number; label: string; direction: "toCpu" | "toMem" };
}

interface Frame {
  /** Hvilken fase i sykelen vi er i. */
  phase: Phase;
  /** Indeks i program (matcher PC for instruksjonen vi behandler nå). */
  pc: number;
  /** Tekst-representasjon av instruksjonen vi behandler nå. */
  irText: string;
  /** Numerisk IR-verdi (vi simulerer som adresse i RAM for visning). */
  irValue: string;
  registers: Record<Reg, number>;
  writtenReg?: Reg;
  readRegs: Reg[];
  /** RAM-celler. Indeks = adresse. */
  ram: number[];
  ramReadIdx?: number;
  ramWriteIdx?: number;
  /** Hvilke komponenter skal "lyse" denne fasen. */
  active: {
    pc: boolean;
    ir: boolean;
    control: boolean;
    alu: boolean;
    regfile: boolean;
    ram: boolean;
  };
  buses: BusActivity;
  signals: Signals;
  description: string;
  /** ALU-input/output for visning. Bare aktivt i execute-fasen. */
  aluInputs?: { a: number; b: number; out: number; op: string };
  /** Pent navn (f.eks. "MOV R0, 5") som vises som tittel på fasen. */
  instrLabel: string;
}

// --------------------------------------------------------------------------
// Bygger — gir oss ett trace av frames for et program
// --------------------------------------------------------------------------

interface BuildOpts {
  /** Hvilke RAM-celler skal vises i bunnen. Vi har alltid 8 celler. */
  initialRam?: number[];
  /** Adresse der programmet er lagt. Default 0. */
  programStart?: number;
  /** Hvor vi stopper. Hvis null kjører vi til HALT eller "lengde". */
  maxSteps?: number;
}

class CpuTracer {
  program: Instr[];
  ram: number[];
  registers: Record<Reg, number>;
  pc: number;
  frames: Frame[];
  programStart: number;

  constructor(program: Instr[], opts?: BuildOpts) {
    this.program = program;
    this.ram = opts?.initialRam ? [...opts.initialRam] : new Array(8).fill(0);
    // Sørg for 8 celler.
    while (this.ram.length < 8) this.ram.push(0);
    this.ram = this.ram.slice(0, 8);
    this.registers = { R0: 0, R1: 0, R2: 0, R3: 0 };
    this.programStart = opts?.programStart ?? 0;
    this.pc = this.programStart;
    this.frames = [];
  }

  /** Skriv én frame. */
  snap(f: Omit<Frame, "ram" | "registers"> & { ram?: number[]; registers?: Record<Reg, number> }) {
    this.frames.push({
      ...f,
      registers: { ...this.registers },
      ram: [...this.ram],
    });
  }

  /** Kjør ett instruksjons-syklus (4 frames). */
  cycle(ins: Instr): boolean {
    const label = instrText(ins);
    const irHex = "0x" + this.pc.toString(16).padStart(2, "0");

    // ---------- Fetch ----------
    this.snap({
      phase: "fetch",
      pc: this.pc,
      irText: label,
      irValue: irHex,
      writtenReg: undefined,
      readRegs: [],
      ramReadIdx: this.pc, // konseptuelt henter vi fra RAM[PC]
      ramWriteIdx: undefined,
      active: { pc: true, ir: true, control: false, alu: false, regfile: false, ram: true },
      buses: {
        addrBus: { value: this.pc, label: `PC = 0x${this.pc.toString(16).padStart(2, "0")}` },
        dataBus: { value: this.pc, label: label, direction: "toCpu" },
      },
      signals: { ...EMPTY_SIGNALS, MemRead: true },
      description: `Fetch — PC (0x${this.pc.toString(16).padStart(2, "0")}) legges på adresse-bussen. RAM returnerer instruksjonen på data-bussen, som lagres i IR.`,
      instrLabel: label,
    });

    // ---------- Decode ----------
    const sig = decodeSignals(ins);
    this.snap({
      phase: "decode",
      pc: this.pc,
      irText: label,
      irValue: irHex,
      writtenReg: undefined,
      readRegs: [],
      ramReadIdx: undefined,
      ramWriteIdx: undefined,
      active: { pc: false, ir: true, control: true, alu: false, regfile: false, ram: false },
      buses: {},
      signals: sig,
      description: describeDecode(ins, sig),
      instrLabel: label,
    });

    // ---------- Execute ----------
    let jumpTo: number | null = null;
    let writtenReg: Reg | undefined;
    let ramReadIdx: number | undefined;
    let ramWriteIdx: number | undefined;
    let readRegs: Reg[] = [];
    let aluInputs: Frame["aluInputs"];
    let execDesc = "";
    let execActive: Frame["active"] = {
      pc: false,
      ir: true,
      control: true,
      alu: false,
      regfile: false,
      ram: false,
    };
    let execBuses: BusActivity = {};

    switch (ins.op) {
      case "MOV": {
        const a = ins.imm;
        aluInputs = { a, b: 0, out: a, op: "PASS" };
        execActive = { ...execActive, alu: true };
        execDesc = `Execute — immediate (${ins.imm}) passerer rett gjennom ALU (PASS) og er klar for writeback til ${ins.rd}.`;
        writtenReg = ins.rd;
        break;
      }
      case "ADD":
      case "SUB": {
        const a = this.registers[ins.rd];
        const b = this.registers[ins.rs];
        const out = ins.op === "ADD" ? a + b : a - b;
        aluInputs = { a, b, out, op: ins.op };
        readRegs = [ins.rd, ins.rs];
        execActive = { ...execActive, alu: true, regfile: true };
        execDesc = `Execute — ALU leser ${ins.rd}=${a} og ${ins.rs}=${b}, regner ${a} ${ins.op === "ADD" ? "+" : "−"} ${b} = ${out}.`;
        writtenReg = ins.rd;
        break;
      }
      case "LOAD": {
        ramReadIdx = ins.addr;
        const val = this.ram[ins.addr] ?? 0;
        execActive = { ...execActive, ram: true };
        execBuses = {
          addrBus: { value: ins.addr, label: `0x${ins.addr.toString(16).padStart(2, "0")}` },
          dataBus: { value: val, label: `${val}`, direction: "toCpu" },
        };
        execDesc = `Execute — adresse 0x${ins.addr.toString(16).padStart(2, "0")} ut på adresse-bussen. RAM returnerer ${val} på data-bussen.`;
        writtenReg = ins.rd;
        break;
      }
      case "STORE": {
        ramWriteIdx = ins.addr;
        const val = this.registers[ins.rs];
        readRegs = [ins.rs];
        execActive = { ...execActive, ram: true, regfile: true };
        execBuses = {
          addrBus: { value: ins.addr, label: `0x${ins.addr.toString(16).padStart(2, "0")}` },
          dataBus: { value: val, label: `${val}`, direction: "toMem" },
        };
        execDesc = `Execute — ${ins.rs} (=${val}) legges på data-bussen, adresse 0x${ins.addr.toString(16).padStart(2, "0")} på adresse-bussen. RAM får skrive-puls.`;
        break;
      }
      case "JMP": {
        jumpTo = ins.addr;
        execActive = { ...execActive, control: true };
        execDesc = `Execute — kontroll-enheten setter neste-PC til 0x${ins.addr.toString(16).padStart(2, "0")} (hopp-målet).`;
        break;
      }
      case "JNZ": {
        const v = this.registers[ins.rs];
        readRegs = [ins.rs];
        execActive = { ...execActive, alu: true, regfile: true };
        aluInputs = { a: v, b: 0, out: v, op: "TEST" };
        if (v !== 0) {
          jumpTo = ins.addr;
          execDesc = `Execute — ${ins.rs}=${v} (ikke null). ALU setter "not-zero"-flagget, kontroll-enheten velger hopp-mål 0x${ins.addr.toString(16).padStart(2, "0")}.`;
        } else {
          execDesc = `Execute — ${ins.rs}=0 (null). Hopp-betingelsen feiler, PC fortsetter til neste instruksjon.`;
        }
        break;
      }
      case "HALT": {
        execActive = { ...execActive, control: true };
        execDesc = "Execute — HALT. CPU-en stopper klokken, ingenting mer skjer.";
        break;
      }
    }

    this.snap({
      phase: "execute",
      pc: this.pc,
      irText: label,
      irValue: irHex,
      writtenReg: undefined,
      readRegs,
      ramReadIdx,
      ramWriteIdx: undefined,
      active: execActive,
      buses: execBuses,
      signals: sig,
      description: execDesc,
      instrLabel: label,
      aluInputs,
    });

    // ---------- Writeback / PC-update ----------
    let wbActive: Frame["active"] = {
      pc: true,
      ir: true,
      control: true,
      alu: false,
      regfile: false,
      ram: false,
    };
    let wbDesc = "";
    let wbBuses: BusActivity = {};
    let nextPc = this.pc + 1;

    if (jumpTo !== null) {
      nextPc = jumpTo;
      wbDesc = `Writeback — PC ← 0x${jumpTo.toString(16).padStart(2, "0")} (hopp). Neste fetch henter på det målet.`;
    } else if (ins.op === "HALT") {
      nextPc = this.pc; // bli stående
      wbDesc = "Writeback — HALT. PC stopper.";
    } else {
      wbDesc = `Writeback — PC ← PC + 1 = 0x${nextPc.toString(16).padStart(2, "0")}.`;
    }

    // Faktisk skrive resultatet:
    switch (ins.op) {
      case "MOV":
        this.registers[ins.rd] = ins.imm;
        wbActive.regfile = true;
        wbDesc = `Writeback — ${ins.rd} ← ${ins.imm}. ${wbDesc}`;
        break;
      case "ADD": {
        const a = this.registers[ins.rd];
        const b = this.registers[ins.rs];
        const out = a + b;
        this.registers[ins.rd] = out;
        wbActive.regfile = true;
        wbDesc = `Writeback — ${ins.rd} ← ${out}. ${wbDesc}`;
        break;
      }
      case "SUB": {
        const a = this.registers[ins.rd];
        const b = this.registers[ins.rs];
        const out = a - b;
        this.registers[ins.rd] = out;
        wbActive.regfile = true;
        wbDesc = `Writeback — ${ins.rd} ← ${out}. ${wbDesc}`;
        break;
      }
      case "LOAD": {
        const val = this.ram[ins.addr] ?? 0;
        this.registers[ins.rd] = val;
        wbActive.regfile = true;
        wbBuses = {
          dataBus: { value: val, label: `${val}`, direction: "toCpu" },
        };
        wbDesc = `Writeback — ${ins.rd} ← ${val} (lest fra 0x${ins.addr.toString(16).padStart(2, "0")}). ${wbDesc}`;
        break;
      }
      case "STORE": {
        const val = this.registers[ins.rs];
        this.ram[ins.addr] = val;
        ramWriteIdx = ins.addr;
        wbActive.ram = true;
        wbDesc = `Writeback — RAM[0x${ins.addr.toString(16).padStart(2, "0")}] ← ${val}. ${wbDesc}`;
        break;
      }
      default:
        break;
    }

    writtenReg = wbActive.regfile ? (writtenReg as Reg | undefined) : undefined;

    this.snap({
      phase: "writeback",
      pc: this.pc, // tegnes med "gammel" PC; ny PC vises som highlight
      irText: label,
      irValue: irHex,
      writtenReg,
      readRegs: [],
      ramReadIdx: undefined,
      ramWriteIdx,
      active: wbActive,
      buses: wbBuses,
      signals: sig,
      description: wbDesc,
      instrLabel: label,
    });

    this.pc = nextPc;
    return ins.op !== "HALT";
  }
}

function decodeSignals(ins: Instr): Signals {
  switch (ins.op) {
    case "MOV":
      return { ...EMPTY_SIGNALS, RegWrite: true, ALUop: "PASS", ImmSrc: true };
    case "ADD":
      return { ...EMPTY_SIGNALS, RegRead: true, RegWrite: true, ALUop: "ADD" };
    case "SUB":
      return { ...EMPTY_SIGNALS, RegRead: true, RegWrite: true, ALUop: "SUB" };
    case "LOAD":
      return { ...EMPTY_SIGNALS, MemRead: true, RegWrite: true };
    case "STORE":
      return { ...EMPTY_SIGNALS, RegRead: true, MemWrite: true };
    case "JMP":
      return { ...EMPTY_SIGNALS, Branch: true };
    case "JNZ":
      return { ...EMPTY_SIGNALS, RegRead: true, Branch: true };
    case "HALT":
      return { ...EMPTY_SIGNALS };
  }
}

function describeDecode(ins: Instr, sig: Signals): string {
  const asserted: string[] = [];
  if (sig.RegRead) asserted.push("RegRead");
  if (sig.RegWrite) asserted.push("RegWrite");
  if (sig.MemRead) asserted.push("MemRead");
  if (sig.MemWrite) asserted.push("MemWrite");
  if (sig.Branch) asserted.push("Branch");
  if (sig.ImmSrc) asserted.push("ImmSrc");
  if (sig.ALUop !== "—") asserted.push(`ALUop=${sig.ALUop}`);
  const list = asserted.length > 0 ? asserted.join(", ") : "ingen";
  return `Decode — kontroll-enheten kjenner igjen ${ins.op}. Signaler som asserteres: ${list}.`;
}

// --------------------------------------------------------------------------
// Programmer
// --------------------------------------------------------------------------

function buildSingle(ins: Instr, opts?: BuildOpts): { frames: Frame[]; program: Instr[] } {
  const t = new CpuTracer([ins], opts);
  t.cycle(ins);
  return { frames: t.frames, program: t.program };
}

function buildSumProgram(): { frames: Frame[]; program: Instr[] } {
  // R0 = 0  (sum)
  // R1 = 1  (i)
  // R2 = 3  (n)
  // loop:
  //   ADD R0, R1   ; sum += i
  //   ADD R1, R3   ; i += 1   (R3 = 1)
  //   SUB R2, R3   ; n -= 1
  //   JNZ R2, loop ; hvis n != 0 -> hopp
  //   HALT
  // Vi gjør først en MOV R3, 1 så vi har en "1" å øke med.
  const program: Instr[] = [
    { op: "MOV", rd: "R0", imm: 0 }, // 0x00
    { op: "MOV", rd: "R1", imm: 1 }, // 0x01
    { op: "MOV", rd: "R2", imm: 3 }, // 0x02
    { op: "MOV", rd: "R3", imm: 1 }, // 0x03
    // loop @ 0x04
    { op: "ADD", rd: "R0", rs: "R1" }, // 0x04  sum += i
    { op: "ADD", rd: "R1", rs: "R3" }, // 0x05  i++
    { op: "SUB", rd: "R2", rs: "R3" }, // 0x06  n--
    { op: "JNZ", rs: "R2", addr: 0x04 }, // 0x07  hvis n!=0, tilbake
    { op: "HALT" }, // 0x08
  ];
  const t = new CpuTracer(program);
  let guard = 0;
  while (guard < 60) {
    const cur = t.program[t.pc];
    if (!cur) break;
    const cont = t.cycle(cur);
    if (!cont) break;
    guard += 1;
  }
  return { frames: t.frames, program: t.program };
}

function buildForMode(mode: Mode): { frames: Frame[]; program: Instr[] } {
  switch (mode) {
    case "mov":
      return buildSingle({ op: "MOV", rd: "R0", imm: 5 });
    case "add": {
      // Pre-fyll R0 og R1 så ADD R0, R1 er meningsfull.
      const t = new CpuTracer([
        { op: "MOV", rd: "R0", imm: 7 },
        { op: "MOV", rd: "R1", imm: 4 },
        { op: "ADD", rd: "R0", rs: "R1" },
      ]);
      t.cycle(t.program[0]);
      t.cycle(t.program[1]);
      t.cycle(t.program[2]);
      return { frames: t.frames, program: t.program };
    }
    case "load": {
      const ram = new Array(8).fill(0);
      ram[0x10 & 0x07] = 42; // RAM-en vår er 8 celler — vi mapper 0x10 til indeks 0
      // For didaktisk klarhet bruker vi heller adresse 0x05 direkte:
      const fresh = new Array(8).fill(0);
      fresh[5] = 42;
      const t = new CpuTracer([{ op: "LOAD", rd: "R0", addr: 5 }], { initialRam: fresh });
      t.cycle(t.program[0]);
      return { frames: t.frames, program: t.program };
    }
    case "store": {
      const t = new CpuTracer([
        { op: "MOV", rd: "R1", imm: 99 },
        { op: "STORE", rs: "R1", addr: 5 },
      ]);
      t.cycle(t.program[0]);
      t.cycle(t.program[1]);
      return { frames: t.frames, program: t.program };
    }
    case "jmp": {
      // Vi viser at PC settes til 0x04 — selv om programmet "ender" der.
      const t = new CpuTracer([{ op: "JMP", addr: 0x04 }]);
      t.cycle(t.program[0]);
      return { frames: t.frames, program: t.program };
    }
    case "sum":
      return buildSumProgram();
  }
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------

export function CpuVisualizer() {
  const [mode, setMode] = useState<Mode>("mov");
  const { frames, program } = useMemo(() => buildForMode(mode), [mode]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    if (step >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), speed);
    return () => window.clearTimeout(t);
  }, [playing, step, frames.length, speed]);

  const current: Frame = frames[step] ?? frames[0];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Fetch — Decode — Execute — Writeback, fase for fase
            </div>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            steg {Math.min(step + 1, frames.length)} / {frames.length}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fase-streamer + nåværende instruksjon */}
      <div className="px-4 py-3 border-b border-border bg-background flex flex-wrap items-center gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Nåværende fase
        </div>
        <div className="flex gap-1">
          {(["fetch", "decode", "execute", "writeback"] as Phase[]).map((p) => (
            <span
              key={p}
              className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${
                current.phase === p
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {PHASE_LABEL[p]}
            </span>
          ))}
        </div>
        <div className="ml-auto text-xs font-mono text-muted-foreground">
          IR = <span className="text-foreground font-semibold">{current.instrLabel}</span>{" "}
          @ {current.irValue}
        </div>
      </div>

      {/* Datapath-diagram (SVG) */}
      <div className="border-b border-border bg-muted/5">
        <Datapath frame={current} />
      </div>

      {/* Info-rader: program, registre, RAM, kontroll-signaler, ALU */}
      <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-0 border-b border-border">
        <ProgramListing program={program} pc={current.pc} phase={current.phase} />
        <RegisterPanel frame={current} />
        <RamPanel frame={current} />
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-0 border-b border-border">
        <SignalsPanel frame={current} />
        <AluPanel frame={current} />
      </div>

      {/* Beskrivelse + modus-note */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
          {PHASE_LABEL[current.phase]} — {PHASE_SUB[current.phase]}
        </div>
        <div className="text-sm text-foreground">{current.description}</div>
        <div className="text-xs text-muted-foreground italic mt-2">{MODE_NOTE[mode]}</div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-3 bg-muted/20 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="px-2 py-1 rounded border border-border hover:bg-muted text-xs inline-flex items-center gap-1"
            title="Reset"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="px-2 py-1 rounded border border-border hover:bg-muted text-xs inline-flex items-center gap-1 disabled:opacity-40"
            title="Forrige fase"
          >
            <SkipBack className="h-3 w-3" /> Forrige
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={step >= frames.length - 1 && !playing}
            className="px-3 py-1 rounded border border-brand bg-brand text-brand-foreground hover:opacity-90 text-xs inline-flex items-center gap-1 disabled:opacity-40"
          >
            {playing ? (
              <>
                <Pause className="h-3 w-3" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> Play
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(frames.length - 1, s + 1));
            }}
            disabled={step >= frames.length - 1}
            className="px-2 py-1 rounded border border-border hover:bg-muted text-xs inline-flex items-center gap-1 disabled:opacity-40"
            title="Neste fase"
          >
            Neste <SkipForward className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-muted-foreground" htmlFor="cpu-speed">
            tempo
          </label>
          <input
            id="cpu-speed"
            type="range"
            min={200}
            max={1600}
            step={100}
            value={1800 - speed}
            onChange={(e) => setSpeed(1800 - Number.parseInt(e.target.value, 10))}
            className="w-28 accent-brand"
          />
        </div>

        <div className="w-full">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={step}
            onChange={(e) => {
              setPlaying(false);
              setStep(Number.parseInt(e.target.value, 10));
            }}
            className="w-full accent-brand"
            aria-label="Fase-scrubber"
          />
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// SVG datapath
// --------------------------------------------------------------------------

function Datapath({ frame }: { frame: Frame }) {
  // Layout (viewBox 800 x 360):
  //   PC (60,160 w=80 h=44)
  //   Control Unit (340,30 w=140 h=60)
  //   IR (180,160 w=100 h=44)
  //   RegFile (340,140 w=140 h=80)
  //   ALU (560,150 w=120 h=80) — sekskant-ish
  //   RAM (340,280 w=140 h=60)
  //
  // Buser:
  //   addr-bus: nedover venstre side, fra PC til RAM (også horizontal til RAM på toppen)
  //   data-bus: returnerer fra RAM opp til IR/RegFile
  //
  // Vi tegner forenklet: linjer mellom boksene.

  const { active, phase } = frame;
  const addrBusActive =
    phase === "fetch" || (frame.buses.addrBus !== undefined && phase === "execute");
  const dataBusActive =
    phase === "fetch" || (frame.buses.dataBus !== undefined);

  return (
    <div className="px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Datapath — komponenter lyser opp i den aktive fasen, busene viser hva som flyter
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 800 360"
          className="w-full max-w-[840px] mx-auto block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          {/* ---- Buses ---- */}
          {/* Address bus: PC → IR/RAM (horizontal langs venstre side) */}
          <g className={addrBusActive ? "text-brand" : "text-border"}>
            {/* PC -> IR (når fetch) */}
            <line
              x1={140}
              y1={182}
              x2={180}
              y2={182}
              stroke="currentColor"
              strokeWidth={addrBusActive ? 3 : 1.5}
              markerEnd="url(#arrow)"
            />
            {/* PC -> RAM (når fetch leser instruksjon) */}
            <path
              d={`M 100 204 L 100 310 L 340 310`}
              fill="none"
              stroke="currentColor"
              strokeWidth={addrBusActive ? 3 : 1.5}
              markerEnd="url(#arrow)"
            />
            {/* Label */}
            {frame.buses.addrBus && (
              <g>
                <rect
                  x={104}
                  y={250}
                  width={120}
                  height={20}
                  rx={4}
                  className="fill-brand/15 stroke-brand"
                />
                <text
                  x={164}
                  y={263}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                >
                  ADR: {frame.buses.addrBus.label}
                </text>
              </g>
            )}
          </g>

          {/* Data bus: RAM -> IR / RegFile */}
          <g className={dataBusActive ? "text-brand" : "text-border"}>
            {/* RAM -> opp -> til IR */}
            <path
              d={`M 410 280 L 410 230 L 230 230 L 230 204`}
              fill="none"
              stroke="currentColor"
              strokeWidth={dataBusActive ? 3 : 1.5}
              markerEnd="url(#arrow)"
            />
            {/* RAM <-> RegFile (data) */}
            <path
              d={`M 440 280 L 440 220`}
              fill="none"
              stroke="currentColor"
              strokeWidth={
                phase === "execute" && (active.ram && active.regfile) ? 3 : 1.5
              }
            />
            {/* Label */}
            {frame.buses.dataBus && (
              <g>
                <rect
                  x={300}
                  y={216}
                  width={150}
                  height={20}
                  rx={4}
                  className={
                    frame.buses.dataBus.direction === "toMem"
                      ? "fill-success/15 stroke-success"
                      : "fill-brand/15 stroke-brand"
                  }
                />
                <text
                  x={375}
                  y={229}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                >
                  DATA: {frame.buses.dataBus.label}{" "}
                  {frame.buses.dataBus.direction === "toMem" ? "→ RAM" : "→ CPU"}
                </text>
              </g>
            )}
          </g>

          {/* RegFile -> ALU */}
          <g
            className={
              phase === "execute" && active.alu && frame.readRegs.length > 0
                ? "text-brand"
                : "text-border"
            }
          >
            <line
              x1={480}
              y1={170}
              x2={560}
              y2={170}
              stroke="currentColor"
              strokeWidth={phase === "execute" && active.alu ? 3 : 1.5}
              markerEnd="url(#arrow)"
            />
            <line
              x1={480}
              y1={200}
              x2={560}
              y2={200}
              stroke="currentColor"
              strokeWidth={phase === "execute" && active.alu ? 3 : 1.5}
              markerEnd="url(#arrow)"
            />
          </g>

          {/* ALU -> RegFile (writeback) */}
          <g
            className={
              phase === "writeback" && active.regfile ? "text-success" : "text-border"
            }
          >
            <path
              d={`M 620 230 L 620 250 L 410 250 L 410 220`}
              fill="none"
              stroke="currentColor"
              strokeWidth={phase === "writeback" && active.regfile ? 3 : 1.5}
              markerEnd="url(#arrow)"
            />
          </g>

          {/* Control unit -> alle (decode) */}
          <g
            className={
              phase === "decode" ? "text-warning" : "text-border"
            }
            opacity={phase === "decode" ? 1 : 0.4}
          >
            <path
              d={`M 410 90 L 410 140`}
              stroke="currentColor"
              strokeWidth={phase === "decode" ? 2.5 : 1}
              strokeDasharray="4 2"
            />
            <path
              d={`M 480 60 L 620 60 L 620 150`}
              fill="none"
              stroke="currentColor"
              strokeWidth={phase === "decode" ? 2.5 : 1}
              strokeDasharray="4 2"
            />
            <path
              d={`M 340 60 L 100 60 L 100 160`}
              fill="none"
              stroke="currentColor"
              strokeWidth={phase === "decode" ? 2.5 : 1}
              strokeDasharray="4 2"
            />
          </g>

          {/* ---- Boxes ---- */}
          <DatapathBox
            x={60}
            y={160}
            w={80}
            h={44}
            active={active.pc}
            label="PC"
            value={`0x${frame.pc.toString(16).padStart(2, "0")}`}
          />
          <DatapathBox
            x={180}
            y={160}
            w={100}
            h={44}
            active={active.ir}
            label="IR"
            value={frame.instrLabel}
            mono
          />
          <DatapathBox
            x={340}
            y={30}
            w={140}
            h={60}
            active={active.control}
            label="Kontroll-enhet"
            value="dekoder + signaler"
            highlight={phase === "decode" ? "warning" : undefined}
          />
          <DatapathBox
            x={340}
            y={140}
            w={140}
            h={80}
            active={active.regfile}
            label="Register-fil"
            value={`R0..R3`}
          />
          <DatapathBox
            x={560}
            y={150}
            w={120}
            h={80}
            active={active.alu}
            label="ALU"
            value={frame.aluInputs ? frame.aluInputs.op : "+ − ="}
          />
          <DatapathBox
            x={340}
            y={280}
            w={140}
            h={60}
            active={active.ram}
            label="RAM"
            value="8 celler"
            highlight={
              phase === "execute" && active.ram
                ? frame.buses.dataBus?.direction === "toMem"
                  ? "success"
                  : "brand"
                : undefined
            }
          />

          {/* Bus-merkelapper */}
          <text x={100} y={155} className="fill-muted-foreground" fontSize={9} textAnchor="middle">
            addr-bus
          </text>
          <text x={490} y={258} className="fill-muted-foreground" fontSize={9} textAnchor="start">
            writeback
          </text>
          <text x={690} y={172} className="fill-muted-foreground" fontSize={9}>
            ALU-input
          </text>
        </svg>
      </div>
    </div>
  );
}

function DatapathBox({
  x,
  y,
  w,
  h,
  active,
  label,
  value,
  mono,
  highlight,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "brand" | "warning" | "success";
}) {
  const color = highlight ?? (active ? "brand" : undefined);
  const rectClass =
    color === "warning"
      ? "fill-warning/15 stroke-warning"
      : color === "success"
      ? "fill-success/15 stroke-success"
      : color === "brand"
      ? "fill-brand/15 stroke-brand"
      : "fill-card stroke-border";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        strokeWidth={color ? 2 : 1.2}
        className={rectClass}
      />
      <text
        x={x + w / 2}
        y={y + 16}
        textAnchor="middle"
        className="fill-foreground"
        fontSize={11}
        fontWeight={600}
      >
        {label}
      </text>
      <text
        x={x + w / 2}
        y={y + h - 10}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={10}
        fontFamily={mono ? "ui-monospace, monospace" : undefined}
      >
        {value}
      </text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Panel-komponenter
// --------------------------------------------------------------------------

function ProgramListing({
  program,
  pc,
  phase,
}: {
  program: Instr[];
  pc: number;
  phase: Phase;
}) {
  return (
    <div className="border-r border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Program (RAM-instruksjoner)
      </div>
      <pre className="font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto">
        {program.map((ins, i) => {
          const isActive = i === pc;
          return (
            <div
              key={i}
              className={`-mx-2 px-2 rounded flex ${
                isActive
                  ? "bg-brand/15 text-foreground border-l-2 border-brand"
                  : "text-muted-foreground border-l-2 border-transparent"
              }`}
            >
              <span className="inline-block w-12 text-right pr-2 select-none opacity-60">
                {isActive ? "▶" : ""}0x{i.toString(16).padStart(2, "0")}
              </span>
              <span className="flex-1">{instrText(ins)}</span>
              {isActive && (
                <span className="ml-2 text-[9px] uppercase tracking-wider text-brand">
                  {PHASE_LABEL[phase]}
                </span>
              )}
            </div>
          );
        })}
      </pre>
    </div>
  );
}

function RegisterPanel({ frame }: { frame: Frame }) {
  return (
    <div className="border-r border-border bg-muted/10 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Register-fil
      </div>
      <div className="space-y-1">
        {REGS.map((r) => {
          const written = frame.writtenReg === r;
          const read = frame.readRegs.includes(r);
          return (
            <div
              key={r}
              className={`flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-xs transition-colors ${
                written
                  ? "border-success bg-success/15 text-foreground"
                  : read
                  ? "border-brand bg-brand/15 text-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="font-semibold">{r}</span>
              <span className="tabular-nums">{frame.registers[r]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RamPanel({ frame }: { frame: Frame }) {
  return (
    <div className="bg-muted/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        RAM (8 celler)
      </div>
      <div className="grid grid-cols-2 gap-1">
        {frame.ram.map((v, i) => {
          const isRead = i === frame.ramReadIdx;
          const isWrite = i === frame.ramWriteIdx;
          return (
            <div
              key={i}
              className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors flex items-center justify-between ${
                isWrite
                  ? "border-success bg-success/15 text-foreground"
                  : isRead
                  ? "border-brand bg-brand/15 text-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="opacity-70">0x{i.toString(16).padStart(2, "0")}</span>
              <span className="tabular-nums font-semibold">{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SignalsPanel({ frame }: { frame: Frame }) {
  const sigs: { key: keyof Signals; label: string }[] = [
    { key: "RegRead", label: "RegRead" },
    { key: "RegWrite", label: "RegWrite" },
    { key: "MemRead", label: "MemRead" },
    { key: "MemWrite", label: "MemWrite" },
    { key: "Branch", label: "Branch" },
    { key: "ImmSrc", label: "ImmSrc" },
  ];
  const decodeOn = frame.phase === "decode" || frame.phase === "execute" || frame.phase === "writeback";
  return (
    <div className="border-r border-border bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Kontroll-signaler
      </div>
      <div className="grid grid-cols-2 gap-1">
        {sigs.map((s) => {
          const on = decodeOn && Boolean(frame.signals[s.key]);
          return (
            <div
              key={s.key}
              className={`flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
                on
                  ? "border-warning bg-warning/15 text-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span>{s.label}</span>
              <span className="tabular-nums">{on ? "1" : "0"}</span>
            </div>
          );
        })}
        <div
          className={`col-span-2 flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-[11px] ${
            decodeOn && frame.signals.ALUop !== "—"
              ? "border-warning bg-warning/15 text-foreground"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          <span>ALUop</span>
          <span className="tabular-nums">{decodeOn ? frame.signals.ALUop : "—"}</span>
        </div>
      </div>
    </div>
  );
}

function AluPanel({ frame }: { frame: Frame }) {
  const a = frame.aluInputs;
  return (
    <div className="bg-muted/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        ALU
      </div>
      {a && frame.phase === "execute" ? (
        <div className="font-mono text-xs space-y-1">
          <div className="flex justify-between rounded border border-border bg-card px-2 py-1">
            <span className="text-muted-foreground">A</span>
            <span className="tabular-nums">{a.a}</span>
          </div>
          <div className="flex justify-between rounded border border-border bg-card px-2 py-1">
            <span className="text-muted-foreground">B</span>
            <span className="tabular-nums">{a.b}</span>
          </div>
          <div className="flex justify-between rounded border border-border bg-card px-2 py-1">
            <span className="text-muted-foreground">op</span>
            <span>{a.op}</span>
          </div>
          <div className="flex justify-between rounded border border-brand bg-brand/15 px-2 py-1">
            <span className="text-muted-foreground">ut</span>
            <span className="tabular-nums font-semibold">{a.out}</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground italic px-2 py-3 rounded border border-dashed border-border">
          ALU er inaktiv i {PHASE_LABEL[frame.phase]}-fasen.
        </div>
      )}
    </div>
  );
}
