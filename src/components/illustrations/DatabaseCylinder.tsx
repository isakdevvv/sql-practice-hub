import { a11yProps, type IllustrationProps } from "./types";

// Three stacked database cylinders with a subtle band of "data".
// Stroke uses currentColor so callers set the color via Tailwind (e.g. text-brand).
export function DatabaseCylinder({ size = 64, className, title }: IllustrationProps) {
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
      {/* top ellipse */}
      <ellipse cx="32" cy="14" rx="20" ry="6" />
      {/* sides */}
      <path d="M12 14v36" />
      <path d="M52 14v36" />
      {/* mid ellipses (back-half dashed to give depth) */}
      <path d="M12 26a20 6 0 0 0 40 0" />
      <path d="M12 26a20 6 0 0 1 40 0" strokeDasharray="2 3" opacity={0.55} />
      <path d="M12 38a20 6 0 0 0 40 0" />
      <path d="M12 38a20 6 0 0 1 40 0" strokeDasharray="2 3" opacity={0.55} />
      {/* bottom */}
      <path d="M12 50a20 6 0 0 0 40 0" />
      {/* small "active" dot */}
      <circle cx="44" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
