import { useMemo, useState } from "react";

// PipelineFlowAnim — visualiser
//   cat access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -5
// trinn for trinn. Slider 0..N velger hvilket trinn vi har kommet til,
// hver fase viser sin spesifikke transformasjon (filter, projeksjon,
// sortering, gruppering). Linjer fades inn/ut når de filtreres bort.

const ACCESS_LOG = `1.2.3.4 - - [10/Oct/2026:13:55:01 +0000] "GET /api/users HTTP/1.1" 200 1024
5.6.7.8 - - [10/Oct/2026:13:56:12 +0000] "GET /api/items HTTP/1.1" 500 89
1.2.3.4 - - [10/Oct/2026:13:57:30 +0000] "POST /api/login HTTP/1.1" 401 256
9.10.11.12 - - [10/Oct/2026:13:58:02 +0000] "GET / HTTP/1.1" 200 4096
1.2.3.4 - - [10/Oct/2026:13:59:44 +0000] "GET /api/users HTTP/1.1" 200 1024
5.6.7.8 - - [10/Oct/2026:14:00:07 +0000] "GET /api/items HTTP/1.1" 503 89
1.2.3.4 - - [10/Oct/2026:14:01:22 +0000] "GET /api/users HTTP/1.1" 200 1024
9.10.11.12 - - [10/Oct/2026:14:02:55 +0000] "GET / HTTP/1.1" 200 4096
5.6.7.8 - - [10/Oct/2026:14:03:11 +0000] "GET /api/items HTTP/1.1" 500 89
1.2.3.4 - - [10/Oct/2026:14:04:48 +0000] "GET /api/users HTTP/1.1" 200 1024`;

interface Stage {
  cmd: string;
  label: string;
  short: string;
  run: (input: string[]) => string[];
  hint: string;
}

const STAGES: Stage[] = [
  {
    cmd: "cat access.log",
    label: "cat — les filen til stdout",
    short: "cat",
    run: () => ACCESS_LOG.split("\n"),
    hint: "Hver linje sendes som-er videre til pipen.",
  },
  {
    cmd: "awk '{print $7}'",
    label: "awk — plukk felt 7 (URL-pathen)",
    short: "awk",
    run: (input) =>
      input
        .map((l) => l.split(/\s+/)[6] ?? "")
        .filter((s) => s.length > 0),
    hint: "Etter standard whitespace-split er $7 stien i en access-log-linje.",
  },
  {
    cmd: "sort",
    label: "sort — alfabetisk (grupper like linjer ved siden av hverandre)",
    short: "sort",
    run: (input) => [...input].sort(),
    hint: "uniq -c trenger like linjer ved siden av hverandre — derfor sort FØRST.",
  },
  {
    cmd: "uniq -c",
    label: "uniq -c — tell påfølgende duplikater",
    short: "uniq -c",
    run: (input) => {
      const out: string[] = [];
      let cur: string | null = null;
      let count = 0;
      for (const l of input) {
        if (l === cur) count++;
        else {
          if (cur !== null) out.push(`   ${String(count).padStart(3, " ")} ${cur}`);
          cur = l;
          count = 1;
        }
      }
      if (cur !== null) out.push(`   ${String(count).padStart(3, " ")} ${cur}`);
      return out;
    },
    hint: "uniq alene ser bare ETT trinn bak — det er derfor sort er nødvendig.",
  },
  {
    cmd: "sort -rn",
    label: "sort -rn — numerisk synkende på første kolonne (count)",
    short: "sort -rn",
    run: (input) => {
      return [...input].sort((a, b) => {
        const na = Number(a.trim().split(/\s+/)[0]);
        const nb = Number(b.trim().split(/\s+/)[0]);
        return nb - na;
      });
    },
    hint: "-r reverserer, -n tolker som tall (ellers ville '10' komme før '2').",
  },
  {
    cmd: "head -5",
    label: "head -5 — bare topp 5",
    short: "head -5",
    run: (input) => input.slice(0, 5),
    hint: "Velg de 5 mest frekvente — klassisk «top-N»-mønster.",
  },
];

export function PipelineFlowAnim() {
  const [step, setStep] = useState(STAGES.length);

  // Compute output after each stage (cumulative)
  const stageOutputs = useMemo(() => {
    const outs: string[][] = [];
    let cur: string[] = [];
    for (let i = 0; i < STAGES.length; i++) {
      cur = STAGES[i].run(cur);
      outs.push(cur);
    }
    return outs;
  }, []);

  const visibleOutputs = stageOutputs.slice(0, step);
  const fullCmd = STAGES.map((s) => s.cmd).join(" | ");

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-base">PipelineFlowAnim</h3>
        <p className="text-xs text-muted-foreground">
          Den klassiske pipelinen <em>top-N URLer i en access-log</em> — bygg den
          opp ledd for ledd og se hva som skjer i hver fase.
        </p>
      </div>

      <pre className="font-mono text-[11px] p-3 rounded-lg border border-brand/30 bg-brand/5 whitespace-pre-wrap break-all">
        {fullCmd}
      </pre>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={STAGES.length}
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            className="flex-1 accent-brand"
          />
          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-[11px] px-2 py-1 rounded border border-border bg-muted/30 hover:bg-muted/60"
          >
            ↺
          </button>
          <button
            type="button"
            onClick={() => setStep(Math.min(STAGES.length, step + 1))}
            className="text-[11px] px-2 py-1 rounded border border-border bg-muted/30 hover:bg-muted/60"
            disabled={step === STAGES.length}
          >
            +1
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STAGES.map((s, i) => (
            <button
              key={s.short}
              type="button"
              onClick={() => setStep(i + 1)}
              className={`text-[10px] font-mono px-1.5 py-1 rounded border transition-colors ${
                step >= i + 1
                  ? step === i + 1
                    ? "border-brand bg-brand/20 text-brand font-semibold"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              {i + 1}. {s.short}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-3">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Pipeline-stadier
          </div>
          <div className="flex flex-col gap-1">
            {STAGES.map((s, i) => {
              const reached = step > i;
              const active = step === i + 1;
              return (
                <div
                  key={s.short}
                  className={`relative px-3 py-2 rounded-lg border text-xs transition-all ${
                    active
                      ? "border-brand bg-brand/10"
                      : reached
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-border bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="font-mono font-semibold">{s.cmd}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
                  {i < STAGES.length - 1 && (
                    <div
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-base leading-none select-none ${
                        reached ? "text-emerald-500" : "text-muted-foreground/30"
                      }`}
                    >
                      |
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Strøm gjennom pipen
          </div>
          <div className="space-y-2 max-h-[28rem] overflow-auto pr-1">
            {visibleOutputs.length === 0 ? (
              <div className="text-xs text-muted-foreground italic p-3 rounded-lg border border-dashed border-border">
                Dra slideren til høyre eller klikk et stadium for å starte strømmen.
              </div>
            ) : (
              visibleOutputs.map((out, i) => {
                const isLast = i === visibleOutputs.length - 1;
                const prev = i === 0 ? null : visibleOutputs[i - 1];
                const removed = prev ? prev.length - out.length : 0;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border ${
                      isLast ? "border-brand/40 bg-brand/5" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/20">
                      <div className="font-mono text-[11px] font-semibold">
                        <span className="text-muted-foreground">{i + 1}. </span>
                        {STAGES[i].cmd}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {out.length} linje{out.length === 1 ? "" : "r"}
                        {removed > 0 && (
                          <span className="ml-2 text-rose-600 dark:text-rose-400">
                            −{removed} fjernet
                          </span>
                        )}
                      </div>
                    </div>
                    <pre className="font-mono text-[11px] p-3 whitespace-pre-wrap break-all max-h-44 overflow-auto">
                      {out.join("\n") || <span className="text-muted-foreground italic">(tomt)</span>}
                    </pre>
                    {isLast && (
                      <div className="px-3 py-1.5 text-[11px] text-muted-foreground border-t border-border/50 bg-muted/10">
                        <span className="font-semibold text-brand mr-1">Merk:</span>
                        {STAGES[i].hint}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
