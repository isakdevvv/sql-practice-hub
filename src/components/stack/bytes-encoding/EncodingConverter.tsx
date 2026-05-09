import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Mode = "text-to-bytes" | "bytes-to-text";

const SAMPLES: Array<{ label: string; value: string }> = [
  { label: "hello", value: "hello" },
  { label: "ø", value: "ø" },
  { label: "blåbærsyltetøy", value: "blåbærsyltetøy" },
  { label: "🇳🇴", value: "🇳🇴" },
  { label: "café 🚀", value: "café 🚀" },
];

const HEX_SAMPLES: Array<{ label: string; value: string }> = [
  { label: "hello", value: "68 65 6c 6c 6f" },
  { label: "ø", value: "c3 b8" },
  { label: "å", value: "c3 a5" },
  { label: "ugyldig", value: "ff fe" },
];

/**
 * Two-way converter: text ↔ UTF-8 bytes (hex + decimal).
 * Uses the browser's TextEncoder/TextDecoder — no external deps.
 */
export function EncodingConverter() {
  const [mode, setMode] = useState<Mode>("text-to-bytes");
  const [text, setText] = useState<string>("ø");
  const [hexInput, setHexInput] = useState<string>("c3 b8");

  return (
    <div className="rounded-xl border border-brand/40 bg-brand/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold">Toveis-konverter</h3>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode("text-to-bytes")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "text-to-bytes"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            Tekst → bytes
          </button>
          <button
            type="button"
            onClick={() => setMode("bytes-to-text")}
            className={`px-3 py-1.5 transition-colors border-l border-border ${
              mode === "bytes-to-text"
                ? "bg-brand text-brand-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            Bytes → tekst
          </button>
        </div>
      </div>

      {mode === "text-to-bytes" ? (
        <TextToBytes text={text} setText={setText} />
      ) : (
        <BytesToText hexInput={hexInput} setHexInput={setHexInput} />
      )}
    </div>
  );
}

// -- TEXT → BYTES --------------------------------------------------------------

function TextToBytes({
  text,
  setText,
}: {
  text: string;
  setText: (s: string) => void;
}) {
  const bytes = useMemo(() => {
    const encoder = new TextEncoder();
    return encoder.encode(text);
  }, [text]);

  const hexView = Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
  const decView = Array.from(bytes).join(" ");

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Tekst (UTF-8)
        </span>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          placeholder="Skriv noe — prøv ø, å, eller emoji"
        />
      </label>

      <div className="flex flex-wrap gap-1.5">
        {SAMPLES.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setText(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ByteView label="Hex" value={hexView} />
        <ByteView label="Desimal" value={decView} />
      </div>

      <div className="rounded-md border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-mono">{[...text].length}</span> tegn (kodepunkter)
        ·{" "}
        <span className="font-mono">{bytes.length}</span> bytes når kodet med
        UTF-8
      </div>

      <PerCharBreakdown text={text} />
    </div>
  );
}

function PerCharBreakdown({ text }: { text: string }) {
  // Iterate by unicode code points (Array.from handles surrogate pairs).
  const chars = Array.from(text);
  if (chars.length === 0) return null;
  if (chars.length > 16)
    return (
      <p className="text-xs text-muted-foreground italic">
        (Per-tegn-oppdeling vises bare for opptil 16 tegn.)
      </p>
    );

  const encoder = new TextEncoder();
  return (
    <div className="rounded-md border border-border bg-background/60 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
        Per tegn
      </div>
      <div className="flex flex-wrap gap-2">
        {chars.map((ch, i) => {
          const bs = encoder.encode(ch);
          const hex = Array.from(bs)
            .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
            .join(" ");
          return (
            <div
              key={i}
              className="rounded border border-border bg-card px-2 py-1.5"
            >
              <div className="font-mono text-base text-center min-w-[1.5rem]">
                {ch === " " ? "·" : ch}
              </div>
              <div className="font-mono text-[10px] tabular-nums text-brand mt-0.5">
                {hex}
              </div>
              <div className="text-[9px] tabular-nums text-muted-foreground text-center">
                {bs.length} {bs.length === 1 ? "byte" : "bytes"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- BYTES → TEXT --------------------------------------------------------------

function BytesToText({
  hexInput,
  setHexInput,
}: {
  hexInput: string;
  setHexInput: (s: string) => void;
}) {
  const result = useMemo(() => parseAndDecode(hexInput), [hexInput]);

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          Hex-bytes (mellomrom mellom)
        </span>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          placeholder="f.eks. c3 b8"
        />
      </label>

      <div className="flex flex-wrap gap-1.5">
        {HEX_SAMPLES.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs font-mono"
            onClick={() => setHexInput(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {result.kind === "ok" && (
        <>
          <div className="rounded-md border border-brand/40 bg-background px-3 py-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Dekodet tekst
            </div>
            <div className="font-mono text-lg break-all mt-1">
              {result.text || (
                <span className="text-muted-foreground italic">(tom)</span>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {result.bytes.length} bytes → {[...result.text].length} tegn
          </div>
        </>
      )}

      {result.kind === "parse-error" && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            Ugyldig hex:
          </span>{" "}
          {result.message}
        </div>
      )}

      {result.kind === "decode-error" && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
          <span className="font-semibold text-red-700 dark:text-red-400">
            Ugyldig UTF-8:
          </span>{" "}
          byte-sekvensen er ikke gyldig UTF-8 og kan ikke dekodes til en
          streng.
        </div>
      )}
    </div>
  );
}

type DecodeResult =
  | { kind: "ok"; bytes: Uint8Array; text: string }
  | { kind: "parse-error"; message: string }
  | { kind: "decode-error" };

function parseAndDecode(input: string): DecodeResult {
  const trimmed = input.trim();
  if (trimmed === "") return { kind: "ok", bytes: new Uint8Array(), text: "" };

  // Accept tokens separated by whitespace OR comma; also accept "0x.." prefix.
  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const out = new Uint8Array(tokens.length);
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i].toLowerCase();
    if (t.startsWith("0x")) t = t.slice(2);
    if (!/^[0-9a-f]{1,2}$/.test(t)) {
      return {
        kind: "parse-error",
        message: `"${tokens[i]}" er ikke en gyldig hex-byte (0–FF).`,
      };
    }
    out[i] = parseInt(t, 16);
  }

  try {
    // fatal: true makes invalid UTF-8 throw instead of returning U+FFFD.
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const text = decoder.decode(out);
    return { kind: "ok", bytes: out, text };
  } catch {
    return { kind: "decode-error" };
  }
}

// -- shared --------------------------------------------------------------------

function ByteView({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      <div className="font-mono text-sm tabular-nums break-all min-h-[1.25rem]">
        {value || <span className="text-muted-foreground italic">(tom)</span>}
      </div>
    </div>
  );
}
