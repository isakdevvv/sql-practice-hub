import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./a11y";

// --------------------------------------------------------------------------
// useStepRunner: standardiserer "pre-compute alle frames, kjør gjennom dem"
// mønsteret som finnes i 25+ visualisere. Holder index, playing-state, speed,
// og tilbyr step / stepBack / play / pause / reset / setIndex.
// Resetter automatisk index når frames-referansen endrer seg.
// --------------------------------------------------------------------------

export interface StepRunnerOptions {
  /** ms per steg. Default 500. */
  initialSpeed?: number;
  /** Stopp automatisk play når man når siste frame. Default true. */
  pauseAtEnd?: boolean;
  /** Tilbakestill index til 0 når frames endres. Default true. */
  resetOnFramesChange?: boolean;
}

export interface StepRunner<Frame> {
  frame: Frame | undefined;
  index: number;
  total: number;
  playing: boolean;
  speed: number;
  setSpeed: (n: number) => void;
  step: () => void;
  stepBack: () => void;
  play: () => void;
  pause: () => void;
  playPause: () => void;
  reset: () => void;
  setIndex: (i: number) => void;
  atEnd: boolean;
}

export function useStepRunner<Frame>(
  frames: Frame[],
  opts: StepRunnerOptions = {},
): StepRunner<Frame> {
  const { initialSpeed = 500, pauseAtEnd = true, resetOnFramesChange = true } = opts;

  const [index, setIndexState] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const timerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  const total = frames.length;
  const atEnd = total === 0 || index >= total - 1;
  const frame = total > 0 ? frames[Math.min(index, total - 1)] : undefined;

  // Resett når frames-referansen endrer seg
  useEffect(() => {
    if (!resetOnFramesChange) return;
    setIndexState(0);
    setPlaying(false);
  }, [frames, resetOnFramesChange]);

  // Auto-play tick. Hvis brukeren ber om redusert bevegelse, hopp direkte
  // til siste frame istedet for å animere gjennom hver frame.
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      if (pauseAtEnd) setPlaying(false);
      return;
    }
    if (reducedMotion) {
      setIndexState(Math.max(0, total - 1));
      if (pauseAtEnd) setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setIndexState((s) => Math.min(s + 1, Math.max(0, total - 1)));
    }, speed);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, index, speed, total, atEnd, pauseAtEnd, reducedMotion]);

  const step = useCallback(() => {
    setPlaying(false);
    setIndexState((s) => Math.min(s + 1, Math.max(0, total - 1)));
  }, [total]);

  const stepBack = useCallback(() => {
    setPlaying(false);
    setIndexState((s) => Math.max(0, s - 1));
  }, []);

  const play = useCallback(() => {
    if (total === 0) return;
    if (atEnd) {
      setIndexState(0);
      setPlaying(true);
    } else {
      setPlaying(true);
    }
  }, [atEnd, total]);

  const pause = useCallback(() => setPlaying(false), []);

  const playPause = useCallback(() => {
    if (playing) setPlaying(false);
    else play();
  }, [playing, play]);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndexState(0);
  }, []);

  const setIndex = useCallback(
    (i: number) => {
      setPlaying(false);
      setIndexState(Math.max(0, Math.min(i, Math.max(0, total - 1))));
    },
    [total],
  );

  return {
    frame,
    index,
    total,
    playing,
    speed,
    setSpeed,
    step,
    stepBack,
    play,
    pause,
    playPause,
    reset,
    setIndex,
    atEnd,
  };
}
