import { useMemo, useState } from "react";
import {
  Target,
  BookOpen,
  Dumbbell,
  Play,
  Lightbulb,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Terminal,
  RotateCcw,
  GraduationCap,
  FlaskConical,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SSH_GOAL_TASKS,
  TJENER,
  initialSshState,
  runSsh,
  type CheckOutcome,
  type SshResultat,
  type SshState,
} from "@/lib/dte2505/sshEngine";
import { SshPanel } from "./SshPanel";

// ---------------------------------------------------------------------------
// SSH-delen av modul 6, oppgavetype 2 og 3 i samme komponent.
//
//   «Guidet»     — en ferdig kjede man trykker seg gjennom, null prestasjonskrav
//   «Måloppgaver» — flerstegs oppgaver med tilstandssjekk (§3.1). Sjekken ser på
//                   hvor SYSTEMET havnet: finnes nøkkelen, ligger den offentlige
//                   halvdelen på tjeneren, er økta tilkoblet, er DISPLAY satt.
//   «Lekegrind»  — samme motor uten manus.
// ---------------------------------------------------------------------------

const MANUS: { cmd: string; seEtter: string }[] = [
  {
    cmd: `ssh ${TJENER.bruker}@${TJENER.host}`,
    seEtter:
      "Tjeneren spør om passord, fordi du ikke har noen nøkkel. Legg merke til at «du er her»-merket flyttet seg til høyre kolonne — alt du skriver nå kjører på fjernmaskinen.",
  },
  {
    cmd: "hostname",
    seEtter: "Bekreftelsen: du står på tjeneren. Dette er kommandoen å bruke hver gang du er usikker.",
  },
  {
    cmd: "echo $DISPLAY",
    seEtter: "Tom. En vanlig SSH-økt er ren tekst — det finnes ingen skjerm å tegne på.",
  },
  { cmd: "xeyes", seEtter: "«Can't open display». Programmet ville tegne et vindu, men fant ingen X-tjener." },
  { cmd: "exit", seEtter: "Tilbake på din egen maskin. Merket flyttet seg til venstre kolonne igjen." },
  {
    cmd: "ssh-keygen -t ed25519",
    seEtter:
      "To filer i venstre kolonne: én privat (rød) og én offentlig (grønn). Den private forlater aldri denne maskinen.",
  },
  {
    cmd: `ssh-copy-id ${TJENER.bruker}@${TJENER.host}`,
    seEtter:
      "Se hva som skjedde: BARE den offentlige halvdelen dukket opp i authorized_keys på tjeneren. Den private står fortsatt bare til venstre.",
  },
  {
    cmd: `ssh ${TJENER.bruker}@${TJENER.host}`,
    seEtter:
      "«Authenticated with id_ed25519» — ingen passordspørring. Tjeneren sendte en utfordring, du signerte den, tjeneren sjekket signaturen.",
  },
  { cmd: "exit", seEtter: "Ut igjen, for å prøve grafikken." },
  {
    cmd: `ssh -X ${TJENER.bruker}@${TJENER.host}`,
    seEtter:
      "DISPLAY er nå localhost:10.0 på tjeneren. Det er ikke en skjerm som står der — det er munningen av en tunnel gjennom SSH-forbindelsen.",
  },
  {
    cmd: "xeyes",
    seEtter:
      "Nå kommer vinduet fram. Programmet regner på tjeneren, men tegner hos deg. Det er hele klient–tjener-modellen i X, i praksis.",
  },
  { cmd: "exit", seEtter: "Ferdig. Neste steg er å slippe å skrive hele adressen hver gang — det er ~/.ssh/config." },
];

type Fane = "guidet" | "mal" | "fri";

export function SshOppgaver() {
  const [fane, setFane] = useState<Fane>("guidet");

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Terminal className="h-4 w-4 text-brand" /> SSH — Secure Shell
        </div>
        <div role="tablist" aria-label="Modus" className="inline-flex rounded-lg border bg-muted/30 p-0.5">
          {(
            [
              ["guidet", "Guidet", GraduationCap],
              ["mal", "Måloppgaver", Dumbbell],
              ["fri", "Lekegrind", FlaskConical],
            ] as const
          ).map(([id, navn, Ikon]) => (
            <button
              key={id}
              role="tab"
              aria-selected={fane === id}
              onClick={() => setFane(id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
                fane === id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Ikon className="h-3.5 w-3.5" /> {navn}
            </button>
          ))}
        </div>
      </div>

      {fane === "guidet" ? <Guidet /> : fane === "mal" ? <Maloppgaver /> : <Lekegrind />}
    </div>
  );
}

/** Terminalvinduet, med ledetekst som viser hvilken maskin man er på. */
function TerminalRute({ logg }: { logg: SshResultat[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border">
      <div className="flex items-center gap-1.5 border-b bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
        <Terminal className="h-3 w-3" /> terminal
      </div>
      <div className="max-h-64 overflow-y-auto bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
        {logg.length === 0 ? (
          <div className="text-zinc-500">Mock-miljø i nettleseren. Ingen ekte maskiner kontaktes.</div>
        ) : (
          logg.map((r, i) => (
            <div key={i} className={cn(i > 0 && "mt-2")}>
              <div className="break-all text-emerald-400">
                <span className="text-zinc-500">
                  {r.pared ? `${TJENER.bruker}@${TJENER.host}:~$ ` : "student@laptop:~$ "}
                </span>
                {r.cmd}
              </div>
              {r.lines.map((l, j) => (
                <div
                  key={j}
                  className={cn(
                    "whitespace-pre-wrap break-all",
                    l.trimStart().startsWith("(") && "text-zinc-400",
                    /^(Error|error|E:|ssh:|Permission denied|Bad owner)/.test(l) && "text-rose-400",
                    /^(Warning|W:|X11 forwarding request failed)/.test(l) && "text-amber-400",
                  )}
                >
                  {l || " "}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Guidet() {
  const [steg, setSteg] = useState(0);
  const [state, setState] = useState<SshState>(initialSshState);
  const [logg, setLogg] = useState<SshResultat[]>([]);

  const ferdig = steg >= MANUS.length;
  const forrige = steg > 0 ? MANUS[steg - 1] : null;

  function neste() {
    if (ferdig) return;
    const r = runSsh(state, MANUS[steg].cmd);
    setState(r.state);
    setLogg((l) => [...l, r]);
    setSteg((s) => s + 1);
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Steg {Math.min(steg, MANUS.length)} av {MANUS.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSteg(0);
              setState(initialSshState());
              setLogg([]);
            }}
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-accent"
          >
            <RotateCcw className="h-3 w-3" /> Start på nytt
          </button>
          <button
            onClick={neste}
            disabled={ferdig}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium",
              ferdig ? "cursor-not-allowed border bg-muted text-muted-foreground" : "bg-brand text-brand-foreground hover:bg-brand/90",
            )}
          >
            {ferdig ? "Ferdig" : steg === 0 ? "Start" : "Neste steg"} <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-brand transition-all" style={{ width: `${(Math.min(steg, MANUS.length) / MANUS.length) * 100}%` }} />
      </div>

      {!ferdig && (
        <div className="mt-3 rounded-lg border bg-muted/30 p-2.5 text-xs">
          <span className="text-muted-foreground">Neste kommando:</span>{" "}
          <code className="break-all font-mono">{MANUS[steg].cmd}</code>
        </div>
      )}

      {logg.length > 0 && <TerminalRute logg={logg.slice(-4)} />}

      {forrige && (
        <div className="mt-2 rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm leading-relaxed">
          <span className="font-semibold">Se etter:</span> {forrige.seEtter}
        </div>
      )}

      <div className="mt-3">
        <SshPanel state={state} />
      </div>
    </div>
  );
}

function Maloppgaver() {
  const [mode, setMode] = useState<"learn" | "drill">("learn");
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<SshState>(() => SSH_GOAL_TASKS[0].start());
  const [logg, setLogg] = useState<SshResultat[]>([]);
  const [input, setInput] = useState("");
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [hint, setHint] = useState(false);
  const [fasit, setFasit] = useState(false);
  const [lost, setLost] = useState<Record<string, boolean>>({});

  const task = SSH_GOAL_TASKS[idx];

  function nullstill(i = idx) {
    setState(SSH_GOAL_TASKS[i].start());
    setLogg([]);
    setInput("");
    setOutcome(null);
    setHint(false);
    setFasit(false);
  }

  function velg(i: number) {
    setIdx(i);
    nullstill(i);
  }

  function kjor(cmd?: string) {
    const linje = (cmd ?? input).trim();
    if (!linje) return;
    const r = runSsh(state, linje);
    const ny = [...logg, r];
    setState(r.state);
    setLogg(ny);
    setInput("");
    const o = task.check(r.state, ny);
    setOutcome(o);
    if (o.verdict === "riktig") setLost((l) => ({ ...l, [task.id]: true }));
  }

  function spillFasit() {
    let s = task.start();
    const ny: SshResultat[] = [];
    for (const c of task.fasit) {
      const r = runSsh(s, c);
      s = r.state;
      ny.push(r);
    }
    setState(s);
    setLogg(ny);
    setOutcome(task.check(s, ny));
  }

  const antall = useMemo(() => Object.values(lost).filter(Boolean).length, [lost]);

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {SSH_GOAL_TASKS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => velg(i)}
              title={t.title}
              className={cn(
                "h-6 w-6 rounded-md border text-xs",
                i === idx && "border-brand bg-brand/15 font-semibold",
                lost[t.id] && i !== idx && "border-emerald-500/60 bg-emerald-500/10",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{antall} løst</span>
          <div role="tablist" aria-label="Læringsmodus" className="inline-flex rounded-lg border bg-muted/30 p-0.5">
            <button
              role="tab"
              aria-selected={mode === "learn"}
              onClick={() => {
                setMode("learn");
                nullstill();
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                mode === "learn" ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
            >
              <BookOpen className="h-3 w-3" /> Lær
            </button>
            <button
              role="tab"
              aria-selected={mode === "drill"}
              onClick={() => {
                setMode("drill");
                nullstill();
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
                mode === "drill" ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
            >
              <Dumbbell className="h-3 w-3" /> Test deg selv
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-brand">
        <Target className="h-3.5 w-3.5" /> {task.title}
      </div>
      <p className="mt-1 leading-relaxed">{task.prompt}</p>
      <div className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2.5 text-xs">
        <span className="font-semibold">Måltilstanden:</span> {task.goal}
      </div>

      {mode === "learn" ? (
        <div className="mt-3">
          <div className="text-xs text-muted-foreground">Én løsningsvei, steg for steg:</div>
          <ol className="mt-1.5 space-y-1">
            {task.fasit.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 shrink-0 rounded bg-brand/15 px-1.5 font-mono text-[10px] text-brand">{i + 1}</span>
                <code className="break-all font-mono">{c}</code>
              </li>
            ))}
          </ol>
          <button
            onClick={spillFasit}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            <Play className="h-3.5 w-3.5" /> Kjør hele kjeden og se tilstanden endre seg
          </button>
          <div className="mt-3 rounded-lg border border-brand/40 bg-brand/5 p-2.5 text-sm leading-relaxed">
            <span className="font-semibold">Hvorfor:</span> {task.takeaway}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 font-mono text-sm">
              <span className="text-brand">$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && kjor()}
                spellCheck={false}
                placeholder="ett steg om gangen"
                aria-label="Kommando"
                className="w-full bg-transparent outline-none"
              />
            </div>
            <button
              onClick={() => kjor()}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm text-brand-foreground hover:bg-brand/90"
            >
              <Play className="h-3.5 w-3.5" /> Kjør
            </button>
            <button onClick={() => setHint(true)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <Lightbulb className="h-3.5 w-3.5" /> Hint
            </button>
            <button onClick={() => setFasit(true)} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <Eye className="h-3.5 w-3.5" /> Fasit
            </button>
            <button onClick={() => nullstill()} className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <RotateCcw className="h-3.5 w-3.5" /> Start forfra
            </button>
          </div>
          {hint && <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2.5 text-sm">{task.hint}</div>}
          {fasit && (
            <div className="mt-2 rounded-lg border bg-muted/40 p-2.5 text-sm">
              <span className="font-semibold">Én løsningsvei:</span>
              <ol className="mt-1 space-y-0.5">
                {task.fasit.map((c, i) => (
                  <li key={i}>
                    <code className="break-all font-mono text-xs">{c}</code>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {logg.length > 0 && <TerminalRute logg={logg} />}

      <div className="mt-3">
        <SshPanel state={state} />
      </div>

      {outcome && (
        <div
          className={cn(
            "mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed",
            outcome.verdict === "riktig" && "border-emerald-500/60 bg-emerald-500/10",
            outcome.verdict === "nesten" && "border-amber-500/60 bg-amber-500/10",
            outcome.verdict === "feil" && "border-rose-500/60 bg-rose-500/10",
          )}
        >
          {outcome.verdict === "riktig" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : outcome.verdict === "nesten" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <div>
            <div className="text-[10px] uppercase tracking-wider opacity-70">
              {outcome.verdict === "riktig" ? "måltilstanden er nådd" : outcome.verdict === "nesten" ? "nesten framme" : "ikke dette"}
            </div>
            <p className="mt-0.5">{outcome.message}</p>
            {outcome.verdict === "riktig" && <p className="mt-2 border-t pt-2 text-xs">{task.takeaway}</p>}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <button
          onClick={() => velg((idx - 1 + SSH_GOAL_TASKS.length) % SSH_GOAL_TASKS.length)}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Forrige
        </button>
        <button
          onClick={() => velg((idx + 1) % SSH_GOAL_TASKS.length)}
          className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
        >
          Neste <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Lekegrind() {
  const [state, setState] = useState<SshState>(initialSshState);
  const [logg, setLogg] = useState<SshResultat[]>([]);
  const [input, setInput] = useState("");

  function kjor(cmd?: string) {
    const linje = (cmd ?? input).trim();
    if (!linje) return;
    const r = runSsh(state, linje);
    setState(r.state);
    setLogg((l) => [...l.slice(-12), r]);
    setInput("");
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 font-mono text-sm">
          <span className="text-brand">$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && kjor()}
            spellCheck={false}
            placeholder="prøv en kommando"
            aria-label="Kommando"
            className="w-full bg-transparent outline-none"
          />
        </div>
        <button
          onClick={() => kjor()}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm text-brand-foreground hover:bg-brand/90"
        >
          <Play className="h-3.5 w-3.5" /> Kjør
        </button>
        <button
          onClick={() => {
            setState(initialSshState());
            setLogg([]);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          "ssh-keygen -t ed25519",
          `ssh-copy-id ${TJENER.bruker}@${TJENER.host}`,
          "ssh-add -l",
          `ssh ${TJENER.bruker}@${TJENER.host}`,
          `ssh -X ${TJENER.bruker}@${TJENER.host}`,
          "echo $DISPLAY",
          "xeyes",
          "hostname",
          "cat ~/.ssh/authorized_keys",
          "exit",
        ].map((c) => (
          <button
            key={c}
            onClick={() => kjor(c)}
            className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 font-mono text-[11px] hover:bg-accent"
          >
            <CornerDownLeft className="h-2.5 w-2.5 text-brand" /> {c}
          </button>
        ))}
      </div>

      <TerminalRute logg={logg} />

      <div className="mt-3">
        <SshPanel state={state} />
      </div>
    </div>
  );
}
