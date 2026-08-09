import { useState } from "react";
import { Bug, ChevronLeft, ChevronRight, Terminal, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEILSOK_OPPGAVER, lag as slaaOppLag } from "@/lib/dte2507/skjelettEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 4 — FEILSØKING. Sist i modulen, fordi feilen kan bo i hvilket
// som helst lag. Studenten får observasjonene først og må stille diagnosen
// FØR rettelsen vises. Hvert svaralternativ er merket med hvilket lag det
// ville plassert feilen i — det er nettopp den plasseringen som trenes.
// ---------------------------------------------------------------------------

export function Feilsoking() {
  const [idx, setIdx] = useState(0);
  const [valgt, setValgt] = useState<Record<string, string>>({});

  const o = FEILSOK_OPPGAVER[idx];
  const mitt = valgt[o.id];
  const avslort = Boolean(mitt);
  const riktigId = o.valg.find((v) => v.riktig)?.id;

  return (
    <div className="rounded-xl border-2 border-rose-500/30 bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2.5 text-sm font-semibold">
        <Bug className="h-4 w-4 text-rose-500" />
        Feilsøking
        <span className="text-xs font-normal text-muted-foreground">
          {idx + 1} / {FEILSOK_OPPGAVER.length}
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-medium">{o.tittel}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{o.symptom}</p>

        {/* Observasjonene */}
        <div className="mt-3 space-y-2">
          {o.observasjoner.map((obs) => (
            <div key={obs.kommando} className="overflow-hidden rounded-lg border border-border">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-1.5 font-mono text-[11px]">
                <Terminal className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">$</span>
                <span className="text-foreground">{obs.kommando}</span>
              </div>
              <pre className="overflow-x-auto bg-background px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                {obs.utdata.join("\n")}
              </pre>
            </div>
          ))}
        </div>

        <p className="mt-4 font-medium">{o.sporsmal}</p>

        <div className="mt-3 grid gap-2">
          {o.valg.map((v) => {
            const erMitt = mitt === v.id;
            const erRiktig = v.id === riktigId;
            return (
              <button
                key={v.id}
                onClick={() => {
                  if (!avslort) setValgt((s) => ({ ...s, [o.id]: v.id }));
                }}
                disabled={avslort}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !avslort && "hover:bg-accent",
                  avslort && erRiktig && "border-emerald-500/70 bg-emerald-500/10",
                  avslort && erMitt && !erRiktig && "border-rose-500/70 bg-rose-500/10",
                  avslort && !erRiktig && !erMitt && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{v.id}.</span>
                  <span className="flex-1">{v.label}</span>
                  <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {slaaOppLag(v.lag).navn}
                  </span>
                </div>
                {avslort && (
                  <p className="mt-1.5 border-t border-border/60 pt-1.5 text-[12px] leading-snug text-muted-foreground">
                    {v.hvorfor}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {avslort && (
          <div className="mt-4 rounded-lg border border-brand/40 bg-brand/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand">
              <Wrench className="h-3.5 w-3.5" />
              Fiksen
            </div>
            <p className="mt-1.5 text-sm font-medium">{o.fiks.hva}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {o.fiks.forklaring}
            </p>
            <p className="mt-2 border-t border-brand/20 pt-2 text-sm">
              <span className="font-medium">Lærdommen: </span>
              {o.lesson}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <button
          onClick={() => setIdx((i) => (i - 1 + FEILSOK_OPPGAVER.length) % FEILSOK_OPPGAVER.length)}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Forrige
        </button>
        <button
          onClick={() => setIdx((i) => (i + 1) % FEILSOK_OPPGAVER.length)}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          Neste <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
