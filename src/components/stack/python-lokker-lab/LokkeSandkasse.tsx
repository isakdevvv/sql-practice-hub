import { useEffect, useState } from "react";
import { AlertTriangle, Infinity as InfinityIcon, Play, RotateCcw } from "lucide-react";
import { PythonEditor } from "@/components/python/PythonEditor";
import { onPyodideProgress } from "@/lib/python/pyodideLoader";
import { kjorMedTelling, LINJETAK, type Kjoereresultat } from "@/lib/python/lokkeInstrumentering";

/**
 * Sandkassen — type 2. Null prestasjonskrav: ingenting du skriver her telles.
 *
 * Det den gjør som en vanlig REPL ikke gjør, er å vise **hvor mange ganger hver
 * linje kjørte**. Uten den margen er «hvor mange ganger går løkka rundt» et
 * spørsmål studenten må regne seg fram til og tro på svaret sitt; med den er
 * det noe hen leser av. Hele laben henger på at tallet er målt og ikke påstått.
 */
export function LokkeSandkasse({
  startkode,
  kode,
  onKodeEndret,
}: {
  startkode: string;
  kode: string;
  onKodeEndret: (k: string) => void;
}) {
  const [resultat, setResultat] = useState<Kjoereresultat | null>(null);
  const [kjorer, setKjorer] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => onPyodideProgress((s) => setStatus(s)), []);

  async function kjor() {
    setKjorer(true);
    setStatus("starter Python …");
    try {
      setResultat(await kjorMedTelling(kode));
      setStatus(null);
    } catch (e) {
      setResultat({
        utdata: "",
        tellinger: {},
        variabler: {},
        feil: e instanceof Error ? e.message : String(e),
        aldriFerdig: false,
      });
      setStatus(null);
    } finally {
      setKjorer(false);
    }
  }

  const linjer = kode.split("\n");

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">Sandkasse</span>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          ingen fasit
        </span>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onKodeEndret(startkode);
              setResultat(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Tilbake til start
          </button>
          <button
            type="button"
            onClick={kjor}
            disabled={kjorer}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {kjorer ? "Kjører …" : "Kjør"}
          </button>
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="min-h-[16rem] border-b border-border md:border-b-0 md:border-r">
          <PythonEditor value={kode} onChange={onKodeEndret} onRun={kjor} height="20rem" />
        </div>

        <div className="min-h-[16rem] overflow-x-auto p-4 font-mono text-xs">
          {!resultat && (
            <p className="font-sans text-sm text-muted-foreground">
              {status ??
                "Trykk Kjør. Da dukker det opp et tall ved hver linje: så mange ganger ble den utført."}
            </p>
          )}

          {resultat && (
            <>
              <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Ganger utført
              </p>
              <div className="mb-4">
                {linjer.map((l, i) => {
                  const antall = resultat.tellinger[i + 1];
                  return (
                    <div key={i} className="flex gap-3 leading-relaxed">
                      <span
                        className={`w-8 shrink-0 text-right tabular-nums ${
                          antall ? "font-semibold text-brand" : "text-muted-foreground/40"
                        }`}
                      >
                        {antall ?? "·"}
                      </span>
                      <span className="whitespace-pre text-foreground">{l || " "}</span>
                    </div>
                  );
                })}
              </div>

              {resultat.aldriFerdig && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 font-sans text-sm leading-relaxed text-foreground">
                  <InfinityIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <strong>Løkka stoppet aldri.</strong> Sandkassen talte over{" "}
                    {LINJETAK.toLocaleString("nb-NO")} linjekjøringer og avbrøt. Det betyr som regel
                    at ingenting i kroppen endrer variablene betingelsen leser — og en betingelse
                    som ikke kan bli usann, blir aldri usann. Tellingene over viser hvilke linjer
                    som gikk i ring.
                  </div>
                </div>
              )}

              {resultat.feil && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 font-sans text-sm leading-relaxed text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-mono text-xs">{resultat.feil}</span>
                </div>
              )}

              {resultat.utdata && (
                <>
                  <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Utdata
                  </p>
                  <pre className="mb-4 whitespace-pre-wrap text-foreground">{resultat.utdata}</pre>
                </>
              )}

              {Object.keys(resultat.variabler).length > 0 && (
                <>
                  <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Variabler til slutt
                  </p>
                  <div className="space-y-0.5">
                    {Object.entries(resultat.variabler).map(([navn, verdi]) => (
                      <div key={navn}>
                        <span className="text-brand">{navn}</span>
                        <span className="text-muted-foreground"> = </span>
                        <span className="text-foreground">{verdi}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
