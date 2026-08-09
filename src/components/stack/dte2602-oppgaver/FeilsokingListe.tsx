import { useState } from "react";
import { Bug, Check, X, GraduationCap, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Feilsoking } from "@/lib/dte2602/oppgaveTyper";
import { OppgaveRamme, useOppgaveModus } from "./OppgaveModus";

/**
 * Type 4 — feilsøkingsoppgave. Tyngdepunktet i DTE-2602.
 *
 * Vurderingen er hjemmeeksamen og mappe. Da er det ikke gjenkalling som
 * skiller — det er om du kan se på en pipeline som kjører uten feilmelding,
 * og oppdage at tallet den produserer ikke er til å stole på.
 *
 * Oppgaven går i to steg, med vilje:
 *   1. FINN LINJA. Du klikker på den du tror feilen bor i. Hver linje har sin
 *      egen tilbakemelding, også de riktige — å eliminere en linje skal lære
 *      deg hvorfor akkurat den er i orden.
 *   2. VELG RETTELSEN. Flere rettelser kan være riktige samtidig, og
 *      tilbakemeldingen forklarer forskjellen mellom å fjerne årsaken og å
 *      dempe symptomet.
 */
export function FeilsokingListe({ oppgaver }: { oppgaver: Feilsoking[] }) {
  return (
    <div className="space-y-4">
      {oppgaver.map((o, i) => (
        <FeilsokingKort key={o.id} oppgave={o} nr={i + 1} av={oppgaver.length} />
      ))}
    </div>
  );
}

function FeilsokingKort({
  oppgave,
  nr,
  av,
}: {
  oppgave: Feilsoking;
  nr: number;
  av: number;
}) {
  const modus = useOppgaveModus();
  const [klikket, setKlikket] = useState<number[]>([]);
  const [valgtFiks, setValgtFiks] = useState<string | null>(null);
  const [avslort, setAvslort] = useState(false);

  const sisteKlikk = klikket.length > 0 ? klikket[klikket.length - 1] : null;
  const funnet = klikket.includes(oppgave.feilLinje) || avslort;
  const fiks = oppgave.fikser.find((f) => f.id === valgtFiks);

  function nullstill() {
    setKlikket([]);
    setValgtFiks(null);
    setAvslort(false);
  }

  return (
    <OppgaveRamme type="feilsoking" nr={nr} av={av} tittel={oppgave.tittel}>
      <div className="rounded-lg border border-border bg-background px-3 py-2.5">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
          Symptom
        </div>
        <p className="text-sm text-foreground leading-snug">{oppgave.symptom}</p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {oppgave.format === "kode"
          ? "Klikk på linja du tror feilen bor i. Koden kjører uten feilmelding — feilen er i hva den gjør, ikke i hvordan den er skrevet."
          : "Klikk på steget du tror er feil. Hvert steg er isolert sett rimelig; feilen ligger i sammenhengen."}
      </p>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/30">
        {oppgave.linjer.map((linje) => {
          const erKlikket = klikket.includes(linje.nr);
          const erFeil = linje.nr === oppgave.feilLinje;
          const visSomFeil = (erKlikket || avslort) && erFeil;
          const visSomOk = erKlikket && !erFeil;
          return (
            <button
              key={linje.nr}
              onClick={() =>
                setKlikket((k) => (k.includes(linje.nr) ? k : [...k, linje.nr]))
              }
              className={cn(
                "w-full text-left flex items-start gap-3 px-3 py-1.5 border-b border-border/60 last:border-b-0 transition-colors",
                !erKlikket && !visSomFeil && "hover:bg-amber-500/5",
                visSomFeil && "bg-red-500/10",
                visSomOk && "bg-muted/60 opacity-70",
              )}
            >
              <span
                className={cn(
                  "shrink-0 w-6 text-right tabular-nums text-xs pt-0.5",
                  visSomFeil ? "text-red-500 font-semibold" : "text-muted-foreground",
                )}
              >
                {linje.nr}
              </span>
              <span
                className={cn(
                  "flex-1 leading-relaxed",
                  oppgave.format === "kode"
                    ? "font-mono text-xs whitespace-pre-wrap break-words"
                    : "text-sm",
                  visSomFeil ? "text-foreground" : "text-foreground/90",
                )}
              >
                {linje.tekst}
              </span>
              {visSomFeil && <Bug className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />}
              {visSomOk && <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />}
            </button>
          );
        })}
      </div>

      {sisteKlikk !== null && oppgave.linjeRespons[sisteKlikk] && (
        <div
          className={cn(
            "mt-3 rounded-lg border p-3.5",
            sisteKlikk === oppgave.feilLinje
              ? "border-red-500/40 bg-red-500/5"
              : "border-border bg-background",
          )}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
            Linje {sisteKlikk}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {oppgave.linjeRespons[sisteKlikk]}
          </p>
        </div>
      )}

      {!funnet && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {modus === "laer" && (
            <button
              onClick={() => setAvslort(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Vis hvilken linje det er
            </button>
          )}
          {klikket.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {klikket.length} linje{klikket.length === 1 ? "" : "r"} sjekket. Fortsett —
              å eliminere de riktige linjene er halve jobben.
            </span>
          )}
        </div>
      )}

      {funnet && (
        <div className="mt-4">
          <div className="text-xs font-medium text-foreground mb-1.5">
            Steg 2 — hva er riktig rettelse?
            {oppgave.fikser.filter((f) => f.riktig).length > 1 && (
              <span className="ml-1.5 font-normal text-muted-foreground">
                (flere av dem er riktige)
              </span>
            )}
          </div>
          <div className="grid gap-1.5">
            {oppgave.fikser.map((f) => {
              const erValgt = valgtFiks === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setValgtFiks(f.id)}
                  className={cn(
                    "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                    erValgt && f.riktig && "border-success/50 bg-success/5 text-foreground",
                    erValgt && !f.riktig && "border-red-500/50 bg-red-500/5 text-foreground",
                    !erValgt &&
                      "border-border bg-background text-muted-foreground hover:border-amber-500/40 hover:text-foreground",
                  )}
                >
                  <span className="flex items-start gap-2">
                    {erValgt &&
                      (f.riktig ? (
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      ))}
                    <span>{f.tekst}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {fiks && (
            <div
              className={cn(
                "mt-3 rounded-lg border p-3.5",
                fiks.riktig ? "border-success/40 bg-success/5" : "border-red-500/40 bg-red-500/5",
              )}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{fiks.respons}</p>
            </div>
          )}

          {fiks?.riktig && (
            <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-brand">
                <GraduationCap className="h-4 w-4" /> Lærdommen
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {oppgave.laerdom}
              </p>
            </div>
          )}

          <button
            onClick={nullstill}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Start oppgaven på nytt
          </button>
        </div>
      )}
    </OppgaveRamme>
  );
}
