// --------------------------------------------------------------------------
// StateMarker: liten badge som parer farge + glyf for en VizState.
//
// Bruk:
//   <StateMarker state="comparing" /> → gul "⇄ sammenlikner"
//   <StateMarker state="done" compact /> → grønt "✓"
//
// Plassér ved siden av en farget node, eller bruk `as="overlay"` for å legge
// glyfen i et hjørne. På denne måten er tilstanden synlig selv for brukere
// som ikke kan skille gul/grønn/rød.
// --------------------------------------------------------------------------

import {
  STATE_COLOR_CLASSES,
  STATE_GLYPHS,
  STATE_LABELS_NB,
  type VizState,
} from "./a11y";

export interface StateMarkerProps {
  state: VizState;
  /** Skjul norsk tekst — bare glyf. Default false. */
  compact?: boolean;
  /** Tekst som overstyrer det norske default-navnet. */
  label?: string;
  /** "badge" (default) = inline pille. "overlay" = absolutt-posisjonert glyf. */
  as?: "badge" | "overlay";
  className?: string;
}

export function StateMarker({
  state,
  compact = false,
  label,
  as = "badge",
  className,
}: StateMarkerProps) {
  if (state === "idle") return null;

  const colors = STATE_COLOR_CLASSES[state];
  const glyph = STATE_GLYPHS[state];
  const text = label ?? STATE_LABELS_NB[state];

  if (as === "overlay") {
    return (
      <span
        aria-label={text}
        title={text}
        className={`pointer-events-none absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full border ${colors.border} ${colors.bg} ${colors.text} text-[10px] font-bold leading-none ${
          className ?? ""
        }`}
      >
        <span aria-hidden="true">{glyph}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium uppercase tracking-wider ${colors.border} ${colors.bg} ${colors.text} ${
        className ?? ""
      }`}
    >
      <span aria-hidden="true" className="font-bold leading-none">
        {glyph}
      </span>
      {!compact && <span>{text}</span>}
      {compact && <span className="sr-only">{text}</span>}
    </span>
  );
}

// --------------------------------------------------------------------------
// StateLegend: liten forklarings-rad for hvilke tilstander en visualisering
// faktisk bruker. Plassér typisk under selve canvasen.
// --------------------------------------------------------------------------

export interface StateLegendProps {
  states: { state: VizState; label?: string }[];
  className?: string;
}

export function StateLegend({ states, className }: StateLegendProps) {
  return (
    <div
      className={`flex flex-wrap gap-2 text-[11px] ${className ?? ""}`}
      role="list"
      aria-label="Tegnforklaring for tilstander"
    >
      {states.map(({ state, label }) => (
        <div key={state} role="listitem">
          <StateMarker state={state} label={label} />
        </div>
      ))}
    </div>
  );
}
