import { a11yProps, type IllustrationProps } from "./types";

// Router box with 4 status lights and two antennae.
export function RouterIcon({ size = 64, className, title }: IllustrationProps) {
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
      {/* antennae */}
      <path d="M18 16V6" />
      <path d="M46 16V6" />
      <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="46" cy="6" r="1.5" fill="currentColor" stroke="none" />
      {/* chassis */}
      <rect x="6" y="20" width="52" height="24" rx="3" />
      {/* status lights */}
      <circle cx="16" cy="32" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="26" cy="32" r="2.5" fill="currentColor" stroke="none" opacity={0.6} />
      <circle cx="36" cy="32" r="2.5" fill="currentColor" stroke="none" opacity={0.35} />
      <circle cx="46" cy="32" r="2.5" fill="currentColor" stroke="none" opacity={0.6} />
      {/* feet */}
      <path d="M14 44v6" />
      <path d="M50 44v6" />
      {/* cable hint */}
      <path d="M32 44v8" />
    </svg>
  );
}
