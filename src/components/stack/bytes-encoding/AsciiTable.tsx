/**
 * A small grid of common ASCII characters with their hex/decimal values.
 * Not the full table — just enough to show the pattern.
 */
const COMMON_CHARS: Array<{ char: string; label?: string }> = [
  { char: " ", label: "(mellomrom)" },
  { char: "!" },
  { char: "0" },
  { char: "1" },
  { char: "9" },
  { char: "A" },
  { char: "B" },
  { char: "Z" },
  { char: "a" },
  { char: "b" },
  { char: "z" },
  { char: "?" },
];

export function AsciiTable() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {COMMON_CHARS.map(({ char, label }) => {
          const code = char.charCodeAt(0);
          const hex = code.toString(16).toUpperCase().padStart(2, "0");
          return (
            <div
              key={char}
              className="rounded-md border border-border bg-background px-3 py-2 flex items-center justify-between gap-2"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-lg font-bold leading-none">
                  {label ? "·" : char}
                </span>
                {label && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {label}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-xs tabular-nums text-brand">
                  0x{hex}
                </div>
                <div className="text-[10px] tabular-nums text-muted-foreground">
                  = {code}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-muted-foreground leading-relaxed space-y-1">
        <p>
          Mønsteret: <code className="font-mono">'A'</code> til{" "}
          <code className="font-mono">'Z'</code> ligger på 65–90 (0x41–0x5A),
          små bokstaver <code className="font-mono">'a'</code>–
          <code className="font-mono">'z'</code> på 97–122 (0x61–0x7A), og
          siffer <code className="font-mono">'0'</code>–
          <code className="font-mono">'9'</code> på 48–57 (0x30–0x39).
        </p>
        <p>
          ASCII bruker bare 7 bits (0–127). Det dekker engelsk, men ikke{" "}
          <code className="font-mono">æ</code>, <code className="font-mono">ø</code>,{" "}
          <code className="font-mono">å</code> — eller noe annet språk.
        </p>
      </div>
    </div>
  );
}
