import { a11yProps, type IllustrationProps } from "./types";

// Stacked cards / call stack — 4 cards offset to suggest LIFO depth.
export function Stack({ size = 64, className, title }: IllustrationProps) {
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
      {/* bottom card */}
      <rect x="14" y="46" width="40" height="10" rx="2" opacity={0.5} />
      {/* middle */}
      <rect x="12" y="34" width="40" height="10" rx="2" opacity={0.7} />
      {/* upper */}
      <rect x="10" y="22" width="40" height="10" rx="2" />
      {/* top of stack — highlighted */}
      <rect x="8" y="10" width="40" height="10" rx="2" />
      <rect x="8" y="10" width="40" height="10" rx="2" fill="currentColor" opacity={0.18} stroke="none" />
      {/* "push/pop" arrow */}
      <path d="M56 10v8" opacity={0.7} />
      <path d="M54 12l2-2 2 2" opacity={0.7} />
    </svg>
  );
}
