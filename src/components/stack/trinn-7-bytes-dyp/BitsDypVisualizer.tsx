import { useMemo, useState } from "react";
import { RotateCcw, ArrowRight, ArrowLeftRight } from "lucide-react";

// --------------------------------------------------------------------------
// Bit manipulation deep-dive. Fem moduser:
//   1. bitwise   — AND/OR/XOR/NOT på to 8-bit operander
//   2. shift     — <<, >>, >>> på 16-bit verdi med skyveanimasjon
//   3. tokomp    — two's complement: invert + 1 for å negere
//   4. flags     — 32-bit bitmask-register med navngitte flagg
//   5. triks     — popcount via n & (n-1), lowest-bit via n & -n
// --------------------------------------------------------------------------

type Mode = "bitwise" | "shift" | "tokomp" | "flags" | "triks";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "bitwise", label: "AND / OR / XOR / NOT", sub: "to operander, én operator" },
  { id: "shift", label: "Skifte (<< >> >>>)", sub: "flytt bits, mult/div med 2^n" },
  { id: "tokomp", label: "Two's complement", sub: "negative tall: invert + 1" },
  { id: "flags", label: "Bitmasker / flagg", sub: "32-bit register, sett/clear/toggle" },
  { id: "triks", label: "Popcount & low-bit", sub: "n & (n-1), n & -n" },
];

const MODE_NOTE: Record<Mode, string> = {
  bitwise:
    "& = «både og». | = «en av delene». ^ = «forskjell» (eksklusiv eller). ~ = «flip alle».",
  shift:
    "x << n er x · 2^n (kaster MSB-bits ut). x >> n er signert (fyller med fortegnsbit). x >>> n er usignert.",
  tokomp:
    "Negere et tall: inverter alle bits, så +1. Det er hvorfor int8 har én negativ mer enn positiv (-128 men ikke +128).",
  flags:
    "Klassisk mønster for permissions/options. Hver flagg er en potens av 2. | for å sette, & ~ for å clear, ^ for å toggle, & for å sjekke.",
  triks:
    "n & (n-1) fjerner alltid laveste 1-bit — gjenta til 0 og du har Brian Kernighans popcount. n & -n isolerer laveste 1-bit.",
};

export function BitsDypVisualizer() {
  const [mode, setMode] = useState<Mode>("bitwise");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Bits og bytes">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Bit-manipulasjon — operatorer, skift og masker
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

      <div className="p-5 bg-background">
        {mode === "bitwise" && <BitwiseView />}
        {mode === "shift" && <ShiftView />}
        {mode === "tokomp" && <TwosComplementView />}
        {mode === "flags" && <FlagsView />}
        {mode === "triks" && <TricksView />}
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/20">
        <span className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</span>
      </div>
    </div>
  );
}

// ===========================================================================
// Felles: bit-celle
// ===========================================================================

function BitCell({
  bit,
  highlight,
  dim,
  onClick,
  size = "md",
}: {
  bit: 0 | 1;
  highlight?: boolean;
  dim?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const dims =
    size === "sm"
      ? "w-6 h-6 text-[11px]"
      : "w-8 h-8 text-sm";
  const base = `${dims} flex items-center justify-center font-mono font-bold rounded border transition-colors`;
  const styled = bit
    ? highlight
      ? "bg-brand text-brand-foreground border-brand ring-2 ring-brand/30"
      : "bg-brand/80 text-brand-foreground border-brand"
    : dim
      ? "bg-muted/30 text-muted-foreground/50 border-border/50"
      : "bg-muted/40 text-muted-foreground border-border";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${base} ${styled} ${onClick ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
    >
      {bit}
    </button>
  );
}

function BitRow({
  bits,
  highlights,
  onToggle,
  width,
  size = "md",
}: {
  bits: number[];
  highlights?: boolean[];
  onToggle?: (i: number) => void;
  width: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-1">
      {bits.map((b, i) => (
        <BitCell
          key={i}
          bit={(b ? 1 : 0) as 0 | 1}
          highlight={highlights?.[i]}
          onClick={onToggle ? () => onToggle(i) : undefined}
          size={size}
        />
      ))}
      <span className="sr-only">{width}-bit verdi</span>
    </div>
  );
}

function bitsFromInt(n: number, width: number): number[] {
  // MSB først (index 0)
  const out: number[] = [];
  for (let i = width - 1; i >= 0; i--) {
    out.push((n >>> i) & 1);
  }
  return out;
}

function intFromBits(bits: number[]): number {
  let n = 0;
  for (const b of bits) n = (n << 1) | (b ? 1 : 0);
  return n >>> 0;
}

function fmtHex(n: number, hexChars: number): string {
  return "0x" + (n >>> 0).toString(16).toUpperCase().padStart(hexChars, "0");
}

function BitIndices({ width, size = "md" }: { width: number; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-6 text-[9px]" : "w-8 text-[10px]";
  return (
    <div className="flex gap-1">
      {Array.from({ length: width }, (_, i) => {
        const idx = width - 1 - i;
        return (
          <span
            key={i}
            className={`${dims} text-center text-muted-foreground font-mono`}
          >
            {idx}
          </span>
        );
      })}
    </div>
  );
}

// ===========================================================================
// 1) Bitwise: AND / OR / XOR / NOT
// ===========================================================================

type BitOp = "AND" | "OR" | "XOR" | "NOT";

const OP_INFO: Record<BitOp, { sym: string; py: string; expl: string }> = {
  AND: { sym: "&", py: "a & b", expl: "Begge må være 1." },
  OR: { sym: "|", py: "a | b", expl: "Minst én må være 1." },
  XOR: { sym: "^", py: "a ^ b", expl: "Akkurat én er 1 — «forskjellige»." },
  NOT: { sym: "~", py: "~a", expl: "Snu hver bit. 0→1, 1→0." },
};

function BitwiseView() {
  const [op, setOp] = useState<BitOp>("AND");
  const [a, setA] = useState<number>(0b10110100); // 180
  const [b, setB] = useState<number>(0b01101100); // 108

  const toggleA = (i: number) => setA((cur) => cur ^ (1 << (7 - i)));
  const toggleB = (i: number) => setB((cur) => cur ^ (1 << (7 - i)));

  const result = useMemo(() => {
    switch (op) {
      case "AND":
        return (a & b) & 0xff;
      case "OR":
        return (a | b) & 0xff;
      case "XOR":
        return (a ^ b) & 0xff;
      case "NOT":
        return ~a & 0xff;
    }
  }, [op, a, b]);

  const aBits = bitsFromInt(a, 8);
  const bBits = bitsFromInt(b, 8);
  const rBits = bitsFromInt(result, 8);

  // Marker kolonner der bitten "betyr noe"
  const colHighlights = (idx: number): boolean => {
    const ab = aBits[idx];
    const bb = bBits[idx];
    switch (op) {
      case "AND":
        return ab === 1 && bb === 1;
      case "OR":
        return ab === 1 || bb === 1;
      case "XOR":
        return ab !== bb;
      case "NOT":
        return ab === 0; // de blir 1 etter flip
    }
  };
  const cols = Array.from({ length: 8 }, (_, i) => colHighlights(i));

  const reset = () => {
    setA(0b10110100);
    setB(0b01101100);
    setOp("AND");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Operator:</span>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(["AND", "OR", "XOR", "NOT"] as BitOp[]).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOp(o)}
              className={`px-3 py-1.5 text-xs font-medium border-l first:border-l-0 border-border ${
                op === o
                  ? "bg-brand text-brand-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {OP_INFO[o].sym} {o}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Tilbakestill
        </button>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <OperandLine
          label="a"
          bits={aBits}
          onToggle={toggleA}
          value={a}
          highlightCols={cols}
        />
        {op !== "NOT" && (
          <OperandLine
            label="b"
            bits={bBits}
            onToggle={toggleB}
            value={b}
            highlightCols={cols}
          />
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <div className="w-8 text-xs text-muted-foreground font-mono">
            {OP_INFO[op].sym}
          </div>
          <div className="text-[11px] text-muted-foreground flex-1">
            {OP_INFO[op].expl}
          </div>
        </div>
        <OperandLine
          label="="
          bits={rBits}
          value={result}
          highlightCols={cols}
          readonly
        />
        <BitIndices width={8} />
      </div>

      <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono space-y-1">
        <div>
          <span className="text-muted-foreground">Python:</span>{" "}
          <span className="text-brand">
            {op === "NOT"
              ? `~${a} & 0xFF`
              : `${a} ${OP_INFO[op].sym} ${b}`}
          </span>{" "}
          ={" "}
          <span className="text-foreground">{result}</span> ={" "}
          <span>{fmtHex(result, 2)}</span>
        </div>
        <div className="text-muted-foreground">
          Klikk på enkeltbits over for å endre operandene.
        </div>
      </div>
    </div>
  );
}

function OperandLine({
  label,
  bits,
  value,
  onToggle,
  highlightCols,
  readonly,
}: {
  label: string;
  bits: number[];
  value: number;
  onToggle?: (i: number) => void;
  highlightCols?: boolean[];
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 text-sm font-mono font-bold text-muted-foreground text-center">
        {label}
      </div>
      <BitRow
        bits={bits}
        onToggle={readonly ? undefined : onToggle}
        highlights={highlightCols}
        width={bits.length}
      />
      <div className="text-xs font-mono text-muted-foreground tabular-nums">
        = <span className="text-foreground">{value}</span>{" "}
        <span className="text-brand">{fmtHex(value, 2)}</span>
      </div>
    </div>
  );
}

// ===========================================================================
// 2) Shift: <<, >>, >>>
// ===========================================================================

type ShiftOp = "shl" | "shr" | "ushr";

const SHIFT_INFO: Record<ShiftOp, { sym: string; name: string; intuition: string }> = {
  shl: {
    sym: "<<",
    name: "Venstre-shift",
    intuition: "Multipliserer med 2^n. Bits faller ut til venstre.",
  },
  shr: {
    sym: ">>",
    name: "Aritmetisk høyre-shift",
    intuition: "Heltallsdivisjon med 2^n. Fortegnsbit dupliseres inn.",
  },
  ushr: {
    sym: ">>>",
    name: "Logisk høyre-shift",
    intuition: "Som >> men 0 fylles inn uavhengig av fortegn. JS-spesifikk.",
  },
};

function ShiftView() {
  const [value, setValue] = useState<number>(0b0000_0001_0110_1010); // 362
  const [signed, setSigned] = useState<boolean>(false);
  const [op, setOp] = useState<ShiftOp>("shl");
  const [n, setN] = useState<number>(3);

  // Når signed: tolk som int16. value er alltid lagret som uint16 internt.
  const u16 = value & 0xffff;
  const signedVal = u16 & 0x8000 ? u16 - 0x10000 : u16;

  const result = useMemo(() => {
    if (op === "shl") {
      return (u16 << n) & 0xffff;
    }
    if (op === "ushr") {
      return (u16 >>> n) & 0xffff;
    }
    // shr: signed
    if (signed) {
      return ((signedVal >> n) & 0xffff) >>> 0;
    }
    // unsigned tall med >> oppfører seg som >>> for ikke-negative
    return (u16 >>> n) & 0xffff;
  }, [u16, signedVal, op, n, signed]);

  const inBits = bitsFromInt(u16, 16);
  const outBits = bitsFromInt(result, 16);

  // For animasjon: for hver outBit, kom den fra en inBit?
  const movedFrom: (number | null)[] = useMemo(() => {
    const arr: (number | null)[] = Array(16).fill(null);
    for (let i = 0; i < 16; i++) {
      // outBits index i tilsvarer bit position (15 - i) (MSB-først)
      const outBitPos = 15 - i;
      if (op === "shl") {
        const srcPos = outBitPos - n;
        if (srcPos >= 0 && srcPos <= 15) arr[i] = 15 - srcPos;
      } else {
        // høyre
        const srcPos = outBitPos + n;
        if (srcPos >= 0 && srcPos <= 15) arr[i] = 15 - srcPos;
      }
    }
    return arr;
  }, [op, n]);

  const toggleBit = (i: number) => setValue((cur) => cur ^ (1 << (15 - i)));

  const reset = () => {
    setValue(0b0000_0001_0110_1010);
    setSigned(false);
    setOp("shl");
    setN(3);
  };

  const inDec = signed ? signedVal : u16;
  const outDec = signed
    ? result & 0x8000
      ? result - 0x10000
      : result
    : result;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Operator:</span>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {(["shl", "shr", "ushr"] as ShiftOp[]).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOp(o)}
              className={`px-3 py-1.5 text-xs font-mono font-medium border-l first:border-l-0 border-border ${
                op === o
                  ? "bg-brand text-brand-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              title={SHIFT_INFO[o].name}
            >
              {SHIFT_INFO[o].sym}
            </button>
          ))}
        </div>
        <label className="text-xs text-muted-foreground inline-flex items-center gap-1.5 ml-2">
          <input
            type="checkbox"
            checked={signed}
            onChange={(e) => setSigned(e.target.checked)}
            className="rounded"
          />
          tolk som signed int16
        </label>
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Tilbakestill
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label htmlFor="shift-n" className="text-xs text-muted-foreground">
          Skift n =
        </label>
        <input
          id="shift-n"
          type="range"
          min={0}
          max={15}
          value={n}
          onChange={(e) => setN(parseInt(e.target.value, 10))}
          className="flex-1 min-w-[120px] max-w-[260px]"
        />
        <span className="text-sm font-mono font-bold text-brand tabular-nums w-6 text-center">
          {n}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 text-xs text-muted-foreground font-mono">
            inn
          </div>
          <BitRow bits={inBits} onToggle={toggleBit} width={16} size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 text-xs text-muted-foreground font-mono inline-flex items-center gap-1">
            <ArrowRight className="h-3 w-3" /> {SHIFT_INFO[op].sym}
            {n}
          </div>
          <div className="flex gap-1">
            {outBits.map((b, i) => (
              <div key={i} className="relative">
                <BitCell
                  bit={(b ? 1 : 0) as 0 | 1}
                  dim={movedFrom[i] === null}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
        <BitIndices width={16} size="sm" />
      </div>

      <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono space-y-1">
        <div>
          <span className="text-muted-foreground">{SHIFT_INFO[op].name}:</span>{" "}
          <span className="text-foreground">{inDec}</span>{" "}
          <span className="text-brand">
            {SHIFT_INFO[op].sym} {n}
          </span>{" "}
          = <span className="text-foreground">{outDec}</span>
        </div>
        <div>
          <span className="text-muted-foreground">hex:</span>{" "}
          {fmtHex(u16, 4)} → <span className="text-brand">{fmtHex(result, 4)}</span>
        </div>
        {op === "shl" && (
          <div className="text-muted-foreground">
            x &lt;&lt; {n} ≈ x · 2<sup>{n}</sup> = x · {1 << n} (overflow utenfor 16 bits klippes)
          </div>
        )}
        {(op === "shr" || op === "ushr") && (
          <div className="text-muted-foreground">
            x {SHIFT_INFO[op].sym} {n} ≈ ⌊x / 2<sup>{n}</sup>⌋ = ⌊x / {1 << n}⌋
          </div>
        )}
        <div className="text-muted-foreground italic pt-1">
          {SHIFT_INFO[op].intuition}
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// 3) Two's complement
// ===========================================================================

function TwosComplementView() {
  const [n, setN] = useState<number>(5);

  // n er signed int8 (-128..127)
  const u8 = n & 0xff;
  const inverted = ~u8 & 0xff;
  const plusOne = (inverted + 1) & 0xff;
  const neg = plusOne & 0x80 ? plusOne - 256 : plusOne;

  const reset = () => setN(5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label htmlFor="tk-slider" className="text-xs text-muted-foreground">
          Tall (int8, -128..127):
        </label>
        <input
          id="tk-slider"
          type="range"
          min={-128}
          max={127}
          value={n}
          onChange={(e) => setN(parseInt(e.target.value, 10))}
          className="flex-1 min-w-[150px] max-w-[260px]"
        />
        <input
          type="number"
          min={-128}
          max={127}
          value={n}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (Number.isFinite(v) && v >= -128 && v <= 127) setN(v);
          }}
          className="w-20 px-2 py-1 rounded border border-border bg-background font-mono text-sm"
        />
        <button
          type="button"
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Tilbakestill
        </button>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <TKLine
          label="x"
          value={n}
          bits={bitsFromInt(u8, 8)}
          hex={u8}
          note={n >= 0 ? "Positivt: MSB = 0" : "Negativt: MSB = 1"}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-4">
          <ArrowDown />
          <span className="font-mono">~x</span> — invert alle bits
        </div>
        <TKLine
          label="~x"
          value={(inverted & 0x80 ? inverted - 256 : inverted)}
          bits={bitsFromInt(inverted, 8)}
          hex={inverted}
          note="0 ↔ 1 i hver bit-posisjon"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-4">
          <ArrowDown />
          <span className="font-mono">+ 1</span> — legg til 1
        </div>
        <TKLine
          label="-x"
          value={neg}
          bits={bitsFromInt(plusOne, 8)}
          hex={plusOne}
          note={`Det er -(${n}) = ${neg}`}
          emphasis
        />
        <BitIndices width={8} />
      </div>

      <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono space-y-1">
        <div>
          <span className="text-muted-foreground">Regel:</span>{" "}
          <span className="text-brand">-x = (~x) + 1</span> i to-er-komplement
        </div>
        <div>
          <span className="text-muted-foreground">Sjekk:</span> x + (-x) ={" "}
          {n} + {neg} = {(n + neg) & 0xff}{" "}
          <span className="text-muted-foreground">
            (carry-out kastes utenfor 8 bits)
          </span>
        </div>
        {n === -128 && (
          <div className="text-orange-500">
            Spesielt: -(-128) overflower til -128 igjen — det finnes ingen +128 i int8.
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowDown() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 2 V10 M3 7 L6 10 L9 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TKLine({
  label,
  value,
  bits,
  hex,
  note,
  emphasis,
}: {
  label: string;
  value: number;
  bits: number[];
  hex: number;
  note?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${emphasis ? "border border-brand/40 bg-brand/5 rounded-md p-2 -m-2" : ""}`}
    >
      <div className="w-10 text-sm font-mono font-bold text-muted-foreground text-center">
        {label}
      </div>
      <BitRow bits={bits} width={8} />
      <div className="text-xs font-mono text-muted-foreground tabular-nums flex flex-col">
        <span className="text-foreground">{value}</span>
        <span className="text-brand">{fmtHex(hex, 2)}</span>
      </div>
      {note && (
        <div className="text-[11px] text-muted-foreground italic flex-1">{note}</div>
      )}
    </div>
  );
}

// ===========================================================================
// 4) Bitmasks / flags
// ===========================================================================

type FlagDef = { name: string; bit: number; color: string };

const FLAGS: FlagDef[] = [
  { name: "READ", bit: 0, color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/40" },
  { name: "WRITE", bit: 1, color: "bg-blue-500/20 text-blue-600 border-blue-500/40" },
  { name: "EXEC", bit: 2, color: "bg-purple-500/20 text-purple-600 border-purple-500/40" },
  { name: "HIDDEN", bit: 3, color: "bg-amber-500/20 text-amber-600 border-amber-500/40" },
  { name: "SYSTEM", bit: 4, color: "bg-rose-500/20 text-rose-600 border-rose-500/40" },
  { name: "ARCHIVE", bit: 5, color: "bg-cyan-500/20 text-cyan-600 border-cyan-500/40" },
];

type FlagOp = "set" | "clear" | "toggle";

function FlagsView() {
  const [reg, setReg] = useState<number>(0b101); // READ | EXEC
  const [lastOp, setLastOp] = useState<string>("");

  const apply = (op: FlagOp, mask: number) => {
    setReg((cur) => {
      if (op === "set") return (cur | mask) >>> 0;
      if (op === "clear") return (cur & ~mask) >>> 0;
      return (cur ^ mask) >>> 0;
    });
    const sym = op === "set" ? "|" : op === "clear" ? "& ~" : "^";
    setLastOp(`reg = reg ${sym} mask`);
  };

  const toggleFlag = (f: FlagDef) => apply("toggle", 1 << f.bit);

  const bits = bitsFromInt(reg, 32);

  const reset = () => {
    setReg(0b101);
    setLastOp("");
  };

  const activeFlags = FLAGS.filter((f) => reg & (1 << f.bit));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Klikk på et flagg for å toggle:</span>
        {FLAGS.map((f) => {
          const set = (reg & (1 << f.bit)) !== 0;
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => toggleFlag(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${
                set ? f.color : "bg-muted/30 text-muted-foreground border-border"
              }`}
              title={`bit ${f.bit} — verdi ${1 << f.bit}`}
            >
              {f.name}={1 << f.bit}
            </button>
          );
        })}
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Tilbakestill
        </button>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 overflow-x-auto">
        <div className="text-xs text-muted-foreground mb-1">32-bit register</div>
        <div className="flex gap-0.5">
          {bits.map((b, i) => {
            const pos = 31 - i;
            const flag = FLAGS.find((f) => f.bit === pos);
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-5 h-7 flex items-center justify-center font-mono text-xs font-bold rounded-sm border ${
                    b
                      ? flag
                        ? flag.color
                        : "bg-brand text-brand-foreground border-brand"
                      : "bg-muted/30 text-muted-foreground/60 border-border/50"
                  }`}
                >
                  {b}
                </div>
                <span className="text-[8px] text-muted-foreground font-mono">
                  {pos}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono space-y-1">
          <div>
            <span className="text-muted-foreground">dec:</span>{" "}
            <span className="text-foreground">{reg}</span>
          </div>
          <div>
            <span className="text-muted-foreground">hex:</span>{" "}
            <span className="text-brand">{fmtHex(reg, 8)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">bin:</span>{" "}
            {reg.toString(2).padStart(8, "0").slice(-16) || "0"}
          </div>
          <div className="pt-1 border-t border-border/50">
            <span className="text-muted-foreground">aktive flagg:</span>{" "}
            {activeFlags.length === 0 ? (
              <span className="text-muted-foreground italic">ingen</span>
            ) : (
              <span className="text-brand">
                {activeFlags.map((f) => f.name).join(" | ")}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono space-y-1.5">
          <div className="text-muted-foreground">Klassiske mønstre:</div>
          <div>
            <span className="text-brand">reg |= MASK</span>{" "}
            <span className="text-muted-foreground">— sett flagg</span>
          </div>
          <div>
            <span className="text-brand">reg &amp;= ~MASK</span>{" "}
            <span className="text-muted-foreground">— clear flagg</span>
          </div>
          <div>
            <span className="text-brand">reg ^= MASK</span>{" "}
            <span className="text-muted-foreground">— toggle</span>
          </div>
          <div>
            <span className="text-brand">if (reg &amp; MASK)</span>{" "}
            <span className="text-muted-foreground">— sjekk om satt</span>
          </div>
          {lastOp && (
            <div className="pt-1 border-t border-border/50 text-muted-foreground italic">
              sist: {lastOp}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SmallOpButton
          label="Sett alle"
          desc="reg |= 0x3F"
          onClick={() => apply("set", 0x3f)}
        />
        <SmallOpButton
          label="Clear alle"
          desc="reg &= ~0x3F"
          onClick={() => apply("clear", 0x3f)}
        />
        <SmallOpButton
          label="Toggle alle"
          desc="reg ^= 0x3F"
          onClick={() => apply("toggle", 0x3f)}
        />
      </div>
    </div>
  );
}

function SmallOpButton({
  label,
  desc,
  onClick,
}: {
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border bg-background hover:bg-muted px-3 py-2 text-left transition-colors"
    >
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-[10px] font-mono text-muted-foreground">{desc}</div>
    </button>
  );
}

// ===========================================================================
// 5) Triks: popcount via n & (n-1), lowest-bit via n & -n
// ===========================================================================

type Trick = "popcount" | "lowbit" | "align";

function TricksView() {
  const [trick, setTrick] = useState<Trick>("popcount");
  const [n, setN] = useState<number>(0b1011_0100); // 180

  const reset = () => {
    setN(0b1011_0100);
    setTrick("popcount");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Triks:</span>
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setTrick("popcount")}
            className={`px-3 py-1.5 text-xs font-medium ${
              trick === "popcount"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            Popcount
          </button>
          <button
            type="button"
            onClick={() => setTrick("lowbit")}
            className={`px-3 py-1.5 text-xs font-medium border-l border-border ${
              trick === "lowbit"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            Laveste bit
          </button>
          <button
            type="button"
            onClick={() => setTrick("align")}
            className={`px-3 py-1.5 text-xs font-medium border-l border-border ${
              trick === "align"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            Align
          </button>
        </div>
        <button
          type="button"
          onClick={reset}
          className="ml-auto text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Tilbakestill
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label htmlFor="trick-n" className="text-xs text-muted-foreground">
          n =
        </label>
        <input
          id="trick-n"
          type="number"
          min={0}
          max={255}
          value={n}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (Number.isFinite(v) && v >= 0 && v <= 255) setN(v);
          }}
          className="w-24 px-2 py-1 rounded border border-border bg-background font-mono text-sm"
        />
        <span className="text-xs text-muted-foreground">
          ({fmtHex(n, 2)}, bin {n.toString(2).padStart(8, "0")})
        </span>
      </div>

      {trick === "popcount" && <PopcountSteps n={n} />}
      {trick === "lowbit" && <LowBitView n={n} />}
      {trick === "align" && <AlignView n={n} />}
    </div>
  );
}

function PopcountSteps({ n }: { n: number }) {
  // Brian Kernighan: gjenta x = x & (x-1) til x = 0; antall iterasjoner = popcount
  const steps: { x: number; xm1: number }[] = useMemo(() => {
    const out: { x: number; xm1: number }[] = [];
    let x = n & 0xff;
    let safety = 16;
    while (x !== 0 && safety-- > 0) {
      const xm1 = (x - 1) & 0xff;
      out.push({ x, xm1 });
      x = x & xm1;
    }
    return out;
  }, [n]);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono">
        <span className="text-muted-foreground">Triks:</span>{" "}
        <span className="text-brand">x = x &amp; (x − 1)</span>{" "}
        <span className="text-muted-foreground">
          fjerner alltid laveste 1-bit. Gjenta til x = 0; antall iterasjoner = popcount.
        </span>
      </div>
      {steps.length === 0 ? (
        <div className="text-xs text-muted-foreground italic">n = 0 → popcount = 0.</div>
      ) : (
        <div className="space-y-2">
          {steps.map((s, i) => {
            const xBits = bitsFromInt(s.x, 8);
            const xm1Bits = bitsFromInt(s.xm1, 8);
            const next = s.x & s.xm1;
            const nextBits = bitsFromInt(next, 8);
            // Marker laveste 1-bit i x
            const lowBit = s.x & -s.x;
            const lowBitIdx = Array.from({ length: 8 }, (_, j) =>
              lowBit === 1 << (7 - j),
            );
            return (
              <div
                key={i}
                className="rounded-md border border-border bg-muted/10 p-3 space-y-1.5"
              >
                <div className="text-[11px] text-muted-foreground font-mono">
                  steg {i + 1}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 text-xs font-mono text-muted-foreground">
                    x
                  </div>
                  <BitRow
                    bits={xBits}
                    width={8}
                    size="sm"
                    highlights={lowBitIdx}
                  />
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {s.x}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 text-xs font-mono text-muted-foreground">
                    x−1
                  </div>
                  <BitRow bits={xm1Bits} width={8} size="sm" />
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {s.xm1}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-border/50">
                  <div className="w-14 text-xs font-mono text-brand">x &amp; (x−1)</div>
                  <BitRow bits={nextBits} width={8} size="sm" />
                  <span className="text-xs font-mono tabular-nums">
                    {next}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="rounded-md border border-brand/40 bg-brand/5 p-3 text-xs font-mono">
            <span className="text-muted-foreground">popcount({n}) =</span>{" "}
            <span className="text-brand font-bold text-base">{steps.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LowBitView({ n }: { n: number }) {
  const lowBit = n === 0 ? 0 : n & -n;
  const nBits = bitsFromInt(n & 0xff, 8);
  const negBits = bitsFromInt((-n) & 0xff, 8);
  const lowBits = bitsFromInt(lowBit & 0xff, 8);
  const lowIdx = Array.from(
    { length: 8 },
    (_, i) => lowBit !== 0 && lowBit === 1 << (7 - i),
  );

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono">
        <span className="text-muted-foreground">Triks:</span>{" "}
        <span className="text-brand">n &amp; (-n)</span>{" "}
        <span className="text-muted-foreground">
          isolerer laveste 1-bit. Fungerer fordi -n i to-er-komplement har
          akkurat samme bit der, og forskjellige bits høyere opp.
        </span>
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-14 text-xs font-mono text-muted-foreground">n</div>
          <BitRow bits={nBits} width={8} size="sm" highlights={lowIdx} />
          <span className="text-xs font-mono tabular-nums">{n}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 text-xs font-mono text-muted-foreground">-n</div>
          <BitRow bits={negBits} width={8} size="sm" highlights={lowIdx} />
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            (to-er-komp)
          </span>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <div className="w-14 text-xs font-mono text-brand">n &amp; -n</div>
          <BitRow bits={lowBits} width={8} size="sm" highlights={lowIdx} />
          <span className="text-xs font-mono tabular-nums text-brand font-bold">
            {lowBit}
          </span>
        </div>
        <BitIndices width={8} size="sm" />
      </div>
      <div className="text-xs font-mono text-muted-foreground">
        Bruk: Fenwick-tree (BIT) bruker dette for å gå mellom prefix-sums:{" "}
        <span className="text-brand">i += i &amp; -i</span>.
      </div>
    </div>
  );
}

function AlignView({ n }: { n: number }) {
  // Round up to next multiple of 8: (x + 7) & ~7
  const aligned = (n + 7) & ~7 & 0xff;
  const nBits = bitsFromInt(n & 0xff, 8);
  const plus7Bits = bitsFromInt((n + 7) & 0xff, 8);
  const alignedBits = bitsFromInt(aligned, 8);
  // Marker de tre lavest-betydende bitsene (de blir maskert vekk)
  const lowThree = Array.from({ length: 8 }, (_, i) => i >= 5);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-muted/10 p-3 text-xs font-mono">
        <span className="text-muted-foreground">Triks:</span>{" "}
        <span className="text-brand">(x + 7) &amp; ~7</span>{" "}
        <span className="text-muted-foreground">
          runder x opp til nærmeste multiplum av 8. Generelt for align til 2
          <sup>k</sup>: (x + 2<sup>k</sup>−1) &amp; ~(2<sup>k</sup>−1).
        </span>
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-20 text-xs font-mono text-muted-foreground">x</div>
          <BitRow bits={nBits} width={8} size="sm" />
          <span className="text-xs font-mono tabular-nums">{n}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 text-xs font-mono text-muted-foreground">
            x + 7
          </div>
          <BitRow bits={plus7Bits} width={8} size="sm" />
          <span className="text-xs font-mono tabular-nums">{(n + 7) & 0xff}</span>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <div className="w-20 text-xs font-mono text-brand">(x+7) &amp; ~7</div>
          <BitRow
            bits={alignedBits}
            width={8}
            size="sm"
            highlights={lowThree}
          />
          <span className="text-xs font-mono tabular-nums text-brand font-bold">
            {aligned}
          </span>
        </div>
        <BitIndices width={8} size="sm" />
      </div>
      <div className="text-xs font-mono text-muted-foreground space-y-1">
        <div>
          <span className="text-muted-foreground">~7 i 8-bit:</span>{" "}
          1111 1000 — de tre laveste bitsene nullstilles.
        </div>
        <div>
          <span className="text-muted-foreground">Beslektet:</span>{" "}
          <span className="text-brand">x % 2<sup>n</sup> == x &amp; (2<sup>n</sup>−1)</span>{" "}
          for unsigned x.
        </div>
      </div>
    </div>
  );
}

// Brukes via ikon-importen (Lucide tree-shaking)
void ArrowLeftRight;
