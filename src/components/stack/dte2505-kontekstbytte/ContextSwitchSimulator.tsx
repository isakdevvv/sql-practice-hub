import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ContextSwitchSimulator
// Visualiserer register-for-register save/restore mellom Tråd A og Tråd B.
// O'Gorman kap. 2.8: hver tråd har en "volatile environment" som inneholder
// alle CPU-registre som må gjenskapes når tråden får CPU igjen. Det subtile
// punktet: PC må RESTORES SIST (og SAVES FØRST) — ellers henter CPU neste
// instruksjon fra feil sted og hopper inn i kontekstbytter-koden eller i
// midten av annen tråds kode.

// ---------------- typer ----------------

type RegName = "PC" | "SP" | "PSR" | "MMU" | "R0" | "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7";

const REG_ORDER: RegName[] = ["PC", "SP", "PSR", "MMU", "R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7"];

type Mode = "correct" | "pc-first"; // pc-first = feilmodus

type Phase =
  | "idle-a"            // Tråd A kjører på CPU
  | "save-a-pc"         // save PC til A
  | "save-a-sp"         // save SP til A
  | "save-a-gp"         // save R0..R7 til A
  | "save-a-psr"        // save PSR
  | "save-a-mmu"        // save MMU
  | "load-b-mmu"        // load MMU fra B
  | "load-b-psr"        // load PSR fra B
  | "load-b-gp"         // load R0..R7 fra B
  | "load-b-sp"         // load SP fra B
  | "load-b-pc"         // load PC fra B  (sist!)
  | "idle-b"            // Tråd B kjører på CPU
  | "crash"             // feilmodus: vi loaded PC først → CPU hopper inn på feil sted
  ;

// "Plan" i riktig modus: full save→load i klassisk rekkefølge.
const PLAN_CORRECT: Phase[] = [
  "save-a-pc",
  "save-a-sp",
  "save-a-gp",
  "save-a-psr",
  "save-a-mmu",
  "load-b-mmu",
  "load-b-psr",
  "load-b-gp",
  "load-b-sp",
  "load-b-pc",
  "idle-b",
];

// "Plan" i feilmodus: vi restorer PC FØRST. Etter at PC er satt fra B, vil
// neste instruksjon hentes fra B's adresse — men resten av registrene (SP,
// GP, PSR, MMU) er fortsatt Tråd A's. CPU bommer.
const PLAN_PC_FIRST: Phase[] = [
  "save-a-pc",
  "save-a-sp",
  "save-a-gp",
  "save-a-psr",
  "save-a-mmu",
  "load-b-pc",     // <-- PC først (feil!)
  "crash",
];

// ---------------- initial state ----------------

type RegSet = Record<RegName, string>;

// Tråd A: en bruker-prosess som regner på en buffer.
const A_INITIAL: RegSet = {
  PC:  "0x004012A8",
  SP:  "0x7FFE_FA40",
  PSR: "U Z=0 N=0 IE=1",
  MMU: "PT@0x1000_0000",
  R0:  "0x0000_002A",
  R1:  "0x0000_0010",
  R2:  "0x6020_0000",
  R3:  "0x0000_0001",
  R4:  "0xDEAD_BEEF",
  R5:  "0x0000_0000",
  R6:  "0x7FFE_FB10",
  R7:  "0x0040_1300",
};

// Tråd B: en helt annen bruker-prosess. Egen MMU-tabell, egen stack.
const B_INITIAL: RegSet = {
  PC:  "0x0050_8104",
  SP:  "0x7FFD_C220",
  PSR: "U Z=1 N=0 IE=1",
  MMU: "PT@0x2000_0000",
  R0:  "0x0000_FFFF",
  R1:  "0x0050_C000",
  R2:  "0x0000_0080",
  R3:  "0xBADC_AFE0",
  R4:  "0x0000_0000",
  R5:  "0x0000_0007",
  R6:  "0x7FFD_C300",
  R7:  "0x0050_8200",
};

// "tomt" register (CPU har ikke fått verdien ennå)
const EMPTY: RegSet = {
  PC: "—", SP: "—", PSR: "—", MMU: "—",
  R0: "—", R1: "—", R2: "—", R3: "—", R4: "—", R5: "—", R6: "—", R7: "—",
};

// ---------------- hjelpere ----------------

function regsForPhase(phase: Phase, mode: Mode): {
  cpu: RegSet;
  a: RegSet;
  b: RegSet;
  highlight: RegName[];
  direction: "save" | "load" | "none";
  side: "A" | "B" | "none";
  nextFetchFrom: string;
  description: string;
} {
  // utgangspunkt: A's verdier ligger i CPU, A's volatile env er stale.
  // Når save begynner kopieres CPU→A. Når load begynner kopieres B→CPU.
  let cpu: RegSet = { ...A_INITIAL };
  let a: RegSet = { ...EMPTY };
  let b: RegSet = { ...B_INITIAL };

  // Vi spilles fram i den oppgitte rekkefølgen.
  const plan = mode === "correct" ? PLAN_CORRECT : PLAN_PC_FIRST;
  const phaseIndex = plan.indexOf(phase);

  // Re-applier alle effekter opp til og med valgt fase.
  for (let i = 0; i <= phaseIndex; i++) {
    const p = plan[i];
    switch (p) {
      case "save-a-pc":
        a.PC = cpu.PC;
        break;
      case "save-a-sp":
        a.SP = cpu.SP;
        break;
      case "save-a-gp":
        a.R0 = cpu.R0; a.R1 = cpu.R1; a.R2 = cpu.R2; a.R3 = cpu.R3;
        a.R4 = cpu.R4; a.R5 = cpu.R5; a.R6 = cpu.R6; a.R7 = cpu.R7;
        break;
      case "save-a-psr":
        a.PSR = cpu.PSR;
        break;
      case "save-a-mmu":
        a.MMU = cpu.MMU;
        break;
      case "load-b-mmu":
        cpu.MMU = b.MMU;
        break;
      case "load-b-psr":
        cpu.PSR = b.PSR;
        break;
      case "load-b-gp":
        cpu.R0 = b.R0; cpu.R1 = b.R1; cpu.R2 = b.R2; cpu.R3 = b.R3;
        cpu.R4 = b.R4; cpu.R5 = b.R5; cpu.R6 = b.R6; cpu.R7 = b.R7;
        break;
      case "load-b-sp":
        cpu.SP = b.SP;
        break;
      case "load-b-pc":
        cpu.PC = b.PC;
        break;
      case "idle-b":
        // ingen endring — B kjører nå.
        break;
      case "crash":
        // ingen flere registerendringer; vi tegner krasj-overlay i stedet.
        break;
    }
  }

  // hvilke registre skal highlightes for *denne* fasen?
  let highlight: RegName[] = [];
  let direction: "save" | "load" | "none" = "none";
  let side: "A" | "B" | "none" = "none";
  let nextFetchFrom = cpu.PC;
  let description = "";

  switch (phase) {
    case "idle-a":
      description = "Tråd A kjører på CPU. Alle registre er A's. Klikk «Kontekstbytte til B» for å se overgangen steg-for-steg.";
      nextFetchFrom = cpu.PC;
      break;
    case "save-a-pc":
      highlight = ["PC"];
      direction = "save"; side = "A";
      description = "Lagrer PC til Tråd A's volatile environment. Dette MÅ skje først — etter dette får ikke CPU lov til å gå videre med A's PC, fordi vi skal bytte. Hopp i kontekstbytter-koden krever at kerneltapen vet hvor A skal resume.";
      break;
    case "save-a-sp":
      highlight = ["SP"];
      direction = "save"; side = "A";
      description = "Lagrer SP. Tråd A's bruker-stack-peker, så vi vet hvor lokale variabler ligger neste gang A får CPU.";
      break;
    case "save-a-gp":
      highlight = ["R0","R1","R2","R3","R4","R5","R6","R7"];
      direction = "save"; side = "A";
      description = "Lagrer generelle registre R0–R7. Dette er hele 'volatile environment': verdier som ikke kan utledes igjen.";
      break;
    case "save-a-psr":
      highlight = ["PSR"];
      direction = "save"; side = "A";
      description = "Lagrer Program Status Register: kjøre-modus (user/kernel), zero/negative-flagg, interrupt-enable. Uten denne ville A miste betingelses-flaggene som styrer neste branch.";
      break;
    case "save-a-mmu":
      highlight = ["MMU"];
      direction = "save"; side = "A";
      description = "Lagrer MMU-konfig (page-table-pointer). Dette markerer at vi nå er ferdig å eie A's adresseområde.";
      break;
    case "load-b-mmu":
      highlight = ["MMU"];
      direction = "load"; side = "B";
      description = "Last MMU-pointer fra B. CPU mapper nå B's virtuelle adresser. (Vi gjør dette FØR vi rører PC eller stack — ellers ville en interrupt midt i bytte se feil adresseområde.)";
      break;
    case "load-b-psr":
      highlight = ["PSR"];
      direction = "load"; side = "B";
      description = "Last B's PSR. Flagg, modus og IE blir B's. Fortsatt ikke trygt å resume — PC peker fortsatt på A.";
      break;
    case "load-b-gp":
      highlight = ["R0","R1","R2","R3","R4","R5","R6","R7"];
      direction = "load"; side = "B";
      description = "Last R0–R7 fra B. Generelle registre er nå B's.";
      break;
    case "load-b-sp":
      highlight = ["SP"];
      direction = "load"; side = "B";
      description = "Last SP fra B. Stack-pekeren peker nå på B's bruker-stack.";
      break;
    case "load-b-pc":
      highlight = ["PC"];
      direction = "load"; side = "B";
      description = mode === "correct"
        ? "Last PC fra B SIST. Idet PC settes, vil neste instruction fetch gå til B's kode. ALT må være på plass før dette — ellers krasj."
        : "FEILMODUS: PC settes FØRST. SP, GP-regs, PSR, MMU er fortsatt A's! Neste instruksjon hentes fra B's adresse, men kjøres med A's stack og A's MMU. CPU vil enten lese feil minne, treffe SIGSEGV, eller hoppe inn i kontekstbytter-koden.";
      nextFetchFrom = cpu.PC;
      break;
    case "idle-b":
      description = "Bytte komplett. Tråd B kjører på CPU. A's tilstand er trygt gjemt i A's volatile environment — venter på neste tur.";
      nextFetchFrom = cpu.PC;
      break;
    case "crash":
      description = "CRASH: PC ble lastet før resten. CPU forsøkte å hente instruksjon på 0x0050_8104 — men SP peker fortsatt på A's stack, og MMU mapper fortsatt A's sider. B's adresse er ikke gyldig i A's adresseområde → page fault → SIGSEGV. (Eller verre: et adressepar som tilfeldigvis er gyldig i begge → silent korrupsjon.)";
      nextFetchFrom = cpu.PC;
      break;
  }

  return { cpu, a, b, highlight, direction, side, nextFetchFrom, description };
}

// ---------------- komponent ----------------

export function ContextSwitchSimulator() {
  const [mode, setMode] = useState<Mode>("correct");
  const [phase, setPhase] = useState<Phase>("idle-a");
  const [autoPlaying, setAutoPlaying] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const plan = mode === "correct" ? PLAN_CORRECT : PLAN_PC_FIRST;
  const view = useMemo(() => regsForPhase(phase, mode), [phase, mode]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const advance = useCallback(() => {
    setPhase((cur) => {
      if (cur === "idle-a") return plan[0];
      const i = plan.indexOf(cur);
      if (i < 0 || i >= plan.length - 1) return cur; // ferdig
      return plan[i + 1];
    });
  }, [plan]);

  const reset = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setAutoPlaying(false);
    setPhase("idle-a");
  }, []);

  // auto-play kjører gjennom planen med 900 ms per steg.
  useEffect(() => {
    if (!autoPlaying) return;
    const lastPhase = plan[plan.length - 1];
    if (phase === lastPhase) {
      setAutoPlaying(false);
      return;
    }
    timeoutRef.current = window.setTimeout(() => {
      advance();
    }, 900);
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [autoPlaying, phase, advance, plan]);

  function startAuto() {
    if (phase !== "idle-a") reset();
    // litt timing-finesse: la reset slå inn først.
    requestAnimationFrame(() => {
      setAutoPlaying(true);
      setPhase(plan[0]);
    });
  }

  function switchMode(next: Mode) {
    reset();
    setMode(next);
  }

  const currentStepNumber = phase === "idle-a" ? 0 : plan.indexOf(phase) + 1;
  const totalSteps = plan.length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      {/* kontrollpanel */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={startAuto}
          className="rounded-md bg-brand text-brand-foreground text-xs font-semibold px-3 py-1.5 hover:opacity-90"
        >
          {mode === "correct" ? "Spill kontekstbytte A→B" : "Spill feilmodus"}
        </button>
        <button
          type="button"
          onClick={advance}
          disabled={phase === plan[plan.length - 1]}
          className="rounded-md border border-border text-xs font-semibold px-3 py-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Neste steg →
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border text-xs font-semibold px-3 py-1.5 hover:bg-muted"
        >
          Reset
        </button>
        <div className="ml-auto flex items-center gap-1 text-xs">
          <span className="text-muted-foreground mr-1">Modus:</span>
          <button
            type="button"
            onClick={() => switchMode("correct")}
            className={`rounded-md px-2 py-1 border ${mode === "correct" ? "border-brand bg-brand/10 text-brand font-semibold" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            Riktig (PC sist)
          </button>
          <button
            type="button"
            onClick={() => switchMode("pc-first")}
            className={`rounded-md px-2 py-1 border ${mode === "pc-first" ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            Feilmodus: PC først
          </button>
        </div>
      </div>

      {/* steg-indikator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">
            Steg {currentStepNumber} / {totalSteps}{phase === "idle-a" ? " — før bytte" : ""}
          </span>
          <span className="font-mono text-muted-foreground">phase: {phase}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${phase === "crash" ? "bg-red-500" : "bg-brand"}`}
            style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* hoved-layout: CPU midt, tråder rundt */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 mb-4">
        <ThreadPanel
          label="Tråd A"
          subtitle="bruker-prosess: regne på buffer"
          regs={view.a}
          active={phase === "idle-a"}
          highlight={view.side === "A" ? view.highlight : []}
          accent="emerald"
        />
        <CpuPanel
          regs={view.cpu}
          highlight={view.highlight}
          direction={view.direction}
          side={view.side}
          crashed={phase === "crash"}
          mode={mode}
          phase={phase}
        />
        <ThreadPanel
          label="Tråd B"
          subtitle="bruker-prosess: lese fil / parse"
          regs={view.b}
          active={phase === "idle-b"}
          highlight={view.side === "B" ? view.highlight : []}
          accent="sky"
        />
      </div>

      {/* beskrivelse av aktuelt steg */}
      <div className={`rounded-lg border p-3 text-sm ${phase === "crash" ? "border-red-500/40 bg-red-500/5 text-red-700 dark:text-red-300" : "border-brand/30 bg-brand/5"}`}>
        <div className="text-xs uppercase tracking-wider font-semibold mb-1">
          {phase === "crash" ? "KRASJ" : phase === "idle-a" || phase === "idle-b" ? "Tilstand" : "Steg-detalj"}
        </div>
        <div className="leading-relaxed">{view.description}</div>
        <div className="mt-2 text-xs font-mono text-muted-foreground">
          neste instruction fetch: <span className="font-semibold text-foreground">{view.nextFetchFrom}</span>
        </div>
      </div>

      {/* legende */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span><span className="inline-block w-3 h-3 bg-amber-400 rounded-sm mr-1 align-middle"></span>blinker = nettopp lest/skrevet</span>
        <span><span className="inline-block w-3 h-3 bg-emerald-500 rounded-sm mr-1 align-middle"></span>Tråd A aktiv</span>
        <span><span className="inline-block w-3 h-3 bg-sky-500 rounded-sm mr-1 align-middle"></span>Tråd B aktiv</span>
        <span><span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1 align-middle"></span>krasj</span>
      </div>
    </div>
  );
}

// ---------------- subkomponenter ----------------

function CpuPanel({
  regs,
  highlight,
  direction,
  side,
  crashed,
  mode,
  phase,
}: {
  regs: RegSet;
  highlight: RegName[];
  direction: "save" | "load" | "none";
  side: "A" | "B" | "none";
  crashed: boolean;
  mode: Mode;
  phase: Phase;
}) {
  const arrowLabel = direction === "save" ? `CPU → ${side}` : direction === "load" ? `CPU ← ${side}` : "";
  return (
    <div className={`relative rounded-xl border-2 p-3 min-w-[240px] ${crashed ? "border-red-500 bg-red-500/5 animate-pulse" : "border-brand bg-brand/5"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider font-semibold text-brand">CPU</div>
        {arrowLabel && (
          <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${direction === "save" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"}`}>
            {arrowLabel}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {REG_ORDER.map((r) => (
          <RegisterCell key={r} name={r} value={regs[r]} highlighted={highlight.includes(r)} />
        ))}
      </div>
      {crashed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-md bg-red-600 text-white px-3 py-1.5 text-sm font-bold shadow-lg rotate-[-6deg]">
            SIGSEGV — PC ble satt for tidlig!
          </div>
        </div>
      )}
      {!crashed && (mode === "pc-first") && phase === "load-b-pc" && (
        <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 font-semibold">
          PC = B, men SP/MMU/GP = A. CPU bommer på neste fetch.
        </div>
      )}
    </div>
  );
}

function ThreadPanel({
  label,
  subtitle,
  regs,
  active,
  highlight,
  accent,
}: {
  label: string;
  subtitle: string;
  regs: RegSet;
  active: boolean;
  highlight: RegName[];
  accent: "emerald" | "sky";
}) {
  const borderClass = accent === "emerald"
    ? (active ? "border-emerald-500" : "border-emerald-500/40")
    : (active ? "border-sky-500" : "border-sky-500/40");
  const bgClass = accent === "emerald"
    ? (active ? "bg-emerald-500/10" : "bg-emerald-500/5")
    : (active ? "bg-sky-500/10" : "bg-sky-500/5");
  const titleClass = accent === "emerald" ? "text-emerald-700 dark:text-emerald-400" : "text-sky-700 dark:text-sky-400";
  return (
    <div className={`rounded-xl border-2 p-3 ${borderClass} ${bgClass}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs uppercase tracking-wider font-semibold ${titleClass}`}>{label}</div>
        {active && <div className="text-[10px] font-bold uppercase text-foreground bg-foreground/10 px-1.5 py-0.5 rounded">på CPU</div>}
      </div>
      <div className="text-[10px] text-muted-foreground mb-2 italic">{subtitle}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">volatile environment</div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {REG_ORDER.map((r) => (
          <RegisterCell key={r} name={r} value={regs[r]} highlighted={highlight.includes(r)} muted={regs[r] === "—"} />
        ))}
      </div>
    </div>
  );
}

function RegisterCell({
  name,
  value,
  highlighted,
  muted,
}: {
  name: RegName;
  value: string;
  highlighted: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors duration-200 ${
        highlighted
          ? "bg-amber-400/30 ring-1 ring-amber-500"
          : muted
            ? "bg-transparent text-muted-foreground/50"
            : "bg-background/60"
      }`}
    >
      <span className="font-semibold text-muted-foreground">{name}</span>
      <span className={muted ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
