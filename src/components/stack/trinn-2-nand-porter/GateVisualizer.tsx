import { useState } from "react";
import { RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for logiske porter og NAND-bygging.
// Fire moduser:
//   1. Single  — pick gate (NAND/AND/OR/NOR/XOR/XNOR/NOT), toggle inputs, se
//                IEEE-symbol, sannhetstabell og output-lyspære.
//   2. AND-fra-NAND   — to NAND-porter i serie.
//   3. OR-fra-NAND    — tre NAND-porter (DeMorgan).
//   4. Halvadder      — sum + carry, bygget fra kun NAND.
// Ledninger lyser grønt når de fører 1, grått når 0.
// --------------------------------------------------------------------------

type Mode = "single" | "and" | "or" | "halfadder";
type GateKind = "NAND" | "AND" | "OR" | "NOR" | "XOR" | "XNOR" | "NOT";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "single", label: "Enkelt-port", sub: "Velg port, vri brytere" },
  { id: "and", label: "AND fra NAND", sub: "2 NAND → AND" },
  { id: "or", label: "OR fra NAND", sub: "3 NAND → OR" },
  { id: "halfadder", label: "Halvadder", sub: "Sum + carry, kun NAND" },
];

const GATE_KINDS: GateKind[] = ["NAND", "AND", "OR", "NOR", "XOR", "XNOR", "NOT"];

// ----- ren logikk -----
const compute = (kind: GateKind, a: 0 | 1, b: 0 | 1): 0 | 1 => {
  switch (kind) {
    case "AND":  return (a & b) as 0 | 1;
    case "OR":   return (a | b) as 0 | 1;
    case "NAND": return ((a & b) ^ 1) as 0 | 1;
    case "NOR":  return ((a | b) ^ 1) as 0 | 1;
    case "XOR":  return (a ^ b) as 0 | 1;
    case "XNOR": return ((a ^ b) ^ 1) as 0 | 1;
    case "NOT":  return (a ^ 1) as 0 | 1;
  }
};

const truthTable = (kind: GateKind): { a: 0 | 1; b: 0 | 1; y: 0 | 1 }[] => {
  if (kind === "NOT") {
    return [
      { a: 0, b: 0, y: compute("NOT", 0, 0) },
      { a: 1, b: 0, y: compute("NOT", 1, 0) },
    ];
  }
  const rows: { a: 0 | 1; b: 0 | 1; y: 0 | 1 }[] = [];
  for (const a of [0, 1] as const) {
    for (const b of [0, 1] as const) {
      rows.push({ a, b, y: compute(kind, a, b) });
    }
  }
  return rows;
};

const GATE_DESC: Record<GateKind, string> = {
  AND:  "Y = 1 bare når begge innganger er 1.",
  OR:   "Y = 1 hvis minst én inngang er 1.",
  NAND: "Y = 0 bare når begge innganger er 1. Universell port.",
  NOR:  "Y = 1 bare når begge innganger er 0.",
  XOR:  "Y = 1 hvis nøyaktig én av inngangene er 1.",
  XNOR: "Y = 1 hvis inngangene er like.",
  NOT:  "Inverter. Y er motsatt av A. (B ignoreres.)",
};

// ============================================================
// Hovedkomponent
// ============================================================

export function GateVisualizer() {
  const [mode, setMode] = useState<Mode>("single");
  const [gate, setGate] = useState<GateKind>("NAND");
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);

  const reset = () => {
    setA(0);
    setB(0);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: NAND-porter">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Logiske porter — vri brytere, se ledningene lyse
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Nullstill brytere
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setA(0);
                setB(0);
              }}
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

      {/* Brytere */}
      <div className="px-4 py-3 border-b border-border bg-muted/10">
        <div className="flex items-center gap-4 flex-wrap">
          <ToggleSwitch label="A" value={a} onChange={setA} />
          {!(mode === "single" && gate === "NOT") && (
            <ToggleSwitch label="B" value={b} onChange={setB} />
          )}
          {mode === "single" && (
            <div className="flex items-center gap-2 ml-auto">
              <label
                htmlFor="gate-kind"
                className="text-xs text-muted-foreground"
              >
                Port
              </label>
              <select
                id="gate-kind"
                value={gate}
                onChange={(e) => setGate(e.target.value as GateKind)}
                className="px-2 py-1 rounded border border-border bg-background text-sm font-mono"
              >
                {GATE_KINDS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Hoved-visning */}
      <div className="p-6 bg-background">
        {mode === "single" && <SingleGateView gate={gate} a={a} b={b} />}
        {mode === "and" && <AndFromNandView a={a} b={b} />}
        {mode === "or" && <OrFromNandView a={a} b={b} />}
        {mode === "halfadder" && <HalfAdderView a={a} b={b} />}
      </div>
    </div>
  );
}

// ============================================================
// Bryterknapp 0/1
// ============================================================

function ToggleSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 0 | 1;
  onChange: (v: 0 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-semibold text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange((value ^ 1) as 0 | 1)}
        className={`relative w-14 h-7 rounded-full border-2 transition-colors ${
          value === 1
            ? "bg-success/20 border-success"
            : "bg-muted border-border"
        }`}
        aria-label={`Sett ${label} til ${value === 1 ? 0 : 1}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ease-out font-mono text-[10px] font-bold flex items-center justify-center ${
            value === 1
              ? "left-7 bg-success text-success-foreground"
              : "left-0.5 bg-card text-muted-foreground"
          }`}
        >
          {value}
        </span>
      </button>
    </div>
  );
}

// ============================================================
// Lyspære for utgangen
// ============================================================

function OutputBulb({ value, label = "Y" }: { value: 0 | 1; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-lg transition-all duration-200 ${
          value === 1
            ? "bg-success/30 border-success text-success shadow-[0_0_18px_rgba(34,197,94,0.6)]"
            : "bg-muted border-border text-muted-foreground"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
    </div>
  );
}

// ============================================================
// Felles ledning og porte-symboler (SVG)
// ============================================================

const wireColor = (v: 0 | 1) => (v === 1 ? "#22c55e" : "#9ca3af");
const wireStroke = (v: 0 | 1) => (v === 1 ? 3 : 2);

function Wire({
  d,
  value,
}: {
  d: string;
  value: 0 | 1;
}) {
  return (
    <path
      d={d}
      stroke={wireColor(value)}
      strokeWidth={wireStroke(value)}
      fill="none"
      strokeLinecap="round"
      style={{ transition: "stroke 200ms ease-out, stroke-width 200ms ease-out" }}
    />
  );
}

function WireDot({ x, y, value }: { x: number; y: number; value: 0 | 1 }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={3}
      fill={wireColor(value)}
      style={{ transition: "fill 200ms ease-out" }}
    />
  );
}

// IEEE-symboler, gjenbrukbar gate-tegning ved (x,y) topp-venstre i en
// 80x60-boks. Inngangene treffer (x, y+12) og (x, y+48), utgang (x+80, y+30).
// "bubble" tegnes hvis kind krever invertering på utgang.
function GateSymbol({
  kind,
  x,
  y,
  out,
  label,
}: {
  kind: "AND" | "OR" | "XOR" | "NAND" | "NOR" | "XNOR" | "NOT";
  x: number;
  y: number;
  out: 0 | 1;
  label?: string;
}) {
  const color = "currentColor";
  const fill = "var(--card, #fff)";
  const inverted = kind === "NAND" || kind === "NOR" || kind === "XNOR" || kind === "NOT";
  const baseKind: "AND" | "OR" | "XOR" =
    kind === "NAND" || kind === "AND"
      ? "AND"
      : kind === "NOR" || kind === "OR" || kind === "NOT"
      ? "OR"
      : "XOR";
  // NOT bruker en trekant + bubble (egen tegning under).
  return (
    <g transform={`translate(${x}, ${y})`}>
      {kind === "NOT" ? (
        <>
          {/* Trekant 0..60 bred, 0..60 høy. Spiss på (60, 30). */}
          <polygon
            points="2,5 2,55 56,30"
            fill={fill}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </>
      ) : baseKind === "AND" ? (
        // AND: rektangulær venstre, halvsirkel høyre. Boks 60 bred.
        <path
          d="M 2 5 L 30 5 A 25 25 0 0 1 30 55 L 2 55 Z"
          fill={fill}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ) : baseKind === "OR" ? (
        // OR: konkav venstre, spiss høyre.
        <path
          d="M 2 5 Q 18 30 2 55 Q 35 55 56 30 Q 35 5 2 5 Z"
          fill={fill}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ) : (
        // XOR: OR + ekstra bue venstre.
        <>
          <path
            d="M 8 5 Q 24 30 8 55 Q 41 55 62 30 Q 41 5 8 5 Z"
            fill={fill}
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d="M 2 5 Q 18 30 2 55"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
        </>
      )}
      {inverted && (
        <circle
          cx={kind === "NOT" ? 62 : baseKind === "XOR" ? 67 : 62}
          cy={30}
          r={4}
          fill={fill}
          stroke={color}
          strokeWidth={1.5}
        />
      )}
      {/* Pin-stubber: en kort linje fra (-6,12)→(0,12) og (-6,48)→(0,48), og utgang (60,30)→(72,30). Tegnes IKKE her — kall site tegner egne wires. */}
      {label && (
        <text
          x={28}
          y={30}
          fontSize={10}
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontWeight={600}
          fill={color}
          dominantBaseline="middle"
        >
          {label}
        </text>
      )}
      {/* Lite output-merke (lite punkt) for å vise utgangstilstand visuelt på selve porten */}
      <circle
        cx={kind === "NOT" ? 72 : baseKind === "XOR" ? 77 : 72}
        cy={30}
        r={2.5}
        fill={wireColor(out)}
        style={{ transition: "fill 200ms ease-out" }}
      />
    </g>
  );
}

// ============================================================
// Mode 1: Single gate
// ============================================================

function SingleGateView({
  gate,
  a,
  b,
}: {
  gate: GateKind;
  a: 0 | 1;
  b: 0 | 1;
}) {
  const effectiveB: 0 | 1 = gate === "NOT" ? 0 : b;
  const y = compute(gate, a, effectiveB);
  const rows = truthTable(gate);
  const currentRowIdx = rows.findIndex((r) =>
    gate === "NOT" ? r.a === a : r.a === a && r.b === effectiveB,
  );

  // SVG-layout: 360x180. Inngangene venstre, port i midten, utgang høyre.
  const gx = 150;
  const gy = 60;

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-6 items-start">
      <div>
        <svg viewBox="0 0 360 180" className="w-full max-w-md text-foreground/80">
          {/* Inngang A: wire fra (20, 72) til port-pin (gx, gy+12) */}
          <Wire d={`M 20 72 L ${gx} ${gy + 12}`} value={a} />
          <WireDot x={20} y={72} value={a} />
          <text x={10} y={76} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">
            A
          </text>
          {/* Inngang B (skjult i NOT) */}
          {gate !== "NOT" && (
            <>
              <Wire d={`M 20 108 L ${gx} ${gy + 48}`} value={effectiveB} />
              <WireDot x={20} y={108} value={effectiveB} />
              <text x={10} y={112} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">
                B
              </text>
            </>
          )}
          <GateSymbol
            kind={gate}
            x={gx}
            y={gy}
            out={y}
            label={gate.length <= 4 ? gate : undefined}
          />
          {/* Utgangs-wire */}
          <Wire d={`M ${gx + 76} 90 L 320 90`} value={y} />
          <WireDot x={320} y={90} value={y} />
          <text x={328} y={94} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">
            Y
          </text>
        </svg>
        <p className="mt-3 text-xs text-muted-foreground">{GATE_DESC[gate]}</p>
        <div className="mt-4 flex items-center gap-3">
          <OutputBulb value={y} />
          <div className="text-xs text-muted-foreground">
            <div>
              <span className="font-mono font-semibold text-foreground">
                {gate}
                {gate === "NOT" ? `(${a})` : `(${a}, ${effectiveB})`}
              </span>{" "}
              ={" "}
              <span className="font-mono font-semibold text-foreground">{y}</span>
            </div>
          </div>
        </div>
      </div>

      <TruthTable rows={rows} currentRowIdx={currentRowIdx} gate={gate} />
    </div>
  );
}

function TruthTable({
  rows,
  currentRowIdx,
  gate,
}: {
  rows: { a: 0 | 1; b: 0 | 1; y: 0 | 1 }[];
  currentRowIdx: number;
  gate: GateKind;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Sannhetstabell — {gate}
      </div>
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left py-1 px-2">A</th>
            {gate !== "NOT" && <th className="text-left py-1 px-2">B</th>}
            <th className="text-left py-1 px-2">Y</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.a}-${r.b}-${i}`}
              className={`transition-colors ${
                i === currentRowIdx
                  ? "bg-brand/10 text-brand font-bold"
                  : "text-foreground/80"
              }`}
            >
              <td className="py-1 px-2">{r.a}</td>
              {gate !== "NOT" && <td className="py-1 px-2">{r.b}</td>}
              <td
                className={`py-1 px-2 ${
                  i === currentRowIdx
                    ? ""
                    : r.y === 1
                    ? "text-success"
                    : ""
                }`}
              >
                {r.y}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Mode 2: AND fra NAND  (2 NAND)
//   N1 = NAND(A,B)
//   Y  = NAND(N1, N1) = NOT(N1) = AND(A,B)
// ============================================================

function AndFromNandView({ a, b }: { a: 0 | 1; b: 0 | 1 }) {
  const n1 = compute("NAND", a, b);
  const y = compute("NAND", n1, n1);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground italic">
        NAND er universell. Med 2 NAND-porter får vi en AND: først NAND(A,B),
        så invertere resultatet med NAND(N1,N1).
      </div>
      <svg viewBox="0 0 440 200" className="w-full max-w-2xl text-foreground/80 mx-auto block">
        {/* Inngang A */}
        <text x={6} y={56} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">A</text>
        <Wire d="M 16 52 L 110 52" value={a} />
        <WireDot x={16} y={52} value={a} />
        {/* Inngang B */}
        <text x={6} y={132} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">B</text>
        <Wire d="M 16 128 L 110 128" value={b} />
        <WireDot x={16} y={128} value={b} />
        {/* Wire inn til N1 */}
        <Wire d="M 110 52 L 110 72 L 130 72" value={a} />
        <Wire d="M 110 128 L 110 108 L 130 108" value={b} />
        {/* N1 = NAND-port på (130, 60) */}
        <GateSymbol kind="NAND" x={130} y={60} out={n1} label="N1" />
        {/* N1-utgang ut, så grein opp og ned for å gå inn på N2 sine to pins */}
        <Wire d="M 206 90 L 240 90" value={n1} />
        <WireDot x={240} y={90} value={n1} />
        {/* Splitt opp og ned */}
        <Wire d="M 240 90 L 240 72 L 260 72" value={n1} />
        <Wire d="M 240 90 L 240 108 L 260 108" value={n1} />
        {/* N2 = NAND-port på (260, 60) brukt som NOT */}
        <GateSymbol kind="NAND" x={260} y={60} out={y} label="N2" />
        {/* Utgang Y */}
        <Wire d="M 336 90 L 400 90" value={y} />
        <WireDot x={400} y={90} value={y} />
        <text x={406} y={94} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">Y</text>
      </svg>
      <div className="flex items-center gap-6 flex-wrap">
        <OutputBulb value={y} label="Y = AND(A,B)" />
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          <div>
            N1 = NAND({a}, {b}) ={" "}
            <span className="font-bold text-foreground">{n1}</span>
          </div>
          <div>
            Y  = NAND({n1}, {n1}) ={" "}
            <span className="font-bold text-foreground">{y}</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-brand pt-1">
            NAND er universell
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Mode 3: OR fra NAND (3 NAND, DeMorgan)
//   nA = NAND(A,A) = NOT A
//   nB = NAND(B,B) = NOT B
//   Y  = NAND(nA, nB) = NOT(NOT A AND NOT B) = A OR B
// ============================================================

function OrFromNandView({ a, b }: { a: 0 | 1; b: 0 | 1 }) {
  const nA = compute("NAND", a, a);
  const nB = compute("NAND", b, b);
  const y = compute("NAND", nA, nB);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground italic">
        DeMorgan: A OR B = NOT(NOT A AND NOT B). Tre NAND-porter — to som
        invertere, én som kombinerer.
      </div>
      <svg viewBox="0 0 460 240" className="w-full max-w-2xl text-foreground/80 mx-auto block">
        {/* A inngang */}
        <text x={6} y={44} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">A</text>
        <Wire d="M 16 40 L 70 40" value={a} />
        <WireDot x={16} y={40} value={a} />
        <Wire d="M 70 40 L 70 52 L 90 52" value={a} />
        <Wire d="M 70 40 L 70 88 L 90 88" value={a} />
        {/* N1 = NAND(A,A) på (90, 40) */}
        <GateSymbol kind="NAND" x={90} y={40} out={nA} label="¬A" />
        {/* nA-wire fra (166,70) til N3 inngang øvre */}
        <Wire d="M 166 70 L 220 70 L 220 122 L 270 122" value={nA} />
        <WireDot x={220} y={70} value={nA} />

        {/* B inngang */}
        <text x={6} y={204} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">B</text>
        <Wire d="M 16 200 L 70 200" value={b} />
        <WireDot x={16} y={200} value={b} />
        <Wire d="M 70 200 L 70 152 L 90 152" value={b} />
        <Wire d="M 70 200 L 70 188 L 90 188" value={b} />
        {/* N2 = NAND(B,B) på (90, 140) */}
        <GateSymbol kind="NAND" x={90} y={140} out={nB} label="¬B" />
        {/* nB-wire fra (166,170) til N3 inngang nedre */}
        <Wire d="M 166 170 L 220 170 L 220 158 L 270 158" value={nB} />
        <WireDot x={220} y={170} value={nB} />

        {/* N3 = NAND(nA, nB) på (270, 110) */}
        <GateSymbol kind="NAND" x={270} y={110} out={y} label="N3" />
        {/* Utgang */}
        <Wire d="M 346 140 L 420 140" value={y} />
        <WireDot x={420} y={140} value={y} />
        <text x={426} y={144} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">Y</text>
      </svg>
      <div className="flex items-center gap-6 flex-wrap">
        <OutputBulb value={y} label="Y = OR(A,B)" />
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          <div>
            ¬A = NAND({a}, {a}) = <span className="font-bold text-foreground">{nA}</span>
          </div>
          <div>
            ¬B = NAND({b}, {b}) = <span className="font-bold text-foreground">{nB}</span>
          </div>
          <div>
            Y  = NAND({nA}, {nB}) ={" "}
            <span className="font-bold text-foreground">{y}</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-brand pt-1">
            DeMorgan i praksis
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Mode 4: Halvadder fra NAND
//   Sum   = A XOR B   (5 NAND-er)
//   Carry = A AND B   (2 NAND-er)
//
// XOR fra 4 NAND er standard-konstruksjonen:
//   m1 = NAND(A, B)
//   m2 = NAND(A, m1)
//   m3 = NAND(B, m1)
//   S  = NAND(m2, m3)
// Carry: vi gjenbruker m1 = NAND(A,B), så
//   C  = NAND(m1, m1) = AND(A,B)
// Totalt 5 NAND.
// ============================================================

function HalfAdderView({ a, b }: { a: 0 | 1; b: 0 | 1 }) {
  const m1 = compute("NAND", a, b);
  const m2 = compute("NAND", a, m1);
  const m3 = compute("NAND", b, m1);
  const sum = compute("NAND", m2, m3);
  const carry = compute("NAND", m1, m1);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground italic">
        Halvadder: en bits-adder uten innførsel. Sum = A XOR B (XOR består av
        4 NAND), Carry = A AND B (gjenbruker NAND(A,B), pluss én ekstra
        invertering). Totalt 5 NAND-porter.
      </div>
      <svg viewBox="0 0 560 320" className="w-full max-w-3xl text-foreground/80 mx-auto block">
        {/* A og B inngang */}
        <text x={6} y={44} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">A</text>
        <Wire d="M 16 40 L 60 40" value={a} />
        <WireDot x={16} y={40} value={a} />
        <text x={6} y={234} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">B</text>
        <Wire d="M 16 230 L 60 230" value={b} />
        <WireDot x={16} y={230} value={b} />

        {/* Bus-linjer for A og B (vertikale stubber for forgreining) */}
        {/* A går til: m1.in1, m2.in1.  m1 er på (180, 110), m2 på (310, 30) */}
        <Wire d="M 60 40 L 60 122 L 180 122" value={a} />
        <WireDot x={60} y={40} value={a} />
        <Wire d="M 60 40 L 60 42 L 290 42" value={a} />
        {/* B går til: m1.in2, m3.in1.  m3 er på (310, 190) */}
        <Wire d="M 60 230 L 60 158 L 180 158" value={b} />
        <Wire d="M 60 230 L 60 202 L 290 202" value={b} />

        {/* m1 = NAND(A,B), pos (180, 110) */}
        <GateSymbol kind="NAND" x={180} y={110} out={m1} label="m1" />
        {/* m1-utgang grein til m2.in2 (310, 78), m3.in2 (310, 238) og til carry-NAND-en */}
        <Wire d="M 256 140 L 280 140" value={m1} />
        <WireDot x={280} y={140} value={m1} />
        <Wire d="M 280 140 L 280 78 L 290 78" value={m1} />
        <Wire d="M 280 140 L 280 238 L 290 238" value={m1} />

        {/* m2 = NAND(A, m1), pos (290, 30) */}
        <GateSymbol kind="NAND" x={290} y={30} out={m2} label="m2" />
        {/* m3 = NAND(B, m1), pos (290, 190) */}
        <GateSymbol kind="NAND" x={290} y={190} out={m3} label="m3" />

        {/* m2-utgang (366, 60) og m3-utgang (366, 220) inn på sum-NAND */}
        <Wire d="M 366 60 L 420 60 L 420 102 L 440 102" value={m2} />
        <WireDot x={366} y={60} value={m2} />
        <Wire d="M 366 220 L 420 220 L 420 138 L 440 138" value={m3} />
        <WireDot x={366} y={220} value={m3} />

        {/* Sum-NAND på (440, 90) */}
        <GateSymbol kind="NAND" x={440} y={90} out={sum} label="S" />
        {/* Sum-utgang */}
        <Wire d="M 516 120 L 540 120" value={sum} />
        <WireDot x={540} y={120} value={sum} />
        <text x={524} y={108} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">SUM</text>

        {/* Carry-gren: ny NAND som inverterer m1 -> AND(A,B). Plasser på (440, 230) */}
        {/* m1 har allerede gren til (280,140). Vi forlenger derfra til carry-NAND */}
        <Wire d="M 280 140 L 280 262 L 420 262 L 420 242 L 440 242" value={m1} />
        <Wire d="M 280 140 L 280 282 L 420 282 L 420 278 L 440 278" value={m1} />
        <GateSymbol kind="NAND" x={440} y={230} out={carry} label="C" />
        {/* Carry-utgang */}
        <Wire d="M 516 260 L 540 260" value={carry} />
        <WireDot x={540} y={260} value={carry} />
        <text x={520} y={248} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">CARRY</text>
      </svg>
      <div className="flex items-center gap-6 flex-wrap">
        <OutputBulb value={sum} label="SUM (A XOR B)" />
        <OutputBulb value={carry} label="CARRY (A AND B)" />
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          <div>
            m1 = NAND({a}, {b}) ={" "}
            <span className="font-bold text-foreground">{m1}</span>
          </div>
          <div>
            m2 = NAND({a}, {m1}) ={" "}
            <span className="font-bold text-foreground">{m2}</span>
          </div>
          <div>
            m3 = NAND({b}, {m1}) ={" "}
            <span className="font-bold text-foreground">{m3}</span>
          </div>
          <div>
            S  = NAND({m2}, {m3}) ={" "}
            <span className="font-bold text-foreground">{sum}</span>
          </div>
          <div>
            C  = NAND({m1}, {m1}) ={" "}
            <span className="font-bold text-foreground">{carry}</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-brand pt-1">
            5 NAND-porter = 1 halvadder
          </div>
        </div>
      </div>
      {/* Liten sannhetstabell for halvadderen */}
      <div className="rounded-lg border border-border bg-card p-3 inline-block">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Halvadder-sannhetstabell
        </div>
        <table className="text-xs font-mono">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-1 px-2">A</th>
              <th className="text-left py-1 px-2">B</th>
              <th className="text-left py-1 px-2">SUM</th>
              <th className="text-left py-1 px-2">CARRY</th>
            </tr>
          </thead>
          <tbody>
            {[
              [0, 0],
              [0, 1],
              [1, 0],
              [1, 1],
            ].map(([ra, rb]) => {
              const ra1 = ra as 0 | 1;
              const rb1 = rb as 0 | 1;
              const s = compute("XOR", ra1, rb1);
              const c = compute("AND", ra1, rb1);
              const cur = ra1 === a && rb1 === b;
              return (
                <tr
                  key={`${ra}-${rb}`}
                  className={
                    cur ? "bg-brand/10 text-brand font-bold" : "text-foreground/80"
                  }
                >
                  <td className="py-1 px-2">{ra}</td>
                  <td className="py-1 px-2">{rb}</td>
                  <td className="py-1 px-2">{s}</td>
                  <td className="py-1 px-2">{c}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
