import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Play, StepForward } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for adders.
// Fire moduser:
//  - half:   1-bit half-adder (A, B → S, C) med XOR + AND
//  - full:   1-bit full-adder (A, B, Cin → S, Cout) som to halv-addere + OR
//  - ripple: 4-bit ripple-carry adder, stegvis carry-propagering
//  - sub:    A - B via two's complement (B inverteres, Cin = 1)
// --------------------------------------------------------------------------

type Mode = "half" | "full" | "ripple" | "sub";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "half", label: "Half-adder", sub: "A, B → S, C" },
  { id: "full", label: "Full-adder", sub: "A, B, Cin → S, Cout" },
  { id: "ripple", label: "4-bit ripple-carry", sub: "4 full-addere i serie" },
  { id: "sub", label: "Subtraksjon (2's complement)", sub: "A - B = A + ~B + 1" },
];

const MODE_NOTE: Record<Mode, string> = {
  half: "Bare to porter: XOR gir sum-bit, AND gir carry-bit. Bruk på minst signifikante bit.",
  full: "To halv-addere + OR. Carry-in (Cin) lar oss kjede flere full-addere etter hverandre.",
  ripple:
    "Hver full-adder må vente på carry fra forrige. Bruk «Steg»-knappen for å se carry-en ringle.",
  sub: "ALU-en subtraherer ved å invertere B og sette Cin=1. Hvis sluttverdien starter med 1, er resultatet negativt i two's complement.",
};

// Felles farger som passer dark/light via Tailwind tokens.
const COLOR_ON = "#22c55e"; // grønn = 1
const COLOR_OFF = "#64748b"; // grå = 0
const COLOR_HI = "#f59e0b"; // current stage highlight

export function AdderVisualizer() {
  const [mode, setMode] = useState<Mode>("half");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Adder-krets">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Adders — bygg binær addisjon fra logiske porter
            </div>
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

      <div className="bg-background">
        {mode === "half" && <HalfAdderView />}
        {mode === "full" && <FullAdderView />}
        {mode === "ripple" && <RippleAdderView mode="add" />}
        {mode === "sub" && <RippleAdderView mode="sub" />}
      </div>

      <div className="px-4 py-2.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
        {MODE_NOTE[mode]}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Bit-toggle: liten knapp som viser 0/1 og lyser grønt ved 1.
// --------------------------------------------------------------------------

function BitToggle({
  value,
  onToggle,
  label,
  size = "md",
}: {
  value: 0 | 1;
  onToggle: () => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7 text-sm" : "h-9 w-9 text-base";
  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={onToggle}
        className={`${dim} rounded-md border-2 font-mono font-bold transition-colors ${
          value === 1
            ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
        }`}
      >
        {value}
      </button>
    </div>
  );
}

function BitOutput({ value, label }: { value: 0 | 1; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div
        className={`h-9 w-9 rounded-md border-2 grid place-items-center font-mono font-bold transition-colors ${
          value === 1
            ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
            : "border-border bg-background text-muted-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Half-adder
// --------------------------------------------------------------------------

function HalfAdderView() {
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);

  const sum = ((a ^ b) as 0 | 1);
  const carry = ((a & b) as 0 | 1);

  const rows: { a: 0 | 1; b: 0 | 1; s: 0 | 1; c: 0 | 1 }[] = [
    { a: 0, b: 0, s: 0, c: 0 },
    { a: 0, b: 1, s: 1, c: 0 },
    { a: 1, b: 0, s: 1, c: 0 },
    { a: 1, b: 1, s: 0, c: 1 },
  ];

  return (
    <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6 items-start">
      <div>
        <div className="flex items-center gap-6 mb-4">
          <BitToggle value={a} onToggle={() => setA(a === 0 ? 1 : 0)} label="A" />
          <BitToggle value={b} onToggle={() => setB(b === 0 ? 1 : 0)} label="B" />
          <div className="text-xs text-muted-foreground">Klikk for å bytte 0/1</div>
        </div>

        <svg viewBox="0 0 420 220" className="w-full max-w-[460px] h-auto">
          {/* Inputs */}
          <Pin x={20} y={60} label="A" value={a} />
          <Pin x={20} y={160} label="B" value={b} />

          {/* Wires from A and B to XOR */}
          <Wire d="M40 60 L120 60 L120 80 L170 80" on={a === 1} />
          <Wire d="M40 160 L120 160 L120 120 L170 120" on={b === 1} />

          {/* Wires from A and B to AND */}
          <Wire d="M40 60 L80 60 L80 170 L170 170" on={a === 1} />
          <Wire d="M40 160 L60 160 L60 190 L170 190" on={b === 1} />

          {/* XOR gate */}
          <Gate x={170} y={70} label="XOR" type="xor" out={sum} />
          {/* AND gate */}
          <Gate x={170} y={160} label="AND" type="and" out={carry} />

          {/* Output wires */}
          <Wire d="M240 100 L360 100" on={sum === 1} />
          <Wire d="M240 190 L360 190" on={carry === 1} />

          <OutPin x={365} y={100} label="S (sum)" value={sum} />
          <OutPin x={365} y={190} label="C (carry)" value={carry} />
        </svg>

        <div className="mt-4 flex items-center gap-3">
          <BitOutput value={sum} label="S" />
          <BitOutput value={carry} label="C" />
          <div className="ml-2 text-xs font-mono text-muted-foreground">
            {a} + {b} = {carry}{sum}<sub>2</sub> = {a + b}
          </div>
        </div>
      </div>

      <TruthTable
        cols={["A", "B", "S", "C"]}
        rows={rows.map((r) => [r.a, r.b, r.s, r.c])}
        currentIdx={rows.findIndex((r) => r.a === a && r.b === b)}
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// Full-adder
// --------------------------------------------------------------------------

function FullAdderView() {
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);
  const [cin, setCin] = useState<0 | 1>(0);

  const xor1 = ((a ^ b) as 0 | 1);
  const and1 = ((a & b) as 0 | 1);
  const sum = ((xor1 ^ cin) as 0 | 1);
  const and2 = ((xor1 & cin) as 0 | 1);
  const cout = ((and1 | and2) as 0 | 1);

  const rows: { a: 0 | 1; b: 0 | 1; ci: 0 | 1; s: 0 | 1; co: 0 | 1 }[] = [];
  for (let i = 0; i < 8; i++) {
    const av = ((i >> 2) & 1) as 0 | 1;
    const bv = ((i >> 1) & 1) as 0 | 1;
    const cv = (i & 1) as 0 | 1;
    const s = ((av ^ bv ^ cv) as 0 | 1);
    const co = (((av & bv) | (cv & (av ^ bv))) as 0 | 1);
    rows.push({ a: av, b: bv, ci: cv, s, co });
  }

  return (
    <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6 items-start">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <BitToggle value={a} onToggle={() => setA(a === 0 ? 1 : 0)} label="A" />
          <BitToggle value={b} onToggle={() => setB(b === 0 ? 1 : 0)} label="B" />
          <BitToggle value={cin} onToggle={() => setCin(cin === 0 ? 1 : 0)} label="Cin" />
          <div className="text-xs text-muted-foreground">A + B + Cin</div>
        </div>

        <svg viewBox="0 0 500 260" className="w-full max-w-[540px] h-auto">
          <Pin x={20} y={40} label="A" value={a} />
          <Pin x={20} y={100} label="B" value={b} />
          <Pin x={20} y={210} label="Cin" value={cin} />

          {/* A,B → XOR1 */}
          <Wire d="M40 40 L100 40 L100 55 L140 55" on={a === 1} />
          <Wire d="M40 100 L100 100 L100 90 L140 90" on={b === 1} />

          {/* A,B → AND1 */}
          <Wire d="M40 40 L70 40 L70 165 L140 165" on={a === 1} />
          <Wire d="M40 100 L60 100 L60 200 L140 200" on={b === 1} />

          {/* XOR1 */}
          <Gate x={140} y={45} label="XOR" type="xor" out={xor1} />
          {/* AND1 */}
          <Gate x={140} y={170} label="AND" type="and" out={and1} />

          {/* XOR1 out → XOR2 and AND2 */}
          <Wire d="M210 75 L260 75 L260 95 L300 95" on={xor1 === 1} />
          <Wire d="M260 95 L260 135 L300 135" on={xor1 === 1} />

          {/* Cin → XOR2 and AND2 */}
          <Wire d="M40 210 L280 210 L280 145 L300 145" on={cin === 1} />
          <Wire d="M280 210 L280 115 L300 115" on={cin === 1} />

          {/* XOR2 */}
          <Gate x={300} y={85} label="XOR" type="xor" out={sum} />
          {/* AND2 */}
          <Gate x={300} y={125} label="AND" type="and" out={and2} />

          {/* OR: receives and1 and and2 */}
          <Wire d="M210 200 L380 200 L380 195 L400 195" on={and1 === 1} />
          <Wire d="M370 155 L370 175 L400 175" on={and2 === 1} />
          <Wire d="M370 155 L370 155" on={and2 === 1} />
          {/* and2 wire from gate out */}
          <Wire d="M370 155 L400 175" on={and2 === 1} />

          <Gate x={400} y={175} label="OR" type="or" out={cout} />

          {/* Outputs */}
          <Wire d="M370 115 L460 115" on={sum === 1} />
          <Wire d="M470 205 L490 205" on={cout === 1} />

          <OutPin x={465} y={115} label="S" value={sum} />
          <OutPin x={490} y={205} label="Cout" value={cout} />
        </svg>

        <div className="mt-4 flex items-center gap-3">
          <BitOutput value={sum} label="S" />
          <BitOutput value={cout} label="Cout" />
          <div className="ml-2 text-xs font-mono text-muted-foreground">
            {a} + {b} + {cin} = {cout}{sum}<sub>2</sub> = {a + b + cin}
          </div>
        </div>
      </div>

      <TruthTable
        cols={["A", "B", "Cin", "S", "Cout"]}
        rows={rows.map((r) => [r.a, r.b, r.ci, r.s, r.co])}
        currentIdx={rows.findIndex((r) => r.a === a && r.b === b && r.ci === cin)}
      />
    </div>
  );
}

// --------------------------------------------------------------------------
// 4-bit ripple carry, m. add/sub-modus
// --------------------------------------------------------------------------

const N_BITS = 4;

function RippleAdderView({ mode }: { mode: "add" | "sub" }) {
  const [a, setA] = useState<(0 | 1)[]>([0, 1, 0, 1]); // a3..a0 i array-pos 0..3 (MSB først)
  const [b, setB] = useState<(0 | 1)[]>([0, 0, 1, 1]);

  // Vi simulerer ripple stegvis: bærer cin gjennom én FA om gangen.
  // stage = -1 betyr "ikke begynt". stage = N_BITS betyr ferdig.
  const [stage, setStage] = useState<number>(-1);
  const [autoFlash, setAutoFlash] = useState<number | null>(null);

  // Effektiv B for kretsen (invertert i sub-modus).
  const bEff: (0 | 1)[] = useMemo(
    () => (mode === "sub" ? (b.map((x) => (x === 0 ? 1 : 0)) as (0 | 1)[]) : b),
    [b, mode]
  );
  const cin0: 0 | 1 = mode === "sub" ? 1 : 0;

  // Beregn alle stadier ferdig (sum og carry), men i UI viser vi bare opp til "stage".
  const stages = useMemo(() => {
    const out: { aBit: 0 | 1; bBit: 0 | 1; cin: 0 | 1; sum: 0 | 1; cout: 0 | 1 }[] = [];
    let c: 0 | 1 = cin0;
    // i = 0 betyr LSB. I arrayet er LSB siste element (index N_BITS-1).
    for (let i = 0; i < N_BITS; i++) {
      const idx = N_BITS - 1 - i;
      const aBit = a[idx];
      const bBit = bEff[idx];
      const s = ((aBit ^ bBit ^ c) as 0 | 1);
      const co = (((aBit & bBit) | (c & (aBit ^ bBit))) as 0 | 1);
      out.push({ aBit, bBit, cin: c, sum: s, cout: co });
      c = co;
    }
    return out;
  }, [a, bEff, cin0]);

  // Reset stage hvis A/B/B-effektiv endrer seg.
  useEffect(() => {
    setStage(-1);
  }, [a, b, mode]);

  const advance = () => {
    setStage((prev) => {
      const next = Math.min(prev + 1, N_BITS);
      if (next >= 0 && next < N_BITS) {
        setAutoFlash(next);
        setTimeout(() => setAutoFlash(null), 320);
      }
      return next;
    });
  };

  const runAll = () => {
    setStage(-1);
    let i = -1;
    const tick = () => {
      i += 1;
      setStage(i);
      if (i >= 0 && i < N_BITS) {
        setAutoFlash(i);
        setTimeout(() => setAutoFlash(null), 280);
      }
      if (i < N_BITS) {
        setTimeout(tick, 360);
      }
    };
    setTimeout(tick, 60);
  };

  const reset = () => setStage(-1);

  // Sum-bits og final carry, men kun for stadier <= stage.
  const visibleSum: (0 | 1 | null)[] = [];
  for (let i = 0; i < N_BITS; i++) {
    visibleSum.push(i <= stage ? stages[i].sum : null);
  }
  const finalCarry: 0 | 1 | null = stage >= N_BITS - 1 ? stages[N_BITS - 1].cout : null;

  // Decimal-verdier vises kun når ferdig.
  const done = stage >= N_BITS - 1;
  const aDec = bitsToUnsigned(a);
  const bDec = bitsToUnsigned(b);
  const rawSum = visibleSum.map((x) => x ?? 0) as (0 | 1)[];
  const sumDec = bitsToUnsigned(rawSum);
  const overflow = mode === "add" && finalCarry === 1;

  let resultLine = "";
  if (done) {
    if (mode === "add") {
      resultLine = `${aDec} + ${bDec} = ${(finalCarry ?? 0) * 16 + sumDec}${
        overflow ? "  (overflow: bit 4 = 1)" : ""
      }`;
    } else {
      // For subtraksjon: 5-bit resultat med carry som "sign". Hvis cout=1 → ikke-negativt.
      const signed = signedFromTwosComplement(rawSum);
      resultLine = `${aDec} - ${bDec} = ${signed}${
        signed < 0 ? "  (negativ, vist i two's complement)" : ""
      }`;
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-end gap-6 mb-4">
        <BitRow
          label="A"
          bits={a}
          onToggle={(idx) => setA(a.map((x, i) => (i === idx ? ((x === 0 ? 1 : 0) as 0 | 1) : x)))}
        />
        <BitRow
          label={mode === "sub" ? "B  (inverteres → ~B)" : "B"}
          bits={b}
          onToggle={(idx) => setB(b.map((x, i) => (i === idx ? ((x === 0 ? 1 : 0) as 0 | 1) : x)))}
        />
        {mode === "sub" && (
          <BitRow
            label="~B (effektiv inn til adder)"
            bits={bEff}
            readOnly
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={advance}
            disabled={stage >= N_BITS}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent inline-flex items-center gap-1.5"
          >
            <StepForward className="h-3.5 w-3.5" />
            Steg
          </button>
          <button
            type="button"
            onClick={runAll}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted inline-flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* SVG med 4 FA-blokker. LSB til høyre. */}
      <svg viewBox="0 0 720 260" className="w-full h-auto">
        {/* Cin0 inn fra høyre */}
        <text x={690} y={155} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
          Cin = {cin0}
        </text>
        {/* Carry-out helt til venstre */}
        <text x={20} y={155} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
          Cout
        </text>

        {[0, 1, 2, 3].map((i) => {
          // i=0 er LSB. Plass i SVG: LSB = høyre side.
          const x = 600 - i * 150;
          const st = stages[i];
          const reached = i <= stage;
          const isCurrent = i === stage || autoFlash === i;
          const aBit = st.aBit;
          const bBit = st.bBit;
          const sumBit = reached ? st.sum : null;
          const cinHere: 0 | 1 = i === 0 ? cin0 : stages[i - 1].cout;
          const coutHere = reached ? st.cout : null;

          // Carry wire: inn fra høyre (cin), ut til venstre (cout).
          // Vis carry-bit lit-up bare når reached.
          return (
            <g key={i}>
              {/* A og B inn fra toppen */}
              <text x={x} y={30} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                A{i}={aBit}
              </text>
              <text x={x + 30} y={30} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                B{i}={bBit}
              </text>

              <Wire d={`M${x} 35 L${x} 70`} on={aBit === 1} />
              <Wire d={`M${x + 30} 35 L${x + 30} 70`} on={bBit === 1} />

              {/* FA-blokk */}
              <rect
                x={x - 25}
                y={70}
                width={80}
                height={80}
                rx={6}
                fill={isCurrent ? "rgba(245, 158, 11, 0.12)" : "transparent"}
                stroke={isCurrent ? COLOR_HI : "currentColor"}
                strokeOpacity={isCurrent ? 1 : 0.4}
                strokeWidth={isCurrent ? 2 : 1.5}
                style={{ transition: "all 0.2s" }}
              />
              <text x={x + 15} y={92} textAnchor="middle" className="fill-foreground font-mono text-[11px] font-semibold">
                FA{i}
              </text>
              <text x={x + 15} y={108} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                Cin={reached || isCurrent ? cinHere : "?"}
              </text>
              <text x={x + 15} y={122} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                Cout={coutHere ?? "?"}
              </text>
              <text x={x + 15} y={138} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                S={sumBit ?? "?"}
              </text>

              {/* Sum-bit ut nedover */}
              <Wire d={`M${x + 15} 150 L${x + 15} 195`} on={sumBit === 1} />
              <g>
                <rect
                  x={x - 3}
                  y={195}
                  width={36}
                  height={32}
                  rx={5}
                  fill={sumBit === 1 ? "rgba(34,197,94,0.15)" : "transparent"}
                  stroke={sumBit === 1 ? COLOR_ON : COLOR_OFF}
                  strokeWidth={2}
                />
                <text
                  x={x + 15}
                  y={216}
                  textAnchor="middle"
                  className="font-mono text-[14px] font-bold"
                  fill={sumBit === 1 ? COLOR_ON : sumBit === 0 ? COLOR_OFF : "#94a3b8"}
                >
                  {sumBit ?? "?"}
                </text>
                <text x={x + 15} y={245} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                  S{i}
                </text>
              </g>

              {/* Carry-wire mellom FA-er: ut fra venstre side, inn på neste FAs høyre */}
              {i < N_BITS - 1 ? (
                <Wire
                  d={`M${x - 25} 110 L${x - 100} 110`}
                  on={coutHere === 1}
                />
              ) : (
                <Wire d={`M${x - 25} 110 L${x - 80} 110`} on={coutHere === 1} />
              )}
              {/* Cin-wire inn fra høyre side */}
              {i === 0 && (
                <Wire d={`M${x + 55} 110 L${x + 90} 110`} on={cin0 === 1} />
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Resultat-bits
          </span>
          <div className="flex gap-1.5">
            {finalCarry !== null && (
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-muted-foreground">C</span>
                <div
                  className={`h-7 w-7 rounded-md border-2 grid place-items-center font-mono text-sm font-bold ${
                    finalCarry === 1
                      ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {finalCarry}
                </div>
              </div>
            )}
            {[3, 2, 1, 0].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-muted-foreground">S{i}</span>
                <div
                  className={`h-7 w-7 rounded-md border-2 grid place-items-center font-mono text-sm font-bold transition-colors ${
                    visibleSum[i] === 1
                      ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
                      : visibleSum[i] === 0
                        ? "border-border text-muted-foreground"
                        : "border-dashed border-border text-muted-foreground/40"
                  }`}
                >
                  {visibleSum[i] ?? "?"}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          Stadier ferdige: {stage < 0 ? 0 : Math.min(stage + 1, N_BITS)} / {N_BITS}
        </div>
      </div>

      <div className="mt-3 text-sm font-mono">
        {done ? (
          <span className={overflow ? "text-amber-600 dark:text-amber-400" : ""}>
            {resultLine}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Trykk «Steg» eller «Kjør» for å la carry-en ringle gjennom alle {N_BITS} full-addere.
          </span>
        )}
      </div>
    </div>
  );
}

function BitRow({
  label,
  bits,
  onToggle,
  readOnly,
}: {
  label: string;
  bits: (0 | 1)[];
  onToggle?: (idx: number) => void;
  readOnly?: boolean;
}) {
  const dec = bitsToUnsigned(bits);
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
        {label} <span className="text-muted-foreground/70">= {dec}</span>
      </div>
      <div className="flex gap-1.5">
        {bits.map((bit, i) => {
          const bitIdx = bits.length - 1 - i; // label MSB→LSB
          if (readOnly) {
            return (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-muted-foreground/70">
                  {bitIdx}
                </span>
                <div
                  className={`h-8 w-8 rounded-md border-2 grid place-items-center font-mono text-sm font-bold ${
                    bit === 1
                      ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
                      : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {bit}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[9px] font-mono text-muted-foreground/70">{bitIdx}</span>
              <BitToggle
                value={bit}
                onToggle={() => onToggle?.(i)}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// SVG helpers: Pin (input), OutPin (output), Wire, Gate
// --------------------------------------------------------------------------

function Pin({ x, y, label, value }: { x: number; y: number; label: string; value: 0 | 1 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={value === 1 ? COLOR_ON : "transparent"} stroke={value === 1 ? COLOR_ON : COLOR_OFF} strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" className="font-mono text-[11px]" fill={value === 1 ? "#fff" : "currentColor"}>
        {value}
      </text>
      <text x={x - 18} y={y + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
        {label}
      </text>
    </g>
  );
}

function OutPin({ x, y, label, value }: { x: number; y: number; label: string; value: 0 | 1 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={value === 1 ? COLOR_ON : "transparent"} stroke={value === 1 ? COLOR_ON : COLOR_OFF} strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" className="font-mono text-[11px]" fill={value === 1 ? "#fff" : "currentColor"}>
        {value}
      </text>
      <text x={x + 18} y={y + 4} textAnchor="start" className="fill-muted-foreground font-mono text-[10px]">
        {label}
      </text>
    </g>
  );
}

function Wire({ d, on }: { d: string; on: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={on ? COLOR_ON : COLOR_OFF}
      strokeOpacity={on ? 1 : 0.55}
      strokeWidth={on ? 2.5 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s" }}
    />
  );
}

function Gate({
  x,
  y,
  label,
  type,
  out,
}: {
  x: number;
  y: number;
  label: string;
  type: "and" | "or" | "xor";
  out: 0 | 1;
}) {
  // Vi tegner forenklede port-symboler i en boks 70x60 ved (x, y) (topp-venstre)
  const w = 70;
  const h = 60;
  const stroke = out === 1 ? COLOR_ON : "currentColor";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={out === 1 ? "rgba(34,197,94,0.08)" : "transparent"}
        stroke={stroke}
        strokeOpacity={out === 1 ? 1 : 0.55}
        strokeWidth={2}
        style={{ transition: "all 0.2s" }}
      />
      <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" className="font-mono text-[12px] font-semibold" fill={out === 1 ? COLOR_ON : "currentColor"}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
        ={out}
      </text>
      {/* Lite symbol: vi viser bare etikett pluss en liten gate-glyph i hjørnet */}
      <text x={x + 6} y={y + 14} className="fill-muted-foreground font-mono text-[9px]">
        {type === "and" ? "∧" : type === "or" ? "∨" : "⊕"}
      </text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Truth table
// --------------------------------------------------------------------------

function TruthTable({
  cols,
  rows,
  currentIdx,
}: {
  cols: string[];
  rows: number[][];
  currentIdx: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 self-start">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
        Sannhetstabell
      </div>
      <table className="font-mono text-xs">
        <thead>
          <tr className="text-muted-foreground">
            {cols.map((c) => (
              <th key={c} className="px-2 py-1 text-center font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={
                i === currentIdx
                  ? "bg-brand/15 text-foreground font-semibold"
                  : "text-muted-foreground"
              }
            >
              {row.map((v, j) => (
                <td key={j} className="px-2 py-0.5 text-center">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------------------------------
// Hjelpefunksjoner
// --------------------------------------------------------------------------

function bitsToUnsigned(bits: (0 | 1)[]): number {
  let v = 0;
  for (const b of bits) v = (v << 1) | b;
  return v;
}

function signedFromTwosComplement(bits: (0 | 1)[]): number {
  if (bits.length === 0) return 0;
  const u = bitsToUnsigned(bits);
  const sign = bits[0];
  if (sign === 1) {
    return u - (1 << bits.length);
  }
  return u;
}
