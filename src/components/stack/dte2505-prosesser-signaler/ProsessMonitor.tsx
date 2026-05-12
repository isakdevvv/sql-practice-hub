import { useEffect, useRef, useState } from "react";

type Stat = "R" | "S" | "D" | "Z" | "T";

interface MockProc {
  pid: number;
  user: string;
  stat: Stat;
  cpu: number;
  mem: number;
  cmd: string;
  /** Set true once a SIGTERM has been delivered — process logs cleanup before going to Z. */
  terminating?: boolean;
  /** Once "exited", drop from list after a beat. */
  exited?: boolean;
}

const INITIAL: MockProc[] = [
  { pid: 1, user: "root", stat: "S", cpu: 0.0, mem: 0.5, cmd: "/sbin/init" },
  { pid: 412, user: "root", stat: "S", cpu: 0.1, mem: 0.8, cmd: "systemd-journald" },
  { pid: 901, user: "isak", stat: "S", cpu: 0.2, mem: 1.2, cmd: "bash" },
  { pid: 1042, user: "isak", stat: "R", cpu: 87.4, mem: 12.3, cmd: "python sim.py --iter 1e9" },
  { pid: 1087, user: "isak", stat: "S", cpu: 0.0, mem: 4.1, cmd: "vim notater.md" },
  { pid: 1133, user: "isak", stat: "D", cpu: 0.0, mem: 0.3, cmd: "dd if=/dev/sda of=backup.img" },
  { pid: 1201, user: "isak", stat: "T", cpu: 0.0, mem: 8.2, cmd: "node webserver.js" },
];

function statBadge(s: Stat): { label: string; bg: string } {
  switch (s) {
    case "R": return { label: "R · Running", bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" };
    case "S": return { label: "S · Sleeping", bg: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30" };
    case "D": return { label: "D · Disk wait", bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" };
    case "T": return { label: "T · Stopped", bg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30" };
    case "Z": return { label: "Z · Zombie", bg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" };
  }
}

const SIGNALS = [
  { name: "SIGTERM (15)", desc: "Be pent om å avslutte. Prosessen får rydde.", code: "term" as const },
  { name: "SIGKILL (9)", desc: "Drep nå. Kernel rydder. Prosessen får INGEN sjanse.", code: "kill" as const },
  { name: "SIGINT (2)", desc: "Ctrl+C — som SIGTERM på interaktive prosesser.", code: "term" as const },
  { name: "SIGHUP (1)", desc: "Terminalen lukket eller config-reload (daemoner).", code: "term" as const },
  { name: "SIGSTOP (19)", desc: "Pause. Kan ikke ignoreres. Bruk SIGCONT for å fortsette.", code: "stop" as const },
  { name: "SIGCONT (18)", desc: "Fortsett etter SIGSTOP.", code: "cont" as const },
];

export function ProsessMonitor() {
  const [procs, setProcs] = useState<MockProc[]>(INITIAL);
  const [selected, setSelected] = useState<number | null>(1042);
  const [log, setLog] = useState<string[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      for (const t of Object.values(timers.current)) clearTimeout(t);
    };
  }, []);

  function pushLog(line: string) {
    setLog((l) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...l].slice(0, 12));
  }

  function sendSignal(pid: number, sig: typeof SIGNALS[number]) {
    const proc = procs.find((p) => p.pid === pid);
    if (!proc) return;

    if (sig.code === "kill") {
      // SIGKILL: instant transition to Z then gone.
      pushLog(`kill -9 ${pid} → kernel killed ${proc.cmd} (PID ${pid}). Ingen cleanup.`);
      setProcs((ps) => ps.map((p) => (p.pid === pid ? { ...p, stat: "Z", cpu: 0, exited: true } : p)));
      timers.current[pid] = setTimeout(() => {
        setProcs((ps) => ps.filter((p) => p.pid !== pid));
        pushLog(`PID ${pid} reaped (Z → gone).`);
      }, 1200);
    } else if (sig.code === "term") {
      pushLog(`kill -15 ${pid} → SIGTERM sent to ${proc.cmd}.`);
      // Cleanup pretend takes 800ms — prosessen viser melding, så Z, så gone.
      timers.current[pid] = setTimeout(() => {
        pushLog(`PID ${pid}: "saving state, closing sockets..."`);
        setProcs((ps) => ps.map((p) => (p.pid === pid ? { ...p, terminating: true, cpu: 0 } : p)));
      }, 200);
      timers.current[pid] = setTimeout(() => {
        pushLog(`PID ${pid} exited cleanly (status 0).`);
        setProcs((ps) => ps.map((p) => (p.pid === pid ? { ...p, stat: "Z", exited: true } : p)));
      }, 1400);
      timers.current[pid] = setTimeout(() => {
        setProcs((ps) => ps.filter((p) => p.pid !== pid));
      }, 2400);
    } else if (sig.code === "stop") {
      pushLog(`kill -STOP ${pid} → PID ${pid} pauset.`);
      setProcs((ps) => ps.map((p) => (p.pid === pid ? { ...p, stat: "T", cpu: 0 } : p)));
    } else if (sig.code === "cont") {
      pushLog(`kill -CONT ${pid} → PID ${pid} fortsetter.`);
      setProcs((ps) => ps.map((p) => (p.pid === pid ? { ...p, stat: p.cmd.includes("python") ? "R" : "S", cpu: p.cmd.includes("python") ? 80 : 0.1 } : p)));
    }
  }

  function reset() {
    for (const t of Object.values(timers.current)) clearTimeout(t);
    timers.current = {};
    setProcs(INITIAL);
    setLog([]);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <div className="font-mono text-xs text-muted-foreground">$ ps aux | head</div>
          <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
            Reset
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs">
            <tr>
              <th className="text-left font-semibold px-3 py-2">PID</th>
              <th className="text-left font-semibold px-3 py-2">USER</th>
              <th className="text-left font-semibold px-3 py-2">STAT</th>
              <th className="text-left font-semibold px-3 py-2">%CPU</th>
              <th className="text-left font-semibold px-3 py-2">%MEM</th>
              <th className="text-left font-semibold px-3 py-2">CMD</th>
            </tr>
          </thead>
          <tbody>
            {procs.map((p) => {
              const b = statBadge(p.stat);
              return (
                <tr
                  key={p.pid}
                  onClick={() => setSelected(p.pid)}
                  className={`border-t border-border cursor-pointer hover:bg-muted/30 ${
                    selected === p.pid ? "bg-brand/10" : ""
                  } ${p.exited ? "opacity-60" : ""}`}
                >
                  <td className="px-3 py-2 font-mono">{p.pid}</td>
                  <td className="px-3 py-2 font-mono">{p.user}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${b.bg}`}>
                      {b.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">{p.cpu.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono">{p.mem.toFixed(1)}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {p.cmd}
                    {p.terminating && (
                      <span className="ml-2 text-amber-600 dark:text-amber-400 text-[10px]">
                        (saving state…)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm mb-2">
          Valgt PID: <span className="font-mono text-brand">{selected ?? "—"}</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {SIGNALS.map((s) => (
            <button
              key={s.name}
              onClick={() => selected != null && sendSignal(selected, s)}
              disabled={selected == null}
              className="text-left rounded-md border border-border p-2.5 hover:border-brand/40 disabled:opacity-50 transition-colors"
            >
              <div className="font-mono text-sm font-semibold text-brand">{s.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          <strong>Forskjell SIGTERM vs SIGKILL:</strong> SIGTERM kan fanges av prosessen — den får
          tid til å lagre, lukke filer, varsle barn. SIGKILL kan IKKE fanges; kernel river prosessen
          ut umiddelbart. Bruk alltid SIGTERM først; SIGKILL bare hvis den ikke svarer.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="font-semibold text-sm mb-2">Logg</div>
        {log.length === 0 ? (
          <p className="text-xs text-muted-foreground">Klikk en rad og send et signal for å se hva som skjer.</p>
        ) : (
          <ul className="font-mono text-xs space-y-0.5">
            {log.map((line, i) => (
              <li key={i} className="text-muted-foreground">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
