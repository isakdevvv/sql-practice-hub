import { createContext, useContext } from "react";

export interface SkjermApi {
  /** Kalles av `sjekk`/`anslag`-skjermer når studenten har levert et svar.
   *  Låser opp "Neste". Idempotent — trygg å kalle flere ganger. */
  besvart: () => void;
  /** Har denne skjermen blitt besvart? */
  erBesvart: boolean;
  /** Gå videre. Blokkeres hvis skjermen krever svar og ikke er besvart. */
  neste: () => void;
  forrige: () => void;
  /** 0-indeksert posisjon i undertemaet, og totalt antall skjermer. */
  indeks: number;
  antall: number;
}

export const SkjermCtx = createContext<SkjermApi | null>(null);

/** Hook for innhold som lever inne i en skjerm. Kaster utenfor SkjermShell,
 *  så feilen dukker opp i utvikling og ikke som en stille no-op. */
export function useSkjerm(): SkjermApi {
  const ctx = useContext(SkjermCtx);
  if (!ctx) {
    throw new Error("useSkjerm() må brukes inne i en <SkjermShell>. Se src/components/skjerm.");
  }
  return ctx;
}
