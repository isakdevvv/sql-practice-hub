import { useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANSLAG_OPPGAVER } from "@/lib/dte2507/skjelettEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 1 — ANSLÅ-SÅ-SJEKK.
//
// Ligger FØR forklaringene. Ingen poengsum og ingen «feil»-stempel: et anslag
// som bommer gjør nøyaktig jobben sin, nemlig å gjøre forklaringen etterpå
// interessant. Derfor er språket «du anslo X — det som skjer er Y».
// ---------------------------------------------------------------------------

export function AnslaForst() {
  const [idx, setIdx] = useState(0);
  const [anslag, setAnslag] = useState<Record<string, string>>({});

  const item = ANSLAG_OPPGAVER[idx];
  const valgt = anslag[item.id];
  const avslort = Boolean(valgt);
  const traff = valgt === item.riktig;
  const antallSvart = Object.keys(anslag).length;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HelpCircle className="h-4 w-4 text-brand" />
          Anslå først
          <span className="text-xs font-normal text-muted-foreground">
            {idx + 1} / {ANSLAG_OPPGAVER.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{antallSvart} anslått</span>
          {antallSvart > 0 && (
            <button
              onClick={() => setAnslag({})}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Nullstill
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{item.setup}</p>
        <p className="mt-2 font-medium leading-relaxed">{item.question}</p>

        <div className="mt-3 grid gap-2">
          {item.valg.map((o) => {
            const erAnslag = valgt === o.id;
            const erRiktig = o.id === item.riktig;
            return (
              <button
                key={o.id}
                onClick={() => {
                  if (!avslort) setAnslag((a) => ({ ...a, [item.id]: o.id }));
                }}
                disabled={avslort}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !avslort && "hover:bg-accent",
                  avslort && erRiktig && "border-emerald-500/70 bg-emerald-500/10",
                  avslort && erAnslag && !erRiktig && "border-amber-500/70 bg-amber-500/10",
                  avslort && !erRiktig && !erAnslag && "opacity-50",
                )}
              >
                <span className="mr-2 font-mono text-xs text-muted-foreground">{o.id}.</span>
                {o.label}
                {avslort && erAnslag && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    ditt anslag
                  </span>
                )}
                {avslort && erRiktig && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    det som skjer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {avslort && (
          <div className="mt-4 rounded-lg border border-brand/40 bg-brand/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              {traff ? "Du traff — men grunnen er det viktige" : "Ikke det du trodde"}
            </div>
            <p className="mt-2 text-sm leading-relaxed">{item.reveal}</p>
            <p className="mt-2 border-t border-brand/20 pt-2 text-sm font-medium">{item.punch}</p>
          </div>
        )}

        {!avslort && (
          <p className="mt-3 text-xs text-muted-foreground">
            Velg det du tror skjer. Du kan ikke svare feil her — poenget er å ha en mening før
            forklaringen kommer.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <button
            onClick={() => setIdx((i) => (i - 1 + ANSLAG_OPPGAVER.length) % ANSLAG_OPPGAVER.length)}
            className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Forrige
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % ANSLAG_OPPGAVER.length)}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Neste <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
