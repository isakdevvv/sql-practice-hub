import type { ReactNode } from "react";
import {
  AnslaSaSjekk as AnslaSaSjekkBase,
  type Anslag,
  type AnslagAlternativ,
} from "@/components/learn/AnslaSaSjekk";

// ---------------------------------------------------------------------------
// TEK-1501-varianten av ANSLÅ-SÅ-SJEKK (PLAN-HOST26-MODULER.md §3, rad 1).
//
// Selve komponenten bor nå i `@/components/learn/AnslaSaSjekk` fordi den er
// fagnøytral og også brukes av DTE-2505 og DTE-2507. Denne fila finnes fordi
// TEK-1501 har en egen standard-intro: statistikk er den ideelle disiplinen for
// gjett-før-avsløring, siden intuisjonen tar systematisk feil om medianer, om
// betingede sannsynligheter og om hvor mye tilfeldighet som finnes i små
// utvalg. Den formuleringen skal ikke lekke ut til nettverks- og OS-sidene.
//
// Modul 1 er avhengig av standard-introen under; modul 2, 3 og 4 sender sin
// egen `intro`.
// ---------------------------------------------------------------------------

export type { Anslag, AnslagAlternativ };

export function AnslaSaSjekk(props: {
  id?: string;
  tittel?: string;
  intro?: ReactNode;
  anslag: Anslag[];
}) {
  return (
    <AnslaSaSjekkBase
      {...props}
      intro={
        props.intro ?? (
          <>
            Gjett før du leser videre. Det er meningen at noen av disse skal overraske deg —
            statistisk intuisjon bommer systematisk, og det er nettopp derfor faget finnes.
            Ingenting telles, og et bom her er mer verdt enn en riktig gjetning.
          </>
        )
      }
    />
  );
}
