import { a11yProps, type IllustrationProps } from "./types";

// DIMM-style memory stick: long PCB with 4 chips, notch, and gold-finger row.
export function RamStick({ size = 64, className, title }: IllustrationProps) {
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
      {/* PCB */}
      <path d="M4 18h56v22a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      {/* chips */}
      <rect x="9" y="24" width="10" height="10" rx="1" />
      <rect x="22" y="24" width="10" height="10" rx="1" />
      <rect x="35" y="24" width="10" height="10" rx="1" />
      <rect x="48" y="24" width="8" height="10" rx="1" />
      {/* notch on the gold finger edge */}
      <path d="M28 44v4h8v-4" />
      {/* gold finger ticks */}
      <line x1="10" y1="44" x2="10" y2="48" opacity={0.5} />
      <line x1="14" y1="44" x2="14" y2="48" opacity={0.5} />
      <line x1="18" y1="44" x2="18" y2="48" opacity={0.5} />
      <line x1="46" y1="44" x2="46" y2="48" opacity={0.5} />
      <line x1="50" y1="44" x2="50" y2="48" opacity={0.5} />
      <line x1="54" y1="44" x2="54" y2="48" opacity={0.5} />
    </svg>
  );
}
