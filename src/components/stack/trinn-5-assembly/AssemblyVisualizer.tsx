import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv assembly-trace.
// Vi simulerer en bitteliten x86-64-subset over fire forhåndsdefinerte
// programmer:
//   1) sum-loop   — for-løkke som summerer 1..n
//   2) call-ret   — main kaller add(a, b), demonstrerer stack-frame
//   3) array-sum  — løkke over minne (load via [base + idx*8])
//   4) cond       — if / else med cmp + je / jne
//
// All execution er pre-computet up-front (Frame[]). Play / step / scrub
// indekserer bare inn i lista. Det matcher mønsteret i RecursionVisualizer.
// --------------------------------------------------------------------------

type Mode = "sum" | "call" | "array" | "cond";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "sum", label: "Sum 1..n", sub: "for-løkke med teller i rcx" },
  { id: "call", label: "Funksjonskall", sub: "main → add(a, b), stack-frame" },
  { id: "array", label: "Array-sum", sub: "load fra minne i løkke" },
  { id: "cond", label: "if / else", sub: "cmp + je — betinget hopp" },
];

const MODE_NOTE: Record<Mode, string> = {
  sum: "Vanlig løkke: rcx er telleren (i), rax er akkumulatoren. cmp + jle styrer om vi fortsetter.",
  call: "call pusher return-adressen på stacken og hopper til funksjonen. Funksjonen lager egen stack-frame med push rbp / mov rbp, rsp.",
  array:
    "Array-tilgang via [rdi + rcx*8] — base-pekeren pluss indeks ganget med element-størrelse (8 bytes per int64).",
  cond: "cmp setter flag-bits (ZF). je hopper hvis ZF=1 (likhet). Ellers faller vi gjennom til neste linje.",
};

// --------------------------------------------------------------------------
// Maskin-modell
// --------------------------------------------------------------------------

/** Registrene vi simulerer. RIP er program-pointer (= linjeindeks). */
type Reg = "rax" | "rbx" | "rcx" | "rdx" | "rdi" | "rsi" | "rbp" | "rsp" | "rip";
const REG_ORDER: Reg[] = ["rax", "rbx", "rcx", "rdx", "rdi", "rsi", "rbp", "rsp", "rip"];

const REG_ROLE: Record<Reg, string> = {
  rax: "return / akku",
  rbx: "callee-saved",
  rcx: "teller",
  rdx: "data",
  rdi: "1. arg",
  rsi: "2. arg",
  rbp: "frame-base",
  rsp: "stack-top",
  rip: "instr-pointer",
};

/** Stack-cell = én 8-byte slot. */
interface StackCell {
  addr: number;
  value: number;
  /** Norsk merkelapp som hjelper leseren ("return-adresse", "gammelt rbp"). */
  note?: string;
}

/** Snapshot pr. steg. Tegnes 1:1 i UI. */
interface Frame {
  rip: number;
  description: string;
  registers: Record<Reg, number>;
  /** Hvilke registre ble skrevet i dette steget — vi flasher dem i UI. */
  writtenRegs: Reg[];
  /** Minne-celler vist i venstre kolonne i panelet. */
  memory: { addr: number; value: number; label?: string }[];
  /** Indeks i memory-arrayen som ble lest/skrevet i steget. */
  memReadIdx?: number;
  memWriteIdx?: number;
  /** Stack-celler, høyeste adresse først (= bunnen, gammel data). */
  stack: StackCell[];
  /** ZF-flagget — eneste flagget vi simulerer. */
  zf: boolean;
}

interface Program {
  /** Tekstlinjer som vises i kode-panelet (1:1 med "kjørbare" instruksjoner). */
  lines: string[];
  /** Pre-computet trace. */
  frames: Frame[];
  /** Hva minne-arrayet skal kalles ("ingen" hvis ikke i bruk). */
  memCaption?: string;
}

// --------------------------------------------------------------------------
// Felles helper for å bygge frames step-by-step
// --------------------------------------------------------------------------

class Machine {
  registers: Record<Reg, number>;
  memory: { addr: number; value: number; label?: string }[];
  stack: StackCell[];
  zf: boolean;
  lines: string[];
  frames: Frame[];
  /** Stack-top adresse — vokser nedover, så push minker denne. */
  rspStart: number;

  constructor(lines: string[], opts?: { memory?: { addr: number; value: number; label?: string }[]; rspStart?: number }) {
    this.lines = lines;
    this.memory = opts?.memory ?? [];
    this.rspStart = opts?.rspStart ?? 0x7ffe0000;
    this.registers = {
      rax: 0,
      rbx: 0,
      rcx: 0,
      rdx: 0,
      rdi: 0,
      rsi: 0,
      rbp: 0,
      rsp: this.rspStart,
      rip: 0,
    };
    this.stack = [];
    this.zf = false;
    this.frames = [];
  }

  snap(rip: number, description: string, writtenRegs: Reg[] = [], opts?: { memReadIdx?: number; memWriteIdx?: number }) {
    this.registers.rip = rip;
    // De-dup writtenRegs uten å inkludere rip (rip endres hvert steg — ikke interessant å flashe).
    const unique = Array.from(new Set(writtenRegs)).filter((r) => r !== "rip");
    this.frames.push({
      rip,
      description,
      registers: { ...this.registers },
      writtenRegs: unique,
      memory: this.memory.map((m) => ({ ...m })),
      memReadIdx: opts?.memReadIdx,
      memWriteIdx: opts?.memWriteIdx,
      stack: this.stack.map((s) => ({ ...s })),
      zf: this.zf,
    });
  }

  /** Push en verdi: rsp -= 8, lagre. */
  push(value: number, note?: string) {
    this.registers.rsp -= 8;
    this.stack.unshift({ addr: this.registers.rsp, value, note });
  }

  /** Pop: hent topp, rsp += 8. */
  pop(): number {
    const top = this.stack.shift();
    this.registers.rsp += 8;
    return top?.value ?? 0;
  }
}

// --------------------------------------------------------------------------
// Program 1 — Sum 1..n
// --------------------------------------------------------------------------

function buildSumProgram(n: number): Program {
  const lines = [
    "  mov rax, 0          ; sum := 0",
    "  mov rcx, 1          ; i   := 1",
    "loop_start:",
    "  cmp rcx, " + n.toString().padEnd(11) + "; sammenlign i med n",
    "  jg  loop_end        ; hopp ut hvis i > n",
    "  add rax, rcx        ; sum += i",
    "  inc rcx             ; i++",
    "  jmp loop_start",
    "loop_end:",
    "  ; sum ligger i rax",
  ];
  const m = new Machine(lines);

  // Vi gjør en enkel snap-helper som flasher utskriving + setter beskrivelse.
  const desc = (s: string) => s;

  m.snap(0, desc("Start. Initialiserer sum og teller."));
  m.registers.rax = 0;
  m.snap(0, desc("mov rax, 0 — sum settes til 0."), ["rax"]);
  m.registers.rcx = 1;
  m.snap(1, desc("mov rcx, 1 — telleren i starter på 1."), ["rcx"]);

  for (let i = 1; i <= n + 1; i++) {
    // Linje 3 (idx 3): cmp rcx, n
    m.zf = m.registers.rcx === n;
    const cond = m.registers.rcx > n;
    m.snap(3, desc(`cmp rcx, ${n} — rcx=${m.registers.rcx}, ${m.registers.rcx > n ? "større" : m.registers.rcx === n ? "lik" : "mindre eller lik"} ${n}.`));
    if (cond) {
      m.snap(4, desc(`jg loop_end — rcx (${m.registers.rcx}) > ${n}, hopper ut.`));
      m.snap(8, desc(`loop_end: ferdig. Sum = ${m.registers.rax} ligger i rax.`));
      break;
    } else {
      m.snap(4, desc(`jg loop_end — rcx (${m.registers.rcx}) ≤ ${n}, faller gjennom.`));
      const prev = m.registers.rax;
      m.registers.rax = prev + m.registers.rcx;
      m.snap(5, desc(`add rax, rcx — sum: ${prev} + ${m.registers.rcx} = ${m.registers.rax}.`), ["rax"]);
      m.registers.rcx += 1;
      m.snap(6, desc(`inc rcx — i blir ${m.registers.rcx}.`), ["rcx"]);
      m.snap(7, desc(`jmp loop_start — hopp tilbake til toppen av løkka.`));
    }
  }

  return { lines, frames: m.frames };
}

// --------------------------------------------------------------------------
// Program 2 — Funksjonskall: main kaller add(a, b)
// --------------------------------------------------------------------------

function buildCallProgram(): Program {
  // Vi viser hele programmet som ett tekstblock med både main: og add:.
  // RIP indekserer inn i lines[]. Etiketter (linjer som slutter med ":")
  // teller også som linjer, men step-loopen vår peker på instruksjons-linjene.
  const lines = [
    "main:",
    "  mov rdi, 7          ; 1. arg = 7",
    "  mov rsi, 5          ; 2. arg = 5",
    "  call add            ; pusher return-adr, hopper",
    "  ; ⇣ etter return: resultatet ligger i rax",
    "  mov rbx, rax        ; ta vare på resultatet",
    "  ret                 ; (ferdig)",
    "",
    "add:",
    "  push rbp            ; lagre gammelt rbp",
    "  mov  rbp, rsp       ; ny frame-base",
    "  mov  rax, rdi       ; rax := a",
    "  add  rax, rsi       ; rax += b",
    "  pop  rbp            ; gjenopprett rbp",
    "  ret                 ; pop return-adr, hopp tilbake",
  ];
  const m = new Machine(lines, { rspStart: 0x7ffe0100 });

  m.snap(1, "Start i main.");
  m.registers.rdi = 7;
  m.snap(1, "mov rdi, 7 — første argument til add.", ["rdi"]);
  m.registers.rsi = 5;
  m.snap(2, "mov rsi, 5 — andre argument til add.", ["rsi"]);

  // call add: push return-adresse (= neste linje etter call = linje 4), hopp til add: (linje 8 → første instr på linje 9)
  m.push(4, "return-adresse");
  m.snap(3, "call add — pusher return-adressen (linje 5) og hopper til add.", ["rsp"]);

  // Inn i add:
  m.snap(9, "Inn i add. Prolog først.");
  m.push(m.registers.rbp, "gammelt rbp");
  m.snap(9, "push rbp — lagrer kallerens frame-base på stacken.", ["rsp"]);
  m.registers.rbp = m.registers.rsp;
  m.snap(10, "mov rbp, rsp — egen frame-base er nå toppen av stacken.", ["rbp"]);
  m.registers.rax = m.registers.rdi;
  m.snap(11, `mov rax, rdi — rax := a (${m.registers.rdi}).`, ["rax"]);
  m.registers.rax = m.registers.rax + m.registers.rsi;
  m.snap(12, `add rax, rsi — rax += b (${m.registers.rsi}) ⇒ rax = ${m.registers.rax}.`, ["rax"]);

  // Epilog
  const oldRbp = m.pop();
  m.registers.rbp = oldRbp;
  m.snap(13, "pop rbp — gjenoppretter kallerens frame-base.", ["rbp", "rsp"]);
  const retAddr = m.pop();
  m.snap(14, `ret — pop return-adresse (linje ${retAddr + 1}), hopper tilbake til main.`, ["rsp"]);

  // Tilbake i main, linje 4 var kommentar, så vi går til 5 (mov rbx, rax)
  m.snap(retAddr, "Tilbake i main etter call. Resultatet (rax) er klart.");
  m.registers.rbx = m.registers.rax;
  m.snap(5, `mov rbx, rax — kopierer return-verdien (${m.registers.rax}) til rbx.`, ["rbx"]);
  m.snap(6, "ret — main ferdig.");

  return { lines, frames: m.frames };
}

// --------------------------------------------------------------------------
// Program 3 — Array-sum (load fra minne)
// --------------------------------------------------------------------------

function buildArrayProgram(): Program {
  // Lager et lite "array" på 5 int64 i minne-banken.
  const arr = [10, 20, 30, 5, 100];
  const base = 0x1000;
  const memory: { addr: number; value: number; label?: string }[] = [];
  // Fyll 8 celler for kontekst — første 5 har data, resten 0.
  for (let i = 0; i < 8; i++) {
    memory.push({
      addr: base + i * 8,
      value: i < arr.length ? arr[i] : 0,
      label: i < arr.length ? `arr[${i}]` : undefined,
    });
  }
  const n = arr.length;

  const lines = [
    "  mov rdi, 0x1000     ; rdi := base-peker til arr",
    "  mov rcx, 0          ; i   := 0",
    "  mov rax, 0          ; sum := 0",
    "loop_start:",
    `  cmp rcx, ${n}          ; i vs n (=${n})`,
    "  jge loop_end        ; hopp ut hvis i >= n",
    "  add rax, [rdi+rcx*8]; sum += arr[i]",
    "  inc rcx             ; i++",
    "  jmp loop_start",
    "loop_end:",
  ];

  const m = new Machine(lines, { memory });

  m.registers.rdi = base;
  m.snap(0, `mov rdi, 0x1000 — base-pekeren til arrayet.`, ["rdi"]);
  m.registers.rcx = 0;
  m.snap(1, "mov rcx, 0 — indeksen starter på 0.", ["rcx"]);
  m.registers.rax = 0;
  m.snap(2, "mov rax, 0 — akkumulatoren starter på 0.", ["rax"]);

  for (let iter = 0; iter <= n; iter++) {
    m.zf = m.registers.rcx === n;
    m.snap(4, `cmp rcx, ${n} — rcx=${m.registers.rcx}.`);
    if (m.registers.rcx >= n) {
      m.snap(5, `jge loop_end — ${m.registers.rcx} ≥ ${n}, hopper ut.`);
      m.snap(9, `loop_end: ferdig. Sum = ${m.registers.rax} i rax.`);
      break;
    }
    m.snap(5, `jge loop_end — ${m.registers.rcx} < ${n}, faller gjennom.`);
    const i = m.registers.rcx;
    const addr = m.registers.rdi + i * 8;
    const memIdx = (addr - base) / 8;
    const val = m.memory[memIdx].value;
    const prev = m.registers.rax;
    m.registers.rax = prev + val;
    m.snap(
      6,
      `add rax, [rdi + rcx*8] — leser arr[${i}] = ${val} fra 0x${addr.toString(16)}. sum: ${prev} + ${val} = ${m.registers.rax}.`,
      ["rax"],
      { memReadIdx: memIdx },
    );
    m.registers.rcx += 1;
    m.snap(7, `inc rcx — i blir ${m.registers.rcx}.`, ["rcx"]);
    m.snap(8, "jmp loop_start — opp igjen.");
  }

  return { lines, frames: m.frames, memCaption: "Minne (arr ligger på 0x1000)" };
}

// --------------------------------------------------------------------------
// Program 4 — Conditional (if / else med cmp + je)
// --------------------------------------------------------------------------

function buildCondProgram(): Program {
  const lines = [
    "  mov rax, 7          ; a := 7",
    "  mov rbx, 7          ; b := 7",
    "  cmp rax, rbx        ; sammenlign a og b",
    "  je  equal           ; hopp hvis like (ZF=1)",
    "  mov rdx, 0          ; (else-grein) rdx := 0",
    "  jmp end",
    "equal:",
    "  mov rdx, 1          ; rdx := 1 — markerer 'like'",
    "end:",
    "  ; rdx = 1 hvis a==b, ellers 0",
  ];

  const m = new Machine(lines);

  m.registers.rax = 7;
  m.snap(0, "mov rax, 7 — a settes til 7.", ["rax"]);
  m.registers.rbx = 7;
  m.snap(1, "mov rbx, 7 — b settes til 7.", ["rbx"]);
  m.zf = m.registers.rax === m.registers.rbx;
  m.snap(
    2,
    `cmp rax, rbx — beregner rax − rbx = ${m.registers.rax - m.registers.rbx}. ZF=${m.zf ? "1" : "0"}.`,
  );
  if (m.zf) {
    m.snap(3, "je equal — ZF=1, hopper til equal.");
    m.snap(6, "equal:");
    m.registers.rdx = 1;
    m.snap(7, "mov rdx, 1 — markerer at a == b.", ["rdx"]);
    m.snap(8, "end: ferdig. rdx = 1.");
  } else {
    m.snap(3, "je equal — ZF=0, faller gjennom (ikke like).");
    m.registers.rdx = 0;
    m.snap(4, "mov rdx, 0 — else-grein.", ["rdx"]);
    m.snap(5, "jmp end — hopp forbi equal-blokken.");
    m.snap(8, "end: ferdig. rdx = 0.");
  }

  return { lines, frames: m.frames };
}

function buildProgram(mode: Mode, n: number): Program {
  if (mode === "sum") return buildSumProgram(n);
  if (mode === "call") return buildCallProgram();
  if (mode === "array") return buildArrayProgram();
  return buildCondProgram();
}

const SUM_N_RANGE = { min: 2, max: 8, default: 4 };

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------

export function AssemblyVisualizer() {
  const [mode, setMode] = useState<Mode>("sum");
  const [sumN, setSumN] = useState<number>(SUM_N_RANGE.default);
  const program = useMemo(() => buildProgram(mode, sumN), [mode, sumN]);
  const frames = program.frames;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [mode, sumN]);

  useEffect(() => {
    if (!playing) return;
    if (step >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), speed);
    return () => window.clearTimeout(t);
  }, [playing, step, frames.length, speed]);

  const current: Frame =
    frames[step] ??
    ({
      rip: 0,
      description: "",
      registers: { rax: 0, rbx: 0, rcx: 0, rdx: 0, rdi: 0, rsi: 0, rbp: 0, rsp: 0, rip: 0 },
      writtenRegs: [],
      memory: [],
      stack: [],
      zf: false,
    } as Frame);

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
              Assembly-trace — se registre, minne og stack endre seg
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

      {/* Hovedlayout: kode | registre+minne. Stack i bunn. */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-0 border-b border-border">
        {/* Kode */}
        <div className="border-r border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
            Kode
            <span className="text-muted-foreground/60 font-mono normal-case">
              rip → linje {current.rip + 1}
            </span>
          </div>
          <pre className="font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
            {program.lines.map((line, i) => {
              const isActive = i === current.rip;
              return (
                <div
                  key={i}
                  className={`-mx-2 px-2 rounded flex ${
                    isActive
                      ? "bg-brand/15 text-foreground border-l-2 border-brand"
                      : "text-muted-foreground border-l-2 border-transparent"
                  }`}
                >
                  <span className="inline-block w-7 text-right pr-2 select-none opacity-60">
                    {isActive ? "▶" : i + 1}
                  </span>
                  <span className="flex-1">{line || " "}</span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Registre + minne */}
        <div className="grid grid-cols-2 gap-0">
          <div className="border-r border-border bg-muted/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Registre
            </div>
            <RegisterTable
              registers={current.registers}
              writtenRegs={current.writtenRegs}
              zf={current.zf}
            />
          </div>
          <div className="bg-muted/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              {program.memCaption ?? "Minne"}
            </div>
            <MemoryGrid
              memory={current.memory}
              readIdx={current.memReadIdx}
              writeIdx={current.memWriteIdx}
            />
          </div>
        </div>
      </div>

      {/* Stack */}
      <div className="px-4 py-3 border-b border-border bg-background">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Stack (vokser nedover — topp ≈ lavest adresse)
        </div>
        <StackPanel stack={current.stack} rsp={current.registers.rsp} />
      </div>

      {/* Beskrivelse + modus-note */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="text-sm text-foreground">
          {current.description || "Trykk Play eller Neste for å starte."}
        </div>
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
            title="Forrige steg"
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
            title="Neste steg"
          >
            Neste <SkipForward className="h-3 w-3" />
          </button>
        </div>

        {mode === "sum" && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="asm-n">
              n =
            </label>
            <input
              id="asm-n"
              type="range"
              min={SUM_N_RANGE.min}
              max={SUM_N_RANGE.max}
              value={sumN}
              onChange={(e) => setSumN(Number.parseInt(e.target.value, 10))}
              className="w-28 accent-brand"
            />
            <span className="text-xs font-mono w-6 text-right tabular-nums">{sumN}</span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-muted-foreground" htmlFor="asm-speed">
            tempo
          </label>
          <input
            id="asm-speed"
            type="range"
            min={150}
            max={1200}
            step={50}
            value={1350 - speed}
            onChange={(e) => setSpeed(1350 - Number.parseInt(e.target.value, 10))}
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
            aria-label="Steg-scrubber"
          />
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-komponenter
// --------------------------------------------------------------------------

function formatHex(n: number) {
  if (n === 0) return "0x00";
  // Bruk så få nibbles vi trenger, men minst 2.
  const hex = n.toString(16);
  return "0x" + (hex.length % 2 === 1 ? "0" + hex : hex);
}

function RegisterTable({
  registers,
  writtenRegs,
  zf,
}: {
  registers: Record<Reg, number>;
  writtenRegs: Reg[];
  zf: boolean;
}) {
  return (
    <div className="space-y-1">
      {REG_ORDER.map((r) => {
        const flashed = writtenRegs.includes(r);
        return (
          <div
            key={r}
            className={`flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-xs transition-colors ${
              flashed
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
            title={REG_ROLE[r]}
          >
            <span className="font-semibold">{r}</span>
            <span className="tabular-nums">{formatHex(registers[r])}</span>
          </div>
        );
      })}
      <div
        className={`flex items-center justify-between gap-2 rounded border px-2 py-1 font-mono text-xs mt-2 ${
          zf
            ? "border-brand bg-brand/15 text-foreground"
            : "border-border bg-card text-muted-foreground"
        }`}
        title="Zero Flag — settes av cmp/test"
      >
        <span className="font-semibold">ZF</span>
        <span>{zf ? "1" : "0"}</span>
      </div>
    </div>
  );
}

function MemoryGrid({
  memory,
  readIdx,
  writeIdx,
}: {
  memory: { addr: number; value: number; label?: string }[];
  readIdx?: number;
  writeIdx?: number;
}) {
  if (memory.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic px-2 py-3 rounded border border-dashed border-border">
        Ingen minne-tilgang i dette programmet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-1">
      {memory.map((cell, i) => {
        const read = i === readIdx;
        const write = i === writeIdx;
        return (
          <div
            key={cell.addr}
            className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
              write
                ? "border-success bg-success/15 text-success"
                : read
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
            title={cell.label}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="opacity-70">{formatHex(cell.addr)}</span>
              <span className="tabular-nums font-semibold">{cell.value}</span>
            </div>
            {cell.label && <div className="text-[9px] opacity-60">{cell.label}</div>}
          </div>
        );
      })}
    </div>
  );
}

function StackPanel({ stack, rsp }: { stack: StackCell[]; rsp: number }) {
  if (stack.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic px-2 py-3 rounded border border-dashed border-border">
        Stack er tom — ingen push/call enda. rsp = {formatHex(rsp)}.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {stack.map((cell, i) => {
        const isTop = i === 0; // stack[0] = topp (lavest adresse)
        return (
          <div
            key={`${cell.addr}-${i}`}
            className={`flex items-center gap-2 rounded border px-2 py-1 font-mono text-xs transition-colors ${
              isTop
                ? "border-brand bg-brand/15 text-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <span className="opacity-70 w-20 shrink-0">{formatHex(cell.addr)}</span>
            <span className="tabular-nums font-semibold w-16 shrink-0">
              {typeof cell.value === "number" ? cell.value : "?"}
            </span>
            {cell.note && (
              <span className="text-[10px] opacity-70 italic">{cell.note}</span>
            )}
            {isTop && (
              <span className="ml-auto text-[10px] text-brand font-semibold">← rsp</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
