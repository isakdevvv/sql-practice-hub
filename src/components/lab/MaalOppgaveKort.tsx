import { useState } from "react";
import { CheckCircle2, ChevronDown, Lightbulb } from "lucide-react";
import type { Oppgave, Vurdering } from "@/lib/lab/typer";

/**
 * Ett måloppgave-kort — type 3 i PLAN-HOST26-MODULER.md §3.
 *
 * Kortet vet ingenting om faget sitt. Det kjenner bare `Oppgave`-formen og
 * `sjekk`-funksjonen den bærer med seg, og det er nettopp derfor det kan deles
 * mellom en nettverksterminal og en Python-REPL. Løftet hit fra
 * NettverksverktoyPage da lab nummer to kom (PLAN-LABOPPGAVER.md §7.3).
 *
 * Tre ting er bevisste og bør ikke «ryddes bort»:
 *
 *   - Hintet er skjult til du ber om det. Et hint som ligger åpent leses før
 *     forsøket, og da har oppgaven allerede mistet det den skulle måle.
 *   - Forklaringen vises FØRST etter riktig svar. Hullet må være laget før det
 *     kan fylles (§6.4).
 *   - Feiltilbakemeldingen er oppgavens egen når den finnes. «Nesten — det er
 *     gatewayen, ikke maskinen din» retter et begrep; «feil» får deg til å
 *     gjette videre.
 */
export function MaalOppgaveKort({
  nr,
  oppgave,
  lost,
  onLost,
  feilTekst = "Ikke riktig ennå. Kjør det i sandkassen over og les svaret linje for linje.",
}: {
  nr: number;
  oppgave: Oppgave;
  lost: boolean;
  onLost: () => void;
  /** Standardtekst når oppgaven ikke har en presis tilbakemelding å gi. */
  feilTekst?: string;
}) {
  const [svar, setSvar] = useState("");
  const [vurdering, setVurdering] = useState<Vurdering | null>(null);
  const [visHint, setVisHint] = useState(false);

  function prov() {
    if (!svar.trim()) return;
    const v = oppgave.sjekk(svar);
    setVurdering(v);
    if (v.riktig) onLost();
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        lost ? "border-success/40 bg-success/5" : "border-border bg-card"
      }`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            lost ? "bg-success/20 text-success" : "bg-brand/15 text-brand"
          }`}
        >
          {lost ? <CheckCircle2 className="h-3.5 w-3.5" /> : nr}
        </span>
        <h3 className="font-medium text-foreground">{oppgave.tittel}</h3>
        {oppgave.vist && (
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            svaret er vist
          </span>
        )}
        <code className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {oppgave.verktoy}
        </code>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{oppgave.oppdrag}</p>

      {oppgave.kode && (
        <pre className="mb-3 overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
          {oppgave.kode}
        </pre>
      )}

      {!lost && (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              value={svar}
              onChange={(e) => {
                setSvar(e.target.value);
                setVurdering(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && prov()}
              spellCheck={false}
              autoCapitalize="off"
              aria-label={`Svar på oppgave ${nr}`}
              placeholder="skriv svaret du fant"
              className="min-w-[12rem] flex-1 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={prov}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              Sjekk
            </button>
            <button
              type="button"
              onClick={() => setVisHint((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Hint
              <ChevronDown
                className={`h-3 w-3 transition-transform ${visHint ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {visHint && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-relaxed text-muted-foreground">
              {oppgave.hint}
            </p>
          )}

          {vurdering && !vurdering.riktig && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm leading-relaxed text-rose-700 dark:text-rose-300">
              {vurdering.tilbakemelding ?? feilTekst}
            </p>
          )}
        </>
      )}

      {lost && (
        <p className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm leading-relaxed text-foreground">
          {oppgave.forklaring}
        </p>
      )}
    </div>
  );
}
