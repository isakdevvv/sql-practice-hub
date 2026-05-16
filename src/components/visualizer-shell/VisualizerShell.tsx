import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { ModeChips, type ModeDef } from "./ModeChips";
import { FOCUS_RING } from "./a11y";

// --------------------------------------------------------------------------
// VisualizerShell: standard topp-bar + body for alle interaktive visualisere.
// - Tittel + valgfri subtittel
// - Reset-knapp (vises hvis onReset er gitt)
// - Modus-chip-rad (valgfritt)
// - Body som children
// - Footer-notis per modus (valgfritt) — vises som italic under topp-bar
// Layout-mønsteret stammer fra LinkedStructuresVisualizer.
// --------------------------------------------------------------------------

export interface VisualizerShellProps<T extends string> {
  title: string;
  subtitle?: string;
  /** "Interaktiv visualisering" som default; kan overstyres. */
  kicker?: string;
  modes?: ModeDef<T>[];
  activeMode?: T;
  onModeChange?: (mode: T) => void;
  onReset?: () => void;
  /** Liten kursiv-notis under chip-raden (per modus, ofte). */
  note?: string;
  /** Innhold over kontroll-rader (canvas / grid / etc). */
  children: ReactNode;
  /** Ekstra topp-høyre-element (f.eks. steg-teller). Erstatter Reset hvis gitt. */
  topRight?: ReactNode;
}

export function VisualizerShell<T extends string>({
  title,
  subtitle,
  kicker = "Interaktiv visualisering",
  modes,
  activeMode,
  onModeChange,
  onReset,
  note,
  children,
  topRight,
}: VisualizerShellProps<T>) {
  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label={`Interaktiv visualisering: ${title}`}
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {kicker}
            </div>
            <div className="text-sm font-semibold">{title}</div>
            {subtitle && (
              <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
            )}
          </div>
          {topRight ?? (onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label="Reset visualisering"
              className={`text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted motion-safe:transition-colors ${FOCUS_RING}`}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Reset
            </button>
          ))}
        </div>
        {modes && activeMode !== undefined && onModeChange && (
          <div className="mt-3">
            <ModeChips modes={modes} active={activeMode} onChange={onModeChange} />
          </div>
        )}
        {note && (
          <div className="mt-2 text-xs text-muted-foreground italic">{note}</div>
        )}
      </div>
      {children}
    </div>
  );
}
