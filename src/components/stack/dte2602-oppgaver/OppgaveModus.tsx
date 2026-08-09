import { createContext, useContext, useState, type ReactNode } from "react";
import { BookOpen, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * To globale moduser for en hel modul — lær først, test deg selv etterpå.
 *
 *   "laer"  — null prestasjonskrav. Forklaringene kan åpnes med én gang,
 *             ingenting telles, og du kan bla fritt.
 *   "test"  — du må svare før du får se noe, og modulen teller hvor mange
 *             du traff på.
 *
 * Modusen settes ett sted øverst på siden og gjelder alle oppgavene under,
 * slik at man ikke må stille inn hver enkelt boks.
 */

export type OppgaveModus = "laer" | "test";

const ModusContext = createContext<OppgaveModus>("laer");

export function useOppgaveModus(): OppgaveModus {
  return useContext(ModusContext);
}

export function OppgaveModusProvider({
  modus,
  children,
}: {
  modus: OppgaveModus;
  children: ReactNode;
}) {
  return <ModusContext.Provider value={modus}>{children}</ModusContext.Provider>;
}

/** Hook for sider som eier modus-tilstanden. */
export function useOppgaveModusState() {
  return useState<OppgaveModus>("laer");
}

export function ModusVelger({
  modus,
  setModus,
}: {
  modus: OppgaveModus;
  setModus: (m: OppgaveModus) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div
        role="tablist"
        aria-label="Modus for oppgavene"
        className="inline-flex rounded-lg border border-border bg-muted/30 p-1"
      >
        <button
          role="tab"
          aria-selected={modus === "laer"}
          onClick={() => setModus("laer")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            modus === "laer"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" /> Læringsmodus
        </button>
        <button
          role="tab"
          aria-selected={modus === "test"}
          onClick={() => setModus("test")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            modus === "test"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Dumbbell className="h-3.5 w-3.5" /> Test deg selv
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
        {modus === "laer" ? (
          <>
            <span className="text-foreground font-medium">Læringsmodus:</span> du kan åpne
            forklaringen når som helst, og ingenting telles. Bruk denne første gang du går gjennom
            modulen — poenget er å bygge modellen, ikke å prestere.
          </>
        ) : (
          <>
            <span className="text-foreground font-medium">Test deg selv:</span> du må svare før
            forklaringen vises, og modulen teller hvor mange du traff på. Bruk denne når du har lest
            gjennom én gang.
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Felles ramme rundt én oppgave. Nummer, type-merkelapp og tittel.
 * Fargen følger typen, slik at det er synlig på avstand hvilken jobb
 * oppgaven gjør.
 */
export function OppgaveRamme({
  type,
  nr,
  av,
  tittel,
  children,
}: {
  type: "anslag" | "maal" | "feilsoking" | "recall";
  nr: number;
  av: number;
  tittel?: string;
  children: ReactNode;
}) {
  const stil = {
    anslag: {
      merke: "Anslå først",
      klasse: "border-violet-500/30 bg-violet-500/[0.04]",
      merkeKlasse: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
    },
    maal: {
      merke: "Måloppgave",
      klasse: "border-brand/30 bg-brand/[0.04]",
      merkeKlasse: "bg-brand/10 text-brand border-brand/30",
    },
    feilsoking: {
      merke: "Feilsøking",
      klasse: "border-amber-500/30 bg-amber-500/[0.04]",
      merkeKlasse: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    recall: {
      merke: "Recall",
      klasse: "border-border bg-card",
      merkeKlasse: "bg-muted text-muted-foreground border-border",
    },
  }[type];

  return (
    <div className={cn("rounded-xl border p-5", stil.klasse)}>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            stil.merkeKlasse,
          )}
        >
          {stil.merke}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {nr} av {av}
        </span>
        {tittel && (
          <h3 className="w-full font-semibold text-foreground leading-tight mt-1">{tittel}</h3>
        )}
      </div>
      {children}
    </div>
  );
}

/** Monospace-boks for datautdrag og kodesnutter. */
export function Kontekstboks({ tekst }: { tekst: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre">
      {tekst}
    </pre>
  );
}
