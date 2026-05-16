import type { ReactNode } from "react";
import { FOCUS_RING } from "./a11y";

// --------------------------------------------------------------------------
// OpButton: kompakt operasjons-knapp for visualizer-paneler.
// Default = brand-ramme (positiv operasjon). Danger = rød ramme (fjern/pop).
// Tooltip via `hint`. Bruker font-mono fordi tekst som regel er Python-syntax.
//
// A11y: synlig focus-ring (FOCUS_RING), motion-safe transition, og
// `aria-label` overstyrer barn (children) for skjermleser når den er gitt.
// --------------------------------------------------------------------------

export interface OpButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  /** Vises som title-attributt — typisk Big-O-notis eller forklaring. */
  hint?: string;
  disabled?: boolean;
  /** Overstyrer label for skjermleser. Default = title + tekst-innhold. */
  ariaLabel?: string;
}

export function OpButton({
  children,
  onClick,
  variant = "default",
  hint,
  disabled,
  ariaLabel,
}: OpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      disabled={disabled}
      aria-label={ariaLabel ?? hint}
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border motion-safe:transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING} ${
        variant === "danger"
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-brand/40 text-brand hover:bg-brand/10"
      }`}
    >
      {children}
    </button>
  );
}
