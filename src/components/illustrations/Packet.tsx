import { a11yProps, type IllustrationProps } from "./types";

// Labelled packet rectangle: header, then payload, with field dividers.
export function Packet({ size = 64, className, title }: IllustrationProps) {
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
      <rect x="4" y="14" width="56" height="36" rx="3" />
      {/* header section (top strip) */}
      <rect x="4" y="14" width="56" height="10" fill="currentColor" opacity={0.18} stroke="none" />
      <line x1="4" y1="24" x2="60" y2="24" />
      {/* header field dividers */}
      <line x1="20" y1="14" x2="20" y2="24" />
      <line x1="36" y1="14" x2="36" y2="24" />
      <line x1="48" y1="14" x2="48" y2="24" />
      {/* payload "bytes" hint */}
      <line x1="10" y1="32" x2="54" y2="32" opacity={0.5} />
      <line x1="10" y1="38" x2="44" y2="38" opacity={0.5} />
      <line x1="10" y1="44" x2="50" y2="44" opacity={0.5} />
      {/* travel direction tail */}
      <path d="M60 32h-4" opacity={0.7} />
      <path d="M58 30l2 2-2 2" opacity={0.7} />
    </svg>
  );
}
