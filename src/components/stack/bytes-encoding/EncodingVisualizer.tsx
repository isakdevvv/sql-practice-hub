import { useMemo, useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv encoding-visualisering. Fire moduser:
//   1. ASCII  — char | dec | hex | bin per tegn
//   2. UTF-8  — kodepunkt + 1–4 bytes med fargede ledende-biter
//   3. Base64 — bytes → 24-bit grupper → 6-bit chunks → alfabet-oppslag
//   4. Hex / endianness — 32-bit int som big- vs little-endian
// --------------------------------------------------------------------------

type Mode = "ascii" | "utf8" | "base64" | "endian";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "ascii", label: "ASCII", sub: "én byte per tegn (0–127)" },
  { id: "utf8", label: "UTF-8", sub: "1–4 bytes per kodepunkt" },
  { id: "base64", label: "Base64", sub: "3 bytes → 4 tegn" },
  { id: "endian", label: "Hex / endianness", sub: "32-bit big vs little-endian" },
];

const MODE_NOTE: Record<Mode, string> = {
  ascii: "Hver byte har øverste bit = 0. Det er hele poenget med ASCII — 7 bits, 128 tegn.",
  utf8: "Ledende biter forteller hvor mange bytes tegnet bruker. Resten er nyttelast.",
  base64: "Tre bytes (24 bits) deles i fire 6-bit-grupper. Hver gruppe slås opp i Base64-alfabetet.",
  endian: "Samme tall, motsatt rekkefølge på bytene. x86 og ARM bruker little-endian — nettverk bruker big-endian.",
};

export function EncodingVisualizer() {
  const [mode, setMode] = useState<Mode>("ascii");

  // Per-modus input (holdes separat så bytte ikke nullstiller alt)
  const [asciiInput, setAsciiInput] = useState("Hei!");
  const [utf8Input, setUtf8Input] = useState("hei æ 漢 🚀");
  const [base64Input, setBase64Input] = useState("Man");
  const [endianInput, setEndianInput] = useState("305419896"); // 0x12345678
  const [endianSigned, setEndianSigned] = useState(false);

  const reset = () => {
    if (mode === "ascii") setAsciiInput("Hei!");
    if (mode === "utf8") setUtf8Input("hei æ 漢 🚀");
    if (mode === "base64") setBase64Input("Man");
    if (mode === "endian") {
      setEndianInput("305419896");
      setEndianSigned(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Encoding live — se hva som faktisk havner i bytene
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Tilbakestill
          </button>
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
        {mode === "ascii" && (
          <AsciiView input={asciiInput} setInput={setAsciiInput} />
        )}
        {mode === "utf8" && (
          <Utf8View input={utf8Input} setInput={setUtf8Input} />
        )}
        {mode === "base64" && (
          <Base64View input={base64Input} setInput={setBase64Input} />
        )}
        {mode === "endian" && (
          <EndianView
            input={endianInput}
            setInput={setEndianInput}
            signed={endianSigned}
            setSigned={setEndianSigned}
          />
        )}
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/20">
        <span className="text-xs text-muted-foreground italic">{MODE_NOTE[mode]}</span>
      </div>
    </div>
  );
}

// ===========================================================================
// ASCII
// ===========================================================================

function AsciiView({
  input,
  setInput,
}: {
  input: string;
  setInput: (v: string) => void;
}) {
  // Filtrér til ASCII (kode 0–127) ved input. Vis advarsel hvis brukeren skriver ikke-ASCII.
  const [hadNonAscii, setHadNonAscii] = useState(false);

  const onChange = (v: string) => {
    let dropped = false;
    let cleaned = "";
    for (const ch of v) {
      const c = ch.charCodeAt(0);
      if (c > 127) dropped = true;
      else cleaned += ch;
    }
    setHadNonAscii(dropped);
    setInput(cleaned);
  };

  const chars = [...input];

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="ascii-input"
          className="block text-xs text-muted-foreground mb-1"
        >
          Skriv ASCII-tekst (a–z, A–Z, 0–9, vanlige tegn)
        </label>
        <input
          id="ascii-input"
          type="text"
          value={input}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
          placeholder="Hei!"
        />
        {hadNonAscii && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              ASCII støtter bare 128 tegn (kode 0–127). Ikke-ASCII-tegn ble fjernet
              — bytt til UTF-8-modus for å se hvordan{" "}
              <code className="font-mono">æ ø å 漢 🚀</code> kodes.
            </span>
          </div>
        )}
      </div>

      {chars.length === 0 ? (
        <div className="text-sm text-muted-foreground italic py-6 text-center">
          Skriv noe ovenfor for å se bytene.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="px-2 py-1 font-medium">tegn</th>
                <th className="px-2 py-1 font-medium">desimal</th>
                <th className="px-2 py-1 font-medium">hex</th>
                <th className="px-2 py-1 font-medium">binær (8 bits)</th>
              </tr>
            </thead>
            <tbody>
              {chars.map((ch, i) => {
                const code = ch.charCodeAt(0);
                const hex = code.toString(16).toUpperCase().padStart(2, "0");
                const bin = code.toString(2).padStart(8, "0");
                const label =
                  ch === " "
                    ? "␣"
                    : ch === "\t"
                      ? "⇥"
                      : ch === "\n"
                        ? "⏎"
                        : ch;
                return (
                  <tr
                    key={i}
                    className="border-t border-border/50 hover:bg-muted/30"
                  >
                    <td className="px-2 py-1.5 text-base font-bold">{label}</td>
                    <td className="px-2 py-1.5">{code}</td>
                    <td className="px-2 py-1.5 text-brand">0x{hex}</td>
                    <td className="px-2 py-1.5">
                      <span className="text-muted-foreground">{bin[0]}</span>
                      <span className="text-brand">{bin.slice(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 text-xs text-muted-foreground">
            Den øverste biten (grå) er alltid 0 i ASCII — det er derfor det heter
            "7-bit". Bare 128 tegn passer.
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// UTF-8
// ===========================================================================

type Utf8CharInfo = {
  char: string;
  codePoint: number;
  bytes: number[];
  /** For hver byte: hvor mange ledende-bits er pattern (resten er payload) */
  patternBits: number[];
};

function utf8Encode(codePoint: number): { bytes: number[]; patternBits: number[] } {
  if (codePoint < 0x80) {
    return { bytes: [codePoint], patternBits: [1] }; // 0xxxxxxx
  }
  if (codePoint < 0x800) {
    return {
      bytes: [0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f)],
      patternBits: [3, 2], // 110xxxxx, 10xxxxxx
    };
  }
  if (codePoint < 0x10000) {
    return {
      bytes: [
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      ],
      patternBits: [4, 2, 2], // 1110xxxx, 10xxxxxx, 10xxxxxx
    };
  }
  return {
    bytes: [
      0xf0 | (codePoint >> 18),
      0x80 | ((codePoint >> 12) & 0x3f),
      0x80 | ((codePoint >> 6) & 0x3f),
      0x80 | (codePoint & 0x3f),
    ],
    patternBits: [5, 2, 2, 2], // 11110xxx, 10xxxxxx × 3
  };
}

function Utf8View({
  input,
  setInput,
}: {
  input: string;
  setInput: (v: string) => void;
}) {
  const chars: Utf8CharInfo[] = useMemo(() => {
    const out: Utf8CharInfo[] = [];
    for (const ch of input) {
      const cp = ch.codePointAt(0);
      if (cp === undefined) continue;
      const { bytes, patternBits } = utf8Encode(cp);
      out.push({ char: ch, codePoint: cp, bytes, patternBits });
    }
    return out;
  }, [input]);

  const totalBytes = chars.reduce((s, c) => s + c.bytes.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="utf8-input"
          className="block text-xs text-muted-foreground mb-1"
        >
          Skriv hva som helst — bokstaver, æøå, kinesisk, emoji
        </label>
        <input
          id="utf8-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
          placeholder="hei æ 漢 🚀"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="text-foreground">{input.length}</span> JS-units,{" "}
          <span className="text-foreground">{chars.length}</span> kodepunkter,{" "}
          <span className="text-foreground">{totalBytes}</span> bytes i UTF-8
        </div>
      </div>

      {chars.length === 0 ? (
        <div className="text-sm text-muted-foreground italic py-6 text-center">
          Skriv noe ovenfor.
        </div>
      ) : (
        <div className="space-y-3">
          {chars.map((c, i) => (
            <Utf8CharRow key={i} info={c} />
          ))}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span className="inline-block w-3 h-3 align-middle rounded-sm bg-orange-500/70 mr-1" />
            Ledende bits (pattern) —{" "}
            <span className="inline-block w-3 h-3 align-middle rounded-sm bg-brand/70 mx-1" />
            Payload-bits (selve kodepunktet)
          </div>
        </div>
      )}
    </div>
  );
}

function Utf8CharRow({ info }: { info: Utf8CharInfo }) {
  const cpHex = info.codePoint.toString(16).toUpperCase().padStart(4, "0");
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-baseline gap-3 mb-2">
        <span className="text-2xl font-bold leading-none">
          {info.char === " " ? "␣" : info.char}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          U+{cpHex}
        </span>
        <span className="text-xs text-muted-foreground">
          (dec {info.codePoint}) — {info.bytes.length} byte
          {info.bytes.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {info.bytes.map((b, i) => (
          <ByteBox
            key={i}
            byte={b}
            patternBits={info.patternBits[i]}
          />
        ))}
      </div>
    </div>
  );
}

function ByteBox({ byte, patternBits }: { byte: number; patternBits: number }) {
  const hex = byte.toString(16).toUpperCase().padStart(2, "0");
  const bin = byte.toString(2).padStart(8, "0");
  return (
    <div className="rounded-md border border-border bg-background overflow-hidden font-mono text-xs">
      <div className="px-2 py-1 bg-muted/40 text-center font-semibold">
        0x{hex}
      </div>
      <div className="px-2 py-1.5 tracking-wider text-[11px]">
        {bin.split("").map((bit, i) => (
          <span
            key={i}
            className={
              i < patternBits
                ? "text-orange-500 font-bold"
                : "text-brand font-bold"
            }
          >
            {bit}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Base64
// ===========================================================================

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

type Base64Group = {
  /** Inntil 3 bytes inn */
  inBytes: number[];
  /** Inntil 4 6-bit-tall ut (eller -1 for padding) */
  outIndices: number[];
  /** Hvor mange faktiske byte-bits er meningsfulle (8, 16 eller 24) */
  validBits: number;
};

function Base64View({
  input,
  setInput,
}: {
  input: string;
  setInput: (v: string) => void;
}) {
  // Encode tekst som UTF-8 først, så Base64
  const bytes = useMemo(() => {
    const enc = new TextEncoder();
    return Array.from(enc.encode(input));
  }, [input]);

  const groups: Base64Group[] = useMemo(() => {
    const out: Base64Group[] = [];
    for (let i = 0; i < bytes.length; i += 3) {
      const chunk = bytes.slice(i, i + 3);
      const validBits = chunk.length * 8;
      // Pad til 24 bits (3 bytes) i variabelen, men husk hvor mange som er reelle
      const b0 = chunk[0] ?? 0;
      const b1 = chunk[1] ?? 0;
      const b2 = chunk[2] ?? 0;
      const combined = (b0 << 16) | (b1 << 8) | b2;
      const sixBits = [
        (combined >> 18) & 0x3f,
        (combined >> 12) & 0x3f,
        (combined >> 6) & 0x3f,
        combined & 0x3f,
      ];
      // Bestem hvor mange output-tegn som er gyldige (resten er padding)
      let numOut = 4;
      if (chunk.length === 1) numOut = 2;
      else if (chunk.length === 2) numOut = 3;
      const outIndices = sixBits.map((v, idx) => (idx < numOut ? v : -1));
      out.push({ inBytes: chunk, outIndices, validBits });
    }
    return out;
  }, [bytes]);

  const encoded = useMemo(() => {
    return groups
      .map((g) =>
        g.outIndices.map((idx) => (idx === -1 ? "=" : BASE64_ALPHABET[idx])).join("")
      )
      .join("");
  }, [groups]);

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="b64-input"
          className="block text-xs text-muted-foreground mb-1"
        >
          Skriv tekst — den UTF-8-kodes først, så Base64-encodes
        </label>
        <input
          id="b64-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
          placeholder="Man"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          {bytes.length} input-bytes →{" "}
          <span className="text-foreground">{encoded.length}</span> Base64-tegn
          {bytes.length > 0 && bytes.length % 3 !== 0 && (
            <>
              {" "}
              (med{" "}
              <span className="text-orange-500 font-semibold">
                {3 - (bytes.length % 3)} padding
              </span>
              )
            </>
          )}
        </div>
      </div>

      {bytes.length === 0 ? (
        <div className="text-sm text-muted-foreground italic py-6 text-center">
          Skriv noe for å se Base64-kodingen steg for steg.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g, i) => (
            <Base64GroupView key={i} group={g} index={i} />
          ))}

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground mb-1">
              Ferdig Base64-streng
            </div>
            <div className="font-mono text-sm break-all">
              {encoded.split("").map((c, i) => (
                <span
                  key={i}
                  className={c === "=" ? "text-orange-500 font-bold" : "text-brand"}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Base64GroupView({ group, index }: { group: Base64Group; index: number }) {
  // Bygg 24-bit-strengen visuelt
  const b0 = group.inBytes[0] ?? 0;
  const b1 = group.inBytes[1] ?? 0;
  const b2 = group.inBytes[2] ?? 0;
  const bin = [
    b0.toString(2).padStart(8, "0"),
    b1.toString(2).padStart(8, "0"),
    b2.toString(2).padStart(8, "0"),
  ].join("");

  const sixGroups = [
    bin.slice(0, 6),
    bin.slice(6, 12),
    bin.slice(12, 18),
    bin.slice(18, 24),
  ];

  return (
    <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
      <div className="text-xs text-muted-foreground">
        Gruppe {index + 1} — {group.inBytes.length} byte
        {group.inBytes.length === 1 ? "" : "s"} inn
      </div>

      {/* Input-bytes */}
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2].map((i) => {
          const present = i < group.inBytes.length;
          const b = group.inBytes[i] ?? 0;
          const hex = b.toString(16).toUpperCase().padStart(2, "0");
          const binStr = b.toString(2).padStart(8, "0");
          return (
            <div
              key={i}
              className={`rounded-md border font-mono text-xs overflow-hidden ${
                present
                  ? "border-border bg-background"
                  : "border-dashed border-orange-500/40 bg-orange-500/5 opacity-60"
              }`}
            >
              <div className="px-2 py-1 bg-muted/40 text-center font-semibold">
                {present ? `0x${hex}` : "—"}
              </div>
              <div className="px-2 py-1.5 tracking-wider text-[11px] text-brand">
                {present ? binStr : "00000000"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 24-bit kombinert, delt i 4 × 6 */}
      <div className="font-mono text-[11px] tracking-wider flex flex-wrap gap-1 items-center">
        <span className="text-muted-foreground">24-bit → 6-bit:</span>
        {sixGroups.map((g, i) => {
          const isValid = group.outIndices[i] !== -1;
          return (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded ${
                isValid
                  ? "bg-brand/10 text-brand"
                  : "bg-orange-500/10 text-orange-500"
              }`}
            >
              {g}
            </span>
          );
        })}
      </div>

      {/* Output-tegn */}
      <div className="flex flex-wrap gap-2">
        {group.outIndices.map((idx, i) => {
          if (idx === -1) {
            return (
              <div
                key={i}
                className="rounded-md border border-dashed border-orange-500/50 bg-orange-500/10 px-3 py-1.5 font-mono text-sm text-orange-500 font-bold"
                title="padding"
              >
                =
              </div>
            );
          }
          return (
            <div
              key={i}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-center"
            >
              <div className="text-muted-foreground text-[10px]">
                {idx.toString().padStart(2, "0")} = {idx.toString(2).padStart(6, "0")}
              </div>
              <div className="text-brand font-bold text-sm">
                {BASE64_ALPHABET[idx]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// Hex / Endianness
// ===========================================================================

function EndianView({
  input,
  setInput,
  signed,
  setSigned,
}: {
  input: string;
  setInput: (v: string) => void;
  signed: boolean;
  setSigned: (v: boolean) => void;
}) {
  // Parse input — godta desimal eller 0x-hex
  const parsed = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { ok: false as const };
    let n: number;
    if (/^-?0x[0-9a-f]+$/i.test(trimmed)) {
      n = parseInt(trimmed.replace(/^-?0x/i, ""), 16);
      if (trimmed.startsWith("-")) n = -n;
    } else if (/^-?\d+$/.test(trimmed)) {
      n = parseInt(trimmed, 10);
    } else {
      return { ok: false as const };
    }
    if (!Number.isFinite(n)) return { ok: false as const };

    const MIN = signed ? -2147483648 : 0;
    const MAX = signed ? 2147483647 : 4294967295;
    if (n < MIN || n > MAX) {
      return { ok: false as const, oor: true };
    }

    // Få uint32-representasjon (2-er-komplement for negative)
    const u32 = (n >>> 0) & 0xffffffff;
    const bytes = [
      (u32 >>> 24) & 0xff,
      (u32 >>> 16) & 0xff,
      (u32 >>> 8) & 0xff,
      u32 & 0xff,
    ];
    return { ok: true as const, value: n, u32, bytes };
  }, [input, signed]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label
            htmlFor="endian-input"
            className="block text-xs text-muted-foreground mb-1"
          >
            32-bit tall (desimal eller 0x-hex)
          </label>
          <input
            id="endian-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-mono"
            placeholder="305419896 eller 0x12345678"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Tolkning:</span>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setSigned(false)}
              className={`px-3 py-1.5 text-xs font-medium ${
                !signed ? "bg-brand text-brand-foreground" : "bg-background hover:bg-muted"
              }`}
            >
              unsigned
            </button>
            <button
              type="button"
              onClick={() => setSigned(true)}
              className={`px-3 py-1.5 text-xs font-medium border-l border-border ${
                signed ? "bg-brand text-brand-foreground" : "bg-background hover:bg-muted"
              }`}
            >
              signed
            </button>
          </div>
        </div>
      </div>

      {!parsed.ok ? (
        <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3 text-xs text-orange-600 dark:text-orange-400">
          <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />
          {"oor" in parsed
            ? `Tallet er utenfor ${signed ? "signed 32-bit (-2^31 .. 2^31-1)" : "unsigned 32-bit (0 .. 2^32-1)"}.`
            : "Kan ikke tolke som tall. Prøv f.eks. 305419896 eller 0x12345678."}
        </div>
      ) : (
        <>
          <div className="font-mono text-xs text-muted-foreground">
            Verdi: <span className="text-foreground">{parsed.value}</span> ={" "}
            <span className="text-brand">
              0x{parsed.u32.toString(16).toUpperCase().padStart(8, "0")}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <EndianLayout
              title="Big-endian"
              sub="høyest-signifikant byte først (nettverk, Java, gamle Mac)"
              bytes={parsed.bytes}
              labels={["MSB", "", "", "LSB"]}
              offsets={[0, 1, 2, 3]}
            />
            <EndianLayout
              title="Little-endian"
              sub="lavest-signifikant byte først (x86, ARM, de fleste maskiner)"
              bytes={[...parsed.bytes].reverse()}
              labels={["LSB", "", "", "MSB"]}
              offsets={[0, 1, 2, 3]}
            />
          </div>

          <div className="rounded-md border border-border bg-muted/20 p-3 text-xs space-y-1 font-mono">
            <div>
              <span className="text-muted-foreground">Python:</span>{" "}
              <span className="text-brand">
                {`(${parsed.value}).to_bytes(4, "big")`}
              </span>{" "}
              →{" "}
              <span>
                b'
                {parsed.bytes
                  .map((b) => "\\x" + b.toString(16).toLowerCase().padStart(2, "0"))
                  .join("")}
                '
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Python:</span>{" "}
              <span className="text-brand">
                {`(${parsed.value}).to_bytes(4, "little")`}
              </span>{" "}
              →{" "}
              <span>
                b'
                {[...parsed.bytes]
                  .reverse()
                  .map((b) => "\\x" + b.toString(16).toLowerCase().padStart(2, "0"))
                  .join("")}
                '
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EndianLayout({
  title,
  sub,
  bytes,
  labels,
  offsets,
}: {
  title: string;
  sub: string;
  bytes: number[];
  labels: string[];
  offsets: number[];
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/10 p-3">
      <div className="text-sm font-semibold mb-0.5">{title}</div>
      <div className="text-xs text-muted-foreground mb-3">{sub}</div>
      <div className="flex flex-wrap gap-1.5">
        {bytes.map((b, i) => {
          const hex = b.toString(16).toUpperCase().padStart(2, "0");
          const bin = b.toString(2).padStart(8, "0");
          return (
            <div
              key={i}
              className="rounded-md border border-border bg-background font-mono text-[11px] flex-1 min-w-[64px]"
            >
              <div className="px-1 py-0.5 bg-muted/40 text-center text-[9px] text-muted-foreground">
                offset +{offsets[i]} {labels[i] && `(${labels[i]})`}
              </div>
              <div className="px-1 py-1 text-center font-semibold text-brand">
                0x{hex}
              </div>
              <div className="px-1 py-0.5 text-center text-[9px] tracking-wider">
                {bin}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
