// --------------------------------------------------------------------------
// NodeBox: generisk verdi-boks for linked-list / queue / heap / etc.
// - phase: "new" → fade-in. "leaving" → fade-out (parent fjerner etter delay).
// - highlight: tekst over boksen (head / tail / top / front / back / ...).
// - state (valgfri): VizState som overstyrer fargen og legger en glyf i
//   hjørnet (overlay). Dette er hovedmekanismen for fargeblind-trygge
//   tilstander — fargen i seg selv er aldri eneste signal.
// Stil og dimensjoner matcher LinkedStructuresVisualizer for konsistens.
// --------------------------------------------------------------------------

import {
  STATE_COLOR_CLASSES,
  STATE_GLYPHS,
  STATE_LABELS_NB,
  type VizState,
} from "./a11y";

export type NodePhase = "new" | "leaving" | undefined;

export interface NodeBoxProps {
  value: string | number;
  highlight?: string | null;
  phase?: NodePhase;
  /** Overstyr standard 14x14 (size i Tailwind w/h enheter). */
  size?: "sm" | "md";
  /** Hvis du vil ha annerledes farge enn brand for highlight. */
  highlightTone?: "brand" | "success" | "destructive";
  /**
   * Eksplisitt tilstand. Hvis satt brukes STATE_COLOR_CLASSES + glyf, og
   * `highlightTone` ignoreres. Bruk dette i nye visualisere — det er det
   * fargeblind-trygge alternativet.
   */
  state?: VizState;
  /** ARIA-label for skjermlesere; default genereres fra value/highlight/state. */
  ariaLabel?: string;
}

export function NodeBox({
  value,
  highlight,
  phase,
  size = "md",
  highlightTone = "brand",
  state,
  ariaLabel,
}: NodeBoxProps) {
  const dims = size === "sm" ? "w-10 h-10 text-xs" : "w-14 h-14 text-sm";

  const tones: Record<string, string> = {
    brand:
      "border-brand text-brand shadow-[0_0_0_3px_var(--brand-tint,rgba(99,102,241,0.15))]",
    success:
      "border-success text-success shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
    destructive:
      "border-destructive text-destructive shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
  };

  const labelTones: Record<string, string> = {
    brand: "text-brand",
    success: "text-success",
    destructive: "text-destructive",
  };

  // State overstyrer tone hvis satt.
  const stateColors = state ? STATE_COLOR_CLASSES[state] : null;
  const stateGlyph = state ? STATE_GLYPHS[state] : "";
  const stateLabel = state ? STATE_LABELS_NB[state] : "";

  const boxClasses = stateColors
    ? `${stateColors.border} ${stateColors.bg} ${stateColors.text}`
    : highlight
      ? tones[highlightTone]
      : "border-border text-foreground bg-card";

  const computedAria =
    ariaLabel ??
    [
      `verdi ${value}`,
      highlight ? `markør: ${highlight}` : null,
      state && state !== "idle" ? `tilstand: ${stateLabel}` : null,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <div
      className={`relative shrink-0 motion-safe:transition-all motion-safe:duration-300 ease-out ${
        phase === "new"
          ? "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300"
          : phase === "leaving"
          ? "opacity-0 motion-safe:translate-y-2 motion-safe:scale-90"
          : "opacity-100"
      }`}
      role="group"
      aria-label={computedAria}
    >
      <div
        className={`${dims} rounded-lg border-2 flex items-center justify-center font-mono font-semibold ${boxClasses}`}
      >
        {value}
      </div>
      {highlight && (
        <div
          className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-semibold ${
            stateColors ? stateColors.text : labelTones[highlightTone]
          }`}
        >
          {highlight}
        </div>
      )}
      {state && state !== "idle" && stateGlyph && (
        <span
          aria-hidden="true"
          title={stateLabel}
          className={`pointer-events-none absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${stateColors!.border} bg-card ${stateColors!.text} text-[10px] font-bold leading-none`}
        >
          {stateGlyph}
        </span>
      )}
    </div>
  );
}
