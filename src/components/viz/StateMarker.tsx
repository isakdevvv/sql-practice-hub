import { type ReactNode, type HTMLAttributes } from "react";

// ---------------------------------------------------------------------------
// StateMarker — wrapper for celler/noder/rader som signaliserer tilstand
// via FARGE alene. Legger til sekundær markør (mønster eller ikon-tegn)
// som er synlig uavhengig av farge — gjør viz-en tilgjengelig for de
// ~8% av menn (og 0.5% av kvinner) med rød-grønn-blindhet.
//
// Brukes som en utility på siden av eksisterende styling:
//
//   <div className={`bg-amber-500/10 ${ ... }`}>
//     <StateMarker state="comparing">Sammenligner</StateMarker>
//   </div>
//
// State-mappings:
//   comparing  — diagonale striper (mønster, ikke ikon)
//   active     — ● foran innholdet
//   done       — ✓ foran innholdet
//   warning    — ⚠ foran innholdet
//   error      — ✗ foran innholdet
//
// CSS-en bor i src/styles.css under «A11y: state-mønstre for fargeblinde».
// ---------------------------------------------------------------------------

export type VizState = "comparing" | "active" | "done" | "warning" | "error";

type Props = {
  state: VizState;
  children?: ReactNode;
  as?: "span" | "div";
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

export function StateMarker({
  state,
  children,
  as = "span",
  className = "",
  ...rest
}: Props) {
  const Tag = as;
  return (
    <Tag
      className={`state-marker ${className}`}
      data-state={state}
      aria-label={children ? undefined : state}
      {...rest}
    >
      {children}
    </Tag>
  );
}
