import { type ReactNode } from "react";

// ---------------------------------------------------------------------------
// VizFrame — wrapper for viz-innhold som kan bli bredere enn viewport.
//
// Bruk når en visualizer har en horisontal layout (lenket liste, pipeline,
// SVG-graf, brettmønster) som ellers ville bli klemt eller forsvinne på
// mobil. Wrapper-en lar barna beholde sin "naturlige" bredde og legger til
// horisontal scroll i stedet for å presse dem inn i parent-bredden.
//
// Eksempel:
//   <VizFrame noShrink>
//     <div className="flex items-center gap-2">
//       {nodes.map(n => <Node key={n.id} {...n} />)}
//     </div>
//   </VizFrame>
// ---------------------------------------------------------------------------

type Props = {
  children: ReactNode;
  className?: string;
  /** Setter min-w-fit på inner-wrapper så barn aldri krymper. Standard true. */
  noShrink?: boolean;
  /** Aria-label for screen-readere (default: "Scrollbart innhold"). */
  ariaLabel?: string;
};

export function VizFrame({
  children,
  className = "",
  noShrink = true,
  ariaLabel,
}: Props) {
  return (
    <div
      className={`overflow-x-auto overscroll-x-contain -mx-1 px-1 ${className}`}
      style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      role="region"
      aria-label={ariaLabel ?? "Scrollbart innhold"}
      tabIndex={0}
    >
      <div className={noShrink ? "min-w-fit" : ""}>{children}</div>
    </div>
  );
}
