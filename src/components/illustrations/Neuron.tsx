import { a11yProps, type IllustrationProps } from "./types";

// Single neuron: 4 weighted input lines into a circle, one output line out.
export function Neuron({ size = 64, className, title }: IllustrationProps) {
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
      {/* incoming weights */}
      <line x1="6" y1="14" x2="32" y2="32" />
      <line x1="6" y1="26" x2="32" y2="32" />
      <line x1="6" y1="38" x2="32" y2="32" />
      <line x1="6" y1="50" x2="32" y2="32" />
      {/* input dots */}
      <circle cx="6" cy="14" r="2" fill="currentColor" stroke="none" />
      <circle cx="6" cy="26" r="2" fill="currentColor" stroke="none" />
      <circle cx="6" cy="38" r="2" fill="currentColor" stroke="none" />
      <circle cx="6" cy="50" r="2" fill="currentColor" stroke="none" />
      {/* body */}
      <circle cx="40" cy="32" r="10" />
      {/* output */}
      <line x1="50" y1="32" x2="60" y2="32" />
      <path d="M56 28l4 4-4 4" />
    </svg>
  );
}
