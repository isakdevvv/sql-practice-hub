import { a11yProps, type IllustrationProps } from "./types";

// HDD platter top-down: outer disk, spindle, read head sweeping to a sector.
export function Disk({ size = 64, className, title }: IllustrationProps) {
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
      <circle cx="32" cy="32" r="26" />
      <circle cx="32" cy="32" r="20" opacity={0.4} />
      <circle cx="32" cy="32" r="13" opacity={0.4} />
      {/* spindle */}
      <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
      {/* read head arm */}
      <path d="M54 8l-18 22" />
      <circle cx="54" cy="8" r="3" />
      <circle cx="36" cy="30" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
