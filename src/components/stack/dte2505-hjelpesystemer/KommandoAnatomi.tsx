import { useMemo, useState } from "react";
import { Scissors, Combine, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseCommand } from "@/lib/dte2505/hjelpesystemerEngine";

// ---------------------------------------------------------------------------
// Kommandolinjas anatomi — det aller første som må sitte, fordi resten av
// modulen bruker ordene kommando, opsjon og argument hele veien.
//
// Ingen tekstvegg: studenten skriver en linje, og linja deles opp visuelt
// mens hun skriver. Under ligger en liten sammenslå-demo for kortflagg.
// ---------------------------------------------------------------------------

const ROLE_STYLE: Record<string, { box: string; dot: string; name: string; blurb: string }> = {
  command: {
    box: "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    name: "Kommando",
    blurb: "Det første ordet. Navnet på programmet skallet skal finne og kjøre.",
  },
  short: {
    box: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    name: "Opsjon (kortform)",
    blurb: "Én bindestrek + én bokstav. Endrer HVORDAN kommandoen jobber. Flere kan slås sammen.",
  },
  long: {
    box: "border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
    name: "Opsjon (langform)",
    blurb: "To bindestreker + et helt ord. Samme jobb som kortformen, men lesbar. Kan aldri slås sammen.",
  },
  arg: {
    box: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    name: "Argument",
    blurb: "HVA kommandoen skal jobbe på: et filnavn, et brukernavn, et søkeord.",
  },
};

const PRESETS = [
  { cmd: "ls -lah /var/log", note: "Tre sammenslåtte kortflagg og ett argument." },
  { cmd: "ls --all --human-readable", note: "De samme flaggene i langform." },
  { cmd: "man 5 passwd", note: "Ingen flagg i det hele tatt — bare to argumenter." },
  { cmd: "chown -R kari:studenter /home/kari", note: "Ett flagg, to argumenter." },
  { cmd: "grep --ignore-case feil logg.txt", note: "Langflagg og to argumenter." },
];

export function KommandoAnatomi() {
  const [input, setInput] = useState("ls -lah /var/log");
  const [picked, setPicked] = useState<string | null>("command");

  const parsed = useMemo(() => parseCommand(input), [input]);

  const expanded = parsed.shortFlags.length > 1 ? parsed.shortFlags.map((f) => `-${f}`).join(" ") : null;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold mb-1">
        <Scissors className="h-4 w-4 text-brand" /> Del opp en kommandolinje
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Skriv hva du vil, eller velg et eksempel. Linja deles opp mens du skriver. Trykk på en bit for
        å få vite hva den heter.
      </p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        aria-label="Kommandolinje å dele opp"
        className="w-full rounded-md border bg-muted/40 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-brand/40"
      />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.cmd}
            onClick={() => setInput(p.cmd)}
            title={p.note}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[11px] hover:bg-accent",
              input === p.cmd && "border-brand bg-brand/10",
            )}
          >
            {p.cmd}
          </button>
        ))}
      </div>

      {/* Oppdelingen */}
      <div className="mt-4 rounded-lg border bg-muted/30 p-3">
        {parsed.pieces.length === 0 ? (
          <div className="text-xs text-muted-foreground">Skriv noe over, så deles det opp her.</div>
        ) : (
          <div className="flex flex-wrap items-end gap-2">
            {parsed.pieces.map((piece, i) => {
              const style = ROLE_STYLE[piece.role];
              return (
                <button
                  key={`${piece.text}-${i}`}
                  onClick={() => setPicked(piece.role)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border-2 px-3 py-1.5 font-mono text-sm transition-all",
                    style.box,
                    picked === piece.role && "ring-2 ring-offset-1 ring-offset-background ring-brand/50",
                  )}
                >
                  <span>{piece.text}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-70">{style.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {picked && ROLE_STYLE[picked] && (
          <div className="mt-3 flex items-start gap-2 border-t pt-3 text-xs">
            <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", ROLE_STYLE[picked].dot)} />
            <div>
              <span className="font-semibold">{ROLE_STYLE[picked].name}.</span>{" "}
              <span className="text-muted-foreground">{ROLE_STYLE[picked].blurb}</span>
            </div>
          </div>
        )}
        {!picked && (
          <div className="mt-3 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
            <MousePointerClick className="h-3 w-3" /> Trykk på en bit for forklaring.
          </div>
        )}
      </div>

      {/* Sammenslåing av kortflagg */}
      <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Combine className="h-3.5 w-3.5" /> Sammenslåing av kortflagg
        </div>
        {expanded ? (
          <div className="mt-2 font-mono text-sm">
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5">
              -{parsed.shortFlags.join("")}
            </span>
            <span className="mx-2 text-muted-foreground">er nøyaktig det samme som</span>
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5">{expanded}</span>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Skriv flere kortflagg etter hverandre — for eksempel <code className="font-mono">ls -lah</code> —
            så vises oppdelingen her.
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Dette virker fordi et kortflagg alltid er nøyaktig én bokstav, så <code className="font-mono">-lah</code>{" "}
          kan leses entydig. Langflagg er hele ord, og da finnes det ingen måte å se hvor det ene
          slutter og det neste begynner — derfor må <code className="font-mono">--all --human-readable</code>{" "}
          skrives hver for seg.
        </p>
      </div>
    </div>
  );
}
