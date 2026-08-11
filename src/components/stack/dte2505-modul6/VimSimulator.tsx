import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RotateCcw,
  Keyboard,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Lightbulb,
  Play,
  BookOpen,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODUS_INFO,
  VIM_GOAL_TASKS,
  initVim,
  pressKey,
  visuellUtvalg,
  type CheckOutcome,
  type VimMode,
  type VimState,
} from "@/lib/dte2505/vimSimulator";

// ---------------------------------------------------------------------------
// Modussimulatoren for vi/vim.
//
// Modusmodellen er hele poenget med vi, og den er visuell av natur: samme tast,
// fire ulike utfall. Derfor viser simulatoren ALLTID hvilken modus du er i,
// hva tastene gjør akkurat der, og hva det siste tastetrykket faktisk gjorde.
//
// To bruksmåter, etter lær-først-så-test-deg-selv:
//   «Utforsk»    — fri lekegrind, ingen mål, forklaring på hvert tastetrykk
//   «Måloppgaver» — oppgavetype 3, med sjekk av BUFFERET (ikke av tastene)
// ---------------------------------------------------------------------------

const MODUS_STIL: Record<VimMode, { ramme: string; fyll: string; tekst: string; markor: string }> = {
  normal: {
    ramme: "border-sky-500/70",
    fyll: "bg-sky-500/10",
    tekst: "text-sky-700 dark:text-sky-300",
    markor: "bg-sky-400 text-zinc-950",
  },
  insert: {
    ramme: "border-emerald-500/70",
    fyll: "bg-emerald-500/10",
    tekst: "text-emerald-700 dark:text-emerald-300",
    markor: "bg-emerald-400 text-zinc-950",
  },
  visual: {
    ramme: "border-violet-500/70",
    fyll: "bg-violet-500/10",
    tekst: "text-violet-700 dark:text-violet-300",
    markor: "bg-violet-400 text-zinc-950",
  },
  kommando: {
    ramme: "border-amber-500/70",
    fyll: "bg-amber-500/10",
    tekst: "text-amber-700 dark:text-amber-300",
    markor: "bg-amber-400 text-zinc-950",
  },
};

const MODI: VimMode[] = ["normal", "insert", "visual", "kommando"];

/** Tastene som tilbys som knapper, gruppert etter hva de gjør. */
const TASTEGRUPPER: { navn: string; taster: { key: string; vis?: string; om: string }[] }[] = [
  {
    navn: "Bevegelse",
    taster: [
      { key: "h", om: "venstre" },
      { key: "j", om: "ned" },
      { key: "k", om: "opp" },
      { key: "l", om: "høyre" },
      { key: "w", om: "neste ord" },
      { key: "b", om: "forrige ord" },
      { key: "0", om: "linjestart" },
      { key: "$", om: "linjeslutt" },
      { key: "g", om: "gg = toppen" },
      { key: "G", om: "bunnen" },
    ],
  },
  {
    navn: "Inn i innsettingsmodus",
    taster: [
      { key: "i", om: "sett inn før markøren" },
      { key: "a", om: "sett inn etter markøren" },
      { key: "o", om: "ny linje under" },
      { key: "O", om: "ny linje over" },
    ],
  },
  {
    navn: "Redigering",
    taster: [
      { key: "x", om: "slett ett tegn" },
      { key: "d", om: "dd = slett linje" },
      { key: "y", om: "yy = kopier linje" },
      { key: "p", om: "lim inn under" },
      { key: "P", om: "lim inn over" },
    ],
  },
  {
    navn: "Modusbytte",
    taster: [
      { key: "v", om: "visuellmodus" },
      { key: ":", om: "kommandolinja" },
      { key: "Escape", vis: "Esc", om: "alltid tilbake til normalmodus" },
    ],
  },
];

const KOMMANDOER = [":w", ":q", ":wq", ":q!"];

type Fane = "utforsk" | "mal";

export function VimSimulator() {
  const [fane, setFane] = useState<Fane>("utforsk");
  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Keyboard className="h-4 w-4 text-brand" /> vim-simulator
        </div>
        <div role="tablist" aria-label="Modus" className="inline-flex rounded-lg border bg-muted/30 p-0.5">
          <button
            role="tab"
            aria-selected={fane === "utforsk"}
            onClick={() => setFane("utforsk")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              fane === "utforsk" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BookOpen className="h-3.5 w-3.5" /> Utforsk fritt
          </button>
          <button
            role="tab"
            aria-selected={fane === "mal"}
            onClick={() => setFane("mal")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              fane === "mal" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Dumbbell className="h-3.5 w-3.5" /> Måloppgaver
          </button>
        </div>
      </div>
      {fane === "utforsk" ? <Utforsk /> : <Maloppgaver />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fri utforsking (oppgavetype 2 — guidet simulering uten prestasjonskrav)
// ---------------------------------------------------------------------------

function Utforsk() {
  const [s, setS] = useState<VimState>(() => initVim());
  const [fanger, setFanger] = useState(false);
  const boks = useRef<HTMLDivElement>(null);

  const trykk = useCallback((key: string) => setS((prev) => pressKey(prev, key)), []);

  // Ekte tastatur når feltet har fokus — det er slik man faktisk lærer modusene.
  useEffect(() => {
    if (!fanger) return;
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "Tab") return;
      e.preventDefault();
      if (k === "Escape" || k === "Enter" || k === "Backspace") trykk(k);
      else if (k.length === 1) trykk(k);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fanger, trykk]);

  return (
    <div className="p-4">
      <ModusStripe mode={s.mode} />

      <div
        ref={boks}
        tabIndex={0}
        onFocus={() => setFanger(true)}
        onBlur={() => setFanger(false)}
        className={cn(
          "mt-3 rounded-lg border-2 outline-none transition-colors",
          fanger ? MODUS_STIL[s.mode].ramme : "border-border",
        )}
        aria-label="vim-editor. Klikk for å skrive med ekte tastatur."
      >
        <Skjerm s={s} />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={cn("inline-flex items-center gap-1", fanger ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
          <Keyboard className="h-3 w-3" />
          {fanger
            ? "Tastaturet går rett til editoren. Klikk utenfor for å slippe."
            : "Klikk i editoren for å skrive med ekte tastatur — eller bruk knappene under."}
        </span>
        <button
          onClick={() => setS(initVim())}
          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-accent"
        >
          <RotateCcw className="h-3 w-3" /> Start på nytt
        </button>
      </div>

      <Forklaring s={s} />
      <Tastatur trykk={trykk} s={s} />
      <ModusKart mode={s.mode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Måloppgaver (oppgavetype 3 — sjekker bufferet, ikke tastetrykkene)
// ---------------------------------------------------------------------------

function Maloppgaver() {
  const [idx, setIdx] = useState(0);
  const [s, setS] = useState<VimState>(() => initVim(VIM_GOAL_TASKS[0].start));
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [hint, setHint] = useState(false);
  const [fasit, setFasit] = useState(false);
  const [lost, setLost] = useState<Record<string, boolean>>({});
  const [fanger, setFanger] = useState(false);

  const task = VIM_GOAL_TASKS[idx];

  const trykk = useCallback(
    (key: string) => {
      setS((prev) => {
        const neste = pressKey(prev, key);
        const o = task.check(neste);
        setOutcome(o);
        if (o.verdict === "riktig") setLost((l) => ({ ...l, [task.id]: true }));
        return neste;
      });
    },
    [task],
  );

  useEffect(() => {
    if (!fanger) return;
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "Tab") return;
      e.preventDefault();
      if (k === "Escape" || k === "Enter" || k === "Backspace" || k.length === 1) trykk(k);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fanger, trykk]);

  function velg(i: number) {
    setIdx(i);
    setS(initVim(VIM_GOAL_TASKS[i].start));
    setOutcome(null);
    setHint(false);
    setFasit(false);
  }

  function spillFasit() {
    let v = initVim(task.start);
    for (const k of task.fasit) v = pressKey(v, k);
    setS(v);
    setOutcome(task.check(v));
  }

  const antallLost = useMemo(() => Object.values(lost).filter(Boolean).length, [lost]);

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {VIM_GOAL_TASKS.map((t, i) => (
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
        <span className="text-xs text-muted-foreground">{antallLost} løst</span>
      </div>

      <div className="mt-3 text-[11px] uppercase tracking-wider text-brand">{task.title}</div>
      <p className="mt-1 leading-relaxed">{task.prompt}</p>
      <div className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-2.5 text-xs">
        <span className="font-semibold">Måltilstanden:</span> {task.goal}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setHint(true)}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <Lightbulb className="h-3.5 w-3.5" /> Hint
        </button>
        <button
          onClick={() => setFasit(true)}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <Eye className="h-3.5 w-3.5" /> Vis tastesekvens
        </button>
        <button
          onClick={spillFasit}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <Play className="h-3.5 w-3.5 text-brand" /> Kjør den for meg
        </button>
        <button
          onClick={() => velg(idx)}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Start forfra
        </button>
      </div>

      {hint && (
        <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2.5 text-sm">{task.hint}</div>
      )}
      {fasit && (
        <div className="mt-2 rounded-lg border bg-muted/40 p-2.5 text-sm">
          <span className="font-semibold">Én tastesekvens:</span>{" "}
          <span className="font-mono text-xs">
            {task.fasit.map((k) => (k === "Escape" ? "Esc" : k === "Enter" ? "⏎" : k === " " ? "␣" : k)).join(" ")}
          </span>
        </div>
      )}

      <div className="mt-3">
        <ModusStripe mode={s.mode} />
      </div>

      <div
        tabIndex={0}
        onFocus={() => setFanger(true)}
        onBlur={() => setFanger(false)}
        className={cn(
          "mt-3 rounded-lg border-2 outline-none transition-colors",
          fanger ? MODUS_STIL[s.mode].ramme : "border-border",
        )}
      >
        <Skjerm s={s} />
      </div>

      <Forklaring s={s} />
      <Tastatur trykk={trykk} s={s} />

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
              {outcome.verdict === "riktig" ? "måltilstanden er nådd" : outcome.verdict === "nesten" ? "nesten framme" : "ikke ennå"}
            </div>
            <p className="mt-0.5">{outcome.message}</p>
            {outcome.verdict === "riktig" && <p className="mt-2 border-t pt-2 text-xs">{task.takeaway}</p>}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <button
          onClick={() => velg((idx - 1 + VIM_GOAL_TASKS.length) % VIM_GOAL_TASKS.length)}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Forrige
        </button>
        <button
          onClick={() => velg((idx + 1) % VIM_GOAL_TASKS.length)}
          className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
        >
          Neste <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delene
// ---------------------------------------------------------------------------

/** Modusindikatoren: den ene tingen studenten alltid skal kunne se. */
function ModusStripe({ mode }: { mode: VimMode }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MODI.map((m) => {
        const aktiv = m === mode;
        const stil = MODUS_STIL[m];
        return (
          <div
            key={m}
            className={cn(
              "flex-1 rounded-lg border-2 px-2 py-1.5 text-center transition-all",
              aktiv ? cn(stil.ramme, stil.fyll) : "border-border opacity-45",
            )}
          >
            <div className={cn("text-xs font-semibold", aktiv && stil.tekst)}>{MODUS_INFO[m].navn}</div>
            {aktiv && <div className="mt-0.5 text-[10px] leading-tight">{MODUS_INFO[m].hvaTastene}</div>}
          </div>
        );
      })}
    </div>
  );
}

/** Selve editorskjermen, med markør, merking og statuslinje. */
function Skjerm({ s }: { s: VimState }) {
  const utvalg = visuellUtvalg(s);
  const stil = MODUS_STIL[s.mode];

  const erMerket = (row: number, col: number) => {
    if (!utvalg) return false;
    const { fra, til } = utvalg;
    if (row < fra.row || row > til.row) return false;
    if (fra.row === til.row) return col >= fra.col && col <= til.col;
    if (row === fra.row) return col >= fra.col;
    if (row === til.row) return col <= til.col;
    return true;
  };

  return (
    <div className="overflow-x-auto rounded-md bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100">
      {s.avsluttet ? (
        <div className="py-6 text-center">
          <div className="text-emerald-400">student@laptop:~$ </div>
          <div className="mt-2 text-zinc-400">
            Du er ute av vim. {s.lagret ? "Fila er lagret." : "Ingenting ble lagret."}
          </div>
        </div>
      ) : (
        <>
          {s.lines.map((linje, r) => (
            <div key={r} className="whitespace-pre">
              <span className="select-none text-zinc-600">{String(r + 1).padStart(2, " ")} </span>
              {(linje.length ? [...linje] : [" "]).map((ch, c) => {
                const markor = r === s.row && c === s.col && s.mode !== "kommando";
                const merket = erMerket(r, c);
                return (
                  <span
                    key={c}
                    className={cn(
                      markor && s.mode === "insert" && "border-l-2 border-emerald-400",
                      markor && s.mode !== "insert" && stil.markor,
                      !markor && merket && "bg-violet-500/40",
                    )}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          ))}
          {/* tilde-linjene under teksten er vims signatur */}
          {Array.from({ length: Math.max(0, 8 - s.lines.length) }).map((_, i) => (
            <div key={`t${i}`} className="text-zinc-700">
              ~
            </div>
          ))}
          {/* statuslinja nederst */}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-800 pt-1">
            <span className={cn(s.mode === "kommando" ? "text-zinc-100" : "text-zinc-400")}>
              {s.mode === "kommando" ? (
                <>
                  :{s.kommandolinje}
                  <span className={cn("ml-px inline-block w-1.5", stil.markor)}>&nbsp;</span>
                </>
              ) : s.mode === "insert" ? (
                "-- INSERT --"
              ) : s.mode === "visual" ? (
                "-- VISUAL --"
              ) : (
                s.melding || " "
              )}
            </span>
            <span className="text-zinc-500">
              {s.endret ? "[+] " : ""}
              {s.row + 1},{s.col + 1}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/** Hva det siste tastetrykket faktisk gjorde. Selve pedagogikken. */
function Forklaring({ s }: { s: VimState }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-brand/40 bg-brand/5 p-2.5 text-sm leading-relaxed">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
      <div>
        {s.sisteTast && (
          <kbd className="mr-1.5 rounded border bg-card px-1.5 py-0.5 font-mono text-[11px]">
            {s.sisteTast === "Escape" ? "Esc" : s.sisteTast === "Enter" ? "⏎" : s.sisteTast === " " ? "␣" : s.sisteTast}
          </kbd>
        )}
        {s.forklaring}
      </div>
    </div>
  );
}

/** Tasteknappene, gruppert. Fungerer også uten fysisk tastatur. */
function Tastatur({ trykk, s }: { trykk: (k: string) => void; s: VimState }) {
  return (
    <div className="mt-3 space-y-2">
      {TASTEGRUPPER.map((g) => (
        <div key={g.navn} className="flex flex-wrap items-center gap-1.5">
          <span className="w-full text-[10px] uppercase tracking-wider text-muted-foreground sm:w-32 sm:shrink-0">
            {g.navn}
          </span>
          {g.taster.map((t) => (
            <button
              key={t.key}
              onClick={() => trykk(t.key)}
              title={t.om}
              className={cn(
                "rounded-md border bg-card px-2 py-1 font-mono text-xs hover:bg-accent",
                t.key === "Escape" && "border-brand/60",
              )}
            >
              {t.vis ?? t.key}
            </button>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="w-full text-[10px] uppercase tracking-wider text-muted-foreground sm:w-32 sm:shrink-0">
          Hele kommandoer
        </span>
        {KOMMANDOER.map((c) => (
          <button
            key={c}
            onClick={() => {
              if (s.mode === "insert" || s.mode === "visual") trykk("Escape");
              for (const ch of c) trykk(ch);
              trykk("Enter");
            }}
            className="rounded-md border bg-card px-2 py-1 font-mono text-xs hover:bg-accent"
            title={`Skriver ${c} og trykker Enter`}
          >
            {c}
          </button>
        ))}
        <span className="text-[10px] text-muted-foreground">(disse trykker Esc først, som du selv må huske)</span>
      </div>
    </div>
  );
}

/** Kartet over hvordan man kommer inn i og ut av hver modus. */
function ModusKart({ mode }: { mode: VimMode }) {
  const info = MODUS_INFO[mode];
  const stil = MODUS_STIL[mode];
  return (
    <div className={cn("mt-3 rounded-lg border p-3 text-sm leading-relaxed", stil.ramme, stil.fyll)}>
      <div className={cn("text-xs font-semibold", stil.tekst)}>Du er i {info.navn.toLowerCase()}</div>
      <p className="mt-1">{info.kort}</p>
      <p className="mt-1 text-xs">
        <span className="font-medium">Ut igjen:</span> {info.hvordanUt}
      </p>
    </div>
  );
}
