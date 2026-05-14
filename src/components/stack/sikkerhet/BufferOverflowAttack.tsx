import { useMemo, useState } from "react";
import {
  Bug,
  ShieldCheck,
  Skull,
  RotateCcw,
  KeyRound,
  Dices,
} from "lucide-react";
import { Tex } from "@/components/Tex";

/**
 * Stack-frame layout viewer for a classic buffer overflow.
 *
 * Layout (high address top, low address bottom — visually, top of stack frame
 * is what we draw at the top, even though x86 stack grows toward lower
 * addresses — pedagogically clearer like this):
 *
 *   [ function args      ]   high
 *   [ SAVED RET ADDR     ]   ← target of overwrite
 *   [ SAVED FRAME PTR    ]
 *   [ CANARY (optional)  ]
 *   [ local buffer 16 B  ]   low  ← strcpy fills upward from here
 *
 * User types a string, we render it byte-by-byte into the buffer; once it
 * exceeds 16 bytes it spills over into the canary, then SFP, then RET.
 * The "Exploit input" preset writes a fake return address.
 */

const BUFFER_SIZE = 16;
const CANARY_SIZE = 4;
const SFP_SIZE = 4;
const RA_SIZE = 4;
const ARG_SIZE = 4;

// memory address layout (low at bottom). x86 stack grows down, frames are
// "high address → low address", so RA sits above buffer in memory.
const ADDR_BASE = 0x7fffffffe000;
const BUFFER_ADDR = ADDR_BASE;
const CANARY_ADDR = BUFFER_ADDR + BUFFER_SIZE;
const SFP_ADDR = CANARY_ADDR + CANARY_SIZE;
const RA_ADDR = SFP_ADDR + SFP_SIZE;
const ARG_ADDR = RA_ADDR + RA_SIZE;

const ORIG_RA = 0x004011a6; // pretend address of caller's next instruction
const ORIG_SFP = 0x7fffffffe040; // caller's saved frame pointer
const CANARY_VALUE = 0xdeadbeef >>> 0;
const SHELLCODE_ADDR = 0x7fffffffd010; // address that points into the buffer

function fmtAddr(n: number): string {
  return "0x" + n.toString(16).padStart(12, "0");
}

function fmtByteHex(b: number): string {
  return b.toString(16).padStart(2, "0");
}

function fmtByteAscii(b: number): string {
  if (b === 0) return "·";
  if (b >= 32 && b <= 126) return String.fromCharCode(b);
  return ".";
}

type Section = "buffer" | "canary" | "sfp" | "ra" | "arg";

type Byte = {
  /** absolute address */
  addr: number;
  value: number;
  /** which logical region this byte belongs to */
  region: Section;
  /** whether the byte has been overwritten by user input */
  overwritten: boolean;
};

// initial frame contents
function buildInitialFrame(): Byte[] {
  const bytes: Byte[] = [];
  // buffer: 0x00
  for (let i = 0; i < BUFFER_SIZE; i++) {
    bytes.push({ addr: BUFFER_ADDR + i, value: 0, region: "buffer", overwritten: false });
  }
  // canary
  for (let i = 0; i < CANARY_SIZE; i++) {
    bytes.push({
      addr: CANARY_ADDR + i,
      value: (CANARY_VALUE >>> (i * 8)) & 0xff,
      region: "canary",
      overwritten: false,
    });
  }
  // SFP
  for (let i = 0; i < SFP_SIZE; i++) {
    bytes.push({
      addr: SFP_ADDR + i,
      value: (ORIG_SFP >>> (i * 8)) & 0xff,
      region: "sfp",
      overwritten: false,
    });
  }
  // RA
  for (let i = 0; i < RA_SIZE; i++) {
    bytes.push({
      addr: RA_ADDR + i,
      value: (ORIG_RA >>> (i * 8)) & 0xff,
      region: "ra",
      overwritten: false,
    });
  }
  // arg
  for (let i = 0; i < ARG_SIZE; i++) {
    bytes.push({
      addr: ARG_ADDR + i,
      value: 0x42,
      region: "arg",
      overwritten: false,
    });
  }
  return bytes;
}

const PRESETS = {
  safe: { label: "Trygg input (8 byte)", value: "ABCDEFGH" },
  edge: { label: "Akkurat full (16 byte)", value: "ABCDEFGHIJKLMNOP" },
  smash: { label: "Overflow (24 byte)", value: "AAAAAAAAAAAAAAAAAAAAAAAA" },
};

/** Reconstruct a 32-bit value from 4 little-endian bytes. */
function leUint32(bytes: Byte[], startIdx: number): number {
  return (
    (bytes[startIdx].value |
      (bytes[startIdx + 1].value << 8) |
      (bytes[startIdx + 2].value << 16) |
      (bytes[startIdx + 3].value << 24)) >>>
    0
  );
}

export function BufferOverflowAttack() {
  const [input, setInput] = useState("Hello");
  const [canaryOn, setCanaryOn] = useState(false);
  const [aslrOn, setAslrOn] = useState(false);

  // Apply a strcpy-style copy: input fills buffer at BUFFER_ADDR upwards.
  // Overflow naturally bleeds into canary → SFP → RA in increasing-address order.
  const frame = useMemo<Byte[]>(() => {
    const frame = buildInitialFrame();
    // index 0 is the lowest address (buffer[0]); we fill upward (increasing index)
    const inputBytes = new TextEncoder().encode(input);
    // Sort frame by address ascending so the index aligns to addresses
    frame.sort((a, b) => a.addr - b.addr);
    for (let i = 0; i < inputBytes.length && i < frame.length; i++) {
      // Skip canary when canary is off — frame initially has canary as section
      // but we still write through it (that's the point).
      frame[i] = { ...frame[i], value: inputBytes[i], overwritten: true };
    }
    return frame;
  }, [input]);

  // Sort frame top-to-bottom: HIGH address first (top), low address last (bottom)
  const displayFrame = useMemo(
    () => [...frame].sort((a, b) => b.addr - a.addr),
    [frame],
  );

  // Status analysis
  const indexByAddr = (addr: number) =>
    frame.findIndex((b) => b.addr === addr);

  const canaryStart = indexByAddr(CANARY_ADDR);
  const sfpStart = indexByAddr(SFP_ADDR);
  const raStart = indexByAddr(RA_ADDR);

  const canaryVal = leUint32(frame, canaryStart);
  const sfpVal = leUint32(frame, sfpStart);
  const raVal = leUint32(frame, raStart);

  const canaryCorrupted = canaryVal !== CANARY_VALUE;
  const sfpCorrupted = sfpVal !== ORIG_SFP;
  const raCorrupted = raVal !== ORIG_RA;

  // Exploit detection: did the user successfully write the magic shellcode addr?
  const exploitedRaToShellcode = raVal === SHELLCODE_ADDR;

  function reset() {
    setInput("Hello");
    setCanaryOn(false);
    setAslrOn(false);
  }

  function applyPreset(p: keyof typeof PRESETS) {
    setInput(PRESETS[p].value);
  }

  function exploit() {
    // 16 bytes filler + 4 bytes (fake) canary + 4 bytes SFP + 4 bytes RA (little-endian shellcode addr)
    const filler = "A".repeat(16);
    const sfp = "\x40\xe0\xff\xff"; // any
    const ra = String.fromCharCode(
      SHELLCODE_ADDR & 0xff,
      (SHELLCODE_ADDR >> 8) & 0xff,
      (SHELLCODE_ADDR >> 16) & 0xff,
      (SHELLCODE_ADDR >>> 24) & 0xff,
    );
    if (canaryOn) {
      // need to know canary, otherwise exploit fails — show that
      const canary = String.fromCharCode(
        CANARY_VALUE & 0xff,
        (CANARY_VALUE >> 8) & 0xff,
        (CANARY_VALUE >> 16) & 0xff,
        (CANARY_VALUE >>> 24) & 0xff,
      );
      setInput(filler + canary + sfp + ra);
    } else {
      setInput(filler + sfp + ra);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Bug className="h-4 w-4 text-brand" />
            Stack-frame buffer overflow
          </h3>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          C-funksjonen{" "}
          <code className="font-mono">
            void f(char *arg) {`{`} char buf[16]; strcpy(buf, arg); {`}`}
          </code>
          {" "}har ingen lengde-sjekk. Skriv inn en input under og se hvordan
          den fyller stack-framen byte for byte.
        </p>

        <div className="rounded-lg border border-border bg-background p-3 mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-brand block mb-1.5">
            Input til strcpy
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full font-mono text-sm bg-background border border-border rounded-md px-2 py-1.5"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            Lengde: {input.length} byte (kapasitet: {BUFFER_SIZE} byte)
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => applyPreset(key as keyof typeof PRESETS)}
                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] hover:bg-muted"
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={exploit}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-2 py-1 text-[11px] hover:bg-destructive/20"
            >
              <Skull className="h-3 w-3" />
              Exploit: overskriv RA med shellcode-adresse
            </button>
          </div>
        </div>

        {/* Defenses */}
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          <label
            className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer text-xs ${
              canaryOn
                ? "border-success/50 bg-success/5"
                : "border-border bg-background"
            }`}
          >
            <input
              type="checkbox"
              checked={canaryOn}
              onChange={(e) => setCanaryOn(e.target.checked)}
              className="accent-success"
            />
            <KeyRound className="h-3.5 w-3.5 text-success" />
            <span>
              <strong>Stack canary</strong> aktivert — hemmelig verdi sjekkes
              før return
            </span>
          </label>
          <label
            className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer text-xs ${
              aslrOn ? "border-success/50 bg-success/5" : "border-border bg-background"
            }`}
          >
            <input
              type="checkbox"
              checked={aslrOn}
              onChange={(e) => setAslrOn(e.target.checked)}
              className="accent-success"
            />
            <Dices className="h-3.5 w-3.5 text-success" />
            <span>
              <strong>ASLR</strong> aktivert — stack-adresser randomiseres ved hver kjøring
            </span>
          </label>
        </div>

        {/* Frame layout */}
        <div className="rounded-lg border-2 border-border overflow-hidden bg-background">
          <div className="bg-muted/50 px-3 py-1.5 text-[11px] text-muted-foreground flex justify-between font-mono">
            <span>høy adresse (toppen av framen)</span>
            <span>verdi (LE)</span>
          </div>
          <div className="divide-y divide-border">
            {displayFrame.map((b, i) => {
              // Compute row label — only show header row at section start
              const sectionStart =
                i === 0 || displayFrame[i - 1].region !== b.region;
              const inactiveCanary = b.region === "canary" && !canaryOn;
              const bg = (() => {
                if (inactiveCanary)
                  return "bg-muted/20 text-muted-foreground/60";
                if (b.region === "ra")
                  return b.overwritten
                    ? "bg-destructive/15 ring-1 ring-inset ring-destructive/40"
                    : "bg-destructive/5";
                if (b.region === "sfp") return "bg-amber-500/5";
                if (b.region === "canary")
                  return canaryCorrupted && b.overwritten
                    ? "bg-amber-500/15"
                    : "bg-success/5";
                if (b.region === "buffer")
                  return b.overwritten ? "bg-brand/10" : "bg-card";
                return "bg-muted/30";
              })();
              return (
                <div
                  key={b.addr}
                  className={`flex items-center text-[10px] font-mono ${bg}`}
                >
                  {sectionStart && (
                    <div className="w-32 px-2 py-1 border-r border-border shrink-0 text-[10px] uppercase tracking-wider font-semibold">
                      {b.region === "ra"
                        ? "Saved RA"
                        : b.region === "sfp"
                          ? "Saved FP"
                          : b.region === "canary"
                            ? `Canary${canaryOn ? "" : " (av)"}`
                            : b.region === "buffer"
                              ? `Buffer ${BUFFER_SIZE} B`
                              : "Args"}
                    </div>
                  )}
                  {!sectionStart && (
                    <div className="w-32 px-2 py-1 border-r border-border shrink-0" />
                  )}
                  <div className="w-32 px-2 py-1 border-r border-border shrink-0 text-muted-foreground">
                    {fmtAddr(b.addr)}
                  </div>
                  <div className="flex-1 px-2 py-1 flex justify-between">
                    <span className="font-semibold">
                      {fmtByteHex(b.value)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {fmtByteAscii(b.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 space-y-2">
          {canaryOn && canaryCorrupted && (
            <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <strong className="text-success">Canary endret — angrep avbrutt</strong>
                <p className="text-xs text-muted-foreground mt-0.5">
                  __stack_chk_fail kalles før return. Programmet termineres,
                  kontrollflyten kapres aldri.
                </p>
              </div>
            </div>
          )}
          {!canaryOn && raCorrupted && exploitedRaToShellcode && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm flex items-start gap-2">
              <Skull className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <strong className="text-destructive">
                  Pwned — RA peker nå på{" "}
                  <Tex>{`\\mathtt{${fmtAddr(SHELLCODE_ADDR)}}`}</Tex>
                </strong>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Når funksjonen returnerer, hopper CPU til angriperens
                  shellcode i bufferen. Eksekusjon er nå under angriperens
                  kontroll — kall execve(&quot;/bin/sh&quot;) er klassikeren.
                  {aslrOn ? (
                    <>
                      {" "}
                      <strong className="text-amber-600 dark:text-amber-400">
                        Men ASLR er på:
                      </strong>{" "}
                      stack-adressen var ikke{" "}
                      <Tex>{`\\mathtt{${fmtAddr(SHELLCODE_ADDR)}}`}</Tex> ved
                      kjøring. Angrepet havner i ugyldig minne → SIGSEGV i
                      stedet for shell.
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          )}
          {!canaryOn && raCorrupted && !exploitedRaToShellcode && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm flex items-start gap-2">
              <Bug className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-amber-700 dark:text-amber-400">
                  RA korrupt — SIGSEGV ved return
                </strong>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Når funksjonen returnerer, hopper CPU til{" "}
                  <Tex>{`\\mathtt{${fmtAddr(raVal)}}`}</Tex> — sannsynligvis
                  ugyldig minne. Programmet krasjer. Ingen full kapring, men
                  fortsatt DoS.
                </p>
              </div>
            </div>
          )}
          {!raCorrupted && sfpCorrupted && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <strong className="text-amber-700 dark:text-amber-400">
                SFP korrupt
              </strong>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saved frame pointer er overskrevet, men RA er fortsatt intakt.
                Caller-framen blir &quot;rar&quot; men return går til riktig sted.
                Et nært-kall-overflow — én byte fra full RA-kapring.
              </p>
            </div>
          )}
          {!raCorrupted && !sfpCorrupted && !canaryCorrupted && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <div>
                <strong className="text-success">Trygg utfylling</strong>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Input passer i buffer. Ingen overflow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Frame summary table */}
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Felt</th>
                <th className="text-left font-semibold px-3 py-2">Original</th>
                <th className="text-left font-semibold px-3 py-2">Nå</th>
                <th className="text-left font-semibold px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">Buffer (start)</td>
                <td className="px-3 py-2 font-mono">{fmtAddr(BUFFER_ADDR)}</td>
                <td className="px-3 py-2 font-mono">{fmtAddr(BUFFER_ADDR)}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  fylles av strcpy
                </td>
              </tr>
              {canaryOn && (
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Canary</td>
                  <td className="px-3 py-2 font-mono">
                    0x{CANARY_VALUE.toString(16).padStart(8, "0")}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    0x{canaryVal.toString(16).padStart(8, "0")}
                  </td>
                  <td
                    className={`px-3 py-2 ${
                      canaryCorrupted ? "text-destructive" : "text-success"
                    }`}
                  >
                    {canaryCorrupted ? "ENDRET" : "OK"}
                  </td>
                </tr>
              )}
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono">Saved FP</td>
                <td className="px-3 py-2 font-mono">
                  0x{ORIG_SFP.toString(16).padStart(8, "0")}
                </td>
                <td className="px-3 py-2 font-mono">
                  0x{sfpVal.toString(16).padStart(8, "0")}
                </td>
                <td
                  className={`px-3 py-2 ${
                    sfpCorrupted ? "text-destructive" : "text-success"
                  }`}
                >
                  {sfpCorrupted ? "ENDRET" : "OK"}
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono font-semibold">Return addr</td>
                <td className="px-3 py-2 font-mono">
                  0x{ORIG_RA.toString(16).padStart(8, "0")}
                </td>
                <td className="px-3 py-2 font-mono">
                  0x{raVal.toString(16).padStart(8, "0")}
                </td>
                <td
                  className={`px-3 py-2 font-semibold ${
                    raCorrupted ? "text-destructive" : "text-success"
                  }`}
                >
                  {raCorrupted
                    ? exploitedRaToShellcode
                      ? "KAPRET → shellcode"
                      : "ENDRET → SEGV"
                    : "OK"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanations */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-success" />
            Stack canary
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Kompilatoren legger en hemmelig 4–8-byte verdi mellom buffer og
            saved RA ved funksjons-prolog. Før return sjekkes verdien.
            Endret → <code>__stack_chk_fail()</code> aborterer programmet.
          </p>
          <p className="text-xs text-muted-foreground">
            Aktiveres med <code className="font-mono">-fstack-protector</code>{" "}
            (GCC/Clang). For overflow må angriperen overskrive buffer + canary
            + SFP + RA, og kan ikke vite canary uten en separat info-lekkasje.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Dices className="h-4 w-4 text-success" />
            ASLR — Address Space Layout Randomization
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Kernel randomiserer adressene for stack, heap og bibliotek ved hver
            prosess-start. Selv om angriperen klarer å overskrive RA, vet de
            ikke <em>hvor</em> de skal hoppe.
          </p>
          <p className="text-xs text-muted-foreground">
            En tilfeldig adresse innebærer typisk{" "}
            <Tex>{"2^{28}"}</Tex>–<Tex>{"2^{30}"}</Tex>{" "}
            mulige posisjoner — uten en info-leak er gjetting praktisk talt
            umulig. Standard på Linux, macOS, Windows siden tidlig 2000-tallet.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
        <strong className="text-amber-700 dark:text-amber-400">Konteksten:</strong>{" "}
        klassiske C-funksjoner som <code>strcpy</code>, <code>gets</code>,{" "}
        <code>sprintf</code>, <code>scanf("%s")</code> validerer ikke
        destinasjonsstørrelse. Bruk i stedet <code>strncpy</code>,{" "}
        <code>fgets</code>, <code>snprintf</code>, eller flytt til moderne
        språk (Rust, Go, Java) der minnetilgang er sjekket.
      </div>
    </div>
  );
}
