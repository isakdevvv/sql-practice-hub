// Closure-scope visualizer. Vi tegner scope-frames som bokser med variabler,
// og piler fra funksjons-referanser til den frame-en de "lukker over". Hver
// snutt har en serie steg som viser hvilke frames som lever, hvilke
// variabler som er satt, og hvor funksjons-referanser peker. Hovedpoenget:
// funksjons-frames som normalt skulle bli pop-et OVERLEVER hvis en indre
// funksjon refererer til variablene deres.

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Variable {
  name: string;
  value: string;
  /** Variabelen er "lukket over" av en indre funksjon — markeres spesielt. */
  closedOver?: boolean;
}

interface Frame {
  /** Vises som tittel på boksen. */
  id: string;
  label: string;
  variables: Variable[];
  /** "alive" — fremdeles på call stack. "closure" — pop-et fra stack, men
   *  holdes i live av en closure. "dead" — kan gå til søpla. */
  state: "alive" | "closure" | "dead";
  /** Notat på siden av boksen. */
  note?: string;
}

interface Arrow {
  from: string;
  to: string;
  label: string;
}

interface Step {
  description: string;
  highlightLine: number;
  frames: Frame[];
  arrows: Arrow[];
  output: string[];
}

interface Snippet {
  id: string;
  title: string;
  code: string;
  takeaway: string;
  steps: Step[];
}

const SNIPPETS: Snippet[] = [
  {
    id: "teller",
    title: "Counter factory — privat tilstand",
    code: `function lagTeller() {
  let n = 0;
  return {
    inc() { n += 1; return n; },
    get() { return n; },
  };
}

const t = lagTeller();
t.inc();
t.inc();
console.log(t.get());`,
    takeaway:
      "Når lagTeller() returnerer, skulle frame-en med `n` normalt blitt slettet. Men `inc` og `get` har referanser inn i den — så frame-en lever videre som en closure. Hver call av t.inc() går inn i SAMME frame.",
    steps: [
      {
        description: "Globalt scope finnes med funksjons-deklarasjonen.",
        highlightLine: 0,
        frames: [{ id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }], state: "alive" }],
        arrows: [],
        output: [],
      },
      {
        description: "Linje 9: lagTeller() kalles. Ny frame opprettes.",
        highlightLine: 9,
        frames: [
          { id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }, { name: "t", value: "(venter)" }], state: "alive" },
          { id: "f1", label: "lagTeller-frame", variables: [{ name: "n", value: "0" }], state: "alive", note: "akkurat opprettet" },
        ],
        arrows: [],
        output: [],
      },
      {
        description: "Inne i lagTeller: returnerer et objekt med inc og get. Begge METHOD-ene refererer til `n`.",
        highlightLine: 4,
        frames: [
          { id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }, { name: "t", value: "(venter)" }], state: "alive" },
          { id: "f1", label: "lagTeller-frame", variables: [{ name: "n", value: "0", closedOver: true }], state: "alive", note: "n blir lukket over" },
        ],
        arrows: [
          { from: "inc / get (i retur-objektet)", to: "n i lagTeller-frame", label: "closes over" },
        ],
        output: [],
      },
      {
        description: "lagTeller returnerer. Frame-en pop-es fra stacken — MEN holdes alive av closures.",
        highlightLine: 9,
        frames: [
          { id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }, { name: "t", value: "{ inc, get }" }], state: "alive" },
          { id: "f1", label: "lagTeller-frame", variables: [{ name: "n", value: "0", closedOver: true }], state: "closure", note: "ute av stack, men levende" },
        ],
        arrows: [
          { from: "t.inc, t.get", to: "n i lagTeller-frame", label: "scope-kjede" },
        ],
        output: [],
      },
      {
        description: "Linje 10: t.inc(). inc finner `n` via scope-kjeden, gjør n = 1.",
        highlightLine: 10,
        frames: [
          { id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }, { name: "t", value: "{ inc, get }" }], state: "alive" },
          { id: "f1", label: "lagTeller-frame", variables: [{ name: "n", value: "1", closedOver: true }], state: "closure", note: "n: 0 → 1" },
        ],
        arrows: [
          { from: "t.inc, t.get", to: "n i lagTeller-frame", label: "scope-kjede" },
        ],
        output: [],
      },
      {
        description: "Linje 11: t.inc() igjen — SAMME frame, n blir 2.",
        highlightLine: 11,
        frames: [
          { id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }, { name: "t", value: "{ inc, get }" }], state: "alive" },
          { id: "f1", label: "lagTeller-frame", variables: [{ name: "n", value: "2", closedOver: true }], state: "closure", note: "n: 1 → 2" },
        ],
        arrows: [
          { from: "t.inc, t.get", to: "n i lagTeller-frame", label: "scope-kjede" },
        ],
        output: [],
      },
      {
        description: "Linje 12: t.get() returnerer n. Logges som 2.",
        highlightLine: 12,
        frames: [
          { id: "g", label: "globalt", variables: [{ name: "lagTeller", value: "ƒ" }, { name: "t", value: "{ inc, get }" }], state: "alive" },
          { id: "f1", label: "lagTeller-frame", variables: [{ name: "n", value: "2", closedOver: true }], state: "closure" },
        ],
        arrows: [
          { from: "t.inc, t.get", to: "n i lagTeller-frame", label: "scope-kjede" },
        ],
        output: ["2"],
      },
    ],
  },
  {
    id: "loop-var-let",
    title: "Loop med var vs let — klassisk closure-bug",
    code: `// FEIL — alle setTimeout-ene deler SAMME i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// (var er funksjons-scoped — én eneste i)`,
    takeaway:
      "Med `var` er det BARE ÉN i i hele løkken — alle tre callbacks peker til samme variabel. Når de kjører er løkken ferdig og i = 3. Med `let` får hver iterasjon sin EGEN binding (ny frame), og hver callback lukker over sin egen i.",
    steps: [
      {
        description: "Før løkka — én eneste `i` finnes i scope-et.",
        highlightLine: 2,
        frames: [
          { id: "g", label: "ytre scope", variables: [{ name: "i", value: "0" }], state: "alive" },
        ],
        arrows: [],
        output: [],
      },
      {
        description: "Iter 0: scheduler callback som peker til `i`. i blir 1.",
        highlightLine: 3,
        frames: [
          { id: "g", label: "ytre scope", variables: [{ name: "i", value: "1", closedOver: true }], state: "alive", note: "én delt i" },
        ],
        arrows: [
          { from: "cb0 (i task-queue)", to: "i", label: "lukker over" },
        ],
        output: [],
      },
      {
        description: "Iter 1: ny callback, men peker til SAMME i. i blir 2.",
        highlightLine: 3,
        frames: [
          { id: "g", label: "ytre scope", variables: [{ name: "i", value: "2", closedOver: true }], state: "alive", note: "fortsatt én delt i" },
        ],
        arrows: [
          { from: "cb0, cb1 (i task-queue)", to: "i", label: "begge lukker over samme" },
        ],
        output: [],
      },
      {
        description: "Iter 2: tredje callback, samme i. i blir 3, løkka avsluttes.",
        highlightLine: 3,
        frames: [
          { id: "g", label: "ytre scope", variables: [{ name: "i", value: "3", closedOver: true }], state: "alive" },
        ],
        arrows: [
          { from: "cb0, cb1, cb2 (i task-queue)", to: "i", label: "alle tre peker hit" },
        ],
        output: [],
      },
      {
        description: "Tasks kjører nå — alle leser samme i. Output: 3, 3, 3.",
        highlightLine: 3,
        frames: [
          { id: "g", label: "ytre scope", variables: [{ name: "i", value: "3", closedOver: true }], state: "alive" },
        ],
        arrows: [
          { from: "cb0, cb1, cb2", to: "i = 3", label: "leser samme verdi" },
        ],
        output: ["3", "3", "3"],
      },
    ],
  },
  {
    id: "loop-let-fix",
    title: "Samme løkke — men med let",
    code: `// RIKTIG — let lager ny binding per iterasjon
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
    takeaway:
      "let er blokk-scoped. Hver gang løkkekroppen kjører får den en NY i-binding (en ny mini-frame). Hver callback lukker over sin egen kopi. Output: 0, 1, 2.",
    steps: [
      {
        description: "Iter 0: ny blokk-frame med i=0. Callback lukker over DENNE frame-en.",
        highlightLine: 2,
        frames: [
          { id: "i0", label: "iter-0-frame", variables: [{ name: "i", value: "0", closedOver: true }], state: "closure" },
        ],
        arrows: [{ from: "cb0", to: "i (iter-0)", label: "egen i" }],
        output: [],
      },
      {
        description: "Iter 1: ny separat frame med sin egen i=1.",
        highlightLine: 2,
        frames: [
          { id: "i0", label: "iter-0-frame", variables: [{ name: "i", value: "0", closedOver: true }], state: "closure" },
          { id: "i1", label: "iter-1-frame", variables: [{ name: "i", value: "1", closedOver: true }], state: "closure" },
        ],
        arrows: [
          { from: "cb0", to: "i (iter-0)", label: "egen i" },
          { from: "cb1", to: "i (iter-1)", label: "egen i" },
        ],
        output: [],
      },
      {
        description: "Iter 2: tredje frame, i=2.",
        highlightLine: 2,
        frames: [
          { id: "i0", label: "iter-0-frame", variables: [{ name: "i", value: "0", closedOver: true }], state: "closure" },
          { id: "i1", label: "iter-1-frame", variables: [{ name: "i", value: "1", closedOver: true }], state: "closure" },
          { id: "i2", label: "iter-2-frame", variables: [{ name: "i", value: "2", closedOver: true }], state: "closure" },
        ],
        arrows: [
          { from: "cb0", to: "i (iter-0)", label: "0" },
          { from: "cb1", to: "i (iter-1)", label: "1" },
          { from: "cb2", to: "i (iter-2)", label: "2" },
        ],
        output: [],
      },
      {
        description: "Callbacks kjører — hver leser sin egen i. Output: 0, 1, 2.",
        highlightLine: 3,
        frames: [
          { id: "i0", label: "iter-0-frame", variables: [{ name: "i", value: "0", closedOver: true }], state: "closure" },
          { id: "i1", label: "iter-1-frame", variables: [{ name: "i", value: "1", closedOver: true }], state: "closure" },
          { id: "i2", label: "iter-2-frame", variables: [{ name: "i", value: "2", closedOver: true }], state: "closure" },
        ],
        arrows: [],
        output: ["0", "1", "2"],
      },
    ],
  },
];

export function ClosureScopeViz() {
  const [snippetId, setSnippetId] = useState(SNIPPETS[0].id);
  const [stepIdx, setStepIdx] = useState(0);

  const snippet = useMemo(
    () => SNIPPETS.find(s => s.id === snippetId) ?? SNIPPETS[0],
    [snippetId],
  );
  const step = snippet.steps[stepIdx];

  useEffect(() => {
    setStepIdx(0);
  }, [snippetId]);

  const codeLines = snippet.code.split("\n");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Closure-scope — frames og lukninger
        </span>
        <select
          value={snippetId}
          onChange={e => setSnippetId(e.target.value)}
          className="text-xs font-mono rounded-md border border-border bg-background px-2 py-1"
        >
          {SNIPPETS.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
        <div className="p-4 bg-muted/5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Kode</div>
          <pre className="font-mono text-xs leading-relaxed">
            {codeLines.map((line, i) => {
              const lineNum = i + 1;
              const isActive = lineNum === step.highlightLine;
              return (
                <div
                  key={i}
                  className={cn(
                    "px-2 -mx-2 rounded transition-colors",
                    isActive && "bg-brand/20 border-l-2 border-brand",
                  )}
                >
                  <span className="inline-block w-6 text-muted-foreground text-right pr-2 select-none">
                    {lineNum}
                  </span>
                  <span>{line || " "}</span>
                </div>
              );
            })}
          </pre>
          <div className="mt-4 text-[11px] text-muted-foreground italic border-t border-border pt-3">
            {step.description}
          </div>
        </div>

        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Scope-frames
          </div>
          <div className="space-y-2">
            {step.frames.map(frame => (
              <div
                key={frame.id}
                className={cn(
                  "rounded-lg border-2 p-2.5 transition-colors",
                  frame.state === "alive" && "border-brand bg-brand/5",
                  frame.state === "closure" && "border-purple-500 bg-purple-500/5 border-dashed",
                  frame.state === "dead" && "border-border bg-muted/20 opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold font-mono">{frame.label}</span>
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider rounded px-1.5 py-0.5 border",
                      frame.state === "alive" && "border-brand text-brand",
                      frame.state === "closure" && "border-purple-500 text-purple-700 dark:text-purple-300",
                      frame.state === "dead" && "border-border text-muted-foreground",
                    )}
                  >
                    {frame.state === "alive" ? "på stack" : frame.state === "closure" ? "closure (lever)" : "død"}
                  </span>
                </div>
                <div className="space-y-1">
                  {frame.variables.map((v, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2 font-mono text-xs px-2 py-1 rounded",
                        v.closedOver
                          ? "bg-purple-500/15 border border-purple-500/40"
                          : "bg-background border border-border",
                      )}
                    >
                      <span className={v.closedOver ? "text-purple-700 dark:text-purple-300 font-semibold" : ""}>
                        {v.name}
                      </span>
                      <span className="text-muted-foreground">=</span>
                      <span>{v.value}</span>
                      {v.closedOver && (
                        <span className="ml-auto text-[9px] uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          lukket over
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {frame.note && (
                  <div className="text-[10px] text-muted-foreground italic mt-1.5">{frame.note}</div>
                )}
              </div>
            ))}
          </div>

          {step.arrows.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Referanser
              </div>
              <div className="space-y-1">
                {step.arrows.map((arrow, i) => (
                  <div key={i} className="text-[11px] font-mono flex items-center gap-1.5 flex-wrap">
                    <span className="rounded border border-border bg-background px-1.5 py-0.5">{arrow.from}</span>
                    <span className="text-brand">──{arrow.label}──▶</span>
                    <span className="rounded border border-purple-500/40 bg-purple-500/10 px-1.5 py-0.5">
                      {arrow.to}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Console-output
            </div>
            <div className="rounded-md border border-border bg-background p-2 font-mono text-xs min-h-[2rem]">
              {step.output.length === 0 ? (
                <span className="text-muted-foreground italic">(ingenting enda)</span>
              ) : (
                step.output.map((o, i) => (
                  <div key={i}>
                    <span className="text-muted-foreground">› </span>
                    {o}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-2 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="rounded-md border border-border bg-background hover:border-brand/40 disabled:opacity-30 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
        >
          <ChevronLeft className="h-3 w-3" /> forrige
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(i => Math.min(snippet.steps.length - 1, i + 1))}
          disabled={stepIdx >= snippet.steps.length - 1}
          className="rounded-md border border-brand bg-brand text-white hover:bg-brand/90 disabled:opacity-30 px-3 py-1 text-[11px] font-mono font-semibold flex items-center gap-1"
        >
          neste <ChevronRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(0)}
          className="rounded-md border border-border bg-background hover:border-brand/40 px-2 py-1 text-[11px] font-mono flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> reset
        </button>
        <span className="text-[11px] font-mono text-muted-foreground ml-auto">
          steg {stepIdx + 1}/{snippet.steps.length}
        </span>
      </div>

      <div className="border-t border-border bg-brand/5 px-4 py-3 text-[12px] text-muted-foreground">
        {snippet.takeaway}
      </div>
    </div>
  );
}
