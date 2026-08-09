import { useState, type ReactNode } from "react";
import { AlertTriangle, Bug, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Oppgavetype 4 — FEILSØKINGSOPPGAVE (PLAN-HOST26-MODULER.md §3, rad 4).
//
// Den viktigste typen for helhetsforståelse, og den siste i modulen. Studenten
// får et ferdig resonnement som er GALT, og skal peke på hvilket ledd som
// svikter. Poenget er at feilen kan bo i hvilket som helst lag: i datagrunnlaget,
// i metodevalget, i utregningen, eller i tolkningen av resultatet. Å måtte lete
// gjennom alle fire tvinger fram en modell av hele kjeden — det gjør ikke en
// oppgave som bare spør «regn ut s²».
//
// Statistikk har uvanlig mange klassiske feilslutninger å hente fra:
// p-verdi lest som «sannsynligheten for at hypotesen er sann», gjennomsnitt
// brukt på sterkt skjeve data, korrelasjon lest som årsak, konfidensintervall
// tolket bayesiansk. Alle er eksamensfeller.
//
// UI-mønster: resonnementet vises som nummererte ledd. Studenten klikker på
// leddet den mener er første feil. Vi gir tilbakemelding per ledd — også for de
// riktige, så det å klikke på et gyldig ledd lærer *hvorfor* det er gyldig.
// ---------------------------------------------------------------------------

export type Resonnementsledd = {
  id: string;
  /** Selve påstanden, som den ville stått i en besvarelse. */
  tekst: ReactNode;
  /**
   * Hvorfor dette leddet er greit (når det ikke er feilen), eller hva som er
   * galt (når det er feilen). Vises når studenten klikker på leddet.
   */
  vurdering: ReactNode;
};

export type Feilsoking = {
  id: string;
  tittel: string;
  /** Sammenhengen: hvem gjorde hva, og hvilken konklusjon ble trukket. */
  situasjon: ReactNode;
  ledd: Resonnementsledd[];
  /** Id-en til leddet der feilen faktisk oppstår. */
  feilLeddId: string;
  /** Hva som er det riktige resonnementet. Vises når feilen er funnet. */
  riktigResonnement: ReactNode;
  /** Navn på feilslutningen, f.eks. "Omvendt betinging". */
  feilnavn: string;
};

export function Feilsokingsoppgaver({
  id,
  tittel = "Feilsøking — finn feilen i resonnementet",
  intro,
  oppgaver,
}: {
  id?: string;
  tittel?: string;
  intro?: ReactNode;
  oppgaver: Feilsoking[];
}) {
  const [lost, setLost] = useState<Record<string, true>>({});

  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Bug className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">{tittel}</h2>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Sist i modulen
        </span>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {Object.keys(lost).length} / {oppgaver.length} funnet
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {intro ?? (
          <>
            Hver oppgave viser et resonnement som ender i feil konklusjon. Feilen kan ligge hvor som
            helst: i dataene, i metodevalget, i utregningen eller i tolkningen til slutt. Klikk på
            det <strong className="text-foreground">første</strong> leddet som ikke holder. Klikker
            du på et gyldig ledd, får du høre hvorfor det faktisk holder — det er også nyttig.
          </>
        )}
      </div>

      <div className="space-y-4">
        {oppgaver.map((o, i) => (
          <FeilsokingKort
            key={o.id}
            nummer={i + 1}
            data={o}
            onLost={() => setLost((l) => ({ ...l, [o.id]: true }))}
          />
        ))}
      </div>
    </section>
  );
}

function FeilsokingKort({
  nummer,
  data,
  onLost,
}: {
  nummer: number;
  data: Feilsoking;
  onLost: () => void;
}) {
  const [klikket, setKlikket] = useState<Record<string, true>>({});
  const funnet = Boolean(klikket[data.feilLeddId]);

  function klikk(leddId: string) {
    if (funnet) return;
    setKlikket((k) => ({ ...k, [leddId]: true }));
    if (leddId === data.feilLeddId) onLost();
  }

  function nullstill() {
    setKlikket({});
  }

  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card p-4",
        funnet ? "border-success/50" : "border-amber-500/30",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-bold text-amber-700 dark:text-amber-300">
          {nummer}
        </span>
        <h3 className="font-semibold leading-tight text-foreground">{data.tittel}</h3>
        {funnet && (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
            <CheckCircle2 className="h-3 w-3" /> {data.feilnavn}
          </span>
        )}
      </div>

      <div className="text-sm leading-relaxed text-foreground">{data.situasjon}</div>

      <div className="mt-3 space-y-1.5">
        {data.ledd.map((l, i) => {
          const erKlikket = Boolean(klikket[l.id]);
          const erFeilen = l.id === data.feilLeddId;
          return (
            <div key={l.id}>
              <button
                onClick={() => klikk(l.id)}
                disabled={funnet}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  erKlikket && erFeilen
                    ? "border-destructive bg-destructive/10"
                    : erKlikket
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-background hover:border-brand/40 hover:bg-brand/5",
                  funnet && !erKlikket && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold",
                    erKlikket && erFeilen
                      ? "bg-destructive text-white"
                      : erKlikket
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-foreground">{l.tekst}</span>
                {erKlikket &&
                  (erFeilen ? (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ))}
              </button>
              {erKlikket && (
                <div
                  className={cn(
                    "ml-6 mt-1 rounded-lg border px-3 py-2 text-sm leading-relaxed",
                    erFeilen
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-success/25 bg-success/5",
                  )}
                >
                  <span
                    className={cn(
                      "mr-1.5 text-[10px] font-semibold uppercase tracking-wider",
                      erFeilen ? "text-destructive" : "text-success",
                    )}
                  >
                    {erFeilen ? "Her er feilen" : "Dette leddet holder"}
                  </span>
                  <span className="text-foreground">{l.vurdering}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {funnet && (
        <div className="mt-3 rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
            <AlertTriangle className="h-3.5 w-3.5" /> Slik skulle det vært gjort
          </div>
          <div className="leading-relaxed text-foreground">{data.riktigResonnement}</div>
        </div>
      )}

      {Object.keys(klikket).length > 0 && (
        <button
          onClick={nullstill}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
      )}
    </div>
  );
}
