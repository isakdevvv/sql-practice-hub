import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Eight toggleable bit cells. Click a cell to flip the bit and watch the
 * decimal / hex / binary readout update.
 */
export function BitsToByte() {
  // bits[0] is the most significant bit (value 128).
  const [bits, setBits] = useState<number[]>([0, 1, 0, 0, 0, 0, 0, 1]); // 0x41 = 'A'

  const decimal = bits.reduce((acc, b, i) => acc + b * 2 ** (7 - i), 0);
  const hex = decimal.toString(16).toUpperCase().padStart(2, "0");
  const binary = bits.join("");

  // If the byte happens to be a printable ASCII character, show it.
  const printable =
    decimal >= 32 && decimal <= 126 ? String.fromCharCode(decimal) : null;

  const toggle = (i: number) => {
    setBits((prev) => prev.map((b, j) => (j === i ? (b === 0 ? 1 : 0) : b)));
  };

  const reset = () => setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  const setAll = () => setBits([1, 1, 1, 1, 1, 1, 1, 1]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Trykk på en bit for å skru den av/på
        </span>
      </div>

      {/* 8 bit-celler. */}
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2 mb-4">
        {bits.map((bit, i) => {
          const place = 2 ** (7 - i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`flex flex-col items-center justify-center rounded-md border py-2 sm:py-3 transition-colors ${
                bit === 1
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-brand/50"
              }`}
            >
              <span className="text-lg sm:text-2xl font-bold tabular-nums leading-none">
                {bit}
              </span>
              <span className="text-[9px] sm:text-[10px] mt-1 tabular-nums opacity-75">
                {place}
              </span>
            </button>
          );
        })}
      </div>

      {/* Readout. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Readout label="Desimal" value={decimal.toString()} />
        <Readout label="Heksadesimal" value={`0x${hex}`} />
        <Readout label="Binær" value={binary} mono />
      </div>

      {printable && (
        <div className="rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-sm">
          Denne byten ({decimal}) tilsvarer ASCII-tegnet{" "}
          <span className="font-mono font-bold text-brand">'{printable}'</span>
        </div>
      )}
      {!printable && decimal !== 0 && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {decimal} er ikke et synlig ASCII-tegn (0–31 og 127+ er kontrolltegn /
          ikke definert i 7-bit ASCII).
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          Nullstill
        </Button>
        <Button variant="outline" size="sm" onClick={setAll}>
          Alle på (255)
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        En byte er åtte bits. Hvert bit er enten 0 eller 1. Det gir 2<sup>8</sup>{" "}
        = 256 mulige verdier — fra 0 til 255. Det er hele historien.
      </p>
    </div>
  );
}

function Readout({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </div>
      <div
        className={`text-lg font-bold tabular-nums ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
