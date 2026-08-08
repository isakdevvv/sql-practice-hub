import type { ReactNode } from "react";
import { BookMarked, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// Progressiv scaffolding for notasjon (brukerpreferanse
// `feedback_progressive_scaffolding` + `feedback_no_unexplained_abbreviations`).
//
// Regelen: ingen symbol brukes i en modul før det er introdusert eksplisitt.
// I statistikk er dette spesielt kritisk, fordi notasjonen bærer et skille som
// selve faget handler om: greske bokstaver (μ, σ) er ukjente populasjonstall,
// latinske (x̄, s) er tall vi har regnet ut fra utvalget vårt. Blander man de
// to, blir hele inferens-kapittelet uforståelig senere.
//
// Symboltavla står derfor øverst i hver modul, og lister BARE de symbolene
// modulen faktisk bruker — ikke en samlet ordliste for hele faget. Hvert symbol
// har uttale (hva heter tegnet), betydning, og hvilken verden det hører til.
// ---------------------------------------------------------------------------

export type SymbolVerden =
  /** Ukjent, sant tall for hele populasjonen. Vi ser det aldri. */
  | "populasjon"
  /** Regnet ut fra det utvalget vi faktisk har målt. */
  | "utvalg"
  /** Verken–eller: teller, indeks, sannsynlighet, mengde. */
  | "generelt";

export type SymbolRad = {
  /** Selve tegnet, f.eks. "σ" eller "x̄". */
  tegn: string;
  /** Hva tegnet heter når man leser det høyt, f.eks. "sigma", "x-strek". */
  uttale: string;
  betydning: ReactNode;
  verden: SymbolVerden;
};

const VERDEN_STIL: Record<SymbolVerden, { label: string; cls: string }> = {
  populasjon: {
    label: "populasjon (ukjent)",
    cls: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  utvalg: {
    label: "utvalg (regnet ut)",
    cls: "border-success/30 bg-success/10 text-success",
  },
  generelt: {
    label: "generelt",
    cls: "border-border bg-muted text-muted-foreground",
  },
};

export function Symboltavle({
  id,
  tittel = "Symbolene i denne modulen",
  intro,
  symboler,
}: {
  id?: string;
  tittel?: string;
  intro?: ReactNode;
  symboler: SymbolRad[];
}) {
  const harBeggeVerdener =
    symboler.some((s) => s.verden === "populasjon") &&
    symboler.some((s) => s.verden === "utvalg");

  return (
    <section id={id} className="mb-10 scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <BookMarked className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">{tittel}</h2>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {intro ?? (
          <>
            Ingen av tegnene under brukes i teksten før de står her. Slå tilbake hit
            når et symbol dukker opp du ikke kjenner igjen.
          </>
        )}
      </p>

      {harBeggeVerdener && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div className="text-foreground">
            <strong>Den ene regelen som forklarer halve notasjonen:</strong> greske
            bokstaver beskriver <em>populasjonen</em> — de sanne tallene vi aldri får
            se. Latinske bokstaver beskriver <em>utvalget</em> — tallene vi selv har
            regnet ut fra dataene i hånda. Hele resten av faget handler om hvor godt
            de latinske gjetter på de greske.
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-16 px-3 py-2 text-left font-semibold">Tegn</th>
              <th className="w-28 px-3 py-2 text-left font-semibold">Uttales</th>
              <th className="px-3 py-2 text-left font-semibold">Betyr</th>
              <th className="w-40 px-3 py-2 text-left font-semibold">Hører til</th>
            </tr>
          </thead>
          <tbody>
            {symboler.map((s) => {
              const stil = VERDEN_STIL[s.verden];
              return (
                <tr key={s.tegn + s.uttale} className="border-t border-border">
                  <td className="px-3 py-2.5 font-mono text-base font-semibold text-foreground">
                    {s.tegn}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.uttale}</td>
                  <td className="px-3 py-2.5 leading-relaxed text-foreground">
                    {s.betydning}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium ${stil.cls}`}
                    >
                      {stil.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Diskré merknad om at kapittelmappingen mot læreboka er provisorisk.
//
// Faget bruker Kristensen & Wikan, «Sannsynlighetsregning og statistikk for
// høyere utdanning» (2. utg. 2019). Boka er ikke tilgjengelig digitalt for oss
// (PLAN-HOST26-MODULER.md §5), så modulene er bygget på temaprogresjon fra
// atom-planen, ikke på bokas kapittelinndeling. Vi oppgir derfor temanavn og
// ingen kapittelnumre eller sidetall — og sier det, én linje, uten å blåse det
// opp til en advarsel.
// ---------------------------------------------------------------------------
export function ProvisoriskKapittelnote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-muted-foreground ${className}`}>
      <Info className="mr-1 inline h-3 w-3 align-[-1px]" />
      Modulene er ordnet etter tema, ikke etter kapitlene i Kristensen &amp; Wikan.
      Rekkefølgen mot boka er derfor foreløpig, og vi oppgir bevisst ingen
      kapittelnumre.
    </p>
  );
}
