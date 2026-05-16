// --------------------------------------------------------------------------
// KeyboardScope: pakker en visualisering i en fokuserbar region og lytter på
// piltaster / Space / P / R / Home / End for å styre StepRunner-aktige
// kontrollere uten å måtte tabbe til hver knapp.
//
// Bindinger:
//   →  /  Space   → onStep
//   ←             → onStepBack
//   P             → onPlayPause
//   R             → onReset
//   Home          → onFirst (default = setIndex(0) hvis tilgjengelig)
//   End           → onLast
//
// En liten "Tastatur"-tooltip vises ved fokus så brukere som ikke leser
// dokumentasjon likevel oppdager bindingene.
// --------------------------------------------------------------------------

import { Keyboard } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FOCUS_RING } from "./a11y";

export interface KeyboardScopeProps {
  /** aria-label på regionen. Default "Interaktiv visualisering". */
  label?: string;
  children: ReactNode;
  onStep?: () => void;
  onStepBack?: () => void;
  onPlayPause?: () => void;
  onReset?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  /** Skjul tastatur-tooltipen helt. */
  hideHint?: boolean;
  className?: string;
}

export function KeyboardScope({
  label = "Interaktiv visualisering",
  children,
  onStep,
  onStepBack,
  onPlayPause,
  onReset,
  onFirst,
  onLast,
  hideHint,
  className,
}: KeyboardScopeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);

  // Hvis fokus havner inne i regionen (f.eks. på en knapp), regn det som
  // "regionen er aktiv" så hjelpe-tooltipen blir værende synlig.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocusIn = () => setFocused(true);
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Ikke fang taster når brukeren skriver i et input/textarea inni regionen.
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
      // Tillat allikevel piltaster/space å snappes for slider-range (ikke vår
      // håndtering). Stop her.
      return;
    }

    switch (e.key) {
      case "ArrowRight":
      case " ":
        if (onStep) {
          e.preventDefault();
          onStep();
        }
        break;
      case "ArrowLeft":
        if (onStepBack) {
          e.preventDefault();
          onStepBack();
        }
        break;
      case "p":
      case "P":
        if (onPlayPause) {
          e.preventDefault();
          onPlayPause();
        }
        break;
      case "r":
      case "R":
        if (onReset) {
          e.preventDefault();
          onReset();
        }
        break;
      case "Home":
        if (onFirst) {
          e.preventDefault();
          onFirst();
        }
        break;
      case "End":
        if (onLast) {
          e.preventDefault();
          onLast();
        }
        break;
    }
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKey}
      className={`relative rounded-2xl ${FOCUS_RING} ${className ?? ""}`}
    >
      {children}
      {!hideHint && focused && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-2 top-2 z-10 pointer-events-none rounded-md border border-border bg-card/95 px-2 py-1 text-[10px] text-muted-foreground shadow-md backdrop-blur"
        >
          <div className="flex items-center gap-1 font-medium text-foreground">
            <Keyboard className="h-3 w-3" />
            Tastatur
          </div>
          <ul className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 font-mono">
            {onStep && (
              <>
                <kbd className="text-foreground">→ / Space</kbd>
                <span>neste steg</span>
              </>
            )}
            {onStepBack && (
              <>
                <kbd className="text-foreground">←</kbd>
                <span>forrige</span>
              </>
            )}
            {onPlayPause && (
              <>
                <kbd className="text-foreground">P</kbd>
                <span>play/pause</span>
              </>
            )}
            {onReset && (
              <>
                <kbd className="text-foreground">R</kbd>
                <span>reset</span>
              </>
            )}
            {(onFirst || onLast) && (
              <>
                <kbd className="text-foreground">Home/End</kbd>
                <span>første/siste</span>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
