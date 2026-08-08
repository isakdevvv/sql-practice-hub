import { useState, type ReactNode } from "react";
import { CheckCircle2, HelpCircle, Lightbulb, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Oppgavetype 1 — ANSLÅ-SÅ-SJEKK (PLAN-HOST26-MODULER.md §3, rad 1).
//
// Jobben: lage et hull hjernen vil fylle, FØR forklaringen kommer. Studenten
// tvinges til å gjette. Gjettingen gjør at fasiten fester seg, uansett om
// gjettet var riktig — det er kontrasten mellom forventning og utfall som er
// læringen, ikke om man traff.
//
// Statistikk er den ideelle disiplinen for dette: intuisjonen tar systematisk
// feil om medianer, om betingede sannsynligheter og om hvor mye tilfeldighet
// som finnes i små utvalg. Derfor markerer vi eksplisitt i UI-et at det er
// HELT greit å bomme, og vi teller ikke poeng.
//
// Bevisst designvalg: ingen «riktig/galt»-farge på svaralternativet. Vi viser
// hvilket som var riktig og hva studenten valgte, men uten straff-signal.
// ---------------------------------------------------------------------------

export type AnslagAlternativ = {
  id: string;
  label: string;
};

export type Anslag = {
  id: string;
  /** Kort merkelapp over spørsmålet, f.eks. "Median vs. gjennomsnitt". */
  tema: string;
  /** Selve situasjonen studenten skal anslå utfallet av. */
  sporsmal: ReactNode;
  alternativer: AnslagAlternativ[];
  riktigId: string;
  /** Hva som faktisk skjer, og hvorfor. Vises etter at studenten har gjettet. */
  fasit: ReactNode;
  /** Valgfri ekstra linje: hvorfor intuisjonen bommer her. */
  hvorforBommerIntuisjonen?: ReactNode;
};

export function AnslaSaSjekk({
  id,
  tittel = "Anslå først — så sjekker vi",
  intro,
  anslag,
}: {
  id?: string;
  tittel?: string;
  intro?: ReactNode;
  anslag: Anslag[];
}) {
  const [valg, setValg] = useState<Record<string, string>>({});
  const [avslort, setAvslort] = useState<Record<string, true>>({});

  const antallSvart = Object.keys(avslort).length;

  function velg(anslagId: string, altId: string) {
    if (avslort[anslagId]) return;
    setValg((v) => ({ ...v, [anslagId]: altId }));
  }

  function sjekk(anslagId: string) {
    if (!valg[anslagId]) return;
    setAvslort((a) => ({ ...a, [anslagId]: true }));
  }

  function nullstill() {
    setValg({});
    setAvslort({});
  }

  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Target className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">{tittel}</h2>
        <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          Før forklaringen
        </span>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {antallSvart} / {anslag.length} anslått
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            {intro ?? (
              <>
                Gjett før du leser videre. Det er meningen at noen av disse skal
                overraske deg — statistisk intuisjon bommer systematisk, og det er
                nettopp derfor faget finnes. Ingenting telles, og et bom her er mer
                verdt enn en riktig gjetning.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {anslag.map((a, i) => {
          const mitt = valg[a.id];
          const vist = Boolean(avslort[a.id]);
          const traff = vist && mitt === a.riktigId;
          return (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-[11px] font-bold text-brand">
                  {i + 1}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {a.tema}
                </span>
              </div>
              <div className="text-sm leading-relaxed text-foreground">
                {a.sporsmal}
              </div>

              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {a.alternativer.map((alt) => {
                  const valgtAvMeg = mitt === alt.id;
                  const erRiktig = alt.id === a.riktigId;
                  return (
                    <button
                      key={alt.id}
                      onClick={() => velg(a.id, alt.id)}
                      disabled={vist}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        vist && erRiktig
                          ? "border-success bg-success/10 text-foreground"
                          : valgtAvMeg
                            ? "border-brand bg-brand/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:bg-brand/5",
                        vist && "cursor-default",
                      )}
                    >
                      <span className="flex items-start gap-2">
                        {vist && erRiktig ? (
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        ) : (
                          <HelpCircle
                            className={cn(
                              "mt-0.5 h-3.5 w-3.5 shrink-0",
                              valgtAvMeg ? "text-brand" : "text-muted-foreground/50",
                            )}
                          />
                        )}
                        <span>
                          {alt.label}
                          {vist && valgtAvMeg && (
                            <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                              ditt anslag
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {!vist ? (
                <button
                  onClick={() => sjekk(a.id)}
                  disabled={!mitt}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Vis hva som faktisk skjer
                </button>
              ) : (
                <div className="mt-3 space-y-2">
                  <div
                    className={cn(
                      "rounded-lg border p-3 text-sm",
                      traff
                        ? "border-success/40 bg-success/5"
                        : "border-brand/40 bg-brand/5",
                    )}
                  >
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {traff ? "Du traff — her er hvorfor" : "Ikke det du trodde — her er hvorfor"}
                    </div>
                    <div className="leading-relaxed text-foreground">{a.fasit}</div>
                  </div>
                  {a.hvorforBommerIntuisjonen && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Hvorfor intuisjonen bommer
                      </div>
                      <div className="leading-relaxed text-foreground">
                        {a.hvorforBommerIntuisjonen}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {antallSvart > 0 && (
        <button
          onClick={nullstill}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill anslagene
        </button>
      )}
    </section>
  );
}
