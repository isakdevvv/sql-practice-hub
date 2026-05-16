import { a11yProps, type IllustrationProps } from "./types";

// Generic relational table: header row + 4 rows x 3 columns.
export function TableGrid({ size = 64, className, title }: IllustrationProps) {
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
      {/* outer */}
      <rect x="6" y="10" width="52" height="44" rx="3" />
      {/* header fill */}
      <rect x="6" y="10" width="52" height="10" rx="3" fill="currentColor" opacity={0.15} stroke="none" />
      <line x1="6" y1="20" x2="58" y2="20" />
      {/* row separators */}
      <line x1="6" y1="30" x2="58" y2="30" />
      <line x1="6" y1="40" x2="58" y2="40" />
      <line x1="6" y1="50" x2="58" y2="50" opacity={0.6} />
      {/* column separators */}
      <line x1="23" y1="10" x2="23" y2="54" />
      <line x1="40" y1="10" x2="40" y2="54" />
    </svg>
  );
}
