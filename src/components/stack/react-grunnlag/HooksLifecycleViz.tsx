// Visualiser useEffect-lifecycle: mount, dependency change, unmount, cleanup.
// Studenten styrer en "user id"-prop og kan toggle om komponenten er montert.
// Effekten animeres som en svingende pille i én av tre faser, og cleanup
// markeres som en egen rød pille rett før neste effekt-kjøring.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EventKind = "mount" | "effect" | "cleanup" | "unmount";

interface LogEntry {
  id: number;
  kind: EventKind;
  text: string;
  t: number;
}

const COLOR: Record<EventKind, string> = {
  mount: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
  effect: "bg-sky-500/15 text-sky-700 border-sky-500/40 dark:text-sky-300",
  cleanup: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300",
  unmount: "bg-rose-500/15 text-rose-700 border-rose-500/40 dark:text-rose-300",
};

export function HooksLifecycleViz() {
  const [mounted, setMounted] = useState(true);
  const [userId, setUserId] = useState(1);
  const [log, setLog] = useState<LogEntry[]>([]);
  const nextId = useRef(0);

  function push(kind: EventKind, text: string) {
    nextId.current += 1;
    const entry: LogEntry = { id: nextId.current, kind, text, t: Date.now() };
    setLog((cur) => [...cur, entry].slice(-12));
  }

  // Re-spille lifecycle som narrativ: når mounted toggles eller userId endrer seg,
  // logg mount/effect/cleanup/unmount-events i riktig rekkefølge.
  const prevUserId = useRef<number | null>(null);
  const prevMounted = useRef<boolean | null>(null);

  useEffect(() => {
    const wasMounted = prevMounted.current;
    const prevId = prevUserId.current;

    if (wasMounted === null) {
      // Første render
      push("mount", `Bruker(id=${userId}) mountet`);
      push("effect", `useEffect kjører — fetch /api/users/${userId}`);
    } else if (!wasMounted && mounted) {
      push("mount", `Bruker(id=${userId}) re-mountet`);
      push("effect", `useEffect kjører — fetch /api/users/${userId}`);
    } else if (wasMounted && !mounted) {
      push("cleanup", `cleanup() kjører — avbryter fetch`);
      push("unmount", `Bruker unmountet`);
    } else if (mounted && prevId !== userId) {
      push("cleanup", `cleanup() kjører — avbryter forrige fetch (id=${prevId})`);
      push("effect", `useEffect kjører — fetch /api/users/${userId}`);
    }

    prevUserId.current = userId;
    prevMounted.current = mounted;
  }, [userId, mounted]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-3 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          useEffect-lifecycle
        </span>
        <span className="text-[11px] text-muted-foreground">
          dependency: <code className="font-mono">[id]</code>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Venstre: kode + kontroller */}
        <div className="p-4 border-b md:border-b-0 md:border-r border-border bg-slate-950 text-slate-100">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre-wrap">
{`function Bruker({ id }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let avbrutt = false;
    fetch("/api/users/" + id).then(...);
    return () => { avbrutt = true; };
  }, [id]);

  return <p>...</p>;
}`}
          </pre>
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <div className="text-slate-400 mb-1">Forelder rendrer:</div>
              <div className="font-mono text-slate-100">
                {mounted ? `<Bruker id={${userId}} />` : `{/* Bruker ikke i treet */}`}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400">Endre id:</span>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => mounted && setUserId(n)}
                  disabled={!mounted}
                  className={cn(
                    "rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                    userId === n && mounted
                      ? "border-sky-400 bg-sky-500/30 text-sky-100"
                      : "border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-400",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMounted((m) => !m)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                  mounted
                    ? "border-rose-400 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
                    : "border-emerald-400 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30",
                )}
              >
                {mounted ? "Unmount" : "Mount"}
              </button>
              <button
                type="button"
                onClick={() => setLog([])}
                className="rounded-md border border-slate-600 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200 hover:border-slate-400"
              >
                Tøm logg
              </button>
            </div>
          </div>
        </div>

        {/* Høyre: event-logg */}
        <div className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            React-kjøretid
          </div>
          <div className="space-y-1.5 min-h-[220px]">
            {log.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">
                Klikk på en id eller toggle mount for å se lifecycle.
              </div>
            ) : (
              log.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-mono transition-opacity animate-in fade-in slide-in-from-left-1",
                    COLOR[entry.kind],
                  )}
                >
                  <span className="uppercase text-[10px] tracking-wider mr-2 opacity-70">
                    {entry.kind}
                  </span>
                  {entry.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        Legg merke til at <strong>cleanup</strong> kjører <em>før</em> neste effekt — ikke etter. Det er
        hvordan React garanterer at det aldri er to aktive fetch-er samtidig for samme komponent.
      </div>
    </div>
  );
}
