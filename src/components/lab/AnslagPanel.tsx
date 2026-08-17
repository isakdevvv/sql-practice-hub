import { useEffect, useState } from "react";
import { CheckCircle2, HelpCircle, Lock, XCircle } from "lucide-react";
import type { Anslag, AnslagLager, LagredeAnslag } from "@/lib/lab/anslag";

/**
 * Anslå-så-sjekk, plassert FØR sandkassen — type 1 i PLAN-HOST26-MODULER.md §3.
 *
 * Panelet er med vilje ikke en quiz: du får ikke vite om du traff før den
 * tilhørende måloppgaven er løst nede på siden. Fram til da står anslaget ditt
 * der som en låst påstand. Det er den ventetiden som gjør at fasiten treffer —
 * kommer den med én gang, blir dette bare enda et flervalgsspørsmål.
 *
 * `lost` er id-ene til de måloppgavene som er løst. Panelet eier ikke den
 * tilstanden; siden gjør, fordi oppgavekortene og dette panelet må være enige.
 */
export function AnslagPanel({
  anslag,
  lager,
  lost,
  intro,
}: {
  anslag: Anslag[];
  lager: AnslagLager;
  lost: Set<string>;
  /** Én setning om hva som skal anslås. Resten av rammen er lik i alle laber. */
  intro: string;
}) {
  const [valgt, setValgt] = useState<LagredeAnslag>({});

  // localStorage finnes ikke under tjener-rendringen. Leses den i første
  // rendring, blir tjenerens markup en annen enn nettleserens og React
  // forkaster hele treet — derfor etter montering.
  useEffect(() => setValgt(lager.les()), [lager]);

  const antallSvart = anslag.filter((a) => a.id in valgt).length;

  return (
    <section className="mb-10">
      <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
        <HelpCircle className="h-5 w-5 text-brand" />
        Hva tror du?
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          før du kjører noe
        </span>
      </h2>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        {intro} Gjett før du kjører noe — det er gratis å bomme, og et anslag som viser seg å være
        feil er den beste grunnen hjernen har til å endre mening. Svaret ditt låses, og fasiten
        kommer først når du har funnet den selv.{" "}
        <span className="tabular-nums">
          {antallSvart} av {anslag.length} anslått.
        </span>
      </p>

      <div className="space-y-3">
        {anslag.map((a) => {
          const mitt = valgt[a.id];
          const harSvart = mitt !== undefined;
          const avslort = harSvart && lost.has(a.knyttetTil);
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
              <p className="mb-3 text-sm font-medium leading-relaxed text-foreground">
                {a.sporsmal}
              </p>

              <div className="flex flex-wrap gap-2">
                {a.valg.map((v, i) => {
                  const eritt = mitt === i;
                  const vissRiktig = avslort && i === a.riktig;
                  return (
                    <button
                      key={v}
                      type="button"
                      disabled={harSvart}
                      onClick={() => setValgt(lager.lagre(a.id, i))}
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

              {harSvart && !avslort && (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  Låst. Fasiten dukker opp her når du har løst oppgaven som svarer på den.
                </p>
              )}

              {avslort && (
                <div
                  className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed ${
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
                      {traff ? "Du anslo riktig." : "Du anslo noe annet enn det du fant."}
                    </strong>{" "}
                    {a.fasit}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
