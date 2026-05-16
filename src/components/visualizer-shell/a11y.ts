// --------------------------------------------------------------------------
// Felles a11y-primitiver for alle visualisere.
//
// Hvorfor: ~8% av menn er fargeblinde. Hvis vi koder tilstand kun med farge
// ("gul = sammenligner, rød = bytter, grønn = sortert") blir det usynlig for
// dem. Vi parer derfor hver tilstand med et glyf (form/bokstav), så fargen
// alltid har en redundant ikke-farge-indikator.
//
// VizState er den lille, lukkede listen som dekker omtrent alle steg/aktive
// tilstander vi har sett i de 40+ visualiserene. Hvis du trenger en ny
// tilstand: legg den her, ikke i en lokal fil.
// --------------------------------------------------------------------------

import { useEffect, useState } from "react";

export type VizState =
  | "idle"
  | "active"
  | "comparing"
  | "writing"
  | "done"
  | "error";

/**
 * Glyf per tilstand. Skal vises ved siden av (eller over) den fargede boksen
 * slik at tilstanden er identifiserbar uten farge.
 *
 *   idle       — ingen (tom)
 *   active     — fylt sirkel (peker / "her er jeg")
 *   comparing  — toveis pil (sammenlikner to elementer)
 *   writing    — penn / blyant-glyf (skriver / endrer verdi)
 *   done       — hake (ferdig sortert / besøkt)
 *   error      — kryss (skal ikke skje / kollisjon / feil)
 */
export const STATE_GLYPHS: Record<VizState, string> = {
  idle: "",
  active: "●",
  comparing: "⇄",
  writing: "✎",
  done: "✓",
  error: "×",
};

/** Norsk navn for tilstand — egnet for aria-label / legend / tooltip. */
export const STATE_LABELS_NB: Record<VizState, string> = {
  idle: "inaktiv",
  active: "aktiv",
  comparing: "sammenlikner",
  writing: "skriver",
  done: "ferdig",
  error: "feil",
};

/**
 * Tailwind-klasser per tilstand. Bruker semantiske design-tokens
 * (text-warning / text-destructive / text-success / text-brand) slik at
 * dark-mode og evt. fargetema-bytte fungerer uten ekstra arbeid.
 *
 *   comparing → warning (gul/oransje)
 *   writing   → brand (lilla/blå)
 *   done      → success (grønn)
 *   error     → destructive (rød)
 *   active    → brand (nøytral aktiv-markør)
 */
export const STATE_COLOR_CLASSES: Record<
  VizState,
  { text: string; border: string; bg: string; ring: string }
> = {
  idle: {
    text: "text-muted-foreground",
    border: "border-border",
    bg: "bg-card",
    ring: "ring-border",
  },
  active: {
    text: "text-brand",
    border: "border-brand",
    bg: "bg-brand/10",
    ring: "ring-brand/40",
  },
  comparing: {
    text: "text-warning",
    border: "border-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/40",
  },
  writing: {
    text: "text-brand",
    border: "border-brand",
    bg: "bg-brand/15",
    ring: "ring-brand/40",
  },
  done: {
    text: "text-success",
    border: "border-success",
    bg: "bg-success/10",
    ring: "ring-success/40",
  },
  error: {
    text: "text-destructive",
    border: "border-destructive",
    bg: "bg-destructive/10",
    ring: "ring-destructive/40",
  },
};

// --------------------------------------------------------------------------
// useReducedMotion: lytter på `prefers-reduced-motion: reduce` og returnerer
// `true` hvis brukeren ber om mindre animasjon. SSR-trygt (default false).
// --------------------------------------------------------------------------

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    // Safari < 14: addListener / removeListener
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  return reduced;
}

// --------------------------------------------------------------------------
// Felles fokus-klasser. Bruk på ALLE interaktive elementer (knapper, chips,
// slider-handles, mode-knapper) for å sikre synlig fokus-ring.
// --------------------------------------------------------------------------

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";
