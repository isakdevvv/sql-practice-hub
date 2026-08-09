import { useState } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecallKort } from "@/lib/dte2602/oppgaveTyper";
import { useOppgaveModus } from "./OppgaveModus";

/**
 * Type 5 — recall-kort.
 *
 * Med vilje få. DTE-2602 vurderes med hjemmeeksamen og mappeinnlevering, ikke
 * med skriftlig skoleeksamen. Du har notatene dine. Da er det ikke gjenkalling
 * som skiller, og et stort kortsett ville stjålet tid fra måloppgavene og
 * feilsøkingen der forskjellen faktisk avgjøres.
 *
 * Kortene som er igjen er de som må komme umiddelbart — fordi de er
 * beslutninger du tar mens du skriver kode, ikke noe du slår opp.
 */
export function RecallListe({ kort }: { kort: RecallKort[] }) {
  const modus = useOppgaveModus();
  const [apne, setApne] = useState<Record<string, boolean>>(() =>
    modus === "laer" ? Object.fromEntries(kort.map((k) => [k.id, true])) : {},
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Bare {kort.length} kort, og det er et bevisst valg. Vurderingen i dette
          faget er hjemmeeksamen og mappe — du har notatene tilgjengelig. Disse
          kortene er de beslutningene du tar mens du skriver kode, og derfor de
          eneste som må ligge i hodet.
        </span>
      </div>

      {kort.map((k) => {
        const erApen = Boolean(apne[k.id]);
        return (
          <div key={k.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-foreground leading-snug">{k.forside}</p>
              <button
                onClick={() => setApne((a) => ({ ...a, [k.id]: !a[k.id] }))}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors"
              >
                {erApen ? (
                  <>
                    <EyeOff className="h-3 w-3" /> Skjul
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" /> Vis svar
                  </>
                )}
              </button>
            </div>
            <div
              className={cn(
                "grid transition-all",
                erApen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-muted-foreground leading-relaxed">{k.bakside}</p>
                <p className="mt-2 text-xs text-muted-foreground/80 leading-relaxed border-l-2 border-brand/40 pl-3">
                  <span className="font-medium text-foreground/80">Hvorfor dette kortet:</span>{" "}
                  {k.hvorfor}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
