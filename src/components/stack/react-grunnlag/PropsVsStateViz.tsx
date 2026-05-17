// Visualiser "props ned, callbacks opp"-mønsteret.
// Parent eier en liste med state-felt. Studenten kan endre verdier i parent
// og se at child re-rendrer (puls-animasjon). Child har bare props og en
// callback-knapp som ringer opp til parent.

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Field = "tema" | "navn" | "antall";

const TEMA_OPTIONS = ["lys", "mork", "auto"] as const;

export function PropsVsStateViz() {
  const [tema, setTema] = useState<(typeof TEMA_OPTIONS)[number]>("lys");
  const [navn, setNavn] = useState("Ada");
  const [antall, setAntall] = useState(3);

  // Render-tellere — viser at child re-rendrer når props endrer seg.
  const parentRenders = useRenderCount();
  const childRenders = useRenderCount();

  // Hvilket felt ble nylig endret — gir flow-animasjon
  const [pulse, setPulse] = useState<Field | null>(null);
  const pulseTimer = useRef<number | null>(null);
  function pulseField(f: Field) {
    setPulse(f);
    if (pulseTimer.current) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setPulse(null), 650);
  }

  // Callback fra child til parent — øker antall
  function onChildInkrement() {
    setAntall((n) => n + 1);
    pulseField("antall");
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Props ned, callbacks opp
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Parent */}
        <div className="rounded-lg border-2 border-sky-500/40 bg-sky-500/5 p-4">
          <div className="flex items-baseline justify-between mb-3">
            <div className="font-mono text-sm font-semibold text-sky-700 dark:text-sky-300">
              &lt;Forelder /&gt;
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              renders: {parentRenders}
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            useState (eies av forelder)
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FieldBox label="tema" pulsing={pulse === "tema"}>
              <div className="flex gap-1">
                {TEMA_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTema(t);
                      pulseField("tema");
                    }}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px] font-mono transition-colors",
                      tema === t
                        ? "border-sky-500 bg-sky-500 text-white"
                        : "border-border bg-background hover:border-sky-300",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FieldBox>
            <FieldBox label="navn" pulsing={pulse === "navn"}>
              <input
                type="text"
                value={navn}
                onChange={(e) => {
                  setNavn(e.target.value);
                  pulseField("navn");
                }}
                className="w-full rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono"
              />
            </FieldBox>
            <FieldBox label="antall" pulsing={pulse === "antall"}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAntall((n) => Math.max(0, n - 1));
                    pulseField("antall");
                  }}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:border-sky-300"
                >
                  −
                </button>
                <span className="font-mono text-sm w-6 text-center">{antall}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAntall((n) => n + 1);
                    pulseField("antall");
                  }}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] hover:border-sky-300"
                >
                  +
                </button>
              </div>
            </FieldBox>
          </div>
        </div>

        {/* Flow-arrows */}
        <div className="grid grid-cols-2 gap-4 text-[11px]">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
            <ArrowDown className="h-4 w-4" />
            <span className="font-mono">props ned</span>
            <span className="text-muted-foreground">— React re-rendrer child</span>
          </div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 justify-end">
            <span className="text-muted-foreground">— child trigger parent state-update</span>
            <span className="font-mono">callback opp</span>
            <ArrowUp className="h-4 w-4" />
          </div>
        </div>

        {/* Child */}
        <div className="rounded-lg border-2 border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="flex items-baseline justify-between mb-3">
            <div className="font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              &lt;Barn tema={"{tema}"} navn={"{navn}"} antall={"{antall}"} onInc={"{onChildInkrement}"} /&gt;
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              renders: {childRenders}
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Props (read-only — kan ikke endre selv)
          </div>
          <div className="rounded-md border border-emerald-500/30 bg-background p-3 mb-3">
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">tema:</span>{" "}
                <span className="text-emerald-700 dark:text-emerald-300">{`"${tema}"`}</span>
              </div>
              <div>
                <span className="text-muted-foreground">navn:</span>{" "}
                <span className="text-emerald-700 dark:text-emerald-300">{`"${navn}"`}</span>
              </div>
              <div>
                <span className="text-muted-foreground">antall:</span>{" "}
                <span className="text-emerald-700 dark:text-emerald-300">{antall}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onChildInkrement}
            className="rounded-md border border-amber-400 bg-amber-500/15 px-3 py-1 text-xs hover:bg-amber-500/25 text-amber-800 dark:text-amber-200"
          >
            props.onInc() ↑ (be forelder øke antall)
          </button>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
        Barnet kan <strong>aldri</strong> skrive til <code>props.antall</code>. Det må be forelderen
        endre staten via en callback. Slik holder vi en enkel dataflyt: én sannhetskilde per verdi.
      </div>
    </div>
  );
}

function FieldBox({
  label,
  pulsing,
  children,
}: {
  label: string;
  pulsing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background p-2 transition-shadow",
        pulsing && "ring-2 ring-sky-400 shadow-md shadow-sky-200/50",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

// Tell renderinger ved å øke et ref i selve render-fasen.
// (Greit her — komponenten skal nettopp demonstrere hvor mange ganger
// den rendret. Strict-mode dobbel-render i dev godtas.)
function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}
