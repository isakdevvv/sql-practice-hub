import { useEffect, useState } from "react";
import { Brain, CheckCircle2, ClipboardCopy, Info, Target } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { AnslagPanel } from "@/components/lab/AnslagPanel";
import { MaalOppgaveKort } from "@/components/lab/MaalOppgaveKort";
import { RecallPanel } from "@/components/stack/dte2505-felles/RecallPanel";
import {
  ANSLAG,
  LOKKE_KORT,
  lokkeAnslagLager,
  lokkeFsrs,
  OPPGAVER,
  STARTKODE,
} from "@/lib/python/lokkeLab";
import { masteredSections, markSectionMastered } from "@/lib/core/mastery";
import { LokkeSandkasse } from "./LokkeSandkasse";

// ---------------------------------------------------------------------------
// Python kap. 5 — «Tell iterasjonene». Lab nummer to i formatet fra
// PLAN-LABOPPGAVER.md.
//
// Forskjellen fra nettverkslaben er verdt å merke seg: der måtte nettet
// etterlignes, her kjører ekte CPython i nettleseren via Pyodide. Sandkassen og
// måloppgavene KAN derfor ikke komme i utakt — det er samme interpreter som
// svarer begge steder. Det er den sterkeste varianten av formatet, og grunnen
// til at Python var riktig sted å gå videre.
//
//   type 1  anslagene øverst — gjett før du har kjørt noe
//   type 2  sandkassen — fri kjøring med telling per linje, ingen fasit
//   type 3  ni måloppgaver — tallet du målte sjekkes, ikke koden du skrev
//   type 4  siste oppgave: løkka som aldri stopper, og hvorfor
//   type 5  recall-kortene, meldt inn i den felles FSRS-køen
// ---------------------------------------------------------------------------

/** Leksjonsnøkkelen framgangen lagres under. Må matche slugen i stack-ruta. */
const LEKSJON = "python-lokker-lab";

export function LokkeLabPage() {
  const [lost, setLost] = useState<Set<string>>(new Set());
  const [kode, setKode] = useState(STARTKODE);

  // localStorage finnes ikke under tjener-rendringen — derfor etter montering.
  useEffect(() => {
    const lagret = masteredSections(LEKSJON);
    const mine = OPPGAVER.filter((o) => lagret.has(o.id)).map((o) => o.id);
    if (mine.length > 0) setLost(new Set(mine));
  }, []);

  function marker(id: string) {
    markSectionMastered(LEKSJON, id);
    setLost((s) => new Set(s).add(id));
  }

  return (
    <StackPageShell title="Løkker: tell iterasjonene" group="stack">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Python kap. 5 — lab
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tell iterasjonene
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            En løkke er ikke vanskelig å lese. Den er vanskelig å telle. Av-med-én er den vanligste
            feilen i hele kapittelet, og «husk at stoppverdien er eksklusiv» har aldri fjernet den
            hos noen. Her måles tallet i stedet: sandkassen under kjører ekte Python og viser hvor
            mange ganger hver enkelt linje ble utført.
          </p>
        </header>

        <div className="mb-8 flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <p className="leading-relaxed text-foreground">
            <strong>Dette er ikke en simulering.</strong> Det er CPython, kompilert til WebAssembly
            og kjørt i fanen din. Målingen er `sys.settrace` — den samme mekanismen debuggere bruker
            — som teller hvert linjehopp interpreteren gjør. Skriver du en løkke som aldri stopper,
            oppdager sandkassen det og avbryter i stedet for å fryse siden.
          </p>
        </div>

        {/* Type 1 — skal stå FØR sandkassen; poenget er at de besvares uten data. */}
        <AnslagPanel
          anslag={ANSLAG}
          lager={lokkeAnslagLager}
          lost={lost}
          intro="Fire påstander om løkkene under."
        />

        {/* Type 2 — fri kjøring, ingen telling av prestasjon. */}
        <section className="mb-10">
          <h2 className="mb-2 text-lg font-semibold">Prøv deg fram</h2>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Skriv hva du vil. Ingenting her teller — men alt her telles: margen til høyre viser hvor
            mange ganger hver linje kjørte. Oppgavene under har en kopier-knapp som legger koden
            rett inn her.
          </p>
          <LokkeSandkasse startkode={STARTKODE} kode={kode} onKodeEndret={setKode} />
        </section>

        {/* Type 3 og 4 — måloppgavene. */}
        <section className="mb-10">
          <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-brand" />
            Måloppgaver
            <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">
              {lost.size} / {OPPGAVER.length}
            </span>
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Ni oppgaver. Det er tallet du måler som sjekkes — ikke koden du skrev for å måle det.
            Klarer du å regne det ut i hodet, er det like riktig; men kjør det etterpå og se om du
            traff.
          </p>

          <div className="space-y-3">
            {OPPGAVER.map((o, i) => (
              <div key={o.id} className="relative">
                <MaalOppgaveKort
                  nr={i + 1}
                  oppgave={o}
                  lost={lost.has(o.id)}
                  onLost={() => marker(o.id)}
                  feilTekst="Ikke riktig ennå. Kjør koden i sandkassen over og les tellingen i margen."
                />
                {o.kode && !lost.has(o.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      setKode(o.kode!);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="absolute right-4 top-14 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                  >
                    <ClipboardCopy className="h-3 w-3" />
                    Til sandkassen
                  </button>
                )}
              </div>
            ))}
          </div>

          {lost.size === OPPGAVER.length && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <div className="leading-relaxed">
                <strong className="text-foreground">Alle ni.</strong> Det du egentlig har trent på
                er å skille tellinger som ser like ut: løkkelinja mot kroppen, to linjer i samme
                kropp, ytre mot indre løkke. Den ferdigheten er den samme når du senere teller
                sammenligninger i en sortering — da heter det bare O-notasjon.
              </div>
            </div>
          )}
        </section>

        {/* Type 5 — kortene ligger i den felles køen, ikke bare her. */}
        <section className="mb-10">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-5 w-5 text-brand" />
            Det som må sitte i hodet
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Seks kort. De ligger i den felles repetisjonskøen sammen med resten av faga, så de
            kommer tilbake av seg selv utover høsten.
          </p>
          <RecallPanel
            cards={LOKKE_KORT}
            tags={[
              { id: "telling", label: "Telling" },
              { id: "kontrollflyt", label: "Kontrollflyt" },
            ]}
            store={lokkeFsrs}
          />
        </section>
      </div>
    </StackPageShell>
  );
}
