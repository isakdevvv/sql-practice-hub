import { useState } from "react";
import { Terminal, CornerDownLeft, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { runHelpCommand } from "@/lib/dte2505/hjelpesystemerEngine";

// ---------------------------------------------------------------------------
// Fri lekegrind. Ikke en oppgave — et sted å prøve ting mens du leser.
// Kjører mot det samme mock-systemet som måloppgavene bruker, så alt du
// oppdager her gjelder også der.
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "whatis printf",
  "apropos owner",
  "man 5 passwd",
  "type echo",
  "which cd",
  "whereis ls",
  "info coreutils",
  "passwd --help",
  "help cd",
  "ls /usr/share/doc",
];

interface Entry {
  cmd: string;
  lines: string[];
}

export function Hjelpekonsoll() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Entry[]>([
    { cmd: "whatis passwd", lines: runHelpCommand("whatis passwd").lines },
  ]);

  function run(cmd?: string) {
    const line = (cmd ?? input).trim();
    if (!line) return;
    setLog((l) => [...l.slice(-11), { cmd: line, lines: runHelpCommand(line).lines }]);
    setInput("");
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Terminal className="h-4 w-4 text-brand" /> Hjelpekonsoll
          <span className="text-xs font-normal text-muted-foreground">
            fri lekegrind — ingen fasit her
          </span>
        </div>
        <button
          onClick={() => setLog([])}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Eraser className="h-3 w-3" /> Tøm
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
        {log.length === 0 && <div className="text-zinc-500">Skriv en kommando under.</div>}
        {log.map((e, i) => (
          <div key={i} className={cn(i > 0 && "mt-3")}>
            <div className="text-emerald-400">
              <span className="text-zinc-500">student@linux:~$ </span>
              {e.cmd}
            </div>
            {e.lines.map((l, j) => (
              <div key={j} className={cn("whitespace-pre-wrap", l.startsWith("(") && "text-zinc-400")}>
                {l || " "}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t px-3 py-2">
        <span className="font-mono text-sm text-brand">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          spellCheck={false}
          placeholder="prøv man, apropos, whatis, which, type, whereis, info, --help"
          aria-label="Kommando"
          className="flex-1 bg-transparent font-mono text-sm outline-none"
        />
        <button
          onClick={() => run()}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"
        >
          Kjør <CornerDownLeft className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t px-3 py-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => run(s)}
            className="rounded-full border px-2 py-0.5 font-mono text-[11px] hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
