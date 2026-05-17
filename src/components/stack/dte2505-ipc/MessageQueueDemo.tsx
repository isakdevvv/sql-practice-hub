import { useState } from "react";
import { Send, Trash2, RotateCcw, Inbox, Skull, HardDrive } from "lucide-react";

// ---------------------------------------------------------------------------
// MessageQueueDemo — POSIX-aktig mq med prioritet + valgfri persistens.
//
// Modellerer:
//   - 3 produsenter (P1, P2, P3) som hver kan sende med prio 0/5/9
//   - 2 konsumenter som tar fra hodet (høyest prio først, FIFO i prio-klassen)
//     eller filtrerer på prio
//   - Persistens-toggle: når på, vises at meldinger overlever en prosess-kræsj.
//     Når av, vises at det ikke skiller seg fra en pipe (alt mistet).
//
// Hovedinnsikten: prio gjør at viktige meldinger «hopper foran», og at en mq
// frakopler sender fra mottaker i tid (i motsetning til pipe).
// ---------------------------------------------------------------------------

type Prio = 0 | 5 | 9;
type Producer = "P1" | "P2" | "P3";

type Msg = {
  id: number;
  from: Producer;
  prio: Prio;
  payload: string;
};

const MAX_QUEUE = 10;

const PRIO_COLORS: Record<Prio, { bg: string; border: string; text: string; label: string }> = {
  0: {
    bg: "bg-slate-500/15",
    border: "border-slate-500/40",
    text: "text-slate-700 dark:text-slate-300",
    label: "lav",
  },
  5: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/40",
    text: "text-sky-700 dark:text-sky-300",
    label: "normal",
  },
  9: {
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "høy",
  },
};

const PRODUCER_COLORS: Record<Producer, string> = {
  P1: "text-emerald-700 dark:text-emerald-300",
  P2: "text-violet-700 dark:text-violet-300",
  P3: "text-amber-700 dark:text-amber-300",
};

const PAYLOADS: Record<Producer, string[]> = {
  P1: ["sensor=18.3", "sensor=21.7", "sensor=ERR"],
  P2: ["job=#341", "job=#342", "job=#343"],
  P3: ["heartbeat", "alarm:tank_full", "alarm:overcurrent"],
};

export function MessageQueueDemo() {
  const [queue, setQueue] = useState<Msg[]>([]);
  const [persistent, setPersistent] = useState(true);
  const [filterPrio, setFilterPrio] = useState<Prio | "any">("any");
  const [nextId, setNextId] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [log, setLog] = useState<{ t: number; text: string; tone: "ok" | "bad" | "info" }[]>([]);
  const [tick, setTick] = useState(0);

  function send(from: Producer, prio: Prio) {
    if (queue.length >= MAX_QUEUE) {
      pushLog(`mq full — ${from} blokkerer på mq_send`, "bad");
      return;
    }
    const payloads = PAYLOADS[from];
    const payload = payloads[(nextId - 1) % payloads.length];
    const msg: Msg = { id: nextId, from, prio, payload };
    setNextId((n) => n + 1);
    // POSIX mq: høyere prio først, FIFO innenfor samme prio
    setQueue((q) => {
      const newQ = [...q, msg];
      newQ.sort((a, b) => {
        if (b.prio !== a.prio) return b.prio - a.prio;
        return a.id - b.id; // FIFO innenfor prio
      });
      return newQ;
    });
    pushLog(`mq_send(${from}, prio=${prio}) → "${payload}"`, "ok");
  }

  function consume() {
    setQueue((q) => {
      if (q.length === 0) {
        pushLog("mq_receive blokkerer — kø tom", "bad");
        return q;
      }
      let idx = 0;
      if (filterPrio !== "any") {
        idx = q.findIndex((m) => m.prio === filterPrio);
        if (idx === -1) {
          pushLog(`ingen melding med prio=${filterPrio}`, "bad");
          return q;
        }
      }
      const msg = q[idx];
      pushLog(`mq_receive() → [${msg.from}, prio=${msg.prio}] "${msg.payload}"`, "ok");
      return q.filter((_, i) => i !== idx);
    });
  }

  function crashProducer() {
    setCrashed(true);
    if (persistent) {
      pushLog("P1 kræsjet — men meldinger ligger trygt i kjernen", "info");
    } else {
      // Simuler at vi behandler queue som en flyktig pipe-buffer eid av P1
      setQueue([]);
      pushLog("P1 kræsjet — uten persistens forsvinner alle meldinger", "bad");
    }
  }

  function resetAll() {
    setQueue([]);
    setNextId(1);
    setCrashed(false);
    setLog([]);
    setTick(0);
  }

  function pushLog(text: string, tone: "ok" | "bad" | "info") {
    setTick((t) => {
      const nt = t + 1;
      setLog((l) => [{ t: nt, text, tone }, ...l].slice(0, 10));
      return nt;
    });
  }

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Message queue demo — prioritet og persistens"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Interaktiv visualisering
        </div>
        <div className="text-sm font-semibold">
          Message queue — diskrete meldinger med prioritet
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          mq_send beholder meldingsgrenser (i motsetning til pipe) og sorterer på prio.
          Toggle persistens for å se hva som skiller en mq fra en pipe.
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={persistent}
              onChange={(e) => setPersistent(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            <HardDrive className="h-3 w-3 text-muted-foreground" />
            <span>kjerne-persistent (POSIX mq)</span>
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">filter:</span>
            <select
              value={filterPrio}
              onChange={(e) =>
                setFilterPrio(e.target.value === "any" ? "any" : (Number(e.target.value) as Prio))
              }
              className="text-xs border border-border bg-background rounded px-1.5 py-0.5"
            >
              <option value="any">alle prio</option>
              <option value="9">bare prio=9 (høy)</option>
              <option value="5">bare prio=5 (normal)</option>
              <option value="0">bare prio=0 (lav)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={resetAll}
            className="ml-auto text-xs px-2 py-1 rounded border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        {/* Kø-visualisering */}
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1 font-mono">
            <span>head ← konsumeres her (høyest prio først)</span>
            <span>
              {queue.length} / {MAX_QUEUE}
            </span>
          </div>
          <div className="min-h-[64px] rounded-lg border border-border bg-muted/20 p-2 flex flex-wrap gap-1.5 items-start">
            {queue.length === 0 ? (
              <div className="w-full text-center text-[11px] italic text-muted-foreground py-3">
                kø er tom — mq_receive vil blokkere
              </div>
            ) : (
              queue.map((m, i) => {
                const c = PRIO_COLORS[m.prio];
                return (
                  <div
                    key={m.id}
                    className={`rounded-md border ${c.bg} ${c.border} px-2 py-1 text-[10px] font-mono ${c.text} flex flex-col items-start min-w-[110px]`}
                    title={`#${m.id} fra ${m.from} (prio=${m.prio})`}
                  >
                    <span className="font-semibold">
                      {i === 0 ? "▶ " : ""}#{m.id} · {m.from} · p{m.prio}
                    </span>
                    <span className="opacity-80 truncate max-w-[180px]">{m.payload}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Produsenter */}
        <div className="grid sm:grid-cols-3 gap-2">
          {(["P1", "P2", "P3"] as Producer[]).map((p) => (
            <div
              key={p}
              className={`rounded-lg border border-border bg-background p-2 ${
                crashed && p === "P1" ? "opacity-50" : ""
              }`}
            >
              <div className={`text-xs font-mono font-semibold mb-1 ${PRODUCER_COLORS[p]}`}>
                {p} {crashed && p === "P1" && <span className="text-rose-500">(kræsjet)</span>}
              </div>
              <div className="flex gap-1">
                {([0, 5, 9] as Prio[]).map((pr) => {
                  const c = PRIO_COLORS[pr];
                  return (
                    <button
                      key={pr}
                      type="button"
                      disabled={crashed && p === "P1"}
                      onClick={() => send(p, pr)}
                      className={`flex-1 text-[10px] font-mono px-1.5 py-1 rounded border ${c.bg} ${c.border} ${c.text} hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1`}
                      title={`mq_send med prio=${pr} (${c.label})`}
                    >
                      <Send className="h-2.5 w-2.5" />p{pr}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Konsumenter + scenarier */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={consume}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <Inbox className="h-3.5 w-3.5" /> mq_receive()
          </button>
          <button
            type="button"
            onClick={() => {
              consume();
              consume();
              consume();
            }}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            ta 3
          </button>
          <button
            type="button"
            onClick={crashProducer}
            disabled={crashed}
            className="text-xs px-2 py-1 rounded border border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15 disabled:opacity-40 inline-flex items-center gap-1"
          >
            <Skull className="h-3.5 w-3.5" /> kill -9 P1
          </button>
          <button
            type="button"
            onClick={() => setQueue([])}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted ml-auto inline-flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> tøm kø
          </button>
        </div>

        {/* Logg */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
            mq-hendelser
          </div>
          {log.length === 0 ? (
            <div className="text-[11px] italic text-muted-foreground">
              Send eller motta meldinger for å se loggen.
            </div>
          ) : (
            <div className="space-y-0.5 font-mono text-[11px] max-h-36 overflow-y-auto">
              {log.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.tone === "bad"
                      ? "text-rose-600 dark:text-rose-300"
                      : l.tone === "ok"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-muted-foreground"
                  }
                >
                  <span className="opacity-50">t={l.t}</span> {l.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> POSIX-mq beholder meldingsgrenser
          (én <code className="font-mono">mq_receive</code> = én melding), støtter
          prioritet, og lever i kjernen — den overlever at sender-prosessen dør.
          Det gir <em>tid-frakopling</em>: P1 kan sende og avslutte før P2 i det
          hele tatt har startet. Pipes har ikke denne egenskapen.
        </div>
      </div>
    </div>
  );
}
