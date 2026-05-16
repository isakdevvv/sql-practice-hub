import { a11yProps, type IllustrationProps } from "./types";

// Sorted column on the left, arrow pointing into a table on the right —
// the canonical "index → table lookup" picture.
export function Indexes({ size = 64, className, title }: IllustrationProps) {
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
      {/* index column (sorted) */}
      <rect x="4" y="8" width="16" height="48" rx="2" />
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="4" y1="32" x2="20" y2="32" />
      <line x1="4" y1="44" x2="20" y2="44" />
      {/* tiny "values" — three dots per cell hinting at sorted entries */}
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="26" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="38" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="50" r="1" fill="currentColor" stroke="none" />
      {/* arrow */}
      <path d="M22 32h14" />
      <path d="M32 28l4 4-4 4" />
      {/* target table */}
      <rect x="38" y="8" width="22" height="48" rx="2" />
      <line x1="38" y1="20" x2="60" y2="20" />
      <line x1="38" y1="32" x2="60" y2="32" />
      <line x1="38" y1="44" x2="60" y2="44" />
      {/* highlighted hit row */}
      <rect x="38" y="20" width="22" height="12" fill="currentColor" opacity={0.18} stroke="none" />
    </svg>
  );
}
