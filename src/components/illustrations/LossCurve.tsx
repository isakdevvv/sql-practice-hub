import { a11yProps, type IllustrationProps } from "./types";

// A declining loss curve over axes — the canonical "training is working" plot.
export function LossCurve({ size = 64, className, title }: IllustrationProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(title)}
    >
      {title ? <title>{title}</title> : null}
      {/* axes */}
      <path d="M8 8v44h48" />
      {/* curve: drops fast, then plateaus */}
      <path d="M10 14 C 18 16, 22 28, 28 36 S 44 48, 56 50" />
      {/* sample loss markers */}
      <circle cx="10" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="56" cy="50" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
