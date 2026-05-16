// Barrel-export for shared visualizer-primitiver.
// Importér fra "@/components/visualizer-shell" istedet for fra enkelt-filer.

export { VisualizerShell } from "./VisualizerShell";
export type { VisualizerShellProps } from "./VisualizerShell";

export { VisualizerSkeleton } from "./VisualizerSkeleton";

export { ModeChips } from "./ModeChips";
export type { ModeDef, ModeChipsProps } from "./ModeChips";

export { OpButton } from "./OpButton";
export type { OpButtonProps } from "./OpButton";

export { StepControls } from "./StepControls";
export type { StepControlsProps } from "./StepControls";

export { OpLog } from "./OpLog";
export type { OpLogEntry, OpLogProps } from "./OpLog";

export { NodeBox } from "./NodeBox";
export type { NodeBoxProps, NodePhase } from "./NodeBox";

export { useStepRunner } from "./useStepRunner";
export type { StepRunner, StepRunnerOptions } from "./useStepRunner";

export { useFadeCells } from "./useFadeCells";
export type { FadeCell, UseFadeCells, UseFadeCellsOptions } from "./useFadeCells";

export {
  STATE_GLYPHS,
  STATE_LABELS_NB,
  STATE_COLOR_CLASSES,
  FOCUS_RING,
  useReducedMotion,
} from "./a11y";
export type { VizState } from "./a11y";

export { StateMarker, StateLegend } from "./StateMarker";
export type { StateMarkerProps, StateLegendProps } from "./StateMarker";

export { KeyboardScope } from "./KeyboardScope";
export type { KeyboardScopeProps } from "./KeyboardScope";
