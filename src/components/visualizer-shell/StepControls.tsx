import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

// --------------------------------------------------------------------------
// StepControls: standard kontroll-bar for "pre-compute frames + step/play"
// visualisere. Inkluderer Forrige / Play-Pause / Neste / Reset + valgfri
// tempo-slider og scrub-slider. Designet for å speile det 25+ visualisere
// allerede har implementert ad-hoc.
// --------------------------------------------------------------------------

export interface StepControlsProps {
  step: number; // 0-indeksert
  total: number;
  playing: boolean;
  onStep: () => void;
  onStepBack: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  /** Hvis gitt: vis tempo-slider. Speed = ms per steg (lavere = raskere). */
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  /** ms-grenser for tempo-slider. Default 50–800. */
  speedMin?: number;
  speedMax?: number;
  /** Hvis gitt: vis scrub-slider under kontrollene. */
  onScrub?: (step: number) => void;
  /** Ekstra innhold helt til høyre (f.eks. status-tekst). */
  rightSlot?: ReactNode;
  /** Skjul forrige-knapp (visse visualisere kan ikke gå bakover). */
  hideStepBack?: boolean;
  /** Tekst på Play-knapp når kjøringen er ferdig. Default "Spill av på nytt". */
  replayLabel?: string;
}

export function StepControls({
  step,
  total,
  playing,
  onStep,
  onStepBack,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange,
  speedMin = 50,
  speedMax = 800,
  onScrub,
  rightSlot,
  hideStepBack,
  replayLabel = "Spill av på nytt",
}: StepControlsProps) {
  const atEnd = total > 0 && step >= total - 1;

  return (
    <div className="px-4 py-3 border-t border-border bg-muted/20">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPlayPause}
            disabled={atEnd && !playing && total <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {playing ? (
              <>
                <Pause className="h-3.5 w-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> {atEnd ? replayLabel : "Play"}
              </>
            )}
          </button>
          {!hideStepBack && (
            <button
              type="button"
              onClick={onStepBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted disabled:opacity-40"
              title="Ett steg tilbake"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onStep}
            disabled={atEnd}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted disabled:opacity-40"
            title="Ett steg fram"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
            title="Reset til start"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {speed !== undefined && onSpeedChange && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground" htmlFor="step-speed">
              Tempo
            </label>
            <input
              id="step-speed"
              type="range"
              min={speedMin}
              max={speedMax}
              step={10}
              // Inverter: høyre på slider = raskere = lavere ms.
              value={speedMin + speedMax - speed}
              onChange={(e) =>
                onSpeedChange(speedMin + speedMax - Number(e.target.value))
              }
              className="w-28 accent-brand"
              title="Venstre = sakte, høyre = raskt"
            />
          </div>
        )}

        <div className="ml-auto flex items-center gap-4 text-xs font-mono">
          <span>
            <span className="text-muted-foreground">steg</span>{" "}
            <span className="tabular-nums">
              {Math.min(step + 1, total)}/{total}
            </span>
          </span>
          {rightSlot}
        </div>
      </div>

      {onScrub && total > 1 && (
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={Math.max(0, total - 1)}
            value={step}
            onChange={(e) => onScrub(Number.parseInt(e.target.value, 10))}
            className="w-full accent-brand"
            aria-label="Steg-scrubber"
          />
        </div>
      )}
    </div>
  );
}
