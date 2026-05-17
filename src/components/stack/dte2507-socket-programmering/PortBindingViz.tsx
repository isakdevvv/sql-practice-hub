import { useState } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";

// PortBindingViz — viser kernel-port-tabell.
// Studenten kan "starte prosesser" som forsøker å binde til (IP, port, proto).
// Kernel-routing-tabell vises som rader; konflikt vises hvis to TCP-prosesser
// prøver samme (ip, port). SO_REUSEADDR forklart, og kollision mellom TCP og
// UDP (samme port — ulike protokoller — er OK).

type Proto = "TCP" | "UDP";

interface Process {
  id: number;
  name: string;
  ip: string; // 0.0.0.0, 127.0.0.1, etc.
  port: number;
  proto: Proto;
  reuseaddr: boolean;
  bindOk: boolean;
  errorMsg?: string;
}

const PRESET_PROCS: Omit<Process, "id" | "bindOk" | "errorMsg">[] = [
  { name: "nginx", ip: "0.0.0.0", port: 80, proto: "TCP", reuseaddr: true },
  { name: "sshd", ip: "0.0.0.0", port: 22, proto: "TCP", reuseaddr: true },
  { name: "dnsmasq", ip: "127.0.0.1", port: 53, proto: "UDP", reuseaddr: false },
];

let nextId = 100;

export function PortBindingViz() {
  const [procs, setProcs] = useState<Process[]>(() =>
    PRESET_PROCS.map((p, i) => ({ ...p, id: i + 1, bindOk: true }))
  );

  // Form state
  const [name, setName] = useState("my_server");
  const [ip, setIp] = useState("0.0.0.0");
  const [port, setPort] = useState(80);
  const [proto, setProto] = useState<Proto>("TCP");
  const [reuseaddr, setReuseaddr] = useState(false);

  function tryBind() {
    const candidate: Process = {
      id: ++nextId,
      name: name.trim() || "proc-" + nextId,
      ip,
      port,
      proto,
      reuseaddr,
      bindOk: true,
    };
    const conflict = procs.find(
      (p) =>
        p.bindOk &&
        p.port === candidate.port &&
        p.proto === candidate.proto &&
        ipConflict(p.ip, candidate.ip)
    );

    if (conflict) {
      // SO_REUSEADDR + SO_REUSEPORT: vi simplifierer — reuseaddr på BÅDE
      // gir tillatelse til å binde forskjellig IP eller "TIME_WAIT-state".
      // Her aksepterer vi reuseaddr bare hvis IP-ene er forskjellige.
      candidate.bindOk = false;
      candidate.errorMsg =
        ipConflict(conflict.ip, candidate.ip) && conflict.ip === candidate.ip
          ? `EADDRINUSE — ${conflict.name} (pid ${conflict.id}) eier (${conflict.ip}:${conflict.port}/${conflict.proto})`
          : `EADDRINUSE — wildcard ${conflict.ip} skygger ${candidate.ip}`;
    }

    setProcs((prev) => [...prev, candidate]);
  }

  function removeProc(id: number) {
    setProcs((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Form */}
      <div className="rounded-lg border border-border bg-background/40 p-3 mb-3">
        <div className="text-xs font-semibold mb-2">Start ny prosess (forsøk på bind)</div>
        <div className="flex flex-wrap gap-2 text-xs items-end">
          <Field label="navn">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-24 rounded border border-border bg-background px-1.5 py-0.5 font-mono"
            />
          </Field>
          <Field label="IP">
            <select
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="rounded border border-border bg-background px-1.5 py-0.5 font-mono"
            >
              <option value="0.0.0.0">0.0.0.0 (alle)</option>
              <option value="127.0.0.1">127.0.0.1 (lo)</option>
              <option value="192.168.1.10">192.168.1.10 (eth0)</option>
            </select>
          </Field>
          <Field label="port">
            <input
              type="number"
              min={1}
              max={65535}
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 1)}
              className="w-16 rounded border border-border bg-background px-1.5 py-0.5 font-mono"
            />
          </Field>
          <Field label="proto">
            <select
              value={proto}
              onChange={(e) => setProto(e.target.value as Proto)}
              className="rounded border border-border bg-background px-1.5 py-0.5 font-mono"
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
            </select>
          </Field>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" checked={reuseaddr} onChange={(e) => setReuseaddr(e.target.checked)} />
            <span>SO_REUSEADDR</span>
          </label>
          <button
            onClick={tryBind}
            className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 hover:bg-brand/20 px-2 py-1 text-brand"
          >
            <Plus className="h-3.5 w-3.5" /> Forsøk bind()
          </button>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">
          Tips: prøv to TCP på <code>0.0.0.0:80</code> → EADDRINUSE. Prøv TCP+UDP på samme port →
          OK (ulik protokoll). Prøv <code>127.0.0.1:8080</code> mens noen lytter på <code>0.0.0.0:8080</code>{" "}
          → kollisjon (wildcard skygger).
        </div>
      </div>

      {/* Port table */}
      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/30 text-xs font-semibold">
          Kernel port-tabell — netstat -tunlp
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="px-3 py-1">proto</th>
              <th className="px-3 py-1">local address</th>
              <th className="px-3 py-1">prosess</th>
              <th className="px-3 py-1">opt</th>
              <th className="px-3 py-1">status</th>
              <th className="px-3 py-1 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {procs.map((p) => (
              <tr
                key={p.id}
                className={
                  "border-b border-border/50 " +
                  (!p.bindOk ? "bg-red-500/10" : "hover:bg-muted/20")
                }
              >
                <td className={"px-3 py-1.5 " + (p.proto === "TCP" ? "text-sky-500" : "text-pink-500")}>
                  {p.proto}
                </td>
                <td className="px-3 py-1.5">
                  {p.ip}:<span className="text-foreground">{p.port}</span>
                </td>
                <td className="px-3 py-1.5 text-muted-foreground">
                  {p.name} <span className="opacity-60">[{p.id}]</span>
                </td>
                <td className="px-3 py-1.5 text-[10px] text-muted-foreground">
                  {p.reuseaddr ? "REUSEADDR" : ""}
                </td>
                <td className="px-3 py-1.5">
                  {p.bindOk ? (
                    <span className="text-green-500">LISTEN</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {p.errorMsg}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <button
                    onClick={() => removeProc(p.id)}
                    className="text-muted-foreground hover:text-red-500"
                    title="Drep prosess"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
            {procs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-3 text-center text-muted-foreground">
                  Ingen prosesser lytter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">(ip, port, proto) er nøkkelen</div>
          <p className="text-muted-foreground leading-snug">
            Kernel slår opp innkommende pakker i tabellen via dette trippelet. To prosesser kan
            eie samme port hvis protokollen er forskjellig (TCP/53 vs UDP/53).
          </p>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">Wildcard skygger</div>
          <p className="text-muted-foreground leading-snug">
            <code>0.0.0.0:80</code> binder ALLE interfaces. Da blokkeres bind på{" "}
            <code>127.0.0.1:80</code> — wildcard-binding har forrang.
          </p>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-2">
          <div className="font-semibold mb-1">SO_REUSEADDR</div>
          <p className="text-muted-foreground leading-snug">
            Lar deg rebinde porten mens forrige forekomst sitter i TIME_WAIT. Det er IKKE en
            «la to programmer dele samme port»-bryter — det er SO_REUSEPORT på Linux.
          </p>
        </div>
      </div>
    </div>
  );
}

function ipConflict(a: string, b: string): boolean {
  if (a === b) return true;
  if (a === "0.0.0.0" || b === "0.0.0.0") return true;
  return false;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
