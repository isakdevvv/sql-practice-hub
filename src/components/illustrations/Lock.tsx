import { a11yProps, type IllustrationProps } from "./types";

// Padlock — closed shackle with a keyhole.
export function Lock({ size = 64, className, title }: IllustrationProps) {
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
      {/* shackle */}
      <path d="M20 30v-6a12 12 0 0 1 24 0v6" />
      {/* body */}
      <rect x="14" y="30" width="36" height="26" rx="4" />
      {/* keyhole */}
      <circle cx="32" cy="42" r="3" fill="currentColor" stroke="none" />
      <path d="M32 45v6" stroke="currentColor" />
    </svg>
  );
}
