import { useState } from "react";
import { Check, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnslagOppgave } from "@/lib/dte2602/oppgaveTyper";
import { OppgaveRamme, Kontekstboks } from "./OppgaveModus";

/**
 * Type 1 — anslå-så-sjekk.
 *
 * Jobben til denne typen er å lage et hull hjernen vil fylle, FØR forklaringen
 * kommer. Derfor er den bygget annerledes enn en vanlig flervalgsoppgave:
 *
 *  - Du må velge før du får se noe. Det finnes ingen «vis fasit»-knapp, heller
 *    ikke i læringsmodus — et anslag du ikke tør avgi gir ingen læringseffekt.
 *  - Hvert alternativ har sin egen tilbakemelding. Et anslag som bommer er
 *    ikke «feil», det er utgangspunktet for forklaringen.
 *  - Poenget («hvorfor») vises uansett hva du valgte.
 */
export function AnslagListe({ oppgaver }: { oppgaver: AnslagOppgave[] }) {
  const [svar, setSvar] = useState<Record<string, string>>({});

  const besvart = Object.keys(svar).length;
  const traff = oppgaver.filter((o) => svar[o.id] === o.fasit).length;

  return (
    <div className="space-y-4">
      {oppgaver.map((o, i) => (
        <AnslagKort
          key={o.id}
          oppgave={o}
          nr={i + 1}
          av={oppgaver.length}
          valgt={svar[o.id]}
          velg={(id) => setSvar((s) => (s[o.id] ? s : { ...s, [o.id]: id }))}
        />
      ))}
      {besvart > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Du har avgitt {besvart} av {oppgaver.length} anslag, og truffet på{" "}
          <span className="text-foreground font-medium tabular-nums">{traff}</span>.
          {traff < besvart && (
            <>
              {" "}
              De du bommet på er de mest verdifulle — det var der modellen din av
              hvordan dette henger sammen ikke stemte med virkeligheten.
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AnslagKort({
  oppgave,
  nr,
  av,
  valgt,
  velg,
}: {
  oppgave: AnslagOppgave;
  nr: number;
  av: number;
  valgt: string | undefined;
  velg: (id: string) => void;
}) {
  const harSvart = valgt !== undefined;
  const traff = valgt === oppgave.fasit;
  const valgtAlt = oppgave.alternativer.find((a) => a.id === valgt);

  return (
    <OppgaveRamme type="anslag" nr={nr} av={av}>
      <p className="text-sm text-foreground leading-relaxed">{oppgave.sporsmal}</p>
      {oppgave.kontekst && <Kontekstboks tekst={oppgave.kontekst} />}

      <div className="mt-4 space-y-2">
        {oppgave.alternativer.map((alt) => {
          const erValgt = alt.id === valgt;
          const erFasit = alt.id === oppgave.fasit;
          return (
            <button
              key={alt.id}
              onClick={() => velg(alt.id)}
              disabled={harSvart}
              className={cn(
                "w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors",
                !harSvart && "border-border bg-background hover:border-violet-500/50 hover:bg-violet-500/5",
                harSvart && erFasit && "border-success/50 bg-success/5",
                harSvart && erValgt && !erFasit && "border-amber-500/50 bg-amber-500/5",
                harSvart && !erValgt && !erFasit && "border-border bg-background opacity-55",
              )}
            >
              <span className="flex items-start gap-2">
                {harSvart && erFasit && (
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                )}
                <span className="text-foreground">{alt.tekst}</span>
              </span>
            </button>
          );
        })}
      </div>

      {!harSvart && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Velg før du leser videre. Et anslag du tør avgi gjør forklaringen langt
          lettere å huske — også når anslaget bommer.
        </p>
      )}

      {harSvart && valgtAlt && (
        <div className="mt-4 space-y-3">
          <div
            className={cn(
              "rounded-lg border p-4",
              traff ? "border-success/40 bg-success/5" : "border-amber-500/40 bg-amber-500/5",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                traff ? "text-success" : "text-amber-600 dark:text-amber-400",
              )}
            >
              {traff ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
              {traff ? "Du traff" : "Du bommet — og det er den nyttige varianten"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {valgtAlt.respons}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-brand" /> Poenget
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {oppgave.hvorfor}
            </p>
          </div>
        </div>
      )}
    </OppgaveRamme>
  );
}
