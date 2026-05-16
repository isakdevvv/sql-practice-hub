import { a11yProps, type IllustrationProps } from "./types";

// Min/max heap depicted as a 3-level filled binary tree pyramid.
export function Heap({ size = 64, className, title }: IllustrationProps) {
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
      {/* edges */}
      <line x1="32" y1="10" x2="18" y2="30" />
      <line x1="32" y1="10" x2="46" y2="30" />
      <line x1="18" y1="30" x2="10" y2="50" />
      <line x1="18" y1="30" x2="26" y2="50" />
      <line x1="46" y1="30" x2="38" y2="50" />
      <line x1="46" y1="30" x2="54" y2="50" />
      {/* root highlighted */}
      <circle cx="32" cy="10" r="5" fill="currentColor" opacity={0.25} stroke="none" />
      <circle cx="32" cy="10" r="5" />
      <circle cx="18" cy="30" r="5" />
      <circle cx="46" cy="30" r="5" />
      <circle cx="10" cy="50" r="5" />
      <circle cx="26" cy="50" r="5" />
      <circle cx="38" cy="50" r="5" />
      <circle cx="54" cy="50" r="5" />
    </svg>
  );
}
