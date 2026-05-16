import { a11yProps, type IllustrationProps } from "./types";

// Schematic 3-level B-tree: one root, three internal, leaves implied by ticks.
export function BTreeIcon({ size = 64, className, title }: IllustrationProps) {
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
      {/* edges first so nodes overlay them */}
      <path d="M32 14v6" />
      <path d="M14 32l14-12" />
      <path d="M50 32L36 20" />
      <path d="M9 50l3-12" />
      <path d="M19 50l-3-12" />
      <path d="M45 50l3-12" />
      <path d="M55 50l-3-12" />
      {/* root */}
      <rect x="22" y="6" width="20" height="10" rx="2" />
      <line x1="32" y1="8" x2="32" y2="14" opacity={0.4} />
      {/* internal nodes */}
      <rect x="4" y="26" width="20" height="10" rx="2" />
      <rect x="40" y="26" width="20" height="10" rx="2" />
      {/* leaves */}
      <rect x="2" y="48" width="14" height="10" rx="2" />
      <rect x="18" y="48" width="14" height="10" rx="2" />
      <rect x="34" y="48" width="14" height="10" rx="2" />
      <rect x="50" y="48" width="12" height="10" rx="2" />
    </svg>
  );
}
