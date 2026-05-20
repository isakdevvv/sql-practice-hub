import { useMemo, useState } from "react";
import { RotateCcw, Shuffle, Zap } from "lucide-react";

// Levende seksjon 6.2 — Feiloppdaging
// Brukeren skriver inn en bit-streng og ser tre algoritmer beregne sine
// "redundans-bits" parallelt: enkel paritet, internet checksum (16-bit ord),
// og CRC-8 (med generator-polynom G = 100000111 = x^8 + x^2 + x + 1).
// Deretter kan brukeren toggle bit-feil i den sendte rammen og se hvilken av
// algoritmene som faktisk oppdager feilen.

// Vi bruker CRC-8 (ikke CRC-32) fordi:
//   1) Bit-strengen er ikke kjempelang og divisjonen lar seg vise.
//   2) Pedagogisk er prinsippet identisk — bare polynom-graden er mindre.

// G = x^8 + x^2 + x + 1  →  binært 100000111 (9 bit, grad 8)
const CRC_GEN = "100000111";
const CRC_R = CRC_GEN.length - 1; // 8

const DEFAULT_INPUT = "1011001011010110";

function sanitize(bits: string, maxLen = 32): string {
  return bits.replace(/[^01]/g, "").slice(0, maxLen);
}

function pad(bits: string, multipleOf: number): string {
  const rem = bits.length % multipleOf;
  return rem === 0 ? bits : bits + "0".repeat(multipleOf - rem);
}

// ---------- Paritet ----------
function parityBit(bits: string, even = true): "0" | "1" {
  const ones = (bits.match(/1/g) || []).length;
  if (even) return ones % 2 === 0 ? "0" : "1";
  return ones % 2 === 0 ? "1" : "0";
}

// ---------- Internet checksum (16-bit ord, ones' complement) ----------
function internetChecksum(bits: string): string {
  const padded = pad(bits, 16);
  const words: number[] = [];
  for (let i = 0; i < padded.length; i += 16) {
    words.push(parseInt(padded.slice(i, i + 16), 2));
  }
  let sum = 0;
  for (const w of words) {
    sum += w;
    // legg evt. carry tilbake (end-around carry)
    if (sum > 0xffff) sum = (sum & 0xffff) + 1;
  }
  // ones' complement = invert
  const checksum = (~sum) & 0xffff;
  return checksum.toString(2).padStart(16, "0");
}

// ---------- CRC-8 ----------
function crc(bits: string, gen: string = CRC_GEN): { remainder: string; steps: string[] } {
  const r = gen.length - 1;
  const aug = bits + "0".repeat(r);
  let cur = aug;
  const steps: string[] = [`Start (data + ${r} nuller): ${aug}`];
  // standard binær divisjon med XOR
  for (let i = 0; i <= cur.length - gen.length; i++) {
    if (cur[i] === "1") {
      // XOR med G fra posisjon i
      const head = cur.slice(0, i);
      const target = cur.slice(i, i + gen.length);
      let xored = "";
      for (let j = 0; j < gen.length; j++) {
        xored += target[j] === gen[j] ? "0" : "1";
      }
      cur = head + xored + cur.slice(i + gen.length);
      steps.push(`Pos ${i}: XOR med G → ${cur}`);
    }
  }
  const remainder = cur.slice(-r);
  steps.push(`Rest = CRC = ${remainder}`);
  return { remainder, steps };
}

// ---------- Verifisering på mottakerside ----------
type CheckResult = {
  ok: boolean;
  // For paritet: ny ones-count, for checksum: ny sum, for CRC: ny rest
  detail: string;
};

function parityCheck(bits: string, parityB: string): CheckResult {
  const all = bits + parityB;
  const ones = (all.match(/1/g) || []).length;
  const ok = ones % 2 === 0; // even parity
  return {
    ok,
    detail: ok
      ? `${ones} 1-ere — partall → OK`
      : `${ones} 1-ere — oddetall → feil oppdaget`,
  };
}

function checksumCheck(bits: string, checksum: string): CheckResult {
  // Mottaker legger sammen alle ord + checksum og forventer ~0 (alle 1-ere) i ones' complement.
  const padded = pad(bits, 16);
  const words: number[] = [];
  for (let i = 0; i < padded.length; i += 16) {
    words.push(parseInt(padded.slice(i, i + 16), 2));
  }
  words.push(parseInt(checksum, 2));
  let sum = 0;
  for (const w of words) {
    sum += w;
    if (sum > 0xffff) sum = (sum & 0xffff) + 1;
  }
  const ok = sum === 0xffff;
  return {
    ok,
    detail: ok
      ? `sum = 0xFFFF → OK`
      : `sum = 0x${sum.toString(16).padStart(4, "0").toUpperCase()} → feil`,
  };
}

function crcCheck(bits: string, crcBits: string): CheckResult {
  const combined = bits + crcBits;
  const { remainder } = crc(combined.slice(0, bits.length), CRC_GEN);
  // Egentlig: kjør divisjonen på (data || crc) — den skal gi 0 rest hvis ingen feil.
  // Vi gjør det rett ved å kalle vår egen crc-funksjon på (data + crcBits) som hele blokken,
  // men siden vår crc(bits) padder med r nuller selv, må vi divisere "manuelt":
  const r = CRC_GEN.length - 1;
  let cur = combined;
  for (let i = 0; i <= cur.length - CRC_GEN.length; i++) {
    if (cur[i] === "1") {
      let xored = "";
      for (let j = 0; j < CRC_GEN.length; j++) {
        xored += cur[i + j] === CRC_GEN[j] ? "0" : "1";
      }
      cur = cur.slice(0, i) + xored + cur.slice(i + CRC_GEN.length);
    }
  }
  const rest = cur.slice(-r);
  const ok = /^0+$/.test(rest);
  // remainder-verdien er ubrukt videre, men beholdes for ev. utvidelse:
  void remainder;
  return {
    ok,
    detail: ok ? `rest = ${rest} (alle nuller) → OK` : `rest = ${rest} → feil oppdaget`,
  };
}

// ---------- UI ----------

type Algo = "parity" | "checksum" | "crc";

export function Section62Live() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  // Hvilke posisjoner i den sendte ramma som er flippet (relative til "data | redundans")
  const [flips, setFlips] = useState<Set<number>>(new Set());
  // Hvilken algoritme vi viser detaljer for
  const [openSteps, setOpenSteps] = useState(false);

  const bits = sanitize(input);

  const parityB = useMemo(() => parityBit(bits, true), [bits]);
  const checksum = useMemo(() => internetChecksum(bits), [bits]);
  const crcRes = useMemo(() => crc(bits, CRC_GEN), [bits]);

  // Sendt ramme: data || redundans (per algoritme — vi viser hver "stripe" for seg)
  // For å unngå posisjonsforvirring bruker vi én flip-mengde mot indekser i selve datadelen,
  // pluss separate flip-mengder per redundansbits-strenge er overkill.
  // Vi tillater flip kun i selve data-delen (det er mest interessant pedagogisk) for å se
  // hvordan ulike algoritmer reagerer.
  const flippedBits = useMemo(() => {
    const arr = bits.split("");
    flips.forEach((i) => {
      if (i < arr.length) arr[i] = arr[i] === "0" ? "1" : "0";
    });
    return arr.join("");
  }, [bits, flips]);

  const parityResult = parityCheck(flippedBits, parityB);
  const checksumResult = checksumCheck(flippedBits, checksum);
  const crcResult = crcCheck(flippedBits, crcRes.remainder);

  function toggleFlip(i: number) {
    setFlips((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function resetFlips() {
    setFlips(new Set());
  }

  function randomBurst() {
    // Velg en burst av 3 påfølgende bits, et tilfeldig sted
    if (bits.length < 4) return;
    const start = Math.floor(Math.random() * (bits.length - 2));
    const next = new Set<number>();
    next.add(start);
    next.add(start + 1);
    next.add(start + 2);
    setFlips(next);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          Tre algoritmer beregner redundans på samme data — se hvilke som tåler hvilke bit-feil
        </span>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-b border-border bg-muted/10">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Data-bits (kun 0 og 1, maks 32):
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(sanitize(e.target.value));
              setFlips(new Set());
            }}
            className="flex-1 rounded border border-border bg-background px-3 py-1.5 font-mono text-sm"
            placeholder="1011001011010110"
          />
          <button
            onClick={() => {
              setInput(DEFAULT_INPUT);
              setFlips(new Set());
            }}
            className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/60"
          >
            <RotateCcw className="h-3 w-3" /> Default
          </button>
          <button
            onClick={() => {
              const n = 16;
              let s = "";
              for (let i = 0; i < n; i++) s += Math.random() < 0.5 ? "0" : "1";
              setInput(s);
              setFlips(new Set());
            }}
            className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/60"
          >
            <Shuffle className="h-3 w-3" /> Tilfeldig
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Klikk på en bit i en av rammene nedenfor for å «flippe» den (simulere bit-feil under
          transport). Se hva hver algoritme rapporterer.
        </p>
      </div>

      {/* Tre algoritmer side ved side */}
      <div className="divide-y divide-border">
        <AlgoRow
          name="Paritets-bit (even parity)"
          formula={`1 ekstra bit som gjør antall 1-ere til partall`}
          dataBits={flippedBits}
          redundancy={parityB}
          redundancyLabel="P"
          origDataBits={bits}
          flips={flips}
          onToggleFlip={toggleFlip}
          result={parityResult}
          strength="Oppdager: alle enkelt-bit-feil. Bommer på: 2 samtidige flips."
        />

        <AlgoRow
          name="Internet checksum (16-bit ord)"
          formula="Sum alle 16-bit ord med end-around carry → invertér"
          dataBits={flippedBits}
          redundancy={checksum}
          redundancyLabel="C"
          origDataBits={bits}
          flips={flips}
          onToggleFlip={toggleFlip}
          result={checksumResult}
          strength="Oppdager: alle enkelt-feil + de fleste flerfeil. Bommer på: helt symmetriske ord-flips."
        />

        <AlgoRow
          name="CRC-8 (G = x⁸ + x² + x + 1)"
          formula={`Binær divisjon: data·2⁸ mod G = ${CRC_R}-bit rest`}
          dataBits={flippedBits}
          redundancy={crcRes.remainder}
          redundancyLabel="R"
          origDataBits={bits}
          flips={flips}
          onToggleFlip={toggleFlip}
          result={crcResult}
          strength={`Oppdager: alle enkelt-feil, alle dobbel-feil, alle burst-feil ≤ ${CRC_R} bits, og 99,6 % av lengre.`}
          extra={
            <button
              onClick={() => setOpenSteps((o) => !o)}
              className="text-[11px] text-brand hover:underline"
            >
              {openSteps ? "Skjul divisjons-steg" : "Vis divisjons-steg"}
            </button>
          }
        />
      </div>

      {openSteps && (
        <div className="px-4 py-3 border-t border-border bg-muted/20 text-[11px] font-mono">
          <div className="text-muted-foreground mb-1">
            CRC-divisjon (XOR der bit-mønsteret begynner med 1):
          </div>
          {crcRes.steps.map((s, i) => (
            <div key={i} className="text-foreground">
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Kontroller */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 flex flex-wrap items-center gap-2">
        <button
          onClick={resetFlips}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill feil
        </button>
        <button
          onClick={randomBurst}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs hover:bg-brand/20"
        >
          <Zap className="h-3 w-3" /> Burst-feil (3 bits)
        </button>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {flips.size === 0 ? "Ingen bit-feil" : `${flips.size} bit${flips.size === 1 ? "" : "s"} flippet`}
        </span>
      </div>
    </div>
  );
}

function AlgoRow({
  name,
  formula,
  dataBits,
  redundancy,
  redundancyLabel,
  origDataBits,
  flips,
  onToggleFlip,
  result,
  strength,
  extra,
}: {
  name: string;
  formula: string;
  dataBits: string;
  redundancy: string;
  redundancyLabel: string;
  origDataBits: string;
  flips: Set<number>;
  onToggleFlip: (i: number) => void;
  result: CheckResult;
  strength: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1.5">
        <div>
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-[11px] text-muted-foreground">{formula}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${
              result.ok
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {result.ok ? "ingen feil oppdaget" : "FEIL oppdaget"}
          </span>
          {extra}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mt-2 font-mono text-[12px]">
        <span className="text-[10px] text-muted-foreground mr-1">data:</span>
        {dataBits.split("").map((b, i) => {
          const flipped = flips.has(i);
          const orig = origDataBits[i];
          return (
            <button
              key={i}
              onClick={() => onToggleFlip(i)}
              title={`Posisjon ${i} — opprinnelig ${orig}, nå ${b}${flipped ? " (flippet)" : ""}`}
              className={`min-w-[18px] px-1 py-0.5 rounded border transition-colors ${
                flipped
                  ? "border-destructive bg-destructive/15 text-destructive font-bold"
                  : "border-border bg-background hover:border-brand/60 text-foreground"
              }`}
            >
              {b}
            </button>
          );
        })}
        <span className="text-muted-foreground mx-1">|</span>
        <span className="text-[10px] text-muted-foreground mr-1">{redundancyLabel}:</span>
        {redundancy.split("").map((b, i) => (
          <span
            key={i}
            className="min-w-[18px] px-1 py-0.5 rounded border border-brand/40 bg-brand/10 text-brand font-bold text-center"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="mt-1.5 text-[11px] text-muted-foreground">
        Mottaker beregner og finner: <span className="font-mono text-foreground">{result.detail}</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground italic">{strength}</div>
    </div>
  );
}
