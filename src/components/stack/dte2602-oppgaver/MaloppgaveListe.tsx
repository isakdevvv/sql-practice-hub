import { useMemo, useState } from "react";
import { Check, CircleCheck, CircleAlert, CircleX, RotateCcw, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Maloppgave, MalNiva } from "@/lib/dte2602/oppgaveTyper";
import { OppgaveRamme, Kontekstboks, useOppgaveModus } from "./OppgaveModus";

/**
 * Type 3 — måloppgave med tilstandssjekk.
 *
 * Forskjellen fra en flervalgsoppgave er hva som sjekkes. Her definerer hver
 * oppgave et predikat over den SAMLEDE tilstanden av alle valgene dine, og
 * svarer med ett av tre nivåer:
 *
 *   riktig      — tilstanden oppfyller målet
 *   forsvarlig  — tilstanden er ikke gal, men det finnes en avveining du
 *                 bør kjenne til, og tilbakemeldingen forklarer den
 *   feil        — tilstanden bryter med målet, og du får vite nøyaktig hvordan
 *
 * «Forsvarlig» er hele poenget. I maskinlæring finnes det som regel flere
 * forsvarlige valg, og en oppgave som bare sier riktig/feil lærer bort noe som
 * ikke er sant om faget.
 */
export function MaloppgaveListe({ oppgaver }: { oppgaver: Maloppgave[] }) {
  return (
    <div className="space-y-4">
      {oppgaver.map((o, i) => (
        <MaloppgaveKort key={o.id} oppgave={o} nr={i + 1} av={oppgaver.length} />
      ))}
    </div>
  );
}

function MaloppgaveKort({
  oppgave,
  nr,
  av,
}: {
  oppgave: Maloppgave;
  nr: number;
  av: number;
}) {
  const modus = useOppgaveModus();
  const [valgt, setValgt] = useState<Record<string, string>>({});
  const [sjekket, setSjekket] = useState(false);

  const alleValgt = oppgave.valg.every((v) => valgt[v.id] !== undefined);
  const vurdering = useMemo(
    () => (sjekket && alleValgt ? oppgave.vurder(valgt) : null),
    [sjekket, alleValgt, oppgave, valgt],
  );

  function nullstill() {
    setValgt({});
    setSjekket(false);
  }

  return (
    <OppgaveRamme type="maal" nr={nr} av={av} tittel={oppgave.tittel}>
      <p className="text-sm text-muted-foreground leading-relaxed">{oppgave.situasjon}</p>
      {oppgave.kontekst && <Kontekstboks tekst={oppgave.kontekst} />}

      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 px-3 py-2.5">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-0.5">
          Måltilstand
        </div>
        <p className="text-sm text-foreground leading-snug">{oppgave.maal}</p>
      </div>

      <div className="mt-4 space-y-4">
        {oppgave.valg.map((v) => (
          <div key={v.id}>
            <div className="text-xs font-medium text-foreground mb-1.5">{v.sporsmal}</div>
            <div className="grid gap-1.5">
              {v.alternativer.map((alt) => {
                const erValgt = valgt[v.id] === alt.id;
                return (
                  <button
                    key={alt.id}
                    onClick={() => {
                      setValgt((s) => ({ ...s, [v.id]: alt.id }));
                      setSjekket(false);
                    }}
                    className={cn(
                      "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                      erValgt
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1 h-3 w-3 shrink-0 rounded-full border",
                          erValgt ? "border-brand bg-brand" : "border-muted-foreground/40",
                        )}
                      />
                      {alt.tekst}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSjekket(true)}
          disabled={!alleValgt}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            alleValgt
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <Check className="h-3.5 w-3.5" /> Sjekk tilstanden
        </button>
        {(sjekket || Object.keys(valgt).length > 0) && (
          <button
            onClick={nullstill}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
        )}
        {!alleValgt && (
          <span className="text-[11px] text-muted-foreground">
            Ta stilling til alle {oppgave.valg.length} valgene — det er kombinasjonen
            som sjekkes, ikke ett valg av gangen.
          </span>
        )}
      </div>

      {vurdering && <VurderingBoks niva={vurdering.niva} tittel={vurdering.tittel} forklaring={vurdering.forklaring} />}

      {modus === "laer" && !sjekket && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Eye className="h-3.5 w-3.5 mt-px shrink-0" />
          I læringsmodus koster det ingenting å prøve en kombinasjon du er usikker
          på. Test gjerne et valg du mistenker er galt — tilbakemeldingen forklarer
          hvorfor, og det er ofte den mest lærerike veien.
        </p>
      )}
    </OppgaveRamme>
  );
}

function VurderingBoks({
  niva,
  tittel,
  forklaring,
}: {
  niva: MalNiva;
  tittel: string;
  forklaring: string;
}) {
  const stil = {
    riktig: {
      ramme: "border-success/40 bg-success/5",
      tekst: "text-success",
      Ikon: CircleCheck,
      etikett: "Målet er nådd",
    },
    forsvarlig: {
      ramme: "border-amber-500/40 bg-amber-500/5",
      tekst: "text-amber-600 dark:text-amber-400",
      Ikon: CircleAlert,
      etikett: "Forsvarlig — med en avveining",
    },
    feil: {
      ramme: "border-red-500/40 bg-red-500/5",
      tekst: "text-red-600 dark:text-red-400",
      Ikon: CircleX,
      etikett: "Målet er ikke nådd",
    },
  }[niva];
  const Ikon = stil.Ikon;

  return (
    <div className={cn("mt-4 rounded-lg border p-4", stil.ramme)}>
      <div className={cn("flex items-center gap-2 text-sm font-medium", stil.tekst)}>
        <Ikon className="h-4 w-4" />
        {stil.etikett}
      </div>
      <div className="mt-1.5 font-medium text-sm text-foreground">{tittel}</div>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{forklaring}</p>
    </div>
  );
}
