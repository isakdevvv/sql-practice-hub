import { useState } from "react";
import { Play, RotateCcw, AlertTriangle, X, Send } from "lucide-react";

// ---------------------------------------------------------------------------
// PipesSimulator — anonym pipe mellom prosess P1 (writer) og P2 (reader).
//
// Modellerer kjernens pipe-buffer som et byte-array (PIPE_BUF ~ 64 KiB).
// Brukeren kan:
//   - skrive en chunk (P1) → bytes legges i tail
//   - lese en chunk (P2)   → bytes fjernes fra head
//   - fylle pipen helt opp → P1 BLOKKERER på write
//   - tømme pipen helt     → P2 BLOKKERER på read
//   - lukke skriver-enden  → P2 får EOF (read returnerer 0)
//   - lukke leser-enden    → kjernen sender SIGPIPE til P1 ved neste write
//
// Hele poenget: vise at en pipe er en finite kernel-buffer som flow-controller
// de to sidene mot hverandre.
// ---------------------------------------------------------------------------

const BUFFER_CAPACITY = 64 * 1024; // 64 KiB — typisk Linux-default
const WRITE_CHUNK = 8 * 1024; // 8 KiB per skrive-knapp
const READ_CHUNK = 8 * 1024; // 8 KiB per lese-knapp

type WriterState = "running" | "blocked-on-full" | "closed" | "killed-sigpipe";
type ReaderState = "running" | "blocked-on-empty" | "got-eof" | "closed";

type LogEntry = {
  t: number;
  who: "P1" | "P2" | "kernel";
  text: string;
  level: "info" | "good" | "bad" | "warn";
};

type Sim = {
  bufferFill: number; // bytes
  writerState: WriterState;
  readerState: ReaderState;
  writerClosed: boolean;
  readerClosed: boolean;
  bytesWritten: number;
  bytesRead: number;
  log: LogEntry[];
  tick: number;
};

function initial(): Sim {
  return {
    bufferFill: 0,
    writerState: "running",
    readerState: "running",
    writerClosed: false,
    readerClosed: false,
    bytesWritten: 0,
    bytesRead: 0,
    log: [],
    tick: 0,
  };
}

function logPush(s: Sim, e: Omit<LogEntry, "t">) {
  s.log = [{ t: s.tick, ...e }, ...s.log].slice(0, 12);
}

function write(s: Sim, bytes: number): Sim {
  const next = { ...s, log: s.log.slice() };
  next.tick++;
  if (next.writerClosed) {
    logPush(next, { who: "kernel", text: "EBADF — writer-enden er lukket", level: "bad" });
    return next;
  }
  if (next.readerClosed) {
    // Klassisk SIGPIPE-scenario
    next.writerState = "killed-sigpipe";
    logPush(next, { who: "kernel", text: "SIGPIPE — leser er lukket, P1 drept (default action)", level: "bad" });
    return next;
  }
  const free = BUFFER_CAPACITY - next.bufferFill;
  if (free === 0) {
    next.writerState = "blocked-on-full";
    logPush(next, { who: "P1", text: `write() blokkerer — buffer full (${BUFFER_CAPACITY} B)`, level: "warn" });
    return next;
  }
  const toWrite = Math.min(bytes, free);
  next.bufferFill += toWrite;
  next.bytesWritten += toWrite;
  next.writerState = next.bufferFill >= BUFFER_CAPACITY ? "blocked-on-full" : "running";
  logPush(next, {
    who: "P1",
    text: `write(${formatBytes(toWrite)})${toWrite < bytes ? ` — partiell (${formatBytes(bytes - toWrite)} igjen)` : ""}`,
    level: "good",
  });
  // Hvis leser ventet på data, vekk den
  if (next.readerState === "blocked-on-empty") {
    next.readerState = "running";
    logPush(next, { who: "kernel", text: "P2 vekkes — data tilgjengelig", level: "info" });
  }
  return next;
}

function read(s: Sim, bytes: number): Sim {
  const next = { ...s, log: s.log.slice() };
  next.tick++;
  if (next.readerClosed) {
    logPush(next, { who: "kernel", text: "EBADF — reader-enden er lukket", level: "bad" });
    return next;
  }
  if (next.bufferFill === 0) {
    if (next.writerClosed) {
      next.readerState = "got-eof";
      logPush(next, { who: "P2", text: "read() returnerer 0 — EOF (writer lukket)", level: "info" });
      return next;
    }
    next.readerState = "blocked-on-empty";
    logPush(next, { who: "P2", text: "read() blokkerer — buffer tom", level: "warn" });
    return next;
  }
  const toRead = Math.min(bytes, next.bufferFill);
  next.bufferFill -= toRead;
  next.bytesRead += toRead;
  next.readerState = "running";
  logPush(next, {
    who: "P2",
    text: `read(${formatBytes(toRead)}) → buffer ${formatBytes(next.bufferFill)} igjen`,
    level: "good",
  });
  // Hvis skriver var blokkert, vekk
  if (next.writerState === "blocked-on-full" && !next.writerClosed) {
    next.writerState = "running";
    logPush(next, { who: "kernel", text: "P1 vekkes — buffer ikke lenger full", level: "info" });
  }
  return next;
}

function closeWriter(s: Sim): Sim {
  const next = { ...s, log: s.log.slice() };
  next.tick++;
  if (next.writerClosed) return next;
  next.writerClosed = true;
  next.writerState = "closed";
  logPush(next, { who: "P1", text: "close(fd[1]) — writer-enden lukket", level: "info" });
  // Hvis buffer er tom og leser venter, gi EOF nå
  if (next.bufferFill === 0 && next.readerState === "blocked-on-empty") {
    next.readerState = "got-eof";
    logPush(next, { who: "kernel", text: "P2 vekkes med EOF (read returnerer 0)", level: "info" });
  }
  return next;
}

function closeReader(s: Sim): Sim {
  const next = { ...s, log: s.log.slice() };
  next.tick++;
  if (next.readerClosed) return next;
  next.readerClosed = true;
  next.readerState = "closed";
  logPush(next, { who: "P2", text: "close(fd[0]) — reader-enden lukket", level: "warn" });
  logPush(next, {
    who: "kernel",
    text: "Neste write() fra P1 → SIGPIPE / EPIPE",
    level: "warn",
  });
  return next;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(b % 1024 === 0 ? 0 : 1)} KiB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MiB`;
}

function fillScenario(): Sim {
  // Fyll bufferet helt opp så P1 blokkerer
  let s = initial();
  for (let i = 0; i < 8; i++) s = write(s, WRITE_CHUNK);
  // En ekstra som tipper over
  s = write(s, WRITE_CHUNK);
  return s;
}

export function PipesSimulator() {
  const [sim, setSim] = useState<Sim>(initial);

  const fillPct = (sim.bufferFill / BUFFER_CAPACITY) * 100;

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Pipes simulator — kernel-buffer mellom P1 og P2"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Interaktiv visualisering
        </div>
        <div className="text-sm font-semibold">
          Pipes — kjerne-buffer mellom skriver og leser
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Buffer er <span className="font-mono">{formatBytes(BUFFER_CAPACITY)}</span>{" "}
          (Linux PIPE_BUF-typisk). Fyll den opp for å se P1 blokkere, tøm den for å se P2 blokkere.
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Buffer-bar */}
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1 font-mono">
            <span>P1 (skriver) → buffer → P2 (leser)</span>
            <span>
              {formatBytes(sim.bufferFill)} / {formatBytes(BUFFER_CAPACITY)} ({fillPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-7 rounded-md border border-border bg-muted/40 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-200 ${
                fillPct >= 100
                  ? "bg-rose-500/70"
                  : fillPct >= 80
                    ? "bg-amber-500/70"
                    : "bg-emerald-500/60"
              }`}
              style={{ width: `${Math.min(100, fillPct)}%` }}
            />
            {fillPct >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-rose-50">
                FULL — neste write() blokkerer
              </div>
            )}
            {fillPct === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
                TOM — neste read() blokkerer (eller får EOF hvis writer lukket)
              </div>
            )}
          </div>
        </div>

        {/* Prosess-paneler */}
        <div className="grid sm:grid-cols-2 gap-3">
          <ProcessPanel
            who="P1"
            label="Skriver"
            stateLabel={writerStateLabel(sim.writerState)}
            stateTone={writerTone(sim.writerState)}
            bytes={sim.bytesWritten}
            bytesLabel="skrevet"
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setSim((s) => write(s, WRITE_CHUNK))}
                  disabled={sim.writerClosed || sim.writerState === "killed-sigpipe"}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <Send className="h-3 w-3" /> write(8K)
                </button>
                <button
                  type="button"
                  onClick={() => setSim((s) => write(s, 4 * WRITE_CHUNK))}
                  disabled={sim.writerClosed || sim.writerState === "killed-sigpipe"}
                  className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  write(32K)
                </button>
                <button
                  type="button"
                  onClick={() => setSim((s) => closeWriter(s))}
                  disabled={sim.writerClosed}
                  className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> close(fd[1])
                </button>
              </>
            }
          />
          <ProcessPanel
            who="P2"
            label="Leser"
            stateLabel={readerStateLabel(sim.readerState)}
            stateTone={readerTone(sim.readerState)}
            bytes={sim.bytesRead}
            bytesLabel="lest"
            actions={
              <>
                <button
                  type="button"
                  onClick={() => setSim((s) => read(s, READ_CHUNK))}
                  disabled={sim.readerClosed}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-sky-500/15 border border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/25 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <Play className="h-3 w-3" /> read(8K)
                </button>
                <button
                  type="button"
                  onClick={() => setSim((s) => read(s, 4 * READ_CHUNK))}
                  disabled={sim.readerClosed}
                  className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  read(32K)
                </button>
                <button
                  type="button"
                  onClick={() => setSim((s) => closeReader(s))}
                  disabled={sim.readerClosed}
                  className="px-2.5 py-1 rounded-md text-xs border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> close(fd[0])
                </button>
              </>
            }
          />
        </div>

        {/* Scenarier */}
        <div className="flex flex-wrap gap-2 items-center pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">Scenarier:</span>
          <button
            type="button"
            onClick={() => setSim(fillScenario())}
            className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted"
          >
            Fyll bufferet (blokker P1)
          </button>
          <button
            type="button"
            onClick={() => {
              let s = initial();
              s = write(s, WRITE_CHUNK);
              s = closeWriter(s);
              // P2 leser alt og deretter EOF
              s = read(s, WRITE_CHUNK);
              s = read(s, READ_CHUNK);
              setSim(s);
            }}
            className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted"
          >
            Demo: EOF til leser
          </button>
          <button
            type="button"
            onClick={() => {
              let s = initial();
              s = closeReader(s);
              s = write(s, WRITE_CHUNK); // SIGPIPE
              setSim(s);
            }}
            className="text-[11px] px-2 py-1 rounded border border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15 inline-flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" /> Demo: SIGPIPE
          </button>
          <button
            type="button"
            onClick={() => setSim(initial())}
            className="text-[11px] px-2 py-1 rounded border border-border hover:bg-muted ml-auto inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>

        {/* Logg */}
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Kernel-hendelser
          </div>
          {sim.log.length === 0 ? (
            <div className="text-[11px] italic text-muted-foreground">
              Klikk en knapp for å starte.
            </div>
          ) : (
            <div className="space-y-0.5 font-mono text-[11px] max-h-44 overflow-y-auto">
              {sim.log.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.level === "bad"
                      ? "text-rose-600 dark:text-rose-300"
                      : l.level === "warn"
                        ? "text-amber-700 dark:text-amber-300"
                        : l.level === "good"
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-muted-foreground"
                  }
                >
                  <span className="opacity-50">t={l.t}</span>{" "}
                  <span className="text-foreground">[{l.who}]</span> {l.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-[11px]">
          <strong>Lærepunkt:</strong> en pipe er flow-controlled. Skriver-siden{" "}
          <em>må</em> vente om leseren henger etter, og omvendt. Det er denne
          back-pressuren som gjør at <code className="font-mono">ls | grep | sort</code>{" "}
          ikke spiser opp minne om <code className="font-mono">sort</code> er treg.
          SIGPIPE er kjernens måte å fortelle skriveren at det ikke er noen å skrive til.
        </div>
      </div>
    </div>
  );
}

function writerStateLabel(s: WriterState): string {
  switch (s) {
    case "running":
      return "kjører";
    case "blocked-on-full":
      return "BLOKKERT på write() — buffer full";
    case "closed":
      return "lukket (close fd[1])";
    case "killed-sigpipe":
      return "DREPT — SIGPIPE";
  }
}
function writerTone(s: WriterState): "ok" | "warn" | "bad" | "muted" {
  if (s === "killed-sigpipe") return "bad";
  if (s === "blocked-on-full") return "warn";
  if (s === "closed") return "muted";
  return "ok";
}
function readerStateLabel(s: ReaderState): string {
  switch (s) {
    case "running":
      return "kjører";
    case "blocked-on-empty":
      return "BLOKKERT på read() — buffer tom";
    case "got-eof":
      return "EOF — writer lukket";
    case "closed":
      return "lukket (close fd[0])";
  }
}
function readerTone(s: ReaderState): "ok" | "warn" | "bad" | "muted" {
  if (s === "blocked-on-empty") return "warn";
  if (s === "got-eof" || s === "closed") return "muted";
  return "ok";
}

function ProcessPanel({
  who,
  label,
  stateLabel,
  stateTone,
  bytes,
  bytesLabel,
  actions,
}: {
  who: "P1" | "P2";
  label: string;
  stateLabel: string;
  stateTone: "ok" | "warn" | "bad" | "muted";
  bytes: number;
  bytesLabel: string;
  actions: React.ReactNode;
}) {
  const toneClass =
    stateTone === "bad"
      ? "border-rose-500/40 bg-rose-500/10"
      : stateTone === "warn"
        ? "border-amber-500/40 bg-amber-500/10"
        : stateTone === "muted"
          ? "border-border bg-muted/30"
          : "border-emerald-500/40 bg-emerald-500/10";
  const stateColor =
    stateTone === "bad"
      ? "text-rose-700 dark:text-rose-300"
      : stateTone === "warn"
        ? "text-amber-700 dark:text-amber-300"
        : stateTone === "muted"
          ? "text-muted-foreground"
          : "text-emerald-700 dark:text-emerald-300";
  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-sm font-semibold">
          <span className="font-mono">{who}</span>{" "}
          <span className="text-muted-foreground font-normal">— {label}</span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">
          {formatBytes(bytes)} {bytesLabel}
        </div>
      </div>
      <div className={`text-[11px] font-mono mb-2 ${stateColor}`}>{stateLabel}</div>
      <div className="flex flex-wrap gap-1.5">{actions}</div>
    </div>
  );
}
