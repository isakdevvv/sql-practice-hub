import type { ReactNode } from "react";

// --------------------------------------------------------------------------
// OpButton: kompakt operasjons-knapp for visualizer-paneler.
// Default = brand-ramme (positiv operasjon). Danger = rød ramme (fjern/pop).
// Tooltip via `hint`. Bruker font-mono fordi tekst som regel er Python-syntax.
// --------------------------------------------------------------------------

export interface OpButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  /** Vises som title-attributt — typisk Big-O-notis eller forklaring. */
  hint?: string;
  disabled?: boolean;
}

export function OpButton({
  children,
  onClick,
  variant = "default",
  hint,
  disabled,
}: OpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      disabled={disabled}
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === "danger"
          ? "border-destructive/40 text-destructive hover:bg-destructive/10"
          : "border-brand/40 text-brand hover:bg-brand/10"
      }`}
    >
      {children}
    </button>
  );
}
