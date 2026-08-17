import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, HelpCircle, Lock, XCircle } from "lucide-react";
import type { Anslag, AnslagLager, LagredeAnslag } from "@/lib/lab/anslag";

/**
 * Anslå-så-sjekk — type 1 i PLAN-HOST26-MODULER.md §3.
 *
 * Panelet er med vilje ikke en quiz. Svaret ditt LÅSES når du har valgt, og
 * står der som en påstand du ikke får stille om i ettertid — hele verdien
 * ligger i at det gale anslaget blir stående.
 *
 * Når fasiten kommer avhenger av hva slags side panelet står på:
 *
 *   avsloring="naar-lost"  (standard) — laber med måloppgaver. Fasiten kommer
 *     først når oppgaven anslaget henger på er løst nede på siden. Det er den
 *     ventetiden som gjør at fasiten treffer; kommer den med én gang, er dette
 *     bare enda et flervalgsspørsmål med svaret rett under.
 *
 *   avsloring="knapp" — sider uten måloppgaver, der en simulator er sin egen
 *     fasit (Kurose-seksjonene, page-replacement, TEK-1501-modulene). Der finnes
 *     det ingenting å utsette avsløringen TIL, så studenten trykker selv når hen
 *     har forpliktet seg. Låsen gjelder fortsatt.
 *
 * `lost` er id-ene til de løste måloppgavene. Panelet eier ikke den tilstanden;
 * siden gjør, fordi oppgavekortene og dette panelet må være enige.
 */
export function AnslagPanel({
  anslag,
  lager,
  lost,
  intro,
  tittel = "Hva tror du?",
  avsloring = "naar-lost",
}: {
  anslag: Anslag[];
  /**
   * Lagring av avgitte anslag. Valgfri — uten lager lever anslagene ut økta.
   * Laber bør alltid ha et, så avgitte svar ikke forsvinner ved F5.
   */
  lager?: AnslagLager;
  /** Løste måloppgaver. Kun i bruk når avsloring="naar-lost". */
  lost?: Set<string>;
  /** Én setning om hva som skal anslås. Resten av rammen er lik overalt. */
  intro: ReactNode;
  tittel?: string;
  avsloring?: "naar-lost" | "knapp";
}) {
  const [valgt, setValgt] = useState<LagredeAnslag>({});
  /** Kun for avsloring="knapp": hvilke anslag studenten har bedt om fasit på. */
  const [avslorte, setAvslorte] = useState<Record<string, true>>({});

  // localStorage finnes ikke under tjener-rendringen. Leses den i første
  // rendring, blir tjenerens markup en annen enn nettleserens og React
  // forkaster hele treet — derfor etter montering.
  useEffect(() => {
    if (lager) setValgt(lager.les());
  }, [lager]);

  function velg(id: string, i: number) {
    // Låsen. Lageret håndhever den samme regelen, men den må også gjelde uten
    // lager, ellers ville sider uten lagring kunne stille om anslaget sitt.
    if (lager) {
      setValgt(lager.lagre(id, i));
      return;
    }
    setValgt((na) => (id in na ? na : { ...na, [id]: i }));
  }

  const antallSvart = anslag.filter((a) => a.id in valgt).length;

  return (
    <section className="mb-10">
      <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
        <HelpCircle className="h-5 w-5 text-brand" />
        {tittel}
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          før du kjører noe
        </span>
      </h2>
      <div className="mb-4 max-w-2xl text-sm text-muted-foreground">
        {intro}{" "}
        {avsloring === "naar-lost" ? (
          <>
            Gjett før du kjører noe — det er gratis å bomme, og et anslag som viser seg å være feil
            er den beste grunnen hjernen har til å endre mening. Svaret ditt låses, og fasiten kommer
            først når du har funnet den selv.
          </>
        ) : (
          <>
            Gjett før du leser videre. Det er meningen at noen av disse skal overraske deg — det er
            nettopp der forventningen din brister at stoffet fester seg. Ingenting telles, og et bom
            her er mer verdt enn en riktig gjetning.
          </>
        )}{" "}
        <span className="tabular-nums">
          {antallSvart} av {anslag.length} anslått.
        </span>
      </div>

      <div className="space-y-3">
        {anslag.map((a) => {
          const mitt = valgt[a.id];
          const harSvart = mitt !== undefined;
          const avslort =
            harSvart &&
            (avsloring === "knapp"
              ? Boolean(avslorte[a.id])
              : a.knyttetTil !== undefined && Boolean(lost?.has(a.knyttetTil)));
          const traff = mitt === a.riktig;

          return (
            <div
              key={a.id}
              className={`rounded-xl border p-4 ${
                avslort
                  ? traff
                    ? "border-success/40 bg-success/5"
                    : "border-amber-500/40 bg-amber-500/5"
                  : "border-border bg-card"
              }`}
            >
              {a.tema && (
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {a.tema}
                </div>
              )}
              <div className="mb-3 text-sm font-medium leading-relaxed text-foreground">
                {a.sporsmal}
              </div>

              <div className="flex flex-wrap gap-2">
                {a.valg.map((v, i) => {
                  const eritt = mitt === i;
                  const vissRiktig = avslort && i === a.riktig;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={harSvart}
                      onClick={() => velg(a.id, i)}
                      className={`rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                        vissRiktig
                          ? "border-success bg-success/10 text-foreground"
                          : eritt
                            ? avslort
                              ? "border-amber-500 bg-amber-500/10 text-foreground"
                              : "border-brand bg-brand/10 text-foreground"
                            : harSvart
                              ? "border-border text-muted-foreground opacity-60"
                              : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                      }`}
                    >
                      {v}
                      {eritt && (
                        <span className="ml-1.5 text-[11px] uppercase tracking-wide">
                          · ditt anslag
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {harSvart && !avslort && avsloring === "naar-lost" && (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  Låst. Fasiten dukker opp her når du har løst oppgaven som svarer på den.
                </p>
              )}

              {harSvart && !avslort && avsloring === "knapp" && (
                <button
                  type="button"
                  onClick={() => setAvslorte((p) => ({ ...p, [a.id]: true }))}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/20"
                >
                  Vis hva som faktisk skjer
                </button>
              )}

              {avslort && (
                <div className="mt-3 space-y-2">
                  <div
                    className={`flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed ${
                      traff
                        ? "border-success/30 bg-success/5 text-foreground"
                        : "border-amber-500/30 bg-amber-500/5 text-foreground"
                    }`}
                  >
                    {traff ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    )}
                    <div>
                      <strong className="text-foreground">
                        {traff
                          ? "Du anslo riktig."
                          : avsloring === "knapp"
                            ? "Ikke det du trodde."
                            : "Du anslo noe annet enn det du fant."}
                      </strong>{" "}
                      {a.fasit}
                    </div>
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
    </section>
  );
}
