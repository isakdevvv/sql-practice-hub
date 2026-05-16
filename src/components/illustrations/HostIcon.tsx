import { a11yProps, type IllustrationProps } from "./types";

// Laptop host with screen and base.
export function HostIcon({ size = 64, className, title }: IllustrationProps) {
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
      {/* screen */}
      <rect x="10" y="10" width="44" height="30" rx="2" />
      {/* screen content lines */}
      <line x1="16" y1="18" x2="34" y2="18" opacity={0.5} />
      <line x1="16" y1="24" x2="44" y2="24" opacity={0.5} />
      <line x1="16" y1="30" x2="40" y2="30" opacity={0.5} />
      {/* base / keyboard */}
      <path d="M4 46h56l-4 6H8z" />
      {/* trackpad nubbin */}
      <line x1="28" y1="49" x2="36" y2="49" opacity={0.6} />
    </svg>
  );
}
