import { useMemo, useState } from "react";
import { RotateCcw, Calculator } from "lucide-react";

type DivStep = {
  /** Width-padded current dividend snapshot at this step (string of 0/1, length = D+r). */
  dividend: string;
  /** The generator G aligned at this position (or null if we shifted-down). */
  subtractor: string | null;
  /** XOR result on the working window for this step. */
  result: string | null;
  /** Whether we performed a divide (top bit was 1) at this position. */
  divided: boolean;
  /** Position (0-indexed) of the leftmost bit of the current "window" of length |G|. */
  position: number;
};

type DivResult = {
  steps: DivStep[];
  remainder: string;
  augmented: string; // D appended with r zeros
};

function isBinary(s: string): boolean {
  return /^[01]+$/.test(s);
}

function xorBits(a: string, b: string): string {
  let out = "";
  for (let i = 0; i < a.length; i++) {
    out += a.charCodeAt(i) === b.charCodeAt(i) ? "0" : "1";
  }
  return out;
}

/**
 * Performs CRC modulo-2 division of (D · 2^r) by G.
 * Returns step-by-step trace, where each step is one alignment-window operation.
 */
export function crcDivide(D: string, G: string): DivResult {
  const r = G.length - 1;
  const augmented = D + "0".repeat(r);
  const steps: DivStep[] = [];

  // Work with a mutable array of bits.
  const working = augmented.split("");
  const gLen = G.length;

  for (let pos = 0; pos <= augmented.length - gLen; pos++) {
    const window = working.slice(pos, pos + gLen).join("");
    const topBit = window[0];

    if (topBit === "1") {
      const after = xorBits(window, G);
      for (let i = 0; i < gLen; i++) working[pos + i] = after[i];
      steps.push({
        dividend: working.join(""),
        subtractor: G,
        result: after,
        divided: true,
        position: pos,
      });
    } else {
      // top bit 0 → subtractor is zeros, just shift on
      steps.push({
        dividend: working.join(""),
        subtractor: "0".repeat(gLen),
        result: window,
        divided: false,
        position: pos,
      });
    }
  }

  const remainder = working.join("").slice(-r);
  return { steps, remainder, augmented };
}

const PRESETS = [
  { label: "Bokens eksempel: D=101110, G=1001", D: "101110", G: "1001" },
  { label: "CRC-4: D=11010011, G=10011", D: "11010011", G: "10011" },
  { label: "Egendefinert (skriv selv)", D: "", G: "" },
];

export function CrcDivider() {
  const [D, setD] = useState("101110");
  const [G, setG] = useState("1001");
  const [showVerify, setShowVerify] = useState(false);

  const valid = isBinary(D) && isBinary(G) && G[0] === "1" && D.length >= G.length;

  const result = useMemo<DivResult | null>(() => {
    if (!valid) return null;
    return crcDivide(D, G);
  }, [D, G, valid]);

  // Mottakerverifikasjon: frame = D + R, divide frame by G → should be zero rest.
  const verifyResult = useMemo<DivResult | null>(() => {
    if (!result) return null;
    const frame = D + result.remainder;
    // Use the same divide algorithm but with augmented = frame (no extra zeros);
    // i.e., we treat `frame` as already (D · 2^r) + R, divide by G.
    const steps: DivStep[] = [];
    const working = frame.split("");
    const gLen = G.length;
    for (let pos = 0; pos <= frame.length - gLen; pos++) {
      const window = working.slice(pos, pos + gLen).join("");
      const topBit = window[0];
      if (topBit === "1") {
        const after = xorBits(window, G);
        for (let i = 0; i < gLen; i++) working[pos + i] = after[i];
        steps.push({
          dividend: working.join(""),
          subtractor: G,
          result: after,
          divided: true,
          position: pos,
        });
      } else {
        steps.push({
          dividend: working.join(""),
          subtractor: "0".repeat(gLen),
          result: window,
          divided: false,
          position: pos,
        });
      }
    }
    const remainder = working.join("").slice(-(gLen - 1));
    return { steps, remainder, augmented: frame };
  }, [result, D, G]);

  function applyPreset(p: (typeof PRESETS)[number]) {
    if (p.D && p.G) {
      setD(p.D);
      setG(p.G);
      setShowVerify(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5" /> CRC modulo-2-divisjon
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40 text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1fr] gap-0">
        <div className="p-4 border-b md:border-b-0 md:border-r border-border">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            D (databits)
          </label>
          <input
            type="text"
            value={D}
            onChange={(e) => setD(e.target.value.replace(/[^01]/g, ""))}
            className="w-full font-mono text-base bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:border-brand"
            placeholder="101110"
            maxLength={24}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Bare 0 og 1. Boken bruker {`D = 101110`}.
          </p>
        </div>
        <div className="p-4">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            G (generator, r+1 bits)
          </label>
          <input
            type="text"
            value={G}
            onChange={(e) => setG(e.target.value.replace(/[^01]/g, ""))}
            className="w-full font-mono text-base bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:border-brand"
            placeholder="1001"
            maxLength={12}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Må starte med 1. Lengden av G er r+1; resten R er r bits. Her er r ={" "}
            {G.length - 1}.
          </p>
        </div>
      </div>

      {!valid && (
        <div className="px-4 pb-4 text-xs text-amber-500">
          Skriv gyldig D (≥|G|) og G (starter med 1). Bare 0/1.
        </div>
      )}

      {result && (
        <>
          <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs leading-relaxed">
            <div className="font-semibold mb-1">
              Mål: finn R slik at <span className="font-mono">D · 2^r XOR R</span> er
              delelig med G.
            </div>
            <div className="text-muted-foreground">
              Vi appenderer r = {G.length - 1} nuller til D, så deler vi{" "}
              <span className="font-mono text-foreground">{result.augmented}</span> på{" "}
              <span className="font-mono text-foreground">{G}</span>. Resten blir CRC-en.
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <DivisionTrace D={D} G={G} result={result} />
          </div>

          <div className="border-t border-border bg-emerald-500/5 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
              Resultat
            </div>
            <div className="font-mono text-sm">
              R = <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{result.remainder}</span>
              <span className="text-muted-foreground"> · </span>
              Frame = <span className="font-semibold">{D}{result.remainder}</span>
            </div>
          </div>

          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => setShowVerify((s) => !s)}
              className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-muted/30 flex items-center justify-between"
            >
              <span>Mottakerverifikasjon: del hele rammen på G og forvent rest = 0</span>
              <span className="text-xs text-muted-foreground">
                {showVerify ? "skjul" : "vis"}
              </span>
            </button>
            {showVerify && verifyResult && (
              <div className="border-t border-border bg-muted/10 p-4 overflow-x-auto">
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Mottaker tar imot{" "}
                  <span className="font-mono text-foreground">{D}{result.remainder}</span>,
                  deler på <span className="font-mono text-foreground">{G}</span>, og
                  sjekker at resten er null. Hvis ikke null → bit-feil oppdaget.
                </p>
                <DivisionTrace D={D + result.remainder} G={G} result={verifyResult} skipAugment />
                <div
                  className={`mt-3 rounded-md border px-3 py-2 text-xs font-mono ${
                    /^0+$/.test(verifyResult.remainder)
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-600"
                  }`}
                >
                  Rest = {verifyResult.remainder}{" "}
                  {/^0+$/.test(verifyResult.remainder) ? "→ feilfri ramme aksepteres" : "→ feil oppdaget"}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-muted/20 px-4 py-3">
            <RotateButton onClick={() => { setD("101110"); setG("1001"); setShowVerify(false); }} />
          </div>
        </>
      )}
    </div>
  );
}

function RotateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-3 py-1.5"
    >
      <RotateCcw className="h-3.5 w-3.5" /> Tilbake til bokeksempelet
    </button>
  );
}

function DivisionTrace({
  D,
  G,
  result,
  skipAugment = false,
}: {
  D: string;
  G: string;
  result: DivResult;
  skipAugment?: boolean;
}) {
  const totalLen = result.augmented.length;

  return (
    <div className="font-mono text-[13px] leading-[1.55] whitespace-pre">
      <div className="text-muted-foreground text-xs mb-1">
        {skipAugment ? `Ramme: ${result.augmented}` : `D · 2^r = ${D}${"0".repeat(G.length - 1)}`}
      </div>
      <div className="flex">
        <span className="opacity-50 select-none">{" ".repeat(G.length + 2)}</span>
        <span>{result.augmented}</span>
      </div>
      <div className="flex">
        <span className="opacity-50 select-none">{G} ÷ </span>
        <span className="border-t border-current">{"-".repeat(totalLen)}</span>
      </div>

      {result.steps.map((step, i) => {
        const leftPad = step.position;
        const subLen = G.length;
        const subStr = step.subtractor ?? "";
        const isFinal = i === result.steps.length - 1;
        return (
          <div key={i} className="contents">
            {/* The subtractor line */}
            <div className="flex">
              <span className="opacity-50 select-none">{" ".repeat(G.length + 2)}</span>
              <span className="opacity-40">{" ".repeat(leftPad)}</span>
              <span className={step.divided ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                {subStr}
              </span>
              <span className="text-[11px] text-muted-foreground ml-3">
                {step.divided ? `XOR med G` : `topbit=0 → hopp over`}
              </span>
            </div>
            {/* The line under it */}
            <div className="flex">
              <span className="opacity-50 select-none">{" ".repeat(G.length + 2)}</span>
              <span className="opacity-40">{" ".repeat(leftPad)}</span>
              <span className="border-t border-current">
                {"-".repeat(subLen + (isFinal ? totalLen - leftPad - subLen : 0))}
              </span>
            </div>
            {/* The result */}
            <div className="flex">
              <span className="opacity-50 select-none">{" ".repeat(G.length + 2)}</span>
              <span className="opacity-40">{" ".repeat(leftPad)}</span>
              <span className={step.divided ? "text-foreground" : "opacity-60"}>
                {step.result}
              </span>
              {/* trailing bits not yet brought down */}
              <span className="opacity-60">
                {result.augmented.slice(step.position + subLen, step.position + subLen + 1)}
              </span>
            </div>
          </div>
        );
      })}

      <div className="mt-2 flex">
        <span className="opacity-50 select-none">{" ".repeat(G.length + 2)}</span>
        <span className="opacity-40">{" ".repeat(totalLen - (G.length - 1))}</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
          R = {result.remainder}
        </span>
      </div>
    </div>
  );
}
