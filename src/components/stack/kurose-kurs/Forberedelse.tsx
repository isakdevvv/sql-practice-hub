import * as React from "react";
import { Compass, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

/**
 * «Før du løser oppgavene» — metodene, ikke flere oppgaver.
 *
 * Oppgavene nedenfor på siden krever et lite sett gjentakende framgangsmåter.
 * Denne blokka navngir hver av dem, viser oppskriften, og regner gjennom ETT
 * eksempel med andre tall enn oppgavene bruker. Poenget er at du skal kjenne
 * igjen «dette er en L/R-oppgave» før du begynner å regne — ikke at du skal ha
 * sett akkurat den oppgaven før.
 *
 * Eksempelet er kollapset som standard, slik at du kan prøve å bruke
 * oppskriften selv først.
 */

export type Metode = {
  /** Kort navn du skal kunne kjenne igjen oppgaven på. */
  navn: string;
  /** Når denne metoden er den riktige. */
  naar: React.ReactNode;
  /** Selve oppskriften — formel eller steg. */
  oppskrift: React.ReactNode;
  /** Gjennomregnet eksempel med ANDRE tall enn oppgavene. */
  eksempel: { oppgave: React.ReactNode; steg: React.ReactNode[]; svar: React.ReactNode };
  /** Den typiske feilen. */
  felle: React.ReactNode;
};

export function Forberedelse({
  intro,
  metoder,
}: {
  intro: React.ReactNode;
  metoder: Metode[];
}) {
  return (
    <div className="rounded-xl border border-brand/30 bg-brand/5 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-brand/20 px-4 py-2.5">
        <Compass className="h-4 w-4 shrink-0 text-brand" />
        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
          Før du løser oppgavene
        </span>
      </div>
      <p className="px-4 pt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>
      <div className="space-y-2 p-4 pt-3">
        {metoder.map((m, i) => (
          <MetodeKort key={i} metode={m} nr={i + 1} />
        ))}
      </div>
    </div>
  );
}

function MetodeKort({ metode, nr }: { metode: Metode; nr: number }) {
  const [apen, setApen] = React.useState(false);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-semibold text-brand">M{nr}</span>
          <span className="text-sm font-semibold text-foreground">{metode.navn}</span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Når:</span> {metode.naar}
        </p>
        <div className="mt-2 rounded border border-border bg-muted/30 px-2.5 py-1.5 text-xs leading-relaxed text-foreground">
          {metode.oppskrift}
        </div>
      </div>

      <button
        onClick={() => setApen((a) => !a)}
        className="flex w-full items-center gap-1.5 border-t border-border px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted/40"
        aria-expanded={apen}
      >
        {apen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {apen ? "Skjul gjennomregnet eksempel" : "Prøv oppskriften selv først — så åpne eksempelet"}
      </button>

      {apen && (
        <div className="border-t border-border bg-muted/10 px-3 py-2.5 text-xs">
          <div className="mb-1.5 leading-relaxed text-foreground">{metode.eksempel.oppgave}</div>
          <ol className="mb-2 space-y-1">
            {metode.eksempel.steg.map((s, i) => (
              <li key={i} className="flex gap-2 leading-relaxed text-muted-foreground">
                <span className="shrink-0 font-mono text-[10px] text-brand">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="rounded border border-success/40 bg-success/5 px-2 py-1.5 leading-relaxed text-foreground">
            <span className="font-semibold">Svar: </span>
            {metode.eksempel.svar}
          </div>
        </div>
      )}

      <div className="flex gap-1.5 border-t border-border bg-destructive/5 px-3 py-1.5 text-xs leading-relaxed text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
        <span>
          <span className="font-medium text-foreground">Fella: </span>
          {metode.felle}
        </span>
      </div>
    </div>
  );
}
