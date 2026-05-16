import { a11yProps, type IllustrationProps } from "./types";

// Classic key: round bow on the left, shaft with two teeth on the right.
export function Key({ size = 64, className, title }: IllustrationProps) {
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
      {/* bow */}
      <circle cx="18" cy="32" r="10" />
      <circle cx="18" cy="32" r="3" fill="currentColor" stroke="none" />
      {/* shaft */}
      <line x1="28" y1="32" x2="58" y2="32" />
      {/* teeth */}
      <path d="M46 32v6" />
      <path d="M54 32v4" />
    </svg>
  );
}
