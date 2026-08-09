import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Eye,
  Info,
  RotateCcw,
  Ruler,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatterFasit,
  sjekkMaloppgave,
  type Fasit,
  type Metode,
  type SjekkResultat,
} from "@/lib/tek1501/oppgaveSjekk";

// ---------------------------------------------------------------------------
// Oppgavetype 3 — MÅLOPPGAVE MED TILSTANDSSJEKK (PLAN-HOST26-MODULER.md §3.1).
//
// Studenten skal oppnå et mål, ikke gjenkalle en streng. Derfor sjekker vi to
// ting samtidig og rapporterer dem hver for seg:
//
//   • VALGT METODE — hvilken formel/estimator/test studenten mener gjelder.
//   • NUMERISK SVAR — innenfor en toleranse, ikke som eksakt tekstmatch.
//
// Konsekvensen i UI-et: en som velger riktig metode men bommer i tredje desimal
// får beskjed om nøyaktig det («framgangsmåten er riktig, se etter en for tidlig
// avrunding»), i stedet for et flatt «feil» som ikke skiller regnefeil fra
// tankefeil. Selve logikken bor i src/lib/tek1501/oppgaveSjekk.ts.
// ---------------------------------------------------------------------------

export type MaloppgaveData = {
  id: string;
  tittel: string;
  /** Situasjonen + hva som skal beregnes. */
  oppgave: ReactNode;
  /** Valgfrie tall/data som skal stå tydelig fram fra brødteksten. */
  data?: ReactNode;
  metoder: Metode[];
  riktigMetodeId: string;
  fasit: Fasit;
  /** Hva som skal stå i tallfeltet, f.eks. "s² i kroner²". */
  svarEtikett: string;
  /** Steg-for-steg-utregning. Vises når studenten ber om fasit, eller etter riktig svar. */
  utregning: ReactNode;
};

export function Maloppgaver({
  id,
  tittel = "Måloppgaver — regn det ut",
  intro,
  oppgaver,
}: {
  id?: string;
  tittel?: string;
  intro?: ReactNode;
  oppgaver: MaloppgaveData[];
}) {
  const [lost, setLost] = useState<Record<string, true>>({});

  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Ruler className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">{tittel}</h2>
        <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
          Etter forklaringen
        </span>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {Object.keys(lost).length} / {oppgaver.length} løst
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        {intro ?? (
          <>
            Her sjekkes to ting hver for seg:{" "}
            <strong className="text-foreground">hvilken metode</strong> du mener gjelder, og{" "}
            <strong className="text-foreground">tallet</strong> du lander på. Velger du riktig
            metode men bommer i tredje desimal, får du beskjed om nøyaktig det — det er en
            regnefeil, ikke en forståelsesfeil, og de to skal rettes på hver sin måte.
          </>
        )}
      </div>

      <div className="space-y-4">
        {oppgaver.map((o, i) => (
          <MaloppgaveKort
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

function MaloppgaveKort({
  nummer,
  data,
  onLost,
}: {
  nummer: number;
  data: MaloppgaveData;
  onLost: () => void;
}) {
  const [metodeId, setMetodeId] = useState<string | null>(null);
  const [svar, setSvar] = useState("");
  const [resultat, setResultat] = useState<SjekkResultat | null>(null);
  const [visUtregning, setVisUtregning] = useState(false);
  const [forsok, setForsok] = useState(0);

  function sjekk() {
    const r = sjekkMaloppgave({
      raaSvar: svar,
      valgtMetodeId: metodeId,
      riktigMetodeId: data.riktigMetodeId,
      fasit: data.fasit,
      metoder: data.metoder,
    });
    setResultat(r);
    if (r.status !== "ufullstendig") setForsok((n) => n + 1);
    if (r.bestatt) {
      setVisUtregning(true);
      onLost();
    }
  }

  function nullstill() {
    setMetodeId(null);
    setSvar("");
    setResultat(null);
    setVisUtregning(false);
    setForsok(0);
  }

  const last = resultat?.bestatt ?? false;

  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card p-4",
        last ? "border-success/50" : "border-brand/30",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">
          {nummer}
        </span>
        <h3 className="font-semibold leading-tight text-foreground">{data.tittel}</h3>
        {last && (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
            <CheckCircle2 className="h-3 w-3" /> Løst
          </span>
        )}
      </div>

      <div className="text-sm leading-relaxed text-foreground">{data.oppgave}</div>

      {data.data && (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
          {data.data}
        </div>
      )}

      {/* --- Del 1: metodevalg --- */}
      <fieldset className="mt-4" disabled={last}>
        <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          1. Hvilken metode bruker du?
        </legend>
        <div className="space-y-1.5">
          {data.metoder.map((m) => {
            const valgt = metodeId === m.id;
            const avslortRiktig = last && m.id === data.riktigMetodeId;
            return (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  avslortRiktig
                    ? "border-success bg-success/10"
                    : valgt
                      ? "border-brand bg-brand/10"
                      : "border-border bg-background hover:border-brand/40 hover:bg-brand/5",
                  last && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={`metode-${data.id}`}
                  checked={valgt}
                  onChange={() => setMetodeId(m.id)}
                  className="mt-1 accent-[var(--brand)]"
                />
                <span className="text-foreground">{m.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* --- Del 2: tallsvar --- */}
      <div className="mt-4">
        <label
          htmlFor={`svar-${data.id}`}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          2. {data.svarEtikett}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id={`svar-${data.id}`}
            value={svar}
            onChange={(e) => setSvar(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sjekk();
            }}
            disabled={last}
            inputMode="decimal"
            placeholder="f.eks. 4,25"
            className="w-40 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground outline-none focus:border-brand disabled:opacity-60"
          />
          {data.fasit.enhet && (
            <span className="text-sm text-muted-foreground">{data.fasit.enhet}</span>
          )}
          <span className="text-[11px] text-muted-foreground">
            godtatt avvik: ±{data.fasit.toleranse}
          </span>
        </div>
      </div>

      {/* --- Handlinger --- */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!last && (
          <button
            onClick={sjekk}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
          >
            Sjekk svaret
          </button>
        )}
        {forsok >= 2 && !last && !visUtregning && (
          <button
            onClick={() => setVisUtregning(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            <Eye className="h-3.5 w-3.5" /> Vis utregningen
          </button>
        )}
        {(forsok > 0 || svar !== "" || metodeId) && (
          <button
            onClick={nullstill}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Prøv på nytt
          </button>
        )}
      </div>

      {/* --- Tilbakemelding: metode og tall hver for seg --- */}
      {resultat && (
        <div
          className={cn(
            "mt-3 rounded-lg border p-3",
            resultat.tone === "success"
              ? "border-success/40 bg-success/5"
              : resultat.tone === "warn"
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-border bg-muted/30",
          )}
        >
          <div className="flex items-start gap-2">
            {resultat.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : resultat.tone === "warn" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="text-sm">
              <div className="font-semibold text-foreground">{resultat.tittel}</div>
              <p className="mt-0.5 leading-relaxed text-muted-foreground">{resultat.melding}</p>
              {resultat.status !== "ufullstendig" && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <StatusPille ok={resultat.metodeOk} label="Metode" />
                  <StatusPille ok={resultat.tallOk} label="Tallsvar" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Utregning --- */}
      {visUtregning && (
        <details open className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ChevronDown className="h-3.5 w-3.5" /> Utregning steg for steg
          </summary>
          <div className="mt-2 text-sm leading-relaxed text-foreground">{data.utregning}</div>
          <div className="mt-2 border-t border-border pt-2 text-sm">
            <span className="text-muted-foreground">Fasit: </span>
            <strong className="font-mono text-foreground">{formatterFasit(data.fasit)}</strong>
          </div>
        </details>
      )}
    </div>
  );
}

function StatusPille({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
        ok
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {label}: {ok ? "riktig" : "bom"}
    </span>
  );
}
